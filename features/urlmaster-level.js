'use strict';

const level = require('level')

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

// const defaultFileName = 'data.json';
const defaultDBName = 'urls';

function URLMaster(dbName) {
    // this.dataFileName = dataFileName ? dataFileName : defaultFileName;
    // this.data = loadData(this.dataFileName);
    this.dbName = dbName || defaultDBName;
    this.dbName = './leveldb/' + this.dbName;
    this.db = level(this.dbName, { valueEncoding: 'json' });

    this.hasKey = async function(key) {
        let url = await this.db.get(key).catch(() => {});
        return Boolean(url);
    }
    this.getURL = async function(name) {
        let url = await this.db.get(name).catch(() => {});
        return url;
    }
    this.getList = async function() {
        const keyArray = [];
        return new Promise((resolve, reject) => {
            this.db.createKeyStream()
            .on('data', (key) => {
                keyArray.push(key);
            })
            .on('error', err => {
                reject(err);
            })
            .on('close', () => {
                resolve(keyArray);
            });
        });
    }

    this.getListService = async function() {
        const keys = await this.getList();
        return createResponse(keys);
    }

    this.getURLService = async function(name) {
        let url = await this.getURL(name);
        if (!url) {
            return createError(`Lecture ${name} not found.`);
        } else {
            return createResponse(url);
        }
    }
    
    this.addURLService = async function(name, url) {
        let existURL = await this.getURL(name);
        if (existURL) {
            if (existURL === url) {
                return createError(`${name} has already been added.`);
            } else {
                return createError(`${name} has already been added to another url.`);
            }
        } else {
            let err = await this.db.put(name, url).catch((error) => error);
            if (err) {
                return createError(`fail in saving url ${name}: ${url}`);
            } else {
                return createResponse();
            }
        }
    }
}

module.exports = URLMaster;