// Copyright (C) 2022  Marcus Huber (Xenorio)

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

const config = require('../config.js')

var MongoClient = require('mongodb').MongoClient;

const server = config.database;

const db_name = config.databaseName

module.exports.insertObject = (collection, obj, cb) => {

    MongoClient.connect(server, (err, db) => {
        if (err) return cb(false, err);

        var dbo = db.db(db_name);

        dbo.collection(collection).insertOne(obj, (err, res) => {
            if (err) return cb(false, err);
            db.close()
            if (cb) cb(true)
        })
    })
}

module.exports.query = (collection, query, cb) => {
    MongoClient.connect(server, (err, db) => {
        if (err) return cb(false, err);

        var dbo = db.db(db_name);

        dbo.collection(collection).find(query).toArray(function(err, result) {
            if (err) return cb(false, err);
            db.close();
            if (cb) cb(result)
        });
    })
}

module.exports.update = (collection, query, newvals, cb) => {
    MongoClient.connect(server, (err, db) => {
        if (err) return cb(false, err);

        var dbo = db.db(db_name);

        obj = {
            $set: newvals
        }

        dbo.collection(collection).updateOne(query, obj, function(err, res) {
            if (err) return cb(false, err);
            db.close();
            if (cb) cb(true)
        });
    })
}

module.exports.delete = (collection, query, cb) => {
    MongoClient.connect(server, (err, db) => {
        if (err) return cb(false, err);

        var dbo = db.db(db_name);

        dbo.collection(collection).deleteOne(query, function(err, res) {
            if (err) return cb(false, err);
            db.close();
            if (cb) cb(true)
        });
    })
}