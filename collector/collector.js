#!/usr/bin/env node

var Tail = require('tail').Tail,
  parser = require('./lib/parser'),
  os = require('os'),
  config = require('../config.json'),
  Server = require('./lib/server');


var Collector = function(serverHostname) {
  this.requests = [];
  this.servers = [new Server(os.hostname(), serverHostname)];
};

Collector.prototype.init = function() {
  var self = this;

  this.path = process.env.LOG_PATH || config.path || '/var/log/nginx/access.log';
  this.tail = new Tail(this.path);

  this.tail.on("line", function(data) {
    var req = parser(data);

    if (req.remote_addr && req.remote_addr.indexOf(' ') === -1 && req.host && req.host.indexOf(' ') === -1 && req.http_method && req.http_method.indexOf(' ') === -1 && req.status && req.remote_user) {
      self.requests.push(req);
    } else {
      console.log('Discarding request:');
      console.log(req);
    }
  });

  this.tail.on("error", function(error) {
    console.log('TAIL ERROR: ', error);
  });

  for (var i = 0; i < config.servers.length; i++) {
    var c = new Server(os.hostname(), config.servers[i]);
    self.servers.push(c);
  }

  setInterval(function() {
    var payload = {
      'info': {
        'load': os.loadavg(),
        'totalmem': os.totalmem(),
        'freemem': os.freemem(),
        'loadpercentage': parseInt((os.loadavg()[0] * 100) / os.cpus().length)
      },
      'requests': self.requests
    };

    for (var i = 0; i < self.servers.length; i++) {
      self.servers[i].send(payload);
    }
    self.requests = [];
  }, 1000);

  console.log('(collector) Started!');
  console.log('(collector) Watching log: ' + this.path);
};

module.exports = Collector;
