#!/usr/bin/env node

var Station = require('./server/lib/station'),
  Dashboard = require('./server/lib/dashboard'),
  child_process = require('child_process');


function startServer(httpPort, collectorPort) {
  var station = new Station(collectorPort);
  station.init();

  var dashboard = new Dashboard(httpPort, station);
  dashboard.init();
}


function startCollector() {
  console.log('Spawning collector process.');
  var collectorProcess = child_process.fork(__dirname + '/collector/process');

  setTimeout(function() {
    collectorProcess.kill('SIGHUP');
    startCollector();
  }, 3600 * 1000);
}


var scenario = process.env.SCENARIO;

if (process.argv.length > 2) {
  scenario = process.argv[2];
} else {
  scenario = scenario || 'collector';
}

if (scenario === 'server') {
  console.log('(dashode2) Server scenario detected, starting server.');
  startServer(process.env.HTTP_PORT || 8081, process.env.COLLECTOR_PORT || 8080);
} else if (scenario === 'collector') {
  console.log('(dashode2) Collector scenario detected, starting collector.');
  startCollector();
} else {
  console.log('(dashode2) Default local scenario detected, starting server and collector.');
  startServer(process.env.HTTP_PORT || 8081, process.env.COLLECTOR_PORT || 8080);
  startCollector();
}
