const mongo = require('../handlers/mongo')

module.exports.admin = true

module.exports.post = async(req, res) => {
    if (!req.body.domain) return res.status(400).json({
        error: 'No domain provided'
    })

    mongo.query('BlockedDomains', { domain: req.body.domain }, (data) => {

        if (!data[0]) return res.status(400).json({
            error: 'Domain is not being blocked'
        })

        mongo.delete('BlockedDomains', { domain: req.body.domain })
    })

    res.send('Success')

}