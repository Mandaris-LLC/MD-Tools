import { get } from 'https';
import * as unzip from 'unzip';
import { createWriteStream, readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import * as request from 'request';
import { exec } from 'child_process';
import { reject } from 'bluebird';

export default function initApi(name: string, gitUrl: string, awsProfile: string) {
    return new Promise((resolve, reject) => {
        console.log("Clongin new API...")
        request('https://s3.amazonaws.com/mandaris/api.zip')
            .pipe(unzip.Extract({ path: process.cwd() }))
            .on('error', (err) => {
                reject(err);
            })
            .on('close', () => {
                reaplceFieldsInPackage(name, gitUrl, awsProfile)
                npmInit().then(() => {
                    // return tsc().then(() => {
                    return gitInit(gitUrl).then(() => {
                        resolve();
                    })
                    // })
                }).catch(err => {
                    reject(err);
                })
            })
    })
}

export function reaplceFieldsInPackage(name: string, gitUrl: string, awsProfile: string) {
    let packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json')).toString('utf8'))
    packageJson.name = name;
    packageJson.repository = {
        "type": "git",
        "url": gitUrl
    };
    writeFileSync(join(process.cwd(), 'package.json'), JSON.stringify(packageJson, null, 4))
}
export function npmInit() {
    return new Promise((resolve, reject) => {
        console.log("Initializing NPM...")
        exec('npm i', (err, stdout, stderr) => {
            console.log(stdout);
            console.error(stderr);
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        })
    })
}
export function tsc() {
    return new Promise((resolve, reject) => {
        if (existsSync(join(process.cwd(), 'local_modules'))) {
            let dirs = readdirSync(join(process.cwd(), 'local_modules'))
            Promise.all(dirs.map(dir => {
                return new Promise((resolve, reject) => {
                    exec('cd ' + join(process.cwd(), 'local_modules', dir) + ' && tsc', (err, stdout, stderr) => {
                        console.log(stdout);
                        console.error(stderr);
                        if (err) {
                            reject(err);
                        } else {
                            resolve()
                        }
                    })
                })
            })).then(() => {
                resolve()
            }).catch(err => {
                resolve(); // not mandatory
            })

        }
    })
}
export function gitInit(gitUrl: string) {
    return new Promise((resolve, reject) => {
        console.log("Initializing Git...")
        exec('git init && git remote add origin ' + gitUrl, (err, stdout, stderr) => {
            console.log(stdout);
            console.error(stderr);
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        })
    })
}