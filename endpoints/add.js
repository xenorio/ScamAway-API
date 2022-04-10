// Copyright (C) 2022  Marcus Huber (Xenorio)

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

const mongo = require('../handlers/mongo')
const stats = require('../handlers/stats')
const fetch = require('cross-fetch')
const colors = require('colors')

const config = require('../config')

module.exports.admin = true

module.exports.post = async(req, res) => {
    if (!req.body.domain) return res.status(400).json({
        error: 'No domain provided'
    })

    if (!req.body.domain.includes('.')) return res.status(400).json({
        error: 'Invalid domain'
    })

    let domain = req.body.domain

    if (process.localDomains.find(x => domain.endsWith(x.domain))) return res.status(400).json({
        error: 'Domain is already being blocked'
    })

    let entry = {
        domain: domain,
        reason: req.body.reason,
        timestamp: Date.now()
    }

    if (req.body.whitelist) {
        // Whitelist domain
        mongo.insertObject('Whitelist', entry)
        process.whitelist.push(entry)
    } else {
        // Block domain
        mongo.insertObject('BlockedDomains', entry)
        process.localDomains.push(entry)
        stats.set({ domains: stats.get().domains + 1 })
    }

    // Report to Fish Fish
    if (!req.body.whitelist && req.body.forward && config.reportForwardKey) {
        process.log(`Forwarding ${colors.cyan(req.body.forward)} to Fish Fish`)
        fetch('https://yuri.bots.lostluma.dev/phish/report', {
            method: 'POST',
            headers: {
                'Authorization': config.reportForwardKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: req.body.forward,
                reason: req.body.reason
            })
        })
    }

    res.json({
        success: true
    })

}