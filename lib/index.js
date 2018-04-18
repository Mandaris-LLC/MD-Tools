#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const api_init_1 = require("./api-init");
commander.version('1.0.0').description('Mandaris CLI Tools');
commander
    .command('api-init <name> <git-url> [<aws-profile>]')
    .alias('ai')
    .description('Initializes a new Typescript API')
    .action((name, gitUrl, awsProfile) => {
    api_init_1.default(name, gitUrl, awsProfile).then(() => {
        console.log("Done");
    }).catch((err) => {
        console.error(err);
    });
});
commander.parse(process.argv);
//# sourceMappingURL=index.js.map