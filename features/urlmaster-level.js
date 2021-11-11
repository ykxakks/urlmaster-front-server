'use strict';

const level = require('level');
const { createError, createResponse } = require('./response/response');
const { encodeCourseList, createCourse } = require('./course/courseFuncs');
const { stringFromObj } = require('./funcs/stringFromObj')

const defaultDBName = 'course';

function newCourse({name}) {
    const course = {};
    course.name = name;
    course.info = {};
    course.urls = {};
    course.defaultURL = null;
    return course;
}

function courseDetail(code, course, isAttending) {
    const basicInfo = `${code} ${course.name}` + ((isAttending) ? ' (attending)' : ' (not attending)');
    if (!isAttending) {
        return basicInfo;
    }
    let extendInfo = '';
    if (course.defaultURL) {
        extendInfo += `\nDefault URL: ${course.defaultURL}`;
    }
    const infoString = stringFromObj('info', course.info);
    const urlString = stringFromObj('urls', course.urls);
    extendInfo += infoString;
    extendInfo += urlString;
    return basicInfo + extendInfo;
}

const defaultSetCourseSuccessMessage = "Course has been successfully set.";
const defaultSetCourseErrorMessage = "Course has not been successfully set.";

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
            case 'info': {
                return this.getInfoService(action);
            }
            case 'add-url': {
                return this.addURLService(action);
            }
            case 'add-info': {
                return this.addInfoService(action);
            }
            case 'init-lecture': {
                return this.addLectureService(action);
            }
            case 'attend': {
                return this.attendLectureService(action);
            }
            case 'set-alias': {
                return this.setAliasService(action);
            }
            case 'detail': {
                return this.getDetailService(action);
            }
            case 'register': case 'activate': case 'myalias': case 'unset-alias': case 'retire': {
                return this.userSystem.dispatch(action);
            }
            default: {
                return createError(`command ${action.command} not found`);
            }
        }
    }

    this.hasKey = async (code) => {
        let course = await this.getCourse(code);
        return Boolean(course);
    }
    this.getURL = async (code, urlName) => {
        const course = await this.getCourse(code);
        if (!course) {
            return null;
        }
        if (urlName && urlName !== 'default') {
            return course.urls[urlName];
        } else {
            return course.defaultURL;
        }
    }
    this.getInfo = async (code, infoName) => {
        const course = await this.getCourse(code);
        if (!course) {
            return null;
        }
        return course.info[infoName];
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
    this.setCourse = async (code, course, errorMessage, successMessage) => {
        const err = await this.db.put(code, course).catch((error) => error);
        if (err) {
            return createError(errorMessage || defaultSetCourseErrorMessage);
        } else {
            return createResponse(successMessage || defaultSetCourseSuccessMessage);
        }
    }

    this.getCourseListService = async () => {
        // no register/activate needed
        const courseArray = await this.getCourseList();
        return createResponse('Lectures:' + encodeCourseList(courseArray));
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
            return createResponse('Lectures:' + encodeCourseList(courses));
        }
    }

    this.getURLDescriber = (alias, urlName) => {
        return urlName ? `${alias}/${urlName}` : `${alias}`;
    }
    this.getInfoDescriber = (alias, infoName) => {
        return `${alias}/${infoName}`;
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

    this.getInfoService = async ({userId, alias, infoName}) => {
        const codeResponse = await this.userSystem.dispatch({ command: 'decode', userId, alias});
        if (codeResponse.status === 'error') {
            return codeResponse;
        }
        const code = codeResponse.response;
        const info = await this.getInfo(code, infoName);
        const infoDescriber = this.getInfoDescriber(alias, infoName);
        if (!info) {
            return createError(`Info ${infoDescriber} not found.`);
        } else {
            const response = `Info ${infoDescriber} is ${info}.`
            return createResponse(response);
        }
    }
    
    this.addURLService = async ({userId, alias, urlName, url}) => {
        const checkUserResponse = await this.userSystem.dispatch({
            command: 'check-user',
            userId
        });
        if (checkUserResponse.status === 'error') {
            return checkUserResponse;
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
                return createError(`URL ${urlDescriber} has already been set.`);
            } else {
                return createError(`URL ${urlDescriber} has already been set to ${existURL}.`);
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
            const urlDescriber = this.getURLDescriber(alias, urlName);
            const successMessage = `URL of lecture ${urlDescriber} has been successfully added as ${url}.`;
            const errorMessage = `Fail in saving url ${urlDescriber}: ${url}`;
            return await this.setCourse(code, course, errorMessage, successMessage);
        }
    }

    this.addInfoService = async ({userId, alias, infoName, info}) => {
        const checkUserResponse = await this.userSystem.dispatch({
            command: 'check-user',
            userId
        });
        if (checkUserResponse.status === 'error') {
            return checkUserResponse;
        }
        const codeResponse = await this.userSystem.dispatch({ command: 'decode', userId, alias});
        if (codeResponse.status === 'error') {
            return codeResponse;
        }
        const code = codeResponse.response;
        const existInfo = await this.getInfo(code, infoName);
        if (existInfo) {
            const infoDescriber = this.getInfoDescriber(alias, infoName);
            if (existInfo === info) {
                return createError(`Info ${infoDescriber} has already been set.`);
            } else {
                return createError(`Info ${infoDescriber} has already been set to ${existInfo}.`);
            }
        } else {
            const course = await this.getCourse(code);
            if (!course) {
                return createError(`Course ${alias} has not been found.`);
            }
            course.info[infoName] = info;
            const infoDescriber = this.getInfoDescriber(alias, infoName);
            const errorMessage = `Fail in saving info ${infoDescriber}: ${info}`;
            const successMessage = `Info of lecture ${infoDescriber} has been successfully added as ${info}.`;
            return await this.setCourse(code, course, errorMessage, successMessage);
        }
    }
    this.addLectureService = async ({userId, code, name}) => {
        const checkUserResponse = await this.userSystem.dispatch({
            command: 'check-user',
            userId
        });
        if (checkUserResponse.status === 'error') {
            return checkUserResponse;
        }
        let course = await this.getCourse(code);
        if (course) {
            return createError(`Course of code ${code} already exists.`);
        }
        course = newCourse({name}); 
        const errorMessage = `Fail in initializing lecture ${name} of code ${code}.`;
        const successMessage = `Lecture ${name} has been successfully created with code ${code}.`;
        return await this.setCourse(code, course, errorMessage, successMessage);
    }
    this.attendLectureService = async ({userId, code}) => {
        const course = await this.getCourse(code);
        if (!course) {
            return createError(`Course with code ${code} does not exist.`);
        }
        const name = course.name;
        return this.userSystem.dispatch({
            command: 'attend', 
            userId, code, name
        });
    }

    this.setAliasService = async ({userId, alias, code}) => {
        const course = await this.getCourse(code);
        if (!course) {
            return createError(`Course with code ${code} does not exist.`);
        }
        return this.userSystem.dispatch({
            command: 'set-alias',
            userId, alias, code
        });
    }

    this.getDetailService = async ({userId, alias}) => {
        const checkUserResponse = await this.userSystem.dispatch({
            command: 'check-user',
            userId
        });
        if (checkUserResponse.status === 'error') {
            return checkUserResponse;
        }
        const isAttending = await this.userSystem.isAttending(userId, alias);
        const codeResponse = (isAttending) ? (await this.userSystem.dispatch({ command: 'decode', userId, alias})) : {status: 'success', response: alias};
        if (codeResponse.status === 'error') {
            return codeResponse;
        }
        const code = codeResponse.response;
        const course = await this.getCourse(code);
        if (!course) {
            return createError(`Course ${alias} does not exist.`);
        }
        const response = courseDetail(code, course, isAttending);
        return createResponse(response);
    }
}

module.exports = URLMaster;