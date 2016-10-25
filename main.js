var Station = require('./server/lib/station');
var Dashboard = require('./server/lib/dashboard');
var Collector = require('./collector/collector');


function startServer(httpPort, collectorPort) {
  var station = new Station(collectorPort);
  station.init();

  var dashboard = new Dashboard(httpPort, station);
  dashboard.init();
}

function startCollector(serverHostname) {
  var collector = new Collector(serverHostname);
  collector.init();
}


var scenario = process.env.SCENARIO;

if(process.argv.length > 2) {
  scenario = process.argv[2];
} else {
  scenario = scenario || 'collector';
}

if (scenario === 'server') {
  console.log('(dashode2) Server scenario detected, starting server.');
  startServer(process.env.HTTP_PORT || 8081, process.env.COLLECTOR_PORT || 8080);
} else if (scenario === 'collector') {
  console.log('(dashode2) Collector scenario detected, starting collector.');
  startCollector(process.env.SERVER || 'http://127.0.0.1:8080');
} else {
  console.log('(dashode2) Default local scenario detected, starting server and collector.');
  startServer(process.env.HTTP_PORT || 8081, process.env.COLLECTOR_PORT || 8080);
  startCollector(process.env.SERVER || 'http://127.0.0.1:8080');
}
