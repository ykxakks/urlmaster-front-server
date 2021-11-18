const urlMaster = require('../urlmaster-level');

const testActionListener = async ({ack, say, body, client}) => {
    await ack();
    const user = body.user;
    console.log('body =', body);
    await say("Hello world, " + user.id + "!");
}

const gameExampleActionListener = async ({ ack, say, body }) => {
    await ack();
    console.log(body);
}

const actionIds = {

}
const actionListeners = {
    'test-action': testActionListener,
    'game': gameExampleActionListener,
}

const getActionId = (actionName) => {
    if (actionName in actionIds) {
        return actionIds[actionName];
    } else {
        return actionName;
    }
}

const appendActionListeners = (app) => {
    for (let actionName in actionListeners) {
        app.action(getActionId(actionName), actionListeners[actionName]);
    }
}

// exports.actionListeners = actionListeners;
// exports.getActionId = getActionId;

exports.appendActionListeners = appendActionListeners;