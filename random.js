
/**
 * author : Rajiv Kilaparti
 * email  : kilapartirajiv@gmail.com
 *
 * description :
 * this module is used for generating
 * random objects via helper methods.
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
/* global module */


/**
 * Random Object Generator
 * with multiple helper methods.
 * 
 * @api private
 */
var random = {
  /**
   * Give a Random Integer
   * 
   * @param  min   minimum number to start
   * @param  max    maximum number to end
   * 
   * @return {Number}
   * @api public
   */
  number: function (min, max) {
    "use strict";
    return ~~ (Math.random() * (max || 100)) + (min || 0);
  },

  /**
   * Give a Random Date, in milliseconds epoch
   *
   * @param  range   to substringify
   * 
   * @return {Date}
   * @api public
   */
  date: function(range) {
    "use strict";
    var date = (new Date()).getTime();
    date -= this.number() * 3600 * 1000 * this.number(0, 24);

    return date.toString().substring(0, range || 10);
  },

  /**
   * Give a Random Item from a given List
   * 
   * @return {Object}
   * @api public
   */
  array: function(items) {
    "use strict";
    return items[~~ (Math.random() * items.length)];
  },

  /**
   * Give a Random ID
   * format: 39:44:78:83:89:99:44:16
   * 
   * @return {id}
   * @api public
   */
  id: function() {
    "use strict";
    var i = '' + this.number();

    for (var j = 0; j < 7; j++) {
      i = i + ':' + this.number();
    }

    return i;
  }
};


/**
 * Expose `Random`
 * 
 * @type {CommonJs}
 */
module.exports = random;