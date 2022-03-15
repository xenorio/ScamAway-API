// Copyright (C) 2022  Marcus Huber (Xenorio)

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

const mongo = require('./mongo')
const ms = require('ms')

var stats = {
    detections: 0,
    checks: 0,
    domains: 0,
    detectionList: {}
}

async function save() {
    let update = stats
    delete update.domains
    mongo.update('Misc', { name: 'Stats' }, { value: update }, () => { process.log('Stats saved') })
}

async function load() {
    mongo.query('Misc', { name: 'Stats' }, res => {
        if (!res[0]) return mongo.insertObject('Misc', {
            name: 'Stats',
            value: stats
        })

        for (key in res[0].value) {
            if (key != 'domains') stats[key] = res[0].value[key]
        }

    })
}

async function init() {

    await load()

    setInterval(save, ms('1m'))

}

function get() {
    return stats
}

function set(update) {
    for (key in update) {
        stats[key] = update[key]
    }
}

module.exports = {
    save,
    load,
    init,
    get,
    set
}