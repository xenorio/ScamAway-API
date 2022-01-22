const mongo = require('../handlers/mongo')

module.exports.get = async(req, res) => {

    mongo.query('BlockedDomains', {}, (data) => {

        let list = []

        for (let entry of data) {
            list.push({
                domain: entry.domain,
                reason: entry.reason
            })
        }

        res.json(list)

    })

}