const mongo = require('../handlers/mongo')

module.exports.admin = true

module.exports.post = async(req, res) => {
    if (!req.body.domain) return res.status(400).json({
        error: 'No domain provided'
    })

    if (!req.body.domain.includes('.')) return res.status(400).json({
        error: 'Invalid domain'
    })

    // Parse out root domain (without subdomains)
    // I know this is sketchy, but it works, so leave me alone
    let domain = req.body.domain.split('.')
    domain = domain[domain.length - 2] + '.' + domain[domain.length - 1]

    if (process.localDomains.find(x => domain.endsWith(x.domain))) return res.status(400).json({
        error: 'Domain is already being blocked'
    })

    let entry = {
        domain: domain,
        reason: req.body.reason,
        timestamp: Date.now()
    }

    // Add to database
    mongo.insertObject('BlockedDomains', entry)

    // Add to local cache
    process.localDomains.push(entry)

    res.send('Success')

}