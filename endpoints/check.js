module.exports.get = async(req, res) => {
    if (!req.query.domain) return res.status(400).json({
        error: 'No domain provided'
    })

    let domain = req.query.domain.toLowerCase()

    // Check local domains
    let localEntry = process.localDomains.find(x => domain == x.domain || domain.endsWith('.' + x.domain))
    if (localEntry) {
        res.json({
            blocked: true,
            reason: localEntry.reason || 'Not provided',
            timestamp: localEntry.timestamp
        })
    } else if (process.externalDomains.find(x => domain == x || domain.endsWith('.' + x))) { // Check external domains
        res.json({
            blocked: true,
            reason: 'Checked externally'
        })
    } else {
        res.json({
            blocked: false
        })
    }

}