/**
 * EventEmitter v3.1.4
 * https://github.com/Wolfy87/EventEmitter
 *
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * Oliver Caldwell (olivercaldwell.co.uk)
 */

(function(exports) {
  // JSHint config
  /*global define:true*/

  // Place the script into strict mode
  'use strict';

  /**
   * EventEmitter class
   * Creates an object with event registering and firing methods
   */
  function EventEmitter() {
    // Initialise required storage variables
    this._events = {};
    this._maxListeners = 10;
  }

  /**
   * Event class
   * Contains Event methods and property storage
   *
   * @param {String} type Event type name
   * @param {Function} listener Function to be called when the event is fired
   * @param {Object} scope Object that this should be set to when the listener is called
   * @param {Boolean} once If true then the listener will be removed after the first call
   * @param {Object} instance The parent EventEmitter instance
   */
  function Event(type, listener, scope, once, instance) {
    // Store arguments
    this.type = type;
    this.listener = listener;
    this.scope = scope;
    this.once = once;
    this.instance = instance;
  }

  /**
   * Executes the listener
   *
   * @param {Array} args List of arguments to pass to the listener
   * @return {Boolean} If false then it was a once event
   */
  Event.prototype.fire = function(args) {
    this.listener.apply(this.scope || this.instance, args);

    // Remove the listener if this is a once only listener
    if(this.once) {
      this.instance.removeListener(this.type, this.listener, this.scope);
      return false;
    }
  };

  /**
   * Passes every listener for a specified event to a function one at a time
   *
   * @param {String} type Event type name
   * @param {Function} callback Function to pass each listener to
   * @return {Object} The current EventEmitter instance to allow chaining
   */
  EventEmitter.prototype.eachListener = function(type, callback) {
    // Initialise variables
    var i = null,
      possibleListeners = null,
      result = null;

    // Only loop if the type exists
    if(this._events.hasOwnProperty(type)) {
      possibleListeners = this._events[type];

      for(i = 0; i < possibleListeners.length; i += 1) {
        result = callback.call(this, possibleListeners[i], i);

        if(result === false) {
          i -= 1;
        }
        else if(result === true) {
          break;
        }
      }
    }

    // Return the instance to allow chaining
    return this;
  };

  /**
   * Adds an event listener for the specified event
   *
   * @param {String} type Event type name
   * @param {Function} listener Function to be called when the event is fired
   * @param {Object} scope Object that this should be set to when the listener is called
   * @param {Boolean} once If true then the listener will be removed after the first call
   * @return {Object} The current EventEmitter instance to allow chaining
   */
  EventEmitter.prototype.addListener = function(type, listener, scope, once) {
    // Create the listener array if it does not exist yet
    if(!this._events.hasOwnProperty(type)) {
      this._events[type] = [];
    }

    // Push the new event to the array
    this._events[type].push(new Event(type, listener, scope, once, this));

    // Emit the new listener event
    this.emit('newListener', type, listener, scope, once);

    // Check if we have exceeded the maxListener count
    // Ignore this check if the count is 0
    // Also don't check if we have already fired a warning
    if(this._maxListeners && !this._events[type].warned && this._events[type].length > this._maxListeners) {
      // The max listener count has been exceeded!
      // Warn via the console if it exists
      if(typeof console !== 'undefined') {
        console.warn('Possible EventEmitter memory leak detected. ' + this._events[type].length + ' listeners added. Use emitter.setMaxListeners() to increase limit.');
      }

      // Set the flag so it doesn't fire again
      this._events[type].warned = true;
    }

    // Return the instance to allow chaining
    return this;
  };

  /**
   * Alias of the addListener method
   *
   * @param {String} type Event type name
   * @param {Function} listener Function to be called when the event is fired
   * @param {Object} scope Object that this should be set to when the listener is called
   * @param {Boolean} once If true then the listener will be removed after the first call
   */
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  /**
   * Alias of the addListener method but will remove the event after the first use
   *
   * @param {String} type Event type name
   * @param {Function} listener Function to be called when the event is fired
   * @param {Object} scope Object that this should be set to when the listener is called
   * @return {Object} The current EventEmitter instance to allow chaining
   */
  EventEmitter.prototype.once = function(type, listener, scope) {
    return this.addListener(type, listener, scope, true);
  };

  /**
   * Removes the a listener for the specified event
   *
   * @param {String} type Event type name the listener must have for the event to be removed
   * @param {Function} listener Listener the event must have to be removed
   * @param {Object} scope The scope the event must have to be removed
   * @return {Object} The current EventEmitter instance to allow chaining
   */
  EventEmitter.prototype.removeListener = function(type, listener, scope) {
    this.eachListener(type, function(currentListener, index) {
      // If this is the listener remove it from the array
      // We also compare the scope if it was passed
      if(currentListener.listener === listener && (!scope || currentListener.scope === scope)) {
        this._events[type].splice(index, 1);
      }
    });

    // Remove the property if there are no more listeners
    if(this._events[type] && this._events[type].length === 0) {
      delete this._events[type];
    }

    // Return the instance to allow chaining
    return this;
  };

  /**
   * Alias of the removeListener method
   *
   * @param {String} type Event type name the listener must have for the event to be removed
   * @param {Function} listener Listener the event must have to be removed
   * @param {Object} scope The scope the event must have to be removed
   * @return {Object} The current EventEmitter instance to allow chaining
   */
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

  /**
   * Removes all listeners for a specified event
   * If no event type is passed it will remove every listener
   *
   * @param {String} type Event type name to remove all listeners from
   * @return {Object} The current EventEmitter instance to allow chaining
   */
  EventEmitter.prototype.removeAllListeners = function(type) {
    // Check for a type, if there is none remove all listeners
    // If there is a type however, just remove the listeners for that type
    if(type && this._events.hasOwnProperty(type)) {
      delete this._events[type];
    }
    else if(!type) {
      this._events = {};
    }

    // Return the instance to allow chaining
    return this;
  };

  /**
   * Retrieves the array of listeners for a specified event
   *
   * @param {String} type Event type name to return all listeners from
   * @return {Array} Will return either an array of listeners or an empty array if there are none
   */
  EventEmitter.prototype.listeners = function(type) {
    // Return the array of listeners or an empty array if it does not exist
    if(this._events.hasOwnProperty(type)) {
      // It does exist, loop over building the array
      var listeners = [];

      this.eachListener(type, function(evt) {
        listeners.push(evt.listener);
      });

      return listeners;
    }

    return [];
  };

  /**
   * Emits an event executing all appropriate listeners
   * All values passed after the type will be passed as arguments to the listeners
   *
   * @param {String} type Event type name to run all listeners from
   * @return {Object} The current EventEmitter instance to allow chaining
   */
  EventEmitter.prototype.emit = function(type) {
    // Calculate the arguments
    var args = [],
      i = null;

    for(i = 1; i < arguments.length; i += 1) {
      args.push(arguments[i]);
    }

    this.eachListener(type, function(currentListener) {
      return currentListener.fire(args);
    });

    // Return the instance to allow chaining
    return this;
  };

  /**
   * Sets the max listener count for the EventEmitter
   * When the count of listeners for an event exceeds this limit a warning will be printed
   * Set to 0 for no limit
   *
   * @param {Number} maxListeners The new max listener limit
   * @return {Object} The current EventEmitter instance to allow chaining
   */
  EventEmitter.prototype.setMaxListeners = function(maxListeners) {
    this._maxListeners = maxListeners;

    // Return the instance to allow chaining
    return this;
  };

  // Export the class
  if(typeof define === 'function' && define.amd) {
    define(function() {
      return EventEmitter;
    });
  }
  else {
    exports.EventEmitter = EventEmitter;
  }
}(this));
(function () {
  var assert = this.assert = {};

  assert.equal = function (a, b) {
    return a === b;
  };

  var messages = {
      'equal'       : "expected {expected},\n\tgot\t {actual} ({operator})",
      'notEqual'    : "didn't expect {actual} ({operator})"
  };
  messages['strictEqual']    = messages['deepEqual']    = messages['equal'];
  messages['notStrictEqual'] = messages['notDeepEqual'] = messages['notEqual'];

  for (var key in messages) {
      assert[key] = (function (key, callback) {
          return function (actual, expected, message) {
              callback(actual, expected, message || messages[key]);
          };
      })(key, assert[key]);
  }

  assert.ok = (function (callback) {
      return function (actual, message) {
          callback(actual, message ||  "expected expression to evaluate to {expected}, but was {actual}");
      };
  })(assert.ok);

  assert.match = function (actual, expected, message) {
      if (! expected.test(actual)) {
          assert.fail(actual, expected, message || "expected {actual} to match {expected}", "match", assert.match);
      }
  };
  assert.matches = assert.match;

  assert.isTrue = function (actual, message) {
      if (actual !== true) {
          assert.fail(actual, true, message || "expected {expected}, got {actual}", "===", assert.isTrue);
      }
  };
  assert.isFalse = function (actual, message) {
      if (actual !== false) {
          assert.fail(actual, false, message || "expected {expected}, got {actual}", "===", assert.isFalse);
      }
  };
  assert.isZero = function (actual, message) {
      if (actual !== 0) {
          assert.fail(actual, 0, message || "expected {expected}, got {actual}", "===", assert.isZero);
      }
  };
  assert.isNotZero = function (actual, message) {
      if (actual === 0) {
          assert.fail(actual, 0, message || "expected non-zero value, got {actual}", "===", assert.isNotZero);
      }
  };

  assert.greater = function (actual, expected, message) {
      if (actual <= expected) {
          assert.fail(actual, expected, message || "expected {actual} to be greater than {expected}", ">", assert.greater);
      }
  };
  assert.lesser = function (actual, expected, message) {
      if (actual >= expected) {
          assert.fail(actual, expected, message || "expected {actual} to be lesser than {expected}", "<", assert.lesser);
      }
  };

  assert.inDelta = function (actual, expected, delta, message) {
      var lower = expected - delta;
      var upper = expected + delta;
      if (actual < lower || actual > upper) {
          assert.fail(actual, expected, message || "expected {actual} to be in within *" + delta.toString() + "* of {expected}", null, assert.inDelta);
      }
  };

  //
  // Inclusion
  //
  assert.include = function (actual, expected, message) {
      if ((function (obj) {
          if (isArray(obj) || isString(obj)) {
              return obj.indexOf(expected) === -1;
          } else if (isObject(actual)) {
              return ! obj.hasOwnProperty(expected);
          }
          return true;
      })(actual)) {
          assert.fail(actual, expected, message || "expected {actual} to include {expected}", "include", assert.include);
      }
  };
  assert.includes = assert.include;

  assert.deepInclude = function (actual, expected, message) {
      if (!isArray(actual)) {
          return assert.include(actual, expected, message);
      }
      if (!actual.some(function (item) { return utils.deepEqual(item, expected) })) {
          assert.fail(actual, expected, message || "expected {actual} to include {expected}", "include", assert.deepInclude);
      }
  };
  assert.deepIncludes = assert.deepInclude;

  //
  // Length
  //
  assert.isEmpty = function (actual, message) {
      if ((isObject(actual) && Object.keys(actual).length > 0) || actual.length > 0) {
          assert.fail(actual, 0, message || "expected {actual} to be empty", "length", assert.isEmpty);
      }
  };
  assert.isNotEmpty = function (actual, message) {
      if ((isObject(actual) && Object.keys(actual).length === 0) || actual.length === 0) {
          assert.fail(actual, 0, message || "expected {actual} to be not empty", "length", assert.isNotEmpty);
      }
  };

  assert.lengthOf = function (actual, expected, message) {
      if (actual.length !== expected) {
          assert.fail(actual, expected, message || "expected {actual} to have {expected} element(s)", "length", assert.length);
      }
  };

  //
  // Type
  //
  assert.isArray = function (actual, message) {
      assertTypeOf(actual, 'array', message || "expected {actual} to be an Array", assert.isArray);
  };
  assert.isObject = function (actual, message) {
      assertTypeOf(actual, 'object', message || "expected {actual} to be an Object", assert.isObject);
  };
  assert.isNumber = function (actual, message) {
      if (isNaN(actual)) {
          assert.fail(actual, 'number', message || "expected {actual} to be of type {expected}", "isNaN", assert.isNumber);
      } else {
          assertTypeOf(actual, 'number', message || "expected {actual} to be a Number", assert.isNumber);
      }
  };
  assert.isBoolean = function (actual, message) {
      if (actual !== true && actual !== false) {
          assert.fail(actual, 'boolean', message || "expected {actual} to be a Boolean", "===", assert.isBoolean);
      }
  };
  assert.isNaN = function (actual, message) {
      if (actual === actual) {
          assert.fail(actual, 'NaN', message || "expected {actual} to be NaN", "===", assert.isNaN);
      }
  };
  assert.isNull = function (actual, message) {
      if (actual !== null) {
          assert.fail(actual, null, message || "expected {expected}, got {actual}", "===", assert.isNull);
      }
  };
  assert.isNotNull = function (actual, message) {
      if (actual === null) {
          assert.fail(actual, null, message || "expected non-null value, got {actual}", "===", assert.isNotNull);
      }
  };
  assert.isUndefined = function (actual, message) {
      if (actual !== undefined) {
          assert.fail(actual, undefined, message || "expected {actual} to be {expected}", "===", assert.isUndefined);
      }
  };
  assert.isDefined = function (actual, message) {
      if(actual === undefined) {
          assert.fail(actual, 0, message || "expected {actual} to be defined", "===", assert.isDefined);
      }
  };
  assert.isString = function (actual, message) {
      assertTypeOf(actual, 'string', message || "expected {actual} to be a String", assert.isString);
  };
  assert.isFunction = function (actual, message) {
      assertTypeOf(actual, 'function', message || "expected {actual} to be a Function", assert.isFunction);
  };
  assert.typeOf = function (actual, expected, message) {
      assertTypeOf(actual, expected, message, assert.typeOf);
  };
  assert.instanceOf = function (actual, expected, message) {
      if (! (actual instanceof expected)) {
          assert.fail(actual, expected, message || "expected {actual} to be an instance of {expected}", "instanceof", assert.instanceOf);
      }
  };

  //
  // Utility functions
  //

  function assertTypeOf(actual, expected, message, caller) {
      if (typeOf(actual) !== expected) {
          assert.fail(actual, expected, message || "expected {actual} to be of type {expected}", "typeOf", caller);
      }
  };

  function isArray (obj) {
      return Array.isArray(obj);
  }

  function isString (obj) {
      return typeof(obj) === 'string' || obj instanceof String;
  }

  function isObject (obj) {
      return typeof(obj) === 'object' && obj && !isArray(obj);
  }

  // A better `typeof`
  function typeOf(value) {
      var s = typeof(value),
          types = [Object, Array, String, RegExp, Number, Function, Boolean, Date];

      if (s === 'object' || s === 'function') {
          if (value) {
              types.forEach(function (t) {
                  if (value instanceof t) { s = t.name.toLowerCase() }
              });
          } else { s = 'null' }
      }
      return s;
  }

}());
/*globals assert EventEmitter */
//   usage:
//
//     vows.describe('Deep Thought').addBatch({
//       "An instance of DeepThought": {
//         topic: new DeepThought,
//
//         "should know the answer to the ultimate question of life": function (deepThought) {
//           assert.equal (deepThought.question('what is the answer to the universe?'), 42);
//         }
//       }
//     }).run();
//
(function () {
  var vows = this.vows = {};

  var process = {
    nextTick: function (fn) {
      setTimeout(fn, 1);
    }
  };

  // Options
  vows.options = {
    Emitter: EventEmitter,
    reporter: function () { },
    matcher: /.*/,
    error: true // Handle "error" event
  };

//
// This function gets added to EventEmitter.prototype, by default.
// It's essentially a wrapper around `on`, which adds all the specification
// goodness.
//
  function addVow(vow) {
    var batch = vow.batch,
      event = vow.binding.context.event || 'success',
      self = this;

    batch.total += 1;
    batch.vows.push(vow);

    // always set a listener on the event
    this.on(event, function () {
      var args = Array.prototype.slice.call(arguments);
      // If the vow is a sub-event then we know it is an
      // emitted event.  So I don't muck with the arguments
      // However the legacy behavior:
      // If the callback is expecting two or more arguments,
      // pass the error as the first (null) and the result after.
      if (!(this.ctx && this.ctx.isEvent) &&
        vow.callback.length >= 2 && batch.suite.options.error) {
        args.unshift(null);
      }
      runTest(args, this.ctx);
      vows.tryEnd(batch);
    });

    if (event !== 'error') {
      this.on("error", function (err) {
        if (vow.callback.length >= 2 || !batch.suite.options.error) {
          runTest(arguments, this.ctx);
        } else {
          output('errored', { type: 'promise', error: err.stack ||
             err.message || JSON.stringify(err) });
        }
        vows.tryEnd(batch);
      });
    }

    // in case an event fired before we could listen
    if (this._vowsEmitedEvents &&
      this._vowsEmitedEvents.hasOwnProperty(event)) {
      // make sure no one is messing with me
      if (Array.isArray(this._vowsEmitedEvents[event])) {
        // I don't think I need to optimize for one event,
        // I think it is more important to make sure I check the vow n times
        self._vowsEmitedEvents[event].forEach(function (args) {
          runTest(args, self.ctx);
        });
      } else {
        // initial conditions problem
        throw new Error('_vowsEmitedEvents[' + event + '] is not an Array');
      }
      vows.tryEnd(batch);
    }

    return this;

    function runTest(args, ctx) {
      if (vow.callback instanceof String) {
        return output('pending');
      }

      if (vow.binding.context.isEvent && vow.binding.context.after) {
        var after = vow.binding.context.after;
        // only need to check order.  I won't get here if the after event
        // has never been emitted
        if (self._vowsEmitedEventsOrder.indexOf(after) >
          self._vowsEmitedEventsOrder.indexOf(event)) {
          output('broken', event + ' emitted before ' + after);
          return;
        }
      }

      // Run the test, and try to catch `AssertionError`s and other exceptions;
      // increment counters accordingly.
      try {
        vow.callback.apply(ctx === window || !ctx ? vow.binding : ctx, args);
        output('honored');
      } catch (e) {
        if (e.name && e.name.match(/AssertionError/)) {
          output('broken', e.toString().replace(/\`/g, '`'));
        } else {
          output('errored', e.stack || e.message || e);
        }
      }
    }

    function output(status, exception) {
      batch[status] += 1;
      vow.status = status;

      if (vow.context && batch.lastContext !== vow.context) {
        batch.lastContext = vow.context;
        batch.suite.report(['context', vow.context]);
      }
      batch.suite.report(['vow', {
        title: vow.description,
        context: vow.context,
        status: status,
        exception: exception || null
      }]);
    }
  }

  //
  // On exit, check that all promises have been fired.
  // If not, report an error message.
  //
  function exit() {
    var results = { honored: 0, broken: 0, errored: 0, pending: 0, total: 0 },
      failure;

    vows.suites.forEach(function (s) {
      if ((s.results.total > 0) && (s.results.time === null)) {
        s.reporter.print('\n\n');
        s.reporter.report(['error', { error: "Asynchronous Error", suite: s }]);
      }
      s.batches.forEach(function (b) {
        var unFired = [];

        b.vows.forEach(function (vow) {
          if (! vow.status) {
            if (unFired.indexOf(vow.context) === -1) {
              unFired.push(vow.context);
            }
          }
        });

        if (unFired.length > 0) { console.warn('\n'); }

        unFired.forEach(function (title) {
          s.reporter.report(['error', {
            error: "callback not fired",
            context: title,
            batch: b,
            suite: s
          }]);
        });

        if (b.status === 'begin') {
          failure = true;
          results.errored += 1;
          results.total += 1;
        }
        Object.keys(results).forEach(function (k) { results[k] += b[k]; });
      });
    });
    if (failure) {
      console.warn(results);
    }
  }

  vows.suites = [];

  // We need the old emit function so we can hook it
  // and do magic to deal with events that have fired
  var oldEmit = vows.options.Emitter.prototype.emit;

  //
  // Create a new test suite
  //
  vows.describe = function (subject) {
    var suite = new(Suite)(subject);

    this.options.Emitter.prototype.addVow = addVow;
    // just in case someone emit's before I get to it
    this.options.Emitter.prototype.emit = function (event) {
      this._vowsEmitedEvents = this._vowsEmitedEvents || {};
      this._vowsEmitedEventsOrder = this._vowsEmitedEventsOrder || [];
      // slice off the event
      var args = Array.prototype.slice.call(arguments, 1);
      // if multiple events are fired, add or push
      if (this._vowsEmitedEvents.hasOwnProperty(event)) {
        this._vowsEmitedEvents[event].push(args);
      } else {
        this._vowsEmitedEvents[event] = [args];
      }

      // push the event onto a stack so I have an order
      this._vowsEmitedEventsOrder.push(event);
      return oldEmit.apply(this, arguments);
    };
    this.suites.push(suite);

    //
    // Add any additional arguments as batches if they're present
    //
    if (arguments.length > 1) {
      for (var i = 1, l = arguments.length; i < l; i += 1) {
        suite.addBatch(arguments[i]);
      }
    }

    return suite;
  };



  function Context(vow, ctx, env) {
    var that = this;

    this.tests = vow.callback;
    this.topics = (ctx.topics || []).slice(0);
    this.emitter = null;
    this.env = env || {};
    this.env.context = this;

    this.env.callback = function (/* arguments */) {
      var ctx = this;
      var args = Array.prototype.slice.call(arguments);

      var emit = (function (args) {
        //
        // Convert callback-style results into events.
        //
        if (vow.batch.suite.options.error) {
          return function () {
            var e = args.shift();
            that.emitter.ctx = ctx;
            // We handle a special case, where the first argument is a
            // boolean, in which case we treat it as a result, and not
            // an error. This is useful for `path.exists` and other
            // functions like it, which only pass a single boolean
            // parameter instead of the more common (error, result) pair.
            if (typeof(e) === 'boolean' && args.length === 0) {
              that.emitter.emit.call(that.emitter, 'success', e);
            } else {
              if (e) { that.emitter.emit.apply(that.emitter, ['error', e].concat(args)); }
              else   { that.emitter.emit.apply(that.emitter, ['success'].concat(args)); }
            }
          };
        } else {
          return function () {
            that.emitter.ctx = ctx;
            that.emitter.emit.apply(that.emitter, ['success'].concat(args));
          };
        }
      }(args.slice(0)));
      // If `this.callback` is called synchronously,
      // the emitter will not have been set yet,
      // so we defer the emition, that way it'll behave
      // asynchronously.
      if (that.emitter) { emit(); }
      else { process.nextTick(emit); }
    };
    this.name = vow.description;
    // events is an alias for on
    if (this.name === 'events') {
      this.name = vow.description = 'on';
    }

    // if this is a sub-event context AND it's context was an event,
    // then I must enforce event order.
    // this will not do a good job of handling pin-pong events
    if (this.name === 'on' && ctx.isEvent) {
      this.after = ctx.name;
    }

    if (ctx.name === 'on') {
      this.isEvent = true;
      this.event = this.name;
      this.after = ctx.after;
    } else {
      this.isEvent = false;
      this.event = 'success';
    }

    this.title = [
      ctx.title || '',
      vow.description || ''
    ].join(/^[#.:]/.test(vow.description) ? '' : ' ').trim();
  }

  //var events = require('events'),
  //  path = require('path');

  //var vows = require('../vows');
  //var Context = require('../vows/context').Context;

  function Suite(subject) {
    this.subject = subject;
    this.matcher = /.*/;
    this.reporter = { report: function (data) { console.log(data); } };
    this.batches = [];
    this.options = { error: true };
    this.reset();
  }

  Suite.prototype.reset = function () {
    this.results = {
      honored: 0,
      broken:  0,
      errored: 0,
      pending: 0,
      total:   0,
      time:  null
    };
    this.batches.forEach(function (b) {
      b.lastContext = null;
      b.remaining = b._remaining;
      b.honored = b.broken = b.errored = b.total = b.pending = 0;
      b.vows.forEach(function (vow) { vow.status = null; });
      b.teardowns = [];
    });
  };

  Suite.prototype.addBatch = function (tests) {
    this.batches.push({
      tests: tests,
      suite:  this,
      vows:   [],
      remaining: 0,
      _remaining: 0,
      honored:   0,
      broken:  0,
      errored:   0,
      pending:   0,
      total:   0,
      teardowns: []
    });
    return this;
  };

  Suite.prototype.addVows = this.addBatch;

  Suite.prototype.parseBatch = function (batch, matcher) {
    var tests = batch.tests;

    if ('topic' in tests) {
      throw new(Error)("missing top-level context.");
    }
    // Count the number of vows/promises expected to fire,
    // so we know when the tests are over.
    // We match the keys against `matcher`, to decide
    // whether or not they should be included in the test.
    // Any key, including assertion function keys can be matched.
    // If a child matches, then the n parent topics must not be skipped.
    (function count(tests, _match) {
      var match = false;

      var keys = Object.keys(tests).filter(function (k) {
        return k !== 'topic' && k !== 'teardown';
      });

      for (var i = 0, key; i < keys.length; i += 1) {
        key = keys[i];

        // If the parent node, or this one matches.
        match = _match || matcher.test(key);

        if (typeof(tests[key]) === 'object') {
          match = count(tests[key], match);
        } else {
          if (typeof(tests[key]) === 'string') {
            tests[key] = String(tests[key]);
          }
          if (! match) {
            tests[key]._skip = true;
          }
        }
      }

      // If any of the children matched,
      // don't skip this node.
      for (i = 0; i < keys.length; i += 1) {
        if (! tests[keys[i]]._skip) { match = true; }
      }

      if (match) { batch.remaining += 1; }
      else     { tests._skip = true; }

      return match;
    }(tests, false));

    batch._remaining = batch.remaining;
  };

  Suite.prototype.runBatch = function (batch) {
    var topic,
      tests   = batch.tests,
      promise = batch.promise = new EventEmitter();

    var that = this;

    batch.status = 'begin';

    // The test runner, it calls itself recursively, passing the
    // previous context to the inner contexts. This is so the `topic`
    // functions have access to all the previous context topics in their
    // arguments list.
    // It is defined and invoked at the same time.
    // If it encounters a `topic` function, it waits for the returned
    // promise to emit (the topic), at which point it runs the functions under it,
    // passing the topic as an argument.
    (function run(ctx, lastTopic) {
      var old = false;
      topic = ctx.tests.topic;

      if (typeof(topic) === 'function') {
        if (ctx.isEvent || ctx.name === 'on') {
          throw new Error('Event context cannot contain a topic');
        }

        // Run the topic, passing the previous context topics
        // If topic `throw`s an exception, pass it down as a value
        try {
          topic = topic.apply(ctx.env, ctx.topics);
        }
        catch (ex) {
          topic = ex;
        }

        if (typeof(topic) === 'undefined') { ctx._callback = true; }
      }

      // If this context has a topic, store it in `lastTopic`,
      // if not, use the last topic, passed down by a parent
      // context.
      if (typeof(topic) !== 'undefined' || ctx._callback) {
        lastTopic = topic;
      } else {
        old   = true;
        topic = lastTopic;
      }

      // If the topic doesn't return an event emitter (such as a promise),
      // we create it ourselves, and emit the value on the next tick.
      if (! (topic &&
         topic.constructor === EventEmitter)) {
        // If the context is a traditional vow, then a topic can ONLY
        // be an EventEmitter.  However if the context is a sub-event
        // then the topic may be an instanceof EventEmitter
        if (!ctx.isEvent ||
         (ctx.isEvent && !(topic instanceof EventEmitter))) {

          ctx.emitter = new EventEmitter();

          if (! ctx._callback) {
            process.nextTick((function (val) {
              return function () {
                ctx.emitter.emit("success", val);
              };
            }(topic)));
          }
          // if I have a callback, push the new topic back up to
          // lastTopic
          if (ctx._callback) {
            lastTopic = topic = ctx.emitter;
          } else {
            topic = ctx.emitter;
          }
        }
      }

      topic.on(ctx.event, function (val) {
        // Once the topic fires, add the return value
        // to the beginning of the topics list, so it
        // becomes the first argument for the next topic.
        // If we're using the parent topic, no need to
        // prepend it to the topics list, or we'll get
        // duplicates.
        if (!old || ctx.isEvent) {
          Array.prototype.unshift.apply(ctx.topics, arguments);
        }
      });
      if (topic.setMaxListeners) { topic.setMaxListeners(Infinity); }
      // Now run the tests, or sub-contexts
      Object.keys(ctx.tests).filter(function (k) {
        return ctx.tests[k] && k !== 'topic'  &&
                   k !== 'teardown' && !ctx.tests[k]._skip;
      }).forEach(function (item) {
        // Create a new evaluation context,
        // inheriting from the parent one.
        var env = Object.create(ctx.env);
        env.suite = that;

        // Holds the current test or context
        var vow = Object.create({
          callback: ctx.tests[item],
          context: ctx.title,
          description: item,
          binding: ctx.env,
          status: null,
          batch: batch
        });

        // If we encounter a function, add it to the callbacks
        // of the `topic` function, so it'll get called once the
        // topic fires.
        // If we encounter an object literal, we recurse, sending it
        // our current context.
        if ((typeof(vow.callback) === 'function') ||
          (vow.callback instanceof String)) {
          topic.addVow(vow);
        } else if (typeof(vow.callback) === 'object') {
          // If there's a setup stage, we have to wait for it to fire,
          // before calling the inner context.
          // If the event has already fired, the context is 'on' or
          // there is no setup stage, just run the inner context
          // synchronously.
          if (topic &&
            ctx.name !== 'on' &&
            !topic._vowsEmitedEvents.hasOwnProperty(ctx.event)) {
            topic.on(ctx.event, (function (ctx) {
              return function (val) {
                return run(new(Context)(vow, ctx, env), lastTopic);
              };
            }(ctx)));
          } else {
            run(new(Context)(vow, ctx, env), lastTopic);
          }
        }
      });
      // Teardown
      if (ctx.tests.teardown) {
        batch.teardowns.push(ctx);
      }
      if (! ctx.tests._skip) {
        batch.remaining -= 1;
      }
      // Check if we're done running the tests
      vows.tryEnd(batch);
    // This is our initial, empty context
    }(new(Context)({ callback: tests, context: null, description: null }, {})));
    return promise;
  };

  Suite.prototype.report = function () {
    return this.reporter.report.apply(this.reporter, arguments);
  };

  Suite.prototype.run = function (options, callback) {
    var that = this, start;

    options = options || {};

    for (var k in options) {
      if (options.hasOwnProperty(k)) {
        this.options[k] = options[k];
      }
    }

    this.matcher  = this.options.matcher  || this.matcher;
    this.reporter = this.options.reporter || this.reporter;

    this.batches.forEach(function (batch) {
      that.parseBatch(batch, that.matcher);
    });

    this.reset();

    start = new Date();

    if (this.batches.filter(function (b) { return b.remaining > 0; }).length) {
      this.report(['subject', this.subject]);
    }

    return (function run(batches) {
      var batch = batches.shift();

      if (batch) {
        // If the batch has no vows to run,
        // go to the next one.
        if (batch.remaining === 0) {
          run(batches);
        } else {
          that.runBatch(batch).on('end', function () {
            run(batches);
          });
        }
      } else {
        that.results.time = (new Date() - start) / 1000;
        that.report(['finish', that.results]);

        if (callback) { callback(that.results); }

        if (that.results.honored + that.results.pending === that.results.total) {
          return 0;
        } else {
          return 1;
        }
      }
    }(this.batches.slice(0)));
  };

//
// Checks if all the tests in the batch have been run,
// and triggers the next batch (if any), by emitting the 'end' event.
//
  vows.tryEnd = function tryEnd(batch) {
    var result, style, time;
    var total = batch.honored + batch.broken + batch.errored + batch.pending;

    function runTeardown(teardown) {
      var env = Object.create(teardown.env);

      Object.defineProperty(env, "callback", {
        get: function () {
          teardown.awaitingCallback = true;

          return function () {
            teardown.awaitingCallback = false;
            maybeFinish();
          };
        }
      });

      teardown.tests.teardown.apply(env, teardown.topics);
    }

    function maybeFinish() {
      var pending = batch.teardowns.filter(function (teardown) {
        return teardown.awaitingCallback;
      });

      if (pending.length === 0) {
        finish();
      }
    }

    function finish() {
      batch.status = 'end';
      batch.suite.report(['end']);
      batch.promise.emit('end', batch.honored, batch.broken, batch.errored, batch.pending);
    }

    if (total === batch.total && batch.remaining === 0) {

      Object.keys(batch).forEach(function (k) {
        (k in batch.suite.results) && (batch.suite.results[k] += batch[k]);
      });

      if (batch.teardowns) {
        for (var i = batch.teardowns.length - 1, ctx; i >= 0; i -= 1) {
          runTeardown(batch.teardowns[i]);
        }

        maybeFinish();
      }
    }
  };
}());
