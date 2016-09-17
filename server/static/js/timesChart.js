var TimesChart = function(placeholder, opts) {
  this.graphSize = 150;
  this.interval = 1000;
  this.placeholder = placeholder;

  if (opts) {
    this.graphSize = opts.size || this.graphSize;
    this.interval = opts.interval || this.interval;
  }

  this.points = [{
    'name': 'Total',
    'color': '#CDD452',
    'data': []
  },{
    'name': 'Upstream',
    'color': '#F9722E',
    'data': []
  }];
};

TimesChart.prototype.clear = function() {
  for (var i = 0; i < this.points.length; i++) {
    this.points[i].data = [];
  }
};

TimesChart.prototype.init = function() {
  var self = this;

  this.graph = new Rickshaw.Graph({
    element: document.getElementById(self.placeholder),
    renderer: 'line',
    stroke: true,
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

TimesChart.prototype.draw = function() {
  var self = this;
  this.graph.configure({
    width: $('#' + self.placeholder).width(),
    height: $('#' + self.placeholder).height()
  });
  this.graph.render();
  this.xAxis.render();
  this.yAxis.render();
};

TimesChart.prototype.appendData = function(data) {
  this.formatData(data);
  this.draw();
};

TimesChart.prototype.formatData = function(data) {
  var d = new Date();

  var seconds = d.getTime() / 1000;
  if(this.points[0].data.length > 0 && seconds - this.points[0].data[this.points[0].data.length - 1].x > 30) {
    for (var i = 0; i < this.points.length; i++) {
      this.points[i].data = [];
    }
  }

  this.points[0].data.push({
    'x': parseInt(d.getTime() / 1000),
    'y': parseInt(data.requesttime || 0)
  });
  this.points[1].data.push({
    'x': parseInt(d.getTime() / 1000),
    'y': parseInt(data.upstreamtime || 0)
  });

  for (var i = 0; i < this.points.length; i++) {
    if (this.points[i].data.length > this.graphSize) {
      this.points[i].data.shift();
    }
  }
};
