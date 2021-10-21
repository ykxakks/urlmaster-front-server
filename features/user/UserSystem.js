const level = require('level');
const sendMail = require('../mail/sendMail');
const { validateEmail } = require('../mail/validateEmail');
const { createValidationMail } = require('../mail/mailTemplates');
const { createResponse, createError } = require('../response/response');
const randomFns = require('../funcs/randomFns');
const { stringFromObj } = require('../funcs/stringFromObj');

// function createUser(mailAddress) {
//     return {
//         mail: mailAddress, 
//         activated: false
//     };
// }

function newUser({mail, validationCode}) {
    const user = {};
    user.activated = false;
    user.mail = mail;
    user.validationCode = validationCode;
    user.courses = [];
    user.alias = {};

    return user;
}

const notActivatedErrorMessage = "Your account has not been activated yet.";
const notRegisteredErrorMessage = "You have not registered yet.";

function UserSystem(mailCheckers) {
    this.dbName = 'user';
    this.dbName = './leveldb/' + this.dbName;

    this.db = level(this.dbName, { valueEncoding: 'json' });
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
            default: {
                return createError(`command ${action.command} not found`);
            }
        }
    }

    this.getUser = async (userId) => {
        return this.db.get(userId).catch(() => {});
    }
    this.setUser = async (userId, user) => {
        return this.db.put(userId, user);
    }
    this.getAllUserId = async () => {
        const keyArray = [];
        return new Promise((resolve, reject) => {
            this.db.createKeyStream()
            .on('data', (key) => {
                // courseArray.push({code: data.key, name: data.value.name});
                keyArray.push(key);
            })
            .on('error', err => {
                reject(err);
            })
            .on('close', () => {
                resolve(keyArray);
            });
        });
    }

    this.registerService = async ({userId, mailAddress, passcode}) => {
        // console.log(`registerService(userId = ${userId}, m`)
        for (let checker of this.mailCheckers) {
            if (!checker(mailAddress)) {
                return createError(`${mailAddress} is an invalid mail address.`);
            }
        }
        let user = await this.getUser(userId);
        if (user) {
            if (user.activated) {
                return createError('You have already activated your account!');
            }
            // otherwise, update user address
            // err = await this.db.put(userId, createUser(mailAddress)).catch((error) => error);
        }
        // let err = await this.db.put(userId, createUser(mailAddress)).catch((error) => error);
        // if (err) {
        //     return createError(`Error in setting mail address ${mailAddress}.`);
        // }
        const validationCode = randomFns();
        const mailContents = createValidationMail(passcode, validationCode);

        return new Promise((resolve, reject) => {
            sendMail(mailAddress, mailContents, async (error, data) => {
                if (error) {
                    console.log(error);
                    resolve(createError("Error in sending email to your address: please check email address."));
                }
                let err = await this.setUser(userId, newUser({
                    mail: mailAddress, 
                    validationCode,
                }));
                if (err) {
                    resolve(createError("Error in saving your email to database."));
                } else {
                    resolve(createResponse("Validation email has been sent to your email address, please activate your account via the code sent."));
                }
            });
        });
    }
    this.activateService = async ({userId, validationCode}) => {
        let user = await this.getUser(userId);
        if (!user) {
            return createError("You have not registered yet. Send register <email-address> <passcode> to receive a activation mail.");
        }
        if (user && user.activated) {
            return createError("You have already activated your account!");
        }
        if (validationCode === user.validationCode) {
            let err = await this.setUser(userId, {
                ...user, activated: true
            });
            if (err) {
                return createError("Error in activating your account!");
            } else {
                return createResponse("Your account has been activated!");
            }
        } else {
            return createError("Incorrect validation code.");
        }
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
        const activated = Boolean(user && user.activated);
        if (!activated) {
            return createError("Permission denied: please register before adding urls.");
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
        const err = await this.db.put(userId, user).catch((error) => error);
        if (err) {
            return createError(`Fail in setting alias ${alias} to ${code}.`);
        } else {
            return createResponse(message);
        }
    }
    this.unsetAliasService = async ({userId, alias}) => {
        const user = await this.getUser(userId);
        const activated = Boolean(user && user.activated);
        if (!activated) {
            return createError("Permission denied: please register before adding urls.");
        }
        if (!(alias in user.alias)) {
            return createError(`Alias ${alias} does not exist.`);
        }
        delete user.alias[alias];
        const err = await this.db.put(userId, user).catch((error) => error);
        if (err) {
            return createError(`Fail in unsetting alias ${alias}.`);
        } else {
            return createResponse(`Successfully unset alias ${alias}.`);
        }
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

module.exports = UserSystem;