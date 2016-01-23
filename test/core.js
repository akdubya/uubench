var uutest    = require('./uutest'),
    Bench   = require('../mini-bench');

function dumpError(err) {
  var out = err.testName + " -> ";
  if (!err.message) {
    err.message = JSON.stringify(err.expected)
      + " " + err.operator + " " + JSON.stringify(err.actual);
  }
  return out + err.stack;
}

var suite = new uutest.Suite({
  type      : "adaptive",
  iterations: 1,
  minTime   : 1,
  delay     : 0,
  timeout   : 1500,

  pass: function (type) {
    console.log('%s: passed', type);
  },
  fail: function (err) {
    console.log('%s: failed', err.testName);
  },
  done: function (passed, failed, elapsed) {
    console.log(passed + " passed " + failed + " failed " + "(" + elapsed + "ms)");
    this.errors.forEach(function (err) {
      console.log(dumpError(err));
    });
  }
});

suite.test("basic", function() {
  var unit = this;

  var suite = new Bench.Suite({
    done: function() {
      unit.pass();
    }
  });

  suite.bench("async", function(next) {
    setTimeout(function() {
      next();
    }, 20);
  });

  suite.bench("sync", function(next) {
    next();
  });

  suite.run();
});


suite.test("fixed", function() {
  var unit = this,
    iter;

  var suite = new Bench.Suite({
    type: "fixed",
    iterations: 100,

    result: function(name, stats) {
      iter = stats.iterations;
    },

    done: function() {
      try {
        unit.equals(iter, 100);
      } catch(e) {
        unit.fail(e);
        return;
      }
      unit.pass();
    }
  });

  suite.bench("sync", function(next) {
    next();
  });

  suite.run();
});


suite.test("async option", function() {
  var unit = this,
    names = '',
    section;

  var suite = new Bench.Suite({
    type: "fixed",
    iterations: 10,
    async: false,		// run in sync!

    result: function(name, stats) {
      names += name;
      iter = stats.iterations;
    },

    done: function() {
      try {
        unit.equals(section, 'section 1');
        unit.equals(names, 'step 1step 2');
      } catch(e) {
        unit.fail(e);
        return;
      }
      unit.pass();
    },

    section: function(name) {
      section = name;
    }
  });

  suite.section('section 1', function(next){
      next();
    })
    .bench("step 1", function(next) {
      setTimeout(next, 50);
    })
    .bench("step 2", function(next) {
      next();
    })
    .run();
});

suite.run();