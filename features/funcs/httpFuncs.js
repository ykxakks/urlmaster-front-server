const http = require('http');
const { createError, createResponse } = require('../response/response');

const apiHost = 'localhost';
const apiPort = 8080;
const apiPath = '/api/v1';

const httpGet = async (options) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            res.on('data', d => {
                const data = JSON.parse(d);
                if (data.error) {
                    resolve(createError(data.error));
                } else {
                    if (data.msg) {
                        resolve(createResponse(data.msg));
                    }
                    resolve(createResponse(data));
                }
            });
        });

        req.on('error', error => {
            resolve(createError(error.error));
        });

        req.end();
    });
}

const httpPost = async (options, data) => {
    const jsonData = JSON.stringify(data);
    options.headers = options.headers || {};
    options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Content-Length': jsonData.length
    };
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            res.on('data', d => {
                const data = JSON.parse(d);
                if (data.error) {
                    resolve(createError(data.error));
                } else {
                    if (data.msg) {
                        resolve(createResponse(data.msg));
                    }
                    resolve(createResponse(data));
                }
            });
        });

        req.on('error', error => {
            resolve(createError(error.error));
        });

        req.write(jsonData);

        req.end();
    });
}

exports.apiHost = apiHost;
exports.apiPath = apiPath;
exports.apiPort = apiPort;
exports.httpGet = httpGet;
exports.httpPost = httpPost;