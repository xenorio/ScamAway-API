// Copyright (C) 2022  Marcus Huber (Xenorio)

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

const fetch = require('cross-fetch')
const config = require('../config')

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
            reason: 'Checked externally [phish.yinking.yachts]'
        })
    } else {

        // Check Google safe browsing
        // Documentation: https://gist.github.com/simoniz0r/2189e5b8284a33796778fdf8bbef48f4
        if (config.gsb && req.query.url) {
            let response = await fetch(`https://transparencyreport.google.com/transparencyreport/api/v3/safebrowsing/status?site=${req.query.url}`)

            let data = JSON.parse((await response.text()).split('\n')[2])[0]
            if (data[1] == 2 || data[3] == 1 || data[4] == 1) {
                res.json({
                    blocked: true,
                    reason: 'Checked externally [Google Safe Browsing]'
                })
                return
            }
        }

        // All checks passed
        res.json({
            blocked: false
        })
    }

}