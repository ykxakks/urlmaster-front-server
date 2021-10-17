function createValidationMail(passcode, activationCode) {
    return {
        subject: 'Validation mail of URL-Master',
        content: `<p>You are registering in slack service URL-Master.</p>
        <p>You just input passcode "${passcode}".</p>
        <p>Your activation code is ${activationCode}. If you are registering and the passcode is just what you have input, please send message "activate <activationCode>" in 5 minutes. Otherwise, please ignore this mail.</p>`
    };
}

exports.createValidationMail = createValidationMail;