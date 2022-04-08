// Copyright (C) 2022  Marcus Huber (Xenorio)

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

const fs = require('fs')
const colors = require('colors')
const express = require('express')
const fetch = require('cross-fetch')
const mongo = require('./handlers/mongo')
const stats = require('./handlers/stats')

console.log(`${colors.brightMagenta(`
8""""8                    8""""8                       
8      eeee eeeee eeeeeee 8    8 e   e  e eeeee e    e 
8eeeee 8  8 8   8 8  8  8 8eeee8 8   8  8 8   8 8    8 
    88 8e   8eee8 8e 8  8 88   8 8e  8  8 8eee8 8eeee8 
e   88 88   88  8 88 8  8 88   8 88  8  8 88  8   88   
8eee88 88e8 88  8 88 8  8 88   8 88ee8ee8 88  8   88 `)}
               ${'- '.yellow + 'The Anti-Phishing Bot'.cyan + ' -'.yellow}       
         ${'https://github.com/Xenorio/ScamAway/'.gray}            
`)

// Make log function available globally
process.log = log

var config
var app = express()

var lastAPIUpdate

app.use(express.json())

init()

function loadEndpoints() {

    // If request to root, redirect to docs
    app.get(config.path + '/', (req, res) => {
        res.redirect(config.docs)
    })

    app.use(config.path + '/*', (req, res) => {

        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
        let requestPath = req.originalUrl.split(config.path)[1].split('?')[0] // Parse endpoint path from URL
        let endpoint

        let identifier = "Anonymous"

        if (req.headers['x-identity'] && req.headers['x-identity'] != "null" && req.headers['x-identity'] != "undefined") {
            identifier = req.headers['x-identity']
        } else if (config.forceIdentification) {
            log(`Blocked unidentified request: [${colors.yellow(ip)}] ${colors.green(req.method)} ${colors.cyan(requestPath)}`)
            res.status(401).json({
                error: 'Please provide identification using the X-Identity header'
            })
            return
        }

        log(`[${colors.yellow(ip)}] <${colors.magenta(identifier)}> ${colors.green(req.method)} ${colors.cyan(requestPath)}`)

        try {
            endpoint = require(`./endpoints${requestPath}`) // Load endpoint
        } catch (error) {
            log(error.message, 'ERROR')
            res.status(404).json({
                error: `Invalid endpoint. Check docs at ${config.docs}`
            })
            return
        }

        // Check authorization
        if(endpoint.admin){
            if(!req.headers.authorization || req.headers.authorization != config.key){
                return res.status(401).json({
                    error: 'Unauthorized'
                })
            }
        }

        switch (req.method) {
            case "GET":
                if (!endpoint.get) {
                    res.status(404).json({
                        error: `Invalid endpoint. Check docs at ${config.docs}`
                    })
                } else {
                    endpoint.get(req, res)
                }
                break;

            case "POST":
                if (!endpoint.post) {
                    res.status(404).json({
                        error: `Invalid endpoint. Check docs at ${config.docs}`
                    })
                } else {
                    endpoint.post(req, res)
                }
                break;

            default:
                break;
        }

    })

}

async function init() {

    await loadConfig()
    await stats.init()
    loadEndpoints()
    loadExternalDomains()
    loadLocalDomains()

    app.listen(config.port, () => {
        log(`Listening on port ${config.port}`)
    })

    setInterval(refreshExternalDomains, config.refreshInterval * 60000) // Minutes => Milliseconds

}

async function loadLocalDomains() {
    mongo.query('BlockedDomains', {}, res => {
        process.localDomains = res
        stats.set({domains: stats.get().domains + process.localDomains.length})
        log('Loaded local domains')
    })
}

async function loadExternalDomains() {

    let response = await fetch(config.external + '/all', {
        method: 'GET',
        headers: {
            'X-Identity': 'github.com/Xenorio/ScamAway-API'
        }
    })

    lastAPIUpdate = Date.now()

    process.externalDomains = await response.json()
    stats.set({domains: stats.get().domains + process.externalDomains.length})

    log('Loaded external domains')

}

// Get latest changes to blocklist
async function refreshExternalDomains() {

    log('Refreshing blocklist')

    dt = Math.round((Date.now() - lastAPIUpdate) / 1000)

    let response = await fetch(config.external + `/recent/${dt}`, {
        method: 'GET',
        headers: {
            'X-Identity': 'github.com/Xenorio/ScamAway-API'
        }
    })

    lastAPIUpdate = Date.now()

    let data = await response.json()

    let counts = {
        add: 0,
        remove: 0
    }

    for (let entry in data) {
        entry = data[entry]

        switch (entry.type) {
            case 'add':
                process.externalDomains = process.externalDomains.concat(entry.domains)
                counts.add += 1
                break;

            case 'delete':
                process.externalDomains = process.externalDomains.filter(e => entry.domains.indexOf(e) <= -1)
                counts.remove += 1
                break;
        
            default:
                log(`Unknown API entry type ${colors.bold(entry.type)}`, 'WARN')
                break;
        }

    }

    stats.set({domains: stats.get().domains + counts.add - counts.remove})

    if(counts.add > 0 || counts.remove > 0)log(`Added ${colors.bold(counts.add)} domains and removed ${colors.bold(counts.remove)}`)

}

async function loadConfig() {

    log('Loading configuration')

    // If config.js does not exist, create with config.default.js
    if (!fs.existsSync('./config.js')) {
        log('Could not detect config.js - Automatically creating from config.default.js')
        await fs.copyFile('./config.default.js', './config.js', () => { })
    }

    // Load
    config = require('./config.js')

    // If API key is default, change it to something random
    if(config.key == 'changeme'){
        let hat = require('hat')

        // Generate random key
        config.key = hat()

        // Write new config
        fs.writeFileSync('./config.js', `module.exports = ${JSON.stringify(config, null, 2)}`)

        // Load config again
        config = require('./config.js')

        log(`A random API key has been set for you: ${colors.yellow(config.key)}`)
    }

}

function log(message, level) {

    // If no level provided, default to info
    if (!level) return console.log(colors.blue.bold('[Info]') + ' > '.yellow + message)

    switch (level.toUpperCase()) {
        case 'ERROR':
            console.log(colors.red.bold('[Error]') + ' > '.yellow + message)
            break;

        case 'WARN':
            console.log(colors.yellow.bold('[Warning]') + ' > '.yellow + message)
            break;

        case 'INFO':
            console.log(colors.blue.bold('[Info]') + ' > '.yellow + message)
            break;

        default:
            log(`Invalid log level "${level}". Original message: ${message}`, 'ERROR')
            break;
    }
}