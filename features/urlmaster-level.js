'use strict';

const level = require('level');
const { createError, createResponse } = require('./response/response');
const { encodeCourseList, createCourse } = require('../features/course/courseFuncs');


const defaultDBName = 'course';

function newCourse({name}) {
    const course = {};
    course.name = name;
    course.info = {};
    course.urls = {};
    course.defaultURL = null;
    return course;
}

function URLMaster(dbName, userSystem) {
    this.userSystem = userSystem;
    this.dbName = dbName || defaultDBName;
    this.dbName = './leveldb/' + this.dbName;
    this.db = level(this.dbName, { valueEncoding: 'json' });

    this.dispatch = async (action) => {
        // what should action contains?
        // userId
        // command
        // key-value pairs
        switch (action.command) {
            case 'list': {
                return this.getCourseListService(action);
            }
            case 'mylist': {
                return this.getMyListService(action);
            }
            case 'link': {
                return this.getURLService(action);
            }
            case 'add-url': {
                return this.addURLService(action);
            }
            case 'init-lecture': {
                return this.addLectureService(action);
            }
            case 'attend': {
                return this.attendLectureService(action);
            }
            case 'register': case 'activate': {
                return this.userSystem.dispatch(action);
            }
            default: {
                return createError(`command ${action.command} not found`);
            }
        }
    }

    this.hasKey = async (key) => {
        let url = await this.db.get(key).catch(() => {});
        return Boolean(url);
    }
    this.getURL = async (code, urlName) => {
        let course = await this.db.get(code).catch(() => {});
        if (!course) {
            return null;
        }
        if (urlName && urlName !== 'default') {
            return course.urls[urlName];
        } else {
            return course.defaultURL;
        }
    }
    this.getCourseList = async () => {
        const courseArray = [];
        return new Promise((resolve, reject) => {
            this.db.createReadStream()
            .on('data', (data) => {
                // courseArray.push({code: data.key, name: data.value.name});
                courseArray.push(createCourse(data.key, data.value.name));
            })
            .on('error', err => {
                reject(err);
            })
            .on('close', () => {
                resolve(courseArray);
            });
        });
    }
    this.getCourse = async (code) => {
        return await this.db.get(code).catch(() => {});
    }

    this.getCourseListService = async () => {
        // no register/activate needed
        const courseArray = await this.getCourseList();
        return createResponse('Lectures: ' + encodeCourseList(courseArray));
    }

    this.getMyListService = async ({userId}) => {
        // console.log("getting mylist");
        const myListResponse = await this.userSystem.dispatch({ command: 'list', userId });
        if (myListResponse.status === 'error') {
            // console.log(myListResponse);
            return myListResponse;
        } else {
            const myList = myListResponse.response; // list of codes
            // console.log("myList:", myList);
            // console.log(myList);
            const courses = await Promise.all(myList.map(async (code) => {
                const course = await this.getCourse(code);
                // console.log(course);
                return createCourse(code, course.name);
            }));
            // console.log(courses);
            return createResponse('Lectures: ' + encodeCourseList(courses));
        }
    }

    this.getURLDescriber = (alias, urlName) => {
        return urlName ? `${alias}/${urlName}` : `${alias}`;
    }

    this.getURLService = async ({userId, alias, urlName}) => {
        const codeResponse = await this.userSystem.dispatch({ command: 'decode', userId, alias});
        if (codeResponse.status === 'error') {
            return codeResponse;
        }
        const code = codeResponse.response;
        const url = await this.getURL(code, urlName);
        const urlDescriber = this.getURLDescriber(alias, urlName);
        if (!url) {
            return createError(`URL for ${urlDescriber} not found.`);
        } else {
            const response = `URL for lecture ${urlDescriber} is ${url}.`
            return createResponse(response);
        }
    }
    
    this.addURLService = async ({userId, alias, urlName, url}) => {
        let activated = await this.userSystem.isActivated(userId);
        if (!activated) {
            return createError("Permission denied: please register before adding urls.");
        }
        const codeResponse = await this.userSystem.dispatch({ command: 'decode', userId, alias});
        if (codeResponse.status === 'error') {
            return codeResponse;
        }
        const code = codeResponse.response;
        let existURL = await this.getURL(code, urlName);
        if (existURL) {
            const urlDescriber = this.getURLDescriber(alias, urlName);
            if (existURL === url) {
                return createError(`${urlDescriber} has already been set.`);
            } else {
                return createError(`${urlDescriber} has already been set to ${existURL}.`);
            }
        } else {
            const course = await this.getCourse(code);
            if (!course) {
                return createError(`Course ${alias} has not been found.`);
            }
            if (!urlName || urlName === 'default') {
                course.defaultURL = url;
            } else {
                course.urls[urlName] = url;
            }
            const err = await this.db.put(code, course).catch((error) => error);
            const urlDescriber = this.getURLDescriber(alias, urlName);
            if (err) {
                return createError(`Fail in saving url ${name}: ${url}`);
            } else {
                const response = `URL of lecture ${urlDescriber} has been successfully added as ${url}.`;
                return createResponse(response);
            }
        }
    }
    this.addLectureService = async ({userId, code, name}) => {
        let activated = await this.userSystem.isActivated(userId);
        if (!activated) {
            return createError("Permission denied: please register before adding urls.");
        }
        let course = await this.getCourse(code);
        if (course) {
            return createError(`Course of code ${code} already exists.`);
        }
        course = newCourse({name}); 
        const err = await this.db.put(code, course).catch((error) => error);
        if (err) {
            return createError(`Fail in initializing lecture ${name} of code ${code}.`);
        } else {
            return createResponse(`Lecture ${name} has been successfully created with code ${code}.`);
        }
    }
    this.attendLectureService = async ({userId, code}) => {
        const activated = await this.userSystem.isActivated(userId);
        if (!activated) {
            return createError("Permission denied: please register before adding urls.");
        }
        const course = await this.getCourse(code);
        if (!course) {
            return createError(`Course with code ${code} does not exist.`);
        }
        const name = course.name;
        const user = await this.userSystem.getUser(userId);
        user.courses.push(code);
        let warningMessage = '';
        if (user.alias.hasOwnProperty(name)) {
            warningMessage = `\nWarning: ${name} has already been used as an alias of another lecture, so please set another alias for this lecture of code ${code}.`;
        }
        user.alias[name] = code;
        const err = await this.userSystem.db.put(userId, user).catch((error) => error);
        if (err) {
            return createError(`Fail in attending lecture ${name} of code ${code}.`);
        } else {
            return createResponse(`Successfully attended lecture ${name} of code ${code}.` + warningMessage);
        }
    }
}

module.exports = URLMaster;