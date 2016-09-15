var Collector = function(hostname) {
  this.hostname = hostname;
  this.buffer = [];

  this.statisticsBuffer = {
    'codes': {
      '200': 0,
      '300': 0,
      '400': 0,
      '500': 0,
      'other': 0
    },
    'verbs': {
      'GET': 0,
      'POST': 0,
      'OPTIONS': 0,
      'DELETE': 0,
      'other': 0
    },
    'bandwidth': 0,
    'requests': 0
  };

  this.lastUpdate = undefined;

  this.cacheStatisticsBuffer = {};

  this.statistics = this.statisticsBuffer;
  this.cacheStatistics = this.cacheStatisticsBuffer;
};

Collector.prototype.process = function(requests) {
  this.buffer = this.buffer.concat(requests);

  for (var i = 0; i < requests.length; i++) {
    var req = requests[i];

    if (req.status >= 200 && req.status < 300) {
      this.statisticsBuffer.codes['200']++;
    } else if (req.status >= 300 && req.status < 400) {
      this.statisticsBuffer.codes['300']++;
    } else if (req.status >= 400 && req.status < 500) {
      this.statisticsBuffer.codes['400']++;
    } else if (req.status >= 500 && req.status < 600) {
      this.statisticsBuffer.codes['500']++;
    } else {
      this.statisticsBuffer.codes.other++;
    }

    if (req.http_method == 'GET') {
      this.statisticsBuffer.verbs.GET++;
    } else if (req.http_method == 'POST') {
      this.statisticsBuffer.verbs.POST++;
    } else if (req.http_method == 'OPTIONS') {
      this.statisticsBuffer.verbs.OPTIONS++;
    } else if (req.http_method == 'DELETE') {
      this.statisticsBuffer.verbs.DELETE++;
    } else {
      this.statisticsBuffer.verbs.other++;
    }

    if (req.body_bytes_sent) {
      this.statisticsBuffer.bandwidth += req.body_bytes_sent;
    }

    if (req.cache !== undefined) {
      if (req.cache === null) {
        req.cache = '-';
      }
      if (!this.cacheStatisticsBuffer[req.cache]) {
        this.cacheStatisticsBuffer[req.cache] = 1;
      } else {
        this.cacheStatisticsBuffer[req.cache]++;
      }
    }

    this.statisticsBuffer.requests++;
  }
};

Collector.prototype.clearBuffer = function() {
  this.buffer = [];

  this.statistics = this.statisticsBuffer;
  this.cacheStatistics = this.cacheStatisticsBuffer;

  this.statistics.bandwidth = this.statistics.bandwidth / 125000;

  if (this.lastUpdate) {
    var now = new Date().getTime() / 1000;
    this.statistics.requestspers = this.statistics.requests / (now - this.lastUpdate);
    this.statistics.bandwidthpers = this.statistics.bandwidth / (now - this.lastUpdate);
  } else {
    this.statistics.requestspers = 0;
    this.statistics.bandwidthpers = 0;
  }

  this.lastUpdate = new Date().getTime() / 1000;

  this.statisticsBuffer = {
    'codes': {
      '200': 0,
      '300': 0,
      '400': 0,
      '500': 0,
      'other': 0
    },
    'verbs': {
      'GET': 0,
      'POST': 0,
      'OPTIONS': 0,
      'DELETE': 0,
      'other': 0
    },
    'bandwidth': 0,
    'requests': 0
  };

  this.cacheStatisticsBuffer = {};
};

Collector.prototype.errors = function() {
  return this.statistics.codes['400'] + this.statistics.codes['500'] + this.statistics.codes.other;
};

Collector.prototype.appendData = function(dest, orig) {
  if (!dest) {
    dest = {};
  }
  var keys = Object.keys(orig);
  for (var i = 0; i < keys.length; i++) {
    if (dest[keys[i]] === undefined) {
      dest[keys[i]] = orig[keys[i]];
    } else {
      dest[keys[i]] += orig[keys[i]];
    }
  }

  return dest;
};

Collector.prototype.appendStatistics = function(dest, orig) {
  if (!dest) {
    dest = {
      'codes': {},
      'verbs': {},
      'bandwidth': 0,
      'requests': 0,
      'bandwidthpers': 0,
      'requestspers': 0
    };
  }
  if (!orig) {
    return dest;
  }

  dest.codes = this.appendData(dest.codes, orig.codes);
  dest.verbs = this.appendData(dest.verbs, orig.verbs);

  dest.bandwidth += orig.bandwidth;
  dest.requests += orig.requests;
  dest.bandwidthpers += orig.bandwidthpers;
  dest.requestspers += orig.requestspers;

  return dest;
};

module.exports = Collector;
