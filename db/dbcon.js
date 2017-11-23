const mysql = require('mysql');
const fs = require('fs-extra');

const db_config = JSON.parse(fs.readFileSync('./db_config.json'));

/* const default_db_config = {
    host: '192.168.178.38',
    user: 'root',
    password: 'root',
    database: 'mydb'
} */


function handleDisconnect() {
    var connection = mysql.createConnection(db_config); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function(err) { // The server is either down
        if (err) { // or restarting (takes a while sometimes).
            console.log('error when connecting to database:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }
        console.log('\x1b[33m%s\x1b[0m', "\n MySql Database connected \n");
        // to avoid a hot loop, and to allow our node script to
    }); // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('database error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect(); // lost due to either server restart, or a
        } else { // connnection idle timeout (the wait_timeout
            throw err; // server variable configures this)
        }
    });
    module.exports = connection;
}

handleDisconnect();