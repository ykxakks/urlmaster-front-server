'use strict';
const fs = require('fs');

const loadData = (fileName) => {
    const rawData = fs.readFileSync(fileName);
    const dataObj = JSON.parse(rawData);
    return dataObj; 
}

exports.loadData = loadData;