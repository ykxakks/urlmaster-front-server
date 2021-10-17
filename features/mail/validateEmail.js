'use strict';

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function decodeEmail(email) {
    if (validateEmail(email)) {
        return email;
    }
    const divIndex = email.indexOf('|');
    if (divIndex == -1) {
        return email;
    } else {
        return email.slice(divIndex + 1, -1);
    }
}

// module.exports = validateEmail;
exports.validateEmail = validateEmail;
exports.decodeEmail = decodeEmail;