import { get } from 'https';
import * as unzip from 'unzip';
import { createWriteStream, readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import * as request from 'request';
import { exec } from 'child_process';
import { reject } from 'bluebird';

export default function initClientApi(name: string, gitUrl: string, apiURL: string) {
    return new Promise((resolve, reject) => {
        console.log("Cloning new Client API...")
        request('https://s3.amazonaws.com/mandaris/client-api.zip')
            .pipe(unzip.Extract({ path: process.cwd() }))
            .on('error', (err) => {
                reject(err);
            })
            .on('close', () => {
                reaplceFieldsInPackage(name, gitUrl)
                replaceAPIUrl(apiURL)
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

export function reaplceFieldsInPackage(name: string, gitUrl: string) {
    let packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json')).toString('utf8'))
    packageJson.name = name;
    packageJson.repository = {
        "type": "git",
        "url": gitUrl
    };
    writeFileSync(join(process.cwd(), 'package.json'), JSON.stringify(packageJson, null, 4))
}

export function replaceAPIUrl(apiURL: string) {
    if(!apiURL.startsWith('http')) {
        apiURL = 'https://' + apiURL
    }
    let filePath = join(process.cwd(), 'src/requests/request.ts');
    let packageJson = readFileSync(filePath).toString('utf8');
    packageJson.replace('{{API_BASE_URL}}', apiURL);
    writeFileSync(filePath, packageJson)
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
