const urlMaster = require('../urlmaster-level');
const renderer = require('../render/renderer');

const searchCourseShortcutListener = async ({ shortcut, ack, client }) => {
    try {
        await ack();
        const result = await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: {
                type: "modal",
                callback_id: "search-course-view",
                title: {
                    type: "plain_text",
                    text: "Search for Courses"
                },
                submit: {
                    type: "plain_text", 
                    text: "Search",
                },
                blocks: [renderer.selectBlock({
                    blockId: 'day', 
                    label: 'choose day', 
                    elemId: 'day', 
                    options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'All'],
                    initialOption: 'All'
                }), renderer.selectBlock({
                    blockId: 'period', 
                    label: 'choose period',
                    elemId: 'period', 
                    options: ['1', '2', '3', '4', '5', '6', 'others', 'All'],
                    initialOption: 'All'
                })
                ],
            }
        });
    } catch (error) {
        console.error(error);
    }
}

const shortcutIds = {

}

const shortcutListeners = {
    'search_course': searchCourseShortcutListener,
}

const getShortcutId = (shortcutName) => {
    if (shortcutName in shortcutIds) {
        return shortcutIds[shortcutName];
    } else {
        return shortcutName;
    }
}

const appendShortcutListeners = (app) => {
    for (let shortcutName in shortcutListeners) {
        app.shortcut(getShortcutId(shortcutName), shortcutListeners[shortcutName]);
    }
}

// exports.viewListeners = viewListeners;
// exports.getViewId = getViewId;
exports.appendShortcutListeners = appendShortcutListeners;