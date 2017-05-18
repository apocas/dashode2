#!/usr/bin/env node

var Tail = require('tail').Tail,
  parser = require('./lib/parser'),
  os = require('os'),
  config = require('../config.json'),
  Server = require('./lib/server'),
  SDC = require('statsd-client');

var STATSD = process.env.STATSD;

var Collector = function() {
  this.requests = [];
  this.servers = [];

  if (STATSD) {
    console.log('Connecting to statsd instance: ' + STATSD);
    this.statsd = new SDC({
      host: STATSD
    });
  }
};

Collector.prototype.counter = function(key, sub, value) {
  this.statsd.counter(key + '.' + process.env.STATSD_DOMAIN + '.' + sub, value);
  if (process.env.STATSD_SUBDOMAIN) {
    this.statsd.counter(key + '.' + process.env.STATSD_SUBDOMAIN + '.' + sub, value);
  }
};

Collector.prototype.timing = function(key, sub, value) {
  this.statsd.timing(key + '.' + process.env.STATSD_DOMAIN + '.' + sub, value);
  if (process.env.STATSD_SUBDOMAIN) {
    this.statsd.timing(key + '.' + process.env.STATSD_SUBDOMAIN + '.' + sub, value);
  }
};

Collector.prototype.init = function() {
  var self = this;

  this.path = process.env.LOG_PATH || config.path || '/var/log/nginx/access.log';
  this.tail = new Tail(this.path);

  this.tail.on('line', function(data) {
    var req = parser(data);

    if (self.isValid(req)) {
      self.processDashode(req);
      if (self.statsd) {
        self.processStatsd(req);
      }
    } else {
      console.log('Discarding request:');
      console.log(req);
      if (self.statsd) {
        self.counter('http', 'parser.nok', 1);
      }
    }
  });

  this.tail.on('error', function(error) {
    console.log('TAIL ERROR: ', error);
  });

  this.loadDashode();

  console.log('(collector) Started!');
  console.log('(collector) Watching log: ' + this.path);
};


Collector.prototype.isValid = function(req) {
  if (!req.remote_addr || req.remote_addr.indexOf(' ') !== -1 || !req.host || req.host.indexOf(' ') !== -1 || !req.http_method || req.http_method.indexOf(' ') !== -1 || !req.status || !req.remote_user) {
    return false;
  }

  if (req.cache && req.cache !== null && /\d/.test(req.cache)) {
    return false;
  }

  if (/\d/.test(req.http_method)) {
    return false;
  }

  return true;
};


Collector.prototype.processStatsd = function(req) {
  //this.statsd.counter('http.requests.' + req.host.replace('www.', '').replace(/"/g, '').replace(/\./g, '_'), 1);
  this.counter('http', 'requests', 1);

  if (req.status >= 200 && req.status < 300) {
    this.counter('http', 'codes.2xx', 1);
  } else if (req.status >= 300 && req.status < 400) {
    this.counter('http', 'codes.3xx', 1);
  } else if (req.status >= 400 && req.status < 500) {
    this.counter('http', 'codes.4xx', 1);
  } else if (req.status >= 500 && req.status < 600) {
    this.counter('http', 'codes.5xx', 1);
  } else {
    this.counter('http', 'codes.xxx', 1);
  }

  if (req.http_method == 'GET') {
    this.counter('http', 'verbs.get', 1);
  } else if (req.http_method == 'POST') {
    this.counter('http', 'verbs.post', 1);
  } else if (req.http_method == 'OPTIONS') {
    this.counter('http', 'verbs.options', 1);
  } else if (req.http_method == 'DELETE') {
    this.counter('http', 'verbs.delete', 1);
  } else {
    this.counter('http', 'verbs.other', 1);
  }

  if (req.body_bytes_sent) {
    this.counter('http', 'protocol.bytes', req.body_bytes_sent);
  }

  if (req.request_time !== undefined && req.request_time !== null) {
    this.timing('http', 'protocol.requesttime', parseFloat(req.request_time));
  }
  if (req.upstream_response_time !== undefined && req.upstream_response_time !== null) {
    this.timing('http', 'protocol.upstreamtime', parseFloat(req.upstream_response_time));
  }

  if (req.cache !== undefined) {
    if (req.cache === null || req.cache.indexOf('-') >= 0) {
      req.cache = '-';
    }
    this.counter('http', 'cache.' + req.cache, 1);
  }
};


Collector.prototype.loadDashode = function() {
  var self = this;

  if (process.env.SERVER) {
    this.servers.push(new Server(os.hostname(), process.env.SERVER));
  }
  for (var i = 0; i < config.servers.length; i++) {
    var c = new Server(os.hostname(), config.servers[i]);
    this.servers.push(c);
  }

  if (this.servers.length > 0) {
    setInterval(function() {
      var payload = {
        'info': {
          'freemem': os.freemem(),
          'load': parseInt((os.loadavg()[0] * 100) / os.cpus().length)
        },
        'requests': self.requests
      };

      for (var i = 0; i < self.servers.length; i++) {
        self.servers[i].send(payload);
      }
      self.requests = [];
    }, 1000);
  }
};


Collector.prototype.processDashode = function(req) {
  this.requests.push(req);
};


module.exports = Collector;
