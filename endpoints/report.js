// Copyright (C) 2022  Marcus Huber (Xenorio)

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

const config = require('../config.js')
const fetch = require('cross-fetch')
const extractUrls = require("extract-urls");

module.exports.post = async(req, res) => {

    if (!req.body.url) return res.status(400).json({
        error: 'No URL provided'
    })

    if (!req.body.user) return res.status(400).json({
        error: 'No user provided | If not reporting through Discord, please provide something identifying'
    })

    let URLs = extractUrls(req.body.url)

    if (!URLs || !URLs[0]) return res.status(400).json({
        error: 'Invalid URL'
    })

    // Send WebHook with embed to specified Discord channel
    fetch(config.reporthook, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "embeds": [{
                "title": "New Report",
                "description": URLs[0],
                "color": 255,
                "timestamp": new Date().toISOString(),
                "author": {
                    "name": req.body.user || 'Unknown'
                }
            }]
        })
    })

    res.json({
        success: true
    })

}