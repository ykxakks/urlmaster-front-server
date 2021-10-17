function createError(msg) {
    return {
        status: 'error', 
        msg: msg
    };
}
function createResponse(res) {
    return {
        status: 'success', 
        response: res
    };
}

exports.createError = createError;
exports.createResponse = createResponse;
