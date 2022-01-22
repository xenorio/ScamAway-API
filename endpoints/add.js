const mongo = require('../handlers/mongo')

module.exports.admin = true

module.exports.post = async(req, res) => {
    if (!req.body.domain) return res.status(400).json({
        error: 'No domain provided'
    })

    let domain = req.body.domain

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