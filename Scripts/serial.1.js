const _ = require('lodash');
const grbl = require('../grbl/grbl');
const serialport = require('serialport'); // Serialport Modul einbinden
SerialPort = serialport; // Lokale instanz von Serialport erstellen
// get port name from the command line:

var status = 0;
var y = 0;
var handleState = 0;
var portName = "/dev/ttyUSB0";

function noop() {};

SerialPort.list(function(err, ports) {
    process.send({ ports: ports });
    ports.forEach(function(port) {
        console.log(port.comName);

    });
});

process.on('message', (msg) => {
    //console.log('Message from parent:', msg);
    if (msg.text !== undefined) { sendText(msg.text); }
    if (msg.cmd !== undefined) {
        (msg.cmd == 'open') ? myPort.open(): noop();
        (msg.cmd == 'close') ? myPort.close(): noop();
        (msg.cmd == 'pause') ? pause(): noop();
        (msg.cmd == 'resume') ? resume(): noop();
    }
    if (msg.code) {
        callCode(msg.code, msg.x);

    }
});

var grbl_daten = {

    status: "",
    MPos: {
        X: 0,
        Y: 0
    },
    WPos: {
        X: 0,
        Y: 0
    },
    command: "",
    WCO: {
        X: 0,
        Y: 0
    },
    FS: {
        F: 0,
        S: 0
    },
    Ov: {
        S: 0,
        R: 0,
        F: 0
    }
};


var options = {

    $0: "",
    $1: "",
    $2: "",
    $3: "",
    $4: "",
    $5: "",
    $6: "",
    $10: "",
    $11: "",
    $12: "",
    $13: "",
    $20: "",
    $21: "",
    $22: "",
    $23: "",
    $24: "",
    $25: "",
    $26: "",
    $27: "",
    $30: "",
    $31: "",
    $32: "",
    $100: "",
    $101: "",
    $102: "",
    $110: "",
    $111: "",
    $112: "",
    $120: "",
    $121: "",
    $122: "",
    $130: "",
    $131: "",
    $132: ""
};



const myPort = new SerialPort(portName, { //Neues Serialport-Objekt erstellen 
    baudRate: 115200, //Baudrate auf 115200 setzten
    autoOpen: false, //Port soll sich nicht automatisch öffnen
    parser: serialport.parsers.readline("\n") //Datenpacket endet mit Zeilenumbruch
});


myPort.on('open', showPortOpen);
myPort.on('data', read);
myPort.on('close', showPortClose);
myPort.on('error', showError);



function showPortOpen(err) {
    if (err) console.log(err);
    console.log('serialport open. Data rate: ' + myPort.options.baudRate + " Port:" + portName);
    console.log(myPort.isOpen());

    setInterval(function sendStatus(err) {
        if (myPort.isOpen()) {
            myPort.write("?"); //Sende ein ? zur Statusabfrage von GRBL, GRBL antwortet mit einem String: <Idle|MPos:0.000,0.000,0.000|FS:0.0,0>
        }

    }, 200);
}



function read(data) {

    var re1 = new RegExp(/[,;<>;:]/); // RegExp erstellen
    var re2 = new RegExp(/[,;:|]/);
    var re3 = new RegExp(/\$*[0-9]/);

    //console.log(data.match(pattern));
    if (data.match(/[<].+[>]/)) {

        var _data = _.replace(data, re1, '');
        var obj = _.split(_data, re2);

        grbl_daten.status = obj[0];
        grbl_daten.FS.F = parseFloat(obj[6]);
        grbl_daten.FS.S = parseFloat(obj[7]);

        if (obj[1].match(/MPos/)) {
            grbl_daten.MPos.X = parseFloat(obj[2]);
            grbl_daten.MPos.Y = parseFloat(obj[3]);
        } else if (obj[1].match(/WPos/)) {
            grbl_daten.WPos.X = parseFloat(obj[2]);
            grbl_daten.WPos.Y = parseFloat(obj[3]);
        }


        if (obj[8] == "WCO") {
            grbl_daten.WCO.X = parseFloat(obj[9]);
            grbl_daten.WCO.Y = parseFloat(obj[10]);
        } else if (obj[8] == "Ov") {
            grbl_daten.Ov.F = parseInt(obj[9]);
            grbl_daten.Ov.R = parseInt(obj[10]);
            grbl_daten.Ov.S = parseInt(obj[11]);
        }
    } else if (data.match(/([ALARM]+[:]+[0-9]+)/g)) {
        //console.log(data.match(/([ALARM]+[:]+[0-9]+)/g));
        var index = data.match(/([0-9]+)/g);
        index = parseInt(index);
        //console.log(index);
        var alarm = grbl.alarm_codes[index - 1].Alarm_Message;
        grbl_daten.command = `Alarm: ${alarm}`;
    } else if (data.match(/([error]+[:]+[0-9]+)/g)) {
        //console.log("Alarm lock!");
        var index = data.match(/([0-9]+)/g);
        var error = grbl.error_codes[index[0] - 1].Error_Message;
        grbl_daten.command = `Error ${index[0]}: ${error}`;
        status = 1;
    } else if (data.match(/(Grbl)/g)) {
        //console.log("Grbl 0.9j ['$' for help]"); 
        grbl_daten.command = data;
    } else if (data.match(/[o]+[k]/g)) {
        //console.log("OK");
        grbl_daten.command = "Ok";
        status = 1;
    } else if (data.match(/MSG:/g)) {
        grbl_daten.command = _.replace(data, /\[MSG:/, '[');
    } else if (re3.test(data)) {

        if (data.match(/(\$0)\=/g)) {
            options.$0 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$1)\=/g)) {
            options.$1 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$2)\=/g)) {
            options.$2 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$3)\=/g)) {
            options.$3 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$4)\=/g)) {
            options.$4 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$5)\=/g)) {
            options.$5 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$6)\=/g)) {
            options.$6 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$10)\=/g)) {
            options.$10 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$11)\=/g)) {
            options.$11 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$12)\=/g)) {
            options.$12 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$13)\=/g)) {
            options.$13 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$20)\=/g)) {
            options.$20 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$21)\=/g)) {
            options.$21 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$22)\=/g)) {
            options.$22 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$23)\=/g)) {
            options.$23 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$24)\=/g)) {
            options.$24 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$25)\=/g)) {
            options.$25 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$26)\=/g)) {
            options.$26 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$27)\=/g)) {
            options.$27 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$30)\=/g)) {
            options.$30 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$31)\=/g)) {
            options.$31 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$32)\=/g)) {
            options.$32 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$100)\=/g)) {
            options.$100 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$101)\=/g)) {
            options.$101 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$102)\=/g)) {
            options.$102 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$110)\=/g)) {
            options.$110 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$111)\=/g)) {
            options.$111 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$112)\=/g)) {
            options.$112 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$120)\=/g)) {
            options.$120 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$121)\=/g)) {
            options.$121 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$122)\=/g)) {
            options.$122 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$130)\=/g)) {
            options.$130 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$131)\=/g)) {
            options.$131 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        } else if (data.match(/(\$132)\=/g)) {
            options.$132 = _.replace(data, /[\$]+[0-9]+[\=]/, "");
        }
        process.send({ options: options, setting_codes: grbl.settings_codes });
    }
    process.send({ grbl_daten: grbl_daten })
}



//Ende read()########################################################################################################

function showPortClose() {
    console.log('port closed.');

}

function showError(error) {
    console.log('Serial port error: ' + error);
}

function sendText(command) { //Funktion zum senden eines Befehls
    myPort.write(command + "\n"); // "befehl" + Zeilenumbruch senden
    console.log("Serial out >>" + command); // und in der Konsole ausgeben
}


function sendHoming() {
    myPort.write("$H" + "\n");
    console.log("Serial out >>" + "$H");
}

function Open() {
    myPort.open();
}


function Close() {
    myPort.close();
}

function sendZero() {
    myPort.write("G90 G0 X0 Y0" + "\n");
    console.log("Serial out >>" + "G90 G0 X0 Y0");
}


var y = 0;

function sending(code, x) {

    x = x;
    this.code = code;
    var codeLength = code.length;

    handle = setInterval(function() {
        handleState = 1;
        if (status == 1 && x < codeLength) {
            myPort.write(code[x] + "\n");
            grbl_daten.command = "Serial out >> " + code[x];
            x++;
            y = x;
            status = 0;
            var percentage = (100 / codeLength) * (x);

            process.send({ percentage: percentage });
            process.send({ job: 'run' });

        } else if (status == 1 && x == codeLength) {

            myPort.write(code[codeLength] + "\n");

            console.log("Done");
            clearInterval(handle);
            var percentage = 0;
            handleState = 0;
            process.send({ percentage: percentage });
            process.send({ job: 'done' });

        }

    }, 0);
}


function pause() {

    handleState == 1 ? clearInterval(handle) : {}; // Abfrage ob der Interval zum Senden gesetzt wurde


}

function resume() {

    handleState == 1 ? sending(code, y) : {}; // Abfrage ob der Interval zum Senden gesetzt wurde

}



function callCode(code, x) {
    if (code !== undefined && code !== null) {

        var codeLength = code.length;
        status = 1;
        console.log("Job started");
        sending(code, x);

    }
}

process.send({ grbl_setting: grbl.settings_codes });