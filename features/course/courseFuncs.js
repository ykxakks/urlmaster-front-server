const { stringFromObj } = require('../funcs/stringFromObj');
const { loadJSON } = require('../funcs/jsonLoader');
const renderer = require('../render/renderer');

const skippedInfos = new Set(['day', 'period']);
const encodeCourseList = (courseArray) => {
    return (courseArray.length == 0) ? '' : '\n' + courseArray.map((course) => `${course.code}: ${course.name}`).join('\n');
}
const createCourse = (code, name) => {
    return {code, name};
}

const courseDetail = (code, course, isAttending) => {
    const basicInfo = `${code} ${course.name}` + ((isAttending) ? ' (attending)' : ' (not attending)');
    if (!isAttending) {
        return basicInfo;
    }
    let extendInfo = '';
    if (course.defaultURL) {
        extendInfo += `\nDefault URL: ${course.defaultURL}`;
    }
    const infoString = stringFromObj('info', course.info);
    const urlString = stringFromObj('urls', course.urls);
    extendInfo += infoString;
    extendInfo += urlString;
    return basicInfo + extendInfo;
}
const infoToBlocks = (info) => {
    blocks = [];
    if ('day' in info && 'period' in info) {
        blocks.push(renderer.dividerBlock());
        blocks.push(renderer.periodBlock(info['day'], info['period']));
    }
    for (let infoName in info) {
        if (skippedInfos.has(infoName)) {
            continue;
        }
        if (info.hasOwnProperty(infoName)) {
            blocks.push(renderer.dividerBlock());
            blocks.push(renderer.infoBlock(infoName, info[infoName]));
        }
    }
    return blocks;
}
const urlToBlocks = (urls, defaultURL) => {
    blocks = [];
    blocks.push(renderer.dividerBlock());
    blocks.push(renderer.markdownBlock("Course urls:"));
    if (defaultURL) {
        // blocks.push(renderer.dividerBlock());
        blocks.push(renderer.urlBlock('main url', defaultURL));
    }
    for (let urlName in urls) {
        if (urls.hasOwnProperty(urlName)) {
            // blocks.push(renderer.dividerBlock());
            blocks.push(renderer.urlBlock(urlName, urls[urlName]));
        }
    }
    console.log(blocks);
    return blocks;
}
const courseDetailBlock = async (code, course, isAttending) => {
    const basicInfo = `${code} ${course.name}` + ((isAttending) ? ' (attending)' : ' (not attending)');
    if (!isAttending) {
        return basicInfo;
    }
    console.log(course);
    // otherwise: return a block kit object
    // const res = {};
    const urlBlocks = urlToBlocks(course.urls, course.defaultURL);
    const infoBlocks = infoToBlocks(course.info);
    const blocks = urlBlocks.concat(infoBlocks);
    const res = renderer.createAttachments(blocks, basicInfo);

    // res.text = basicInfo;
    // res.attachments = [];
    // const attachment = {};
    // attachment.color = "#f2c744";
    // attachment.blocks = [];
    // attachment.blocks = attachment.blocks.concat(urlToBlocks(course.urls, course.defaultURL));
    // attachment.blocks = attachment.blocks.concat(infoToBlocks(course.info));
    // res.attachments.push(attachment);
    return res;

    // {
    //     "type": "section",
    //     "text": {
    //         "type": "mrkdwn",
    //         "text": ":white_check_mark: *仏*\n誰でも単位取れる"
    //     }
    // },
}

const newCourse = ({name}) => {
    const course = {};
    course.name = name;
    course.info = {};
    course.urls = {};
    course.defaultURL = null;
    return course;
}

const renderSearchedCourses = (courses) => {
    const courseBlocks = courses.map(renderer.courseBlock);
    const text = `${courses.length} courses found.`;
    const res = renderer.createAttachments(courseBlocks, text);
    return res;
}

exports.encodeCourseList = encodeCourseList;
exports.createCourse = createCourse;
exports.courseDetail = courseDetail;
exports.newCourse = newCourse;
exports.courseDetailBlock = courseDetailBlock;
exports.renderSearchedCourses = renderSearchedCourses;