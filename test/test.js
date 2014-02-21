
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

/* jshint laxcomma: true */
/* jshint -W053 */
/* jshint -W014 */
/* jshint -W010 */
/* jshint -W115 */
/* global require, describe, it, beforeEach */


/**
 * `Module` Dependencies
 */
var Simulator = require('../simulator');


/**
 * test our simulator here ..
 * 
 * @type {Simulator}
 */
describe("Simulator", function() {
  var simulator;
  
  beforeEach(function() {
    simulator = new Simulator({
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
  });

  it("should upload consumption data", function(done) {
    // disable timeout
    this.timeout(0); // since http test case
    
    simulator.upload(function(err, res, body, input) {
      // check for status code
      res.should.have.status(200);
      res.headers.should.have.property('set-cookie');
      
      done();
    });
  });

});

