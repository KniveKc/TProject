var fs = require("fs");
var code = fs.readFileSync('./dateien/TestG.txt').toString().split("\n");
var codeLength = code.length;
var status = 0;
var _ = require('lodash');

//console.log(codeLength);

var lastStat = " ";


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
 


var paket = {"status": " ", "XPos": 0, "YPos": 0, "nachricht": " "}

var options = {
  
};

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
   //console.log("Serial in << " + data);
  // console.log(typeof data);
  module.exports.data = paket;
  //console.log(data); 
  status = 1;
  
  var code = data;  //#

//####################################### code parsen ###########################################

code = _.split(code, ":");
code = _.split(code, ",");                          





var obj = _.extend({}, code);





//console.log(obj);

if([obj[0]] == "\r"){
  //console.log("");
  }

else if(obj[0] == "error" || obj[1] == "Alarm lock\r"){
  //console.log("Alarm lock!");
  paket.nachricht = "Alarm";
}

else if(obj[0] == "[Caution" || obj[1] == "Unlocked]\r"){
  //console.log("Unlocked!");
  paket.nachricht = "Caution Unlocked!";
}

else if([obj[0]] == "ok\r"){
  //console.log("OK");
  paket.nachricht = "OK";
}

else if([obj[0]] == "Grbl 0.9j ['$' for help]\r"){
  //console.log("Grbl 0.9j ['$' for help]");
  paket.nachricht = "Grbl 0.9j ['$' for help]";
}

else if([obj[0]] == "['$H'|'$X' to unlock]\r"){
  //console.log("['$H'|'$X' to unlock]");
  paket.nachricht = "['$H'|'$X' to unlock]";
}

//else if([obj[0]] == "['$H'|'$X' to unlock]\r"){
  //console.log("['$H'|'$X' to unlock]");
  //paket.nachricht =
//}




else{

if(obj[0] == '<Idle'){
  //console.log("State= Idle");
  paket.status = "Idle";
  
  
}
if (obj[0] == '<Run'){
  //console.log("State= Run");
  paket.status = "Run";
  
}

if (obj[0] == '<Alarm'){
  //console.log("State= Alarm");
  paket.status = "Alarm";
}


var x = parseFloat(obj[2]);
var y = parseFloat(obj[3]);
//console.log("X = " , x , " : ", "Y = " , y);
paket.XPos = x;
paket.YPos = y;

}
console.log(paket);
}

 //Ende read()########################################################################################################

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
  console.log("Serial out >>" + command);        // und in der Konsole ausgeben
}





function sendHoming(){
  myPort.write("$H" + "\n");
  console.log("Serial out >>" + "$H")
}

function sendOpen(){
myPort.open();
setInterval(function sendStatus(){
myPort.write("?" + "\n"); 
//lastStat = "?";                    //Sende ein ? zur statusabfrage von GRBL
}, 250); 
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


// GCode senden // Noch nicht die entgültige Lösung!!!

function sendCode(){
 

 
  if(status == 1 && x < codeLength){
      myPort.write(code[x] + "\n"); 
      console.log("Serial out >> " + code[x]);
      console.log(x);
      x++;
      status = 0;
    }
    else if(status == 1 && x == codeLength){
    console.log("finished")
  
      }

  
}


//GCode senden Ende


exports.text = sendText;       //Hiermit wird die Funktion "sendText" in anderen scripts zur verfügung geststellt
exports.Code = callCode;
exports.Open = sendOpen;       //Hiermit wird die Funktion "sendOpen" in anderen scripts zur verfügung geststellt

exports.Close = sendClose;     //Hiermit wird die Funktion "sendClose" in anderen scripts zur verfügung geststellt
   
exports.myPort = myPort;

exports.sliste = serialport.list;
exports.stats = lastStat;