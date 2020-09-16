#!/usr/bin/env node

import * as  yargs from 'yargs'
import { add } from '../index'


function start() {
    yargs.command('start',
        'hello world',
        {
        },
        async (argv) => {
            console.log(add(1, 2))
        }).help()
    let argv = yargs.version().argv
    if (!argv._.length) {
        yargs.showHelp()
    }
}

start()
