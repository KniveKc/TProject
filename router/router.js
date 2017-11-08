var express = require('express');
var router = express.Router();
var path = require('path');

//router.use("/public", express.static("public"));


// Route zur Startseite

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Route zur Tools Seite

router.get('/gtools', function(req, res) {
    res.sendFile(path.join(__dirname, '../views/gtools.html'));
});

router.get('/about', function(req, res) {
    res.sendFile(path.join(__dirname, '../views/about.html'));
});

router.get('/admin', function(req, res) {
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

router.get('/test', function(req, res) {
    res.sendFile(path.join(__dirname, '../views/test.html'));
});

module.exports = router;