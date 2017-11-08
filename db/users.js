var mysql = require('mysql');
var con = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'mydb'
});


/*
var records = [
    { id: 1, username: 'jack', password: 'secret', displayName: 'Jack', emails: [{ value: 'jack@example.com' }] }, { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [{ value: 'jill@example.com' }] }
];
*/

exports.findById = function(id, cb) {
    con.query("select * from user where id = " + id, function(err, result) { //process.nextTick(function() {
        //console.log(result);
        if (err) throw err;
        var idx = 0;
        //console.log(idx);
        if (result[idx]) {
            cb(null, result[idx]);
            //console.log(result.idx);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
    });
};

exports.findByUsername = function(username, cb) {
    con.query("select * from user where username = " + '"' + username + '"', function(err, result) { //process.nextTick(function() {
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