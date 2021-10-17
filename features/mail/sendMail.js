const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const sender = process.env.URLMASTER_MAIL_USERNAME;
const transport = nodemailer.createTransport(smtpTransport({
    host: "smtp.gmail.com",
    port: 587,
    secureConnection: false, 
    auth: {
        user: sender,
        pass: process.env.URLMASTER_MAIL_PASSWORD
    },
    tls: {
        ciphers: 'SSLv3'
    }
}));

function sendMail(receiver, mail, callback) {
    transport.sendMail({
        from: sender, 
        to: receiver, 
        subject: mail.subject || '',
        html: mail.content || '',
    }, callback);
}

module.exports = sendMail;