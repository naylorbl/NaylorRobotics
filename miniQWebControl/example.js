var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  var date = new Date();
  res.end('Thanks Dan\n\nDate = ' + date);
}).listen(1337);
console.log('Server running on port 1337/');
