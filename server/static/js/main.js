var maxPoints = 150;
var hostname = 'all';

var codeChart;
var cacheChart;
var verbChart;
var bandwidthChart;
var gaugesChart;
var timesChart;

$(window).resize(function() {
  location.reload();
});

$(document).ready(function() {
  var h = window.innerHeight;
  var w = window.innerWidth;

  h = h - $('#footer').height();

  var rw = h / $('#content2').children().length;
  var aux = w * 0.15;
  if (rw > aux) {
    rw = aux;
  }
  rw++;

  codeChart = new CodeChart('codeHolder', {
    'size': maxPoints
  });
  cacheChart = new CacheChart('cacheHolder', {
    'size': maxPoints
  });
  verbChart = new VerbChart('verbHolder', {
    'size': maxPoints
  });
  bandwidthChart = new BandwidthChart('bwHolder', {
    'size': maxPoints
  });
  timesChart = new TimesChart('timesHolder', {
    'size': maxPoints
  });
  gaugesChart = new GaugesChart({
    'size': rw
  });

  $('#content1').css('width', w - rw - 20);
  $('#content2').css('width', rw);

  $('#codeContainer').css('height', h / 5);
  $('#verbContainer').css('height', h / 5);
  $('#bwContainer').css('height', h / 5);
  $('#cacheContainer').css('height', h / 5);
  $('#timesContainer').css('height', h / 5);

  init(rw * 1.1);
});

function clearCharts() {
  codeChart.clear();
  cacheChart.clear();
  verbChart.clear();
  bandwidthChart.clear();
  timesChart.clear();
}

function init(rw) {
  var data = [];
  var hostnames = [];

  codeChart.init();
  cacheChart.init();
  verbChart.init();
  bandwidthChart.init();
  timesChart.init();
  gaugesChart.init();

  $("#hostname").change(function() {
    hostname = $(this).val().toLowerCase();
  });

  setInterval(function() {
    $.get('/stats/' + hostname, function(data) {
      codeChart.appendData(data.statistics);
      verbChart.appendData(data.statistics);
      bandwidthChart.appendData(data.statistics);
      timesChart.appendData(data.statistics);
      gaugesChart.appendData(data.statistics);
      populateHostname(data.hostnames);
      cacheChart.appendData(data);

      //console.log(data.cache);
      //console.log(data.statistics);

      var out = '<br><b>Top error:</b><br>' + data.top.error + '<br><br><b>Top Server:</b><br>' + data.top.requests + '<br><br><b>Top Domains:</b><br>';
      for (var i = 0; i < data.top.sites.length; i++) {
        out += (i + 1) + ' - ' + data.top.sites[i] + '<br>';
      }
      $('#containerG5').html(out);
    });
  }, 2000);

  function populateHostname(hosts) {
    var options = $("#hostname");
    for (var i = 0; i < hosts.length; i++) {
      if (hostnames.indexOf(hosts[i]) < 0) {
        hostnames.push(hosts[i]);
        options.append($("<option />").val(hosts[i]).text(hosts[i]));
      }
    }
  }
}
