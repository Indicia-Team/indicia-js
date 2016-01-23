/*!
 * morel 3.0.2
 * Mobile Recording Library for biological data collection. 
 *
 * https://github.com/NERC-CEH/morel
 *
 * Author 2016 Karolis Kazlauskis
 * Released under the GNU GPL v3 license.
 * http://www.gnu.org/licenses/gpl.html
 */
(function (factory) {
    // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
    // We use `self` instead of `window` for `WebWorker` support.
    var root = (typeof self === 'object' && self.self === self && self) ||
        (typeof global === 'object' && global.global === global && global);

    //AMD
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'exports'], function ($, exports) {
            root.morel = factory(root, exports, $);
        });

        //Node.js or CommonJS
    } else if (typeof exports !== 'undefined') {
        try { $ = require('jquery');} catch (e) {}
        factory(root, exports, $);

        //Browser global
    } else {
        root.morel = factory(root, {}, (root.$ || root.jQuery));
    }
}(function (root, m, $) {
    'use strict';

    m.VERSION = '3.0.2'; //library version, generated/replaced by grunt

    //CONSTANTS
    m.SYNCHRONISING = 0;
    m.SYNCED = 1;
    m.LOCAL = 2;
    m.SERVER = 3;
    m.CHANGED_LOCALLY = 4;
    m.CHANGED_SERVER = 5;
    m.CONFLICT = -1;


    /***********************************************************************
     * HELPER FUNCTIONS
     **********************************************************************/

    /**
     * Clones an object.
     *
     * @param obj
     * @returns {*}
     */
    m.cloneDeep = function (obj) {
        if (null === obj || 'object' !== typeof obj) {
            return obj;
        }
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = m.objClone(obj[attr]);
            }
        }
        return copy;
    };


    /**
     * Generate UUID.
     */
    m.getNewUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
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
    m.dataURItoBlob = function (dataURI, fileType) {
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
    m.isDataURL = function (s) {
        if (!s) {
            return false;
        }
        s = s.toString(); //numbers

        var regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
        return !!s.match(regex);
    };

    //From jQuery 1.4.4 .
    m.isPlainObject = function (obj) {
        function type(obj) {
            var class2type = {};
            var types = 'Boolean Number String Function Array Date RegExp Object'.split(' ');
            for (var i = 0; i < types.length; i++) {
                class2type['[object ' + types[i] + ']'] = types[i].toLowerCase();
            }
            return obj == null ?
                String(obj) :
            class2type[toString.call(obj)] || 'object';
        }

        function isWindow(obj) {
            return obj && typeof obj === 'object' && 'setInterval' in obj;
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

        var key;
        for (key in obj) {
        }

        return key === undefined || hasOwn.call(obj, key);
    };

    //checks if the object has any elements.
    m.isEmptyObject = function (obj) {
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
    m.formatDate = function (date) {
        var now = new Date(),
            day = 0, month = 0,
            reg = /\d{2}\/\d{2}\/\d{4}$/,
            regDash = /\d{4}-\d{1,2}-\d{1,2}$/,
            regDashInv = /\d{1,2}-\d{1,2}-\d{4}$/,
            dateArray = [];

        if (typeof date === 'string') {
            dateArray = date.split('-');
            //check if valid
            if (reg.test(date)) {
                return date;
            //dashed
            } else if (regDash.test(date)) {
                date = new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]));
            //inversed dashed
            } else if (regDashInv.test(date)) {
                date = new Date(parseInt(dateArray[2]), parseInt(dateArray[1]) - 1, parseInt(dateArray[0]));
            }
        }

        now = date || now;
        day = ('0' + now.getDate()).slice(-2);
        month = ('0' + (now.getMonth() + 1)).slice(-2);

        return (day) + '/' + (month) + '/' + now.getFullYear();
    };


  /***********************************************************************
   * IMAGE
   **********************************************************************/

  m.Image = (function (){

    var Module = Backbone.Model.extend({
      constructor: function (attributes, options) {

        if (typeof attributes === 'string') {
          var data = attributes;
          attributes = {data: data};
          return;
        }
        var attrs = attributes || {};

        options || (options = {});
        this.cid = options.cid || m.getNewUUID();
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};


        this.initialize.apply(this, arguments);
      },

      /**
       * Resizes itself.
       */
      resize: function (MAX_WIDTH, MAX_HEIGHT, callback) {
        var that = this;
        Module.resize(this.attributes.data, this.attributes.type, MAX_WIDTH, MAX_HEIGHT,
          function (err, image, data) {
            if (err) {
              callback && callback(err);
              return;
            }
            that.attributes.data = data;
            callback && callback(null, image, data);
          });
      },

      toJSON: function () {
        var data = {
          id: this.id,
          url: this.attributes.url,
          type: this.attributes.type,
          data: this.attributes.data
        };
        return data;
      }
    });

    _.extend(Module, {
      /**
       * Transforms and resizes an image file into a string.
       *
       * @param onError
       * @param file
       * @param onSaveSuccess
       * @returns {number}
       */
      toString: function (file, callback) {
        if (!window.FileReader) {
          var message = 'No File Reader',
            error = new m.Error(message);
          console.error(message);

          return callback(error);
        }

        var reader = new FileReader();
        reader.onload = function (event) {
          callback(null, event.target.result, file.type);
        };
        reader.readAsDataURL(file);
      },

      /**
       * http://stackoverflow.com/questions/2516117/how-to-scale-an-image-in-data-uri-format-in-javascript-real-scaling-not-usin
       * @param data
       * @param width
       * @param height
       * @param callback
       */
      resize: function(data, fileType, MAX_WIDTH, MAX_HEIGHT, callback) {
        var image = new Image();

        image.onload = function() {
          var width = image.width,
            height = image.height,
            canvas = null,
            res = null;

          //resizing
          if (width > height) {
            res = width / MAX_WIDTH;
          } else {
            res = height / MAX_HEIGHT;
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

    return Module;
  }());


  /***********************************************************************
   * COLLECTION MODULE
   **********************************************************************/

  m.Collection = (function () {

    var Module = Backbone.Collection.extend({
      flatten: function (flattener) {
        var flattened = {};

        for (var i = 0; i < this.length; i++) {
          _.extend(flattened, this.models[i].flatten(flattener, i))
        }
        return flattened;
      }
    })


    return Module;
  }());
  /***********************************************************************
   * OCCURRENCE
   **********************************************************************/

  m.Occurrence = (function () {
    var Module = Backbone.Model.extend({
      constructor: function (attributes, options){
        var attrs = attributes || {};

        options || (options = {});
        this.cid = options.cid || m.getNewUUID();
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};


        if (options.images) {
          this.images = new m.Collection(options.images, {
            model: m.Image
          });
        } else {
          this.images = new m.Collection([], {
            model: m.Image
          });
        }

        this.initialize.apply(this, arguments);
      },

      toJSON: function () {
        var data = {
          id: this.id,
          cid: this.cid,
          attributes: this.attributes,
          images: this.images.toJSON()
        };
        //add occurrences
        return data;
      },

      /**
       * Returns an object with attributes and their values flattened and
       * mapped for warehouse submission.
       *
       * @param flattener
       * @returns {*}
       */
      flatten: function (flattener, count) {
        //images flattened separately
        return flattener.apply(this, [Module.keys, this.attributes, count]);;
      }
    });


    /**
     * Warehouse attributes and their values.
     */
    Module.keys = {
      taxon: {
        id: ''
      },
      comment: {
        id: 'comment'
      }
    };

    return Module;
  }());
  /***********************************************************************
   * SAMPLE
   *
   * Refers to the event in which the sightings were observed, in other
   * words it describes the place, date, people, environmental conditions etc.
   * Within a sample, you can have zero or more occurrences which refer to each
   * species sighted as part of the sample.
   **********************************************************************/

  m.Sample = (function () {

    var Module = Backbone.Model.extend({
      Occurrence: m.Occurrence,

      constructor: function (attributes, options){
        var attrs = attributes || {};

        var that = this;

        if (!attributes) {
          attrs = {
            date: new Date(),
            location_type: 'latlon'
          };
        }

        options || (options = {});
        this.cid = options.cid || m.getNewUUID();
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
            created_on: new Date(),
            updated_on: new Date(),

            warehouse_id: null,

            synced_on: null, //set when fully initialized only
            server_on: null //updated on server
          };
        }

        if (options.occurrences) {
          var occurrences = [];
          _.each(options.occurrences, function (occ) {
            if (occ instanceof that.Occurrence) {
              occurrences.push(occ);
            } else {
              occurrences.push(new that.Occurrence(occ.attributes, occ));
            }
          });
          this.occurrences = new m.Collection(occurrences, {
            model: this.Occurrence
          });
        } else {
          this.occurrences = new m.Collection([], {
            model: this.Occurrence
          });
        }

        this.initialize.apply(this, arguments);
      },

      /**
       * Returns an object with attributes and their values flattened and
       * mapped for warehouse submission.
       *
       * @param flattener
       * @returns {*}
       */
      flatten: function (flattener) {
        var flattened = flattener.apply(this, [Module.keys, this.attributes]);

        //occurrences
        _.extend(flattened, this.occurrences.flatten(flattener));
        return flattened;
      },

      toJSON: function () {
        var data = {
          id: this.id,
          cid: this.cid,
          metadata: this.metadata,
          attributes: this.attributes,
          occurrences: this.occurrences.toJSON()
        };

        return data;
      },

      /**
       * Sync statuses:
       * synchronising, synced, local, server, changed_locally, changed_server, conflict
       */
      getSyncStatus: function () {
        var meta = this.metadata;
        //on server
        if (meta.synchronising) {
          return m.SYNCHRONISING;
        }

        if (meta.warehouse_id) {
          //fully initialized
          if (meta.synced_on) {
            //changed_locally
            if (meta.synced_on < meta.updated_on) {
              //changed_server - conflict!
              if (meta.synced_on < meta.server_on) {
                return m.CONFLICT;
              }
              return m.CHANGED_LOCALLY;
              //changed_server
            } else if (meta.synced_on < meta.server_on) {
              return m.CHANGED_SERVER;
            } else {
              return m.SYNCED;
            }
            //partially initialized - we know the record exists on
            //server but has not yet been downloaded
          } else {
            return m.SERVER;
          }
          //local only
        } else {
          return m.LOCAL;
        }
      },

      /**
       * Detach all the listeners.
       */
      offAll: function () {
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
    Module.keys =  {
      id: { id: 'id' },
      survey: { id: 'survey_id' },
      date: { id: 'date' },
      comment: { id: 'comment' },
      image: { id: 'image' },
      location: { id: 'entered_sref' },
      location_type: {
        id: 'entered_sref_system',
        values: {
          british: 'OSGB', //for British National Grid
          irish: 'OSIE', //for Irish Grid
          latlon: 4326 //for Latitude and Longitude in decimal form (WGS84 datum)
        }
      },
      location_name: { id: 'location_name' },
      deleted: { id: 'deleted' }
    };

    return Module;
  }());
    /***********************************************************************
     * PLAIN STORAGE
     **********************************************************************/

    m.PlainStorage = (function () {

        var Module = function () {
            this.storage = {};
        };

        _.extend(Module.prototype, {
            NAME: 'PlainStorage',

            /**
             * Gets an item from the storage.
             *
             * @param key
             */
            get: function (key, callback) {
                var data = this.storage[key];
                callback(null, data);
            },

            /**
             * Returns all items from the storage;
             *
             * @returns {{}|*|m.Storage.storage}
             */
            getAll: function (callback) {
                var data = this.storage;
                callback(null, data);
            },

            /**
             * Sets an item in the storage.
             * Note: it overrides any existing key with the same name.
             *
             * @param key
             * @param data
             * @param callback
             */
            set: function (key, data, callback) {
                this.storage[key] = data;
                callback && callback(null, data);
            },

            /**
             * Removes an item from the storage.
             *
             * @param key
             */
            remove: function (key, callback) {
                delete this.storage[key];
                callback && callback();
            },

            /**
             * Checks if a key exists.
             *
             * @param key Input name
             * @returns {boolean}
             */
            has: function (key, callback) {
                var data = this.get(key, function (err, data) {
                    callback(null, data !== undefined && data !== null);
                });
            },

            /**
             * Clears the storage.
             */
            clear: function (callback) {
                this.storage = {};
                callback && callback(null, this.storage);
            },

            /**
             * Calculates current occupied the size of the storage.
             * @param callback
             */
            size: function (callback) {
                var data = Object.keys(this.storage).length;
                callback(null, data);
            }
        });

        return Module;
    })();


    /***********************************************************************
     * LOCAL STORAGE
     **********************************************************************/

    m.LocalStorage = (function () {
        /**
         * options:
         *  @appname String subdomain name to use for storage
         */
        var Module = function (options) {
            options || (options = {});

            this.storage = window.localStorage;

            this.NAME = options.appname ? this.NAME + '-' + options.appname : this.NAME;
        };

        _.extend(Module.prototype, {
            TYPE: 'LocalStorage',
            NAME: 'morel',

            /**
             * Gets an item from the storage.
             *
             * @param key
             */
            get: function (key, callback) {
                var data = this.storage.getItem(this._getKey(key));
                data = JSON.parse(data);

                callback(null, data);
            },

            /**
             * Returns all items from the storage;
             *
             * @returns {{}|*|m.Storage.storage}
             */
            getAll: function (callback) {
                var data = {};
                var key = '';
                for (var i = 0, len = this.storage.length; i < len; ++i ) {
                    key = this.storage.key(i);
                    //check if the key belongs to this storage
                    if (key.indexOf(this._getPrefix()) !== -1) {
                        var parsed = JSON.parse(this.storage.getItem(key));
                        data[key] = parsed;
                    }
                }
                callback(null, data);
            },

            /**
             * Sets an item in the storage.
             * Note: it overrides any existing key with the same name.
             *
             * @param key
             * @param data JSON object
             */
            set: function (key, data, callback) {
                data = JSON.stringify(data);
                try {
                    this.storage.setItem(this._getKey(key), data);
                    callback && callback(null, data);
                } catch (err) {
                    var exceeded = this._isQuotaExceeded(err),
                        message = exceeded ? 'Storage exceed.' : err.message;

                    callback && callback(new m.Error(message), data);
                }
            },

            /**
             * Removes an item from the storage.
             *
             * @param key
             */
            remove: function (key, callback) {
                this.storage.removeItem(this._getKey(key));
                callback && callback();
            },


            /**
             * Checks if a key exists.
             *
             * @param key Input name
             * @returns {boolean}
             */
            has: function (key, callback) {
                var data = null;
                this.get(key, function (err, data) {
                    callback(null, data !== undefined && data !== null);
                });
            },


            /**
             * Clears the storage.
             */
            clear: function (callback) {
                this.storage.clear();
                callback && callback();
            },

            /**
             * Calculates current occupied the size of the storage.
             *
             * @param callback
             */
            size: function (callback) {
                callback(null, this.storage.length);
            },

            /**
             * Checks if there is enough space in the storage.
             *
             * @param size
             * @returns {*}
             */
            hasSpace: function (size, callback) {
                var taken = JSON.stringify(this.storage).length;
                var left = 1024 * 1024 * 5 - taken;
                if ((left - size) > 0) {
                    callback(null, 1);
                } else {
                    callback(null, 0);
                }
            },

            _getKey: function (key) {
                return this._getPrefix() + key;
            },

            _getPrefix: function () {
                return this.NAME + '-';
            },

            /**
             * http://crocodillon.com/blog/always-catch-localstorage-security-and-quota-exceeded-errors
             * @param e
             * @returns {boolean}
             * @private
             */
            _isQuotaExceeded: function(e) {
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
                        }
                    } else if (e.number === -2147024882) {
                        // Internet Explorer 8
                        quotaExceeded = true;
                    }
                }
                return quotaExceeded;
            }

    });

        return Module;
    })();


    /***********************************************************************
     * ERROR
     **********************************************************************/

    m.Error = (function () {
        var Module = function (options) {
            if (typeof options === 'string') {
                this.number = -1;
                this.message = options;
                return;
            }

            this.number = options.number || -1;
            this.message = options.message || '';
        };

        return Module;
    }());

    /***********************************************************************
     * DATABASE STORAGE
     **********************************************************************/

    m.DatabaseStorage = (function () {
        /**
         * options:
         *  @appname String subdomain name to use for storage
         */
        var Module = function (options) {
            options || (options = {});
            this.NAME = options.appname ? this.NAME + '-' + options.appname : this.NAME;
        };

        _.extend(Module.prototype, {
            //because of iOS8 bug on home screen: null & readonly window.indexedDB
            indexedDB: window._indexedDB || window.indexedDB,
            IDBKeyRange: window._IDBKeyRange || window.IDBKeyRange,

            VERSION: 1,
            TYPE: 'DatabaseStorage',
            NAME: 'morel',
            STORE_NAME: 'samples',

            /**
             * Adds an item under a specified key to the database.
             * Note: might be a good idea to move the key assignment away from
             * the function parameters and rather auto assign one and return on callback.
             *
             * @param key
             * @param data JSON or object having toJSON function
             * @param callback
             */
            set: function (key, data, callback) {
                try {
                    this.open(function (err, store) {
                        if (err) {
                            callback && callback(err);
                            return;
                        }

                        data = (typeof data.toJSON === 'function') ? data.toJSON() : data;

                        var req = store.put(data, key);

                        req.onsuccess = function () {
                            callback && callback(null, data);
                        };

                        req.onerror = function (e) {
                            var message = 'Database Problem: ' + e.target.error.message,
                                error = new m.Error(message);
                            console.error(message);
                            callback && callback(error);
                        };
                    });
                } catch (err) {
                    callback && callback(err);
                }
            },

            /**
             * Gets a specific saved data from the database.
             * @param key The stored data Id.
             * @param callback
             * @aram onError
             * @returns {*}
             */
            get: function (key, callback) {
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
                            var message = 'Database Problem: ' + e.target.error.message,
                                error = new m.Error(message);
                            console.error(message);
                            callback(error);
                        };
                    });
                } catch (err) {
                    callback(err);
                }
            },

            /**
             * Removes a saved data from the database.
             *
             * @param key
             * @param callback
             * @param onError
             */
            remove: function (key, callback) {
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
                            var message = 'Database Problem: ' + e.target.error.message,
                                error = new m.Error(message);
                            console.error(message);
                            callback && callback(error);
                        };
                    });
                } catch (err) {
                    callback && callback(err);
                }
            },

            /**
             * Brings back all saved data from the database.
             */
            getAll: function (callback) {
                var that = this;

                try {
                    this.open(function (err, store) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        // Get everything in the store
                        var keyRange = that.IDBKeyRange.lowerBound(0),
                            req = store.openCursor(keyRange),
                            data = {};

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
                            var message = 'Database Problem: ' + e.target.error.message,
                                error = new m.Error(message);
                            console.error(message);
                            callback(error);
                        };
                    });
                } catch (err) {
                    callback(err);
                }
            },

            /**
             * Checks whether the data under a provided key exists in the database.
             *
             * @param key
             * @param callback
             * @param onError
             */
            has: function (key, callback) {
                this.get(key, function (err, data) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, data !== undefined && data !== null);
                });
            },

            /**
             * Clears all the saved data.
             */
            clear: function (callback) {
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
                            var message = 'Database Problem: ' + e.target.error.message,
                                error = new m.Error(message);
                            console.error(message);

                            callback && callback(error);
                        };
                    });
                } catch (err) {
                    callback && callback(err);
                }
            },

            size: function (callback) {
               this.getAll(function(err, data) {
                   if (err) {
                       callback(err);
                       return;
                   }
                   var size = JSON.stringify(data).length;
                   callback(null, size);
               });
            },

            /**
             * Opens a database connection and returns a store.
             *
             * @param onError
             * @param callback
             */
            open: function (callback) {
                var that = this,
                    req = null;

                try {
                    req = this.indexedDB.open(this.NAME, this.VERSION);

                    /**
                     * On Database opening success, returns the Records object store.
                     *
                     * @param e
                     */
                    req.onsuccess = function (e) {
                        var db = e.target.result,
                            transaction = db.transaction([that.STORE_NAME], 'readwrite'),
                            store = null,
                            err = null;
                        if (transaction) {
                            store = transaction.objectStore(that.STORE_NAME);
                            if (store) {
                                callback(null, store);
                            } else {
                                err = new m.Error('Database Problem: no such store');
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
                        var message = 'Database Problem: ' + e.target.error.message,
                            error = new m.Error(message);
                        console.error(message);
                        callback(error);
                    };

                    /**
                     * Error on database being blocked.
                     *
                     * @param e
                     */
                    req.onblocked = function (e) {
                        var message = 'Database Problem: ' + e.target.error.message,
                            error = new m.Error(message);
                        console.error(message);
                        callback(error);
                    };
                } catch (err) {
                    callback(err);
                }
            }
        });

        return Module;
    }());


  /***********************************************************************
   * STORAGE
   **********************************************************************/

  m.Storage = (function () {
    var Module = function (options) {
      options || (options = {});

      var that = this;

      this.Sample = options.Sample || m.Sample;

      //internal storage
      this.Storage = options.Storage || m.LocalStorage;
      this.storage = new this.Storage({
        appname: options.appname
      });

      //initialize the cache
      this.cache = {};
      this.initialized = false;
      this.storage.getAll(function (err, data) {
        data || (data = {});

        var samples = [],
          sample = null,
          keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
          var current = data[keys[i]];
          sample = new that.Sample(current.attributes, current);
          sample.cid = current.cid;
          samples.push(sample);
        }
        that.cache =  new m.Collection(samples, {
          model: that.Sample
        });
        that._attachListeners();

        that.initialized = true;
        that.trigger('init');
      });
    };

    _.extend(Module.prototype, {
      get: function (model, callback) {
        if (!this.initialized) {
          this.on('init', function () {
            this.get(model, callback);
          });
          return;
        }

        var key = typeof model === 'object' ? model.id || model.cid : model;
        callback(null, this.cache.get(key));
      },

      getAll: function (callback) {
        if (!this.initialized) {
          this.on('init', function () {
            this.getAll(callback);
          });
          return;
        }
        callback(null, this.cache);
      },

      set: function (model, callback) {
        if (!this.initialized) {
          this.on('init', function () {
            this.set(model, callback);
          });
          return;
        }
        var that = this,
          key = model.id || model.cid;
        this.storage.set(key, model, function (err) {
          if (err) {
            callback(err);
            return;
          }
          that.cache.set(model, {remove: false});
          callback && callback(null, model);
        });
      },

      remove: function (model, callback) {
        if (!this.initialized) {
          this.on('init', function () {
            this.remove(model, callback);
          });
          return;
        }
        var that = this,
          key = typeof model === 'object' ? model.id || model.cid : model;
        this.storage.remove(key, function (err) {
          if (err) {
            callback(err);
            return;
          }
          that.cache.remove(model);
          callback && callback();
        });
      },

      has: function (model, callback) {
        if (!this.initialized) {
          this.on('init', function () {
            this.has(model, callback);
          }, this);
          return;
        }
        var key = typeof model === 'object' ? model.id || model.cid : model;
        this.cache.has(key, callback);
      },

      clear: function (callback) {
        if (!this.initialized) {
          this.on('init', function () {
            this.clear(callback);
          });
          return;
        }
        var that = this;
        this.storage.clear(function (err) {
          if (err) {
            callback(err);
            return;
          }
          that.cache.clear();
          callback && callback();
        });
      },

      size: function (callback) {
        this.storage.size(callback);
      },

      _attachListeners: function () {
        var that = this;
        //listen on cache because it is last updated
        this.cache.on('update', function () {
          that.trigger('update');
        });
      }
    });

    //add events
    _.extend(Module.prototype, Backbone.Events);

    return Module;
  }());

  /***********************************************************************
   * MANAGER
   **********************************************************************/

  m.Manager = (function () {
    var Module = function (options) {
      this.options = options || (options = {});

      this.storage = new m.Storage({
        appname: options.appname,
        Sample: options.Sample,
        Storage: options.Storage
      });
      this._attachListeners();
      this.synchronising = false;
    };

    _.extend(Module.prototype, {
      //storage functions
      get: function (model, callback) {
        this.storage.get(model, callback);
      },
      getAll: function (callback) {
        this.storage.getAll(callback);
      },
      set: function (model, callback) {
        this.storage.set(model, callback);
      },
      remove: function (model, callback) {
        this.storage.remove(model, callback);
      },
      has: function (model, callback) {
        this.storage.has(model, callback);
      },
      clear: function (callback) {
        this.storage.clear(callback);
      },

      sync: function (model, callback) {
        var that = this;

        if (model instanceof m.Sample) {

          if (!model.metadata.synchronising) {
            model.metadata.synchronising = true;
            that.sendStored(model, function (err) {
              model.metadata.synchronising = false;
              callback && callback(err);
            });
          }
          return;
        }

        this.get(model, function (err, sample) {
          if (err) {
            callback && callback(err);
            return;
          }

          if (!sample.metadata.synchronising) {
            sample.metadata.synchronising = true;
            that.sendStored(sample, function (err) {
              sample.metadata.synchronising = false;
              callback && callback(err);
            });
          }
        });
      },

      syncAll: function (onSample, callback) {
        var that = this;
        if (!this.synchronising) {
          this.synchronising = true;
          this.sendAllStored(onSample, function (err) {
            that.synchronising = false;

            callback && callback(err);
          });
        } else {
          that.trigger('sync:done');
          callback && callback();
        }
      },


      /**
       * Sending all saved records.
       *
       * @returns {undefined}
       */
      sendAllStored: function (onSend, callback) {
        var that = this;
        this.getAll(function (err, samples) {
          if (err) {
            that.trigger('sync:error');
            callback(err);
            return;
          }

          that.trigger('sync:request');

          //shallow copy
          var remainingSamples = _.extend([], samples.models);

          //recursively loop through samples
          for (var i = 0; i < remainingSamples.length; i++) {
            var sample = remainingSamples[i];
            if (sample.validate() || sample.getSyncStatus() === m.SYNCED) {
              remainingSamples.splice(i, 1);
              i--; //return the cursor
              continue;
            }

            //call user defined onSend function
            onSend && onSend(sample);

            that.sendStored(sample, function (err, sample) {
              if (err) {
                that.trigger('sync:error');
                callback(err);
                return;
              }

              for (var k = 0; k < remainingSamples.length; k++) {
                if (remainingSamples[k].id === sample.id ||
                  remainingSamples[k].cid === sample.cid) {
                  remainingSamples.splice(k, 1);
                  break;
                }
              }

              if (remainingSamples.length === 0) {
                //finished
                that.trigger('sync:done');
                callback();
              }
            });
          }

          if (!remainingSamples.length) {
            that.trigger('sync:done');
            callback();
          }
        })
      },

      sendStored: function (sample, callback) {
        var that = this;

        //don't resend
        if (sample.getSyncStatus() === m.SYNCED) {
          sample.trigger('sync:done');
          callback && callback(null, sample);
          return;
        }

        sample.metadata.synchronising = true;
        sample.trigger('sync:request');

        this.send(sample, function (err, sample) {
          sample.metadata.synchronising = false;
          if (err) {
            sample.trigger('sync:error');
            callback && callback(err);
            return;
          }

          //update sample
          sample.metadata.warehouse_id = 1;
          sample.metadata.server_on = new Date();
          sample.metadata.synced_on = new Date();

          //resize images to snapshots
          that._resizeImages(sample, function () {
            //save sample
            that.set(sample, function (err, sample) {
              sample.trigger('sync:done');
              callback && callback(null, sample);
            });
          });
        });
      },

      /**
       * Sends the saved record
       *
       * @param recordKey
       * @param callback
       * @param onError
       * @param onSend
       */
      send: function (sample, callback) {
        var flattened = sample.flatten(this._flattener),
          formData = new FormData();


        //append images
        var occCount = 0;
        sample.occurrences.each(function (occurrence) {
          var imgCount = 0;
          occurrence.images.each(function (image) {
            var name = 'sc:' + occCount + '::photo' + imgCount;
            var blob = m.dataURItoBlob(image.data, image.type);
            var extension = image.type.split('/')[1];
            formData.append(name, blob, 'pic.' + extension);
          });
          occCount++;
        });

        //append attributes
        var keys = Object.keys(flattened);
        for (var i= 0; i < keys.length; i++) {
          formData.append(keys[i], flattened[keys[i]]);
        }

        //Add authentication
        formData = this.appendAuth(formData);

        this._post(formData, function (err) {
          callback (err, sample);
        });
      },

      /**
       * Submits the record.
       */
      _post: function (formData, callback) {
        var ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
          var error = null;
          if (ajax.readyState === XMLHttpRequest.DONE) {
            switch (ajax.status) {
              case 200:
                callback && callback();
                break;
              case 400:
                error = new m.Error(ajax.response);
                callback && callback(error);
                break;
              default:
                error = new m.Error({
                  message: 'Unknown problem while sending request.',
                  number: ajax.status
                });
                callback && callback(error);
            }
          }
        };

        ajax.open('POST', this.options.url);
        ajax.send(formData);
      },

      _attachListeners: function () {
        var that = this;
        this.storage.on('update', function () {
          that.trigger('update');
        });
      },

      _flattener: function (keys, attributes, count) {
        var flattened = {},
          attr = null,
          name = null,
          value = null,
          prefix = '',
          native = 'sample:',
          custom = 'smpAttr:';

        if (this instanceof m.Occurrence) {
          prefix = 'sc:';
          native = '::occurrence:';
          custom = '::occAttr:';
        }

        for (attr in attributes) {
          if (!keys[attr]) {
            console.warn('morel.Manager: no such key: ' + attr);
            flattened[attr] = attributes;
            continue;
          }

          name = keys[attr].id;

          if (!name) {
            name = prefix + count + '::present'
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

          value = attributes[attr];

          if (keys[attr].values) {
            if (typeof keys[attr].values === 'function') {
              value = keys[attr].values(value);
            } else {
              value = keys[attr].values[value];
            }
          }

          flattened[name] = value;
        }

        return flattened;
      },

      _resizeImages: function (sample, callback) {
        var images_count = 0;
        //get number of images to resize - synchronous
        sample.occurrences.each(function (occurrence) {
          occurrence.images.each(function (image) {
            images_count++;
          });
        });

        if (!images_count) {
          callback();
          return;
        }

        //resize
        //each occurrence
        sample.occurrences.each(function (occurrence) {
          //each image
          occurrence.images.each(function (image) {
            image.resize(75, 75, function () {
              images_count--;
              if (images_count === 0) {
                callback();
              }
            });

          }, occurrence);
        });
      },

      /**
       * Appends user and app authentication to the passed data object.
       * Note: object has to implement 'append' method.
       *
       * @param data An object to modify
       * @returns {*} A data object
       */
      appendAuth: function (data) {
        //app logins
        this._appendAppAuth(data);
        //warehouse data
        this._appendWarehouseAuth(data);

        return data;
      },

      /**
       * Appends app authentication - Appname and Appsecret to
       * the passed object.
       * Note: object has to implement 'append' method.
       *
       * @param data An object to modify
       * @returns {*} A data object
       */
      _appendAppAuth: function (data) {
        data.append('appname', this.options.appname);
        data.append('appsecret', this.options.appsecret);

        return data;
      },

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
      _appendWarehouseAuth: function (data) {
        data.append('website_id', this.options.website_id);
        data.append('survey_id', this.options.survey_id);

        return data;
      }
    });

    _.extend(Module.prototype, Backbone.Events);

    return Module;
  }());


    return m;
}));