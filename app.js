const { App } = require('@slack/bolt');
const { listeners, getCommand } = require('./features/listeners/listeners');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
});

for (let listenerName in listeners) {
    app.message(getCommand(listenerName), listeners[listenerName]);
}

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running!');
})();