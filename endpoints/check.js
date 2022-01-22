const mongo = require('../handlers/mongo')

module.exports.get = async(req, res) => {
    if (!req.body.url) return res.status(400).json({
        error: 'No URL provided'
    })

    let url = new URL(req.body.url)
    let domain = url.hostname

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