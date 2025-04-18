# ANU Rocketry Test Stand Control Panel

![screenshot](./screenshot.png)

This project consists of two parts: a backend that runs on a Raspberry Pi written in Python, and a front end website client written using React.js. The two communicate over a point-to-point wifi connection.

Contents:
- [ANU Rocketry Test Stand Control Panel](#anu-rocketry-test-stand-control-panel)
- [Development](#development)
- [Setting up a Raspberry Pi for the first time](#setting-up-a-raspberry-pi-for-the-first-time)
- [Setting up the Pi at the testing site](#setting-up-the-pi-at-the-testing-site)
- [How to debug](#how-to-debug)
  - [Pushing new builds on the fly](#pushing-new-builds-on-the-fly)
    - [Front end](#front-end)
    - [Back end](#back-end)
- [Unofficial brew install of sshpass](#unofficial-brew-install-of-sshpass)

# Development

Installation:

1. Install Node.js on the computer you're running the front-end on
1. Install Python >=3.10 so you can run a development server with fake data on the same computer
1. `git clone git@github.com:ANU-Rocketry/control-panel.git` and `cd control-panel`
1. In `control-panel/reactfront`, run `npm ci` to install dependencies for the React.js front end
1. In `control-panel/src`, run `pip install -r requirements.txt` to install server dependencies (this is so you can use your computer for a development server with fake data instead of a Raspberry Pi)

Then every time you want to run it:
1. In `reactfront` run `npm start` to launch the app on `http://localhost:3000/`
1. In `src` run `python server.py --dev` to start a development backend server generating fake data, and paste the IP address it prints out into the "R-Pi IP" field in the app

# Setting up a Raspberry Pi for the first time

You'll need a Raspberry Pi and your laptop, and some way of putting them on the same network. You can network with point-to-point ethernet or a hotspot + Linux compatible wifi dongle (don't need wifi dongle on newer Pi's). You cannot use ResNet as they block the ports we need.

Set-up takes about 20 minutes of supervised work, then several hours (~1 for RPi 4b, 4 for RPi 2b) of waiting in the final step where you build Python 3.10 from source, plus a quick command at the end.

1. Start up the Raspberry Pi and get internet access and a terminal
    * Option 1: If you have two ethernet cables and the router we use, plug the Pi into a LAN slot on the router, plug the external ethernet (eg ResNet) into the WAN slot, connect your laptop to the router's wifi, and SSH into `192.168.0.5`
    * Option 2: If you have a monitor, mouse, keyboard, and ethernet cable+port / wifi dongle / onboard wifi, you can just use those and open a terminal in the Raspbian desktop
    * Option 3: if you have a micro SD card reader and onboard wifi / a wifi dongle and a wifi network (hotspots are easy), you can configure it to connect to that wifi network by changing a config file on the SD card. See [this tutorial](https://www.raspberrypi-spy.co.uk/2017/04/manually-setting-up-pi-wifi-using-wpa_supplicant-conf/)
1. Open a terminal
    1. `sudo apt-get update && sudo apt-get install git screen python3-pip libusb-1.0-0 libusb-1.0-0-dev` (note the dashes where you'd expect periods to be in the libusb headers)
    1. `screen -S rocketry_session` (this opens a fresh terminal which you can close without stopping running processes, so your SSH window can be closed)
        1. If you need to leave and come back without stopping the process, press Ctrl+A then Ctrl+D and close the SSH session. When you get back, run `screen -r` to resume it.
1. Build the LabJack Exodrvier
    1. Clone the Exodriver repository (`git clone https://github.com/labjack/exodriver`)
    1. Run installation script (`cd exodriver && sudo ./install.sh && cd ~`)
1. Install this repository
    1. Clone this repository (`git clone https://github.com/ANU-Rocketry/control-panel`)
1. Configure startup script
    1. `sudo nano /etc/rc.local`
    1. Replace the contents with:
      ```sh
     #!/bin/sh -e
     sudo sh /home/pi/control-panel/startup.sh &
     exit 0
     ```
1. Set up static IP
    1. `sudo nano /etc/dhcpcd.conf` and paste this at the bottom:
      ```
      interface eth0
      static ip_address=192.168.0.5/24
      static routers=192.168.0.1
      static domain_name_servers=192.168.0.1
      ```
      Then it will have the IP `192.168.0.5`. This assumes the router has the IP `192.168.0.1`.
      
      If you need to use another ethernet connection you have two options: plug the outside network into the WAN port of the router you normally use, or connect directly and comment out these lines with `#` at the start of each line temporarily if you need to.
1. Set up `apcupsd` daemon to get UPS battery messages
    1. The Pi is plugged into a UPS to make it resistant to power cuts. This daemon lets us tell whether we're running on line power or UPS battery power so we can indicate this on the front-end. This only works if the Pi has a serial connection to the UPS using a USB-A to USB-B cable (labelled "PowerChute USB Port" on the UPS)
    1. `sudo apt-get install apcupsd`
    1. `sudo nano /etc/default/apcupsd` and change `no` to `yes`
    1. `sudo nano  /etc/apcupsd/apcupsd.conf` and set `UPSNAME rock-ups` (because it's an 8 char limit), `UPSCABLE usb`, `UPSTYPE usb`, `DEVICE` (without the `/dev/tty*` part so it searches all serial connections), `MINUTES 0` (avoid auto-shutdown)
    1. `sudo apcupsd restart` or `sudo /etc/init.d/apcupsd restart` or `sudo reboot` - whichever works
    1. Confirm `apcaccess status` comes up with a status other than `COMMLOST` (it should say `STATUS   : ONBATT` or `STATUS   : ONLINE`)
1. Run `ssh-copy-id pi@192.168.0.5` in a terminal on your laptop to copy your SSH key so you don't need a password when using `ssh pi@192.168.0.5`
1. **[This takes several hours!]** Install Python 3.10 from source (based off this: https://itheo.tech/installing-python-310-on-raspberry-pi)
    1. `wget -qO - https://raw.githubusercontent.com/tvdsluijs/sh-python-installer/main/python.sh | sudo bash -s 3.10.0` (this will take an hour for a new Pi and **3-4 hours** for an older one!)
        1. Once done, you can safely delete the `Python-XXX.tar.xz` and `Python-XXX` folders
    1. `sudo python3.10 -m pip install --upgrade pip && cd ~/control-panel/src && sudo python3.10 -m pip install -r requirements.txt`
        1. The sudo is VERY IMPORTANT. Otherwise the startup script will not be able to find the pip modules because they'll be locally installed otherwise

# Setting up the Pi at the testing site

Whenever the pi is turned on from now on, the startup script will automatically host the frontend on `http://192.168.0.5:3000` and the backend on `http://192.168.0.5:8888`. The backend will fail to run if the Pi is powered before the LabJack USBs are plugged in. If this happens, you can SSH into it and `sudo reboot` when it should be ready

Ground site:
* Plug all power cables into the UPS except the camera system, these don't need to be power-cut resilient
* Plug the test stand LabJack USBs into the Pi (don't power the Pi before the LabJacks otherwise you'll need to `sudo reboot` it later!)
* Plug the Pi into the UPS using a USB-A to USB-B cable (labelled "PowerChute USB Port" on the UPS)
* Network everything with the switch and Ubiquiti P2P wifi card

Range/control site:
* Plug the other Ubiquity into the router
    * The Ubiquity needs power over ethernet. Use the black POE to power outlet cable to power it, and plug the non-POE second ethernet cable into one of the router's LAN slots
* Connect to the wifi on your laptop using the password on the box and navigate to `http://192.168.0.5:3000`. Set `R-Pi IP` to `192.168.0.5` in the browser.

Sequences:
* The sequences are specified in the `src/sequences/sequence_name.py` files on the Pi server. Use SSH to edit them (if you've got internet, it's better to update the repo and pull the changes on the Pi).
* Sequences are written in a Python-like format where each line is a command from `src/commands.py` and the valve naming scheme is in `src/stands.py`. These are interpreted on the fly by the server in `src/server.py`'s `load_sequence` method.
* To load a sequence, enter the name in the popup window, like "operation" or "abort" (this is just the filename without the `.py`)

# How to debug

To run the processes manually so you can see their output, SSH in and `pkill python3.10`. Then just use `python3.10 server.py` in the `src` folder to run a WebSockets Python server on port 8888. If you want to test without LabJacks connected, you can get a simulated LabJack with sine wave pressure data by using `python3.10 server.py --dev`.

The front end is written using Node and React, but the version in the `build` folder is static and already built and just needs to be locally hosted. `python http.server` is one way of doing this, but there are others. When pushing front-end changes, make sure to run `npm run build` to make sure the static already built version is kept up to date. You'll also need to pull/`scp` the new version on the Pi.

For developing and debugging the front-end, you do need Node.js installed. To develop the front-end, you need nodejs. Run `npm ci` in the `reactfront` folder to install dependencies. Run `npm run build` to generate the `reactfront/build` folder which is what the Pi hosts on `http:192.168.0.5:3000`. To go into a local interactive debugging mode with hot reloading, run `npm start` and set `R-Pi IP` to `192.168.0.5` in the browser.

Whenever you make changes on your laptop, you need to copy them over to the Pi via `scp` (if you're on a test site on the same network without internet) or push to git and pull on the Pi (if the Pi has internet access).

To test the server locally, run `python3 server.py --dev` on your laptop. In the frontend, you'll need to change `R-Pi IP` to your local IP address. You should see simulated sine wave pressure data.

If you have any problems, just file a GitHub Issue, contact us on Microsoft Teams or email our student emails.

## Pushing new builds on the fly

### Front end
The startup script on the Pi runs a static server with `reactfront/build`, so you can update these files with `scp` and then reload the page to update the front end on any device:

```sh
# delete old build (on the raspberry pi!)
ssh pi@192.168.0.5
cd ~/control-panel/reactfront
rm -r build
logout

# scp over new build (on your machine!)
cd reactfront
npm run build
scp -r build pi@192.168.0.5:/home/pi/control-panel/reactfront
# Reload http://192.168.0.5:3000 in your browser
```

### Back end
This isn't automated yet but I want to move away from pulling the git on the Pi. 
Instead, I want to make a deploy script that allows you to push the latest version
of the code to the Pi on the fly. This is important as the Pi network is often
difficult to connect to the internet. There are other advantages too, like being
able to remove the build directory from the git repo.

This process can be done manually with SCP and kill + restart the server. The 
only problem is that the node modules folder is huge and takes a long time to
copy over (~5 mins). What I do currently is delete the node modules folder on
my machine and then copy it over to the Pi. You dont need internet to reinstall 
node modules, you just need to have the node modules cached on your machine. You
can also just copy the deleted modules folder back to your machine after scp.

I want to automate this process with a script that creates a tarball of the build
directory without the node modules folder, copies it over to the Pi, unzips it,
and then restarts the server. 

``sh
# Unofficial brew install of sshpass
brew install hudochenkov/sshpass/sshpass
``
```sh
# THIS IS UNTESTED will probably need to be tweaked but shows the general idea
# delete old build (on the raspberry pi!)
sshpass -p "raspberry" ssh pi@pi@192.168.0.5 "rm -rf ~/control-panel"

# Zip up the build folder without node modules
zip -r control-panel.zip .

# scp over new build (on your machine!)
sshpass -p "raspberry" scp -r control-panel.zip pi@192.168.0.5:/home/pi
sshpass -p "raspberry" ssh pi@192.168.0.5 "unzip control-panel.zip && rm control-panel.zip"

# Restart the server
sshpass -p "raspberry" ssh pi@192.168.0.5 "pkill python3.10 && cd ~/control-panel/ && chmod 700 startup.sh && sudo sh startup.sh &"
```




