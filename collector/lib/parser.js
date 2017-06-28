//inspired by https://github.com/jfhbrook/node-clf-parser

var Parser = function() {

};

Parser.prototype.escape = function(d) {
  return d
    .replace('[', '\\[')
    .replace(']', '\\]');
};

Parser.prototype.getFields = function(line, callback) {
  var self = this;
  var parsed = {};

  [{
    'remote_addr': ' - '
  }, {
    'remote_user': ' ['
  }, {
    'time_local': '] "'
  }, {
    'request': '" '
  }, {
    'status': ' '
  }, {
    'body_bytes_sent': ' '
  }, {
    'host': ' "'
  }, {
    'http_user_agent': '" "'
  }, {
    'http_x_forwarded_for': '" "'
  }, {
    'http_referer': '" '
  }, {
    'cache': ' '
  }, {
    'request_time': ' '
  }, {
    'upstream_response_time': ' '
  }, {
    'scheme': ' '
  }].some(function(t) {
    var label = Object.keys(t)[0],
      delimiter = t[label],
      field;

    var m = line.match(self.escape(delimiter));

    if (m === null) {
      // No match. Try to pick off the last element.
      m = line.match(self.escape(delimiter.slice(0, 1)));

      if (m === null) {
        field = line;
      } else {
        field = line.substr(0, m.index);
      }

      parsed[label] = field;

      return true;
    }

    field = line.substr(0, m.index);
    line = line.substr(m.index + delimiter.length);

    parsed[label] = field.replace('"', '');
  });

  callback(parsed);
};


Parser.prototype.parseDate = function(str) {
  var m,
    month, day, year, hh, mm, ss, offset = {};

  // Day
  m = str.match('/');
  day = parseInt(str.substr(0, m.index), 10);
  str = str.substr(m.index + 1);

  // Month
  m = str.match('/');
  month = str.substr(0, m.index);
  str = str.substr(m.index + 1);

  month = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'
    .split(' ')
    .indexOf(month);

  // WHAT YEAR
  m = str.match(':');
  year = parseInt(str.substr(0, m.index), 10);
  str = str.substr(m.index + 1);

  // Hours
  m = str.match(':');
  hh = parseInt(str.substr(0, m.index), 10);
  str = str.substr(m.index + 1);

  // Minutes
  m = str.match(':');
  mm = parseInt(str.substr(0, m.index), 10);
  str = str.substr(m.index + 1);

  // Seconds
  m = str.match(' ');
  ss = parseInt(str.substr(0, m.index), 10);
  str = str.substr(m.index + 1);

  //
  // Time zone offsets
  //
  // TZ sign in standard string representations is REVERSED from sign in JavaScript:
  //
  //     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
  //
  // "Note that this means that the offset is positive if the local timezone is
  // behind UTC and negative if it is ahead.  For example, if your time zone
  // is UTC+10 (Australian Eastern Standard Time), -600 will be returned."
  //
  // See also:
  //
  //      http://stackoverflow.com/questions/1091372/getting-the-clients-timezone-in-javascript/1091399#1091399
  //

  offset.sign = str.substr(0, 1);
  offset.hh = parseInt(str.substr(1, 2), 10);
  offset.mm = parseInt(str.substr(3, 2), 10);

  switch (offset.sign) {
    case '+':
      offset.sign = -1;
      break;
    case '-':
      offset.sign = +1;
      break;
  }

  hh += offset.sign * offset.hh;
  mm += offset.sign * offset.mm;

  return new Date(Date.UTC(year, month, day, hh, mm, ss));
};


Parser.prototype.parse = function(line, callback) {
  var self = this;

  // Remove railing newline
  if (line.match(/\n$/)) {
    line = line.slice(0, line.length - 1);
  }

  this.getFields(line, function(parsed) {
    // Pull out as many fields as possible
    if (parsed.request) {
      var matches = parsed.request.match(/([A-Z]+)\s+(\S+)\s+([A-Z]+\/[\d\.]+)/);
      if (matches) {
        parsed.method = parsed.http_method = matches[1];
        parsed.path = matches[2];
        parsed.protocol = matches[3];
      }
    }

    // Deal with placeholders
    Object.keys(parsed).forEach(function(k) {
      if (parsed[k] === '-') {
        parsed[k] = null;
      }
    });

    // Parse the "local time" field into a javascript date object
    if (parsed.time_local && typeof parsed.time_local === 'string') {
      parsed.time_local = self.parseDate(parsed.time_local);
    }

    // Do some parseInts on known numerical fields
    if (parsed.status) {
      parsed.status = parseInt(parsed.status, 10);
    }
    if (parsed.body_bytes_sent) {
      parsed.body_bytes_sent = parseInt(parsed.body_bytes_sent, 10);
    }

    callback(parsed);
  });
};

module.exports = Parser;
