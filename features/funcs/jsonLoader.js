const fs = require('fs');

const loadJSON = async (filename) => {
    const rawData = await fs.promises.readFile(filename);
    const obj = JSON.parse(rawData);
    return obj;
}

exports.loadJSON = loadJSON;