import { get } from 'https';
import * as unzip from 'unzip';
import { createWriteStream, readFileSync, writeFileSync } from 'fs';
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
                    return gitInit(gitUrl).then(() => {
                        resolve();
                    })
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
    writeFileSync(join(process.cwd(), 'package.json'), JSON.stringify(packageJson))
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