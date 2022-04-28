#!/bin/sh
sleep 20
cd /home/pi/LJSoftware/src
# redirect all output to logs.txt and run in the background
python3.10 server.py > /home/pi/LJSoftware/logs.txt 2>&1 &
