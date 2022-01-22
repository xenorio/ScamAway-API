const config = require('../config.js')
const fetch = require('cross-fetch')

module.exports.post = async(req, res) => {

    if (!req.body.url) return res.status(400).json({
        error: 'No URL provided'
    })

    // Send WebHook with embed to specified Discord channel
    fetch(config.reporthook, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "embeds": [{
                "title": "New Report",
                "description": req.body.url,
                "color": 255,
                "timestamp": new Date().toISOString()
            }]
        })
    })

    res.send('Success')

}