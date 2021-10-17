const { App } = require('@slack/bolt');
// const URLMaster = require('./features/urlmaster');
const URLMaster = require('./features/urlmaster-level');
const UserSystem = require('./features/user/UserSystem');
const { decodeEmail } = require('./features/mail/validateEmail');
const checkParameter = require('./features/funcs/checkParameter');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
});

const userSystem = new UserSystem();
const urlMaster = new URLMaster('urls', userSystem);
// console.log(urlMaster.db);

app.message('list', async({ message, say }) => {
    // console.log(message);
    // const messageContent = message.text.trim().replace(/\s/g, ' ');
    // if (messageContent !== 'list') {
    //     return ;
    // }
    let contents = checkParameter(message, 'list', 1);
    if (!contents) {
        return ;
    }
    const res = await urlMaster.getListService();
    const msg = 'Lectures: ' + res.response.join('/');
    await say(msg);
});

app.message('link', async({ message, say }) => {
    // const messageContent = message.text.trim().replace(/\s/g, ' ');
    // // console.log(message);
    // const contents = messageContent.split(' ');
    // if (contents.length < 2) {
    //     return ;
    // }
    // if (contents[0] != 'link') {
    //     return ;
    // }
    let contents = checkParameter(message, 'link', 2);
    if (!contents) {
        return ;
    }
    const lectureName = contents[1];
    const res = await urlMaster.getURLService(lectureName);
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        const msg = `URL for lecture ${lectureName} is ${res.response}`;
        await say(msg);
    }
});

app.message('add', async({ message, say}) => {
    // const messageContent = message.text.trim().replace(/\s/g, ' ');
    // const contents = messageContent.split(' ');
    // if (contents.length < 3) {
    //     return ;
    // }
    // if (contents[0] != 'add') {
    //     return ;
    // }
    let contents = checkParameter(message, 'add', 3);
    if (!contents) {
        return ;
    }
    const lectureName = contents[1];
    const url = contents[2];
    const userId = message.user;
    const res = await urlMaster.addURLService(lectureName, url, userId);
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        const msg = `URL of lecture ${lectureName} has been added as ${url}.`;
        await say(msg);
    }
});

app.message('register', async({ message, say }) => {
    // console.log(message);
    // const messageContent = message.text.trim().replace(/\s/g, ' ');
    // const contents = messageContent.split(' ');
    // if (contents.length < 3 || contents[0] != 'register') {
    //     return ;
    // }
    let contents = checkParameter(message, 'register', 3);
    if (!contents) {
        return ;
    }
    const userId = message.user;
    const mailAddress = decodeEmail(contents[1]);
    const passcode = contents[2];
    let res = await userSystem.register(userId, mailAddress, passcode);
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
});

app.message('activate', async({ message, say }) => {
    // const messageContent = message.text.trim().replace(/\s/g, ' ');
    // const contents = messageContent.split(' ');
    // if (contents.length < 2 || contents[0] != 'activate') {
    //     return ;
    // }
    // console.log(message);
    let contents = checkParameter(message, 'activate', 2);
    if (!contents) {
        return ;
    }
    let userId = message.user;
    let validationCode = contents[1];
    let res = await userSystem.activate(userId, validationCode);
    // console.log(res);
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running!');
})();