const config = require('../config.js')

var MongoClient = require('mongodb').MongoClient;

const server = config.database;

const db_name = 'ScamAway'

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