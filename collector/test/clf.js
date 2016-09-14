var Tail = require('tail').Tail,
  parser = require('../lib/parser');

var tail = new Tail('/var/log/nginx/access.log');

tail.on("line", function(data) {
  var req = parser(data);
  console.log(req);
});

tail.on("error", function(error) {
  console.log('TAIL ERROR: ', error);
});
