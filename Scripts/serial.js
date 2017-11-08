var status = 0;

var _ = require('lodash');

var re1 = new RegExp(/[,;<;>;:]/); // RegExp erstellen
var re2 = new RegExp(/[,;:]/);
var opt = new RegExp(/\$/);

var y = 0;
var handleState = 0;

//console.log(codeLength);


var serialport = require('serialport'); // Serialport Modul einbinden
SerialPort = serialport; // Lokale instanz von Serialport erstellen
// get port name from the command line:
portName = "/dev/ttyUSB0";
//portName = "com4";

SerialPort.list(function(err, ports) {
    ports.forEach(function(port) {
        //console.log(port.comName);

        //console.log(port.pnpId);
        //console.log(port.manufacturer);
        return ports;
    });
    return ports;
});



//var rti = { "status": " ", "MXPos": 0, "MYPos": 0, "nachricht": " ", "WXpos": 0, "WYPos": 0 }; // Realtime Input Object

var rti = {

    status: "",
    MXPos: 0,
    MYPos: 0,
    nachricht: "",
    WXPos: 0,
    WYPos: 0

};

var options = {

};

var myPort = new SerialPort(portName, { //Neues Serialport-Objekt erstellen 
    baudRate: 115200, //Baudrate auf 115200 setzten
    autoOpen: false, //Port soll sich nicht automatisch öffnen
    parser: serialport.parsers.readline("\n") //Datenpacket endet mit Zeilenumbruch
});


myPort.on('open', showPortOpen);
myPort.on('data', read);
myPort.on('close', showPortClose);
myPort.on('error', showError);



function showPortOpen(err) {
    if (err)
        console.log(err);
    else
        console.log('serialport open. Data rate: ' + myPort.options.baudRate + " Port:" + portName);
    console.log(myPort.isOpen());

    setInterval(function sendStatus(err) {
        if (myPort.isOpen()) {
            myPort.write("?");
            //Sende ein ? zur statusabfrage von GRBL

        }
    }, 200);
}



function read(data) {
    //console.log("Serial in << " + data);
    // console.log(typeof data);
    module.exports.data = rti;


    //console.log(res); // Ausgangs-String

    var res2 = _.replace(data, re1, '');
    var obj = _.split(res2, re2);
    //console.log(obj);


    if ([obj[0]] == "\r") {
        //console.log("");

    } else if (obj[1] == "Alarm lock\r") {
        //console.log("Alarm lock!");
        rti.nachricht = "Alarm lock";

    } else if (obj[0] == "error") {
        //console.log("Alarm lock!");
        rti.nachricht = obj[0] + obj[1] + obj[2];



    } else if (obj[0] == "[Caution" || obj[1] == "Unlocked]\r") {
        //console.log("Unlocked!");
        rti.nachricht = "Caution Unlocked!";

    } else if ([obj[0]] == "ok\r") {
        //console.log("OK");
        rti.nachricht = "OK";
        status = 1;

    } else if ([obj[0]] == "Grbl 0.9j ['$' for help]\r") {
        //console.log("Grbl 0.9j ['$' for help]");
        rti.nachricht = "Grbl 0.9j ['$' for help]";

    } else if ([obj[0]] == "['$H'|'$X' to unlock]\r") {
        //console.log("['$H'|'$X' to unlock]");
        rti.nachricht = "['$H'|'$X' to unlock]";


    } else if (opt.test(obj[0])) {
        //console.log("['$H'|'$X' to unlock]");
        rti.nachricht = obj[0];

    } else {

        rti.status = obj[0];
        rti.MXPos = parseFloat(obj[2]);
        rti.MYPos = parseFloat(obj[3]);
        rti.WXPos = parseFloat(obj[6]);
        rti.WYPos = parseFloat(obj[7]);

    }
    //console.log(rti);
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


function sending(code, x) {

    x = x;
    this.code = code;
    var codeLength = code.length;

    handle = setInterval(function() {
        handleState = 1;
        while (status == 1 && x < codeLength) {
            myPort.write(code[x] + "\n");
            console.log("Serial out >> " + code[x]);
            console.log(x);
            x++;
            y = x;
            status = 0;
            var percentage = (100 / codeLength) * (x);
            console.log(percentage + "%");
            module.exports.percentage = percentage;
            if (x == codeLength) {

                myPort.write(code[codeLength] + "\n");

                console.log("Serial out >> " + code[x]);
                console.log("Done");
                percentage = 0;
                handleState = 0;
                //clearInterval(handle);
                module.exports.percentage = percentage;

            }
        }
    }, 1);
}


function pause() {

    handleState == 1 ? clearInterval(handle) : {}; // Abfrage ob der Interval zum Senden gesetzt wurde


}

function resume() {

    handleState == 1 ? sending(code, y) : {}; // Abfrage ob der Interval zum Senden gesetzt wurde

}



function callCode(gcode) {
    var code = gcode;
    if (code !== undefined && code !== null) {

        var codeLength = code.length;
        var x = 0;
        status = 1;
        console.log(x);
        console.log("Job started");

        if (x <= codeLength) {

            sending(code, x);

        }

    }
}




//Funktionen exportieren


exports.text = sendText;
exports.Code = callCode;
exports.Open = Open;
exports.Close = Close;
exports.myPort = myPort;
exports.list = SerialPort.list;
exports.resume = resume;
exports.pause = pause;


//