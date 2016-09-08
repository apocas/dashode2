var express = require('express');

var Dashboard = function(port, station) {
  this.station = station;
  
  this.port = port;
  this.app = express();
  this.app.use(express.static(__dirname + '/../static'));

  this.httpServer = require('http').Server(this.app);
};

Dashboard.prototype.init = function() {
  var self = this;

  this.httpServer.listen(this.port);
  console.log('Dashboard listening on port ' + this.port);

  this.app.get('/stats/:hostname', function(req, res) {
    var keys = Object.keys(self.station.collectors);

    var hostname = req.params.hostname;
    if (hostname === 'all') {
      hostname = undefined;
    }
    var outputStats;
    var outputCacheStats;

    for (var i = 0; i < keys.length; i++) {
      var server = self.station.collectors[keys[i]];
      if (hostname === keys[i] || hostname === undefined) {
        outputStats = server.appendStatistics(outputStats, server.statistics);
        outputCacheStats = server.appendData(outputCacheStats, server.cacheStatistics);
      }
    }

    res.json({
      'statistics': outputStats,
      'hostnames': keys,
      'top': {
        'error': self.station.topErrors,
        'requests': self.station.topRequests,
        'sites': self.station.topHostnames
      },
      'cache': outputCacheStats,
      'date': new Date().getTime()
    });
  });
};

module.exports = Dashboard;
