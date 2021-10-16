'use strict';

const loadData = require('./dataloader').loadData;
const fs = require('fs');

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

const defaultFileName = 'data.json';

function URLMaster(dataFileName) {
    this.dataFileName = dataFileName ? dataFileName : defaultFileName;
    this.data = loadData(this.dataFileName);

    this.getList = function() {
        return createResponse(Object.keys(this.data));
    }

    this.getURL = function(name) {
        if (!this.data.hasOwnProperty(name)) {
            return createError(`Lecture ${name} not found.`);
        } else {
            return createResponse(this.data[name]);
        }
    }
    
    this.addURL = function(name, url) {
        if (this.data.hasOwnProperty(name)) {
            if (this.data[name] === url) {
                return createError(`${name} has already been added.`);
            } else {
                return createError(`${name} has already been added to another url.`);
            }
        } else {
            this.data[name] = url;
            this.save();
            return createResponse();
        }
    }

    this.save = function() {
        let data = JSON.stringify(this.data);
        fs.writeFileSync(this.dataFileName, data);
    }
}

module.exports = URLMaster;