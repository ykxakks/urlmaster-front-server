'use strict';
const fs = require('fs');

const loadData = (fileName) => {
    try {
        const rawData = fs.readFileSync(fileName);
        const dataObj = JSON.parse(rawData);
        return dataObj; 
    } catch (error) {
        return {};
    }
}

exports.loadData = loadData;