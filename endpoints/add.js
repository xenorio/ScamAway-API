const mongo = require('../handlers/mongo')

module.exports.admin = true

module.exports.post = async(req, res) => {
    if (!req.body.url) return res.status(400).json({
        error: 'No URL provided'
    })

    let url = new URL(req.body.url)
    let domain = url.hostname

    mongo.query('BlockedDomains', { domain: domain }, (data) => {

        if (data[0]) return res.status(400).json({
            error: 'Domain is already being blocked'
        })

        mongo.insertObject('BlockedDomains', {
            domain: domain,
            reason: req.body.reason,
            timestamp: Date.now()
        })
    })

    res.send('Success')

}