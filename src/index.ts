#!/usr/bin/env node
import * as commander from 'commander'
import initApi from './api-init';

commander.version('1.0.0').description('Mandaris CLI Tools')

commander
    .command('api-init <name> <git-url> [<aws-profile>]')
    .alias('ai')
    .description('Initializes a new Typescript API')
    .action((name, gitUrl, awsProfile) => {
        initApi(name, gitUrl, awsProfile).then(() => {
            console.log("Done")
        }).catch((err) => {
            console.error(err)
        })
    })

commander.parse(process.argv)