# IoT_blinds
This is [Digital Fabrication Technology](http://dai.fmph.uniba.sk/courses/dtv/index.php/DTV) course project for Comenius University course at Faculty of Mathematics, Physics and Informatics in Bratislava, Slovakia.
## What
As course project we aim to develop Blind Controller which will be controlled via Wi-Fi. This device should be able to control and adjust brightness settings of the blinds on windows.
## Why
Because why not? Humans are for the origins of big bang a lazy bunch. So why not develop something to help them be more lazy?
On more serious note: This project will enable us to learn 3d printing techniques, explore electronic world and touch some light software programming. And this project will be really useful for fablab.sk
## How to
In this chapter we provide quick overview how we were able to create IoT Blind Controller.
### 3d parts
List of all 3D printed parts:
1. Connector adapter
  this part is used between Stepper Motor and Blind Brightness Stick Controller - [link](https://github.com/andynet/IoT_blinds/blob/master/servo_2_zaluzie1.1.stl)  
  ![Connector Adapter](https://github.com/andynet/IoT_blinds/blob/master/servo_2_zaluzie1.1.stl "Connector Adapter")  


2. Main box
Box to cover all electronics and stepper motor - [link](https://github.com/andynet/IoT_blinds/blob/master/servo_2_zaluzie1.1.stl)  
  ![Connector Adapter](https://github.com/andynet/IoT_blinds/blob/master/servo_2_zaluzie1.1.stl "Connector Adapter")

### Electronics
List of needed electronics for this project:
1. ESP8266 - [eBay link](http://www.ebay.com/itm/1-2-5-10PCS-ESP8266-ESP-12E-Wireless-Remote-Serial-WIFI-Transceiver-Board-Module-/191981905297?var=&hash=item2cb3036591:m:m32tG5UYU4U1RfD8dfjf8Uw)
2. 5v Stepper Motor + Stepper Motor Controller [GME link](https://www.gme.sk/krokovy-motor-driver)
4. DC 2 DC Step-Down Module - [rlx.sk link](http://rlx.sk/en/power-supply-control-boards/2119-lm2596-dc-dc-buck-converter-step-down-power-module-output-125v-35v.html?search_query=step+down&results=1239)

### ESP8266 Firmware
For the firmware used on EP8266 chip we have choosen [Espruino](http://www.espruino.com/). This firmware provides javascript runtime. We will use this to controll the stepper motor

#### How to flash the firmware.
More information about Espruino and ESP8266 can be found [here](http://www.espruino.com/EspruinoESP8266).

To get into flash mode you need to pull-up gpio2, and pull down gpio0 and gpio15. Afterwards to run the flashed firware you need to pull-up gpio0 and gpio2, and pull down gpio15 (i.e. gpio0 changes). Use anything from 4.7Kohm to 10Kohm for pull-ups, and about 1Kohm-3.3Kohm for pull-downs.

Connect your FTDI's TX to the esp's RX and FTDI RX to esp's TX. Latest news show that esp8266 is 5v tolerant. 

The flashing needs to perform the following functions:

flash the bootloader (this is a second stage bootloader that runs after the ROM bootloader)
flash the Espruino firmware
clear the SDK's settings
clear the SDK's hardware config
configure the correct SPI flash parameters (few tools do this)

It is highly recommended to use [esptool.py](https://github.com/espressif/esptool) because it performs the last step correctly. 

Download it from github, and run it as follows using the files from the Espruino download tgz. Here you need to know what size flash chip you have, if you guess wrong Espruino will tell you at boot time and things will work until you try to save or upgrade, so you can make a best guess and then tray again later to fix it.

For a 4MByte flash chip (e.g. esp-12): [FIXME: need to get radio init and check addresses]
```
$ /path/to/esptool/esptool.py --port /dev/ttyUSB0 --baud 115200 \
  write_flash --flash_freq 80m --flash_mode qio --flash_size 32m \
  0x0000 "boot_v1.6.bin" 0x1000 espruino_esp8266_user1.bin \
  0x3FC000 esp_init_data_default.bin 0x3FE000 blank.bin
```
More information about flashing can be found on Espruino tutorial: http://www.espruino.com/ESP8266_Flashing

### Software
This script is rather simple, upon connecting to the Wi-Fi network, it will run a simple web server. Motor is controlled by sending HTTP GET query request to this server. For example `?move=10000` will rotate motor to position 10000. So forth with the `?speed=` option which controls the rotating speed of motor. Our tests had shown that maximum speed possible for this model is around 400.
With this options provided by ESP8266 we can controll all kind of blinds because the parameters of rolling can be configured.
```javascript
var StepperMotor = require("StepperMotor");
var wifi = require('Wifi');
var WebServer = require('WebServer');
wifi.connect("fablab.sk", {password:"fablabfoundation"});
wifi.on("connected", function() {
  console.log("Wifi connected", wifi.getIP());
  require("http").createServer(onPageRequest).listen(80);
});
var motor = new StepperMotor({
  pins:[D5,D12,D13,D14],
  stepsPerSec : 100
});
function onPageRequest(req, res) {
  var a = url.parse(req.url, true);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html><body>');
  res.write('<h1>Motor Controller</h1>');
  if (a.query && a.query.move) {
    var movePos = motor.getPosition()+parseInt(a.query.move,10);
    motor.moveTo(movePos);
    res.write('<p>Motor will move to new position:'+movePos+'</p>');
  } else if (a.query && a.query.stop) {
    motor.stop();
    res.write('<em>Motor stopped</em>');
  } else if (a.query && a.query.speed) {
    motor.stepsPerSec += parseInt(a.query.speed);
    res.write('<em>Motor changed speed</em>');
  }
  res.write('<p>Motor position:'+motor.getPosition()+'</p>');
  res.write('<p>Motor speed:'+motor.stepsPerSec+'</p>');
  res.write('<a href="?move=100">right+100</a><br/><a href="?move=-100">left+100</a><br/>');
  res.write('<a href="?speed=50">speed+50</a><br/><a href="?speed=-50">speed-50</a><br/>');
  res.write('<a href="?stop=true">Stop</a>');
  res.end('</body></html>');
}
```
### Wiring it up

