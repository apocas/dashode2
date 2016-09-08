var Station = require('./lib/station');
var Dashboard = require('./lib/dashboard');

var station = new Station(8080);
station.init();

var dashboard = new Dashboard(80);
dashboard.init();
