var fs = require("fs");
var code = fs.readFileSync('./dateien/TestG.txt').toString().split("\n");
var codeLength = code.length;
var status = 0;

console.log(codeLength);


var serialport = require('serialport');// Serialport Modul einbinden
   SerialPort = serialport;            // Lokale instanz von Serialport erstellen
   // get port name from the command line:
   portName = "com4";



SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    //console.log(port.comName);
   
    //console.log(port.pnpId);
    //console.log(port.manufacturer);
   });
   
  });
 




var myPort = new SerialPort(portName, {                         //Neues Serialport-Objekt erstellen 
  baudRate: 115200,                                             //Baudrate auf 115200 setzten
  autoOpen: false,                                              //Port soll sich nicht automatisch öffnen
  parser: serialport.parsers.readline("\n")                     //Datenpacket endet mit Zeilenumbruch
}); 


myPort.on('open', showPortOpen);
myPort.on('data', read);
myPort.on('close', showPortClose);
myPort.on('error', showError);



function showPortOpen(err) {
   if(err)
    console.log(err);
   else
    console.log('serialport open. Data rate: ' + myPort.options.baudRate + " Port:" + portName);
}
 
 function read(data) {
   console.log("Serial in << " + data);
  // console.log(typeof data);
  module.exports.data = data;
  //console.log(data);
  status = 1;
  
}

function showPortClose() {
   console.log('port closed.');
}
 
function showError(error) {
   console.log('Serial port error: ' + error);
}
 

function sendUnlock(){                          //Funktion zum senden des Entsperrbefehls $X
  callCode();                  // $X + Zeilenumbruch senden
  console.log("Serial out >>" + "$X")           // und in der Konsole ausgeben
}

function sendText(command){                     //Funktion zum senden eines Befehls
  myPort.write(command + "\n");                 // "befehl" + Zeilenumbruch senden
  console.log("Serial out >>" + command)        // und in der Konsole ausgeben
}

/*while(myPort.isOpen == true){
setInterval(function sendStatus(){
  myPort.write("?" + "\n");                     //Sende ein ? zur statusabfrage von GRBL
}, 5);
}*/

function sendHoming(){
  myPort.write("$H" + "\n");
  console.log("Serial out >>" + "$H")
}

function sendOpen(){
  myPort.open();
}

function sendClose(){
  myPort.close();
}

function sendZero(){
  myPort.write("G90 G0 X0 Y0" + "\n");
  console.log("Serial out >>" + "G90 G0 X0 Y0");
}



var x = 0;


function callCode(){  
  if(x <= codeLength){
  setInterval(sendCode, 100);
}


  else{
    setInterval(function(){
      x = 0;
    },250);
  }
}

function sendCode(){
  while(status == 1 && x < codeLength){
    myPort.write(code[x] + "\n"); 
    console.log("Serial out >> " + code[x]);
    console.log(x);
    x++;
    status = 0;
  }
}

  












exports.text = sendText;       //Hiermit wird die Funktion "sendText" in anderen scripts zur verfügung geststellt
exports.Code = callCode;
exports.Open = sendOpen;       //Hiermit wird die Funktion "sendOpen" in anderen scripts zur verfügung geststellt

exports.Close = sendClose;     //Hiermit wird die Funktion "sendClose" in anderen scripts zur verfügung geststellt
   
exports.myPort = myPort;

exports.sliste = serialport.list;