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
    const contents = checkParameter(message, 'list', 1);
    if (!contents) {
        return ;
    }
    const res = await urlMaster.dispatch({command: 'list'});
    if (res.status === 'success') {
        await say(res.response);
    } else {
        await say(res.msg);
    }
});
app.message('mylist', async({ message, say }) => {
    const contents = checkParameter(message, 'mylist', 1);
    if (!contents) {
        return ;
    }
    const res = await urlMaster.dispatch({
        command: 'mylist',
        userId: message.user,
    });
    if (res.status === 'success') {
        await say(res.response);
    } else {
        await say(res.msg);
    }
});

app.message('link', async({ message, say }) => {
    const contents = checkParameter(message, 'link', 2);
    if (!contents) {
        return ;
    }
    const lectureAlias = contents[1];
    const urlName = (contents.length > 2) ? contents[2] : null;
    const res = await urlMaster.dispatch({
        command: 'link',
        userId: message.user,
        alias: lectureAlias,
        urlName
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
});

app.message('add-url', async({ message, say}) => {
    const contents = checkParameter(message, 'add-url', 4);
    // add <alias> <urlName> <url>
    if (!contents) {
        return ;
    }
    const lectureAlias = contents[1];
    const urlName = contents[2];
    const url = contents[3];
    const userId = message.user;
    const res = await urlMaster.dispatch({
        command: 'add-url',
        userId, 
        alias: lectureAlias,
        urlName,
        url
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
});

app.message('register', async({ message, say }) => {
    const contents = checkParameter(message, 'register', 3);
    if (!contents) {
        return ;
    }
    const userId = message.user;
    const mailAddress = decodeEmail(contents[1]);
    const passcode = contents[2];

    const res = await urlMaster.dispatch({
        command: 'register',
        userId,
        mailAddress,
        passcode
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
});

app.message('activate', async({ message, say }) => {
    const contents = checkParameter(message, 'activate', 2);
    if (!contents) {
        return ;
    }
    const userId = message.user;
    let validationCode = contents[1];
    const res = await urlMaster.dispatch({
        command: 'activate',
        userId, 
        validationCode,
    });
    // console.log(res);
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
});

app.message('init-lecture', async({ message, say }) => {
    const contents = checkParameter(message, 'init-lecture', 3);
    if (!contents) {
        return ;
    }
    const code = contents[1];
    const name = contents[2];
    const res = await urlMaster.dispatch({
        command: 'init-lecture',
        userId: message.user,
        code: code,
        name: name,
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
});

app.message('attend', async({ message, say }) => {
    const contents = checkParameter(message, 'attend', 2);
    if (!contents) {
        return ;
    }
    const code = contents[1];
    const res = await urlMaster.dispatch({
        command: contents[0],
        userId: message.user,
        code
    });
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