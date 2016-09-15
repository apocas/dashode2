var BandwidthChart = function(placeholder, opts) {
  this.graphSize = 150;
  this.interval = 1000;
  this.placeholder = placeholder;

  if (opts) {
    this.graphSize = opts.size || this.graphSize;
    this.interval = opts.interval || this.interval;
  }

  this.points = [{
    'name': 'MB',
    'color': '#CDD452',
    'data': []
  }];
};

BandwidthChart.prototype.clear = function() {
  for (var i = 0; i < this.points.length; i++) {
    this.points[i].data = [];
  }
};

BandwidthChart.prototype.init = function() {
  var self = this;

  this.graph = new Rickshaw.Graph({
    element: document.getElementById(self.placeholder),
    renderer: 'line',
    series: self.points
  });

  this.xAxis = new Rickshaw.Graph.Axis.Time({
    graph: self.graph,
    ticksTreatment: 'glow'
  });

  this.yAxis = new Rickshaw.Graph.Axis.Y({
    graph: self.graph,
    tickFormat: function(y) {
      var abs_y = Math.abs(y);
      if (abs_y === 0) {
        return '';
      } else {
        return y;
      }
    },
    ticks: 5,
    ticksTreatment: 'glow'
  });

  var legend = new Rickshaw.Graph.Legend({
    graph: self.graph,
    element: document.getElementById(self.placeholder + 'Legend')
  });

  var hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: self.graph
  });
};

BandwidthChart.prototype.draw = function() {
  var self = this;
  this.graph.configure({
    width: $('#' + self.placeholder).width(),
    height: $('#' + self.placeholder).height()
  });
  this.graph.render();
  this.xAxis.render();
  this.yAxis.render();
};

BandwidthChart.prototype.appendData = function(data) {
  this.formatData(data);
  this.draw();
};

BandwidthChart.prototype.formatData = function(data) {
  var d = new Date();

  var seconds = d.getTime() / 1000;
  if(this.points[0].data.length > 0 && seconds - this.points[0].data[this.points[0].data.length - 1].x > 30) {
    this.points[0].data = [];
  }

  this.points[0].data.push({
    'x': parseInt(d.getTime() / 1000),
    'y': parseInt(data.bandwidth)
  });

  if (this.points[0].data.length > this.graphSize) {
    this.points[0].data.shift();
  }
};
