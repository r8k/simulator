
/**
 * author : Rajiv Kilaparti
 * email  : kilapartirajiv@gmail.com
 *
 * description :
 * this module is used for testing
 * the simulator module ..
 */


/**
 * JsHint Options
 */

/* jshint strict: true */
/* jshint laxcomma: true */
/* jshint -W053 */
/* jshint -W014 */
/* jshint -W010 */
/* global require, process, console */


/**
 * `Module` Dependencies
 */
var util = require('util')
  , Simulator = require('./simulator');


/**
 * internal variables
 */
var INFO = '\033[42m\x1B[1m INFO \x1B[22m\033[49m '
  , ERRR = '\033[41m\x1B[1m ERRR \x1B[22m\033[49m ';


/**
 * Parse a given Cookie
 * 
 * @param  cookie
 * @param  key
 * 
 * @api private
 */
var cparse = function (cookie, key, seperator) {
  "use strict";
  seperator = typeof seperator == 'undefined' ? ';' : seperator;
  return cookie.split(seperator).map(function (pair) {
    return pair.trim().split('=');
  }).reduce(function (a, b) {
    a[b[0]] = b[1];
    return a;
  }, {})[key];
};


/**
 * test our simulator here ..
 * 
 * @type {Simulator}
 */
var simulator = new Simulator({
  user: process.env.userid,
  profile: {
    summ: 200,
    rate: 0.15,
    hour: {
      '00-05': 10,
      '06-08': 30,
      '09-10': 20,
      '11-14': 05,
      '15-18': 10,
      '19-23': 25
    }
  }
});


/**
 * upload data to the gateway ..
 */
simulator.upload(function(err, res, body, input) {
  "use strict";
  if (!(err) && res.statusCode === 200) {
    var sessionid = cparse(res.headers['set-cookie'].join(';'), 'JSESSIONID');

    console.log(INFO + util.format('Upload Status: %s', res.statusCode));
    console.log(INFO + util.format('Successfully uploaded data with sessionid: %s', sessionid));
  } else {
    console.log(ERRR + util.format('Upload Status: %s', res.statusCode));
    console.log(ERRR + util.format('Error: %s', body));
  }
});