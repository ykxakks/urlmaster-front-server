const { App } = require('@slack/bolt');
// const { listeners, getCommand } = require('./features/listeners/listeners');
// const { actionListeners, getActionId } = require('./features/listeners/actionListeners');
const { appendMessageListeners } = require('./features/listeners/listeners');
const { appendActionListeners } = require('./features/listeners/actionListeners');
const { appendViewListeners } = require('./features/listeners/viewListeners');
const { appendShortcutListeners } = require('./features/listeners/shortcutListeners');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
});

appendMessageListeners(app);
appendActionListeners(app);
appendViewListeners(app);
appendShortcutListeners(app);

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running!');
})();