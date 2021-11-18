const level = require('level');
const sendMail = require('../mail/sendMail');
const { validateEmail } = require('../mail/validateEmail');
const { createValidationMail } = require('../mail/mailTemplates');
const { createResponse, createError } = require('../response/response');
const randomFns = require('../funcs/randomFns');
const { stringFromObj } = require('../funcs/stringFromObj');
const { httpGet, httpPost, apiHost, apiPath, apiPort } = require('../funcs/httpFuncs');

const { checkDomain } = require('../mail/validateEmail');

// function createUser(mailAddress) {
//     return {
//         mail: mailAddress, 
//         activated: false
//     };
// }

function newUser({mail, code}) {
    const user = {};
    user.activated = false;
    user.mail = mail;
    user.code = code;
    user.courses = [];
    user.alias = {};

    return user;
}

const notActivatedErrorMessage = "Your account has not been activated yet.";
const notRegisteredErrorMessage = "You have not registered yet.";

const defaultSetUserSuccessMessage = "User has been successfully set.";
const defaultSetUserErrorMessage = "User has not been successfully set.";

function UserSystem(mailCheckers) {
    // this.dbName = 'user';
    // this.dbName = './leveldb/' + this.dbName;

    // this.db = level(this.dbName, { valueEncoding: 'json' });
    this.mailCheckers = Array.from([validateEmail]);
    if (mailCheckers && Array.isArray(mailCheckers)) {
        this.mailCheckers = this.mailCheckers.concat(mailCheckers);
    }

    this.dispatch = async (action) => {
        // what should action contains?
        // userId
        // command
        // key-value pairs
        switch (action.command) {
            case 'register': {
                return this.registerService(action);
            }
            case 'activate': {
                return this.activateService(action);
            }
            case 'list': {
                return this.getCourseListService(action);
            }
            case 'decode': {
                return this.decodeService(action);
            }
            case 'myalias': {
                return this.getAliasService(action);
            }
            case 'set-alias': {
                return this.setAliasService(action);
            }
            case 'unset-alias': {
                return this.unsetAliasService(action);
            }
            case 'attend': {
                return this.attendLectureService(action);
            }
            case 'retire': {
                return this.retireLectureService(action);
            }
            case 'check-user': {
                return this.checkUserIdService(action);
            }
            default: {
                return createError(`command ${action.command} not found`);
            }
        }
    }

    this.getUser = async (userId) => {
        // return this.db.get(userId).catch(() => {});
        const options = {
            hostname: apiHost,
            port: apiPort,
            path: apiPath + `/user/${userId}`,
            method: 'GET'
        };
        const response = await httpGet(options);
        if (response.status === 'success') {
            return response.response;
        } else {
            // show error message here
            return null;
        }
    }
    this.setUser = async (userId, user, errorMessage, successMessage) => {
        // const err = await this.db.put(userId, user).catch((error) => error);
        // if (err) {
        //     return createError(errorMessage || defaultSetUserErrorMessage);
        // } else {
        //     return createResponse(successMessage || defaultSetUserSuccessMessage);
        // }
        const options = {
            hostname: apiHost,
            port: apiPort,
            path: apiPath + `/user/${userId}`,
            method: 'POST'
        };
        const response = await httpPost(options, user);
        // console.log(response);
        if (response.status === 'success') {
            return createResponse(successMessage || response.response);
        } else {
            return createError(errorMessage || response.msg);
        }
    }
    this.getAllUserId = async () => {
        const options = {
            hostname: apiHost,
            port: apiPort,
            path: apiPath + `/user/all`,
            method: 'GET'
        };
    
        const response = await httpGet(options);
        if (response.status === 'success') {
            return response.response;
        } else {
            // show error message here
            return null;
        }
        // const keyArray = [];
        // return new Promise((resolve, reject) => {
        //     this.db.createKeyStream()
        //     .on('data', (key) => {
        //         // courseArray.push({code: data.key, name: data.value.name});
        //         keyArray.push(key);
        //     })
        //     .on('error', err => {
        //         reject(err);
        //     })
        //     .on('close', () => {
        //         resolve(keyArray);
        //     });
        // });
    }

    this.activateUser = async (userId, validationCode) => {
        const errorMessage = "Error in activating your account!";
        const successMessage = "Your account has been activated!";
        // const response = await this.setUser(userId, {
        //     ...user, activated: true
        // }, errorMessage, successMessage);
        // return response;

        const options = {
            hostname: apiHost,
            port: apiPort,
            path: apiPath + `/user/activate/${userId}?code=${validationCode}`,
            method: 'GET'
        };
        const response = await httpGet(options);
        // console.log(response);
        return response;
    }

    this.registerService = async ({userId, mailAddress, passcode}) => {
        // console.log(`registerService(userId = ${userId}, m`)
        for (let checker of this.mailCheckers) {
            const res = checker(mailAddress);
            // console.log(res);
            if (!res.accepted) {
                return createError(res.message);
            }
            // if (!checker(mailAddress)) {
            //     return createError(`${mailAddress} is an invalid mail address.`);
            // }
        }
        let user = await this.getUser(userId);
        if (user) {
            if (user.activated) {
                return createError('You have already activated your account!');
            }
            // otherwise, update user address
        }
        const validationCode = randomFns();
        const mailContents = createValidationMail(passcode, validationCode);

        return new Promise((resolve, reject) => {
            sendMail(mailAddress, mailContents, async (error, data) => {
                if (error) {
                    console.log(error);
                    resolve(createError("Error in sending email to your address: please check email address."));
                }
                const errorMessage = "Error in saving your email to database.";
                const successMessage = "Validation email has been sent to your email address, please activate your account via the code sent.";
                const response = await this.setUser(userId, newUser({
                    mail: mailAddress, 
                    code: validationCode,
                }), errorMessage, successMessage);
                resolve(response);
            });
        });
    }
    this.activateService = async ({userId, validationCode}) => {
        return await this.activateUser(userId, validationCode);
        // let user = await this.getUser(userId);
        // if (!user) {
        //     return createError("You have not registered yet. Send register <email-address> <passcode> to receive a activation mail.");
        // }
        // if (user && user.activated) {
        //     return createError("You have already activated your account!");
        // }
        // if (validationCode === user.validationCode) {
        //     // const errorMessage = "Error in activating your account!";
        //     // const successMessage = "Your account has been activated!";
        //     // const response = await this.setUser(userId, {
        //     //     ...user, activated: true
        //     // }, errorMessage, successMessage);
        //     // return response;
        //     return await this.activateUser(userId, user);
        // } else {
        //     return createError("Incorrect validation code.");
        // }
    }

    this.getCourseListService = async ({userId}) => {
        const user = await this.getUser(userId);
        // console.log('user:', user);
        if (!user) {
            const userIdList = await this.getAllUserId();
            // console.log('userIds:', userIdList);
            // console.log(`userId ${userId} not found.`);
            return createError(notRegisteredErrorMessage);
        }
        if (!user.activated) {
            return createError(notActivatedErrorMessage);
        }
        return createResponse(user.courses);
    }

    this.decodeService = async ({userId, alias}) => {
        // accept a alias(maybe already a code)
        // if it is a code: return the code
        // otherwise, return the code from the alias set by the user.
        let user = await this.getUser(userId);
        if (!user) {
            return createError(notRegisteredErrorMessage);
        }
        if (!user.activated) {
            return createError(notActivatedErrorMessage);
        }
        if (user.courses.includes(alias)) {
            return createResponse(alias);
        }
        if (!user.alias.hasOwnProperty(alias)) {
            return createError(`Alias ${alias} is not found.`);
        }
        return createResponse(user.alias[alias]);
    }

    this.checkUserIdService = async ({userId}) => {
        let user = await this.getUser(userId);
        if (!user) {
            return createError(notRegisteredErrorMessage);
        }
        if (!user.activated) {
            return createError(notActivatedErrorMessage);
        }
        return createResponse();
    }

    this.getAliasService = async ({userId}) => {
        let user = await this.getUser(userId);
        if (!user) {
            return createError(notRegisteredErrorMessage);
        }
        if (!user.activated) {
            return createError(notActivatedErrorMessage);
        }
        return createResponse(stringFromObj('alias', user.alias, true));
    }
    this.setAliasService = async ({userId, alias, code}) => {
        const user = await this.getUser(userId);
        if (!user) {
            return createError(notRegisteredErrorMessage);
        }
        if (!user.activated) {
            return createError(notActivatedErrorMessage);
        }
        if (!user.courses.includes(code)) {
            return createError(`You are not attending course ${code}.`);
        }
        if (alias in user.alias && user.alias === code) {
            return createError(`Alias ${alias} is already been set to course ${code}.`);
        }
        let message = '';
        if (alias in user.alias) {
            message = `Successfully change the alias ${alias} from ${user.alias[alias]} to ${code}.`;
        } else {
            message = `Successfully set alias ${alias} to ${code}.`;
        }
        user.alias[alias] = code;
        const errorMessage = `Fail in setting alias ${alias} to ${code}.`;
        return await this.setUser(userId, user, errorMessage, message);
    }
    this.unsetAliasService = async ({userId, alias}) => {
        const user = await this.getUser(userId);
        if (!user) {
            return createError(notRegisteredErrorMessage);
        }
        if (!user.activated) {
            return createError(notActivatedErrorMessage);
        }
        if (!(alias in user.alias)) {
            return createError(`Alias ${alias} does not exist.`);
        }
        delete user.alias[alias];
        const errorMessage = `Fail in unsetting alias ${alias}.`;
        const successMessage = `Successfully unset alias ${alias}.`;
        const response = await this.setUser(userId, user, errorMessage, successMessage);
        return response;
    }
    this.attendLectureService = async ({userId, code, name}) => {
        const user = await this.getUser(userId);
        if (!user) {
            return createError(notRegisteredErrorMessage);
        }
        if (!user.activated) {
            return createError(notActivatedErrorMessage);
        }
        user.courses.push(code);
        let warningMessage = '';
        if (user.alias.hasOwnProperty(name)) {
            warningMessage = `\nWarning: ${name} has already been used as an alias of another lecture, so please set another alias for this lecture of code ${code}.`;
        } else {
            user.alias[name] = code;
        }
        const errorMessage = `Fail in attending lecture ${name} of code ${code}.`;
        const successMessage = `Successfully attended lecture ${name} of code ${code}.` + warningMessage;
        const response = await this.setUser(userId, user, errorMessage, successMessage);
        return response;
    }
    this.retireLectureService = async ({userId, alias}) => {
        // const user = await this.getUser(userId);
        // const activated = Boolean(user && user.activated);
        // if (!activated) {
        //     return createError("Permission denied: please register before adding urls.");
        // }
        // if (user.courses.includes(alias)) {
        //     return createResponse(alias);
        // }
        // if (!user.alias.hasOwnProperty(alias)) {
        //     return createError(`Alias ${alias} is not found.`);
        // }
        const codeResponse = await this.decodeService({ userId, alias }); // TODO: do this with user to make better time-cost
        if (codeResponse.status === 'error') {
            return codeResponse;
        }
        const code = codeResponse.response;
        const user = await this.getUser(userId);
        if (!user.courses.includes(code)) {
            return createError(`You are not attending course ${alias}.`);
        }
        const removeAlias = [];
        for (let alias in user.alias) {
            if (user.alias[alias] === code) {
                removeAlias.push(alias);
            }
        }
        const index = user.courses.indexOf(code);
        user.courses.splice(index, 1);
        for (let alias of removeAlias) {
            delete user.alias[alias];
        }
        const removeAliasStr = (removeAlias.length === 0) ? '' : (' Alias ' + removeAlias.join("/") + ' has been removed.');
        const errorMessage = `Fail in retiring lecture ${alias} of code ${code}.`;
        const successMessage = `You have retired from lecture ${alias}.` + removeAliasStr;
        const response = await this.setUser(userId, user, errorMessage, successMessage);
        return response;
    }
    this.isActivated = async (userId) => {
        let user = await this.getUser(userId);
        return Boolean(user && user.activated);
    }
    this.isAttending = async (userId, alias) => {
        const user = await this.getUser(userId);
        if (!Boolean(user && user.activated)) {
            return false;
        }
        if (user.courses.includes(alias)) {
            return true;
        } else if (alias in user.alias) {
            const code = user.alias[alias];
            return user.courses.includes(code);
        } else {
            return false;
        }
    }
}

const userSystem = new UserSystem([checkDomain]);

module.exports = userSystem;