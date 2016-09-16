 var net = require('net'),
   request = require('request');

 var Server = function(hostname, serverHostname) {
   this.hostname = hostname;
   this.serverHostname = serverHostname;

   console.log('(collector) Dispatching to ' + serverHostname);
 };

 Server.prototype.send = function(data) {
   var self = this;
   //console.log(data);

   var opts = {
     'url': self.serverHostname + '/stats/' + self.hostname + '/push',
     'json': data
   };

   if (process.env.PASSWORD && process.env.USERNAME) {
     opts.auth = {
       'user': process.env.USERNAME,
       'pass': process.env.PASSWORD
     };
   }

   request.post(opts, function(error, response, body) {
     if (error) {
       console.log('Error while dispatching log entry: ' + error);
     }
   });
 };

 module.exports = Server;
