/*!
 * indicia 4.4.3
 * Indicia JavaScript SDK.
 * https://github.com/Indicia-Team/indicia-js
 * Author Karolis Kazlauskis
 * Released under the GNU GPL v3 license.
 * http://www.gnu.org/licenses/gpl.html
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('underscore'), require('backbone'), require('localforage'), require('jquery')) :
	typeof define === 'function' && define.amd ? define(['underscore', 'backbone', 'localforage', 'jquery'], factory) :
	(global = global || self, global.Indicia = factory(global._, global.Backbone, global.localforage, global.$));
}(this, function (_, Backbone, LocalForage, $) { 'use strict';

	_ = _ && _.hasOwnProperty('default') ? _['default'] : _;
	Backbone = Backbone && Backbone.hasOwnProperty('default') ? Backbone['default'] : Backbone;
	LocalForage = LocalForage && LocalForage.hasOwnProperty('default') ? LocalForage['default'] : LocalForage;
	$ = $ && $.hasOwnProperty('default') ? $['default'] : $;

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _typeof_1 = createCommonjsModule(function (module) {
	function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

	function _typeof(obj) {
	  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
	    module.exports = _typeof = function _typeof(obj) {
	      return _typeof2(obj);
	    };
	  } else {
	    module.exports = _typeof = function _typeof(obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
	    };
	  }

	  return _typeof(obj);
	}

	module.exports = _typeof;
	});

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

	/*!
	 Inspired by localForage Backbone Adapter
	 */
	// For now, we aren't complicated: just set a property off Backbone to
	// serve as our export point.

	var Store =
	/*#__PURE__*/
	function () {
	  function Store() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, Store);

	    var that = this; // initialize db

	    this.localForage = null;
	    this.ready = new Promise(function (resolve, reject) {
	      // check custom drivers (eg. SQLite)
	      var customDriversPromise = new Promise(function (_resolve) {
	        if (options.driverOrder && _typeof_1(options.driverOrder[0]) === 'object') {
	          LocalForage.defineDriver(options.driverOrder[0]).then(_resolve);
	        } else {
	          _resolve();
	        }
	      }); // config

	      customDriversPromise.then(function () {
	        var dbConfig = {
	          name: options.name || 'indicia',
	          storeName: options.storeName || 'models'
	        };

	        if (options.version) {
	          dbConfig.version = options.version;
	        }

	        var driverOrder = options.driverOrder || ['indexeddb', 'websql', 'localstorage'];

	        var drivers = Store._getDriverOrder(driverOrder);

	        var DB = options.LocalForage || LocalForage; // init

	        that.localForage = DB.createInstance(dbConfig);
	        that.localForage.setDriver(drivers).then(function () {
	          resolve(that.localForage);
	        }).catch(reject);
	      });
	    });
	  }

	  createClass(Store, [{
	    key: "sync",
	    value: function sync(method, model, options) {
	      switch (method) {
	        case 'read':
	          return model.cid ? this.find(model, options) : this.findAll(model, options);

	        case 'create':
	          return this.create(model, options);

	        case 'update':
	          return this.update(model, options);

	        case 'delete':
	          return this.destroy(model, options);

	        default:
	          return Promise.reject(new Error("Local Sync method not found ".concat(method)));
	      }
	    }
	  }, {
	    key: "save",
	    value: function save(model, options) {
	      var _this = this;

	      return this._callWhenReady(function () {
	        // save collection
	        if (model instanceof Backbone.Collection) {
	          if (!model.models.length) {
	            return Promise.resolve();
	          }

	          var toWait = [];

	          _.each(model.models, function (collectionModel) {
	            if (collectionModel.store) {
	              toWait.push(collectionModel.save(null, options));
	            }
	          });

	          return Promise.all(toWait);
	        } // early return if no id or cid


	        if (!model.id && !model.cid) {
	          return Promise.reject(new Error('Invalid model passed to store'));
	        }

	        var key = model.cid;
	        return _this.localForage.setItem(key, model.toJSON()).then(function () {
	          return Promise.resolve();
	        }); // don't return anything to update the model
	      });
	    }
	  }, {
	    key: "create",
	    value: function create(model, options) {
	      // We always have an ID available by this point, so we just call
	      // the update method.
	      return this.update(model, options);
	    }
	  }, {
	    key: "update",
	    value: function update(model, options) {
	      return this.save(model, options);
	    }
	  }, {
	    key: "find",
	    value: function find(model) {
	      var _this2 = this;

	      return this._callWhenReady(function () {
	        return (// eslint-disable-line
	          _this2.localForage.getItem(model.cid).then(function (data) {
	            if (!data) {
	              return Promise.reject("LocalForage entry with ".concat(model.cid, " as key not found"));
	            }

	            return data;
	          })
	        );
	      });
	    } // Only used by `Backbone.Collection#sync`.

	  }, {
	    key: "findAll",
	    value: function findAll() {
	      var _this3 = this;

	      return this._callWhenReady(function () {
	        // build up samples
	        var models = [];
	        return _this3.localForage.iterate(function (value) {
	          models.push(value);
	        }).then(function () {
	          return Promise.resolve(models);
	        });
	      });
	    }
	  }, {
	    key: "destroy",
	    value: function destroy(model) {
	      var _this4 = this;

	      return this._callWhenReady(function () {
	        // collection destroy
	        if (model instanceof Backbone.Collection) {
	          if (!model.models.length) {
	            return Promise.resolve();
	          }

	          var toWait = []; // need to clone:
	          // http://stackoverflow.com/questions/10858935/cleanest-way-to-destroy-every-model-in-a-collection-in-backbone

	          _.each(_.clone(model.models), function (collectionModel) {
	            if (collectionModel.store) toWait.push(collectionModel.destroy());
	          });

	          return Promise.all(toWait);
	        } // early return if no id or cid


	        if (!model.id && !model.cid) {
	          return Promise.reject(new Error('Invalid model passed to store'));
	        }

	        var key = model.cid;
	        return _this4.localForage.removeItem(key).then(function () {
	          return Promise.resolve(model.toJSON());
	        });
	      });
	    }
	  }, {
	    key: "_callWhenReady",
	    value: function _callWhenReady(func) {
	      var that = this;
	      return this.ready.then(function () {
	        return func.bind(that)();
	      });
	    }
	  }], [{
	    key: "_getDriverOrder",
	    value: function _getDriverOrder(driverOrder) {
	      return driverOrder.map(function (driver) {
	        switch (driver) {
	          case 'indexeddb':
	            return LocalForage.INDEXEDDB;

	          case 'websql':
	            return LocalForage.WEBSQL;

	          case 'localstorage':
	            return LocalForage.LOCALSTORAGE;

	          default:
	            // custom
	            if (_typeof_1(driver) === 'object' && driver._driver) {
	              return driver._driver;
	            }

	            return console.error('No such db driver!');
	        }
	      });
	    }
	  }]);

	  return Store;
	}();

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	var arrayWithHoles = _arrayWithHoles;

	function _iterableToArrayLimit(arr, i) {
	  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
	    return;
	  }

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
	  throw new TypeError("Invalid attempt to destructure non-iterable instance");
	}

	var nonIterableRest = _nonIterableRest;

	function _slicedToArray(arr, i) {
	  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
	}

	var slicedToArray = _slicedToArray;

	var Collection = Backbone.Collection.extend({
	  constructor: function constructor() {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    this.store = options.store || this.store || new Store();

	    if (!options.model && !this.model) {
	      console.error("Collection's model must be provided");
	      return;
	    }

	    Backbone.Collection.prototype.constructor.apply(this, arguments);
	  },
	  comparator: function comparator(a) {
	    return a.metadata.created_on;
	  },
	  size: function size() {
	    return Promise.resolve(this.length);
	  },

	  /**
	   * New function to save all models within the collection.
	   * @param models
	   * @param options
	   */
	  save: function save(collection, options) {
	    return this.sync('create', collection || this, options);
	  },

	  /**
	   * New function to destroy all models within the collection.
	   * @returns {*}
	   */
	  destroy: function destroy(collection, options) {
	    return this.sync('delete', collection || this, options);
	  },

	  /**
	   * New function to fetch all models within the collection.
	   * @returns {*}
	   */
	  fetch: function fetch(options) {
	    options = _.extend({
	      parse: true
	    }, options);
	    var collection = this;
	    return this.sync('read', this, options).then(function (resp) {
	      var method = options.reset ? 'reset' : 'set';
	      collection[method](resp, options);

	      try {
	        collection.trigger('sync', collection, resp, options);
	      } catch (e) {
	        /* continue on listener error */
	      }
	    });
	  },

	  /**
	   * Synchronises the collection.
	   * @param method
	   * @param model
	   * @param options
	   */
	  sync: function sync(method, collection) {
	    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    if (options.remote) {
	      return this._syncRemote(method, collection, options);
	    }

	    if (!this.store) {
	      return Promise.reject(new Error('Trying to locally sync a collection without a store'));
	    }

	    try {
	      this.trigger('request', collection, null, options);
	    } catch (e) {
	      /* continue on listener error */
	    }

	    return this.store.sync(method, collection, options);
	  },

	  /**
	   * Syncs the collection to the remote server.
	   * Returns on success: model, response, options
	   */
	  _syncRemote: function _syncRemote(method, collection, options) {
	    collection.synchronising = true; // model.trigger('request', model, xhr, options);

	    switch (method) {
	      case 'create':
	        {
	          if (!collection.models.length) {
	            return Promise.resolve();
	          }

	          var toWait = [];

	          _.each(collection.models, function (model) {
	            if (model.store) toWait.push(model.save(null, options));
	          });

	          return Promise.all(toWait);
	        }

	      case 'update':
	        // todo
	        collection.synchronising = false;
	        return Promise.reject(new Error('Updating the model is not possible yet.'));

	      case 'read':
	        // todo
	        collection.synchronising = false;
	        return Promise.reject(new Error('Reading the model is not possible yet.'));

	      case 'delete':
	        // todo
	        collection.synchronising = false;
	        return Promise.reject(new Error('Deleting the model is not possible yet.'));

	      default:
	        collection.synchronising = false;
	        return Promise.reject(new Error("No such remote sync option: ".concat(method)));
	    }
	  },

	  /**
	   * Returns an object with attributes and their values
	   * mapped for warehouse submission.
	   *
	   * @returns {*}
	   */
	  _getSubmission: function _getSubmission(options) {
	    var submission = [];
	    var media = []; // transform its models

	    this.models.forEach(function (model) {
	      var _model$_getSubmission = model._getSubmission(options),
	          _model$_getSubmission2 = slicedToArray(_model$_getSubmission, 2),
	          modelSubmission = _model$_getSubmission2[0],
	          modelMedia = _model$_getSubmission2[1];

	      submission.push(modelSubmission);
	      media = media.concat(modelMedia);
	    });
	    return [submission, media];
	  },
	  // Prepare a hash of attributes (or other model) to be added to this
	  // collection.
	  _prepareModel: function _prepareModel(options) {
	    if (this._isModel(options)) {
	      if (!options.collection) options.collection = this;
	      return options;
	    }

	    var attrs = options.attributes;
	    options = options ? _.clone(options) : {};
	    options.collection = this;
	    options.store = this.store;
	    var model = new this.model(attrs, options); // eslint-disable-line

	    if (!model.validationError) return model;
	    this.trigger('invalid', this, model.validationError, options);
	    return false;
	  }
	});

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
	      arr2[i] = arr[i];
	    }

	    return arr2;
	  }
	}

	var arrayWithoutHoles = _arrayWithoutHoles;

	function _iterableToArray(iter) {
	  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
	}

	var iterableToArray = _iterableToArray;

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance");
	}

	var nonIterableSpread = _nonIterableSpread;

	function _toConsumableArray(arr) {
	  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
	}

	var toConsumableArray = _toConsumableArray;

	/* eslint-disable */
	var API_BASE = 'api/',
	    API_VER = 'v1',
	    API_SAMPLES_PATH = '/samples',
	    API_REPORTS_PATH = '/reports',
	    SYNCHRONISING = 0,
	    SYNCED = 1,
	    LOCAL = 2,
	    SERVER = 3,
	    CHANGED_LOCALLY = 4,
	    CHANGED_SERVER = 5,
	    CONFLICT = -1;

	var CONST = /*#__PURE__*/Object.freeze({
		__proto__: null,
		API_BASE: API_BASE,
		API_VER: API_VER,
		API_SAMPLES_PATH: API_SAMPLES_PATH,
		API_REPORTS_PATH: API_REPORTS_PATH,
		SYNCHRONISING: SYNCHRONISING,
		SYNCED: SYNCED,
		LOCAL: LOCAL,
		SERVER: SERVER,
		CHANGED_LOCALLY: CHANGED_LOCALLY,
		CHANGED_SERVER: CHANGED_SERVER,
		CONFLICT: CONFLICT
	});

	/** *********************************************************************
	 * HELPER FUNCTIONS
	 **********************************************************************/

	/**
	 * Generate UUID.
	 */

	/* eslint-disable no-bitwise */
	var getNewUUID = function getNewUUID() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0;
	    var v = c === 'x' ? r : r & 0x3 | 0x8;
	    return v.toString(16);
	  });
	};
	/* eslint-enable no-bitwise */

	/**
	 * Converts DataURI object to a Blob.
	 *
	 * @param {type} dataURI
	 * @param {type} fileType
	 * @returns {undefined}
	 */


	var dataURItoBlob = function dataURItoBlob(dataURI, fileType) {
	  var binary = atob(dataURI.split(',')[1]);
	  var array = [];

	  for (var i = 0; i < binary.length; i++) {
	    array.push(binary.charCodeAt(i));
	  }

	  return new Blob([new Uint8Array(array)], {
	    type: fileType
	  });
	}; // Detecting data URLs
	// https://gist.github.com/bgrins/6194623
	// data URI - MDN https://developer.mozilla.org/en-US/docs/data_URIs
	// The 'data' URL scheme: http://tools.ietf.org/html/rfc2397
	// Valid URL Characters: http://tools.ietf.org/html/rfc2396#section2


	var isDataURL = function isDataURL(string) {
	  if (!string) {
	    return false;
	  }

	  var normalized = string.toString(); // numbers

	  /* eslint-disable no-useless-escape, max-len */

	  var regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
	  return !!normalized.match(regex);
	};
	/* eslint-enable no-useless-escape, max-len  */
	// From jQuery 1.4.4 .

	/* eslint-disable */


	var isPlainObject = function isPlainObject(obj) {
	  function type(obj) {
	    var class2type = {};
	    var types = 'Boolean Number String Function Array Date RegExp Object'.split(' ');

	    for (var i = 0; i < types.length; i++) {
	      class2type["[object ".concat(types[i], "]")] = types[i].toLowerCase();
	    }

	    return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
	  }

	  function isWindow(obj) {
	    return obj && _typeof_1(obj) === 'object' && 'setInterval' in obj;
	  } // Must be an Object.
	  // Because of IE, we also have to check the presence of the constructor property.
	  // Make sure that DOM nodes and window objects don't pass through, as well


	  if (!obj || type(obj) !== 'object' || obj.nodeType || isWindow(obj)) {
	    return false;
	  } // Not own constructor property must be Object


	  if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
	    return false;
	  } // Own properties are enumerated firstly, so to speed up,
	  // if last one is own, then all properties are own.


	  var key;

	  for (key in obj) {}

	  return key === undefined || hasOwn.call(obj, key);
	}; // checks if the object has any elements.


	var isEmptyObject = function isEmptyObject(obj) {
	  for (var key in obj) {
	    return false;
	  }

	  return true;
	};
	/* eslint-enable */

	/**
	 * Formats the date to Indicia Warehouse format.
	 * @param date String or Date object
	 * @returns String formatted date
	 */


	var formatDate = function formatDate(dateToFormat) {
	  var date = dateToFormat;
	  var now = new Date();
	  var day = 0;
	  var month = 0;
	  var reg = /\d{2}\/\d{2}\/\d{4}$/;
	  var regDash = /\d{4}-\d{1,2}-\d{1,2}$/;
	  var regDashInv = /\d{1,2}-\d{1,2}-\d{4}$/;
	  var dateArray = [];

	  if (typeof date === 'string') {
	    dateArray = date.split('-'); // check if valid

	    if (reg.test(date)) {
	      return date; // dashed
	    } else if (regDash.test(date)) {
	      date = new Date(window.parseInt(dateArray[0]), window.parseInt(dateArray[1]) - 1, window.parseInt(dateArray[2])); // inversed dashed
	    } else if (regDashInv.test(date)) {
	      date = new Date(window.parseInt(dateArray[2]), window.parseInt(dateArray[1]) - 1, window.parseInt(dateArray[0]));
	    }
	  }

	  now = date || now;
	  day = "0".concat(now.getDate()).slice(-2);
	  month = "0".concat(now.getMonth() + 1).slice(-2);
	  return "".concat(day, "/").concat(month, "/").concat(now.getFullYear());
	};

	var helpers = {
	  getNewUUID: getNewUUID,
	  dataURItoBlob: dataURItoBlob,
	  isDataURL: isDataURL,
	  isPlainObject: isPlainObject,
	  isEmptyObject: isEmptyObject,
	  formatDate: formatDate
	};

	var helpers$1 = {
	  save: function save(key, val, options) {
	    var model = this; // Handle both `"key", value` and `{key: value}` -style arguments.

	    var attrs;

	    if (key == null || _typeof_1(key) === 'object') {
	      attrs = key;
	      options = val;
	    } else {
	      (attrs = {})[key] = val;
	    }

	    options = _.extend({
	      validate: true,
	      parse: true
	    }, options);
	    var wait = options.wait; // If we're not waiting and attributes exist, save acts as
	    // `set(attr).save(null, opts)` with validation. Otherwise, check if
	    // the model will be valid when the attributes, if any, are set.

	    if (attrs && !wait) {
	      if (!this.set(attrs, options)) return false;
	    } else if (!this._validate(attrs, options)) {
	      return false;
	    } // After a successful server-side save, the client is (optionally)
	    // updated with the server-side state.


	    var attributes = model.attributes; // Set temporary attributes if `{wait: true}` to properly find new ids.

	    if (attrs && wait) model.attributes = _.extend({}, attributes, attrs);
	    var method = 'create';

	    if (!model.isNew() && options.remote) {
	      method = options.patch ? 'patch' : 'update';
	    }

	    if (method === 'patch' && !options.attrs) options.attrs = attrs; // parent save

	    if (model.parent && !options.remote) {
	      return model.parent.save(key, val, options).then(function () {
	        // Ensure attributes are restored during synchronous saves.
	        model.attributes = attributes;

	        try {
	          model.trigger('sync', model, null, options);
	        } catch (e) {
	          /* continue on listener error */
	        }

	        return model;
	      }).catch(function (err) {
	        try {
	          model.trigger('error', err);
	        } catch (e) {
	          /* continue on listener error */
	        }

	        return Promise.reject(err);
	      });
	    } // model save


	    return model.sync(method, model, options).then(function (resp) {
	      if (options.remote) {
	        // update the model and occurrences with new remote IDs
	        model._remoteCreateParse(model, resp.data); // update metadata


	        var timeNow = new Date();
	        model.metadata.server_on = timeNow;
	        model.metadata.updated_on = timeNow;
	        model.metadata.synced_on = timeNow; // Ensure attributes are restored during synchronous saves.

	        model.attributes = attributes; // save model's changes locally

	        return model.save().then(function () {
	          try {
	            model.trigger('sync:remote', model, resp, options);
	          } catch (e) {
	            /* continue on listener error */
	          }

	          return model;
	        });
	      }

	      try {
	        model.trigger('sync', model, resp, options);
	      } catch (e) {
	        /* continue on listener error */
	      }

	      return model;
	    }).catch(function (err) {
	      try {
	        model.trigger('error', err);
	      } catch (e) {
	        /* continue on listener error */
	      }

	      return Promise.reject(err);
	    });
	  },

	  /**
	   *
	   * @param options
	   * @returns {Promise}
	   */
	  destroy: function destroy() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var model = this;
	    var collection = this.collection; // keep reference for triggering

	    var promise = new Promise(function (fulfill, reject) {
	      function finalise() {
	        // removes from all collections etc
	        model.stopListening();

	        try {
	          model.trigger('destroy', model, collection, options);
	        } catch (e) {
	          /* continue on listener error */
	        }

	        if (!options.noSave) {
	          // parent save the changes permanently
	          model.parent.save(null, options).then(function () {
	            try {
	              model.trigger('sync', model, null, options);
	            } catch (e) {
	              /* continue on listener error */
	            }

	            fulfill(model);
	          });
	        } else {
	          try {
	            model.trigger('sync', model, null, options);
	          } catch (e) {
	            /* continue on listener error */
	          }

	          fulfill(model);
	        }
	      }

	      if (model.parent) {
	        if (options.remote) {
	          // destroy remotely
	          model.sync('delete', model, options).then(finalise);
	        } else {
	          finalise();
	        }
	      } else {
	        // destroy locally/remotely
	        model.sync('delete', model, options).then(function () {
	          // removes from all collections etc
	          model.stopListening();

	          try {
	            model.trigger('destroy', model, collection, options);
	          } catch (e) {
	            /* continue on listener error */
	          }

	          try {
	            model.trigger('sync', model, null, options);
	          } catch (e) {
	            /* continue on listener error */
	          }

	          fulfill(model);
	        }).catch(reject);
	      }
	    });
	    return promise;
	  }
	};

	var THUMBNAIL_WIDTH = 100; // px

	var THUMBNAIL_HEIGHT = 100; // px

	var Media = Backbone.Model.extend({
	  constructor: function constructor() {
	    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    var attrs = attributes;

	    if (typeof attributes === 'string') {
	      var data = attributes;
	      attrs = {
	        data: data
	      };
	      return;
	    }

	    this.id = options.id; // remote ID

	    this.cid = options.cid || helpers.getNewUUID();
	    this.setParent(options.parent || this.parent);
	    this.attributes = {};
	    if (options.collection) this.collection = options.collection;
	    if (options.parse) attrs = this.parse(attrs, options) || {};
	    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
	    this.set(attrs, options);
	    this.changed = {};

	    if (options.metadata) {
	      this.metadata = options.metadata;
	    } else {
	      this.metadata = {
	        created_on: new Date()
	      };
	    }

	    this.initialize.apply(this, arguments); // eslint-disable-line
	  },

	  /**
	   * Synchronises the model.
	   * @param method
	   * @param model
	   * @param options
	   */
	  sync: function sync(method, model) {
	    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    if (options.remote) {
	      return this._syncRemote(method, model, options);
	    }

	    return Promise.reject(new Error('Local sync is not possible yet.'));
	  },

	  /**
	   * Syncs the record to the remote server.
	   * Returns on success: model, response, options
	   */
	  _syncRemote: function _syncRemote() {
	    return Promise.reject(new Error('Remote sync is not possible yet.'));
	  },

	  /**
	   * Returns image's absolute URL or dataURI.
	   */
	  getURL: function getURL() {
	    return this.get('data');
	  },

	  /**
	   * Sets parent.
	   * @param parent
	   */
	  setParent: function setParent(parent) {
	    if (!parent) return;
	    var that = this;
	    this.parent = parent;
	    this.parent.on('destroy', function () {
	      that.destroy({
	        noSave: true
	      });
	    });
	  },

	  /**
	   * Resizes itself.
	   */
	  resize: function resize(MAX_WIDTH, MAX_HEIGHT) {
	    var _this = this;

	    var that = this;
	    var promise = new Promise(function (fulfill, reject) {
	      Media.resize(_this.getURL(), _this.get('type'), MAX_WIDTH, MAX_HEIGHT).then(function (args) {
	        var _args = slicedToArray(args, 2),
	            image = _args[0],
	            data = _args[1];

	        that.set('data', data);
	        fulfill([image, data]);
	      }).catch(reject);
	    });
	    return promise;
	  },

	  /**
	   * Adds a thumbnail to image model.
	   * @param options
	   */
	  addThumbnail: function addThumbnail() {
	    var _this2 = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var that = this;
	    var promise = new Promise(function (fulfill, reject) {
	      // check if data source is dataURI
	      var re = /^data:/i;

	      if (re.test(_this2.getURL())) {
	        Media.resize(_this2.getURL(), _this2.get('type'), THUMBNAIL_WIDTH || options.width, THUMBNAIL_WIDTH || options.width).then(function (args) {
	          var _args2 = slicedToArray(args, 2),
	              data = _args2[1];

	          that.set('thumbnail', data);
	          fulfill();
	        }).catch(reject);
	        return;
	      }

	      Media.getDataURI(_this2.getURL(), {
	        width: THUMBNAIL_WIDTH || options.width,
	        height: THUMBNAIL_HEIGHT || options.height
	      }).then(function (data) {
	        that.set('thumbnail', data[0]);
	        fulfill();
	      }).catch(reject);
	    });
	    return promise;
	  },
	  // overwrite if you want to validate before saving remotely
	  validate: function validate(attributes) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    if (options.remote) {
	      return this.validateRemote(attributes, options);
	    }

	    return null;
	  },
	  validateRemote: function validateRemote(attributes) {
	    var attrs = _.extend({}, this.attributes, attributes);

	    var errors = {}; // type

	    if (!attrs.data) {
	      errors.attributes || (errors.attributes = {});
	      errors.attributes.data = "can't be empty";
	    }

	    if (!attrs.type) {
	      errors.attributes || (errors.attributes = {});
	      errors.attributes.type = "can't be empty";
	    }

	    if (!_.isEmpty(errors)) {
	      return errors;
	    }

	    return null;
	  },
	  toJSON: function toJSON() {
	    var data = {
	      id: this.id,
	      cid: this.cid,
	      metadata: this.metadata,
	      attributes: this.attributes
	    };
	    return data;
	  },

	  /**
	   * Returns an object with attributes and their values
	   * mapped for warehouse submission.
	   *
	   * @returns {*}
	   */
	  _getSubmission: function _getSubmission() {
	    var submission = {
	      id: this.id,
	      name: this.cid
	    };
	    return [submission];
	  }
	});

	_.extend(Media.prototype, helpers$1);

	_.extend(Media, {
	  /**
	   * Transforms and resizes an image file into a string.
	   * Can accept file image path and a file input file.
	   *
	   * @param onError
	   * @param file
	   * @param onSaveSuccess
	   * @returns {number}
	   */
	  getDataURI: function getDataURI(file) {
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
	  },

	  /**
	   * http://stackoverflow.com/questions/2516117/how-to-scale-an-image-in-data-uri-format-in-javascript-real-scaling-not-usin
	   * @param data
	   * @param fileType
	   * @param MAX_WIDTH
	   * @param MAX_HEIGHT
	   */
	  resize: function resize(data, fileType, MAX_WIDTH, MAX_HEIGHT) {
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
	});

	var Occurrence = Backbone.Model.extend({
	  Media: Media,
	  constructor: function constructor() {
	    var _this = this;

	    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    var that = this;
	    var attrs = attributes;
	    this.id = options.id; // remote ID

	    this.cid = options.cid || helpers.getNewUUID();
	    this.setParent(options.parent || this.parent);
	    this.keys = options.keys || this.keys; // warehouse attribute keys

	    if (options.Media) this.Media = options.Media;
	    this.attributes = {};
	    if (options.collection) this.collection = options.collection;
	    if (options.parse) attrs = this.parse(attrs, options) || {};
	    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
	    this.set(attrs, options);
	    this.changed = {};
	    this.metadata = this._getDefaultMetadata(options);

	    if (options.media) {
	      var mediaArray = [];

	      _.each(options.media, function (media) {
	        if (media instanceof _this.Media) {
	          media.setParent(that);
	          mediaArray.push(media);
	        } else {
	          var modelOptions = _.extend(media, {
	            parent: that
	          });

	          mediaArray.push(new _this.Media(media.attributes, modelOptions));
	        }
	      });

	      this.media = new Collection(mediaArray, {
	        model: this.Media
	      });
	    } else {
	      this.media = new Collection([], {
	        model: this.Media
	      });
	    }

	    this.initialize.apply(this, arguments); // eslint-disable-line
	  },

	  /**
	   * Sets parent.
	   * todo: move to private _space
	   * @param parent
	   */
	  setParent: function setParent(parent) {
	    if (!parent) return;
	    var that = this;
	    this.parent = parent;
	    this.parent.on('destroy', function () {
	      that.destroy({
	        noSave: true
	      });
	    });
	  },

	  /**
	   * Adds an media to occurrence and sets the medias's parent to this.
	   * @param media
	   */
	  addMedia: function addMedia(mediaObj) {
	    if (!mediaObj) return;
	    mediaObj.setParent(this);
	    this.media.add(mediaObj);
	  },

	  /**
	   * Returns child media.
	   * @param index
	   * @returns {*}
	   */
	  getMedia: function getMedia() {
	    var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	    return this.media.at(index);
	  },
	  // overwrite if you want to validate before saving remotely
	  validate: function validate(attributes) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    if (options.remote) {
	      return this.validateRemote(attributes, options);
	    }

	    return null;
	  },
	  validateRemote: function validateRemote(attributes) {
	    var attrs = _.extend({}, this.attributes, attributes);

	    var media = {};
	    var modelErrors = {}; // location

	    if (!attrs.taxon) {
	      modelErrors.taxon = "can't be blank";
	    } // media


	    if (this.media.length) {
	      this.media.each(function (mediaModel) {
	        var errors = mediaModel.validateRemote();

	        if (errors) {
	          var mediaID = mediaModel.cid;
	          media[mediaID] = errors;
	        }
	      });
	    }

	    var errors = {};

	    if (!_.isEmpty(media)) {
	      errors.media = media;
	    }

	    if (!_.isEmpty(modelErrors)) {
	      errors.attributes = modelErrors;
	    }

	    if (!_.isEmpty(errors)) {
	      return errors;
	    }

	    return null;
	  },
	  toJSON: function toJSON() {
	    var media;

	    if (!this.media) {
	      media = [];
	      console.warn('toJSON media missing');
	    } else {
	      media = this.media.toJSON();
	    }

	    var data = {
	      id: this.id,
	      cid: this.cid,
	      metadata: this.metadata,
	      attributes: this.attributes,
	      media: media
	    };
	    return data;
	  },

	  /**
	   * Returns an object with attributes and their values
	   * mapped for warehouse submission.
	   *
	   * @returns {*}
	   */
	  _getSubmission: function _getSubmission() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var that = this;
	    var occKeys = typeof this.keys === 'function' ? this.keys() : this.keys;
	    var keys = $.extend(true, Occurrence.keys, occKeys); // warehouse keys/values to transform

	    var media = toConsumableArray(this.media.models); // all media within this and child models


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
	    } // transform attributes


	    Object.keys(this.attributes).forEach(function (attr) {
	      // no need to send attributes with no values
	      var value = that.attributes[attr];
	      if (!value) return;

	      if (!keys[attr]) {
	        if (attr !== 'email') {
	          console.warn("Indicia: no such key: ".concat(attr));
	        }

	        submission.fields[attr] = value;
	        return;
	      }

	      var warehouseAttr = keys[attr].id || attr; // check if has values to choose from

	      if (keys[attr].values) {
	        if (typeof keys[attr].values === 'function') {
	          // get a value from a function
	          value = keys[attr].values(value, submission, that);
	        } else if (_.isArray(value)) {
	          // the attribute has multiple values
	          value = value.map(function (v) {
	            return keys[attr].values[v];
	          });
	        } else {
	          value = keys[attr].values[value];
	        }
	      } // don't need to send null or undefined


	      if (value) {
	        submission.fields[warehouseAttr] = value;
	      }
	    }); // transform sub models
	    // media does not return any media-models only JSON data about them
	    // media files will be attached separately

	    var _this$media$_getSubmi = this.media._getSubmission(),
	        _this$media$_getSubmi2 = slicedToArray(_this$media$_getSubmi, 1),
	        mediaSubmission = _this$media$_getSubmi2[0];

	    submission.media = mediaSubmission;
	    return [submission, media];
	  },

	  /**
	   * Synchronises the model.
	   * @param method
	   * @param model
	   * @param options
	   */
	  sync: function sync(method, model) {
	    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    if (options.remote) {
	      return this._syncRemote(method, model, options);
	    }

	    return Promise.reject(new Error('Local sync is not possible yet.'));
	  },

	  /**
	   * Syncs the record to the remote server.
	   * Returns on success: model, response, options
	   */
	  _syncRemote: function _syncRemote() {
	    return Promise.reject(new Error('Remote sync is not possible yet.'));
	  },
	  _getDefaultMetadata: function _getDefaultMetadata(options) {
	    var metadata = typeof this.metadata === 'function' ? this.metadata() : this.metadata;
	    options.metadata = options.metadata || {};
	    var today = new Date();
	    var defaults = {
	      training: options.training,
	      created_on: today,
	      updated_on: today,
	      synced_on: null,
	      // set when fully initialized only
	      server_on: null // updated on server

	    };
	    return $.extend(true, defaults, metadata, options.metadata);
	  }
	});

	_.extend(Occurrence.prototype, helpers$1);
	/**
	 * Warehouse attributes and their values.
	 */


	Occurrence.keys = {
	  taxon: {
	    id: 'taxa_taxon_list_id'
	  },
	  comment: {
	    id: 'comment'
	  }
	};

	var Sample = Backbone.Model.extend({
	  Media: Media,
	  Occurrence: Occurrence,
	  host_url: null,
	  // must be set up for remote sync
	  api_key: null,
	  // must be set up for remote sync
	  user: null,
	  // must be set up for remote sync
	  password: null,
	  // must be set up for remote sync
	  constructor: function constructor() {
	    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    this.id = options.id; // remote ID

	    this.cid = options.cid || helpers.getNewUUID();
	    this.setParent(options.parent || this.parent);
	    this.store = options.store || this.store || new Store();
	    this.keys = options.keys || this.keys; // warehouse attribute keys

	    if (options.Media) this.Media = options.Media;
	    if (options.Occurrence) this.Occurrence = options.Occurrence;
	    if (options.onSend) this.onSend = options.onSend; // remote host defaults

	    this.host_url = options.host_url || this.host_url;
	    this.api_key = options.api_key || this.api_key;
	    this.user = options.user || this.user;
	    this.password = options.password || this.password; // attrs

	    this.attributes = {};
	    var defaultAttrs = {
	      date: new Date(),
	      location_type: 'latlon'
	    };

	    var attrs = _.extend(defaultAttrs, attributes);

	    if (options.collection) this.collection = options.collection;
	    if (options.parse) attrs = this.parse(attrs, options) || {};
	    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
	    this.set(attrs, options);
	    this.changed = {}; // metadata

	    this.metadata = this._getDefaultMetadata(options);
	    this.remote = {}; // for synchronisation state
	    // initialise sub models

	    this.occurrences = this._parseModels(options.occurrences, this.Occurrence);
	    this.samples = this._parseModels(options.samples, this.constructor);
	    this.media = this._parseModels(options.media, this.Media);
	    this.initialize.apply(this, arguments); // eslint-disable-line
	  },

	  /**
	   * Sets parent.
	   * @param parent
	   */
	  setParent: function setParent(parent) {
	    if (!parent) return;
	    var that = this;
	    this.parent = parent;
	    this.parent.on('destroy', function () {
	      that.destroy({
	        noSave: true
	      });
	    });
	  },

	  /**
	   * Adds a subsample to the sample and sets the samples's parent to this.
	   * @param sample
	   */
	  addSample: function addSample(sample) {
	    if (!sample) return;
	    sample.setParent(this);
	    this.samples.push(sample);
	  },

	  /**
	   * Adds an occurrence to sample and sets the occurrence's sample to this.
	   * @param occurrence
	   */
	  addOccurrence: function addOccurrence(occurrence) {
	    if (!occurrence) return;
	    occurrence.setParent(this);
	    this.occurrences.push(occurrence);
	  },

	  /**
	   * Adds an media to occurrence and sets the media's occurrence to this.
	   * @param media
	   */
	  addMedia: function addMedia(media) {
	    if (!media) return;
	    media.setParent(this);
	    this.media.add(media);
	  },
	  // overwrite if you want to validate before saving locally
	  validate: function validate(attributes) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    if (options.remote) {
	      return this.validateRemote(attributes, options);
	    }

	    return null;
	  },
	  validateRemote: function validateRemote(attributes) {
	    var attrs = _.extend({}, this.attributes, attributes);

	    var modelErrors = {};
	    var samples = {};
	    var occurrences = {};
	    var media = {}; // location

	    if (!attrs.location) {
	      modelErrors.location = "can't be blank";
	    } // location type


	    if (!attrs.location_type) {
	      modelErrors.location_type = "can't be blank";
	    } // date


	    if (!attrs.date) {
	      modelErrors.date = "can't be blank";
	    } else {
	      var date = new Date(attrs.date);

	      if (date === 'Invalid Date' || date > new Date()) {
	        modelErrors.date = new Date(date) > new Date() ? 'future date' : 'invalid';
	      }
	    } // check if has any indirect occurrences


	    if (!this.samples.length && !this.occurrences.length) {
	      modelErrors.occurrences = 'no occurrences';
	    } // samples


	    if (this.samples.length) {
	      this.samples.each(function (model) {
	        var errors = model.validateRemote();

	        if (errors) {
	          var sampleID = model.cid;
	          samples[sampleID] = errors;
	        }
	      });
	    } // occurrences


	    if (this.occurrences.length) {
	      this.occurrences.each(function (occurrence) {
	        var errors = occurrence.validateRemote();

	        if (errors) {
	          var occurrenceID = occurrence.cid;
	          occurrences[occurrenceID] = errors;
	        }
	      });
	    } // media


	    if (this.media.length) {
	      this.media.each(function (mediaModel) {
	        var errors = mediaModel.validateRemote();

	        if (errors) {
	          var mediaID = mediaModel.cid;
	          media[mediaID] = errors;
	        }
	      });
	    }

	    var errors = {};

	    if (!_.isEmpty(media)) {
	      errors.media = media;
	    }

	    if (!_.isEmpty(occurrences)) {
	      errors.occurrences = occurrences;
	    }

	    if (!_.isEmpty(samples)) {
	      errors.samples = samples;
	    }

	    if (!_.isEmpty(modelErrors)) {
	      errors.attributes = modelErrors;
	    }

	    if (!_.isEmpty(errors)) {
	      return errors;
	    }

	    return null;
	  },

	  /**
	   * Synchronises the model.
	   * @param method
	   * @param model
	   * @param options
	   */
	  sync: function sync(method, model) {
	    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    if (options.remote) {
	      return this._syncRemote(method, model, options);
	    }

	    if (!this.store) {
	      return Promise.reject(new Error('Trying to locally sync a model without a store'));
	    }

	    try {
	      this.trigger('request', model, null, options);
	    } catch (e) {
	      /* continue on listener error */
	    }

	    return this.store.sync(method, model, options);
	  },

	  /**
	   * Syncs the record to the remote server.
	   * Returns on success: model, response, options
	   */
	  _syncRemote: function _syncRemote(method, model, options) {
	    // Ensure that we have a URL.
	    if (!this.host_url) {
	      return Promise.reject(new Error('A "url" property or function must be specified'));
	    }

	    model.remote.synchronising = true; // model.trigger('request', model, xhr, options);

	    switch (method) {
	      case 'create':
	        return this._create(model, options).then(function (val) {
	          model.remote.synchronising = false;
	          return val;
	        }).catch(function (err) {
	          model.remote.synchronising = false;
	          return Promise.reject(err);
	        });

	      case 'update':
	        // todo
	        model.remote.synchronising = false;
	        return Promise.reject(new Error('Updating the model is not possible yet.'));

	      case 'read':
	        // todo
	        model.remote.synchronising = false;
	        return Promise.reject(new Error('Reading the model is not possible yet.'));

	      case 'delete':
	        // todo
	        model.remote.synchronising = false;
	        return Promise.reject(new Error('Deleting the model is not possible yet.'));

	      default:
	        model.remote.synchronising = false;
	        return Promise.reject(new Error("No such remote sync option: ".concat(method)));
	    }
	  },

	  /**
	   * Posts a record to remote server.
	   * @param model
	   * @param options
	   */
	  _create: function _create(model, options) {
	    var that = this; // async call to get the form data

	    return that._getModelData(model).then(function (data) {
	      return that._ajaxModel(data, model, options);
	    });
	  },
	  _ajaxModel: function _ajaxModel(data, model, options) {
	    var that = this;
	    var promise = new Promise(function (fulfill, reject) {
	      // get timeout
	      var timeout = options.timeout || that.timeout || 30000; // 30s

	      timeout = typeof timeout === 'function' ? timeout() : timeout;
	      var url = that.host_url + API_BASE + API_VER + API_SAMPLES_PATH;
	      var xhr = options.xhr = Backbone.ajax({
	        url: url,
	        type: 'POST',
	        data: data,
	        headers: {
	          authorization: that.getUserAuth(),
	          'x-api-key': that.api_key
	        },
	        processData: false,
	        contentType: false,
	        timeout: timeout
	      });
	      xhr.done(function (responseData) {
	        return fulfill(responseData);
	      });
	      xhr.fail(function (jqXHR, textStatus, errorThrown) {
	        if (jqXHR.status === 409) {
	          // duplicate occurred - this fixes only occurrence duplicates!
	          // todo: remove once this is sorted
	          var responseData = {
	            data: {
	              id: null,
	              external_key: null,
	              occurrences: []
	            }
	          };
	          jqXHR.responseJSON.errors.forEach(function (error) {
	            responseData.data.id = error.sample_id;
	            responseData.data.external_key = error.sample_external_key;
	            responseData.data.occurrences.push({
	              id: error.id,
	              external_key: error.external_key
	            });
	          });
	          fulfill(responseData);
	          return;
	        }

	        var error = new Error(errorThrown);

	        if (jqXHR.responseJSON && jqXHR.responseJSON.errors) {
	          var message = jqXHR.responseJSON.errors.reduce(function (name, err) {
	            return "".concat(name).concat(err.title, "\n");
	          }, '');
	          error = new Error(message);
	        }

	        try {
	          model.trigger('error:remote', error);
	        } catch (e) {
	          /* continue on listener error */
	        }

	        reject(error);
	      });

	      try {
	        model.trigger('request:remote', model, xhr, options);
	      } catch (e) {
	        /* continue on listener error */
	      }
	    });
	    return promise;
	  },
	  _remoteCreateParse: function _remoteCreateParse(model, responseData) {
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

	    this._setNewRemoteID(model, remoteIDs);
	  },

	  /**
	   * Sets new server IDs to the models.
	   */
	  _setNewRemoteID: function _setNewRemoteID(model, remoteIDs) {
	    var _this = this;

	    // set new remote ID
	    var remoteID = remoteIDs[model.cid];

	    if (remoteID) {
	      model.id = remoteID;
	    } // do that for all submodels


	    if (model.samples) {
	      model.samples.forEach(function (subModel) {
	        return _this._setNewRemoteID(subModel, remoteIDs);
	      });
	    }

	    if (model.occurrences) {
	      model.occurrences.forEach(function (subModel) {
	        return _this._setNewRemoteID(subModel, remoteIDs);
	      });
	    }

	    if (model.media) {
	      model.media.forEach(function (subModel) {
	        return _this._setNewRemoteID(subModel, remoteIDs);
	      });
	    }
	  },
	  _getModelData: function _getModelData(model) {
	    if (!model) {
	      throw new Error('No model passed to _getModelData.');
	    }

	    var that = this; // get submission model and all the media

	    var _model$_getSubmission = model._getSubmission(),
	        _model$_getSubmission2 = slicedToArray(_model$_getSubmission, 2),
	        submission = _model$_getSubmission2[0],
	        media = _model$_getSubmission2[1];

	    submission.type = 'samples'; // allow updating the submission data if onSend function is set

	    if (this.onSend) {
	      return this.onSend(submission, media).then(function (data) {
	        var _data = slicedToArray(data, 2),
	            newSubmission = _data[0],
	            newMedia = _data[1];

	        return that._normaliseModelData(newSubmission, newMedia);
	      });
	    }

	    return this._normaliseModelData(submission, media);
	  },

	  /**
	   * Creates a stringified JSON representation of the model or a FormData object.
	   * If the media is present then it creates a FormData so that the record
	   * could be submitted in one call.
	   */
	  _normaliseModelData: function _normaliseModelData(submission, media) {
	    // stringify submission
	    var stringSubmission = JSON.stringify({
	      data: submission
	    }); // with media send form-data in one request

	    if (media.length) {
	      var formData = new FormData(); // for submission

	      formData.append('submission', stringSubmission); // append media

	      return this._mediaAppend(media, formData).then(function () {
	        return Promise.resolve(formData);
	      });
	    }

	    return Promise.resolve(stringSubmission);
	  },
	  _mediaAppend: function _mediaAppend(media, formData) {
	    var mediaProcesses = [];
	    media.forEach(function (mediaModel) {
	      var imagePromise = new Promise(function (_fulfill) {
	        var url = mediaModel.getURL();
	        var type = mediaModel.get('type');
	        var name = mediaModel.cid;

	        function onSuccess(err, img, dataURI, blob) {
	          // can provide both image/jpeg and jpeg
	          var extension = type;
	          var mediaType = type;

	          if (type.match(/image.*/)) {
	            extension = type.split('/')[1];
	          } else {
	            mediaType = "image/".concat(mediaType);
	          }

	          if (!blob) {
	            blob = helpers.dataURItoBlob(dataURI, mediaType);
	          }

	          formData.append(name, blob, "".concat(name, ".").concat(extension));

	          _fulfill();
	        }

	        if (!helpers.isDataURL(url)) {
	          // load image
	          var xhr = new XMLHttpRequest();
	          xhr.open('GET', url, true);
	          xhr.responseType = 'blob';

	          xhr.onload = function () {
	            onSuccess(null, null, null, xhr.response);
	          }; // todo check error case


	          xhr.send();
	        } else {
	          onSuccess(null, null, url);
	        }
	      });
	      mediaProcesses.push(imagePromise);
	    });
	    return Promise.all(mediaProcesses);
	  },

	  /**
	   * Returns an object with attributes and their values
	   * mapped for warehouse submission.
	   *
	   * @returns {*}
	   */
	  _getSubmission: function _getSubmission() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var that = this;
	    var sampleKeys = typeof this.keys === 'function' ? this.keys() : this.keys;
	    var keys = $.extend(true, Sample.keys, sampleKeys); // warehouse keys/values to transform

	    var media = toConsumableArray(this.media.models); // all media within this and child models


	    var submission = {
	      id: this.id,
	      external_key: this.cid,
	      survey_id: this.metadata.survey_id,
	      input_form: this.metadata.input_form,
	      fields: {},
	      media: []
	    }; // transform attributes

	    Object.keys(this.attributes).forEach(function (attr) {
	      // no need to send attributes with no values
	      var value = that.attributes[attr];
	      if (!value) return;

	      if (!keys[attr]) {
	        if (attr !== 'email') {
	          console.warn("Indicia: no such key: ".concat(attr));
	        }

	        submission.fields[attr] = value;
	        return;
	      }

	      var warehouseAttr = keys[attr].id || attr; // check if has values to choose from

	      if (keys[attr].values) {
	        if (typeof keys[attr].values === 'function') {
	          // get a value from a function
	          value = keys[attr].values(value, submission, that);
	        } else if (_.isArray(value)) {
	          // the attribute has multiple values
	          value = value.map(function (v) {
	            return keys[attr].values[v];
	          });
	        } else {
	          value = keys[attr].values[value];
	        }
	      } // don't need to send null or undefined


	      if (value) {
	        submission.fields[warehouseAttr] = value;
	      }
	    });

	    var sampleOptions = _.extend({}, options);

	    this.metadata.training && (sampleOptions.training = this.metadata.training);
	    this.metadata.release_status && (sampleOptions.release_status = this.metadata.release_status);
	    this.metadata.record_status && (sampleOptions.record_status = this.metadata.record_status);
	    this.metadata.sensitive && (sampleOptions.sensitive = this.metadata.sensitive);
	    this.metadata.confidential && (sampleOptions.confidential = this.metadata.confidential);
	    this.metadata.sensitivity_precision && (sampleOptions.sensitivity_precision = this.metadata.sensitivity_precision); // transform sub models
	    // occurrences

	    var _this$occurrences$_ge = this.occurrences._getSubmission(sampleOptions),
	        _this$occurrences$_ge2 = slicedToArray(_this$occurrences$_ge, 2),
	        occurrences = _this$occurrences$_ge2[0],
	        occurrencesMedia = _this$occurrences$_ge2[1];

	    submission.occurrences = occurrences;
	    media = media.concat(occurrencesMedia); // samples

	    var _this$samples$_getSub = this.samples._getSubmission(sampleOptions),
	        _this$samples$_getSub2 = slicedToArray(_this$samples$_getSub, 2),
	        samples = _this$samples$_getSub2[0],
	        samplesMedia = _this$samples$_getSub2[1];

	    submission.samples = samples;
	    media = media.concat(samplesMedia); // media - does not return any media-models only JSON data about them

	    var _this$media$_getSubmi = this.media._getSubmission(sampleOptions),
	        _this$media$_getSubmi2 = slicedToArray(_this$media$_getSubmi, 1),
	        mediaSubmission = _this$media$_getSubmi2[0];

	    submission.media = mediaSubmission;
	    return [submission, media];
	  },
	  toJSON: function toJSON() {
	    var occurrences;

	    if (!this.occurrences) {
	      occurrences = [];
	      console.warn('toJSON occurrences missing');
	    } else {
	      occurrences = this.occurrences.toJSON();
	    }

	    var samples;

	    if (!this.samples) {
	      samples = [];
	      console.warn('toJSON samples missing');
	    } else {
	      samples = this.samples.toJSON();
	    }

	    var media;

	    if (!this.media) {
	      media = [];
	      console.warn('toJSON media missing');
	    } else {
	      media = this.media.toJSON();
	    }

	    var data = {
	      id: this.id,
	      cid: this.cid,
	      metadata: this.metadata,
	      attributes: this.attributes,
	      occurrences: occurrences,
	      samples: samples,
	      media: media
	    };
	    return data;
	  },

	  /**
	   * Sync statuses:
	   * synchronising, synced, remote, server, changed_remotely, changed_server, conflict
	   */
	  getSyncStatus: function getSyncStatus() {
	    var meta = this.metadata; // on server

	    if (this.remote.synchronising) {
	      return SYNCHRONISING;
	    }

	    if (this.id >= 0) {
	      // fully initialized
	      if (meta.synced_on) {
	        // changed_remotely
	        if (meta.synced_on < meta.updated_on) {
	          // changed_server - conflict!
	          if (meta.synced_on < meta.server_on) {
	            return CONFLICT;
	          }

	          return CHANGED_LOCALLY; // changed_server
	        } else if (meta.synced_on < meta.server_on) {
	          return CHANGED_SERVER;
	        }

	        return SYNCED; // partially initialized - we know the record exists on
	        // server but has not yet been downloaded
	      }

	      return SERVER; // local only
	    }

	    return LOCAL;
	  },

	  /**
	   * Returns child occurrence.
	   * @param index
	   * @returns {*}
	   */
	  getOccurrence: function getOccurrence() {
	    var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	    return this.occurrences.at(index);
	  },

	  /**
	   * Returns child sample.
	   * @param index
	   * @returns {*}
	   */
	  getSample: function getSample() {
	    var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	    return this.samples.at(index);
	  },

	  /**
	   * Returns child media.
	   * @param index
	   * @returns {*}
	   */
	  getMedia: function getMedia() {
	    var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	    return this.media.at(index);
	  },
	  getUserAuth: function getUserAuth() {
	    if (!this.user || !this.password) {
	      return null;
	    }

	    var user = typeof this.user === 'function' ? this.user() : this.user;
	    var password = typeof this.password === 'function' ? this.password() : this.password;
	    var basicAuth = btoa("".concat(user, ":").concat(password));
	    return "Basic  ".concat(basicAuth);
	  },
	  _parseModels: function _parseModels(models, Model) {
	    if (!models) {
	      // init empty samples collection
	      return new Collection([], {
	        model: Model
	      });
	    }

	    var that = this;
	    var modelsArray = [];

	    _.each(models, function (model) {
	      if (model instanceof Model) {
	        model.setParent(that);
	        modelsArray.push(model);
	      } else {
	        var modelOptions = _.extend(model, {
	          parent: that
	        });

	        var newModel = new Model(model.attributes, modelOptions);
	        modelsArray.push(newModel);
	      }
	    });

	    return new Collection(modelsArray, {
	      model: Model
	    });
	  },
	  isNew: function isNew() {
	    return !this.id;
	  },
	  // Fetch the model from the server, merging the response with the model's
	  // local attributes. Any changed attributes will trigger a "change" event.
	  fetch: function fetch(options) {
	    var _this2 = this;

	    var model = this;
	    var promise = new Promise(function (fulfill, reject) {
	      options = _.extend({
	        parse: true
	      }, options);
	      return _this2.sync('read', _this2, options).then(function (resp) {
	        // set the returned model's data
	        model.id = resp.id;
	        model.metadata = resp.metadata;
	        if (!model.set(resp.attributes, options)) return false; // initialise sub models

	        model.occurrences = model._parseModels(resp.occurrences, model.Occurrence);
	        model.samples = model._parseModels(resp.samples, Sample);
	        model.media = model._parseModels(resp.media, model.Media);

	        try {
	          model.trigger('sync', model, resp, options);
	        } catch (e) {
	          /* continue on listener error */
	        }

	        fulfill(model);
	        return null;
	      }).catch(reject);
	    });
	    return promise;
	  },
	  _getDefaultMetadata: function _getDefaultMetadata(options) {
	    var metadata = typeof this.metadata === 'function' ? this.metadata() : this.metadata;
	    var today = new Date();
	    var defaults = {
	      survey_id: options.survey_id,
	      input_form: options.input_form,
	      created_on: today,
	      updated_on: today,
	      synced_on: null,
	      // set when fully initialized only
	      server_on: null // updated on server

	    };
	    return $.extend(true, defaults, metadata, options.metadata);
	  }
	});

	_.extend(Sample.prototype, helpers$1);
	/**
	 * Warehouse attributes and their values.
	 */


	Sample.keys = {
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
	};

	var Report =
	/*#__PURE__*/
	function () {
	  function Report() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, Report);

	    this.host_url = options.host_url || this.host_url;
	    this.user = options.user || this.user;
	    this.password = options.password || this.password;
	    this.report = options.report || this.report;
	    this.api_key = options.api_key || this.api_key;
	    this.params = options.params || this.params;
	    this.timeout = options.timeout || 180000; // 3 min;
	  }

	  createClass(Report, [{
	    key: "run",
	    value: function run(params) {
	      var _this = this;

	      var that = this;
	      var promise = new Promise(function (fulfill, reject) {
	        var url = _this.host_url + API_BASE + API_VER + API_REPORTS_PATH + _this.report;
	        params = $.extend(params || that.params, {
	          api_key: that.api_key
	        });
	        $.get({
	          url: url,
	          data: params,
	          timeout: that.timeout,
	          headers: {
	            authorization: that.getUserAuth(),
	            'x-api-key': that.api_key
	          },
	          success: fulfill,
	          error: function error(jqXHR, textStatus, errorThrown) {
	            var error = new Error(errorThrown);

	            if (jqXHR.responseJSON && jqXHR.responseJSON.errors) {
	              var message = jqXHR.responseJSON.errors.reduce(function (name, err) {
	                return "".concat(name).concat(err.title, "\n");
	              }, '');
	              error = new Error(message);
	            }

	            reject(error);
	          }
	        });
	      });
	      return promise;
	    }
	  }, {
	    key: "getUserAuth",
	    value: function getUserAuth() {
	      if (!this.user || !this.password) {
	        return null;
	      }

	      var user = typeof this.user === 'function' ? this.user() : this.user;
	      var password = typeof this.password === 'function' ? this.password() : this.password;
	      var basicAuth = btoa("".concat(user, ":").concat(password));
	      return "Basic  ".concat(basicAuth);
	    }
	  }]);

	  return Report;
	}();

	var Indicia = {
	  /* global "4.4.3" */
	  VERSION: "4.4.3",
	  // replaced by build
	  Store: Store,
	  Collection: Collection,
	  Sample: Sample,
	  Occurrence: Occurrence,
	  Media: Media,
	  Report: Report
	};

	_.extend(Indicia, CONST);

	return Indicia;

}));
//# sourceMappingURL=indicia.js.map
