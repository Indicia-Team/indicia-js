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
		module.exports = factory(require("underscore"), require("backbone"), require("jquery"), require("localforage"));
	else if(typeof define === 'function' && define.amd)
		define("Morel", ["_", "Backbone", "$", "localforage"], factory);
	else if(typeof exports === 'object')
		exports["Morel"] = factory(require("underscore"), require("backbone"), require("jquery"), require("localforage"));
	else
		root["Morel"] = factory(root["_"], root["Backbone"], root["$"], root["localforage"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_12__) {
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

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

	var _Image = __webpack_require__(7);

	var _Image2 = _interopRequireDefault(_Image);

	var _Error = __webpack_require__(5);

	var _Error2 = _interopRequireDefault(_Error);

	var _constants = __webpack_require__(4);

	var CONST = _interopRequireWildcard(_constants);

	var _helpers = __webpack_require__(6);

	var _helpers2 = _interopRequireDefault(_helpers);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
	    value: function get(model, options) {
	      return this.storage.get(model, options);
	    }
	  }, {
	    key: 'getAll',
	    value: function getAll(options) {
	      return this.storage.getAll(options);
	    }
	  }, {
	    key: 'set',
	    value: function set(model, options) {
	      if (model instanceof _Sample2.default) {
	        // not JSON but a whole sample model
	        model.manager = this; // set the manager on new model
	      }
	      return this.storage.set(model, options);

	      // this.storage.set(model, (...args) => {
	      //   this._addReference(model);
	      //   callback && callback(args);
	      // }, options);
	    }
	  }, {
	    key: 'remove',
	    value: function remove(model, options) {
	      return this.storage.remove(model, options);

	      // this.storage.remove(model, (...args) => {
	      //   this._removeReference(model);
	      //   callback && callback(args);
	      // }, options);
	    }
	  }, {
	    key: 'has',
	    value: function has(model, options) {
	      return this.storage.has(model, options);
	    }
	  }, {
	    key: 'clear',
	    value: function clear(options) {
	      return this.storage.clear(options);
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

	      // sync all in collection
	      function syncEach(collectionToSync) {
	        var toWait = [];
	        collectionToSync.each(function (model) {
	          // todo: reuse the passed options model
	          var xhr = model.save({
	            remote: true,
	            timeout: options.timeout
	          });
	          var syncPromise = void 0;
	          if (!xhr) {
	            // model was invalid
	            syncPromise = Promise.resolve();
	          } else {
	            // valid model, but in case it fails sync carry on
	            syncPromise = new Promise(function (fulfillSync) {
	              xhr.then(fulfillSync, fulfillSync);
	            });
	          }
	          toWait.push(syncPromise);
	        });

	        // after all is synced
	        return Promise.all(toWait);
	      }

	      if (collection) {
	        return syncEach(collection);
	      }

	      // get all models to submit
	      return this.getAll().then(syncEach);
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
	      if (model.getSyncStatus() === CONST.SYNCED || model.getSyncStatus() === CONST.SYNCHRONISING) {
	        return false;
	      }

	      var promise = new Promise(function (fulfill, reject) {
	        options.host = model.manager.options.host; // get the URL

	        Morel.prototype.post.apply(model.manager, [model, options]).then(function (successModel) {
	          // on success update the model and save to local storage
	          successModel.save().then(function () {
	            successModel.trigger('sync');
	            fulfill(successModel);
	          });
	        }).catch(reject);
	      });

	      return promise;
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

	      // async call to get the form data
	      return that._getModelFormData(model).then(function (formData) {
	        return Morel._ajaxModel(formData, model, options);
	      });
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
	    value: function _getModelFormData(model) {
	      var _this = this;

	      var promise = new Promise(function (fulfill) {
	        var flattened = model.flatten(_this._flattener);
	        var formData = new FormData();

	        // append images
	        var occCount = 0;
	        var subModelProcesses = [];
	        model.subModels.each(function (subModel) {
	          // on async run occCount will be incremented before used for image name
	          var localOccCount = occCount;
	          var imgCount = 0;

	          var imageProcesses = [];

	          subModel.images.each(function (image) {
	            var imagePromise = new Promise(function (_fulfill) {
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
	                _fulfill();
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
	            imageProcesses.push(imagePromise);
	          });

	          subModelProcesses.push(Promise.all(imageProcesses));
	          occCount++;
	        });

	        Promise.all(subModelProcesses).then(function () {
	          // append attributes
	          var keys = Object.keys(flattened);
	          for (var i = 0; i < keys.length; i++) {
	            formData.append(keys[i], flattened[keys[i]]);
	          }

	          // Add authentication
	          formData = _this.appendAuth(formData);
	          fulfill(formData);
	        });
	      });

	      return promise;
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
	      var cid = this.cid;
	      if (cid) {
	        if (this instanceof _Occurrence2.default) {
	          flattened[prefix + count + native + 'external_key'] = cid;
	        } else {
	          flattened[native + 'external_key'] = this.cid;
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
	     * Appends app authentication to the passed object.
	     * Note: object has to implement 'append' method.
	     *
	     * @param data An object to modify
	     * @returns {*} A data object
	     */

	  }, {
	    key: '_appendAppAuth',
	    value: function _appendAppAuth(data) {
	      data.append('api_key', this.options.api_key);

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

	  }], [{
	    key: '_ajaxModel',
	    value: function _ajaxModel(formData, model, options) {
	      // todo: use ajax promise
	      var promise = new Promise(function (fulfill, reject) {
	        // AJAX post
	        var fullSamplePostPath = CONST.API_BASE + CONST.API_VER + CONST.API_SAMPLES_PATH;
	        var xhr = options.xhr = _backbone2.default.ajax({
	          url: options.host + fullSamplePostPath,
	          type: 'POST',
	          data: formData,
	          processData: false,
	          contentType: false,
	          timeout: options.timeout || 30000 });

	        function getIDs() {
	          var submodels = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

	          var ids = {};
	          submodels.forEach(function (submodel) {
	            ids[submodel.external_key] = submodel.id;
	            if (submodel.subModels) {
	              _underscore2.default.extend(ids, getIDs(submodel.subModels)); // recursive iterate
	            }
	          });
	          return ids;
	        }

	        function setModelRemoteID(model, newRemoteIDs) {
	          model.id = newRemoteIDs[model.cid];

	          if (model.subModels) {
	            model.subModels.each(function (subModel) {
	              // recursively iterate over submodels
	              setModelRemoteID(subModel, newRemoteIDs);
	            });
	          }
	        }

	        xhr.done(function (responseData) {
	          model.synchronising = false;

	          // update the model and submodels with new remote IDs
	          var newRemoteIDs = {};
	          newRemoteIDs[responseData.data.external_key] = responseData.data.id;
	          _underscore2.default.extend(newRemoteIDs, getIDs(responseData.data.subModels));
	          setModelRemoteID(model, newRemoteIDs);

	          var timeNow = new Date();
	          model.metadata.server_on = timeNow;
	          model.metadata.updated_on = timeNow;
	          model.metadata.synced_on = timeNow;

	          model.save().then(fulfill);
	        });

	        xhr.fail(function (jqXHR, textStatus, errorThrown) {
	          model.synchronising = false;

	          if (errorThrown === 'Conflict') {
	            var _ret2 = function () {
	              // duplicate occurred
	              var newRemoteIDs = {};
	              jqXHR.responseJSON.errors.forEach(function (error) {
	                newRemoteIDs[model.cid] = error.sample_id;
	                newRemoteIDs[error.external_key] = error.id;
	              });
	              setModelRemoteID(model, newRemoteIDs);

	              var timeNow = new Date();
	              model.metadata.server_on = timeNow;
	              model.metadata.updated_on = timeNow;
	              model.metadata.synced_on = timeNow;
	              model.save().then(fulfill);
	              return {
	                v: void 0
	              };
	            }();

	            if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
	          }

	          model.trigger('error');

	          var error = new _Error2.default({ code: jqXHR.status, message: errorThrown });
	          reject(error);
	        });

	        model.trigger('request', model, xhr, options);
	      });

	      return promise;
	    }
	  }]);

	  return Morel;
	}();

	_underscore2.default.extend(Morel.prototype, _backbone2.default.Events);

	_underscore2.default.extend(Morel, CONST, {
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

	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _constants = __webpack_require__(4);

	var _Error = __webpack_require__(5);

	var _Error2 = _interopRequireDefault(_Error);

	var _helpers = __webpack_require__(6);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _Image = __webpack_require__(7);

	var _Image2 = _interopRequireDefault(_Image);

	var _Occurrence = __webpack_require__(9);

	var _Occurrence2 = _interopRequireDefault(_Occurrence);

	var _Collection = __webpack_require__(10);

	var _Collection2 = _interopRequireDefault(_Collection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/** *********************************************************************
	 * SAMPLE
	 *
	 * Refers to the event in which the sightings were observed, in other
	 * words it describes the place, date, people, environmental conditions etc.
	 * Within a sample, you can have zero or more subModels which refer to each
	 * species sighted as part of the sample.
	 **********************************************************************/
	var Sample = _backbone2.default.Model.extend({
	  type: 'sample',
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

	    this.id = options.id; // remote ID
	    this.cid = options.cid || _helpers2.default.getNewUUID();
	    this.setParent(options.parent || this.parent);
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

	        synced_on: null, // set when fully initialized only
	        server_on: null };
	    }

	    if (options.subModels) {
	      (function () {
	        // fill in existing ones
	        var subModels = [];

	        var subModelType = void 0; // to check subModels' consistency
	        _underscore2.default.each(options.subModels, function (subModel) {
	          // set parent sample's subModels type
	          if (!subModelType) {
	            subModelType = subModel.type;
	          } else if (subModelType !== subModel.type) {
	            // don't allow to add mixed type subModels
	            throw new _Error2.default('Sample cannot be initialised with mixed type submodels.');
	          }

	          if (subModel instanceof that.Occurrence || subModel instanceof Sample) {
	            subModel.setParent(that);
	            subModels.push(subModel);
	          } else {
	            var modelOptions = _underscore2.default.extend(subModel, { parent: that });
	            var newSubModel = void 0;
	            if (subModel.type === 'occurrence') {
	              newSubModel = new that.Occurrence(subModel.attributes, modelOptions);
	            } else {
	              newSubModel = new Sample(subModel.attributes, modelOptions);
	            }
	            subModels.push(newSubModel);
	          }
	        });

	        _this.subModels = new _Collection2.default(subModels, {
	          model: subModelType === 'occurrence' ? _this.Occurrence : Sample
	        });
	      })();
	    } else {
	      // init empty subModels collection
	      // don't set model type for it will be done on first subModel add
	      this.subModels = new _Collection2.default([]);
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
	  save: function save() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    if (this.parent) {
	      return this.parent.save(options);
	    }

	    if (!this.manager) {
	      return false;
	    }

	    // only update local cache and DB
	    if (!options.remote) {
	      // todo: add attrs if passed to model
	      return this.manager.set(this);
	    }

	    if (this.validate()) {
	      return false;
	    }

	    // remote
	    return _backbone2.default.Model.prototype.save.apply(this, [null, options]);
	  },
	  destroy: function destroy() {
	    var _this2 = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var promise = new Promise(function (fulfill, reject) {
	      if (_this2.manager && !options.noSave) {
	        // save the changes permanentely
	        _this2.manager.remove(_this2).then(fulfill, reject);
	      } else {
	        // removes from all collections etc
	        _this2.stopListening();
	        _this2.trigger('destroy', _this2, _this2.collection, options);

	        if (_this2.parent && !options.noSave) {
	          // save the changes permanentely
	          _this2.save(options).then(fulfill);
	        } else {
	          fulfill();
	        }
	      }
	    });

	    return promise;
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
	   * Adds an subModel to sample and sets the subModel's sample to this.
	   * @param subModel
	   */
	  addSubModel: function addSubModel(subModel) {
	    if (!subModel) return;
	    subModel.setParent(this);

	    if (!this.subModels.model.type) {
	      this.subModels.model = subModel.type === 'occurrence' ? this.Occurrence : Sample;
	    } else if (this.subModels.model.type !== subModel.type) {
	      // don't allow to add mixed type subModels
	      throw new _Error2.default('Cannot add a different type submodel to a sample.');
	    }

	    this.subModels.push(subModel);
	  },


	  /**
	   * Adds an image to subModel and sets the images's subModel to this.
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
	    var subModels = {};

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

	    // subModels
	    if (this.subModels.length === 0) {
	      sample.subModels = 'no subModels';
	    } else {
	      this.subModels.each(function (subModel) {
	        var errors = subModel.validate();
	        if (errors) {
	          var subModelID = subModel.cid;
	          subModels[subModelID] = errors;
	        }
	      });
	    }

	    if (!_underscore2.default.isEmpty(sample) || !_underscore2.default.isEmpty(subModels)) {
	      var errors = {
	        sample: sample,
	        subModels: subModels
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

	    // subModels
	    _underscore2.default.extend(flattened, this.subModels.flatten(flattener));
	    return flattened;
	  },
	  toJSON: function toJSON() {
	    var subModels = void 0;
	    var subModelsCollection = this.subModels;
	    if (!subModelsCollection) {
	      subModels = [];
	      console.warn('toJSON subModels missing');
	    } else {
	      subModels = subModelsCollection.toJSON();
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
	      type: this.type,
	      id: this.id,
	      cid: this.cid,
	      metadata: this.metadata,
	      attributes: this.attributes,
	      subModels: subModels,
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
	      return _constants.SYNCHRONISING;
	    }

	    if (this.id >= 0) {
	      // fully initialized
	      if (meta.synced_on) {
	        // changed_locally
	        if (meta.synced_on < meta.updated_on) {
	          // changed_server - conflict!
	          if (meta.synced_on < meta.server_on) {
	            return _constants.CONFLICT;
	          }
	          return _constants.CHANGED_LOCALLY;
	          // changed_server
	        } else if (meta.synced_on < meta.server_on) {
	          return _constants.CHANGED_SERVER;
	        }
	        return _constants.SYNCED;

	        // partially initialized - we know the record exists on
	        // server but has not yet been downloaded
	      }
	      return _constants.SERVER;

	      // local only
	    }
	    return _constants.LOCAL;
	  },


	  /**
	   * Returns submodel.
	   * @param index
	   * @returns {*}
	   */
	  getSubModel: function getSubModel() {
	    var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

	    return this.subModels.at(index);
	  },


	  /**
	   * Detach all the listeners.
	   */
	  offAll: function offAll() {
	    this._events = {};
	    this.subModels.offAll();
	    for (var i = 0; i < this.subModels.data.length; i++) {
	      this.subModels.models[i].offAll();
	    }
	  }
	});

	Sample.type = 'sample'; // need a static one

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

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/* eslint-disable */
	var API_BASE = exports.API_BASE = 'api/',
	    API_VER = exports.API_VER = 'v0.1',
	    API_SAMPLES_PATH = exports.API_SAMPLES_PATH = '/samples',
	    SYNCHRONISING = exports.SYNCHRONISING = 0,
	    SYNCED = exports.SYNCED = 1,
	    LOCAL = exports.LOCAL = 2,
	    SERVER = exports.SERVER = 3,
	    CHANGED_LOCALLY = exports.CHANGED_LOCALLY = 4,
	    CHANGED_SERVER = exports.CHANGED_SERVER = 5,
	    CONFLICT = exports.CONFLICT = -1;

/***/ },
/* 5 */
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
/* 6 */
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /** *********************************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * IMAGE
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          **********************************************************************/


	var _jquery = __webpack_require__(8);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _helpers = __webpack_require__(6);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _Error = __webpack_require__(5);

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

	    this.id = options.id; // remote ID
	    this.cid = options.cid || _helpers2.default.getNewUUID();
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
	  save: function save() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    if (!this.parent) return false;
	    return this.parent.save(options);
	  },
	  destroy: function destroy() {
	    var _this = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var promise = new Promise(function (fulfill) {
	      // removes from all collections etc
	      _this.stopListening();
	      _this.trigger('destroy', _this, _this.collection, options);

	      if (_this.parent && !options.noSave) {
	        // save the changes permanentely
	        _this.save(options).then(fulfill);
	        return;
	      }
	      fulfill();
	    });

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
	  resize: function resize(MAX_WIDTH, MAX_HEIGHT) {
	    var _this2 = this;

	    var that = this;
	    var promise = new Promise(function (fulfill, reject) {
	      ImageModel.resize(_this2.getURL(), _this2.get('type'), MAX_WIDTH, MAX_HEIGHT).then(function (args) {
	        var _args = _slicedToArray(args, 2),
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
	    var _this3 = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var that = this;

	    var promise = new Promise(function (fulfill, reject) {
	      // check if data source is dataURI
	      var re = /^data:/i;
	      if (re.test(_this3.getURL())) {
	        ImageModel.resize(_this3.getURL(), _this3.get('type'), THUMBNAIL_WIDTH || options.width, THUMBNAIL_WIDTH || options.width).then(function (args) {
	          var _args2 = _slicedToArray(args, 2),
	              image = _args2[0],
	              data = _args2[1];

	          that.set('thumbnail', data);
	          fulfill();
	        }).catch(reject);
	        return;
	      }

	      ImageModel.getDataURI(_this3.getURL(), {
	        width: THUMBNAIL_WIDTH || options.width,
	        height: THUMBNAIL_HEIGHT || options.height
	      }).then(function (data) {
	        that.set('thumbnail', data);
	        fulfill();
	      }).catch(reject);
	    });

	    return promise;
	  },
	  toJSON: function toJSON() {
	    var data = {
	      id: this.id,
	      cid: this.cid,
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
	  getDataURI: function getDataURI(file) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var promise = new Promise(function (fulfill, reject) {
	      // file paths
	      if (typeof file === 'string') {
	        var _ret = function () {
	          // get extension
	          var fileType = file.replace(/.*\.([a-z]+)$/i, '$1');
	          if (fileType === 'jpg') fileType = 'jpeg'; // to match media types image/jpeg

	          ImageModel.resize(file, fileType, options.width, options.height).then(function (args) {
	            var _args3 = _slicedToArray(args, 2),
	                image = _args3[0],
	                dataURI = _args3[1];

	            fulfill([dataURI, fileType, image.width, image.height]);
	          });
	          return {
	            v: void 0
	          };
	        }();

	        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	      }

	      // file inputs
	      if (!window.FileReader) {
	        var message = 'No File Reader';
	        var error = new _Error2.default(message);
	        console.error(message);

	        reject(error);
	        return;
	      }

	      var reader = new FileReader();
	      reader.onload = function (event) {
	        if (options.width || options.height) {
	          // resize
	          ImageModel.resize(event.target.result, file.type, options.width, options.height).then(function (args) {
	            var _args4 = _slicedToArray(args, 2),
	                image = _args4[0],
	                dataURI = _args4[1];

	            fulfill([dataURI, file.type, image.width, image.height]);
	          });
	        } else {
	          (function () {
	            var image = new window.Image(); // native one

	            image.onload = function () {
	              var type = file.type.replace(/.*\/([a-z]+)$/i, '$1');
	              fulfill([event.target.result, type, image.width, image.height]);
	            };
	            image.src = event.target.result;
	          })();
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
	    var promise = new Promise(function (fulfill, reject) {
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
	        fulfill([image, canvas.toDataURL(fileType)]);
	      };

	      image.src = data;
	    });

	    return promise;
	  }
	});

	exports.default = ImageModel;

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ },
/* 9 */
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

	var _helpers = __webpack_require__(6);

	var _helpers2 = _interopRequireDefault(_helpers);

	var _Image = __webpack_require__(7);

	var _Image2 = _interopRequireDefault(_Image);

	var _Collection = __webpack_require__(10);

	var _Collection2 = _interopRequireDefault(_Collection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Occurrence = _backbone2.default.Model.extend({
	  type: 'occurrence',
	  Image: _Image2.default,

	  constructor: function constructor() {
	    var _this = this;

	    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var that = this;
	    var attrs = attributes;

	    this.id = options.id; // remote ID
	    this.cid = options.cid || _helpers2.default.getNewUUID();
	    this.setParent(options.parent || this.parent);

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
	  save: function save() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    if (!this.parent) return false;
	    return this.parent.save(options);
	  },
	  destroy: function destroy() {
	    var _this2 = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var promise = new Promise(function (fulfill) {
	      // removes from all collections etc
	      _this2.stopListening();
	      _this2.trigger('destroy', _this2, _this2.collection, options);

	      if (_this2.parent && !options.noSave) {
	        // save the changes permanentely
	        _this2.save(options).then(fulfill);
	      } else {
	        fulfill();
	      }
	    });

	    return promise;
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
	   * Adds an image to occurrence and sets the images's parent to this.
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
	      type: this.type,
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
	}); /** *********************************************************************
	     * OCCURRENCE
	     **********************************************************************/


	Occurrence.type = 'occurrence';

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

	var _Error = __webpack_require__(5);

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

	    // initialize db
	    this.db = null;
	    var _dbPromise = new Promise(function (resolve, reject) {
	      // check custom drivers (eg. SQLite)
	      var customDriversPromise = new Promise(function (_resolve) {
	        if (customConfig.driverOrder && _typeof(customConfig.driverOrder[0]) === 'object') {
	          _localforage2.default.defineDriver(customConfig.driverOrder[0]).then(_resolve);
	        } else {
	          _resolve();
	        }
	      });

	      // config
	      customDriversPromise.then(function () {
	        var dbConfig = {
	          name: customConfig.name || 'morel',
	          storeName: customConfig.storeName || 'models'
	        };

	        if (customConfig.version) {
	          dbConfig.version = customConfig.version;
	        }

	        var driverOrder = customConfig.driverOrder || ['indexeddb', 'websql', 'localstorage'];
	        var drivers = Storage._getDriverOrder(driverOrder);
	        var DB = customConfig.LocalForage || _localforage2.default;

	        // init
	        that.db = DB.createInstance(dbConfig);
	        that.db.setDriver(drivers).then(function () {
	          resolve(that.db);
	        }).catch(reject);
	      });
	    });

	    // initialize db cache
	    this._cache = {};
	    _dbPromise.then(function () {
	      // build up samples
	      var samples = [];
	      _this.db.iterate(function (value) {
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
	    key: 'ready',
	    value: function ready() {
	      return this._initialized;
	    }
	  }, {
	    key: 'get',
	    value: function get(model) {
	      var _this2 = this;

	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	      var that = this;

	      var promise = new Promise(function (resolve, reject) {
	        if (!_this2.ready()) {
	          _this2.on('init', function () {
	            _this2.get(model, options).then(resolve, reject);
	          });
	          return;
	        }

	        var key = (typeof model === 'undefined' ? 'undefined' : _typeof(model)) === 'object' ? model.cid : model;

	        // a non cached version straight from storage medium
	        if (options.nonCached) {
	          _this2.db.getItem(key).then(function (data) {
	            var modelOptions = _underscore2.default.extend(data, { manager: that.manager });
	            var sample = new that.Sample(data.attributes, modelOptions);
	            resolve(sample);
	          }).catch(reject);
	          return;
	        }

	        var cachedModel = _this2._cache.get(key);
	        resolve(cachedModel);
	      });

	      return promise;
	    }
	  }, {
	    key: 'getAll',
	    value: function getAll() {
	      var _this3 = this;

	      var promise = new Promise(function (resolve, reject) {
	        if (!_this3.ready()) {
	          _this3.on('init', function () {
	            _this3.getAll().then(resolve, reject);
	          });
	          return;
	        }
	        resolve(_this3._cache);
	      });

	      return promise;
	    }
	  }, {
	    key: 'set',
	    value: function set() {
	      var _this4 = this;

	      var model = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	      var promise = new Promise(function (resolve, reject) {
	        // early return if no id or cid
	        if (!model.cid) {
	          var error = new _Error2.default('Invalid model passed to storage');
	          reject(error);
	          return;
	        }

	        // needs to be on and running
	        if (!_this4.ready()) {
	          _this4.on('init', function () {
	            _this4.set(model).then(resolve, reject);
	          });
	          return;
	        }

	        var that = _this4;
	        var key = model.cid;
	        var dataJSON = typeof model.toJSON === 'function' ? model.toJSON() : model;
	        _this4.db.setItem(key, dataJSON).then(function () {
	          if (model instanceof that.Sample) {
	            that._cache.set(model, { remove: false });
	          } else {
	            var modelOptions = _underscore2.default.extend(model, { manager: that.manager });
	            var sample = new that.Sample(model.attributes, modelOptions);
	            that._cache.set(sample, { remove: false });
	          }
	          resolve(model);
	        }).catch(reject);
	      });

	      return promise;
	    }
	  }, {
	    key: 'remove',
	    value: function remove(model) {
	      var _this5 = this;

	      var promise = new Promise(function (resolve, reject) {
	        if (!_this5.ready()) {
	          _this5.on('init', function () {
	            _this5.remove(model).then(resolve, reject);
	          });
	          return;
	        }
	        var key = (typeof model === 'undefined' ? 'undefined' : _typeof(model)) === 'object' ? model.cid : model;
	        _this5.db.removeItem(key).then(function () {
	          delete model.manager; // delete a reference
	          return model.destroy().then(resolve); // removes from cache
	        }).catch(reject);
	      });

	      return promise;
	    }
	  }, {
	    key: 'has',
	    value: function has(model) {
	      var _this6 = this;

	      var promise = new Promise(function (resolve, reject) {
	        if (!_this6.ready()) {
	          _this6.on('init', function () {
	            _this6.has(model).then(resolve, reject);
	          }, _this6);
	          return;
	        }
	        _this6.get(model).then(function (data) {
	          var found = (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object';
	          resolve(found);
	        });
	      });

	      return promise;
	    }
	  }, {
	    key: 'clear',
	    value: function clear() {
	      var _this7 = this;

	      var promise = new Promise(function (resolve, reject) {
	        if (!_this7.ready()) {
	          _this7.on('init', function () {
	            _this7.clear().then(resolve, reject);
	          });
	          return;
	        }
	        var that = _this7;
	        _this7.db.clear().then(function () {
	          that._cache.reset();
	          resolve();
	        }).catch(reject);
	      });

	      return promise;
	    }
	  }, {
	    key: 'size',
	    value: function size() {
	      var _this8 = this;

	      var promise = new Promise(function (resolve, reject) {
	        _this8.db.length().then(resolve, reject);
	      });

	      return promise;
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
	  }], [{
	    key: '_getDriverOrder',
	    value: function _getDriverOrder(driverOrder) {
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
	            if ((typeof driver === 'undefined' ? 'undefined' : _typeof(driver)) === 'object' && driver._driver) {
	              return driver._driver;
	            }
	            return console.error('No such db driver!');
	        }
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
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ }
/******/ ])
});
;