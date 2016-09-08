var GaugesChart = function(opts) {
  this.graphSize = 150;
  this.interval = 1000;

  if (opts) {
    this.graphSize = opts.size || this.graphSize;
    this.interval = opts.interval || this.interval;
  }

  this.gauges = {};
};

GaugesChart.prototype.init = function() {
  var self = this;

  this.gauges.requests = this.createGauge('requestsGauge', 'Req/s', 0, 50);
  this.gauges.bw = this.createGauge('bwGauge', 'MBps', 0, 1, true);
  this.gauges.errors = this.createGauge('errorsGauge', 'Error %', 0, 100);

  this.lastUpdate = new Date().getTime() / 1000;
};

GaugesChart.prototype.createGauge = function(container, label, min, max, decimalc) {
  var self = this;

  var config = {
    size: self.graphSize,
    label: label,
    min: undefined != min ? min : 0,
    max: undefined != max ? max : 100,
    minorTicks: 5,
    decimal: decimalc
  };

  var range = config.max - config.min;
  config.yellowZones = [{
    from: config.min + range * 0.75,
    to: config.min + range * 0.9
  }];
  config.redZones = [{
    from: config.min + range * 0.9,
    to: config.max
  }];

  var g = new Gauge(container, config);
  g.render();
  return g;
};

GaugesChart.prototype.draw = function() {
  this.gauges.bw.redraw();
  this.gauges.requests.redraw();
  this.gauges.errors.redraw();
};

GaugesChart.prototype.appendData = function(data) {
  this.formatData(data);
  this.draw();
};

GaugesChart.prototype.formatData = function(data) {
  var counter = 0;
  var totalBW = data.bandwidth;
  var errors = data.codes['400'] + data.codes['500'] + data.codes.other;

  totalBW = totalBW / 125000;
  errors = parseInt((errors / data.requests) * 100);

  if (isNaN(errors)) {
    errors = 0;
  }

  this.gauges.errors.data = errors;
  var now = new Date().getTime() / 1000;

  var valueBW = parseInt(totalBW / (now - this.lastUpdate));
  if (this.gauges.bw.config.max < valueBW) {
    this.gauges.bw = this.createGauge('bwGauge', 'MBps', 0, valueBW + 1, true);
  }
  this.gauges.bw.data = valueBW;

  var valueReqs = parseInt(data.requests / (now - this.lastUpdate));
  if (this.gauges.requests.config.max < valueReqs) {
    this.gauges.requests = this.createGauge('requestsGauge', 'Req/s', 0, valueReqs);
  }
  this.gauges.requests.data = valueReqs;

  this.lastUpdate = now;
};
