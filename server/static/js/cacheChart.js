var CacheChart = function(placeholder, opts) {
  this.graphSize = 150;
  this.interval = 1000;
  this.placeholder = placeholder;

  if (opts) {
    this.graphSize = opts.size || this.graphSize;
    this.interval = opts.interval || this.interval;
  }

  this.points = [{
    'name': 'Hit',
    'color': '#CDD452',
    'data': []
  }, {
    'name': 'Bypass',
    'color': '#FEE169',
    'data': []
  }, {
    'name': 'Miss',
    'color': '#F9722E',
    'data': []
  }, {
    'name': 'Expired',
    'color': '#C9313D',
    'data': []
  }, {
    'name': 'Internal',
    'color': '#68776C',
    'data': []
  }, {
    'name': 'Stale',
    'color': 'rgb(138, 92, 92)',
    'data': []
  }, {
    'name': 'Updating',
    'color': 'rgb(20, 140, 0)',
    'data': []
  }, {
    'name': 'Revalidated',
    'color': 'rgb(13, 87, 206)',
    'data': []
  }, {
    'name': 'Other',
    'color': 'rgb(41, 188, 197)',
    'data': []
  }];
};

CacheChart.prototype.clear = function() {
  for (var i = 0; i < this.points.length; i++) {
    this.points[i].data = [];
  }
};

CacheChart.prototype.init = function() {
  var self = this;

  this.graph = new Rickshaw.Graph({
    element: document.getElementById(self.placeholder),
    renderer: 'area',
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

  var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
    graph: self.graph,
    legend: legend
  });

  var order = new Rickshaw.Graph.Behavior.Series.Order({
    graph: self.graph,
    legend: legend
  });

  var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
    graph: self.graph,
    legend: legend
  });
};

CacheChart.prototype.draw = function() {
  var self = this;
  this.graph.configure({
    width: $('#' + self.placeholder).width(),
    height: $('#' + self.placeholder).height(),
    unstack: false
  });
  this.graph.render();
  this.xAxis.render();
  this.yAxis.render();
};

CacheChart.prototype.appendData = function(data) {
  this.formatData(data);
  this.draw();
};

CacheChart.prototype.formatData = function(data) {
  var d = new Date();

  var seconds = d.getTime() / 1000;
  if (this.points[0].data.length > 0 && seconds - this.points[0].data[this.points[0].data.length - 1].x > 30) {
    for (var i = 0; i < this.points.length; i++) {
      this.points[i].data = [];
    }
  }

  var codes = data.cache;

  var auxData = [{
    'x': parseInt(d.getTime() / 1000),
    'y': 0
  }, {
    'x': parseInt(d.getTime() / 1000),
    'y': 0
  }, {
    'x': parseInt(d.getTime() / 1000),
    'y': 0
  }, {
    'x': parseInt(d.getTime() / 1000),
    'y': 0
  }, {
    'x': parseInt(d.getTime() / 1000),
    'y': 0
  }, {
    'x': parseInt(d.getTime() / 1000),
    'y': 0
  }, {
    'x': parseInt(d.getTime() / 1000),
    'y': 0
  }, {
    'x': parseInt(d.getTime() / 1000),
    'y': 0
  }, {
    'x': parseInt(d.getTime() / 1000),
    'y': 0
  }];

  for (var property in codes) {
    if (codes.hasOwnProperty(property)) {
      var ps;
      switch (property) {
        case '-':
          ps = auxData[4];
          break;
        case 'HIT':
          ps = auxData[0];
          break;
        case 'BYPASS':
          ps = auxData[1];
          break;
        case 'EXPIRED':
          ps = auxData[3];
          break;
        case 'MISS':
          ps = auxData[2];
          break;
        case 'STALE':
          ps = auxData[5];
          break;
        case 'UPDATING':
          ps = auxData[6];
          break;
        case 'REVALIDATED':
          ps = auxData[7];
          break;
        default:
          ps = auxData[8];
          break;
      }

      ps.y = codes[property];
    }
  }

  for (var i = 0; i < this.points.length; i++) {
    this.points[i].data = this.points[i].data.concat(auxData[i]);

    if (this.points[i].data.length > this.graphSize) {
      this.points[i].data.shift();
    }
  }
};
