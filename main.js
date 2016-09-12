var Station = require('./lib/station');
var Dashboard = require('./lib/dashboard');

var station = new Station(81);
station.init();

var dashboard = new Dashboard(8081, station);
dashboard.init();
