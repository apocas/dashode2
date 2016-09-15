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

if (scenario === 'local') {
  console.log('(dashode2) Local scenario detected, starting server and collector.');
  startServer(8081, 8080);
  startCollector('http://127.0.0.1:8080');
} else if (scenario === 'server') {
  console.log('(dashode2) Server scenario detected, starting server.');
  startServer(process.env.HTTP_PORT, process.env.COLLECTOR_PORT);
} else if (scenario === 'collector') {
  console.log('(dashode2) Collector scenario detected, starting collector.');
  startCollector(process.env.SERVER);
} else {
  console.log('(dashode2) Unknown scenario.');
}
