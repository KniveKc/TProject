const { fork } = require('child_process');
const serial_con = fork("./Scripts/serial.js");
const path = require('path');
const fs = require('fs');
const express = require("express");
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const app = express();
const formidable = require('formidable');
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const morgan = require('morgan');
const io = require("socket.io")(server);
const favicon = require('serve-favicon');
const db = require('./db');
const database = require("./db/dbcon.js");

// Pi GPIO
//var //rpio = require('//rpio');
////rpio.open(18, //rpio.OUTPUT, //rpio.HIGH);


database.connect(function(err) {
    if (err) throw err;
    console.log('\x1b[33m%s\x1b[0m', "MySql Database connected" + "\n");

    var gcode = null;

    console.log("\x1b[35m", "\nServer running");
    console.log("\x1b[35m", `Own PID: ${process.pid}`);
    console.log("\x1b[35m", 'Child process running');
    console.log("\x1b[35m", `Child PID: ${serial_con.pid}`);


    // Konfiguration des ExpressJS Servers

    app.set("view engine", "ejs");
    app.set("views", __dirname + "/views");
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
    app.use('/public', express.static('public'));
    app.use(passport.initialize());
    app.use(passport.session());

    (process.argv[2] == 'dev') ? app.use(morgan('dev')): {};

    // Passport local strategy

    passport.use(new Strategy(
        function(username, password, cb) {
            db.users.findByUsername(username, function(err, user) {
                if (err) { return cb(err); }
                if (!user) { return cb(null, false); }
                if (user.password != password) { return cb(null, false); }
                return cb(null, user);
            });
        }));

    passport.serializeUser(function(user, cb) {
        cb(null, user.id);
    });

    passport.deserializeUser(function(id, cb) {
        db.users.findById(id, function(err, user) {
            if (err) { return cb(err); }
            cb(null, user);
        });
    });
    //################################################


    app.get('/',
        function(req, res) {
            //res.redirect('/login');
            //res.sendFile(path.join(__dirname, '/public/index.html'));
            res.render('../public/index', { user: req.user });
        });

    app.get('/login',
        function(req, res) {
            res.redirect('/');
            //res.sendFile(path.join(__dirname, 'views/login.html'));
        });

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/' }),
        function(req, res) {
            res.redirect('/gtools');
        });

    app.get('/logout',
        function(req, res) {
            req.logout();
            res.redirect('/');
        });

    app.get('/gtools',
        require('connect-ensure-login').ensureLoggedIn(),
        function(req, res) {
            res.render('gtools', { user: req.user });
            //res.sendFile(path.join(__dirname, 'views/gtools.html'));
            var port = '/dev/ttyUSB0';
            serial_con.send({ start: port });
        });

    app.get('/admin',
        require('connect-ensure-login').ensureLoggedIn(),
        function(req, res) {
            console.log(req.user.username);
            if (req.user.username == 'admin') {

                res.render('admin', { user: req.user });
            } else { res.redirect('/'); }
        });

    app.get('/about',
        require('connect-ensure-login').ensureLoggedIn(),
        function(req, res) {

            res.render('about', { user: req.user });
        });

    app.get('/optionen',
        require('connect-ensure-login').ensureLoggedIn(),
        function(req, res) {
            if (req.user.username == 'admin') {
                res.render('optionen', {
                    user: req.user,
                    title: "Device Settings"
                });
            } else { res.redirect('/'); }
        });
    app.get('/test',
        function(req, res) {

            res.render('test', { user: req.user });
        });
    app.post('/upload', function(req, res) {

        // create an incoming form object
        var form = new formidable.IncomingForm();

        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;

        // store all uploads in the /uploads directory
        form.uploadDir = path.join(__dirname, '/uploads');

        // every time a file has been uploaded successfully,
        // rename it to it's orignal name
        form.on('file', function(field, file) {
            fs.rename(file.path, path.join(form.uploadDir, file.name));
            console.log(path.join(form.uploadDir, file.name));

            var sql = 'INSERT INTO gcodes SET ?',
                values = {
                    code_name: file.name,
                    code_location: path.join(form.uploadDir, file.name)
                };
            database.query(sql, values, function(err, result) {
                if (err) {
                    console.log("Query fehlgeschlagen!");
                    console.log(err);
                    return err;
                }
                console.log("\x1b[36m\x1b[1m", "1 record inserted into GCODES");
            });




        });

        // log any errors that occur
        form.on('error', function(err) {
            console.log('An error has occured: \n' + err);
        });

        // once all the files have been uploaded, send a response to the client
        form.on('end', function() {
            res.end('success');
        });

        // parse the incoming request containing the form data
        form.parse(req);

    });
    //################################################


    io.sockets.setMaxListeners(0);

    var allClients = [];

    io.sockets.on('connection', function(socket) {
        allClients.push(socket);
        console.log("\x1b[32m\x1b[1m", `Socket.IO connected Socket with ID: ${socket.id}`);
        socket.on('disconnect', function() {
            console.log("\x1b[31m\x1b[1m", `${socket.id} got disconnect!`);
            var i = allClients.indexOf(socket);
            allClients.splice(i, 1);
        });
    });

    io.on("connection", function(socket) {

        console.log("\x1b[32m\x1b[0m", "Ein Benutzer hat sich verbunden");

        database.query("select * from user", function(err, result) {
            if (err) throw err;

            var tdata = {};

            result.forEach(function(result) {
                tdata.id = result.id;
                tdata.name = result.displayName;
                tdata.lastname = result.Lastname;
                tdata.username = result.username;
                tdata.pwd = result.password;
                tdata.ts = result.ts;

                socket.emit("tdata", tdata);
            });

        });

        database.query("select * from pending", function(err, result) {
            if (err) console.errror(err);

            var tdata2 = {};

            result.forEach(function(result) {
                tdata2.id = result.idpending;
                tdata2.name = result.Name;
                tdata2.lastname = result.Lastname;
                tdata2.username = result.Username;
                tdata2.pwd = result.Password;
                tdata2.ts = result.ts;
                socket.emit("tdata2", tdata2);
            });

        });



        app.post('/new', function(req, res) {
            var sql2 = `INSERT INTO pending (Name, Lastname, Username, Password) VALUES ( "${req.body.username}" , "${req.body.user.Lastname}" , "${req.body.user.Username}", "${req.body.user.Passwod}")`;
            //var sql = "INSERT INTO pending (Name, Lastname, Username, Password) VALUES (" + "'" + req.body.user.Name + "'" + ", " + "'" + req.body.user.Lastname + "'" + ",  " + "'" + req.body.user.Username + "'" + ", " + "'" + req.body.user.Password + "'" + ")";
            database.query(sql2, function(err, result) {
                if (err) {
                    console.log("\x1b[31m\x1b[1m", "Query fehlgeschlagen!");
                    return err;
                }
                console.log("1 record inserted");
            });

            res.redirect("/");
        });

        app.post('/newUser', function(req, res) {

            var sql = "INSERT INTO user (displayName, Lastname, username, password) VALUES (" + "'" + req.body.user.Name + "'" + ", " + "'" + req.body.user.Lastname + "'" + ",  " + "'" + req.body.user.Username + "'" + ", " + "'" + req.body.user.Password + "'" + ")";
            database.query(sql, function(err, result) {
                if (err) {
                    console.log("\x1b[31m\x1b[1m", "Query fehlgeschlagen!");
                    return err;
                }
                console.log("1 record inserted");
            });

            res.redirect("/admin");
        });

        socket.on("fileinput", function(data) {

            console.log(data);

            const gcode = Buffer.from(data.file, 'binary');
            console.log(gcode.length);
            var sql = 'INSERT INTO gcodes SET ?',
                values = {
                    code_name: data.name,
                    code_data: gcode
                };
            database.query(sql, values, function(err, result) {
                if (err) {
                    console.log("Query fehlgeschlagen!");
                    console.log(err);
                    return err;
                }
                console.log("\x1b[36m\x1b[1m", "1 record inserted into GCODES");
            });



        });



        socket.on('get', () => {
            read_from_table("'chevron_0001.txt'");
        });

        function read_from_table(code_name) {
            var sql = `select * from gcodes where code_name = ${code_name}`;
            database.query(sql, (err, result) => {
                if (err) {
                    console.log("Query fehlgeschlagen!");
                    console.log(err);
                    return err;
                }
                fs.readFile(__dirname + '/uploads/' + result[0].code_name, 'utf8', function(err, data) {
                    if (err) console.error(err);
                    console.log(data);
                    gcode = data.split('\n');
                });

            });





        }


        //###################

        var del_user = {};
        var del_pending = {};

        socket.on('testdb', function(data) {
            del_user = data;

        });

        socket.on('testdb2', function(data) {
            del_pending = data;

        });

        socket.on('deleteuser', function() {

            database.query("delete from user where id = '" + del_user.id + "' and displayName = '" + del_user.name + "'", function(err, result) {
                if (err) {
                    console.log("\x1b[31m\x1b[4m", "Query fehlgeschlagen!");
                    return err;
                }
                console.log("\x1b[36m\x1b[1m", "1 record removed");

            });

        });

        socket.on('deletepending', function() {

            database.query("delete from pending where idpending = '" + del_pending.id + "' and name = '" + del_pending.name + "'", function(err, result) {
                if (err) {
                    console.log("\x1b[31m\x1b[1m", "Query fehlgeschlagen!");
                    return err;
                }
                console.log("\x1b[36m\x1b[1m", "1 record removed");

            });

        });

        socket.on('acceptpending', function() {

            database.query("INSERT INTO user (displayName, Lastname, username, password) VALUES (" + "'" + del_pending.name + "'" + ", " + "'" + del_pending.lastname + "'" + ", " + "'" + del_pending.username + "'" + ", " + "'" + del_pending.pwd + "'" + ");",
                function(err, result) {
                    if (err) {
                        console.log("\x1b[31m\x1b[1m", "Query fehlgeschlagen!");
                        return err;
                    }
                    console.log("\x1b[36m\x1b[1m", "1 User accepted");

                });
            database.query("delete from pending where idpending = '" + del_pending.id + "' and Name = '" + del_pending.name + "'",
                function(err, result) {
                    if (err) {
                        console.log("\x1b[31m\x1b[0m", "Query fehlgeschlagen!");
                        return err;
                    }
                    console.log("\x1b[36m\x1b[0m", "User removed from pending");

                });


        });





        //###################

        socket.on("entsperren", function() {
            var command = { command: "$X" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
            //rpio.write(18, //rpio.LOW);
        });

        socket.on("command", function(command) {
            //console.log(command.command);
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("homing", function() {
            var command = { command: "$H" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
            //rpio.write(18, //rpio.HIGH);
        });

        socket.on("sendeCode", function() {
            serial_con.send({ text: '~' });
            //rpio.write(18, //rpio.LOW);
            serial_con.send({ code: gcode, x: 0 });

        });

        socket.on("open", function() {
            serial_con.send({ port: "/dev/ttyUSB0" });
            serial_con.send({ cmd: 'open' });
            var command = { command: "Open Connection..." };
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("open_com", function(port) {
            serial_con.send({ port: port });
            serial_con.send({ cmd: 'open' });
            var command = { command: "Open Connection..." };
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("close", function() {
            serial_con.send({ cmd: 'close' });
            var command = { command: "Closing connection..." };
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("goToZero", function() {
            var command = { command: "G90 G0 X0 Y0" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("softReset", function() {
            var command = { command: "\x91" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("options", function() {
            var command = { command: "$$" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
            command = { command: "$#" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("setZero1", function() {
            var command = { command: "G10 P1 L20 X0 Y0 Z0" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("setZero2", function() {
            var command = { command: "G10 P2 L20 X0 Y0 Z0" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("setZero3", function() {
            var command = { command: "G10 P3 L20 X0 Y0 Z0" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("setZero4", function() {
            var command = { command: "G10 P4 L20 X0 Y0 Z0" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("setZero5", function() {
            var command = { command: "G10 P5 L20 X0 Y0 Z0" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("setZero6", function() {
            var command = { command: "G10 P6 L20 X0 Y0 Z0" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });





        socket.on("feed_ovr_reset", function() {
            var command = { command: "\x90" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("feed_ovr_plus", function() {
            var command = { command: "\x91" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("feed_ovr_minus", function() {
            var command = { command: "\x92" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("feed_ovr_fplus", function() {
            var command = { command: "\x93" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("feed_ovr_fminus", function() {
            var command = { command: "\x94" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("rapid_ovr_reset", function() {
            var command = { command: "\x95" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("rapid_ovr_medium", function() {
            var command = { command: "\x96" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("rapid_ovr_low", function() {
            var command = { command: "\x97" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("spindle_ovr_reset", function() {
            var command = { command: "\x99" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("spindle_ovr_plus", function() {
            var command = { command: "\x9A" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("spindle_ovr_minus", function() {
            var command = { command: "\x9B" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("spindle_ovr_fplus", function() {
            var command = { command: "\x9C" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("spindle_ovr_fminus", function() {
            var command = { command: "\x9D" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("spindle_ovr_stop", function() {
            var command = { command: "\x9E" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        serial_con.on('message', (msg) => {
            //console.log(msg);

            if (msg !== undefined) {

                if (msg.ports) {
                    //console.log(msg.ports);
                    socket.emit("ports", msg.ports);
                    socket.broadcast.emit("ports", msg.ports);
                }
                if (msg.grbl_daten) {
                    //console.log('hi');
                    socket.emit("newCommand", msg.grbl_daten);
                    socket.broadcast.emit("newCommand", msg.grbl_daten);
                }

                if (msg.settings) {
                    socket.emit("newOptions", msg.settings);
                    socket.broadcast.emit("newOptions", msg.settings);
                }
                if (msg.percentage) {
                    socket.emit("percentage", msg.percentage);
                }

                var JobState = 0;
                if (msg.job == 'run') {
                    JobState = 1;
                    //console.log(JobState);
                } else if (msg.job == 'done') {
                    serial_con.send({ cmd: 'pause' });
                    //serial_con.send({ text: '!' });
                    //rpio.write(18, //rpio.HIGH);
                    JobState = 0;
                    //console.log(JobState);
                }
            }
        });

        //});

        //Funktionen für den JOGMODE (Achsen per Hand fahren)

        socket.on("message", function(data) {
            console.log(data);
        });


        socket.on("xp", function(mm) {
            //this.mm = mm;
            var command = { command: "G21 G91 G0 X" + mm.mm };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("xm", function(mm) {
            //this.mm = mm;
            var command = { command: "G21 G91 G0  X-" + mm.mm };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("yp", function(mm) {
            //this.mm = mm;
            var command = { command: "G21 G91 G0  Y" + mm.mm };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("ym", function(mm) {
            //this.mm = mm;
            var command = { command: "G21 G91 G0  Y-" + mm.mm };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        //Slider

        socket.on("xp1", function(mm) {
            this.mm = mm;
            var command = { command: "G21 G90 G0 X" + mm.mm + " F2000" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("yp1", function(mm) {
            this.mm = mm;
            var command = { command: "G21 G90 G0 Y" + mm.mm + " F2000" };
            serial_con.send({ text: command.command });
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on('pauseCode', function() {
            serial_con.send({ cmd: 'pause' });
            serial_con.send({ text: '!' });
            //rpio.write(18, //rpio.HIGH);
        });

        socket.on('resumeCode', function() {

            serial_con.send({ text: '~' });
            serial_con.send({ cmd: 'resume' });
            //rpio.write(18, //rpio.LOW);
            ////rpio.msleep(100); // Vielleicht benötigt ?
        });


        socket.on('stopCode', function() {
            console.log('Operation stopped by user!');
            serial_con.send({ cmd: 'stop' });
            serial_con.send({ text: '!' });
            //rpio.write(18, //rpio.HIGH);
            ////rpio.msleep(100); // Vielleicht benötigt ?
        });

    });
    //JOGMODE ENDE

    server.listen(8008, function() {
        console.log("\x1b[36m\x1b[1m", 'Server listening on Port 8008');
    });

});

//}); // /ComPorts auslesen