var net = require('net'),
  crypto = require('crypto'),
  async = require('async'),
  Server = require('./server'),
  util = require('util'),
  express = require('express');

var Station = function(port) {
  this.topHostnamesBuffer = {};
  this.topHostnames = [];
  this.collectors = {};

  this.topErrors = undefined;
  this.topRequests = undefined;

  this.algorithm = 'aes-256-ctr';
  this.password = process.env.PASSWORD;
};

Station.prototype.init = function() {
  var self = this;

  this.server = net.createServer(function(socket) {
    console.log('Collector connected');

    var buffer = '';

    socket.on('error', function() {
      console.log('Collector errored');
    });

    socket.on('end', function() {
      console.log('Collector disconnected');
    });

    socket.on('data', function(received) {
      buffer += received.toString('utf8');

      var index = buffer.indexOf('\n');

      if (index >= 0) {
        self.process(buffer.slice(0, index));

        if (index < buffer.length) {
          buffer = buffer.slice(index + 1, buffer.length);
        }
      }
    });
  });

  setInterval(function() {
    self.calculate();
  }, 2000);

  setInterval(function() {
    self.calculateTop();
  }, 10000);

  this.server.listen(80, function() {
    console.log('Central is now listening.');
  });
};

Station.prototype.calculate = function() {
  var self = this;
  var keys = Object.keys(this.collectors);

  for (var i = 0; i < keys.length; i++) {
    if (!this.topErrors || this.collectors[keys[i]].errors() > this.collectors[this.topErrors].errors()) {
      this.topErrors = this.collectors[keys[i]].hostname;
    }

    if (!this.topRequests || this.collectors[keys[i]].buffer.length > this.collectors[this.topRequests].buffer.length) {
      this.topRequests = this.collectors[keys[i]].hostname;
    }
  }

  self.clearBuffers();
};

Station.prototype.calculateTop = function() {
  var self = this;
  self.sortTop(function(err, top) {
    self.topHostnames = top;
    self.topHostnamesBuffer = {};
  });
};

Station.prototype.sortTop = function(mcallback) {
  var self = this;
  var sites = Object.keys(this.topHostnamesBuffer);
  async.sortBy(sites, function(site, callback) {
    callback(undefined, self.topHostnamesBuffer[site] * -1);
  }, function(err, results) {
    mcallback(err, results.slice(0, 10));
  });
};

Station.prototype.clearBuffers = function() {
  var keys = Object.keys(this.collectors);
  for (var i = 0; i < keys.length; i++) {
    this.collectors[keys[i]].clearBuffer();
  }
};

Station.prototype.process = function(packet) {
  var self = this;
  var hostname = packet.slice(0, packet.indexOf('#'));
  var rawData = packet.slice(packet.indexOf('#') + 1, packet.length);

  //console.log(hostname);
  //console.log(rawData);

  var payload = {};
  try {
    payload = JSON.parse(rawData);
  } catch (error1) {
    try {
      payload = JSON.parse(self.decrypt(rawData));
    } catch (error2) {
      console.log(packet);
      console.log('Invalid packet.');
      return;
    }
  }

  for (var i = 0; i < payload.requests.length; i++) {
    var req = payload.requests[i];
    if (req.http_referer) {
      var domain = req.http_referer.replace('www.', '').replace(/"/g, '');
      if (this.topHostnamesBuffer[domain] === undefined) {
        this.topHostnamesBuffer[domain] = 0;
      } else {
        this.topHostnamesBuffer[domain]++;
      }
    }
  }

  if (this.collectors[hostname] === undefined) {
    console.log('New hostname found: ' + hostname);
    this.collectors[hostname] = new Server(hostname);
  }
  this.collectors[hostname].process(payload.requests);
};

Station.prototype.decrypt = function(text) {
  var decipher = crypto.createDecipher(this.algorithm, this.password);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

module.exports = Station;
