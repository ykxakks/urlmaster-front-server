const decodeURL = (url) => {
    let res = url.trim();
    while (res.length >= 2 && res[0] == '<' && res[res.length - 1] == '>') {
        res = res.slice(1, res.length - 1);
    }
    return res;
}

exports.decodeURL = decodeURL;