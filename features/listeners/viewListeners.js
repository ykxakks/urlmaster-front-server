const urlMaster = require('../urlmaster-level');
const { renderSearchedCourses } = require('../course/courseFuncs');
const renderer = require('../render/renderer');

const searchCourseViewListener = async ({ ack, body, view, client }) => {
    await ack();
    const user = body['user']['id'];
    const rawDay = view.state.values.day.day.selected_option.value;
    const rawPeriod = view.state.values.period.period.selected_option.value;
    const day = (rawDay === 'All') ? null : rawDay;
    const period = (rawPeriod === 'All') ? null : rawPeriod;
    const res = await urlMaster.dispatch({
        command: 'search', 
        day, period
    });
    if (res.status === 'success') {
        const response = renderSearchedCourses(res.response);
        await client.chat.postMessage({
            ...response, 
            channel: user
        });
    } else {
        await client.chat.postMessage({
            channel: user,
            text: res.msg
        });
    }
};

const viewIds = {

}
const viewListeners = {
    "search-course-view": searchCourseViewListener,
}

const getViewId = (viewName) => {
    if (viewName in viewIds) {
        return viewIds[viewName];
    } else {
        return viewName;
    }
}

const appendViewListeners = (app) => {
    for (let viewName in viewListeners) {
        app.view(getViewId(viewName), viewListeners[viewName]);
    }
}

// exports.viewListeners = viewListeners;
// exports.getViewId = getViewId;
exports.appendViewListeners = appendViewListeners;