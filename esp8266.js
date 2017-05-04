var StepperMotor = require("StepperMotor");
var wifi = require('Wifi');
var WebServer = require('WebServer');
wifi.connect("$WIFI_SSID", {password:"$WIFI_PASSWORD"});
wifi.on("connected", function() {
  console.log("Wifi connected", wifi.getIP());
  require("http").createServer(onPageRequest).listen(80);
});
var motor = new StepperMotor({
  pins:[NodeMCU.D1,NodeMCU.D2,NodeMCU.D3,NodeMCU.D4],
  stepsPerSec : 100
});
function onPageRequest(req, res) {
  var a = url.parse(req.url, true);
  if (a.query && a.query.move) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><body>');
    res.write('<h1>Motor Controller</h1>');
    var movePos = motor.getPosition()+parseInt(a.query.move,10);
    res.write('<p>Motor will move to new position:'+movePos+'</p>');
    res.write('<p>Motor speed:'+motor.stepsPerSec+'</p>');
    motor.moveTo(movePos);
    res.write('<a href="?move=100">right+100</a><br/><a href="?move=-100">left+100</a><br/>');
    res.write('<a href="?speed=50">speed+100</a><br/><a href="?speed=-50">speed-50</a><br/>');
    res.write('<a href="?stop=true">Stop</a>');
    res.end('</body></html>');
  } else if (a.query && a.query.stop) {
    motor.stop();
     res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><body>');
    res.write('<h1>Motor Controller</h1>');
    res.write('<em>Motor stopped</em>');
    res.write('<p>Motor position:'+motor.getPosition()+'</p>');
    res.write('<p>Motor speed:'+motor.stepsPerSec+'</p>');
    res.write('<a href="?move=100">right+100</a><br/><a href="?move=-100">left+100</a><br/>');
    res.write('<a href="?speed=50">speed+50</a><br/><a href="?speed=-50">speed-50</a><br/>');
    res.write('<a href="?stop=true">Stop</a>');
    res.end('</body></html>');
  } else if (a.query && a.query.speed) {
    motor.stepsPerSec += parseInt(a.query.speed);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><body>');
    res.write('<h1>Motor Controller</h1>');
    res.write('<em>Motor changed speed</em>');
    res.write('<p>Motor position:'+motor.getPosition()+'</p>');
    res.write('<p>Motor speed:'+motor.stepsPerSec+'</p>');
    res.write('<a href="?move=100">right+100</a><br/><a href="?move=-100">left+100</a><br/>');
    res.write('<a href="?speed=50">speed+50</a><br/><a href="?speed=-50">speed-50</a><br/>');
    res.write('<a href="?stop=true">Stop</a>');
    res.end('</body></html>');
  }
  else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><body>');
    res.write('<h1>Motor Controller</h1>');
    res.write('<p>Motor position:'+motor.getPosition()+'</p>');
    res.write('<p>Motor speed:'+motor.stepsPerSec+'</p>');
    res.write('<a href="?move=100">right+100</a><br/><a href="?move=-100">left+100</a><br/>');
    res.write('<a href="?speed=50">speed+50</a><br/><a href="?speed=-50">speed-50</a><br/>');
    res.write('<a href="?stop=true">Stop</a>');
    res.end('</body></html>');
  }
}