/* 
||Server für das Projekt Laserplotter||


Version X.X


*/

var con = require("./dbconnection/dbcon.js");

con.connect(function(err) {
    if (err) throw err;
    console.log("MySql Database connected" + "\n");

    var path = require('path');
    var fs = require('fs');
    var express = require("express");
    var passport = require('passport');
    var Strategy = require('passport-local').Strategy;
    var app = express();
    var server = require('http').Server(app);
    var bodyParser = require('body-parser');
    var morgan = require('morgan');
    var io = require("socket.io")(server);
    var favicon = require('serve-favicon');
    var serial = require("./Scripts/serial.js");
    var router = require('./router/router');
    //var con = require("./dbconnection/dbcon.js");
    var db = require('./db');

    var gcode = null;



    console.log("\nProjekt-Server |Laserplotter| V 0.x\n" + "\n|||Caution alpha version|||\n" + "\nDo not use!\n");


    app.set("view engine", "ejs");

    app.set("views", __dirname + "/views");
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
    app.use('/public', express.static('public'));
    if (process.argv[2] == 'dev') {
        app.use(morgan('dev'));
    }

    app.use(passport.initialize());
    app.use(passport.session());

    //app.use('/', router);



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


    // Configure Passport authenticated session persistence.
    //
    // In order to restore authentication state across HTTP requests, Passport needs
    // to serialize users into and deserialize users out of the session.  The
    // typical implementation of this is as simple as supplying the user ID when
    // serializing, and querying the user record by ID from the database when
    // deserializing.

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
            res.redirect('/');
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
        });

    app.get('/admin',
        require('connect-ensure-login').ensureLoggedIn(),
        function(req, res) {
            console.log(req.user.username);
            if (req.user.username == 'admin') {
                //res.sendFile(path.join(__dirname, 'views/admin.html'));
                res.render('admin', { user: req.user });
            } else { res.redirect('/'); }
        });

    app.get('/about',
        require('connect-ensure-login').ensureLoggedIn(),
        function(req, res) {
            //res.sendFile(path.join(__dirname, 'views/about.html'));
            res.render('about', { user: req.user });
        });

    app.get('/test',
        //require('connect-ensure-login').ensureLoggedIn(),
        function(req, res) {
            //res.sendFile(path.join(__dirname, 'views/about.html'));
            res.render('test', {
                user: req.user,
                title: "EJTitle"
            });
        });



    //################################################


    io.sockets.setMaxListeners(0);

    io.on("connection", function(socket) {

        console.log("Ein Benutzer hat sich verbunden");

        con.query("select * from user", function(err, result) {
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

        con.query("select * from pending", function(err, result) {
            if (err) throw err;

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

            var sql = "INSERT INTO pending (Name, Lastname, Username, Password) VALUES (" + "'" + req.body.user.Name + "'" + ", " + "'" + req.body.user.Lastname + "'" + ",  " + "'" + req.body.user.Username + "'" + ", " + "'" + req.body.user.Password + "'" + ")";
            con.query(sql, function(err, result) {
                if (err) {
                    console.log("Query fehlgeschlagen!");
                    return err;
                }
                console.log("1 record inserted");
            });

            res.redirect("/");
        });

        app.post('/newUser', function(req, res) {

            var sql = "INSERT INTO user (displayName, Lastname, username, password) VALUES (" + "'" + req.body.user.Name + "'" + ", " + "'" + req.body.user.Lastname + "'" + ",  " + "'" + req.body.user.Username + "'" + ", " + "'" + req.body.user.Password + "'" + ")";
            con.query(sql, function(err, result) {
                if (err) {
                    console.log("Query fehlgeschlagen!");
                    return err;
                }
                console.log("1 record inserted");
            });

            res.redirect("/admin");
        });

        /*app.post('/', function(req, res) {

            con.query("select * from user where Username = '" + req.body.user.namex + "' and Password = '" + req.body.user.pwdx + "'", function(err, result) {
                if (err) throw err;
                if (result[0] !== undefined && result[0].Username == req.body.user.namex && result[0].Password == req.body.user.pwdx) {
                    res.redirect("/gtools");
                } else { res.redirect("/"); }
            });
        });*/





        socket.on("fileinput", function(text) {
            gcode = text.split("\n");
            socket.broadcast.emit("fileinputs", text);
            console.log(gcode);
        });

        //###################

        var deluser = {};
        var delpending = {};

        socket.on('testdb', function(data) {
            deluser = data;

        });

        socket.on('testdb2', function(data) {
            delpending = data;

        });

        socket.on('deleteuser', function() {

            con.query("delete from user where id = '" + deluser.id + "' and displayName = '" + deluser.name + "'", function(err, result) {
                if (err) {
                    console.log("Query fehlgeschlagen!");
                    return err;
                }
                console.log("1 record removed");

            });

        });

        socket.on('deletepending', function() {

            con.query("delete from pending where idpending = '" + delpending.id + "' and name = '" + delpending.name + "'", function(err, result) {
                if (err) {
                    console.log("Query fehlgeschlagen!");
                    return err;
                }
                console.log("1 record removed");

            });

        });

        socket.on('acceptpending', function() {

            con.query("INSERT INTO user (displayName, Lastname, username, password) VALUES (" + "'" + delpending.name + "'" + ", " + "'" + delpending.lastname + "'" + ", " + "'" + delpending.username + "'" + ", " + "'" + delpending.pwd + "'" + ");",
                function(err, result) {
                    if (err) {
                        console.log("Query fehlgeschlagen!");
                        return err;
                    }
                    console.log("1 User accepted");

                });
            con.query("delete from pending where idpending = '" + delpending.id + "' and Name = '" + delpending.name + "'",
                function(err, result) {
                    if (err) {
                        console.log("Query fehlgeschlagen!");
                        return err;
                    }
                    console.log("User removed from pending");

                });


        });





        //###################

        socket.on("entsperren", function() {
            var command = { command: "$X" };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("command", function(command) {
            //console.log(command.command);
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("homing", function() {
            var command = { command: "$H" };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("sendeCode", function() {
            serial.Code(gcode);

        });

        socket.on("open", function() {
            serial.Open();
            var command = { command: "Open Connection..." };
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("close", function() {
            serial.Close();
            var command = { command: "Closing connection..." };
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("goToZero", function() {
            var command = { command: "G90 G0 X0 Y0" };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("softReset", function() {
            var command = { command: "\x18" };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });



        socket.on("options", function() {
            var command = { command: "$$" };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("setZero", function() {
            var command = { command: "$$" };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        serial.myPort.on('data', function() { // Die Funktion myPort.on('data', ....) wird aufgerufen und die variable "data" vom serialport übergeben         

            var commands = {
                command: serial.data.nachricht,
                status: serial.data.status,
                MXPos: serial.data.MXPos,
                MYPos: serial.data.MYPos,
                WXPos: serial.data.WXPos,
                WYPos: serial.data.WYPos
            };
            socket.emit("newCommand", commands);
            socket.broadcast.emit("newCommand", commands);
            if (serial.percentage <= 100 && serial.percentage !== null) {
                socket.emit("percentage", serial.percentage);
            }
        });

        //Funktionen für den JOGMODE (Achsen per Hand fahren)

        socket.on("xp", function(mm) {
            this.mm = mm;
            var command = { command: "G21 G91 G0 X" + mm.mm };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("xm", function(mm) {
            this.mm = mm;
            var command = { command: "G21 G91 G0  X-" + mm.mm };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("yp", function(mm) {
            this.mm = mm;
            var command = { command: "G21 G91 G0  Y" + mm.mm };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("ym", function(mm) {
            this.mm = mm;
            var command = { command: "G21 G91 G0  Y-" + mm.mm };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        //Slider

        socket.on("xp1", function(mm) {
            this.mm = mm;
            var command = { command: "G21 G90 G0 X" + mm.mm + " F2000" };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });

        socket.on("yp1", function(mm) {
            this.mm = mm;
            var command = { command: "G21 G90 G0 Y" + mm.mm + " F2000" };
            serial.text(command.command);
            socket.emit("newCommand", command);
            socket.broadcast.emit("newCommand", command);
        });




    });
    //JOGMODE ENDE

    server.listen(8008, function() {
        console.log("Server listening on Port 8008");
    });

});