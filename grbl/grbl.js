    var fs = require('fs');

    var ecodes = fs.readFileSync(__dirname + '/error_codes.json');
    var error_codes = JSON.parse(ecodes);
    //console.log(error_codes);

    var acodes = fs.readFileSync(__dirname + '/alarm_codes.json');
    var alarm_codes = JSON.parse(acodes);
    //console.log(alarm_codes);

    var scodes = fs.readFileSync(__dirname + '/settings_codes.json');
    var settings_codes = JSON.parse(scodes);
    //console.log(settings_codes);

    var codes = { error_codes: error_codes, alarm_codes: alarm_codes, settings_codes: settings_codes };

    //console.log(codes);
    module.exports = codes;