function stringFromObj(objName, obj, objNameForce = false) {
    let keyCount = 0;
    let res = `\n${objName}:`;
    for (let key in obj) {
        keyCount += 1;
        res += `\n    ${key}: ${obj[key]}`;
    }
    if (keyCount) {
        return res;
    } else {
        if (objNameForce) {
            return res;
        }
        return '';
    }
}

exports.stringFromObj = stringFromObj;