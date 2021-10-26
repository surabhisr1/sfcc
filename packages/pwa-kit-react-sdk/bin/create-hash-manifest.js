#!/usr/bin/env node
/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-env node */
/* eslint-disable strict */
'use strict'

const fs = require('fs')
const path = require('path')
const Utils = require('../scripts/utils')
const createHashManifest = require('../scripts/create-hash-manifest')

const argv = require('yargs')
    .usage('Usage $0 [options]')
    .option('c', {
        alias: 'config',
        describe: 'the path to your configuration file'
    })
    .help('h')
    .alias('h', 'help').argv

let configPath = path.join(process.cwd(), 'app', 'config', 'cache-hash-config.json')

if (typeof argv.config !== 'undefined') {
    if (!argv.config.endsWith('.json')) {
        Utils.fail(`The provided configuration file "${argv.config}" is not a valid JSON file.`)
    }

    configPath = argv.config
}

let configOptions = ''
try {
    const file = fs.readFileSync(configPath, {encoding: 'utf8'})
    configOptions = JSON.parse(file)
} catch (e) {
    let message
    if (e.code === 'ENOENT') {
        message = `[Error: Configuration file not found at "${configPath}"]` // eslint-disable-line max-len
    } else {
        message = e.message
    }

    Utils.fail(message)
}

createHashManifest(configOptions)
