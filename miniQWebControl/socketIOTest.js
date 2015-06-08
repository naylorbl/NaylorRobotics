var app = require("http").createServer(handler)
var io = require("socket.io")(app);

var fs = require("fs");
var mraa = require("mraa"); // require mraa
console.log("MRAA Version: " + mraa.getVersion());

// Setup the existing Arduino Edison LED as an output.
var myOnboardLed = new mraa.Gpio(13);
myOnboardLed.dir(mraa.DIR_OUT); // set the gpio direction to output

// Setup for I2C communication.
var i2c = new mraa.I2c(0)
i2c.address(0x04)

// helper function to go from hex val to dec
function char(x) { return parseInt(x, 16); }

app.listen(8080);

function handler(req, res) {
  fs.readFile(__dirname + "/index.html", function(err, data) {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading index.html");
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on("connection", function(socket) {
  socket.emit("greeting", {
    message : "You are now connected.  -- server"
  });
  socket.on("btn-control", function(data) {
    console.log(data);
    if (data.msg === "On") {
      myOnboardLed.write(1);
      socket.emit("real-btn", {
        message : "You want the LED on.  I hear you.  -- server"
      });
    } else if (data.msg === "Off") {
      myOnboardLed.write(0);
      socket.emit("real-btn", {
        message : "You want the LED OFF.  I hear you.  -- server"
      });
    } else if (data.msg === "Hello") {
      socket.emit("real-btn", {
        message : "Hello back.  -- server"
      });
    } else if (data.msg === "Forward") {
      socket.emit("real-btn", {
        message : "You want to go Forward.  I hear you.  -- server"
      });
       i2c.writeByte(
          char("0x7e")); // Start byte
       i2c.writeByte(
          char("0x04")); // Length
       i2c.writeByte(
          char("0x00")); // Command for DrivePwm
       i2c.writeByte(
          char("0x03")); // Both motors are forward
       i2c.writeByte(
          char("0xc8")); // Left duty cycle is 200 / 255
       i2c.writeByte(
          char("0xc8")); // Right duty cycle is 200 / 255
       i2c.writeByte(
          char("0x6d")); // Manually calculate crc 0+3+200+200 = 403 (147) --> crc = 109
    } else if (data.msg === "Stop") {
      socket.emit("real-btn", {
        message : "You want to stop.  I hear you.  -- server"
      });
       i2c.writeByte(
          char("0x7e")); // Start byte
       i2c.writeByte(
          char("0x04")); // Length
       i2c.writeByte(
          char("0x00")); // Command for DrivePwm
       i2c.writeByte(
          char("0x03")); // Both motors are forward (sure)
       i2c.writeByte(
          char("0x00")); // Left duty cycle is 0 / 255
       i2c.writeByte(
          char("0x00")); // Right duty cycle is 0 / 255
       i2c.writeByte(
          char("0xfd"));  // Manually calculate crc 0+3+0+0 = 3 --> crc = 253
    } else if (data.msg === "Reverse") {
      socket.emit("real-btn", {
        message : "You want to go in Reverse.  I hear you.  -- server"
      });
       i2c.writeByte(
          char("0x7e")); // Start byte
       i2c.writeByte(
          char("0x04")); // Length
       i2c.writeByte(
          char("0x00")); // Command for DrivePwm
       i2c.writeByte(
          char("0x00")); // Both motors are forward
       i2c.writeByte(
          char("0xc8")); // Left duty cycle is 200 / 255
       i2c.writeByte(
          char("0xc8")); // Right duty cycle is 200 / 255
       i2c.writeByte(char("0x70")); // Manually calculate crc 0+0+200+200 = 400 (144) --> crc = 112
    }else if (data.msg === "Left") {
        socket.emit("real-btn", {
            message : "You want to go in Reverse.  I hear you.  -- server"
          });
           i2c.writeByte(
              char("0x7e")); // Start byte
           i2c.writeByte(
              char("0x04")); // Length
           i2c.writeByte(
              char("0x00")); // Command for DrivePwm
           i2c.writeByte(
              char("0x01")); // right motor forward, left reverse
           i2c.writeByte(
              char("0x32")); // Left duty cycle is 50 / 255
           i2c.writeByte(
              char("0x32")); // Right duty cycle is 50 / 255
           i2c.writeByte(char("0x9b")); // Manually calculate crc 0+1+50+50 = 101 --> crc = 155
    }else if (data.msg === "Right") {
        socket.emit("real-btn", {
            message : "You want to go in Reverse.  I hear you.  -- server"
          });
           i2c.writeByte(
              char("0x7e")); // Start byte
           i2c.writeByte(
              char("0x04")); // Length
           i2c.writeByte(
              char("0x00")); // Command for DrivePwm
           i2c.writeByte(
              char("0x02")); // left motor forward, right reverse
           i2c.writeByte(
              char("0x32")); // Left duty cycle is 200 / 255
           i2c.writeByte(
              char("0x32")); // Right duty cycle is 200 / 255
           i2c.writeByte(char("0x9a")); // Manually calculate crc 0+2+50+50 = 102) --> crc = 154
        }
  });
});
