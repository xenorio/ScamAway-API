const fs = require('fs')
const colors = require('colors')
const express = require('express')
const fetch = require('cross-fetch')

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

        log(`[${colors.yellow(ip)}] ${colors.green(req.method)} ${colors.cyan(requestPath)}`)

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
    loadEndpoints()
    loadExternalDomains()

    app.listen(config.port, () => {
        log(`Listening on port ${config.port}`)
    })

}

async function loadExternalDomains() {

    let data = await fetch(config.external, {
        method: 'GET',
        headers: {
            'X-Identity': 'github.com/Xenorio/ScamAway-API'
        }
    })

    process.externalDomains = JSON.parse(data)

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