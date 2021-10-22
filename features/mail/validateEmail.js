'use strict';

const allowedDomains = ['g.ecc.u-tokyo.ac.jp', 'gmail.com'];

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const accepted = re.test(email);
    if (accepted) {
        return { accepted };
    } else {
        return { accepted, message : `${email} is an invalid mail address.`};
    }
}

function isDomain(email, domain) {
    const index = email.indexOf('@');
    if (index === -1) {
        return false;
    } else {
        return accepted = email.slice(index + 1) === domain;
    }
}

function getDomain(email) {
    const index = email.indexOf('@');
    if (index === -1) {
        return '';
    } else {
        return email.slice(index + 1);
    }
}

function checkDomain(email) {
    const domain = getDomain(email);
    if (!domain) {
        return {
            accepted: false, 
            message: `${email} does not have a valid domain.`
        };
    }

    if (allowedDomains.length === 0 || allowedDomains.includes(domain)) {
        return {
            accepted: true
        };
    } else {
        return {
            accepted: false, 
            message: `Domain ${domain} is not allowed for current app.`
        };
    }
}

function decodeEmail(email) {
    if (validateEmail(email).accepted) {
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
exports.checkDomain = checkDomain;
exports.decodeEmail = decodeEmail;