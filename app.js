const { App } = require('@slack/bolt');
// const URLMaster = require('./features/urlmaster');
const URLMaster = require('./features/urlmaster-level');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
});

const urlMaster = new URLMaster();
// console.log(urlMaster.db);

app.message('list', async({ message, say }) => {
    // console.log(message);
    const messageContent = message.text.trim().replace(/\s/g, ' ');
    if (messageContent !== 'list') {
        return ;
    }
    const res = await urlMaster.getListService();
    const msg = 'Lectures: ' + res.response.join('/');
    await say(msg);
});

app.message('link', async({ message, say }) => {
    const messageContent = message.text.trim().replace(/\s/g, ' ');
    const contents = messageContent.split(' ');
    if (contents.length < 2) {
        return ;
    }
    if (contents[0] != 'link') {
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
    const messageContent = message.text.trim().replace(/\s/g, ' ');
    const contents = messageContent.split(' ');
    if (contents.length < 3) {
        return ;
    }
    if (contents[0] != 'add') {
        return ;
    }
    const lectureName = contents[1];
    const url = contents[2];
    const res = await urlMaster.addURLService(lectureName, url);
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        const msg = `URL of lecture ${lectureName} has been added as ${url}.`;
        await say(msg);
    }
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running!');
})();