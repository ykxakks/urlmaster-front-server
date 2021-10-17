function checkParameter(msg, command, minimumPara) {
    const messageContent = msg.text.trim().replace(/\s/g, ' ');
    const contents = messageContent.split(' ');
    if (contents.length < minimumPara || contents[0] != command) {
        return ;
    }
    return contents;
}

module.exports = checkParameter;