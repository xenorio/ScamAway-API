const mongo = require('../handlers/mongo')
const fetch = require('cross-fetch')

const config = require('../config.js')

module.exports.get = async(req, res) => {
    if (!req.query.url) return res.status(400).json({
        error: 'No URL provided'
    })

    let url = new URL(req.query.url)
    let domain = url.hostname

    // Check external domains first
    if (process.externalDomains.indexOf(domain) > -1) {
        res.json({
            blocked: true,
            reason: 'Checked externally'
        })
        return
    }

    mongo.query('BlockedDomains', { domain: domain }, (data) => {

        if (!data[0]) {
            res.json({
                blocked: false
            })
        } else {
            res.json({
                blocked: true,
                reason: data[0].reason
            })
        }

    })

}