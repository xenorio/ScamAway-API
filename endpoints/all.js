const mongo = require('../handlers/mongo')

module.exports.get = async(req, res) => {

    let list = []

    for (let entry of process.localDomains) {
        list.push({
            domain: entry.domain,
            reason: entry.reason,
            timestamp: entry.timestamp
        })
    }

    res.json(list)

}