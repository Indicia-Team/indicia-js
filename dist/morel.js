(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"), require("underscore"), require("backbone"));
	else if(typeof define === 'function' && define.amd)
		define("Morel", ["jquery", "underscore", "backbone"], factory);
	else if(typeof exports === 'object')
		exports["Morel"] = factory(require("jquery"), require("underscore"), require("backbone"));
	else
		root["Morel"] = factory(root["jquery"], root["underscore"], root["backbone"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__) {
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

	var _jquery = __webpack_require__(1);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _underscore = __webpack_require__(2);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _backbone = __webpack_require__(3);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _Sample = __webpack_require__(4);

	var _Sample2 = _interopRequireDefault(_Sample);

	var _Occurrence = __webpack_require__(7);

	var _Occurrence2 = _interopRequireDefault(_Occurrence);

	var _Storage = __webpack_require__(11);

	var _Storage2 = _interopRequireDefault(_Storage);

	var _DatabaseStorage = __webpack_require__(13);

	var _DatabaseStorage2 = _interopRequireDefault(_DatabaseStorage);

	var _LocalStorage = __webpack_require__(12);

	var _LocalStorage2 = _interopRequireDefault(_LocalStorage);

	var _Image = __webpack_require__(8);

	var _Image2 = _interopRequireDefault(_Image);

	var _Error = __webpack_require__(9);

	var _Error2 = _interopRequireDefault(_Error);

	var _constants = __webpack_require__(5);

	var _constants2 = _interopRequireDefault(_constants);

	var _helpers = __webpack_require__(6);

	var _helpers2 = _interopRequireDefault(_helpers);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Morel = function () {
	  function Morel() {
	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, Morel);

	    this.options = options;

	    this.storage = new _Storage2.default({
	      appname: options.appname,
	      Sample: options.Sample,
	      Storage: options.Storage,
	      manager: this
	    });
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
	    }
	  }, {
	    key: 'remove',
	    value: function remove(model, callback, options) {
	      this.storage.remove(model, callback, options);
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
	      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	      var returnPromise = new _jquery2.default.Deferred();

	      // sync all in collection
	      function syncEach(collectionToSync) {
	        var toWait = [];
	        collectionToSync.each(function (model) {
	          // todo: reuse the passed options model
	          var promise = model.save(null, {
	            remote: true,
	            timeout: options.timeout
	          });
	          var passingPromise = new _jquery2.default.Deferred();
	          if (!promise) {
	            // model was invalid
	            passingPromise.resolve();
	          } else {
	            // valid model, but in case it fails sync carry on
	            promise.always(function () {
	              passingPromise.resolve();
	            });
	          }
	          toWait.push(passingPromise);
	        });

	        var dfd = _jquery2.default.when.apply(_jquery2.default, toWait);
	        dfd.then(function () {
	          returnPromise.resolve();
	          options.success && options.success();
	        });
	      }

	      if (collection) {
	        syncEach(collection);
	        return returnPromise.promise();
	      }

	      // get all models to submit
	      this.getAll(function (err, receivedCollection) {
	        if (err) {
	          returnPromise.reject();
	          options.error && options.error(err);
	          return;
	        }

	        syncEach(receivedCollection);
	      });
	      return returnPromise.promise();
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
	      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

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

	      var dfd = new _jquery2.default.Deferred();
	      this._getModelFormData(model, function (err, formData) {
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

	        xhr.done(function (data, textStatus, jqXHR) {
	          dfd.resolve(data, textStatus, jqXHR);
	        });
	        xhr.fail(function (jqXHR, textStatus, errorThrown) {
	          dfd.reject(jqXHR, textStatus, errorThrown);
	        });
	        model.trigger('request', model, xhr, options);
	      });

	      return dfd.promise();
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
	          var imageDfd = new _jquery2.default.Deferred();
	          imageProcesses.push(imageDfd);

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
	            imageDfd.resolve();
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

	              xhr.send();
	            })();
	          } else {
	            onSuccess(null, null, url);
	          }
	        });

	        occurrenceProcesses.push(_jquery2.default.when.apply(_jquery2.default, imageProcesses));
	        occCount++;
	      });

	      _jquery2.default.when.apply(_jquery2.default, occurrenceProcesses).then(function () {
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
	  }]);

	  return Morel;
	}();

	_underscore2.default.extend(Morel.prototype, _backbone2.default.Events);

	_underscore2.default.extend(Morel, _constants2.default, {
	  VERSION: '3.1.0', // library version, generated/replaced by grunt

	  Sample: _Sample2.default,
	  Occurrence: _Occurrence2.default,
	  DatabaseStorage: _DatabaseStorage2.default,
	  LocalStorage: _LocalStorage2.default,
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
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /** *********************************************************************
	                                                                                                                                                                                                                                                   * SAMPLE
	                                                                                                                                                                                                                                                   *
	                                                                                                                                                                                                                                                   * Refers to the event in which the sightings were observed, in other
	                                                                                                                                                                                                                                                   * words it describes the place, date, people, environmental conditions etc.
	                                                                                                                                                                                                                                                   * Within a sample, you can have zero or more occurrences which refer to each
	                                                                                                                                                                                                                                                   * species sighted as part of the sample.
	                                                                                                                                                                                                                                                   **********************************************************************/


	var _jquery = __webpack_require__(1);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _backbone = __webpack_require__(3);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(2);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _constants = __webpack_require__(5);

	var _constants2 = _interopRequireDefault(_constants);

	var _helpers = __webpack_require__(6);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _Occurrence = __webpack_require__(7);

	var _Occurrence2 = _interopRequireDefault(_Occurrence);

	var _Collection = __webpack_require__(10);

	var _Collection2 = _interopRequireDefault(_Collection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Sample = _backbone2.default.Model.extend({
	  Occurrence: _Occurrence2.default,

	  constructor: function constructor() {
	    var _this = this;

	    var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var that = this;
	    var attrs = attributes;

	    var defaultAttrs = {
	      date: new Date(),
	      location_type: 'latlon'
	    };

	    attrs = _underscore2.default.extend(defaultAttrs, attrs);

	    this.cid = options.cid || _helpers2.default.getNewUUID();
	    this.manager = options.manager || this.manager;
	    if (this.manager) this.sync = this.manager.sync;

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

	    // updated on server
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

	    this.initialize.apply(this, arguments);
	  },


	  /**
	   * Saves the record to the record manager and if valid syncs it with DB
	   * Returns on success: model, response, options
	   */
	  save: function save(attrs) {
	    var _this2 = this;

	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var model = this;

	    if (!this.manager) return false;

	    // only update local cache and DB
	    if (!options.remote) {
	      var _ret2 = function () {
	        // todo: add attrs if passed to model
	        var deferred = _backbone2.default.$.Deferred();

	        _this2.manager.set(_this2, function (err) {
	          if (err) {
	            deferred.reject(err);
	            options.error && options.error(err);
	            return;
	          }
	          deferred.resolve(model, {}, options);
	          options.success && options.success(model, {}, options);
	        });
	        return {
	          v: deferred.promise()
	        };
	      }();

	      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
	    }

	    // remote
	    var xhr = _backbone2.default.Model.prototype.save.apply(this, arguments);
	    return xhr;
	  },
	  destroy: function destroy() {
	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    var dfd = new _jquery2.default.Deferred();

	    if (this.manager && !options.noSave) {
	      // save the changes permanentely
	      this.manager.remove(this, function (err) {
	        if (err) {
	          options.error && options.error(err);
	          return;
	        }
	        dfd.resolve();
	        options.success && options.success();
	      });
	    } else {
	      // removes from all collections etc
	      this.stopListening();
	      this.trigger('destroy', this, this.collection, options);

	      dfd.resolve();
	      options.success && options.success();
	    }

	    return dfd.promise();
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

	    var data = {
	      id: this.id,
	      cid: this.cid,
	      metadata: this.metadata,
	      attributes: this.attributes,
	      occurrences: occurrences
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
	  // for Latitude and Longitude in decimal form (WGS84 datum)
	  location_name: { id: 'location_name' },
	  form: { id: 'input_form' },
	  group: { id: 'group_id' },
	  deleted: { id: 'deleted' }
	};

	exports.default = Sample;

/***/ },
/* 5 */
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
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _jquery = __webpack_require__(1);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _backbone = __webpack_require__(3);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(2);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _helpers = __webpack_require__(6);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _Image = __webpack_require__(8);

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

	    var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var that = this;
	    var attrs = attributes;

	    this.cid = options.cid || _helpers2.default.getNewUUID();
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
	            image.setOccurrence(that);
	            images.push(image);
	          } else {
	            var modelOptions = _underscore2.default.extend(image, { occurrence: that });
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
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    if (!this.sample) return false;
	    return this.sample.save(attrs, options);
	  },
	  destroy: function destroy() {
	    var _this2 = this;

	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    var dfd = new _jquery2.default.Deferred();

	    // removes from all collections etc
	    this.stopListening();
	    this.trigger('destroy', this, this.collection, options);

	    if (this.sample && !options.noSave) {
	      (function () {
	        var success = options.success;
	        options.success = function () {
	          dfd.resolve();
	          success && success();
	        };

	        // save the changes permanentely
	        _this2.save(null, options);
	      })();
	    } else {
	      dfd.resolve();
	      options.success && options.success();
	    }

	    return dfd.promise();
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
	    image.setOccurrence(this);
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /** *********************************************************************
	                                                                                                                                                                                                                                                   * IMAGE
	                                                                                                                                                                                                                                                   **********************************************************************/


	var _jquery = __webpack_require__(1);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _backbone = __webpack_require__(3);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(2);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _helpers = __webpack_require__(6);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _Error = __webpack_require__(9);

	var _Error2 = _interopRequireDefault(_Error);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var THUMBNAIL_WIDTH = 100; // px
	var THUMBNAIL_HEIGHT = 100; // px

	var ImageModel = _backbone2.default.Model.extend({
	  constructor: function constructor() {
	    var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var attrs = attributes;
	    if (typeof attributes === 'string') {
	      var data = attributes;
	      attrs = { data: data };
	      return;
	    }

	    this.cid = options.cid || _helpers2.default.getNewUUID();
	    this.setOccurrence(options.occurrence || this.occurrence);

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
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    if (!this.occurrence) return false;
	    return this.occurrence.save(attrs, options);
	  },
	  destroy: function destroy() {
	    var _this = this;

	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    var dfd = new _jquery2.default.Deferred();

	    // removes from all collections etc
	    this.stopListening();
	    this.trigger('destroy', this, this.collection, options);

	    if (this.occurrence && !options.noSave) {
	      (function () {
	        var success = options.success;
	        options.success = function () {
	          dfd.resolve();
	          success && success();
	        };

	        // save the changes permanentely
	        _this.save(null, options);
	      })();
	    } else {
	      dfd.resolve();
	      options.success && options.success();
	    }

	    return dfd.promise();
	  },


	  /**
	   * Returns image's absolute URL or dataURI.
	   */
	  getURL: function getURL() {
	    return this.get('data');
	  },


	  /**
	   * Sets parent Occurrence.
	   * @param occurrence
	   */
	  setOccurrence: function setOccurrence(occurrence) {
	    if (!occurrence) return;

	    var that = this;
	    this.occurrence = occurrence;
	    this.occurrence.on('destroy', function () {
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
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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
	    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

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
/* 9 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/** *********************************************************************
	 * ERROR
	 **********************************************************************/

	var Error = function Error(options) {
	  _classCallCheck(this, Error);

	  if (typeof options === 'string') {
	    this.number = -1;
	    this.message = options;
	    return;
	  }

	  this.number = options.number || -1;
	  this.message = options.message || '';
	};

	exports.default = Error;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _backbone = __webpack_require__(3);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(2);

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

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /** *********************************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * STORAGE
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      **********************************************************************/


	var _underscore = __webpack_require__(2);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _backbone = __webpack_require__(3);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _Error = __webpack_require__(9);

	var _Error2 = _interopRequireDefault(_Error);

	var _Sample = __webpack_require__(4);

	var _Sample2 = _interopRequireDefault(_Sample);

	var _Collection = __webpack_require__(10);

	var _Collection2 = _interopRequireDefault(_Collection);

	var _LocalStorage = __webpack_require__(12);

	var _LocalStorage2 = _interopRequireDefault(_LocalStorage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Storage = function () {
	  function Storage() {
	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, Storage);

	    var that = this;

	    this.Sample = options.Sample || _Sample2.default;
	    this.manager = options.manager;

	    // internal storage
	    this.Storage = options.Storage || _LocalStorage2.default;
	    this.storage = new this.Storage({
	      appname: options.appname
	    });

	    // initialize the cache
	    this.cache = {};
	    this.initialized = false;
	    this.storage.getAll(function (err, data) {
	      data || (data = {});

	      var samples = [];
	      var sample = null;
	      var keys = Object.keys(data);

	      for (var i = 0; i < keys.length; i++) {
	        var current = data[keys[i]];
	        var modelOptions = _underscore2.default.extend(current, { manager: that.manager });
	        sample = new that.Sample(current.attributes, modelOptions);
	        samples.push(sample);
	      }
	      that.cache = new _Collection2.default(samples, {
	        model: that.Sample
	      });
	      that._attachListeners();

	      that.initialized = true;
	      that.trigger('init');
	    });
	  }

	  _createClass(Storage, [{
	    key: 'get',
	    value: function get(model, callback) {
	      var _this = this;

	      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	      var that = this;
	      if (!this.initialized) {
	        this.on('init', function () {
	          _this.get(model, callback, options);
	        });
	        return;
	      }

	      var key = (typeof model === 'undefined' ? 'undefined' : _typeof(model)) === 'object' ? model.id || model.cid : model;

	      // a non cached version straight from storage medium
	      if (options.nonCached) {
	        this.storage.get(key, function (err, data) {
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

	      callback(null, this.cache.get(key));
	    }
	  }, {
	    key: 'getAll',
	    value: function getAll(callback) {
	      var _this2 = this;

	      if (!this.initialized) {
	        this.on('init', function () {
	          _this2.getAll(callback);
	        });
	        return;
	      }
	      callback(null, this.cache);
	    }
	  }, {
	    key: 'set',
	    value: function set() {
	      var _this3 = this;

	      var model = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	      var callback = arguments[1];

	      // early return if no id or cid
	      if (!model.id && !model.cid) {
	        var error = new _Error2.default('Invalid model passed to storage');
	        callback(error);
	        return;
	      }

	      // needs to be on and running
	      if (!this.initialized) {
	        this.on('init', function () {
	          _this3.set(model, callback);
	        });
	        return;
	      }

	      var that = this;
	      var key = model.id || model.cid;
	      this.storage.set(key, model, function (err) {
	        if (err) {
	          callback && callback(err);
	          return;
	        }
	        that.cache.set(model, { remove: false });
	        callback && callback(null, model);
	      });
	    }
	  }, {
	    key: 'remove',
	    value: function remove(model, callback) {
	      var _this4 = this;

	      if (!this.initialized) {
	        this.on('init', function () {
	          _this4.remove(model, callback);
	        });
	        return;
	      }
	      var key = (typeof model === 'undefined' ? 'undefined' : _typeof(model)) === 'object' ? model.id || model.cid : model;
	      this.storage.remove(key, function (err) {
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
	      var _this5 = this;

	      if (!this.initialized) {
	        this.on('init', function () {
	          _this5.has(model, callback);
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
	      var _this6 = this;

	      if (!this.initialized) {
	        this.on('init', function () {
	          _this6.clear(callback);
	        });
	        return;
	      }
	      var that = this;
	      this.storage.clear(function (err) {
	        if (err) {
	          callback && callback(err);
	          return;
	        }
	        that.cache.reset();
	        callback && callback();
	      });
	    }
	  }, {
	    key: 'size',
	    value: function size(callback) {
	      this.storage.size(callback);
	    }
	  }, {
	    key: '_attachListeners',
	    value: function _attachListeners() {
	      var that = this;
	      // listen on cache because it is last updated
	      this.cache.on('update', function () {
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

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Error = __webpack_require__(9);

	var _Error2 = _interopRequireDefault(_Error);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var LocalStorage = function () {
	  function LocalStorage() {
	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, LocalStorage);

	    this.TYPE = 'LocalStorage';
	    this.NAME = 'morel';
	    this.storage = window.localStorage;

	    this.NAME = options.appname ? this.NAME + '-' + options.appname : this.NAME;
	  }

	  /**
	   * Gets an item from the storage.
	   *
	   * @param key
	   */


	  _createClass(LocalStorage, [{
	    key: 'get',
	    value: function get(key, callback) {
	      var data = this.storage.getItem(this._getKey(key));
	      data = JSON.parse(data);

	      callback(null, data);
	    }

	    /**
	     * Returns all items from the storage;
	     *
	     * @returns {{}|*|m.Storage.storage}
	     */

	  }, {
	    key: 'getAll',
	    value: function getAll(callback) {
	      var data = {};
	      var key = '';
	      for (var i = 0, len = this.storage.length; i < len; ++i) {
	        key = this.storage.key(i);
	        // check if the key belongs to this storage
	        if (key.indexOf(this._getPrefix()) !== -1) {
	          var parsed = JSON.parse(this.storage.getItem(key));
	          data[key] = parsed;
	        }
	      }
	      callback(null, data);
	    }

	    /**
	     * Sets an item in the storage.
	     * Note: it overrides any existing key with the same name.
	     *
	     * @param key
	     * @param data JSON object
	     */

	  }, {
	    key: 'set',
	    value: function set(key, data, callback) {
	      var stringifiedData = JSON.stringify(data);
	      try {
	        this.storage.setItem(this._getKey(key), stringifiedData);
	        callback && callback(null, stringifiedData);
	      } catch (err) {
	        var exceeded = this._isQuotaExceeded(err);
	        var message = exceeded ? 'Storage exceed.' : err.message;

	        callback && callback(new _Error2.default(message), stringifiedData);
	      }
	    }

	    /**
	     * Removes an item from the storage.
	     *
	     * @param key
	     */

	  }, {
	    key: 'remove',
	    value: function remove(key, callback) {
	      this.storage.removeItem(this._getKey(key));
	      callback && callback();
	    }

	    /**
	     * Checks if a key exists.
	     *
	     * @param key Input name
	     * @returns {boolean}
	     */

	  }, {
	    key: 'has',
	    value: function has(key, callback) {
	      this.get(key, function (err, data) {
	        callback(null, data !== undefined && data !== null);
	      });
	    }

	    /**
	     * Clears the storage.
	     */

	  }, {
	    key: 'clear',
	    value: function clear(callback) {
	      this.storage.clear();
	      callback && callback();
	    }

	    /**
	     * Calculates current occupied the size of the storage.
	     *
	     * @param callback
	     */

	  }, {
	    key: 'size',
	    value: function size(callback) {
	      callback(null, this.storage.length);
	    }

	    /**
	     * Checks if there is enough space in the storage.
	     *
	     * @param size
	     * @returns {*}
	     */

	  }, {
	    key: 'hasSpace',
	    value: function hasSpace(size, callback) {
	      var taken = JSON.stringify(this.storage).length;
	      var left = 1024 * 1024 * 5 - taken;
	      if (left - size > 0) {
	        callback(null, 1);
	      } else {
	        callback(null, 0);
	      }
	    }
	  }, {
	    key: '_getKey',
	    value: function _getKey(key) {
	      return this._getPrefix() + key;
	    }
	  }, {
	    key: '_getPrefix',
	    value: function _getPrefix() {
	      return this.NAME + '-';
	    }

	    /**
	     * http://crocodillon.com/blog/always-catch-localstorage-security-and-quota-exceeded-errors
	     * @param e
	     * @returns {boolean}
	     * @private
	     */

	  }, {
	    key: '_isQuotaExceeded',
	    value: function _isQuotaExceeded(e) {
	      var quotaExceeded = false;
	      if (e) {
	        if (e.code) {
	          switch (e.code) {
	            case 22:
	              quotaExceeded = true;
	              break;
	            case 1014:
	              // Firefox
	              if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
	                quotaExceeded = true;
	              }
	              break;
	            default:
	          }
	        } else if (e.number === -2147024882) {
	          // Internet Explorer 8
	          quotaExceeded = true;
	        }
	      }
	      return quotaExceeded;
	    }
	  }]);

	  return LocalStorage;
	}();

	exports.default = LocalStorage;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /** *********************************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * DATABASE STORAGE
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      **********************************************************************/


	var _Error = __webpack_require__(9);

	var _Error2 = _interopRequireDefault(_Error);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * options:
	 *  @appname String subdomain name to use for storage
	 */

	var DatabaseStorage = function () {
	  function DatabaseStorage() {
	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, DatabaseStorage);

	    // because of iOS8 bug on home screen: null & readonly window.indexedDB
	    this.indexedDB = window._indexedDB || window.indexedDB;
	    this.IDBKeyRange = window._IDBKeyRange || window.IDBKeyRange;

	    this.VERSION = 1;
	    this.TYPE = 'DatabaseStorage';
	    this.NAME = 'morel';
	    this.STORE_NAME = 'samples';

	    this.NAME = options.appname ? this.NAME + '-' + options.appname : this.NAME;
	  }

	  /**
	   * Adds an item under a specified key to the database.
	   * Note: might be a good idea to move the key assignment away from
	   * the function parameters and rather auto assign one and return on callback.
	   *
	   * @param key
	   * @param data JSON or object having toJSON function
	   * @param callback
	   */


	  _createClass(DatabaseStorage, [{
	    key: 'set',
	    value: function set(key, data, callback) {
	      try {
	        this.open(function (err, store) {
	          if (err) {
	            callback && callback(err);
	            return;
	          }

	          var dataJSON = typeof data.toJSON === 'function' ? data.toJSON() : data;

	          var req = store.put(dataJSON, key);

	          req.onsuccess = function () {
	            callback && callback(null, dataJSON);
	          };

	          req.onerror = function (e) {
	            var message = 'Database Problem: ' + e.target.error.message;
	            var error = new _Error2.default(message);
	            console.error(message);
	            callback && callback(error);
	          };
	        });
	      } catch (err) {
	        callback && callback(err);
	      }
	    }

	    /**
	     * Gets a specific saved data from the database.
	     * @param key The stored data Id.
	     * @param callback
	     * @aram onError
	     * @returns {*}
	     */

	  }, {
	    key: 'get',
	    value: function get(key, callback) {
	      try {
	        this.open(function (err, store) {
	          if (err) {
	            callback(err);
	            return;
	          }

	          var req = store.index('id').get(key);
	          req.onsuccess = function (e) {
	            var data = e.target.result;
	            callback(null, data);
	          };

	          req.onerror = function (e) {
	            var message = 'Database Problem: ' + e.target.error.message;
	            var error = new _Error2.default(message);
	            console.error(message);
	            callback(error);
	          };
	        });
	      } catch (err) {
	        callback(err);
	      }
	    }

	    /**
	     * Removes a saved data from the database.
	     *
	     * @param key
	     * @param callback
	     * @param onError
	     */

	  }, {
	    key: 'remove',
	    value: function remove(key, callback) {
	      var that = this;

	      try {
	        this.open(function (err, store) {
	          if (err) {
	            callback && callback(err);
	            return;
	          }

	          var req = store.openCursor(that.IDBKeyRange.only(key));
	          req.onsuccess = function () {
	            var cursor = req.result;
	            if (cursor) {
	              store.delete(cursor.primaryKey);
	              cursor.continue();
	            } else {
	              callback && callback();
	            }
	          };
	          req.onerror = function (e) {
	            var message = 'Database Problem: ' + e.target.error.message;
	            var error = new _Error2.default(message);

	            console.error(message);
	            callback && callback(error);
	          };
	        });
	      } catch (err) {
	        callback && callback(err);
	      }
	    }

	    /**
	     * Brings back all saved data from the database.
	     */

	  }, {
	    key: 'getAll',
	    value: function getAll(callback) {
	      var that = this;

	      try {
	        this.open(function (err, store) {
	          if (err) {
	            callback(err);
	            return;
	          }

	          // Get everything in the store
	          var keyRange = that.IDBKeyRange.lowerBound(0);
	          var req = store.openCursor(keyRange);
	          var data = {};

	          req.onsuccess = function (e) {
	            var result = e.target.result;

	            // If there's data, add it to array
	            if (result) {
	              data[result.key] = result.value;
	              result.continue();

	              // Reach the end of the data
	            } else {
	                callback(null, data);
	              }
	          };

	          req.onerror = function (e) {
	            var message = 'Database Problem: ' + e.target.error.message;
	            var error = new _Error2.default(message);

	            console.error(message);
	            callback(error);
	          };
	        });
	      } catch (err) {
	        callback(err);
	      }
	    }

	    /**
	     * Checks whether the data under a provided key exists in the database.
	     *
	     * @param key
	     * @param callback
	     * @param onError
	     */

	  }, {
	    key: 'has',
	    value: function has(key, callback) {
	      this.get(key, function (err, data) {
	        if (err) {
	          callback(err);
	          return;
	        }
	        callback(null, data !== undefined && data !== null);
	      });
	    }

	    /**
	     * Clears all the saved data.
	     */

	  }, {
	    key: 'clear',
	    value: function clear(callback) {
	      try {
	        this.open(function (err, store) {
	          if (err) {
	            callback && callback(err);
	            return;
	          }

	          var req = store.clear();

	          req.onsuccess = function () {
	            callback && callback();
	          };

	          req.onerror = function (e) {
	            var message = 'Database Problem: ' + e.target.error.message;
	            var error = new _Error2.default(message);
	            console.error(message);

	            callback && callback(error);
	          };
	        });
	      } catch (err) {
	        callback && callback(err);
	      }
	    }
	  }, {
	    key: 'size',
	    value: function size(callback) {
	      this.getAll(function (err, data) {
	        if (err) {
	          callback(err);
	          return;
	        }
	        var size = Object.keys(data).length;
	        callback(null, size);
	      });
	    }

	    /**
	     * Opens a database connection and returns a store.
	     *
	     * @param onError
	     * @param callback
	     */

	  }, {
	    key: 'open',
	    value: function open(callback) {
	      var that = this;
	      var req = null;

	      try {
	        req = this.indexedDB.open(this.NAME, this.VERSION);

	        /**
	         * On Database opening success, returns the Records object store.
	         *
	         * @param e
	         */
	        req.onsuccess = function (e) {
	          var db = e.target.result;
	          var transaction = db.transaction([that.STORE_NAME], 'readwrite');
	          if (transaction) {
	            var store = transaction.objectStore(that.STORE_NAME);
	            if (store) {
	              callback(null, store);
	            } else {
	              var err = new _Error2.default('Database Problem: no such store');
	              callback(err);
	            }
	          }
	        };

	        /**
	         * If the Database needs an upgrade or is initialising.
	         *
	         * @param e
	         */
	        req.onupgradeneeded = function (e) {
	          var db = e.target.result;
	          db.createObjectStore(that.STORE_NAME);
	        };

	        /**
	         * Error of opening the database.
	         *
	         * @param e
	         */
	        req.onerror = function (e) {
	          var message = 'Database Problem: ' + e.target.error.message;
	          var error = new _Error2.default(message);

	          console.error(message);
	          callback(error);
	        };

	        /**
	         * Error on database being blocked.
	         *
	         * @param e
	         */
	        req.onblocked = function (e) {
	          var message = 'Database Problem: ' + e.target.error.message;
	          var error = new _Error2.default(message);

	          console.error(message);
	          callback(error);
	        };
	      } catch (err) {
	        callback(err);
	      }
	    }
	  }]);

	  return DatabaseStorage;
	}();

	exports.default = DatabaseStorage;

/***/ }
/******/ ])
});
;