
# delete old build on the raspberry pi
ssh pi@192.168.0.5 "cd ~/control-panel/reactfront; rm -r build"
# build a new version
npm run build
# copy it over
scp -r build pi@192.168.0.5:/home/pi/control-panel/reactfront
# then just reload http://192.168.0.5:3000 in your browser
