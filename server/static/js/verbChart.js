var VerbChart = function(placeholder, opts) {
  this.graphSize = 150;
  this.interval = 1000;
  this.placeholder = placeholder;

  if (opts) {
    this.graphSize = opts.size || this.graphSize;
    this.interval = opts.interval || this.interval;
  }

  this.points = [{
    'name': 'GET',
    'color': '#CDD452',
    'data': []
  }, {
    'name': 'POST',
    'color': '#FEE169',
    'data': []
  }, {
    'name': 'OPTIONS',
    'color': '#F9722E',
    'data': []
  }, {
    'name': 'DELETE',
    'color': '#C9313D',
    'data': []
  }, {
    'name': 'other',
    'color': '#68776C',
    'data': []
  }];
};

VerbChart.prototype.clear = function() {
  for (var i = 0; i < this.points.length; i++) {
    this.points[i].data = [];
  }
};

VerbChart.prototype.init = function() {
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

VerbChart.prototype.draw = function() {
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

VerbChart.prototype.appendData = function(data) {
  this.formatData(data);
  this.draw();
};

VerbChart.prototype.formatData = function(data) {
  var counter = 0;
  var d = new Date();

  var seconds = d.getTime() / 1000;
  if (this.points[0].data.length > 0 && seconds - this.points[0].data[this.points[0].data.length - 1].x > 30) {
    for (var i = 0; i < this.points.length; i++) {
      this.points[i].data = this.points[i].data = [];
    }
  }

  var codes = data.verbs;

  for (var property in codes) {
    if (codes.hasOwnProperty(property)) {
      this.points[counter].data.push({
        'x': parseInt(d.getTime() / 1000),
        'y': codes[property]
      });

      if (this.points[counter].data.length > this.graphSize) {
        this.points[counter].data.shift();
      }
      counter++;
    }
  }
};
