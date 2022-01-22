const mongo = require('../handlers/mongo')
const fetch = require('cross-fetch')

const config = require('../config.js')

module.exports.get = async(req, res) => {
    if (!req.query.url) return res.status(400).json({
        error: 'No URL provided'
    })

    let url = new URL(req.query.url)
    let domain = url.hostname

    // Check external API first
    let externalResponse = await fetch(config.external + domain, {
        method: 'GET',
        headers: {
            'X-Identity': 'github.com/Xenorio/ScamAway-API'
        }
    })

    if (externalResponse == 'true') {
        res.json({
            blocked: true
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