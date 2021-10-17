const level = require('level');
const sendMail = require('../mail/sendMail');
const { validateEmail } = require('../mail/validateEmail');
const { createValidationMail } = require('../mail/mailTemplates');
const { createResponse, createError } = require('../response/response');

// function createUser(mailAddress) {
//     return {
//         mail: mailAddress, 
//         activated: false
//     };
// }

const randomFns = () => {
    let code = "";
    for (let i = 0; i < 6; ++i) {
        code += parseInt(Math.random() * 10);
    }
    return code;
}

function UserSystem(mailCheckers) {
    this.dbName = 'users';
    this.dbName = './leveldb/' + this.dbName;

    this.db = level(this.dbName, { valueEncoding: 'json' });
    this.mailCheckers = Array.from([validateEmail]);
    if (mailCheckers && Array.isArray(mailCheckers)) {
        this.mailCheckers = this.mailCheckers.concat(mailCheckers);
    }

    this.getUser = async function(userId) {
        return this.db.get(userId).catch(() => {});
    }
    this.setUser = async function(userId, user) {
        return this.db.put(userId, user);
    }

    this.register = async function(userId, mailAddress, passcode) {
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
        const mail = createValidationMail(passcode, validationCode);

        return new Promise((resolve, reject) => {
            sendMail(mailAddress, mail, async (error, data) => {
                if (error) {
                    console.log(error);
                    resolve(createError("Error in sending email to your address: please check email address."));
                }
                let err = await this.setUser(userId, {
                    mail: mailAddress, 
                    validationCode: validationCode,
                    activated: false
                });
                if (err) {
                    resolve(createError("Error in saving your email to database."));
                } else {
                    resolve(createResponse("Validation email has been sent to your email address, please activate your account via the code sent."));
                }
            });
        });
    }
    this.activate = async function(userId, validationCode) {
        let user = await this.getUser(userId);
        if (!user) {
            return createError("You has not registered yet. Send register <email-address> <passcode> to receive a activation mail.");
        }
        if (user && user.activated) {
            return createError("you has already activated your account!");
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
    this.isActivated = async (userId) => {
        let user = await this.getUser(userId);
        return Boolean(user && user.activated);
    }
}

module.exports = UserSystem;