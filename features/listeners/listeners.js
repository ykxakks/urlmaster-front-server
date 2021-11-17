const URLMaster = require('../urlmaster-level');
const UserSystem = require('../user/UserSystem');
const { decodeEmail, checkDomain } = require('../mail/validateEmail');
const checkParameter = require('../funcs/checkParameter');

const userSystem = new UserSystem([checkDomain]);
const urlMaster = new URLMaster(userSystem);

const listListener = async({ message, say }) => {
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
};

const mylistListener = async({ message, say }) => {
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
};

const urlListener = async({ message, say }) => {
    const contents = checkParameter(message, 'link', 2) || checkParameter(message, 'url', 2);
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
}

const infoListener = async({ message, say }) => {
    const contents = checkParameter(message, 'info', 3);
    if (!contents) {
        return ;
    }
    const lectureAlias = contents[1];
    const infoName = contents[2];
    const res = await urlMaster.dispatch({
        command: contents[0],
        userId: message.user,
        alias: lectureAlias,
        infoName
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
}

const addURLListener = async({ message, say}) => {
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
};

const addInfoListener = async({ message, say}) => {
    const contents = checkParameter(message, 'add-info', 4);
    // add <alias> <urlName> <url>
    if (!contents) {
        return ;
    }
    const lectureAlias = contents[1];
    const infoName = contents[2];
    const info = contents[3];
    const userId = message.user;
    const res = await urlMaster.dispatch({
        command: contents[0],
        userId, 
        alias: lectureAlias,
        infoName,
        info
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
};

const registerListener = async({ message, say }) => {
    const contents = checkParameter(message, 'register', 2);
    if (!contents) {
        return ;
    }
    const userId = message.user;
    const mailAddress = decodeEmail(contents[1]);
    const passcode = (contents.length > 2) ? contents[2] : null;

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
};

const activateListener = async({ message, say }) => {
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
};

const setAliasListener = async({ message, say }) => {
    const contents = checkParameter(message, 'set-alias', 3);
    if (!contents) {
        return ;
    }
    const alias = contents[1];
    const code = contents[2];
    const res = await urlMaster.dispatch({
        command: contents[0],
        userId: message.user,
        alias,
        code
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
};

const initLectureListener = async({ message, say }) => {
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
};

const attendListener = async({ message, say }) => {
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
};

const retireListener = async({ message, say }) => {
    const contents = checkParameter(message, 'retire', 2);
    if (!contents) {
        return ;
    }
    const alias = contents[1];
    const res = await urlMaster.dispatch({
        command: contents[0],
        userId: message.user,
        alias
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
};

const unsetAliasListener = async({ message, say }) => {
    const contents = checkParameter(message, 'unset-alias', 2);
    if (!contents) {
        return ;
    }
    const alias = contents[1];
    const res = await urlMaster.dispatch({
        command: contents[0],
        userId: message.user,
        alias,
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
};

const detailListener = async({ message, say }) => {
    const contents = checkParameter(message, 'detail', 2);
    if (!contents) {
        return ;
    }
    const alias = contents[1];
    const res = await urlMaster.dispatch({
        command: contents[0],
        userId: message.user,
        alias
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
};

const myaliasListener = async({ message, say }) => {
    const contents = checkParameter(message, 'myalias', 1);
    if (!contents) {
        return ;
    }
    const res = await urlMaster.dispatch({
        command: contents[0],
        userId: message.user,
    });
    if (res.status === 'error') {
        await say(res.msg);
    } else {
        await say(res.response);
    }
};

const listeners = {
    'list': listListener,
    'mylist': mylistListener,
    'url': urlListener,
    'link': urlListener,
    'info': infoListener,
    'add-url': addURLListener,
    'add-info': addInfoListener,
    'register': registerListener,
    'activate': activateListener,
    'init-lecture': initLectureListener,
    'attend': attendListener,
    'retire': retireListener,
    'set-alias': setAliasListener,
    'unset-alias': unsetAliasListener,
    'detail': detailListener,
    'myalias': myaliasListener
};

const commands = {

};

const getCommand = (command) => {
    if (command in commands) {
        return commands[command];
    } else {
        return command;
    }
}

exports.listeners = listeners;
exports.getCommand = getCommand;