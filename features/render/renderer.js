const numberFuncs = require('../funcs/numberFuncs');
const dividerBlock = () => {
    return {
        type: 'divider'
    };
}
const infoBlock = (infoName, info) => {
    return {
        type: 'section', 
        text: {
            type: 'mrkdwn',
            text: `*${infoName}*\n${info}`,
        }
    };
}
const urlBlock = (urlName, url) => {
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `<${url}|${urlName}>`,
        }
    };
}
const markdownBlock = (text) => {
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: text,
        }
    };
}
const periodBlock = (day, period) => {
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `*Period*: ${day} ${period}${numberFuncs.numberThEnds(period)}`,
        }
    };
}

const createAttachments = (blocks, text, color) => {
    const attachColor = color || "#f2c744";
    const attachText = text || "";

    const res = {};
    res.text = attachText;
    res.attachments = [];

    const attachment = {};
    attachment.color = attachColor;
    attachment.blocks = [...blocks];
    res.attachments.push(attachment);
    return res;
}

const selectBlock = ({blockId, label, elemId, options, values, initialOption}) => {
    if (!values) {
        values = options;
    }
    if (values.length != options.length) {
        console.error(`Length of values and options are not equal in selectBlock: ${options} ${values}`);
    }
    const optionObjs = options.map((elem, index) => {
        return {
            text: {
                type: "plain_text",
                text: elem,
            }, value: values[index],
        };
    });
    const initialOptionObj = (initialOption && options.indexOf(initialOption) !== -1) ? optionObjs[options.indexOf(initialOption)] : null;
    // const initialOptions = initialOptionObj ? [initialOptionObj] : [];

    return {
        type: "input", 
        block_id: blockId,
        label: {
            type: "plain_text", 
            text: label,
            emoji: true,
        },
        element: {
            type: "static_select",
            action_id: elemId,
            options: optionObjs,
            initial_option: initialOptionObj,
        },
    }
}

const courseBlock = ({code, name}) => {
    return {
        type: 'section', 
        text: {
            type: 'mrkdwn',
            text: `*${code}* : ${name}`
        }
    };
}

exports.dividerBlock = dividerBlock;
exports.infoBlock = infoBlock;
exports.urlBlock = urlBlock;
exports.markdownBlock = markdownBlock;
exports.periodBlock = periodBlock;
exports.createAttachments = createAttachments;
exports.selectBlock = selectBlock;
exports.courseBlock = courseBlock;