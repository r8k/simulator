simulator
=========
1. Simulator accepts User Profiles
  * Profiles can contain:
    * Rate per kWh
    * Average Consumption of the Person, per Day
    * Hourly Consumption Weight, over 24 Hours

2. Simulator will populate Consumption Data using
  * a Random Date
  * Hourly Consumption Weight, from the profile
  * Average Consumption of the Person, per Day

3. Simulator will also calculate the Current Price
  * using the Consumption data, that is populated above
  * using the Rate per kWh, from the profile

4. Simulator will generate data for
  * different Streams:
    * CurrentSummationDelivered
    * CurrentSummationReceived
    * InstantaneousDemand
  
  * different descriptions
    * Real-Time Demand
    * Billing Stream
  
  * different meters
    * SEP/1.x, teds
    * Electricity, Gas
  
  * different connection status
    * 0, 1
  
  * different signal strength

## How to Test
    $ // with mocha installed ( npm install -g mocha )
    $ userid=6e6aaa75-xxxx-xxxx-xxxx-xxxxxxxxx mocha // your userid here

## Using it, programmatically
```js
// File: test.js

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
// pass the userid from command-line:
// userid=6e6aaa75-xxxx-xxxx-xxxx-xxxxxxxxx node test.js
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
```