
/**
 * author : Rajiv Kilaparti
 * email  : kilapartirajiv@gmail.com
 *
 * description :
 * this module is used for simulating
 * energy consumption data, which is
 * pushed to bidgely api via POST.
 */


/**
 * JsHint Options
 */

/* jshint strict: true */
/* jshint unused: true */
/* jshint laxcomma: true */
/* jshint -W053 */
/* jshint -W014 */
/* jshint -W010 */
/* global require, module */


/**
 * `Module` Dependencies
 */
var util = require('util')
  , http = require('http')
  , asrt = require('assert')
  , random = require('./random');


/**
 * internal variables to be used later
 */
var meterProtocol = ['SEP/1.x', 'teds']
  , streamTypes   = ['CurrentSummationDelivered', 'CurrentSummationReceived', 'InstantaneousDemand']
  , description   = ['Billing Stream', 'Real-Time Demand'];


/**
 * Simulator
 * 
 * @param {Object} opts   Options
 *
 * @api public
 */
var Simulator = function(opts) {
  "use strict";
  this.user   = opts.user;
  this.host   = opts.host || 'api.bidgely.com';
  this.home   = opts.home || '1';

  this.proto   = opts.proto || 'http';
  this.bucket  = 0;
  this.profile = opts.profile;
  this.gateway = opts.gateway || '1';
  this.ufmpath = '/v1/users/%s/homes/%s/gateways/%s/upload';

  asrt(this.user, '.userid required');
  asrt(this.profile, '.profile required');
  
  this.hour = this.getWeights();
  this.path = util.format(this.ufmpath, this.user, this.home, this.gateway);
  this.opts = {
    host: this.host,
    port: this.proto === 'http' ? 80 : 443,
    path: this.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml'
    }
  };
};


/**
 * Expose `Simulator`
 * 
 * @type {CommonJs}
 */
module.exports = Simulator;


/**
 * concat given arguments into
 * a single String() Object ..
 * 
 * @api private
 */
Simulator.prototype.concat = function() {
  "use strict";
  var args = Array.prototype.slice.call(arguments)
    , data = new String(), k;

  while ((k = args.shift())) {
    data = data.concat(k);
  }

  return data;
};


/**
 * get hours from a date object
 * 
 * @api private
 */
Simulator.prototype.getWeights = function() {
  "use strict";
  var results = new Object()
    , min, max, range;

  for (var key in this.profile.hour) {
    range = key.split('-');
    min = parseInt(range.shift());
    max = parseInt(range.shift());
    
    for(var i = min; i <= max; i++) {
      results[i] = (this.profile.summ * this.profile.hour[key] / 100);
    }
  } return results;
};


/**
 * get hours from a date object
 * 
 * @api private
 */
Simulator.prototype.getHours = function(date) {
  "use strict";
  return (new Date(parseInt(date + '000'))).getHours().toString();
};


/**
 * get hours from a date object
 * 
 * @api private
 */
Simulator.prototype.getHourReading = function(hour) {
  "use strict";
  return (this.hour[hour] / 60).toFixed(4);
};


/**
 * returns energy consumption data
 * 
 * @api private
 */
Simulator.prototype.getMeterData = function() {
  "use strict";
  var data = '<data time="%s" value="%s"/>'
    , date = random.date()
    , read = this.getHourReading(this.getHours(date));
  
  this.bucket += parseFloat(read);
  return util.format(data, date, read);
};


/**
 * returns a stream object
 * 
 * @param  type    streamTypes
 * @param  units   kW, Joule
 * 
 * @api private
 */
Simulator.prototype.getStream = function(type, units) {
  "use strict";
  var header = '<stream id="%s" unit="%s" description="%s">'
    , footer = '</stream>', data = new String();

  for (var i = 0; i < random.number(10, 30); i++) {
    data += this.getMeterData();
  }

  header = util.format(header, random.array(type),
    random.array(units), random.array(description));

  return this.concat(header, data, footer);
};


/**
 * returns streams for streamTypes
 * 
 * @param  units   kW, Joule
 * @api private
 */
Simulator.prototype.getStreams = function(units) {
  "use strict";
  var header = '<streams>', footer = '</streams>'
    , data   = new String(), self = this;

  streamTypes.forEach(function(k) {
    data += self.getStream([k], units);
  });

  return this.concat(header, data, footer);
};


/**
 * returns attribute nodes
 * 
 * @api private
 */
Simulator.prototype.getAttributes = function() {
  "use strict";
  var header = '<attributes>', footer = '</attributes>'
    , prices = '<attribute id="CurrentPrice" currency="USD" time="%s">%s</attribute>'
    , status = '<attribute id="ConnectionStatus" time="%s">%s</attribute>'
    , signal = '<attribute id="SignalStrength" time="%s">%s</attribute>';

  prices = util.format(prices, random.date(), (this.bucket * this.profile.rate).toFixed(2));
  status = util.format(status, random.date(), random.array([0, 1]));
  signal = util.format(signal, random.date(), random.number());

  this.bucket = 0;
  return this.concat(header, prices, status, signal, footer);
};


/**
 * returns a meter data
 * 
 * @param  type   meteringType
 * @api private
 */
Simulator.prototype.getMeter = function(type) {
  "use strict";
  var td = {
    '2': 'Electricity Meter',
    '50': 'Gas Meter'
  }, header = '<meter id="%s" model="%s" type="%s" description="%s">'
  , footer = '</meter>', streams, attributes, messages
  , tu = {'2': 'kW', '50': 'Joule'};

  streams    = this.getStreams([tu[type]]);
  attributes = this.getAttributes();
  messages   = '<messages />';

  header = util.format(header, random.id(), random.array(meterProtocol), type, td[type]);
  
  return this.concat(header, streams, attributes, messages, footer);
};


/**
 * returns meters data, for electricity & gas
 * 
 * @api private
 */
Simulator.prototype.getMeterUsage = function() {
  "use strict";
  var data   = new String()
    , header = '<upload version="1.0"><meters>'
    , footer = '</meters></upload>';

  data += this.getMeter('2');
  data += this.getMeter('50');

  return this.concat(header, data, footer);
};


/**
 * uploads meter's data, for user
 *
 * @param  fn   callback
 * @api public
 */
Simulator.prototype.upload = function(fn) {
  "use strict";
  var data   = this.getMeterUsage().toString()
    , body = new String();

  var request = http.request(this.opts, function(resp) {
    resp.on('data', function (chunk) {
      body += chunk;
    });

    resp.on('end', function () {
      fn(null, resp, body, data);
    });
  });

  request.on('error', function(err) {
    fn(err, null, body, data);
  });

  request.end(data);
};




