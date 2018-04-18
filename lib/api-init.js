"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unzip = require("unzip");
const fs_1 = require("fs");
const path_1 = require("path");
const request = require("request");
const child_process_1 = require("child_process");
function initApi(name, gitUrl, awsProfile) {
    return new Promise((resolve, reject) => {
        console.log("Clongin new API...");
        request('https://s3.amazonaws.com/mandaris/api.zip')
            .pipe(unzip.Extract({ path: process.cwd() }))
            .on('error', (err) => {
            reject(err);
        })
            .on('close', () => {
            reaplceFieldsInPackage(name, gitUrl, awsProfile);
            npmInit().then(() => {
                return gitInit(gitUrl).then(() => {
                    resolve();
                });
            }).catch(err => {
                reject(err);
            });
        });
    });
}
exports.default = initApi;
function reaplceFieldsInPackage(name, gitUrl, awsProfile) {
    let packageJson = JSON.parse(fs_1.readFileSync(path_1.join(process.cwd(), 'package.json')).toString('utf8'));
    packageJson.name = name;
    packageJson.repository = {
        "type": "git",
        "url": gitUrl
    };
    fs_1.writeFileSync(path_1.join(process.cwd(), 'package.json'), JSON.stringify(packageJson));
}
exports.reaplceFieldsInPackage = reaplceFieldsInPackage;
function npmInit() {
    return new Promise((resolve, reject) => {
        console.log("Initializing NPM...");
        child_process_1.exec('npm i', (err, stdout, stderr) => {
            console.log(stdout);
            console.error(stderr);
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.npmInit = npmInit;
function gitInit(gitUrl) {
    return new Promise((resolve, reject) => {
        console.log("Initializing Git...");
        child_process_1.exec('git init && git remote add origin ' + gitUrl, (err, stdout, stderr) => {
            console.log(stdout);
            console.error(stderr);
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.gitInit = gitInit;
//# sourceMappingURL=api-init.js.map