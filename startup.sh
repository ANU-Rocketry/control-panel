#!/bin/sh
sleep 20

cd /home/pi/control-panel/src
# redirect all output to logs.txt and run in the background
python3.10 server.py > /home/pi/control-panel/logs.txt 2>&1 &

cd /home/pi/control-panel/reactfront/build
python3.10 -m http.server 3000 &
