// Copyright (C) 2022  Marcus Huber (Xenorio)

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

const stats = require('../handlers/stats')

module.exports.get = async(req, res) => {
    if (!req.query.domain) return res.status(400).json({
        error: 'No domain provided'
    })

    stats.set({ checks: stats.get().checks + 1 })

    let domain = req.query.domain.toLowerCase()

    let currentStats = stats.get()

    // Check local domains
    let localEntry = process.localDomains.find(x => domain == x.domain || domain.endsWith('.' + x.domain))
    if (localEntry) {

        currentStats.detections += 1
        if (!currentStats.detectionList[domain]) currentStats.detectionList[domain] = 0
        currentStats.detectionList[domain] += 1
        stats.set({ detections: currentStats.detections, detectionList: currentStats.detectionList })

        res.json({
            blocked: true,
            reason: localEntry.reason || 'Not provided',
            timestamp: localEntry.timestamp
        })
    } else if (process.externalDomains.find(x => domain == x || domain.endsWith('.' + x))) { // Check external domains

        currentStats.detections += 1
        if (!currentStats.detectionList[domain]) currentStats.detectionList[domain] = 0
        currentStats.detectionList[domain] += 1
        stats.set({ detections: currentStats.detections, detectionList: currentStats.detectionList })

        res.json({
            blocked: true,
            reason: 'Checked externally [phish.yinking.yachts]'
        })
    } else {
        // All checks passed
        res.json({
            blocked: false
        })
    }

}