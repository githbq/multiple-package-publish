#!/usr/bin/env node

import * as  yargs from 'yargs'
import { publish } from '../index'


async function start() {
    // yargs.command('start',
    //     'hello world',
    //     {
    //     },
    //     async (argv) => {

    //     }).help()
    // let argv = yargs.version().argv
    // if (!argv._.length) {
    //     yargs.showHelp()
    // }
    await publish()
}

start()
