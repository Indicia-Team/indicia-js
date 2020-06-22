/*!
 * @indicia-js/core 5.2.1
 * Indicia JavaScript SDK.
 * https://github.com/Indicia-Team/indicia-js
 * Author undefined
 * Released under the GNU GPL v3 license.
 * http://www.gnu.org/licenses/gpl.html
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Indicia = {}));
}(this, function (exports) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var defineProperty = _defineProperty;

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  var arrayLikeToArray = _arrayLikeToArray;

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arrayLikeToArray(arr);
  }

  var arrayWithoutHoles = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  var iterableToArray = _iterableToArray;

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  var unsupportedIterableToArray = _unsupportedIterableToArray;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableSpread = _nonIterableSpread;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
  }

  var toConsumableArray = _toConsumableArray;

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports 
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  var regenerator = runtime_1;

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  var arrayWithHoles = _arrayWithHoles;

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  var iterableToArrayLimit = _iterableToArrayLimit;

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableRest = _nonIterableRest;

  function _slicedToArray(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
  }

  var slicedToArray = _slicedToArray;

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  var objectWithoutPropertiesLoose = _objectWithoutPropertiesLoose;

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = objectWithoutPropertiesLoose(source, excluded);
    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }

  var objectWithoutProperties = _objectWithoutProperties;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck = _classCallCheck;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var createClass = _createClass;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  var asyncToGenerator = _asyncToGenerator;

  /* eslint-disable */
  var API_BASE = 'api/',
      API_VER = 'v1',
      API_SAMPLES_PATH = '/samples';

  var CONST = /*#__PURE__*/Object.freeze({
    __proto__: null,
    API_BASE: API_BASE,
    API_VER: API_VER,
    API_SAMPLES_PATH: API_SAMPLES_PATH
  });

  var _typeof_1 = createCommonjsModule(function (module) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      module.exports = _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      module.exports = _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  module.exports = _typeof;
  });

  /** *********************************************************************
   * HELPER FUNCTIONS
   ********************************************************************* */
  function makeRequest(_x, _x2) {
    return _makeRequest.apply(this, arguments);
  }
  /**
   * Generate UUID.
   */

  /* eslint-disable no-bitwise */

  function _makeRequest() {
    _makeRequest = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(url, options) {
      var timeout,
          timeoutTrigger,
          res,
          resJSON,
          error,
          _args = arguments;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              timeout = _args.length > 2 && _args[2] !== undefined ? _args[2] : 80000;
              timeoutTrigger = new Promise(function (_, reject) {
                return setTimeout(function () {
                  return reject(new Error('timeout'));
                }, timeout);
              });
              _context.next = 4;
              return Promise.race([fetch(url, options), timeoutTrigger]);

            case 4:
              res = _context.sent;
              _context.next = 7;
              return res.json();

            case 7:
              _context.t0 = _context.sent;

              if (_context.t0) {
                _context.next = 10;
                break;
              }

              _context.t0 = {};

            case 10:
              resJSON = _context.t0;

              if (res.ok) {
                _context.next = 16;
                break;
              }

              error = new Error(res.statusText);
              error.status = res.status;

              if (!resJSON.errors) {
                error.errors = resJSON.errors;
              }

              throw error;

            case 16:
              return _context.abrupt("return", resJSON);

            case 17:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _makeRequest.apply(this, arguments);
  }

  function getNewUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }
  /* eslint-enable no-bitwise */

  /**
   * Converts DataURI object to a Blob.
   *
   * @param {type} dataURI
   * @param {type} fileType
   * @returns {undefined}
   */

  function dataURItoBlob(dataURI, fileType) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];

    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], {
      type: fileType
    });
  } // Detecting data URLs
  // https://gist.github.com/bgrins/6194623
  // data URI - MDN https://developer.mozilla.org/en-US/docs/data_URIs
  // The 'data' URL scheme: http://tools.ietf.org/html/rfc2397
  // Valid URL Characters: http://tools.ietf.org/html/rfc2396#section2

  function isDataURL(string) {
    if (!string) {
      return false;
    }

    var normalized = string.toString(); // numbers

    /* eslint-disable no-useless-escape, max-len */

    var regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
    return !!normalized.match(regex);
  }
  function getBlobFromURL(url, mediaType) {
    if (isDataURL(url)) {
      var blob = dataURItoBlob(url, mediaType);
      return Promise.resolve(blob);
    }

    return new Promise(function (resolve) {
      // load image
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = function () {
        var blob = xhr.response;
        resolve(blob);
      }; // todo check error case


      xhr.send();
    });
  }

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  var THUMBNAIL_WIDTH = 100; // px

  var THUMBNAIL_HEIGHT = 100; // px

  var Media = /*#__PURE__*/function () {
    function Media() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      classCallCheck(this, Media);

      defineProperty(this, "cid", getNewUUID());

      defineProperty(this, "id", null);

      defineProperty(this, "attrs", {});

      defineProperty(this, "metadata", {
        created_on: new Date()
      });

      defineProperty(this, "keys", {});

      this.id = options.id; // remote ID

      this.cid = options.cid || this.cid;
      this.attrs = _objectSpread(_objectSpread(_objectSpread({}, this.attrs), options.attrs), options.attributes);
      this.metadata = _objectSpread(_objectSpread({}, this.metadata), options.metadata);
    }
    /**
     * Transforms and resizes an image file into a string.
     * Can accept file image path and a file input file.
     *
     * @param onError
     * @param file
     * @param onSaveSuccess
     * @returns {number}
     */


    createClass(Media, [{
      key: "getURL",

      /**
       * Returns image's absolute URL or dataURI.
       */
      value: function getURL() {
        return this.attrs.data;
      }
      /**
       * Resizes itself.
       */

    }, {
      key: "resize",
      value: function resize(MAX_WIDTH, MAX_HEIGHT) {
        var _this = this;

        var that = this;
        var promise = new Promise(function (fulfill, reject) {
          Media.resize(_this.getURL(), _this.attrs.type, MAX_WIDTH, MAX_HEIGHT).then(function (args) {
            var _args = slicedToArray(args, 2),
                image = _args[0],
                data = _args[1];

            that.attrs.data = data;
            fulfill([image, data]);
          }).catch(reject);
        });
        return promise;
      }
      /**
       * Adds a thumbnail to image model.
       * @param options
       */

    }, {
      key: "addThumbnail",
      value: function addThumbnail() {
        var _this2 = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var that = this;
        var promise = new Promise(function (fulfill, reject) {
          // check if data source is dataURI
          var re = /^data:/i;

          if (re.test(_this2.getURL())) {
            Media.resize(_this2.getURL(), _this2.attrs.type, THUMBNAIL_WIDTH || options.width, THUMBNAIL_WIDTH || options.width).then(function (args) {
              var _args2 = slicedToArray(args, 2),
                  data = _args2[1];

              that.attrs.thumbnail = data;
              fulfill();
            }).catch(reject);
            return;
          }

          Media.getDataURI(_this2.getURL(), {
            width: THUMBNAIL_WIDTH || options.width,
            height: THUMBNAIL_HEIGHT || options.height
          }).then(function (data) {
            var _data = slicedToArray(data, 1);

            that.attrs.thumbnail = _data[0];
            fulfill();
          }).catch(reject);
        });
        return promise;
      }
    }, {
      key: "toJSON",
      value: function toJSON() {
        var data = {
          id: this.id,
          cid: this.cid,
          metadata: this.metadata,
          attrs: this.attrs
        };
        return data;
      }
    }, {
      key: "getSubmission",

      /**
       * Returns an object with attributes and their values
       * mapped for warehouse submission.
       *
       * @returns {*}
       */
      value: function getSubmission() {
        var submission = {
          id: this.id,
          name: this.cid
        };
        return [submission];
      }
    }], [{
      key: "getDataURI",
      value: function getDataURI(file) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var promise = new Promise(function (fulfill, reject) {
          // file paths
          if (typeof file === 'string') {
            // get extension
            var fileType = file.replace(/.*\.([a-z]+)$/i, '$1');
            if (fileType === 'jpg') fileType = 'jpeg'; // to match media types image/jpeg

            Media.resize(file, fileType, options.width, options.height).then(function (args) {
              var _args3 = slicedToArray(args, 2),
                  image = _args3[0],
                  dataURI = _args3[1];

              fulfill([dataURI, fileType, image.width, image.height]);
            });
            return;
          } // file inputs


          if (!window.FileReader) {
            reject(new Error('No File Reader'));
            return;
          }

          var reader = new FileReader();

          reader.onload = function (event) {
            if (options.width || options.height) {
              // resize
              Media.resize(event.target.result, file.type, options.width, options.height).then(function (args) {
                var _args4 = slicedToArray(args, 2),
                    image = _args4[0],
                    dataURI = _args4[1];

                fulfill([dataURI, file.type, image.width, image.height]);
              });
            } else {
              var image = new window.Image(); // native one

              image.onload = function () {
                var type = file.type.replace(/.*\/([a-z]+)$/i, '$1');
                fulfill([event.target.result, type, image.width, image.height]);
              };

              image.src = event.target.result;
            }
          };

          reader.readAsDataURL(file);
        });
        return promise;
      }
      /**
       * http://stackoverflow.com/questions/2516117/how-to-scale-an-image-in-data-uri-format-in-javascript-real-scaling-not-usin
       * @param data
       * @param fileType
       * @param MAX_WIDTH
       * @param MAX_HEIGHT
       */

    }, {
      key: "resize",
      value: function resize(data, fileType, MAX_WIDTH, MAX_HEIGHT) {
        var promise = new Promise(function (fulfill) {
          var image = new window.Image(); // native one

          image.onload = function () {
            var width = image.width;
            var height = image.height;
            var maxWidth = MAX_WIDTH || width;
            var maxHeight = MAX_HEIGHT || height;
            var res = null; // resizing

            if (width > height) {
              res = width / maxWidth;
            } else {
              res = height / maxHeight;
            }

            width /= res;
            height /= res; // Create a canvas with the desired dimensions

            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height; // Scale and draw the source image to the canvas

            canvas.getContext('2d').drawImage(image, 0, 0, width, height); // Convert the canvas to a data URL in some format

            fulfill([image, canvas.toDataURL(fileType)]);
          };

          image.src = data;
        });
        return promise;
      }
    }, {
      key: "fromJSON",
      value: function fromJSON(json) {
        return new this(json);
      }
    }]);

    return Media;
  }();

  function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function defaultMetadata() {
    var today = new Date();
    return {
      training: null,
      created_on: today,
      updated_on: today,
      synced_on: null,
      // set when fully initialized only
      server_on: null // updated on server

    };
  }

  var Occurrence = /*#__PURE__*/function () {
    /**
     * Warehouse attributes and their values.
     */
    function Occurrence() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      classCallCheck(this, Occurrence);

      defineProperty(this, "cid", getNewUUID());

      defineProperty(this, "id", null);

      defineProperty(this, "attrs", {});

      defineProperty(this, "metadata", defaultMetadata());

      defineProperty(this, "media", []);

      defineProperty(this, "keys", Occurrence.keys);

      this.id = options.id; // remote ID

      this.cid = options.cid || this.cid;
      this.attrs = _objectSpread$1(_objectSpread$1(_objectSpread$1({}, this.attrs), options.attrs), options.attributes);
      this.metadata = _objectSpread$1(_objectSpread$1({}, this.metadata), options.metadata);
    }

    createClass(Occurrence, [{
      key: "toJSON",
      value: function toJSON() {
        var media;

        if (!this.media) {
          media = [];
          console.warn('toJSON media missing');
        } else {
          media = this.media.map(function (m) {
            return m.toJSON();
          });
        }

        var data = {
          id: this.id,
          cid: this.cid,
          metadata: this.metadata,
          attrs: this.attrs,
          media: media
        };
        return data;
      }
    }, {
      key: "getSubmission",

      /**
       * Returns an object with attributes and their values
       * mapped for warehouse submission.
       */
      value: function getSubmission() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var that = this;
        var occKeys = typeof this.keys === 'function' ? this.keys() : this.keys;

        var keys = _objectSpread$1(_objectSpread$1({}, Occurrence.keys), occKeys); // warehouse keys/values to transform


        var media = toConsumableArray(this.media); // all media within this and child models


        var submission = {
          id: this.id,
          external_key: this.cid,
          fields: {},
          media: []
        };

        if (this.metadata.training || options.training) {
          submission.training = this.metadata.training || options.training;
        }

        if (this.metadata.release_status || options.release_status) {
          submission.release_status = this.metadata.release_status || options.release_status;
        }

        if (this.metadata.record_status || options.record_status) {
          submission.record_status = this.metadata.record_status || options.record_status;
        }

        if (this.metadata.sensitive || options.sensitive) {
          submission.sensitive = this.metadata.sensitive || options.sensitive;
        }

        if (this.metadata.confidential || options.confidential) {
          submission.confidential = this.metadata.confidential || options.confidential;
        }

        if (this.metadata.sensitivity_precision || options.sensitivity_precision) {
          submission.sensitivity_precision = this.metadata.sensitivity_precision || options.sensitivity_precision;
        }

        function mapValue(attr, value) {
          var valuesMapping = keys[attr].values;

          if (!valuesMapping) {
            return value;
          }

          if (typeof valuesMapping === 'function') {
            return valuesMapping(value, submission, that);
          }

          if (valuesMapping instanceof Array) {
            return valuesMapping.find(function (_ref) {
              var val = _ref.value;
              return val === value;
            }).id;
          }

          if (value instanceof Array) {
            return value.map(function (v) {
              return valuesMapping[v];
            });
          }

          return valuesMapping[value];
        }

        function getValue(attr) {
          // no need to send attributes with no values
          var value = that.attrs[attr];

          if (!value) {
            return;
          }

          if (!keys[attr]) {
            if (attr !== 'email') {
              console.warn("Indicia: no such key: ".concat(attr));
            }

            submission.fields[attr] = value;
            return;
          }

          var warehouseAttr = keys[attr].id || attr;
          value = mapValue(attr, value); // don't need to send null or undefined

          if (value) {
            submission.fields[warehouseAttr] = value;
          }
        }

        Object.keys(this.attrs).forEach(getValue); // transform sub models
        // media does not return any media-models only JSON data about them
        // media files will be attached separately

        var mediaSubmission = [];
        this.media.forEach(function (model) {
          var _model$getSubmission = model.getSubmission(),
              _model$getSubmission2 = slicedToArray(_model$getSubmission, 1),
              modelSubmission = _model$getSubmission2[0];

          mediaSubmission.push(modelSubmission);
        });
        submission.media = mediaSubmission;
        return [submission, media];
      }
    }], [{
      key: "fromJSON",
      value: function fromJSON(json) {
        var Media$1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Media;

        var media = json.media,
            options = objectWithoutProperties(json, ["media"]);

        var occurrence = new this(options);
        media.forEach(function (m) {
          return occurrence.media.push(Media$1.fromJSON(m));
        });
        return occurrence;
      }
    }]);

    return Occurrence;
  }();

  defineProperty(Occurrence, "keys", {
    taxon: {
      id: 'taxa_taxon_list_id'
    },
    comment: {
      id: 'comment'
    }
  });

  function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function defaultMetadata$1() {
    var today = new Date();
    return {
      survey_id: null,
      input_form: null,
      created_on: today,
      updated_on: today,
      synced_on: null,
      // set when fully initialized only
      server_on: null // updated on server

    };
  }

  function handleDuplicates(errors) {
    // duplicate occurred - this fixes only occurrence duplicates!
    // todo: remove once this is sorted
    var res = {
      data: {
        id: null,
        external_key: null,
        occurrences: []
      }
    };
    errors.forEach(function (error) {
      res.data.id = error.sample_id;
      res.data.external_key = error.sample_external_key;
      res.data.occurrences.push({
        id: error.id,
        external_key: error.external_key
      });
    });
    return res;
  }

  function appendModelToFormData(_x, _x2) {
    return _appendModelToFormData.apply(this, arguments);
  }

  function _appendModelToFormData() {
    _appendModelToFormData = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3(mediaModel, formData) {
      var type, extension, mediaType, _type$split, _type$split2, url, blob, name;

      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // can provide both image/jpeg and jpeg
              type = mediaModel.attrs.type;
              extension = type;
              mediaType = type;

              if (type.match(/image.*/)) {
                _type$split = type.split('/');
                _type$split2 = slicedToArray(_type$split, 2);
                extension = _type$split2[1];
              } else {
                mediaType = "image/".concat(mediaType);
              }

              url = mediaModel.getURL();
              _context3.next = 7;
              return getBlobFromURL(url, mediaType);

            case 7:
              blob = _context3.sent;
              name = mediaModel.cid;
              formData.append(name, blob, "".concat(name, ".").concat(extension));

            case 10:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _appendModelToFormData.apply(this, arguments);
  }

  function setNewRemoteID(model, remoteIDs) {
    // set new remote ID
    var remoteID = remoteIDs[model.cid];

    if (remoteID) {
      model.id = remoteID;
    } // do that for all submodels


    if (model.samples) {
      model.samples.forEach(function (subModel) {
        return setNewRemoteID(subModel, remoteIDs);
      });
    }

    if (model.occurrences) {
      model.occurrences.forEach(function (subModel) {
        return setNewRemoteID(subModel, remoteIDs);
      });
    }

    if (model.media) {
      model.media.forEach(function (subModel) {
        return setNewRemoteID(subModel, remoteIDs);
      });
    }
  }
  /**
   * Creates a stringified JSON representation of the model or a FormData object.
   * If the media is present then it creates a FormData so that the record
   * could be submitted in one call.
   */


  function normaliseModelData(_x3, _x4) {
    return _normaliseModelData.apply(this, arguments);
  }

  function _normaliseModelData() {
    _normaliseModelData = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(data, media) {
      var dataStr, formData, mediaProcesses;
      return regenerator.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              dataStr = JSON.stringify({
                data: data
              });

              if (media.length) {
                _context4.next = 3;
                break;
              }

              return _context4.abrupt("return", dataStr);

            case 3:
              formData = new FormData(); // for submission

              formData.append('submission', dataStr);
              mediaProcesses = media.map(function (m) {
                return appendModelToFormData(m, formData);
              });
              _context4.next = 8;
              return Promise.all(mediaProcesses);

            case 8:
              return _context4.abrupt("return", formData);

            case 9:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));
    return _normaliseModelData.apply(this, arguments);
  }

  function remoteCreateParse(model, responseData) {
    // get new ids
    var remoteIDs = {}; // recursively extracts ids from collection of response models

    function getIDs(data) {
      remoteIDs[data.external_key] = data.id;

      if (data.samples) {
        data.samples.forEach(function (subModel) {
          return getIDs(subModel);
        });
      }

      if (data.occurrences) {
        data.occurrences.forEach(function (subModel) {
          return getIDs(subModel);
        });
      } // Images don't store external_keys yet.
      // if (data.media) data.media.forEach(subModel => getIDs(subModel));

    }

    getIDs(responseData);
    setNewRemoteID(model, remoteIDs);
  }

  function getUserAuth(remote) {
    if (!remote.user || !remote.password) {
      return null;
    }

    var user = typeof remote.user === 'function' ? remote.user() : remote.user;
    var password = typeof remote.password === 'function' ? remote.password() : remote.password;
    var basicAuth = btoa("".concat(user, ":").concat(password));
    return "Basic  ".concat(basicAuth);
  }

  var Sample = /*#__PURE__*/function () {
    createClass(Sample, null, [{
      key: "fromJSON",

      /**
       * Warehouse attributes and their values.
       */
      value: function fromJSON(json) {
        var Occurrence$1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Occurrence;
        var Sample = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this;
        var Media$1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Media;

        var samples = json.samples,
            occurrences = json.occurrences,
            media = json.media,
            options = objectWithoutProperties(json, ["samples", "occurrences", "media"]);

        var sample = new this(options);
        samples.forEach(function (smp) {
          return sample.samples.push(Sample.fromJSON(smp));
        });
        occurrences.forEach(function (occ) {
          return sample.occurrences.push(Occurrence$1.fromJSON(occ));
        });
        media.forEach(function (m) {
          return sample.media.push(Media$1.fromJSON(m));
        });
        return sample;
      }
    }]);

    function Sample() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      classCallCheck(this, Sample);

      defineProperty(this, "cid", getNewUUID());

      defineProperty(this, "id", null);

      defineProperty(this, "attrs", {
        date: new Date(),
        location_type: 'latlon'
      });

      defineProperty(this, "metadata", defaultMetadata$1());

      defineProperty(this, "media", []);

      defineProperty(this, "occurrences", []);

      defineProperty(this, "samples", []);

      defineProperty(this, "keys", Sample.keys);

      defineProperty(this, "remote", {
        host_url: null,
        // must be set up for remote sync
        api_key: null,
        // must be set up for remote sync
        timeout: 30000,
        // 30s
        user: null,
        // must be set up for remote sync
        password: null,
        // must be set up for remote sync
        synchronising: false
      });

      this.id = options.id; // remote ID

      this.cid = options.cid || getNewUUID();
      this.attrs = _objectSpread$2(_objectSpread$2(_objectSpread$2({}, this.attrs), options.attrs), options.attributes);
      this.metadata = _objectSpread$2(_objectSpread$2({}, this.metadata), options.metadata);
    }

    createClass(Sample, [{
      key: "toJSON",
      value: function toJSON() {
        var occurrences;

        if (!this.occurrences) {
          occurrences = [];
          console.warn('toJSON occurrences missing');
        } else {
          occurrences = this.occurrences.map(function (model) {
            return model.toJSON();
          });
        }

        var samples;

        if (!this.samples) {
          samples = [];
          console.warn('toJSON samples missing');
        } else {
          samples = this.samples.map(function (model) {
            return model.toJSON();
          });
        }

        var media;

        if (!this.media) {
          media = [];
          console.warn('toJSON media missing');
        } else {
          media = this.media.map(function (model) {
            return model.toJSON();
          });
        }

        var data = {
          id: this.id,
          cid: this.cid,
          metadata: this.metadata,
          attrs: this.attrs,
          occurrences: occurrences,
          samples: samples,
          media: media
        };
        return data;
      }
    }, {
      key: "saveRemote",
      value: function () {
        var _saveRemote = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
          var _this$getSubmission, _this$getSubmission2, submission, media, data, resp, timeNow;

          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!(!this.remote.host_url || !this.remote.api_key)) {
                    _context.next = 2;
                    break;
                  }

                  return _context.abrupt("return", Promise.reject(new Error('A "remote" property is not configured.')));

                case 2:
                  _context.prev = 2;
                  this.remote.synchronising = true; // get submission model and all the media

                  _this$getSubmission = this.getSubmission(), _this$getSubmission2 = slicedToArray(_this$getSubmission, 2), submission = _this$getSubmission2[0], media = _this$getSubmission2[1];
                  submission.type = 'samples';
                  _context.next = 8;
                  return normaliseModelData(submission, media);

                case 8:
                  data = _context.sent;
                  _context.next = 11;
                  return this._createRemote(data);

                case 11:
                  resp = _context.sent;
                  this.remote.synchronising = false; // update the model and occurrences with new remote IDs

                  remoteCreateParse(this, resp.data); // update metadata

                  timeNow = new Date();
                  this.metadata.server_on = timeNow;
                  this.metadata.updated_on = timeNow;
                  this.metadata.synced_on = timeNow;
                  return _context.abrupt("return", this);

                case 21:
                  _context.prev = 21;
                  _context.t0 = _context["catch"](2);
                  this.remote.synchronising = false;
                  throw _context.t0;

                case 25:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this, [[2, 21]]);
        }));

        function saveRemote() {
          return _saveRemote.apply(this, arguments);
        }

        return saveRemote;
      }()
    }, {
      key: "getSubmission",
      value: function getSubmission() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var that = this;
        var sampleKeys = typeof this.keys === 'function' ? this.keys() : this.keys;

        var keys = _objectSpread$2(_objectSpread$2({}, Sample.keys), sampleKeys); // warehouse keys/values to transform


        var media = toConsumableArray(this.media); // all media within this and child models


        var submission = {
          id: this.id,
          external_key: this.cid,
          survey_id: this.metadata.survey_id,
          input_form: this.metadata.input_form,
          fields: {},
          media: []
        };

        function mapValue(attr, value) {
          var valuesMapping = keys[attr].values;

          if (!valuesMapping) {
            return value;
          }

          if (typeof valuesMapping === 'function') {
            return valuesMapping(value, submission, that);
          }

          if (valuesMapping instanceof Array) {
            return valuesMapping.find(function (_ref) {
              var val = _ref.value;
              return val === value;
            }).id;
          }

          if (value instanceof Array) {
            return value.map(function (v) {
              return valuesMapping[v];
            });
          }

          return valuesMapping[value];
        }

        function getValue(attr) {
          // no need to send attributes with no values
          var value = that.attrs[attr];

          if (!value) {
            return;
          }

          if (!keys[attr]) {
            if (attr !== 'email') {
              console.warn("Indicia: no such key: ".concat(attr));
            }

            submission.fields[attr] = value;
            return;
          }

          var warehouseAttr = keys[attr].id || attr;
          value = mapValue(attr, value); // don't need to send null or undefined

          if (value) {
            submission.fields[warehouseAttr] = value;
          }
        }

        Object.keys(this.attrs).forEach(getValue);

        var sampleOptions = _objectSpread$2({}, options);

        this.metadata.training && (sampleOptions.training = this.metadata.training);
        this.metadata.release_status && (sampleOptions.release_status = this.metadata.release_status);
        this.metadata.record_status && (sampleOptions.record_status = this.metadata.record_status);
        this.metadata.sensitive && (sampleOptions.sensitive = this.metadata.sensitive);
        this.metadata.confidential && (sampleOptions.confidential = this.metadata.confidential);
        this.metadata.sensitivity_precision && (sampleOptions.sensitivity_precision = this.metadata.sensitivity_precision); // transform sub models
        // occurrences

        var occurrences = [];
        var occurrencesMedia = [];
        this.occurrences.forEach(function (model) {
          var _model$getSubmission = model.getSubmission(sampleOptions),
              _model$getSubmission2 = slicedToArray(_model$getSubmission, 2),
              modelSubmission = _model$getSubmission2[0],
              modelMedia = _model$getSubmission2[1];

          if (!modelSubmission) {
            return;
          }

          occurrences.push(modelSubmission);
          occurrencesMedia = occurrencesMedia.concat(modelMedia);
        });
        submission.occurrences = occurrences;
        media = media.concat(occurrencesMedia); // samples

        var samples = [];
        var samplesMedia = [];
        this.samples.forEach(function (model) {
          var _model$getSubmission3 = model.getSubmission(sampleOptions),
              _model$getSubmission4 = slicedToArray(_model$getSubmission3, 2),
              modelSubmission = _model$getSubmission4[0],
              modelMedia = _model$getSubmission4[1];

          if (!modelSubmission) {
            return;
          }

          samples.push(modelSubmission);
          samplesMedia = samplesMedia.concat(modelMedia);
        });
        submission.samples = samples;
        media = media.concat(samplesMedia); // media - does not return any media-models only JSON data about them

        var mediaSubmission = [];
        this.media.forEach(function (model) {
          var _model$getSubmission5 = model.getSubmission(),
              _model$getSubmission6 = slicedToArray(_model$getSubmission5, 1),
              modelSubmission = _model$getSubmission6[0];

          mediaSubmission.push(modelSubmission);
        });
        submission.media = mediaSubmission;
        return [submission, media];
      }
    }, {
      key: "_createRemote",
      value: function () {
        var _createRemote2 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(data) {
          var url, options, status, _e$errors, errors, message;

          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  url = this.remote.host_url + API_BASE + API_VER + API_SAMPLES_PATH;
                  options = {
                    method: 'POST',
                    headers: {
                      authorization: getUserAuth(this.remote),
                      'x-api-key': this.remote.api_key
                    },
                    body: data
                  };
                  _context2.prev = 2;
                  _context2.next = 5;
                  return makeRequest(url, options);

                case 5:
                  return _context2.abrupt("return", _context2.sent);

                case 8:
                  _context2.prev = 8;
                  _context2.t0 = _context2["catch"](2);
                  status = _context2.t0.status, _e$errors = _context2.t0.errors, errors = _e$errors === void 0 ? [] : _e$errors;

                  if (!(status === 409)) {
                    _context2.next = 13;
                    break;
                  }

                  return _context2.abrupt("return", handleDuplicates(errors));

                case 13:
                  if (!errors) {
                    _context2.next = 16;
                    break;
                  }

                  message = errors.reduce(function (name, err) {
                    return "".concat(name).concat(err.title, "\n");
                  }, '');
                  throw new Error(message);

                case 16:
                  throw _context2.t0;

                case 17:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this, [[2, 8]]);
        }));

        function _createRemote(_x5) {
          return _createRemote2.apply(this, arguments);
        }

        return _createRemote;
      }()
    }]);

    return Sample;
  }();

  defineProperty(Sample, "keys", {
    date: {
      id: 'date'
    },
    sample_method_id: {
      id: 'sample_method_id'
    },
    location: {
      id: 'entered_sref'
    },
    location_type: {
      id: 'entered_sref_system',
      values: {
        british: 'OSGB',
        // for British National Grid
        irish: 'OSIE',
        // for Irish Grid
        channel: 'utm30ed50',
        // for Channel Islands Grid
        latlon: 4326 // for Latitude and Longitude in decimal form (WGS84 datum)

      }
    },
    form: {
      id: 'input_form'
    },
    group: {
      id: 'group_id'
    },
    comment: {
      id: 'comment'
    }
  });

  function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  var Indicia = _objectSpread$3({
    /* global "5.2.1" */
    VERSION: "5.2.1",
    // replaced by build
    Sample: Sample,
    Occurrence: Occurrence,
    Media: Media
  }, CONST);

  exports.Media = Media;
  exports.Occurrence = Occurrence;
  exports.Sample = Sample;
  exports.default = Indicia;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=indicia.js.map
