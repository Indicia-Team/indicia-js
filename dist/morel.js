/*!
 * 
 * morel 3.2.0
 * Mobile Recording Library for biological data collection.
 * https://github.com/NERC-CEH/morel
 * Author Karolis Kazlauskis
 * Released under the GNU GPL v3 license.
 * http://www.gnu.org/licenses/gpl.html
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("underscore"), require("backbone"), require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define("Morel", ["_", "Backbone", "$"], factory);
	else if(typeof exports === 'object')
		exports["Morel"] = factory(require("underscore"), require("backbone"), require("jquery"));
	else
		root["Morel"] = factory(root["_"], root["Backbone"], root["$"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_7__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _Sample = __webpack_require__(3);

	var _Sample2 = _interopRequireDefault(_Sample);

	var _Occurrence = __webpack_require__(9);

	var _Occurrence2 = _interopRequireDefault(_Occurrence);

	var _Storage = __webpack_require__(11);

	var _Storage2 = _interopRequireDefault(_Storage);

	var _Image = __webpack_require__(6);

	var _Image2 = _interopRequireDefault(_Image);

	var _Error = __webpack_require__(8);

	var _Error2 = _interopRequireDefault(_Error);

	var _constants = __webpack_require__(4);

	var _constants2 = _interopRequireDefault(_constants);

	var _helpers = __webpack_require__(5);

	var _helpers2 = _interopRequireDefault(_helpers);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Morel = function () {
	  function Morel() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    _classCallCheck(this, Morel);

	    this.options = options;
	    options.manager = this;

	    this.storage = new _Storage2.default(options);
	    this.onSend = options.onSend;
	    this._attachListeners();
	    this.synchronising = false;
	  }

	  // storage functions


	  _createClass(Morel, [{
	    key: 'get',
	    value: function get(model, callback, options) {
	      this.storage.get(model, callback, options);
	    }
	  }, {
	    key: 'getAll',
	    value: function getAll(callback, options) {
	      this.storage.getAll(callback, options);
	    }
	  }, {
	    key: 'set',
	    value: function set(model, callback, options) {
	      model.manager = this; // set the manager on new model
	      this.storage.set(model, callback, options);

	      // this.storage.set(model, (...args) => {
	      //   this._addReference(model);
	      //   callback && callback(args);
	      // }, options);
	    }
	  }, {
	    key: 'remove',
	    value: function remove(model, callback, options) {
	      this.storage.remove(model, callback, options);

	      // this.storage.remove(model, (...args) => {
	      //   this._removeReference(model);
	      //   callback && callback(args);
	      // }, options);
	    }
	  }, {
	    key: 'has',
	    value: function has(model, callback, options) {
	      this.storage.has(model, callback, options);
	    }
	  }, {
	    key: 'clear',
	    value: function clear(callback, options) {
	      this.storage.clear(callback, options);
	    }

	    /**
	     * Synchronises a collection
	     * @param collection
	     * @param options
	     * @returns {*}
	     */

	  }, {
	    key: 'syncAll',
	    value: function syncAll(method, collection) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	      var syncAllPromiseResolve = void 0;
	      var syncAllPromiseReject = void 0;
	      var returnPromise = new Promise(function (fulfill, reject) {
	        syncAllPromiseResolve = fulfill;
	        syncAllPromiseReject = reject;
	      });

	      // sync all in collection
	      function syncEach(collectionToSync) {
	        var toWait = [];
	        collectionToSync.each(function (model) {
	          // todo: reuse the passed options model
	          var xhr = model.save(null, {
	            remote: true,
	            timeout: options.timeout
	          });
	          var syncPromise = void 0;
	          if (!xhr) {
	            // model was invalid
	            syncPromise = Promise.resolve();
	          } else {
	            // valid model, but in case it fails sync carry on
	            syncPromise = new Promise(function (fulfill) {
	              xhr.then(function () {
	                fulfill();
	              }).catch(function () {
	                fulfill();
	              });
	            });
	          }
	          toWait.push(syncPromise);
	        });

	        Promise.all(toWait).then(function () {
	          // after all is synced
	          syncAllPromiseResolve();
	          options.success && options.success();
	        });
	      }

	      if (collection) {
	        syncEach(collection);
	        return returnPromise;
	      }

	      // get all models to submit
	      this.getAll(function (err, receivedCollection) {
	        if (err) {
	          syncAllPromiseReject();
	          options.error && options.error(err);
	          return;
	        }

	        syncEach(receivedCollection);
	      });
	      return returnPromise;
	    }

	    /**
	     * Synchronises the model with the remote server.
	     * @param method
	     * @param model
	     * @param options
	     */

	  }, {
	    key: 'sync',
	    value: function sync(method, model) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	      // don't resend
	      if (model.getSyncStatus() === _constants2.default.SYNCED || model.getSyncStatus() === _constants2.default.SYNCHRONISING) {
	        return false;
	      }

	      options.url = model.manager.options.url; // get the URL

	      // on success update the model and save to local storage
	      var success = options.success;
	      options.success = function (successModel) {
	        successModel.save().then(function () {
	          successModel.trigger('sync');
	          success && success();
	        });
	      };

	      var xhr = Morel.prototype.post.apply(model.manager, [model, options]);
	      return xhr;
	    }

	    /**
	     * Posts a record to remote server.
	     * @param model
	     * @param options
	     */

	  }, {
	    key: 'post',
	    value: function post(model, options) {
	      var that = this;
	      // call user defined onSend function to modify
	      var onSend = model.onSend || this.onSend;
	      var stopSending = onSend && onSend(model);
	      if (stopSending) {
	        // return since user says invalid
	        return false;
	      }

	      model.synchronising = true;

	      // on success
	      var success = options.success;
	      options.success = function () {
	        model.synchronising = false;

	        // update model
	        model.metadata.warehouse_id = 1;
	        model.metadata.server_on = model.metadata.updated_on = model.metadata.synced_on = new Date();

	        success && success(model, null, options);
	      };

	      // on error
	      var error = options.error;
	      options.error = function (xhr, textStatus, errorThrown) {
	        model.synchronising = false;
	        model.trigger('error');

	        options.textStatus = textStatus;
	        options.errorThrown = errorThrown;
	        if (error) error.call(options.context, xhr, textStatus, errorThrown);
	      };

	      var promise = new Promise(function (fulfill, reject) {
	        // async call to get the form data
	        that._getModelFormData(model, function (err, formData) {
	          // AJAX post
	          var xhr = options.xhr = _backbone2.default.ajax({
	            url: options.url,
	            type: 'POST',
	            data: formData,
	            processData: false,
	            contentType: false,
	            timeout: options.timeout || 30000, // 30s
	            success: options.success,
	            error: options.error
	          });

	          // also resolve the promise
	          xhr.done(function (data, textStatus, jqXHR) {
	            fulfill(data, textStatus, jqXHR);
	          });
	          xhr.fail(function (jqXHR, textStatus, errorThrown) {
	            reject(jqXHR, textStatus, errorThrown);
	          });
	          model.trigger('request', model, xhr, options);
	        });
	      });

	      return promise;
	    }
	  }, {
	    key: '_attachListeners',
	    value: function _attachListeners() {
	      var that = this;
	      this.storage.on('update', function () {
	        that.trigger('update');
	      });
	    }
	  }, {
	    key: '_getModelFormData',
	    value: function _getModelFormData(model, callback) {
	      var _this = this;

	      var flattened = model.flatten(this._flattener);
	      var formData = new FormData();

	      // append images
	      var occCount = 0;
	      var occurrenceProcesses = [];
	      model.occurrences.each(function (occurrence) {
	        // on async run occCount will be incremented before used for image name
	        var localOccCount = occCount;
	        var imgCount = 0;

	        var imageProcesses = [];

	        occurrence.images.each(function (image) {
	          var imagePromiseResolve = void 0;
	          var imagePromise = new Promise(function (fulfill) {
	            imagePromiseResolve = fulfill;
	          });
	          imageProcesses.push(imagePromise);

	          var url = image.getURL();
	          var type = image.get('type');

	          function onSuccess(err, img, dataURI, blob) {
	            var name = 'sc:' + localOccCount + '::photo' + imgCount;

	            // can provide both image/jpeg and jpeg
	            var extension = type;
	            var mediaType = type;
	            if (type.match(/image.*/)) {
	              extension = type.split('/')[1];
	            } else {
	              mediaType = 'image/' + mediaType;
	            }
	            if (!blob) {
	              blob = _helpers2.default.dataURItoBlob(dataURI, mediaType);
	            }

	            formData.append(name, blob, 'pic.' + extension);
	            imgCount++;
	            imagePromiseResolve();
	          }

	          if (!_helpers2.default.isDataURL(url)) {
	            (function () {
	              // load image
	              var xhr = new XMLHttpRequest();
	              xhr.open('GET', url, true);
	              xhr.responseType = 'blob';
	              xhr.onload = function () {
	                onSuccess(null, null, null, xhr.response);
	              };
	              // todo check error case

	              xhr.send();
	            })();
	          } else {
	            onSuccess(null, null, url);
	          }
	        });

	        occurrenceProcesses.push(Promise.all(imageProcesses));
	        occCount++;
	      });

	      Promise.all(occurrenceProcesses).then(function () {
	        // append attributes
	        var keys = Object.keys(flattened);
	        for (var i = 0; i < keys.length; i++) {
	          formData.append(keys[i], flattened[keys[i]]);
	        }

	        // Add authentication
	        formData = _this.appendAuth(formData);
	        callback(null, formData);
	      });
	    }
	  }, {
	    key: '_flattener',
	    value: function _flattener(attributes, options) {
	      var flattened = options.flattened || {};
	      var keys = options.keys || {};
	      var count = options.count;
	      var attr = null;
	      var name = null;
	      var value = null;
	      var prefix = '';
	      var native = 'sample:';
	      var custom = 'smpAttr:';

	      if (this instanceof _Occurrence2.default) {
	        prefix = 'sc:';
	        native = '::occurrence:';
	        custom = '::occAttr:';
	      }

	      // add external ID
	      var id = this.cid || this.id;
	      if (id) {
	        if (this instanceof _Occurrence2.default) {
	          flattened[prefix + count + native + 'external_key'] = id;
	        } else {
	          flattened[native + 'external_key'] = this.cid || this.id;
	        }
	      }

	      for (attr in attributes) {
	        if (!keys[attr]) {
	          if (attr !== 'email' && attr !== 'usersecret') {
	            console.warn('Morel: no such key: ' + attr);
	          }
	          flattened[attr] = attributes[attr];
	          continue;
	        }

	        name = keys[attr].id;

	        if (!name) {
	          name = prefix + count + '::present';
	        } else {
	          if (parseInt(name, 10) >= 0) {
	            name = custom + name;
	          } else {
	            name = native + name;
	          }

	          if (prefix) {
	            name = prefix + count + name;
	          }
	        }

	        // no need to send undefined
	        if (!attributes[attr]) continue;

	        value = attributes[attr];

	        // check if has values to choose from
	        if (keys[attr].values) {
	          if (typeof keys[attr].values === 'function') {
	            var fullOptions = _underscore2.default.extend(options, {
	              flattener: Morel.prototype._flattener,
	              flattened: flattened
	            });

	            // get a value from a function
	            value = keys[attr].values(value, fullOptions);
	          } else {
	            value = keys[attr].values[value];
	          }
	        }

	        // don't need to send null or undefined
	        if (value) {
	          flattened[name] = value;
	        }
	      }

	      return flattened;
	    }

	    /**
	     * Appends user and app authentication to the passed data object.
	     * Note: object has to implement 'append' method.
	     *
	     * @param data An object to modify
	     * @returns {*} A data object
	     */

	  }, {
	    key: 'appendAuth',
	    value: function appendAuth(data) {
	      // app logins
	      this._appendAppAuth(data);
	      // warehouse data
	      this._appendWarehouseAuth(data);

	      return data;
	    }

	    /**
	     * Appends app authentication - Appname and Appsecret to
	     * the passed object.
	     * Note: object has to implement 'append' method.
	     *
	     * @param data An object to modify
	     * @returns {*} A data object
	     */

	  }, {
	    key: '_appendAppAuth',
	    value: function _appendAppAuth(data) {
	      data.append('appname', this.options.appname);
	      data.append('appsecret', this.options.appsecret);

	      return data;
	    }

	    /**
	     * Appends warehouse related information - website_id and survey_id to
	     * the passed data object.
	     * Note: object has to implement 'append' method.
	     *
	     * This is necessary because the data must be associated to some
	     * website and survey in the warehouse.
	     *
	     * @param data An object to modify
	     * @returns {*} An data object
	     */

	  }, {
	    key: '_appendWarehouseAuth',
	    value: function _appendWarehouseAuth(data) {
	      data.append('website_id', this.options.website_id);
	      data.append('survey_id', this.options.survey_id);

	      return data;
	    }

	    // _addReference(model) {
	    //   model.on('all', this._onSampleEvent, this);
	    // }
	    //
	    // _removeReference(model) {
	    //   model.off('all', this._onSampleEvent, this);
	    // }
	    //
	    // _onSampleEvent(...args) {
	    //   this.trigger.apply(this, args);
	    // }

	  }]);

	  return Morel;
	}();

	_underscore2.default.extend(Morel.prototype, _backbone2.default.Events);

	_underscore2.default.extend(Morel, _constants2.default, {
	  /* global LIB_VERSION */
	  VERSION: ("3.2.0"), // replaced by build

	  Sample: _Sample2.default,
	  Occurrence: _Occurrence2.default,
	  Image: _Image2.default,
	  Error: _Error2.default
	});

	exports.default = Morel;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /** *********************************************************************
	                                                                                                                                                                                                                                                                               * SAMPLE
	                                                                                                                                                                                                                                                                               *
	                                                                                                                                                                                                                                                                               * Refers to the event in which the sightings were observed, in other
	                                                                                                                                                                                                                                                                               * words it describes the place, date, people, environmental conditions etc.
	                                                                                                                                                                                                                                                                               * Within a sample, you can have zero or more occurrences which refer to each
	                                                                                                                                                                                                                                                                               * species sighted as part of the sample.
	                                                                                                                                                                                                                                                                               **********************************************************************/


	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _constants = __webpack_require__(4);

	var _constants2 = _interopRequireDefault(_constants);

	var _helpers = __webpack_require__(5);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _Image = __webpack_require__(6);

	var _Image2 = _interopRequireDefault(_Image);

	var _Occurrence = __webpack_require__(9);

	var _Occurrence2 = _interopRequireDefault(_Occurrence);

	var _Collection = __webpack_require__(10);

	var _Collection2 = _interopRequireDefault(_Collection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Sample = _backbone2.default.Model.extend({
	  Image: _Image2.default,
	  Occurrence: _Occurrence2.default,

	  constructor: function constructor() {
	    var _this = this;

	    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var that = this;
	    var attrs = attributes;

	    var defaultAttrs = {
	      date: new Date(),
	      location_type: 'latlon'
	    };

	    attrs = _underscore2.default.extend(defaultAttrs, attrs);

	    this.cid = options.cid || options.id || _helpers2.default.getNewUUID();
	    this.manager = options.manager || this.manager;
	    if (this.manager) this.sync = this.manager.sync;

	    if (options.Image) this.Image = options.Image;
	    if (options.Occurrence) this.Occurrence = options.Occurrence;
	    if (options.onSend) this.onSend = options.onSend;

	    this.attributes = {};
	    if (options.collection) this.collection = options.collection;
	    if (options.parse) attrs = this.parse(attrs, options) || {};
	    attrs = _underscore2.default.defaults({}, attrs, _underscore2.default.result(this, 'defaults'));
	    this.set(attrs, options);
	    this.changed = {};

	    if (options.metadata) {
	      this.metadata = options.metadata;
	    } else {
	      var today = new Date();
	      this.metadata = {
	        created_on: today,
	        updated_on: today,

	        warehouse_id: null,

	        synced_on: null, // set when fully initialized only
	        server_on: null };
	    }

	    if (options.occurrences) {
	      (function () {
	        var occurrences = [];
	        _underscore2.default.each(options.occurrences, function (occ) {
	          if (occ instanceof that.Occurrence) {
	            occ.setSample(that);
	            occurrences.push(occ);
	          } else {
	            var modelOptions = _underscore2.default.extend(occ, { sample: that });
	            occurrences.push(new that.Occurrence(occ.attributes, modelOptions));
	          }
	        });
	        _this.occurrences = new _Collection2.default(occurrences, {
	          model: _this.Occurrence
	        });
	      })();
	    } else {
	      this.occurrences = new _Collection2.default([], {
	        model: this.Occurrence
	      });
	    }

	    if (options.images) {
	      (function () {
	        var images = [];
	        _underscore2.default.each(options.images, function (image) {
	          if (image instanceof _this.Image) {
	            image.setParent(that);
	            images.push(image);
	          } else {
	            var modelOptions = _underscore2.default.extend(image, { parent: that });
	            images.push(new _this.Image(image.attributes, modelOptions));
	          }
	        });
	        _this.images = new _Collection2.default(images, {
	          model: _this.Image
	        });
	      })();
	    } else {
	      this.images = new _Collection2.default([], {
	        model: this.Image
	      });
	    }

	    this.initialize.apply(this, arguments);
	  },


	  /**
	   * Saves the record to the record manager and if valid syncs it with DB
	   * Returns on success: model, response, options
	   */
	  save: function save(attrs) {
	    var _this2 = this;

	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var model = this;
	    var promise = void 0;

	    if (!this.manager) return false;

	    // only update local cache and DB
	    if (!options.remote) {
	      var _ret3 = function () {
	        // todo: add attrs if passed to model

	        var promiseResolve = void 0;
	        var promiseReject = void 0;
	        promise = new Promise(function (fulfill, reject) {
	          promiseResolve = fulfill;
	          promiseReject = reject;
	        });

	        _this2.manager.set(_this2, function (err) {
	          if (err) {
	            promiseReject(err);
	            options.error && options.error(err);
	            return;
	          }
	          promiseResolve(model, {}, options);
	          options.success && options.success(model, {}, options);
	        });
	        return {
	          v: promise
	        };
	      }();

	      if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
	    }

	    // remote
	    promise = _backbone2.default.Model.prototype.save.apply(this, arguments);
	    return promise;
	  },
	  destroy: function destroy() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var promiseResolve = void 0;
	    var promise = new Promise(function (fulfill) {
	      promiseResolve = fulfill;
	    });

	    if (this.manager && !options.noSave) {
	      // save the changes permanentely
	      this.manager.remove(this, function (err) {
	        if (err) {
	          options.error && options.error(err);
	          return;
	        }
	        promiseResolve();
	        options.success && options.success();
	      });
	    } else {
	      // removes from all collections etc
	      this.stopListening();
	      this.trigger('destroy', this, this.collection, options);

	      promiseResolve();
	      options.success && options.success();
	    }

	    return promise;
	  },


	  /**
	   * Adds an occurrence to sample and sets the occurrence's sample to this.
	   * @param occurrence
	   */
	  addOccurrence: function addOccurrence(occurrence) {
	    if (!occurrence) return;
	    occurrence.setSample(this);
	    this.occurrences.push(occurrence);
	  },


	  /**
	   * Adds an image to occurrence and sets the images's occurrence to this.
	   * @param image
	   */
	  addImage: function addImage(image) {
	    if (!image) return;
	    image.setParent(this);
	    this.images.add(image);
	  },
	  validate: function validate(attributes) {
	    var attrs = _underscore2.default.extend({}, this.attributes, attributes);

	    var sample = {};
	    var occurrences = {};

	    // location
	    if (!attrs.location) {
	      sample.location = 'can\'t be blank';
	    }

	    // location type
	    if (!attrs.location_type) {
	      sample.location_type = 'can\'t be blank';
	    }

	    // date
	    if (!attrs.date) {
	      sample.date = 'can\'t be blank';
	    } else {
	      var date = new Date(attrs.date);
	      if (date === 'Invalid Date' || date > new Date()) {
	        sample.date = new Date(date) > new Date() ? 'future date' : 'invalid';
	      }
	    }

	    // occurrences
	    if (this.occurrences.length === 0) {
	      sample.occurrences = 'no occurrences';
	    } else {
	      this.occurrences.each(function (occurrence) {
	        var errors = occurrence.validate();
	        if (errors) {
	          var occurrenceID = occurrence.id || occurrence.cid;
	          occurrences[occurrenceID] = errors;
	        }
	      });
	    }

	    if (!_underscore2.default.isEmpty(sample) || !_underscore2.default.isEmpty(occurrences)) {
	      var errors = {
	        sample: sample,
	        occurrences: occurrences
	      };
	      return errors;
	    }

	    return null;
	  },


	  /**
	   * Returns an object with attributes and their values flattened and
	   * mapped for warehouse submission.
	   *
	   * @param flattener
	   * @returns {*}
	   */
	  flatten: function flatten(flattener) {
	    // images flattened separately
	    var flattened = flattener.apply(this, [this.attributes, { keys: Sample.keys }]);

	    // occurrences
	    _underscore2.default.extend(flattened, this.occurrences.flatten(flattener));
	    return flattened;
	  },
	  toJSON: function toJSON() {
	    var occurrences = void 0;
	    var occurrencesCollection = this.occurrences;
	    if (!occurrencesCollection) {
	      occurrences = [];
	      console.warn('toJSON occurrences missing');
	    } else {
	      occurrences = occurrencesCollection.toJSON();
	    }

	    var images = void 0;
	    var imagesCollection = this.images;
	    if (!imagesCollection) {
	      images = [];
	      console.warn('toJSON images missing');
	    } else {
	      images = imagesCollection.toJSON();
	    }

	    var data = {
	      id: this.id,
	      cid: this.cid,
	      metadata: this.metadata,
	      attributes: this.attributes,
	      occurrences: occurrences,
	      images: images
	    };

	    return data;
	  },


	  /**
	   * Sync statuses:
	   * synchronising, synced, local, server, changed_locally, changed_server, conflict
	   */
	  getSyncStatus: function getSyncStatus() {
	    var meta = this.metadata;
	    // on server
	    if (this.synchronising) {
	      return _constants2.default.SYNCHRONISING;
	    }

	    if (meta.warehouse_id) {
	      // fully initialized
	      if (meta.synced_on) {
	        // changed_locally
	        if (meta.synced_on < meta.updated_on) {
	          // changed_server - conflict!
	          if (meta.synced_on < meta.server_on) {
	            return _constants2.default.CONFLICT;
	          }
	          return _constants2.default.CHANGED_LOCALLY;
	          // changed_server
	        } else if (meta.synced_on < meta.server_on) {
	          return _constants2.default.CHANGED_SERVER;
	        }
	        return _constants2.default.SYNCED;

	        // partially initialized - we know the record exists on
	        // server but has not yet been downloaded
	      }
	      return _constants2.default.SERVER;

	      // local only
	    }
	    return _constants2.default.LOCAL;
	  },


	  /**
	   * Detach all the listeners.
	   */
	  offAll: function offAll() {
	    this._events = {};
	    this.occurrences.offAll();
	    for (var i = 0; i < this.occurrences.data.length; i++) {
	      this.occurrences.models[i].offAll();
	    }
	  }
	});

	/**
	 * Warehouse attributes and their values.
	 */
	Sample.keys = {
	  id: { id: 'id' },
	  survey: { id: 'survey_id' },
	  date: { id: 'date' },
	  comment: { id: 'comment' },
	  image: { id: 'image' },
	  location: { id: 'entered_sref' },
	  location_type: {
	    id: 'entered_sref_system',
	    values: {
	      british: 'OSGB', // for British National Grid
	      irish: 'OSIE', // for Irish Grid
	      latlon: 4326 }
	  },
	  location_name: { id: 'location_name' },
	  form: { id: 'input_form' },
	  group: { id: 'group_id' },
	  deleted: { id: 'deleted' }
	};

	exports.default = Sample;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  SYNCHRONISING: 0,
	  SYNCED: 1,
	  LOCAL: 2,
	  SERVER: 3,
	  CHANGED_LOCALLY: 4,
	  CHANGED_SERVER: 5,
	  CONFLICT: -1
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/** *********************************************************************
	 * HELPER FUNCTIONS
	 **********************************************************************/

	/**
	 * Clones an object.
	 *
	 * @param obj
	 * @returns {*}
	 */
	var cloneDeep = function cloneDeep(obj) {
	  if (null === obj || 'object' !== (typeof obj === 'undefined' ? 'undefined' : _typeof(obj))) {
	    return obj;
	  }
	  var copy = {};
	  for (var attr in obj) {
	    if (obj.hasOwnProperty(attr)) {
	      copy[attr] = objClone(obj[attr]);
	    }
	  }
	  return copy;
	};

	/**
	 * Generate UUID.
	 */
	var getNewUUID = function getNewUUID() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0;
	    var v = c === 'x' ? r : r & 0x3 | 0x8;

	    return v.toString(16);
	  });
	};

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
	};

	// Detecting data URLs
	// https://gist.github.com/bgrins/6194623

	// data URI - MDN https://developer.mozilla.org/en-US/docs/data_URIs
	// The 'data' URL scheme: http://tools.ietf.org/html/rfc2397
	// Valid URL Characters: http://tools.ietf.org/html/rfc2396#section2
	var isDataURL = function isDataURL(string) {
	  if (!string) {
	    return false;
	  }
	  var normalized = string.toString(); // numbers

	  var regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
	  return !!normalized.match(regex);
	};

	// From jQuery 1.4.4 .
	var isPlainObject = function isPlainObject(obj) {
	  function type(obj) {
	    var class2type = {};
	    var types = 'Boolean Number String Function Array Date RegExp Object'.split(' ');
	    for (var i = 0; i < types.length; i++) {
	      class2type['[object ' + types[i] + ']'] = types[i].toLowerCase();
	    }
	    return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
	  }

	  function isWindow(obj) {
	    return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && 'setInterval' in obj;
	  }

	  // Must be an Object.
	  // Because of IE, we also have to check the presence of the constructor property.
	  // Make sure that DOM nodes and window objects don't pass through, as well
	  if (!obj || type(obj) !== 'object' || obj.nodeType || isWindow(obj)) {
	    return false;
	  }

	  // Not own constructor property must be Object
	  if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
	    return false;
	  }

	  // Own properties are enumerated firstly, so to speed up,
	  // if last one is own, then all properties are own.

	  var key = void 0;
	  for (key in obj) {}

	  return key === undefined || hasOwn.call(obj, key);
	};

	// checks if the object has any elements.
	var isEmptyObject = function isEmptyObject(obj) {
	  for (var key in obj) {
	    return false;
	  }
	  return true;
	};

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
	    dateArray = date.split('-');
	    // check if valid
	    if (reg.test(date)) {
	      return date;
	      // dashed
	    } else if (regDash.test(date)) {
	      date = new Date(window.parseInt(dateArray[0]), window.parseInt(dateArray[1]) - 1, window.parseInt(dateArray[2]));
	      // inversed dashed
	    } else if (regDashInv.test(date)) {
	      date = new Date(window.parseInt(dateArray[2]), window.parseInt(dateArray[1]) - 1, window.parseInt(dateArray[0]));
	    }
	  }

	  now = date || now;
	  day = ('0' + now.getDate()).slice(-2);
	  month = ('0' + (now.getMonth() + 1)).slice(-2);

	  return day + '/' + month + '/' + now.getFullYear();
	};

	exports.default = {
	  cloneDeep: cloneDeep,
	  getNewUUID: getNewUUID,
	  dataURItoBlob: dataURItoBlob,
	  isDataURL: isDataURL,
	  isPlainObject: isPlainObject,
	  isEmptyObject: isEmptyObject,
	  formatDate: formatDate
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /** *********************************************************************
	                                                                                                                                                                                                                                                                               * IMAGE
	                                                                                                                                                                                                                                                                               **********************************************************************/


	var _jquery = __webpack_require__(7);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _helpers = __webpack_require__(5);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _Error = __webpack_require__(8);

	var _Error2 = _interopRequireDefault(_Error);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var THUMBNAIL_WIDTH = 100; // px
	var THUMBNAIL_HEIGHT = 100; // px

	var ImageModel = _backbone2.default.Model.extend({
	  constructor: function constructor() {
	    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var attrs = attributes;
	    if (typeof attributes === 'string') {
	      var data = attributes;
	      attrs = { data: data };
	      return;
	    }

	    this.cid = options.cid || options.id || _helpers2.default.getNewUUID();
	    this.setParent(options.parent || this.parent);

	    this.attributes = {};
	    if (options.collection) this.collection = options.collection;
	    if (options.parse) attrs = this.parse(attrs, options) || {};
	    attrs = _underscore2.default.defaults({}, attrs, _underscore2.default.result(this, 'defaults'));
	    this.set(attrs, options);
	    this.changed = {};

	    if (options.metadata) {
	      this.metadata = options.metadata;
	    } else {
	      this.metadata = {
	        created_on: new Date()
	      };
	    }

	    this.initialize.apply(this, arguments);
	  },
	  save: function save(attrs) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    if (!this.parent) return false;
	    return this.parent.save(attrs, options);
	  },
	  destroy: function destroy() {
	    var _this = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var promiseResolve = void 0;
	    var promise = new Promise(function (fulfill) {
	      promiseResolve = fulfill;
	    });
	    // removes from all collections etc
	    this.stopListening();
	    this.trigger('destroy', this, this.collection, options);

	    if (this.parent && !options.noSave) {
	      (function () {
	        var success = options.success;
	        options.success = function () {
	          promiseResolve();
	          success && success();
	        };

	        // save the changes permanentely
	        _this.save(null, options);
	      })();
	    } else {
	      promiseResolve();
	      options.success && options.success();
	    }

	    return promise;
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
	      that.destroy({ noSave: true });
	    });
	  },


	  /**
	   * Resizes itself.
	   */
	  resize: function resize(MAX_WIDTH, MAX_HEIGHT, callback) {
	    var that = this;
	    ImageModel.resize(this.getURL(), this.get('type'), MAX_WIDTH, MAX_HEIGHT, function (err, image, data) {
	      if (err) {
	        callback && callback(err);
	        return;
	      }
	      that.set('data', data);
	      callback && callback(null, image, data);
	    });
	  },


	  /**
	   * Adds a thumbnail to image model.
	   * @param callback
	   * @param options
	   */
	  addThumbnail: function addThumbnail(callback) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var that = this;
	    // check if data source is dataURI

	    var re = /^data:/i;
	    if (re.test(this.getURL())) {
	      ImageModel.resize(this.getURL(), this.get('type'), THUMBNAIL_WIDTH || options.width, THUMBNAIL_WIDTH || options.width, function (err, image, data) {
	        that.set('thumbnail', data);
	        callback && callback();
	      });
	      return;
	    }

	    ImageModel.getDataURI(this.getURL(), function (err, data) {
	      that.set('thumbnail', data);
	      callback && callback();
	    }, {
	      width: THUMBNAIL_WIDTH || options.width,
	      height: THUMBNAIL_HEIGHT || options.height
	    });
	  },
	  toJSON: function toJSON() {
	    var data = {
	      id: this.id,
	      metadata: this.metadata,
	      attributes: this.attributes
	    };
	    return data;
	  }
	});

	_underscore2.default.extend(ImageModel, {
	  /**
	   * Transforms and resizes an image file into a string.
	   * Can accept file image path and a file input file.
	   *
	   * @param onError
	   * @param file
	   * @param onSaveSuccess
	   * @returns {number}
	   */
	  getDataURI: function getDataURI(file, callback) {
	    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    // file paths
	    if (typeof file === 'string') {
	      var _ret2 = function () {
	        // get extension
	        var fileType = file.replace(/.*\.([a-z]+)$/i, '$1');
	        if (fileType === 'jpg') fileType = 'jpeg'; // to match media types image/jpeg

	        ImageModel.resize(file, fileType, options.width, options.height, function (err, image, dataURI) {
	          callback(null, dataURI, fileType, image.width, image.height);
	        });
	        return {
	          v: void 0
	        };
	      }();

	      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
	    }

	    // file inputs
	    if (!window.FileReader) {
	      var message = 'No File Reader';
	      var error = new _Error2.default(message);
	      console.error(message);

	      callback(error);
	      return;
	    }

	    var reader = new FileReader();
	    reader.onload = function (event) {
	      if (options.width || options.height) {
	        // resize
	        ImageModel.resize(event.target.result, file.type, options.width, options.height, function (err, image, dataURI) {
	          callback(null, dataURI, file.type, image.width, image.height);
	        });
	      } else {
	        (function () {
	          var image = new window.Image(); // native one

	          image.onload = function () {
	            var type = file.type.replace(/.*\/([a-z]+)$/i, '$1');
	            callback(null, event.target.result, type, image.width, image.height);
	          };
	          image.src = event.target.result;
	        })();
	      }
	    };
	    reader.readAsDataURL(file);
	    return;
	  },


	  /**
	   * http://stackoverflow.com/questions/2516117/how-to-scale-an-image-in-data-uri-format-in-javascript-real-scaling-not-usin
	   * @param data
	   * @param width
	   * @param height
	   * @param callback
	   */
	  resize: function resize(data, fileType, MAX_WIDTH, MAX_HEIGHT, callback) {
	    var image = new window.Image(); // native one

	    image.onload = function () {
	      var width = image.width;
	      var height = image.height;
	      var maxWidth = MAX_WIDTH || width;
	      var maxHeight = MAX_HEIGHT || height;

	      var canvas = null;
	      var res = null;

	      // resizing
	      if (width > height) {
	        res = width / maxWidth;
	      } else {
	        res = height / maxHeight;
	      }

	      width = width / res;
	      height = height / res;

	      // Create a canvas with the desired dimensions
	      canvas = document.createElement('canvas');
	      canvas.width = width;
	      canvas.height = height;

	      // Scale and draw the source image to the canvas
	      canvas.getContext('2d').drawImage(image, 0, 0, width, height);

	      // Convert the canvas to a data URL in some format
	      callback(null, image, canvas.toDataURL(fileType));
	    };

	    image.src = data;
	  }
	});

	exports.default = ImageModel;

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/** *********************************************************************
	 * ERROR
	 **********************************************************************/
	var Error = function Error() {
	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  _classCallCheck(this, Error);

	  if (typeof options === 'string') {
	    this.code = -1;
	    this.message = options;
	    return;
	  }

	  this.code = options.code || -1;
	  this.message = options.message || '';
	};

	exports.default = Error;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _jquery = __webpack_require__(7);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _helpers = __webpack_require__(5);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _Image = __webpack_require__(6);

	var _Image2 = _interopRequireDefault(_Image);

	var _Collection = __webpack_require__(10);

	var _Collection2 = _interopRequireDefault(_Collection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/** *********************************************************************
	 * OCCURRENCE
	 **********************************************************************/
	var Occurrence = _backbone2.default.Model.extend({
	  Image: _Image2.default,
	  constructor: function constructor() {
	    var _this = this;

	    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var that = this;
	    var attrs = attributes;

	    this.cid = options.cid || options.id || _helpers2.default.getNewUUID();
	    this.setSample(options.sample || this.sample);

	    if (options.Image) this.Image = options.Image;

	    this.attributes = {};
	    if (options.collection) this.collection = options.collection;
	    if (options.parse) attrs = this.parse(attrs, options) || {};
	    attrs = _underscore2.default.defaults({}, attrs, _underscore2.default.result(this, 'defaults'));
	    this.set(attrs, options);
	    this.changed = {};

	    if (options.metadata) {
	      this.metadata = options.metadata;
	    } else {
	      this.metadata = {
	        created_on: new Date()
	      };
	    }

	    if (options.images) {
	      (function () {
	        var images = [];
	        _underscore2.default.each(options.images, function (image) {
	          if (image instanceof _this.Image) {
	            image.setParent(that);
	            images.push(image);
	          } else {
	            var modelOptions = _underscore2.default.extend(image, { parent: that });
	            images.push(new _this.Image(image.attributes, modelOptions));
	          }
	        });
	        _this.images = new _Collection2.default(images, {
	          model: _this.Image
	        });
	      })();
	    } else {
	      this.images = new _Collection2.default([], {
	        model: this.Image
	      });
	    }

	    this.initialize.apply(this, arguments);
	  },
	  save: function save(attrs) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    if (!this.sample) return false;
	    return this.sample.save(attrs, options);
	  },
	  destroy: function destroy() {
	    var _this2 = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var promiseResolve = void 0;
	    var promise = new Promise(function (fulfill) {
	      promiseResolve = fulfill;
	    });
	    // removes from all collections etc
	    this.stopListening();
	    this.trigger('destroy', this, this.collection, options);

	    if (this.sample && !options.noSave) {
	      (function () {
	        var success = options.success;
	        options.success = function () {
	          promiseResolve();
	          success && success();
	        };

	        // save the changes permanentely
	        _this2.save(null, options);
	      })();
	    } else {
	      promiseResolve();
	      options.success && options.success();
	    }

	    return promise;
	  },


	  /**
	   * Sets parent Sample.
	   * @param occurrence
	   */
	  setSample: function setSample(sample) {
	    if (!sample) return;

	    var that = this;
	    this.sample = sample;
	    this.sample.on('destroy', function () {
	      that.destroy({ noSave: true });
	    });
	  },


	  /**
	   * Adds an image to occurrence and sets the images's occurrence to this.
	   * @param image
	   */
	  addImage: function addImage(image) {
	    if (!image) return;
	    image.setParent(this);
	    this.images.add(image);
	  },
	  validate: function validate(attributes) {
	    var attrs = _underscore2.default.extend({}, this.attributes, attributes);

	    var errors = {};

	    // location
	    if (!attrs.taxon) {
	      errors.taxon = 'can\'t be blank';
	    }

	    if (!_underscore2.default.isEmpty(errors)) {
	      return errors;
	    }

	    return null;
	  },
	  toJSON: function toJSON() {
	    var images = void 0;
	    var imagesCollection = this.images;
	    if (!imagesCollection) {
	      images = [];
	      console.warn('toJSON images missing');
	    } else {
	      images = imagesCollection.toJSON();
	    }
	    var data = {
	      id: this.id,
	      cid: this.cid,
	      metadata: this.metadata,
	      attributes: this.attributes,
	      images: images
	    };
	    return data;
	  },


	  /**
	   * Returns an object with attributes and their values flattened and
	   * mapped for warehouse submission.
	   *
	   * @param flattener
	   * @returns {*}
	   */
	  flatten: function flatten(flattener, count) {
	    // images flattened separately
	    return flattener.apply(this, [this.attributes, { keys: Occurrence.keys, count: count }]);
	  }
	});

	/**
	 * Warehouse attributes and their values.
	 */
	Occurrence.keys = {
	  taxon: {
	    id: ''
	  },
	  comment: {
	    id: 'comment'
	  }
	};

	exports.default = Occurrence;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/** *********************************************************************
	 * COLLECTION MODULE
	 **********************************************************************/
	var Collection = _backbone2.default.Collection.extend({
	  flatten: function flatten(flattener) {
	    var flattened = {};

	    for (var i = 0; i < this.length; i++) {
	      _underscore2.default.extend(flattened, this.models[i].flatten(flattener, i));
	    }
	    return flattened;
	  },
	  comparator: function comparator(a) {
	    return a.metadata.created_on;
	  }
	});

	exports.default = Collection;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /** *********************************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * STORAGE
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      **********************************************************************/


	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _localforage = __webpack_require__(12);

	var _localforage2 = _interopRequireDefault(_localforage);

	var _Error = __webpack_require__(8);

	var _Error2 = _interopRequireDefault(_Error);

	var _Sample = __webpack_require__(3);

	var _Sample2 = _interopRequireDefault(_Sample);

	var _Collection = __webpack_require__(10);

	var _Collection2 = _interopRequireDefault(_Collection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Storage = function () {
	  /**
	   * From ionic storage
	   * https://github.com/driftyco/ionic-storage/blob/master/src/storage.ts
	   driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
	   name        : 'myApp',
	   version     : 1.0,
	   size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
	   storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
	   description : 'some description'
	   Sample
	   manager
	   * @param options
	   */
	  function Storage() {
	    var _this = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    _classCallCheck(this, Storage);

	    var that = this;

	    this._initialized = false;

	    this.Sample = options.Sample || _Sample2.default;
	    this.manager = options.manager;

	    var customConfig = options.storage || {};

	    // internal db
	    this.db = null;
	    var _dbPromise = new Promise(function (resolve, reject) {
	      // config
	      var dbConfig = {
	        name: customConfig.name || 'morel',
	        storeName: customConfig.storeName || 'records',
	        version: customConfig.version || ''
	      };
	      var driverOrder = customConfig.driverOrder || ['indexeddb', 'websql', 'localstorage'];
	      var drivers = that._getDriverOrder(driverOrder);
	      var DB = customConfig.LocalForage || _localforage2.default;

	      // init
	      that.db = DB.createInstance(dbConfig);
	      that.db.setDriver(drivers, customConfig.drivers).then(function () {
	        resolve(that.db);
	      }).catch(function (reason) {
	        return reject(reason);
	      });
	    });

	    // initialize the cache
	    this._cache = {};
	    _dbPromise.then(function () {
	      // build up samples
	      var samples = [];
	      _this.db.iterate(function (value, key) {
	        var modelOptions = _underscore2.default.extend(value, { manager: that.manager });
	        var sample = new that.Sample(value.attributes, modelOptions);
	        samples.push(sample);
	      }).then(function () {
	        // attach the samples as collection
	        that._cache = new _Collection2.default(samples, {
	          model: that.Sample
	        });
	        that._attachListeners();

	        that._initialized = true;
	        that.trigger('init');
	      });
	    });
	  }

	  _createClass(Storage, [{
	    key: '_getDriverOrder',
	    value: function _getDriverOrder(driverOrder) {
	      var drivers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	      return driverOrder.map(function (driver) {
	        switch (driver) {
	          case 'indexeddb':
	            return _localforage2.default.INDEXEDDB;
	          case 'websql':
	            return _localforage2.default.WEBSQL;
	          case 'localstorage':
	            return _localforage2.default.LOCALSTORAGE;
	          default:
	            // custom
	            if (!drivers[driver]) return console.error('No such db driver!');
	            return drivers[driver];
	        }
	      });
	    }
	  }, {
	    key: 'ready',
	    value: function ready() {
	      return this._initialized;
	    }
	  }, {
	    key: 'get',
	    value: function get(model, callback) {
	      var _this2 = this;

	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	      var that = this;
	      if (!this.ready()) {
	        this.on('init', function () {
	          _this2.get(model, callback, options);
	        });
	        return;
	      }

	      var key = (typeof model === 'undefined' ? 'undefined' : _typeof(model)) === 'object' ? model.id || model.cid : model;

	      // a non cached version straight from storage medium
	      if (options.nonCached) {
	        this.db.getItem(key, function (err, data) {
	          if (err) {
	            callback(err);
	            return;
	          }
	          var modelOptions = _underscore2.default.extend(data, { manager: that.manager });
	          var sample = new that.Sample(data.attributes, modelOptions);
	          callback(null, sample);
	        });
	        return;
	      }

	      callback(null, this._cache.get(key));
	    }
	  }, {
	    key: 'getAll',
	    value: function getAll(callback) {
	      var _this3 = this;

	      if (!this.ready()) {
	        this.on('init', function () {
	          _this3.getAll(callback);
	        });
	        return;
	      }
	      callback(null, this._cache);
	    }
	  }, {
	    key: 'set',
	    value: function set() {
	      var _this4 = this;

	      var model = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      var callback = arguments[1];

	      // early return if no id or cid
	      if (!model.id && !model.cid) {
	        var error = new _Error2.default('Invalid model passed to storage');
	        callback(error);
	        return;
	      }

	      // needs to be on and running
	      if (!this.ready()) {
	        this.on('init', function () {
	          _this4.set(model, callback);
	        });
	        return;
	      }

	      var that = this;
	      var key = model.id || model.cid;
	      var dataJSON = typeof model.toJSON === 'function' ? model.toJSON() : model;
	      this.db.setItem(key, dataJSON, function (err) {
	        if (err) {
	          callback && callback(err);
	          return;
	        }
	        that._cache.set(model, { remove: false });
	        callback && callback(null, model);
	      });
	    }
	  }, {
	    key: 'remove',
	    value: function remove(model, callback) {
	      var _this5 = this;

	      if (!this.ready()) {
	        this.on('init', function () {
	          _this5.remove(model, callback);
	        });
	        return;
	      }
	      var key = (typeof model === 'undefined' ? 'undefined' : _typeof(model)) === 'object' ? model.id || model.cid : model;
	      this.db.removeItem(key, function (err) {
	        if (err) {
	          callback && callback(err);
	          return;
	        }
	        delete model.manager;
	        model.destroy().then(callback); // removes from cache
	      });
	    }
	  }, {
	    key: 'has',
	    value: function has(model, callback) {
	      var _this6 = this;

	      if (!this.ready()) {
	        this.on('init', function () {
	          _this6.has(model, callback);
	        }, this);
	        return;
	      }
	      this.get(model, function (err, data) {
	        var found = (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object';
	        callback(null, found);
	      });
	    }
	  }, {
	    key: 'clear',
	    value: function clear(callback) {
	      var _this7 = this;

	      if (!this.ready()) {
	        this.on('init', function () {
	          _this7.clear(callback);
	        });
	        return;
	      }
	      var that = this;
	      this.db.clear(function (err) {
	        if (err) {
	          callback && callback(err);
	          return;
	        }
	        that._cache.reset();
	        callback && callback();
	      });
	    }
	  }, {
	    key: 'size',
	    value: function size(callback) {
	      this.db.length(callback);
	    }
	  }, {
	    key: '_attachListeners',
	    value: function _attachListeners() {
	      var that = this;
	      // listen on cache because it is last updated
	      this._cache.on('update', function () {
	        that.trigger('update');
	      });
	    }
	  }]);

	  return Storage;
	}();

	// add events


	_underscore2.default.extend(Storage.prototype, _backbone2.default.Events);

	exports.default = Storage;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var require;var require;/* WEBPACK VAR INJECTION */(function(global) {/*!
	    localForage -- Offline Storage, Improved
	    Version 1.4.3
	    https://mozilla.github.io/localForage
	    (c) 2013-2016 Mozilla, Apache License 2.0
	*/
	(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
	'use strict';
	var immediate = _dereq_(2);

	/* istanbul ignore next */
	function INTERNAL() {}

	var handlers = {};

	var REJECTED = ['REJECTED'];
	var FULFILLED = ['FULFILLED'];
	var PENDING = ['PENDING'];

	module.exports = exports = Promise;

	function Promise(resolver) {
	  if (typeof resolver !== 'function') {
	    throw new TypeError('resolver must be a function');
	  }
	  this.state = PENDING;
	  this.queue = [];
	  this.outcome = void 0;
	  if (resolver !== INTERNAL) {
	    safelyResolveThenable(this, resolver);
	  }
	}

	Promise.prototype["catch"] = function (onRejected) {
	  return this.then(null, onRejected);
	};
	Promise.prototype.then = function (onFulfilled, onRejected) {
	  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
	    typeof onRejected !== 'function' && this.state === REJECTED) {
	    return this;
	  }
	  var promise = new this.constructor(INTERNAL);
	  if (this.state !== PENDING) {
	    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
	    unwrap(promise, resolver, this.outcome);
	  } else {
	    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
	  }

	  return promise;
	};
	function QueueItem(promise, onFulfilled, onRejected) {
	  this.promise = promise;
	  if (typeof onFulfilled === 'function') {
	    this.onFulfilled = onFulfilled;
	    this.callFulfilled = this.otherCallFulfilled;
	  }
	  if (typeof onRejected === 'function') {
	    this.onRejected = onRejected;
	    this.callRejected = this.otherCallRejected;
	  }
	}
	QueueItem.prototype.callFulfilled = function (value) {
	  handlers.resolve(this.promise, value);
	};
	QueueItem.prototype.otherCallFulfilled = function (value) {
	  unwrap(this.promise, this.onFulfilled, value);
	};
	QueueItem.prototype.callRejected = function (value) {
	  handlers.reject(this.promise, value);
	};
	QueueItem.prototype.otherCallRejected = function (value) {
	  unwrap(this.promise, this.onRejected, value);
	};

	function unwrap(promise, func, value) {
	  immediate(function () {
	    var returnValue;
	    try {
	      returnValue = func(value);
	    } catch (e) {
	      return handlers.reject(promise, e);
	    }
	    if (returnValue === promise) {
	      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
	    } else {
	      handlers.resolve(promise, returnValue);
	    }
	  });
	}

	handlers.resolve = function (self, value) {
	  var result = tryCatch(getThen, value);
	  if (result.status === 'error') {
	    return handlers.reject(self, result.value);
	  }
	  var thenable = result.value;

	  if (thenable) {
	    safelyResolveThenable(self, thenable);
	  } else {
	    self.state = FULFILLED;
	    self.outcome = value;
	    var i = -1;
	    var len = self.queue.length;
	    while (++i < len) {
	      self.queue[i].callFulfilled(value);
	    }
	  }
	  return self;
	};
	handlers.reject = function (self, error) {
	  self.state = REJECTED;
	  self.outcome = error;
	  var i = -1;
	  var len = self.queue.length;
	  while (++i < len) {
	    self.queue[i].callRejected(error);
	  }
	  return self;
	};

	function getThen(obj) {
	  // Make sure we only access the accessor once as required by the spec
	  var then = obj && obj.then;
	  if (obj && typeof obj === 'object' && typeof then === 'function') {
	    return function appyThen() {
	      then.apply(obj, arguments);
	    };
	  }
	}

	function safelyResolveThenable(self, thenable) {
	  // Either fulfill, reject or reject with error
	  var called = false;
	  function onError(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.reject(self, value);
	  }

	  function onSuccess(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.resolve(self, value);
	  }

	  function tryToUnwrap() {
	    thenable(onSuccess, onError);
	  }

	  var result = tryCatch(tryToUnwrap);
	  if (result.status === 'error') {
	    onError(result.value);
	  }
	}

	function tryCatch(func, value) {
	  var out = {};
	  try {
	    out.value = func(value);
	    out.status = 'success';
	  } catch (e) {
	    out.status = 'error';
	    out.value = e;
	  }
	  return out;
	}

	exports.resolve = resolve;
	function resolve(value) {
	  if (value instanceof this) {
	    return value;
	  }
	  return handlers.resolve(new this(INTERNAL), value);
	}

	exports.reject = reject;
	function reject(reason) {
	  var promise = new this(INTERNAL);
	  return handlers.reject(promise, reason);
	}

	exports.all = all;
	function all(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }

	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }

	  var values = new Array(len);
	  var resolved = 0;
	  var i = -1;
	  var promise = new this(INTERNAL);

	  while (++i < len) {
	    allResolver(iterable[i], i);
	  }
	  return promise;
	  function allResolver(value, i) {
	    self.resolve(value).then(resolveFromAll, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	    function resolveFromAll(outValue) {
	      values[i] = outValue;
	      if (++resolved === len && !called) {
	        called = true;
	        handlers.resolve(promise, values);
	      }
	    }
	  }
	}

	exports.race = race;
	function race(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }

	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }

	  var i = -1;
	  var promise = new this(INTERNAL);

	  while (++i < len) {
	    resolver(iterable[i]);
	  }
	  return promise;
	  function resolver(value) {
	    self.resolve(value).then(function (response) {
	      if (!called) {
	        called = true;
	        handlers.resolve(promise, response);
	      }
	    }, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	  }
	}

	},{"2":2}],2:[function(_dereq_,module,exports){
	(function (global){
	'use strict';
	var Mutation = global.MutationObserver || global.WebKitMutationObserver;

	var scheduleDrain;

	{
	  if (Mutation) {
	    var called = 0;
	    var observer = new Mutation(nextTick);
	    var element = global.document.createTextNode('');
	    observer.observe(element, {
	      characterData: true
	    });
	    scheduleDrain = function () {
	      element.data = (called = ++called % 2);
	    };
	  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
	    var channel = new global.MessageChannel();
	    channel.port1.onmessage = nextTick;
	    scheduleDrain = function () {
	      channel.port2.postMessage(0);
	    };
	  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
	    scheduleDrain = function () {

	      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	      var scriptEl = global.document.createElement('script');
	      scriptEl.onreadystatechange = function () {
	        nextTick();

	        scriptEl.onreadystatechange = null;
	        scriptEl.parentNode.removeChild(scriptEl);
	        scriptEl = null;
	      };
	      global.document.documentElement.appendChild(scriptEl);
	    };
	  } else {
	    scheduleDrain = function () {
	      setTimeout(nextTick, 0);
	    };
	  }
	}

	var draining;
	var queue = [];
	//named nextTick for less confusing stack traces
	function nextTick() {
	  draining = true;
	  var i, oldQueue;
	  var len = queue.length;
	  while (len) {
	    oldQueue = queue;
	    queue = [];
	    i = -1;
	    while (++i < len) {
	      oldQueue[i]();
	    }
	    len = queue.length;
	  }
	  draining = false;
	}

	module.exports = immediate;
	function immediate(task) {
	  if (queue.push(task) === 1 && !draining) {
	    scheduleDrain();
	  }
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{}],3:[function(_dereq_,module,exports){
	(function (global){
	'use strict';
	if (typeof global.Promise !== 'function') {
	  global.Promise = _dereq_(1);
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{"1":1}],4:[function(_dereq_,module,exports){
	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function getIDB() {
	    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
	    try {
	        if (typeof indexedDB !== 'undefined') {
	            return indexedDB;
	        }
	        if (typeof webkitIndexedDB !== 'undefined') {
	            return webkitIndexedDB;
	        }
	        if (typeof mozIndexedDB !== 'undefined') {
	            return mozIndexedDB;
	        }
	        if (typeof OIndexedDB !== 'undefined') {
	            return OIndexedDB;
	        }
	        if (typeof msIndexedDB !== 'undefined') {
	            return msIndexedDB;
	        }
	    } catch (e) {}
	}

	var idb = getIDB();

	function isIndexedDBValid() {
	    try {
	        // Initialize IndexedDB; fall back to vendor-prefixed versions
	        // if needed.
	        if (!idb) {
	            return false;
	        }
	        // We mimic PouchDB here; just UA test for Safari (which, as of
	        // iOS 8/Yosemite, doesn't properly support IndexedDB).
	        // IndexedDB support is broken and different from Blink's.
	        // This is faster than the test case (and it's sync), so we just
	        // do this. *SIGH*
	        // http://bl.ocks.org/nolanlawson/raw/c83e9039edf2278047e9/
	        //
	        // We test for openDatabase because IE Mobile identifies itself
	        // as Safari. Oh the lulz...
	        if (typeof openDatabase !== 'undefined' && typeof navigator !== 'undefined' && navigator.userAgent && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
	            return false;
	        }

	        return idb && typeof idb.open === 'function' &&
	        // Some Samsung/HTC Android 4.0-4.3 devices
	        // have older IndexedDB specs; if this isn't available
	        // their IndexedDB is too old for us to use.
	        // (Replaces the onupgradeneeded test.)
	        typeof IDBKeyRange !== 'undefined';
	    } catch (e) {
	        return false;
	    }
	}

	function isWebSQLValid() {
	    return typeof openDatabase === 'function';
	}

	function isLocalStorageValid() {
	    try {
	        return typeof localStorage !== 'undefined' && 'setItem' in localStorage && localStorage.setItem;
	    } catch (e) {
	        return false;
	    }
	}

	// Abstracts constructing a Blob object, so it also works in older
	// browsers that don't support the native Blob constructor. (i.e.
	// old QtWebKit versions, at least).
	// Abstracts constructing a Blob object, so it also works in older
	// browsers that don't support the native Blob constructor. (i.e.
	// old QtWebKit versions, at least).
	function createBlob(parts, properties) {
	    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
	    parts = parts || [];
	    properties = properties || {};
	    try {
	        return new Blob(parts, properties);
	    } catch (e) {
	        if (e.name !== 'TypeError') {
	            throw e;
	        }
	        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
	        var builder = new Builder();
	        for (var i = 0; i < parts.length; i += 1) {
	            builder.append(parts[i]);
	        }
	        return builder.getBlob(properties.type);
	    }
	}

	// This is CommonJS because lie is an external dependency, so Rollup
	// can just ignore it.
	if (typeof Promise === 'undefined' && typeof _dereq_ !== 'undefined') {
	    _dereq_(3);
	}
	var Promise$1 = Promise;

	function executeCallback(promise, callback) {
	    if (callback) {
	        promise.then(function (result) {
	            callback(null, result);
	        }, function (error) {
	            callback(error);
	        });
	    }
	}

	function executeTwoCallbacks(promise, callback, errorCallback) {
	    if (typeof callback === 'function') {
	        promise.then(callback);
	    }

	    if (typeof errorCallback === 'function') {
	        promise["catch"](errorCallback);
	    }
	}

	// Some code originally from async_storage.js in
	// [Gaia](https://github.com/mozilla-b2g/gaia).

	var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
	var supportsBlobs;
	var dbContexts;
	var toString = Object.prototype.toString;

	// Transform a binary string to an array buffer, because otherwise
	// weird stuff happens when you try to work with the binary string directly.
	// It is known.
	// From http://stackoverflow.com/questions/14967647/ (continues on next line)
	// encode-decode-image-with-base64-breaks-image (2013-04-21)
	function _binStringToArrayBuffer(bin) {
	    var length = bin.length;
	    var buf = new ArrayBuffer(length);
	    var arr = new Uint8Array(buf);
	    for (var i = 0; i < length; i++) {
	        arr[i] = bin.charCodeAt(i);
	    }
	    return buf;
	}

	//
	// Blobs are not supported in all versions of IndexedDB, notably
	// Chrome <37 and Android <5. In those versions, storing a blob will throw.
	//
	// Various other blob bugs exist in Chrome v37-42 (inclusive).
	// Detecting them is expensive and confusing to users, and Chrome 37-42
	// is at very low usage worldwide, so we do a hacky userAgent check instead.
	//
	// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
	// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
	// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
	//
	// Code borrowed from PouchDB. See:
	// https://github.com/pouchdb/pouchdb/blob/9c25a23/src/adapters/idb/blobSupport.js
	//
	function _checkBlobSupportWithoutCaching(txn) {
	    return new Promise$1(function (resolve) {
	        var blob = createBlob(['']);
	        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

	        txn.onabort = function (e) {
	            // If the transaction aborts now its due to not being able to
	            // write to the database, likely due to the disk being full
	            e.preventDefault();
	            e.stopPropagation();
	            resolve(false);
	        };

	        txn.oncomplete = function () {
	            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
	            var matchedEdge = navigator.userAgent.match(/Edge\//);
	            // MS Edge pretends to be Chrome 42:
	            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
	            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
	        };
	    })["catch"](function () {
	        return false; // error, so assume unsupported
	    });
	}

	function _checkBlobSupport(idb) {
	    if (typeof supportsBlobs === 'boolean') {
	        return Promise$1.resolve(supportsBlobs);
	    }
	    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
	        supportsBlobs = value;
	        return supportsBlobs;
	    });
	}

	function _deferReadiness(dbInfo) {
	    var dbContext = dbContexts[dbInfo.name];

	    // Create a deferred object representing the current database operation.
	    var deferredOperation = {};

	    deferredOperation.promise = new Promise$1(function (resolve) {
	        deferredOperation.resolve = resolve;
	    });

	    // Enqueue the deferred operation.
	    dbContext.deferredOperations.push(deferredOperation);

	    // Chain its promise to the database readiness.
	    if (!dbContext.dbReady) {
	        dbContext.dbReady = deferredOperation.promise;
	    } else {
	        dbContext.dbReady = dbContext.dbReady.then(function () {
	            return deferredOperation.promise;
	        });
	    }
	}

	function _advanceReadiness(dbInfo) {
	    var dbContext = dbContexts[dbInfo.name];

	    // Dequeue a deferred operation.
	    var deferredOperation = dbContext.deferredOperations.pop();

	    // Resolve its promise (which is part of the database readiness
	    // chain of promises).
	    if (deferredOperation) {
	        deferredOperation.resolve();
	    }
	}

	function _getConnection(dbInfo, upgradeNeeded) {
	    return new Promise$1(function (resolve, reject) {

	        if (dbInfo.db) {
	            if (upgradeNeeded) {
	                _deferReadiness(dbInfo);
	                dbInfo.db.close();
	            } else {
	                return resolve(dbInfo.db);
	            }
	        }

	        var dbArgs = [dbInfo.name];

	        if (upgradeNeeded) {
	            dbArgs.push(dbInfo.version);
	        }

	        var openreq = idb.open.apply(idb, dbArgs);

	        if (upgradeNeeded) {
	            openreq.onupgradeneeded = function (e) {
	                var db = openreq.result;
	                try {
	                    db.createObjectStore(dbInfo.storeName);
	                    if (e.oldVersion <= 1) {
	                        // Added when support for blob shims was added
	                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
	                    }
	                } catch (ex) {
	                    if (ex.name === 'ConstraintError') {
	                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
	                    } else {
	                        throw ex;
	                    }
	                }
	            };
	        }

	        openreq.onerror = function () {
	            reject(openreq.error);
	        };

	        openreq.onsuccess = function () {
	            resolve(openreq.result);
	            _advanceReadiness(dbInfo);
	        };
	    });
	}

	function _getOriginalConnection(dbInfo) {
	    return _getConnection(dbInfo, false);
	}

	function _getUpgradedConnection(dbInfo) {
	    return _getConnection(dbInfo, true);
	}

	function _isUpgradeNeeded(dbInfo, defaultVersion) {
	    if (!dbInfo.db) {
	        return true;
	    }

	    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
	    var isDowngrade = dbInfo.version < dbInfo.db.version;
	    var isUpgrade = dbInfo.version > dbInfo.db.version;

	    if (isDowngrade) {
	        // If the version is not the default one
	        // then warn for impossible downgrade.
	        if (dbInfo.version !== defaultVersion) {
	            console.warn('The database "' + dbInfo.name + '"' + ' can\'t be downgraded from version ' + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
	        }
	        // Align the versions to prevent errors.
	        dbInfo.version = dbInfo.db.version;
	    }

	    if (isUpgrade || isNewStore) {
	        // If the store is new then increment the version (if needed).
	        // This will trigger an "upgradeneeded" event which is required
	        // for creating a store.
	        if (isNewStore) {
	            var incVersion = dbInfo.db.version + 1;
	            if (incVersion > dbInfo.version) {
	                dbInfo.version = incVersion;
	            }
	        }

	        return true;
	    }

	    return false;
	}

	// encode a blob for indexeddb engines that don't support blobs
	function _encodeBlob(blob) {
	    return new Promise$1(function (resolve, reject) {
	        var reader = new FileReader();
	        reader.onerror = reject;
	        reader.onloadend = function (e) {
	            var base64 = btoa(e.target.result || '');
	            resolve({
	                __local_forage_encoded_blob: true,
	                data: base64,
	                type: blob.type
	            });
	        };
	        reader.readAsBinaryString(blob);
	    });
	}

	// decode an encoded blob
	function _decodeBlob(encodedBlob) {
	    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
	    return createBlob([arrayBuff], { type: encodedBlob.type });
	}

	// is this one of our fancy encoded blobs?
	function _isEncodedBlob(value) {
	    return value && value.__local_forage_encoded_blob;
	}

	// Specialize the default `ready()` function by making it dependent
	// on the current database operations. Thus, the driver will be actually
	// ready when it's been initialized (default) *and* there are no pending
	// operations on the database (initiated by some other instances).
	function _fullyReady(callback) {
	    var self = this;

	    var promise = self._initReady().then(function () {
	        var dbContext = dbContexts[self._dbInfo.name];

	        if (dbContext && dbContext.dbReady) {
	            return dbContext.dbReady;
	        }
	    });

	    executeTwoCallbacks(promise, callback, callback);
	    return promise;
	}

	// Open the IndexedDB database (automatically creates one if one didn't
	// previously exist), using any options set in the config.
	function _initStorage(options) {
	    var self = this;
	    var dbInfo = {
	        db: null
	    };

	    if (options) {
	        for (var i in options) {
	            dbInfo[i] = options[i];
	        }
	    }

	    // Initialize a singleton container for all running localForages.
	    if (!dbContexts) {
	        dbContexts = {};
	    }

	    // Get the current context of the database;
	    var dbContext = dbContexts[dbInfo.name];

	    // ...or create a new context.
	    if (!dbContext) {
	        dbContext = {
	            // Running localForages sharing a database.
	            forages: [],
	            // Shared database.
	            db: null,
	            // Database readiness (promise).
	            dbReady: null,
	            // Deferred operations on the database.
	            deferredOperations: []
	        };
	        // Register the new context in the global container.
	        dbContexts[dbInfo.name] = dbContext;
	    }

	    // Register itself as a running localForage in the current context.
	    dbContext.forages.push(self);

	    // Replace the default `ready()` function with the specialized one.
	    if (!self._initReady) {
	        self._initReady = self.ready;
	        self.ready = _fullyReady;
	    }

	    // Create an array of initialization states of the related localForages.
	    var initPromises = [];

	    function ignoreErrors() {
	        // Don't handle errors here,
	        // just makes sure related localForages aren't pending.
	        return Promise$1.resolve();
	    }

	    for (var j = 0; j < dbContext.forages.length; j++) {
	        var forage = dbContext.forages[j];
	        if (forage !== self) {
	            // Don't wait for itself...
	            initPromises.push(forage._initReady()["catch"](ignoreErrors));
	        }
	    }

	    // Take a snapshot of the related localForages.
	    var forages = dbContext.forages.slice(0);

	    // Initialize the connection process only when
	    // all the related localForages aren't pending.
	    return Promise$1.all(initPromises).then(function () {
	        dbInfo.db = dbContext.db;
	        // Get the connection or open a new one without upgrade.
	        return _getOriginalConnection(dbInfo);
	    }).then(function (db) {
	        dbInfo.db = db;
	        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
	            // Reopen the database for upgrading.
	            return _getUpgradedConnection(dbInfo);
	        }
	        return db;
	    }).then(function (db) {
	        dbInfo.db = dbContext.db = db;
	        self._dbInfo = dbInfo;
	        // Share the final connection amongst related localForages.
	        for (var k = 0; k < forages.length; k++) {
	            var forage = forages[k];
	            if (forage !== self) {
	                // Self is already up-to-date.
	                forage._dbInfo.db = dbInfo.db;
	                forage._dbInfo.version = dbInfo.version;
	            }
	        }
	    });
	}

	function getItem(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);
	            var req = store.get(key);

	            req.onsuccess = function () {
	                var value = req.result;
	                if (value === undefined) {
	                    value = null;
	                }
	                if (_isEncodedBlob(value)) {
	                    value = _decodeBlob(value);
	                }
	                resolve(value);
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Iterate over all items stored in database.
	function iterate(iterator, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

	            var req = store.openCursor();
	            var iterationNumber = 1;

	            req.onsuccess = function () {
	                var cursor = req.result;

	                if (cursor) {
	                    var value = cursor.value;
	                    if (_isEncodedBlob(value)) {
	                        value = _decodeBlob(value);
	                    }
	                    var result = iterator(value, cursor.key, iterationNumber++);

	                    if (result !== void 0) {
	                        resolve(result);
	                    } else {
	                        cursor["continue"]();
	                    }
	                } else {
	                    resolve();
	                }
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);

	    return promise;
	}

	function setItem(key, value, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        var dbInfo;
	        self.ready().then(function () {
	            dbInfo = self._dbInfo;
	            if (toString.call(value) === '[object Blob]') {
	                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
	                    if (blobSupport) {
	                        return value;
	                    }
	                    return _encodeBlob(value);
	                });
	            }
	            return value;
	        }).then(function (value) {
	            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
	            var store = transaction.objectStore(dbInfo.storeName);

	            // The reason we don't _save_ null is because IE 10 does
	            // not support saving the `null` type in IndexedDB. How
	            // ironic, given the bug below!
	            // See: https://github.com/mozilla/localForage/issues/161
	            if (value === null) {
	                value = undefined;
	            }

	            transaction.oncomplete = function () {
	                // Cast to undefined so the value passed to
	                // callback/promise is the same as what one would get out
	                // of `getItem()` later. This leads to some weirdness
	                // (setItem('foo', undefined) will return `null`), but
	                // it's not my fault localStorage is our baseline and that
	                // it's weird.
	                if (value === undefined) {
	                    value = null;
	                }

	                resolve(value);
	            };
	            transaction.onabort = transaction.onerror = function () {
	                var err = req.error ? req.error : req.transaction.error;
	                reject(err);
	            };

	            var req = store.put(value, key);
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function removeItem(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
	            var store = transaction.objectStore(dbInfo.storeName);

	            // We use a Grunt task to make this safe for IE and some
	            // versions of Android (including those used by Cordova).
	            // Normally IE won't like `.delete()` and will insist on
	            // using `['delete']()`, but we have a build step that
	            // fixes this for us now.
	            var req = store["delete"](key);
	            transaction.oncomplete = function () {
	                resolve();
	            };

	            transaction.onerror = function () {
	                reject(req.error);
	            };

	            // The request will be also be aborted if we've exceeded our storage
	            // space.
	            transaction.onabort = function () {
	                var err = req.error ? req.error : req.transaction.error;
	                reject(err);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function clear(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
	            var store = transaction.objectStore(dbInfo.storeName);
	            var req = store.clear();

	            transaction.oncomplete = function () {
	                resolve();
	            };

	            transaction.onabort = transaction.onerror = function () {
	                var err = req.error ? req.error : req.transaction.error;
	                reject(err);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function length(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);
	            var req = store.count();

	            req.onsuccess = function () {
	                resolve(req.result);
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function key(n, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        if (n < 0) {
	            resolve(null);

	            return;
	        }

	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

	            var advanced = false;
	            var req = store.openCursor();
	            req.onsuccess = function () {
	                var cursor = req.result;
	                if (!cursor) {
	                    // this means there weren't enough keys
	                    resolve(null);

	                    return;
	                }

	                if (n === 0) {
	                    // We have the first key, return it if that's what they
	                    // wanted.
	                    resolve(cursor.key);
	                } else {
	                    if (!advanced) {
	                        // Otherwise, ask the cursor to skip ahead n
	                        // records.
	                        advanced = true;
	                        cursor.advance(n);
	                    } else {
	                        // When we get here, we've got the nth key.
	                        resolve(cursor.key);
	                    }
	                }
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function keys(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

	            var req = store.openCursor();
	            var keys = [];

	            req.onsuccess = function () {
	                var cursor = req.result;

	                if (!cursor) {
	                    resolve(keys);
	                    return;
	                }

	                keys.push(cursor.key);
	                cursor["continue"]();
	            };

	            req.onerror = function () {
	                reject(req.error);
	            };
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	var asyncStorage = {
	    _driver: 'asyncStorage',
	    _initStorage: _initStorage,
	    iterate: iterate,
	    getItem: getItem,
	    setItem: setItem,
	    removeItem: removeItem,
	    clear: clear,
	    length: length,
	    key: key,
	    keys: keys
	};

	// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
	// it to Base64, so this is how we store it to prevent very strange errors with less
	// verbose ways of binary <-> string data storage.
	var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	var BLOB_TYPE_PREFIX = '~~local_forage_type~';
	var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

	var SERIALIZED_MARKER = '__lfsc__:';
	var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

	// OMG the serializations!
	var TYPE_ARRAYBUFFER = 'arbf';
	var TYPE_BLOB = 'blob';
	var TYPE_INT8ARRAY = 'si08';
	var TYPE_UINT8ARRAY = 'ui08';
	var TYPE_UINT8CLAMPEDARRAY = 'uic8';
	var TYPE_INT16ARRAY = 'si16';
	var TYPE_INT32ARRAY = 'si32';
	var TYPE_UINT16ARRAY = 'ur16';
	var TYPE_UINT32ARRAY = 'ui32';
	var TYPE_FLOAT32ARRAY = 'fl32';
	var TYPE_FLOAT64ARRAY = 'fl64';
	var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

	var toString$1 = Object.prototype.toString;

	function stringToBuffer(serializedString) {
	    // Fill the string into a ArrayBuffer.
	    var bufferLength = serializedString.length * 0.75;
	    var len = serializedString.length;
	    var i;
	    var p = 0;
	    var encoded1, encoded2, encoded3, encoded4;

	    if (serializedString[serializedString.length - 1] === '=') {
	        bufferLength--;
	        if (serializedString[serializedString.length - 2] === '=') {
	            bufferLength--;
	        }
	    }

	    var buffer = new ArrayBuffer(bufferLength);
	    var bytes = new Uint8Array(buffer);

	    for (i = 0; i < len; i += 4) {
	        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
	        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
	        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
	        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

	        /*jslint bitwise: true */
	        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
	        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
	        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
	    }
	    return buffer;
	}

	// Converts a buffer to a string to store, serialized, in the backend
	// storage library.
	function bufferToString(buffer) {
	    // base64-arraybuffer
	    var bytes = new Uint8Array(buffer);
	    var base64String = '';
	    var i;

	    for (i = 0; i < bytes.length; i += 3) {
	        /*jslint bitwise: true */
	        base64String += BASE_CHARS[bytes[i] >> 2];
	        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
	        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
	        base64String += BASE_CHARS[bytes[i + 2] & 63];
	    }

	    if (bytes.length % 3 === 2) {
	        base64String = base64String.substring(0, base64String.length - 1) + '=';
	    } else if (bytes.length % 3 === 1) {
	        base64String = base64String.substring(0, base64String.length - 2) + '==';
	    }

	    return base64String;
	}

	// Serialize a value, afterwards executing a callback (which usually
	// instructs the `setItem()` callback/promise to be executed). This is how
	// we store binary data with localStorage.
	function serialize(value, callback) {
	    var valueType = '';
	    if (value) {
	        valueType = toString$1.call(value);
	    }

	    // Cannot use `value instanceof ArrayBuffer` or such here, as these
	    // checks fail when running the tests using casper.js...
	    //
	    // TODO: See why those tests fail and use a better solution.
	    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
	        // Convert binary arrays to a string and prefix the string with
	        // a special marker.
	        var buffer;
	        var marker = SERIALIZED_MARKER;

	        if (value instanceof ArrayBuffer) {
	            buffer = value;
	            marker += TYPE_ARRAYBUFFER;
	        } else {
	            buffer = value.buffer;

	            if (valueType === '[object Int8Array]') {
	                marker += TYPE_INT8ARRAY;
	            } else if (valueType === '[object Uint8Array]') {
	                marker += TYPE_UINT8ARRAY;
	            } else if (valueType === '[object Uint8ClampedArray]') {
	                marker += TYPE_UINT8CLAMPEDARRAY;
	            } else if (valueType === '[object Int16Array]') {
	                marker += TYPE_INT16ARRAY;
	            } else if (valueType === '[object Uint16Array]') {
	                marker += TYPE_UINT16ARRAY;
	            } else if (valueType === '[object Int32Array]') {
	                marker += TYPE_INT32ARRAY;
	            } else if (valueType === '[object Uint32Array]') {
	                marker += TYPE_UINT32ARRAY;
	            } else if (valueType === '[object Float32Array]') {
	                marker += TYPE_FLOAT32ARRAY;
	            } else if (valueType === '[object Float64Array]') {
	                marker += TYPE_FLOAT64ARRAY;
	            } else {
	                callback(new Error('Failed to get type for BinaryArray'));
	            }
	        }

	        callback(marker + bufferToString(buffer));
	    } else if (valueType === '[object Blob]') {
	        // Conver the blob to a binaryArray and then to a string.
	        var fileReader = new FileReader();

	        fileReader.onload = function () {
	            // Backwards-compatible prefix for the blob type.
	            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

	            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
	        };

	        fileReader.readAsArrayBuffer(value);
	    } else {
	        try {
	            callback(JSON.stringify(value));
	        } catch (e) {
	            console.error("Couldn't convert value into a JSON string: ", value);

	            callback(null, e);
	        }
	    }
	}

	// Deserialize data we've inserted into a value column/field. We place
	// special markers into our strings to mark them as encoded; this isn't
	// as nice as a meta field, but it's the only sane thing we can do whilst
	// keeping localStorage support intact.
	//
	// Oftentimes this will just deserialize JSON content, but if we have a
	// special marker (SERIALIZED_MARKER, defined above), we will extract
	// some kind of arraybuffer/binary data/typed array out of the string.
	function deserialize(value) {
	    // If we haven't marked this string as being specially serialized (i.e.
	    // something other than serialized JSON), we can just return it and be
	    // done with it.
	    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
	        return JSON.parse(value);
	    }

	    // The following code deals with deserializing some kind of Blob or
	    // TypedArray. First we separate out the type of data we're dealing
	    // with from the data itself.
	    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
	    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

	    var blobType;
	    // Backwards-compatible blob type serialization strategy.
	    // DBs created with older versions of localForage will simply not have the blob type.
	    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
	        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
	        blobType = matcher[1];
	        serializedString = serializedString.substring(matcher[0].length);
	    }
	    var buffer = stringToBuffer(serializedString);

	    // Return the right type based on the code/type set during
	    // serialization.
	    switch (type) {
	        case TYPE_ARRAYBUFFER:
	            return buffer;
	        case TYPE_BLOB:
	            return createBlob([buffer], { type: blobType });
	        case TYPE_INT8ARRAY:
	            return new Int8Array(buffer);
	        case TYPE_UINT8ARRAY:
	            return new Uint8Array(buffer);
	        case TYPE_UINT8CLAMPEDARRAY:
	            return new Uint8ClampedArray(buffer);
	        case TYPE_INT16ARRAY:
	            return new Int16Array(buffer);
	        case TYPE_UINT16ARRAY:
	            return new Uint16Array(buffer);
	        case TYPE_INT32ARRAY:
	            return new Int32Array(buffer);
	        case TYPE_UINT32ARRAY:
	            return new Uint32Array(buffer);
	        case TYPE_FLOAT32ARRAY:
	            return new Float32Array(buffer);
	        case TYPE_FLOAT64ARRAY:
	            return new Float64Array(buffer);
	        default:
	            throw new Error('Unkown type: ' + type);
	    }
	}

	var localforageSerializer = {
	    serialize: serialize,
	    deserialize: deserialize,
	    stringToBuffer: stringToBuffer,
	    bufferToString: bufferToString
	};

	/*
	 * Includes code from:
	 *
	 * base64-arraybuffer
	 * https://github.com/niklasvh/base64-arraybuffer
	 *
	 * Copyright (c) 2012 Niklas von Hertzen
	 * Licensed under the MIT license.
	 */
	// Open the WebSQL database (automatically creates one if one didn't
	// previously exist), using any options set in the config.
	function _initStorage$1(options) {
	    var self = this;
	    var dbInfo = {
	        db: null
	    };

	    if (options) {
	        for (var i in options) {
	            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
	        }
	    }

	    var dbInfoPromise = new Promise$1(function (resolve, reject) {
	        // Open the database; the openDatabase API will automatically
	        // create it for us if it doesn't exist.
	        try {
	            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
	        } catch (e) {
	            return reject(e);
	        }

	        // Create our key/value table if it doesn't exist.
	        dbInfo.db.transaction(function (t) {
	            t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' (id INTEGER PRIMARY KEY, key unique, value)', [], function () {
	                self._dbInfo = dbInfo;
	                resolve();
	            }, function (t, error) {
	                reject(error);
	            });
	        });
	    });

	    dbInfo.serializer = localforageSerializer;
	    return dbInfoPromise;
	}

	function getItem$1(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
	                    var result = results.rows.length ? results.rows.item(0).value : null;

	                    // Check to see if this is serialized content we need to
	                    // unpack.
	                    if (result) {
	                        result = dbInfo.serializer.deserialize(result);
	                    }

	                    resolve(result);
	                }, function (t, error) {

	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function iterate$1(iterator, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;

	            dbInfo.db.transaction(function (t) {
	                t.executeSql('SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
	                    var rows = results.rows;
	                    var length = rows.length;

	                    for (var i = 0; i < length; i++) {
	                        var item = rows.item(i);
	                        var result = item.value;

	                        // Check to see if this is serialized content
	                        // we need to unpack.
	                        if (result) {
	                            result = dbInfo.serializer.deserialize(result);
	                        }

	                        result = iterator(result, item.key, i + 1);

	                        // void(0) prevents problems with redefinition
	                        // of `undefined`.
	                        if (result !== void 0) {
	                            resolve(result);
	                            return;
	                        }
	                    }

	                    resolve();
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function setItem$1(key, value, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            // The localStorage API doesn't return undefined values in an
	            // "expected" way, so undefined is always cast to null in all
	            // drivers. See: https://github.com/mozilla/localForage/pull/42
	            if (value === undefined) {
	                value = null;
	            }

	            // Save the original value to pass to the callback.
	            var originalValue = value;

	            var dbInfo = self._dbInfo;
	            dbInfo.serializer.serialize(value, function (value, error) {
	                if (error) {
	                    reject(error);
	                } else {
	                    dbInfo.db.transaction(function (t) {
	                        t.executeSql('INSERT OR REPLACE INTO ' + dbInfo.storeName + ' (key, value) VALUES (?, ?)', [key, value], function () {
	                            resolve(originalValue);
	                        }, function (t, error) {
	                            reject(error);
	                        });
	                    }, function (sqlError) {
	                        // The transaction failed; check
	                        // to see if it's a quota error.
	                        if (sqlError.code === sqlError.QUOTA_ERR) {
	                            // We reject the callback outright for now, but
	                            // it's worth trying to re-run the transaction.
	                            // Even if the user accepts the prompt to use
	                            // more storage on Safari, this error will
	                            // be called.
	                            //
	                            // TODO: Try to re-run the transaction.
	                            reject(sqlError);
	                        }
	                    });
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function removeItem$1(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
	                    resolve();
	                }, function (t, error) {

	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Deletes every item in the table.
	// TODO: Find out if this resets the AUTO_INCREMENT number.
	function clear$1(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('DELETE FROM ' + dbInfo.storeName, [], function () {
	                    resolve();
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Does a simple `COUNT(key)` to get the number of items stored in
	// localForage.
	function length$1(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                // Ahhh, SQL makes this one soooooo easy.
	                t.executeSql('SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
	                    var result = results.rows.item(0).c;

	                    resolve(result);
	                }, function (t, error) {

	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Return the key located at key index X; essentially gets the key from a
	// `WHERE id = ?`. This is the most efficient way I can think to implement
	// this rarely-used (in my experience) part of the API, but it can seem
	// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
	// the ID of each key will change every time it's updated. Perhaps a stored
	// procedure for the `setItem()` SQL would solve this problem?
	// TODO: Don't change ID on `setItem()`.
	function key$1(n, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
	                    var result = results.rows.length ? results.rows.item(0).key : null;
	                    resolve(result);
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function keys$1(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
	                    var keys = [];

	                    for (var i = 0; i < results.rows.length; i++) {
	                        keys.push(results.rows.item(i).key);
	                    }

	                    resolve(keys);
	                }, function (t, error) {

	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	var webSQLStorage = {
	    _driver: 'webSQLStorage',
	    _initStorage: _initStorage$1,
	    iterate: iterate$1,
	    getItem: getItem$1,
	    setItem: setItem$1,
	    removeItem: removeItem$1,
	    clear: clear$1,
	    length: length$1,
	    key: key$1,
	    keys: keys$1
	};

	// Config the localStorage backend, using options set in the config.
	function _initStorage$2(options) {
	    var self = this;
	    var dbInfo = {};
	    if (options) {
	        for (var i in options) {
	            dbInfo[i] = options[i];
	        }
	    }

	    dbInfo.keyPrefix = dbInfo.name + '/';

	    if (dbInfo.storeName !== self._defaultConfig.storeName) {
	        dbInfo.keyPrefix += dbInfo.storeName + '/';
	    }

	    self._dbInfo = dbInfo;
	    dbInfo.serializer = localforageSerializer;

	    return Promise$1.resolve();
	}

	// Remove all keys from the datastore, effectively destroying all data in
	// the app's key/value store!
	function clear$2(callback) {
	    var self = this;
	    var promise = self.ready().then(function () {
	        var keyPrefix = self._dbInfo.keyPrefix;

	        for (var i = localStorage.length - 1; i >= 0; i--) {
	            var key = localStorage.key(i);

	            if (key.indexOf(keyPrefix) === 0) {
	                localStorage.removeItem(key);
	            }
	        }
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Retrieve an item from the store. Unlike the original async_storage
	// library in Gaia, we don't modify return values at all. If a key's value
	// is `undefined`, we pass that value to the callback function.
	function getItem$2(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var result = localStorage.getItem(dbInfo.keyPrefix + key);

	        // If a result was found, parse it from the serialized
	        // string into a JS object. If result isn't truthy, the key
	        // is likely undefined and we'll pass it straight to the
	        // callback.
	        if (result) {
	            result = dbInfo.serializer.deserialize(result);
	        }

	        return result;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Iterate over all items in the store.
	function iterate$2(iterator, callback) {
	    var self = this;

	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var keyPrefix = dbInfo.keyPrefix;
	        var keyPrefixLength = keyPrefix.length;
	        var length = localStorage.length;

	        // We use a dedicated iterator instead of the `i` variable below
	        // so other keys we fetch in localStorage aren't counted in
	        // the `iterationNumber` argument passed to the `iterate()`
	        // callback.
	        //
	        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
	        var iterationNumber = 1;

	        for (var i = 0; i < length; i++) {
	            var key = localStorage.key(i);
	            if (key.indexOf(keyPrefix) !== 0) {
	                continue;
	            }
	            var value = localStorage.getItem(key);

	            // If a result was found, parse it from the serialized
	            // string into a JS object. If result isn't truthy, the
	            // key is likely undefined and we'll pass it straight
	            // to the iterator.
	            if (value) {
	                value = dbInfo.serializer.deserialize(value);
	            }

	            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

	            if (value !== void 0) {
	                return value;
	            }
	        }
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Same as localStorage's key() method, except takes a callback.
	function key$2(n, callback) {
	    var self = this;
	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var result;
	        try {
	            result = localStorage.key(n);
	        } catch (error) {
	            result = null;
	        }

	        // Remove the prefix from the key, if a key is found.
	        if (result) {
	            result = result.substring(dbInfo.keyPrefix.length);
	        }

	        return result;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function keys$2(callback) {
	    var self = this;
	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var length = localStorage.length;
	        var keys = [];

	        for (var i = 0; i < length; i++) {
	            if (localStorage.key(i).indexOf(dbInfo.keyPrefix) === 0) {
	                keys.push(localStorage.key(i).substring(dbInfo.keyPrefix.length));
	            }
	        }

	        return keys;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Supply the number of keys in the datastore to the callback function.
	function length$2(callback) {
	    var self = this;
	    var promise = self.keys().then(function (keys) {
	        return keys.length;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Remove an item from the store, nice and simple.
	function removeItem$2(key, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        localStorage.removeItem(dbInfo.keyPrefix + key);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Set a key's value and run an optional callback once the value is set.
	// Unlike Gaia's implementation, the callback function is passed the value,
	// in case you want to operate on that value only after you're sure it
	// saved, or something like that.
	function setItem$2(key, value, callback) {
	    var self = this;

	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    var promise = self.ready().then(function () {
	        // Convert undefined values to null.
	        // https://github.com/mozilla/localForage/pull/42
	        if (value === undefined) {
	            value = null;
	        }

	        // Save the original value to pass to the callback.
	        var originalValue = value;

	        return new Promise$1(function (resolve, reject) {
	            var dbInfo = self._dbInfo;
	            dbInfo.serializer.serialize(value, function (value, error) {
	                if (error) {
	                    reject(error);
	                } else {
	                    try {
	                        localStorage.setItem(dbInfo.keyPrefix + key, value);
	                        resolve(originalValue);
	                    } catch (e) {
	                        // localStorage capacity exceeded.
	                        // TODO: Make this a specific error/event.
	                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
	                            reject(e);
	                        }
	                        reject(e);
	                    }
	                }
	            });
	        });
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	var localStorageWrapper = {
	    _driver: 'localStorageWrapper',
	    _initStorage: _initStorage$2,
	    // Default API, from Gaia/localStorage.
	    iterate: iterate$2,
	    getItem: getItem$2,
	    setItem: setItem$2,
	    removeItem: removeItem$2,
	    clear: clear$2,
	    length: length$2,
	    key: key$2,
	    keys: keys$2
	};

	// Custom drivers are stored here when `defineDriver()` is called.
	// They are shared across all instances of localForage.
	var CustomDrivers = {};

	var DriverType = {
	    INDEXEDDB: 'asyncStorage',
	    LOCALSTORAGE: 'localStorageWrapper',
	    WEBSQL: 'webSQLStorage'
	};

	var DefaultDriverOrder = [DriverType.INDEXEDDB, DriverType.WEBSQL, DriverType.LOCALSTORAGE];

	var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'];

	var DefaultConfig = {
	    description: '',
	    driver: DefaultDriverOrder.slice(),
	    name: 'localforage',
	    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
	    // we can use without a prompt.
	    size: 4980736,
	    storeName: 'keyvaluepairs',
	    version: 1.0
	};

	var driverSupport = {};
	// Check to see if IndexedDB is available and if it is the latest
	// implementation; it's our preferred backend library. We use "_spec_test"
	// as the name of the database because it's not the one we'll operate on,
	// but it's useful to make sure its using the right spec.
	// See: https://github.com/mozilla/localForage/issues/128
	driverSupport[DriverType.INDEXEDDB] = isIndexedDBValid();

	driverSupport[DriverType.WEBSQL] = isWebSQLValid();

	driverSupport[DriverType.LOCALSTORAGE] = isLocalStorageValid();

	var isArray = Array.isArray || function (arg) {
	    return Object.prototype.toString.call(arg) === '[object Array]';
	};

	function callWhenReady(localForageInstance, libraryMethod) {
	    localForageInstance[libraryMethod] = function () {
	        var _args = arguments;
	        return localForageInstance.ready().then(function () {
	            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
	        });
	    };
	}

	function extend() {
	    for (var i = 1; i < arguments.length; i++) {
	        var arg = arguments[i];

	        if (arg) {
	            for (var key in arg) {
	                if (arg.hasOwnProperty(key)) {
	                    if (isArray(arg[key])) {
	                        arguments[0][key] = arg[key].slice();
	                    } else {
	                        arguments[0][key] = arg[key];
	                    }
	                }
	            }
	        }
	    }

	    return arguments[0];
	}

	function isLibraryDriver(driverName) {
	    for (var driver in DriverType) {
	        if (DriverType.hasOwnProperty(driver) && DriverType[driver] === driverName) {
	            return true;
	        }
	    }

	    return false;
	}

	var LocalForage = function () {
	    function LocalForage(options) {
	        _classCallCheck(this, LocalForage);

	        this.INDEXEDDB = DriverType.INDEXEDDB;
	        this.LOCALSTORAGE = DriverType.LOCALSTORAGE;
	        this.WEBSQL = DriverType.WEBSQL;

	        this._defaultConfig = extend({}, DefaultConfig);
	        this._config = extend({}, this._defaultConfig, options);
	        this._driverSet = null;
	        this._initDriver = null;
	        this._ready = false;
	        this._dbInfo = null;

	        this._wrapLibraryMethodsWithReady();
	        this.setDriver(this._config.driver);
	    }

	    // Set any config values for localForage; can be called anytime before
	    // the first API call (e.g. `getItem`, `setItem`).
	    // We loop through options so we don't overwrite existing config
	    // values.


	    LocalForage.prototype.config = function config(options) {
	        // If the options argument is an object, we use it to set values.
	        // Otherwise, we return either a specified config value or all
	        // config values.
	        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
	            // If localforage is ready and fully initialized, we can't set
	            // any new configuration values. Instead, we return an error.
	            if (this._ready) {
	                return new Error("Can't call config() after localforage " + 'has been used.');
	            }

	            for (var i in options) {
	                if (i === 'storeName') {
	                    options[i] = options[i].replace(/\W/g, '_');
	                }

	                this._config[i] = options[i];
	            }

	            // after all config options are set and
	            // the driver option is used, try setting it
	            if ('driver' in options && options.driver) {
	                this.setDriver(this._config.driver);
	            }

	            return true;
	        } else if (typeof options === 'string') {
	            return this._config[options];
	        } else {
	            return this._config;
	        }
	    };

	    // Used to define a custom driver, shared across all instances of
	    // localForage.


	    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
	        var promise = new Promise$1(function (resolve, reject) {
	            try {
	                var driverName = driverObject._driver;
	                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');
	                var namingError = new Error('Custom driver name already in use: ' + driverObject._driver);

	                // A driver name should be defined and not overlap with the
	                // library-defined, default drivers.
	                if (!driverObject._driver) {
	                    reject(complianceError);
	                    return;
	                }
	                if (isLibraryDriver(driverObject._driver)) {
	                    reject(namingError);
	                    return;
	                }

	                var customDriverMethods = LibraryMethods.concat('_initStorage');
	                for (var i = 0; i < customDriverMethods.length; i++) {
	                    var customDriverMethod = customDriverMethods[i];
	                    if (!customDriverMethod || !driverObject[customDriverMethod] || typeof driverObject[customDriverMethod] !== 'function') {
	                        reject(complianceError);
	                        return;
	                    }
	                }

	                var supportPromise = Promise$1.resolve(true);
	                if ('_support' in driverObject) {
	                    if (driverObject._support && typeof driverObject._support === 'function') {
	                        supportPromise = driverObject._support();
	                    } else {
	                        supportPromise = Promise$1.resolve(!!driverObject._support);
	                    }
	                }

	                supportPromise.then(function (supportResult) {
	                    driverSupport[driverName] = supportResult;
	                    CustomDrivers[driverName] = driverObject;
	                    resolve();
	                }, reject);
	            } catch (e) {
	                reject(e);
	            }
	        });

	        executeTwoCallbacks(promise, callback, errorCallback);
	        return promise;
	    };

	    LocalForage.prototype.driver = function driver() {
	        return this._driver || null;
	    };

	    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
	        var self = this;
	        var getDriverPromise = Promise$1.resolve().then(function () {
	            if (isLibraryDriver(driverName)) {
	                switch (driverName) {
	                    case self.INDEXEDDB:
	                        return asyncStorage;
	                    case self.LOCALSTORAGE:
	                        return localStorageWrapper;
	                    case self.WEBSQL:
	                        return webSQLStorage;
	                }
	            } else if (CustomDrivers[driverName]) {
	                return CustomDrivers[driverName];
	            } else {
	                throw new Error('Driver not found.');
	            }
	        });
	        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
	        return getDriverPromise;
	    };

	    LocalForage.prototype.getSerializer = function getSerializer(callback) {
	        var serializerPromise = Promise$1.resolve(localforageSerializer);
	        executeTwoCallbacks(serializerPromise, callback);
	        return serializerPromise;
	    };

	    LocalForage.prototype.ready = function ready(callback) {
	        var self = this;

	        var promise = self._driverSet.then(function () {
	            if (self._ready === null) {
	                self._ready = self._initDriver();
	            }

	            return self._ready;
	        });

	        executeTwoCallbacks(promise, callback, callback);
	        return promise;
	    };

	    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
	        var self = this;

	        if (!isArray(drivers)) {
	            drivers = [drivers];
	        }

	        var supportedDrivers = this._getSupportedDrivers(drivers);

	        function setDriverToConfig() {
	            self._config.driver = self.driver();
	        }

	        function initDriver(supportedDrivers) {
	            return function () {
	                var currentDriverIndex = 0;

	                function driverPromiseLoop() {
	                    while (currentDriverIndex < supportedDrivers.length) {
	                        var driverName = supportedDrivers[currentDriverIndex];
	                        currentDriverIndex++;

	                        self._dbInfo = null;
	                        self._ready = null;

	                        return self.getDriver(driverName).then(function (driver) {
	                            self._extend(driver);
	                            setDriverToConfig();

	                            self._ready = self._initStorage(self._config);
	                            return self._ready;
	                        })["catch"](driverPromiseLoop);
	                    }

	                    setDriverToConfig();
	                    var error = new Error('No available storage method found.');
	                    self._driverSet = Promise$1.reject(error);
	                    return self._driverSet;
	                }

	                return driverPromiseLoop();
	            };
	        }

	        // There might be a driver initialization in progress
	        // so wait for it to finish in order to avoid a possible
	        // race condition to set _dbInfo
	        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
	            return Promise$1.resolve();
	        }) : Promise$1.resolve();

	        this._driverSet = oldDriverSetDone.then(function () {
	            var driverName = supportedDrivers[0];
	            self._dbInfo = null;
	            self._ready = null;

	            return self.getDriver(driverName).then(function (driver) {
	                self._driver = driver._driver;
	                setDriverToConfig();
	                self._wrapLibraryMethodsWithReady();
	                self._initDriver = initDriver(supportedDrivers);
	            });
	        })["catch"](function () {
	            setDriverToConfig();
	            var error = new Error('No available storage method found.');
	            self._driverSet = Promise$1.reject(error);
	            return self._driverSet;
	        });

	        executeTwoCallbacks(this._driverSet, callback, errorCallback);
	        return this._driverSet;
	    };

	    LocalForage.prototype.supports = function supports(driverName) {
	        return !!driverSupport[driverName];
	    };

	    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
	        extend(this, libraryMethodsAndProperties);
	    };

	    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
	        var supportedDrivers = [];
	        for (var i = 0, len = drivers.length; i < len; i++) {
	            var driverName = drivers[i];
	            if (this.supports(driverName)) {
	                supportedDrivers.push(driverName);
	            }
	        }
	        return supportedDrivers;
	    };

	    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
	        // Add a stub for each driver API method that delays the call to the
	        // corresponding driver method until localForage is ready. These stubs
	        // will be replaced by the driver methods as soon as the driver is
	        // loaded, so there is no performance impact.
	        for (var i = 0; i < LibraryMethods.length; i++) {
	            callWhenReady(this, LibraryMethods[i]);
	        }
	    };

	    LocalForage.prototype.createInstance = function createInstance(options) {
	        return new LocalForage(options);
	    };

	    return LocalForage;
	}();

	// The actual localForage object that we expose as a module or via a
	// global. It's extended by pulling in one of our other libraries.


	var localforage_js = new LocalForage();

	module.exports = localforage_js;

	},{"3":3}]},{},[4])(4)
	});
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ])
});
;