#!bin/bash
sleep 8
cd /home/pi/share/Server_aktuell
forever start app.js>>/home/pi/share/output.log2>>/home/pi/share/error.log
