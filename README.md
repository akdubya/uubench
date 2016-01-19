mini-bench
=======

[![NPM version](https://img.shields.io/npm/v/mini-bench.svg)](https://www.npmjs.com/package/mini-bench)
[![Build Status](https://img.shields.io/travis/moos/mini-bench/master.svg)](https://travis-ci.org/moos/mini-bench)

> A tiny asynchronous JavaScript benchmarking library

mini-bench provides a simple harness for measuring the execution time of JavaScript code. Design your experiments, analyze the numbers and present the data as you see fit.

Features:

* small (< 200 LOC)
* asynchronous, evented operation
* **fixed** as well as _adaptive_ test cycles used in [benchmark](https://github.com/bestiejs/benchmark.js) 
* easy to use/understand 

**Note**: mini-bench is an up-to-date fork of [uubench](https://github.com/akdubya/uubench).


Synopsis
--------

Set up a benchmark suite:

```js
    var Bench = require('mini-bench');
    
    var suite = new Bench.Suite({
      start: function() {
        console.log("starting...");
      },
      result: function(name, stats) {
        console.log(name + ": " + stats.iterations/stats.elapsed);
      },
      done: function() {
        console.log("finished");
      },
      section: function(name) {
        console.log("Section: " + name);
      }
    });
```    

Add some benchmarks:

```js
    suite.bench("async", function(next) {
      myAsyncFunc(function() {
        next();
      });
    });

    suite.bench("sync", function(next) {
      mySyncFunc();
      next();
    });
```

Run the suite:

```js
    suite.run();
```

Installation
------------

Via npm:

    $ npm install mini-bench

In Node:

    var Bench = require('mini-bench');

In the browser (exposed as `MiniBench`):

    <script src="mini-bench.js"></script>

Guide
-----

By design, mini-bench doesn't come with extras. Instead, you use the low-level API to build your own unique benchmark suites.

### Defaults

mini-bench ships with the following defaults that apply to every test suite:

```js
    Bench.defaults = {
      type:       "adaptive", // adaptive or fixed
      iterations: 10,         // starting iterations
      minTime:    100,        // minimum run time (ms) - adaptive only
      delay:      100,        // delay between tests (ms)
      async:      true        // run benches in async mode (all at once)
    }
```

You may override these globally or per-suite. Read on to find out what each option does.

### Fixed test cycles

By default mini-bench uses adaptive test cycles to allow reasonable execution time across different environments. To use fixed cycles instead, set the `type` to "fixed":

```js
    var suite = new Bench.Suite({
      type: "fixed",
      iterations: 1000, // run each benchmark exactly 1000 times
      ...
    });
```

### Setting the minimum runtime

mini-bench defaults to a minimum run time of 100ms in adaptive mode. To adjust this run time:

```js
    var suite = new Bench.Suite({
      minTime: 1000, // each benchmark should run for at least 1000ms
      ...
    });
```

### Starting iterations

In adaptive mode it is sometimes useful to bump up the starting iterations to reach the minimum runtime faster:

```js
    var suite = new Bench.Suite({
      iterations: 1000, // run each benchmark a minimum of 1000 times
      ...
    });
```

### Setting the benchmark delay

mini-bench imposes a 100ms delay between benchmarks to give any UI elements that might be present time to update. This delay can be tweaked:

```js
    var suite = new Bench.Suite({
      delay: 500, // 500ms delay between benchmarks
      ...
    });
```

### Disabling auto-looping

To manually loop within a given benchmark, add a second argument to the benchmark's argument list. mini-bench will then automatically disable auto-looping:

```js
    suite.bench("foo", function(next, count) {
      while (count--) {
        ...
      }
      next();
    });
```

### Multiple runs

To collect benchmark data over multiple runs, simply rerun the suite on completion:

```js
    var suite = new Bench.Suite({
      ...
      done: function() {
        if (--runCounter) {
          console.log("I'm finished!");
        } else {
          suite.run();
        }
      }
    });
```

Beware of relying on multiple in-process runs to establish statistical relevance. Better data can be obtained by completely re-running your test scripts.

### Running in sync mode

A suite may have multiple benchmarks.  To run benchmarks one-at-a-time in the order they were added, set `async` option to false.

```js
    var suite = new Bench.Suite({
      async: false, // run benches in sync mode (one at a time in order)
      ...
    });
```


### Section markers

Longer suites that have multiple benches may use the `section()` method.  A section is run in order (when sync option is true) and can be used to visually group benches and optionally modify parameters.

```js
    suite.section("foo section", function(next) {
      suite.options.iterations = 1;
      next();
    })
    .bench("foo1", function(next) {
      ...
      next();
    })
    .bench("foo2", function(next) {
      ...
      next();
    });

    suite.section("bar section", function(next) {
      // change iterations going forward
      suite.options.iterations = 10;
      next();
    })
    .bench("bar", function(next) {
      ...
      next();
    });
```

A section emits a "section" event.

### Chaining

As of v0.0.2 `bench()` and `section()` are _chainable_.  This allows for easier grouping and enabling/disabling of groups.

```js
    suite.section('sec 1')
      .bench()
      .bench()
      ...

    suite.section('sec 2')
      .bench()
      .bench()
      ...

    suite.run();
```

or

```js
    suite.bench().bench().run();
```


### Stats

Rather than imposing a limited statistical model on benchmark data, mini-bench gives you the raw numbers. If you want to go nuts with the math have a look at [this gist](http://gist.github.com/642690).

### Loop calibration

In most cases auto looping doesn't add enough overhead to benchmark times to be worth worrying about, but extremely fast benchmarks can suffer. Add a calibration test if you want to correct for this overhead:

```js
    suite.bench("calibrate", function(next) {
      next();
    });
```

You can then subtract the elapsed time of the "calibrate" test from other tests in the suite.

Examples
--------

* Dust browser benchmarks: <https://github.com/akdubya/dustjs/blob/master/benchmark/index.html>
* Dust node benchmarks: <http://github.com/akdubya/dustjs/blob/master/benchmark/server.js>


## Change log

v1.0 (Breaking change)
- `min` option changed to `minTime`
- `sync` option changed to `async` (default: true)
- added UMD module loader
- renamed and published to npm as [mini-bench](https://npmjs.org/package/mini-bench)

v0.0.2 (start of moos fork)
- added `sync` option to run tests in sync mode (default: false)
- added `section` method to group similar tests, fires "section" event.
- added chaining 


About
-----

mini-bench is a fork of [uubench](https://github.com/akdubya/uubench).

uubench was inspired by the venerable [jslitmus](http://github.com/broofa/jslitmus)


License
-------
MIT 