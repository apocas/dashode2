 var net = require('net'),
   request = require('request');

 var Server = function(hostname, serverHostname) {
   this.hostname = hostname;
   this.serverHostname = serverHostname;
 };

 Server.prototype.send = function(data) {
   var self = this;
   console.log(data);
   request.post({
     'url': self.serverHostname + '/stats/' + self.hostname + '/push',
     'json': data
   }, function(error, response, body) {
     if(error) {
       console.log('Error while dispatching log entry: ' + error);
     }
   });
 };

 module.exports = Server;
