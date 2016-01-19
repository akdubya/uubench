/*!
 mini-bench

 Copyright (c) 2016, Moos (fork)
 http://github.com/moos/mini-bench

 Original copyright notice:

 uubench - Async Benchmarking v0.0.1
 http://github.com/akdubya/uubench

 Copyright (c) 2010, Aleksander Williams
 Released under the MIT License.
*/

;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.MiniBench = factory();
  }

}(this, function () {

  var Bench = {};

  Bench.defaults = {
    type      : "adaptive", // adaptive or fixed
    iterations: 10,         // starting iterations
    minTime   : 100,        // minimum run time (ms) - adaptive only
    delay     : 100,        // delay between tests (ms)
    async     : true		    // set to false to run benches in sync mode
  };

  /**
   * single test class
   *
   * @param id
   * @param test
   * @param options
   * @param callback
   * @constructor
   */
  function Test(id, test, options, callback) {
    this.id = id;
    this.options = options;
    this.test = test;
    this.loop = test.length > 1;
    this.callback = callback;
  }

  Test.prototype.run = function(iter, startTime) {
    var self = this,
      fn = self.test,
      type = self.options.type,
      checkfn = type === "adaptive" ? adaptive : fixed,
      i = type === "section" ? 1 : iter,
      pend = i,
      minTime = self.options.minTime,
      start = startTime || new Date();

    if (self.loop) {
      pend = 1;
      fn(checkfn, i);
    } else {
      while (i--) {
        fn(checkfn);
      }
    }

    function fixed() {
      if (--pend === 0) {
        var elapsed = new Date() - start;
        self.callback({iterations: iter, elapsed: elapsed});
      }
    }

    function adaptive() {
      if (--pend === 0) {
        var elapsed = new Date() - start;

        if (elapsed < minTime) {
          var nextIter = 10 * iter;  // incremental increase in next iteration
          if (elapsed > 0) nextIter = Math.floor(iter * minTime / elapsed * 0.9);

          self.run(nextIter, start);  // preserve original start time
        } else {
          self.callback({iterations: iter, elapsed: elapsed});
        }
      }
    }
  };


  /**
   * Suite class
   *
   * @param opts {object} - any options in Bench.defaults
   * @constructor
   */
  function Suite(opts) {
    for (var key in Bench.defaults) {
      if (opts[key] === undefined) {
        opts[key] = Bench.defaults[key];
      }
    }
    this.options = opts;
    this.tests = [];
  }

  Suite.prototype.bench = function(name, fn) {
    var self = this;
    self.tests.push(new Test(name, fn, this.options, function(stats) {
      self.emit("result", name, stats);
      self.check();
    }));
    return this;
  };

  // a section is a non-bench step performed in order
  Suite.prototype.section = function(name, fn) {
    var self = this;
    self.tests.push(new Test(name, fn, {type:"section"}, function(stats) {
      self.emit("section", name, stats);
      self.check();
    }));
    return this;
  };

  Suite.prototype.run = function() {
    if (this.pending) return;
    var self = this,
      len = self.tests.length;

    self.emit("start", self.tests);
    self.start = new Date().getTime();
    self.pending = len;

    if (!this.options.async) {
      self.runOne();
    } else {
      while (len--) self.runOne();
    }
  };

  Suite.prototype.runOne = function() {
    var self = this;
    setTimeout(function() {
      (self.tests.shift()).run(self.options.iterations);
    }, self.options.delay);
  };

  Suite.prototype.check = function() {
    if (--this.pending) {
      !this.options.async && this.runOne();
      return;
    }
    this.emit("done", new Date().getTime() - this.start);
  };

  Suite.prototype.emit = function(type) {
    var event = this.options[type];
    if (event) {
      event.apply(this, Array.prototype.slice.call(arguments, 1));
    }
  };


  // exports
  Bench.Test = Test;
  Bench.Suite = Suite;

  return Bench;

}));


