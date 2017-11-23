var mysql = require('mysql');
var con = require('../db/dbcon.js');

exports.findById = function(id, cb) {

    var sql = (`select * from user where id = "${id}"`);

    con.query(sql, function(err, result) { //process.nextTick(function() {
        //console.log(result);
        if (err) throw err;
        var i = 0;
        //console.log(idx);
        if (result[i]) {
            cb(null, result[i]);
            //console.log(result.idx);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
    });
};

exports.findByUsername = function(username, cb) {

    var sql = (`select * from user where username = "${username}"`);

    con.query(sql, function(err, result) { //process.nextTick(function() {
        //console.log(result);
        for (var i = 0, len = result.length; i < len; i++) {
            var record = result[i];
            //console.log(record.username);
            if (record.username === username) {
                //console.log("iugcdfiwvfciu");
                return cb(null, record);
            }
        }
        return cb(null, null);
    });
};