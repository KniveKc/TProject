//var fs = require("fs");
//var code = fs.readFileSync('./dateien/TestG.txt').toString().split("\n");
//var codeLength = code.length;
var status = 0;
var _ = require('lodash');

//console.log(codeLength);


var serialport = require('serialport'); // Serialport Modul einbinden
SerialPort = serialport; // Lokale instanz von Serialport erstellen
// get port name from the command line:
portName = "com4";


SerialPort.list(function(err, ports) {
    ports.forEach(function(port) {
        //console.log(port.comName);

        //console.log(port.pnpId);
        //console.log(port.manufacturer);
        return ports;
    });
    return ports;
});



var rti = { "status": " ", "MXPos": 0, "MYPos": 0, "nachricht": " ", "WXpos": 0, "WYPos": 0 } // Realtime Input Object

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
    if (myPort.isOpen) {
        setInterval(function sendStatus(e) {
            myPort.write("?" + "\n");
            //Sende ein ? zur statusabfrage von GRBL
        }, 220);
    }
}



function read(data) {
    //console.log("Serial in << " + data);
    // console.log(typeof data);
    module.exports.data = rti;
    console.log(data);
    status = 1;
    //console.log(data);
    var code = data; //#

    //####################################### code parsen ###########################################

    code = _.split(code, ":");
    code = _.split(code, ",");

    var obj = _.extend({}, code);

    console.log(obj);

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

    } else if ([obj[0]] == "Grbl 0.9j ['$' for help]\r") {
        //console.log("Grbl 0.9j ['$' for help]");
        rti.nachricht = "Grbl 0.9j ['$' for help]";

    } else if ([obj[0]] == "['$H'|'$X' to unlock]\r") {
        //console.log("['$H'|'$X' to unlock]");
        rti.nachricht = "['$H'|'$X' to unlock]";
    } else {

        if (obj[0] == '<Idle') {
            //console.log("State= Idle");
            rti.status = "Idle";


        }
        if (obj[0] == '<Run') {
            //console.log("State= Run");
            rti.status = "Run";

        }

        if (obj[0] == '<Alarm') {
            //console.log("State= Alarm");
            rti.status = "Alarm";
        }


        // X- und Y-Positionen aus den eongehenden Daten filtern 

        var mx = parseFloat(obj[2]);
        var my = parseFloat(obj[3]);
        //console.log("X = " , x , " : ", "Y = " , y);
        rti.MXPos = mx;
        rti.MYPos = my;

        var wx = parseFloat(obj[6]);
        var wy = parseFloat(obj[7]);
        //console.log("X = " , x , " : ", "Y = " , y);
        rti.WXPos = wx;
        rti.WYPos = wy;



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


function sendUnlock() { //Funktion zum senden des Entsperrbefehls $X
    callCode(); // $X + Zeilenumbruch senden
    console.log("Serial out >>" + "$X") // und in der Konsole ausgeben
}

function sendText(command) { //Funktion zum senden eines Befehls
    myPort.write(command + "\n"); // "befehl" + Zeilenumbruch senden
    console.log("Serial out >>" + command); // und in der Konsole ausgeben
}


function sendHoming() {
    myPort.write("$H" + "\n");
    console.log("Serial out >>" + "$H")
}

function sendOpen() {
    myPort.open();


}




function sendClose() {
    myPort.close();
}

function sendZero() {
    myPort.write("G90 G0 X0 Y0" + "\n");
    console.log("Serial out >>" + "G90 G0 X0 Y0");
}







function callCode(gcode) {
    code = gcode;
    if (code != undefined && code != null) {
        var p = gcode.length;

        var code;


        var codeLength = code.length;
        var x = 0;
        console.log("Job started");
        if (x <= codeLength) {
            setInterval(function() {

                while (status == 1 && x < codeLength) {
                    myPort.write(code[x] + "\n");
                    console.log("Serial out >> " + code[x]);
                    console.log(x);
                    x++;
                    status = 0;
                    console.log(parseInt((100 / p) * x) + "%");
                    if (x == codeLength) {
                        myPort.write(code[codeLength] + "\n");
                        console.log("Serial out >> " + code[x]);
                        console.log("Done");
                    }
                }
            }, 250);
        }

    }
}


//Funktionen exportieren

exports.text = sendText;
exports.Code = callCode;
exports.Open = sendOpen;
exports.Close = sendClose;
exports.myPort = myPort;
exports.sliste = serialport.list;


//