var net = require('net'),
  crypto = require('crypto'),
  async = require('async'),
  Collector = require('./collector'),
  util = require('util'),
  express = require('express'),
  bodyParser = require('body-parser');

var Station = function(port) {
  this.port = port;
  this.app = express();
  this.app.use(bodyParser.json());
  this.app.use(function(err, req, res, next) {
    console.log(err);
    res.status(500).end();
  });

  this.httpServer = require('http').Server(this.app);

  this.topHostnamesBuffer = {};
  this.topHostnames = [];
  this.collectors = {};

  this.topErrors = undefined;
  this.topRequests = undefined;
};

Station.prototype.init = function() {
  var self = this;

  this.httpServer.listen(this.port);
  console.log('(server) Collector server listening on port ' + this.port);

  this.app.post('/stats/:hostname/push', function(req, res) {
    var hostname = req.params.hostname;
    self.process(hostname, req.body);
    res.end();
  });

  setInterval(function() {
    self.calculate();
  }, 2000);

  setInterval(function() {
    self.calculateTop();
  }, 10000);
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

Station.prototype.process = function(hostname, packet) {
  var self = this;
  var payload = packet;

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
    console.log('(server) New collector found: ' + hostname);
    this.collectors[hostname] = new Collector(hostname);
  }
  this.collectors[hostname].process(payload.requests);
};

module.exports = Station;
