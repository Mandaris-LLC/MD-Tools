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
                // return tsc().then(() => {
                return gitInit(gitUrl).then(() => {
                    resolve();
                });
                // })
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
    fs_1.writeFileSync(path_1.join(process.cwd(), 'package.json'), JSON.stringify(packageJson, null, 4));
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
function tsc() {
    return new Promise((resolve, reject) => {
        if (fs_1.existsSync(path_1.join(process.cwd(), 'local_modules'))) {
            let dirs = fs_1.readdirSync(path_1.join(process.cwd(), 'local_modules'));
            Promise.all(dirs.map(dir => {
                return new Promise((resolve, reject) => {
                    child_process_1.exec('cd ' + path_1.join(process.cwd(), 'local_modules', dir) + ' && tsc', (err, stdout, stderr) => {
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
            })).then(() => {
                resolve();
            }).catch(err => {
                resolve(); // not mandatory
            });
        }
    });
}
exports.tsc = tsc;
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