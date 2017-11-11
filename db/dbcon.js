const mysql = require('mysql');
var connection = mysql.createConnection({
    host: '192.168.178.38',
    user: 'root',
    password: 'root',
    database: 'mydb'
});

module.exports = connection;