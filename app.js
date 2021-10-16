const { App } = require('@slack/bolt');
const URLMaster = require('./features/urlmaster');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
});

const urlMaster = new URLMaster();
// console.log(urlMaster.data);
// console.log(urlMaster.getList());
// console.log(urlMaster.getURL('js'));
// console.log(urlMaster.getURL('go'));
// console.log(urlMaster.addURL('js', 'abc'));
// console.log(urlMaster.addURL('go', "https://learnku.com/docs/the-way-to-go"));
// urlMaster.save();

app.message('list', async({ message, say }) => {
    // console.log(message);
    const messageContent = message.text.trim();
    if (messageContent !== 'list') {
        return ;
    }
    const res = urlMaster.getList();
    const msg = 'Lectures: ' + res.response.join('/');
    await say(msg);
});

app.message('link', async({ message, say }) => {
    const messageContent = message.text.trim();
    const contents = messageContent.split(' ');
    if (contents.length < 2) {
        return ;
    }
    if (contents[0] != 'link') {
        return ;
    }
    const lectureName = contents[1];
    const res = urlMaster.getURL(lectureName);
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        const msg = `URL for lecture ${lectureName} is ${res.response}`;
        await say(msg);
    }
});

app.message('add', async({ message, say}) => {
    const messageContent = message.text.trim();
    const contents = messageContent.split(' ');
    if (contents.length < 3) {
        return ;
    }
    if (contents[0] != 'add') {
        return ;
    }
    const lectureName = contents[1];
    const url = contents[2];
    const res = urlMaster.addURL(lectureName, url);
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