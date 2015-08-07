/*!
 * morel 3.0.0-alpha
 * Mobile Recording Library for biological data collection. 
 *
 * https://github.com/NERC-CEH/morel
 *
 * Author 2015 Karolis Kazlauskis
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
    "use strict";

    m.VERSION = '3.0.0-alpha'; //library version, generated/replaced by grunt

    //library wide configuration
    m.CONF = {};

    //CONSTANTS:
    m.TRUE = 1;
    m.FALSE = 0;
    m.ERROR = -1;


    /***********************************************************************
     * HELPER FUNCTIONS
     **********************************************************************/

    /**
     * Clones an object.
     *
     * @param obj
     * @returns {*}
     */
    m.objClone = function (obj) {
        if (null === obj || "object" !== typeof obj) {
            return obj;
        }
        var copy = obj.constructor();
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
    // The "data" URL scheme: http://tools.ietf.org/html/rfc2397
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
            var types = "Boolean Number String Function Array Date RegExp Object".split(" ");
            for (var i = 0; i < types.length; i++) {
                class2type["[object " + types[i] + "]"] = types[i].toLowerCase();
            }
            return obj == null ?
                String(obj) :
            class2type[toString.call(obj)] || "object";
        }

        function isWindow(obj) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        }

        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
            return false;
        }

        // Not own constructor property must be Object
        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
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
     * Extends an object with the properties of another object or return of a function.
     * @param a Object or String. If String, then extends this libraries global
     * @param b Function or Object
     * @returns {*}
     */
    m.extend = function (a, b) {
        if (typeof b === 'function') {
            b = b();
        }

        //extend the library itself
        if (typeof a === 'string') {
            m[a] || (m[a] = {});
            return ext(m[a], b);

            //normal object extend
        } else {
            return ext(a, b);
        }

        function ext(a, b) {
            for (var key in b) {
                if (b.hasOwnProperty(key)) {
                    a[key] = b[key];
                }
            }
            return a;
        }
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
        day = ("0" + now.getDate()).slice(-2);
        month = ("0" + (now.getMonth() + 1)).slice(-2);

        return (day) + "/" + (month) + "/" + now.getFullYear();
    };


    /***********************************************************************
     * EVENTS MODULE
     **********************************************************************/

    m.Image = (function (){

        var Module = function (options) {
            options || (options = {});

            this.id = options.id || m.getNewUUID();

            if (typeof options === 'string') {
                this.data = options;
                return;
            }

            this.url = options.url || '';
            this.data = options.data || '';
        };


        m.extend(Module, {
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
                    canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    // Scale and draw the source image to the canvas
                    canvas.getContext("2d").drawImage(image, 0, 0, width, height);

                    // Convert the canvas to a data URL in PNG format
                    callback(null, image, canvas.toDataURL(fileType));
                };

                image.src = data;
            }
        });

        m.extend(Module.prototype, {
            toJSON: function () {
                var data = {
                    id: this.id,
                    url: this.url,
                    data: this.data
                };
                return data;
            }
        });

        return Module;
    }());


    /***********************************************************************
     * EVENTS MODULE
     **********************************************************************/

    m.Events = (function (){

        var Module = {
            on: function (name, callback, context) {
                var callbacks = this._callbacks(name);
                callbacks.push({callback: callback, context: context});
            },

            trigger: function (name) {
                var callbacks = this._callbacks(name, true);

                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].callback.call(callbacks[i].context || this);
                }
            },

            _callbacks: function (name, trigger) {
                name = name.toLowerCase();
                var namespace = name.split(':'),
                    events = [];

                this._events = this._events || {};
                if (!this._events[namespace[0]]) {
                    this._events[namespace[0]] = {
                        all: []
                    }
                }

                if (namespace.length === 1) {
                    return this._events[namespace[0]].all;
                } else {
                    if (!this._events[namespace[0]][namespace[1]]) {
                        this._events[namespace[0]][namespace[1]] = [];
                    }

                    events = this._events[namespace[0]][namespace[1]];
                    if (trigger) {
                        events = events.concat(this._events[namespace[0]].all);
                    }

                    return events;
                }

            }
        };

        return Module;
    }());


//{
//  id: 'yyyyy-yyyyyy-yyyyyyy-yyyyy',
//    warehouseID: -1, //occurrence_id
//  status: 'local', //sent
//  attr: {
//  'occurrence:comment': 'value',
//    'occAttr:12': 'value'
//},
//  images: [
//    {
//      status: 'local', //sent
//      url: 'http://..', // points to the image on server
//      data: 'data64:...'
//    }
//  ]
//};

    /***********************************************************************
     * COLLECTION MODULE
     **********************************************************************/

    /*
     no option is provided for transformed keys without creating
     an Model object. Eg. this is not possible:
     new Collection([
         {
             id: 'xxxx'
             attributes: {
                taxon: 'xxxx'
             }
         }
     ])

     must be:

     new Collection([
         {
             id: 'xxxx'
             attributes: {
                Model:taxon_taxon_list_id: 'xxxx'
             }
         }
     ])

     or:

     new Collection([
         new Model({
             id: 'xxxx'
             attributes: {
                taxon: 'xxxx'
             }
         })
     ])
     */

    m.Collection = (function () {

        var Module = function (options) {
            var model = null;
            this.Model = options.model;

            this.data = [];
            this.length = 0;

            if (options.data instanceof Array) {
                for (var i = 0; i < options.data.length; i++) {
                    model = options.data[i];
                    if (model instanceof this.Model) {
                        this.data.push(model);
                    } else {
                        m.extend(model, {
                            plainAttributes: true
                        });
                        model = new this.Model(model);
                        this.data.push(model);
                    }
                    this.length++;
                }
            }

            this.initialize();
        };

        m.extend(Module.prototype, {
            initialize: function () {},

            add: function (items) {
                return this.set(items);
            },

            set: function (items) {
                var modified = [],
                    existing = null;
                //make an array if single object
                items = !(items instanceof Array) ? [items] : items;
                for (var i = 0; i < items.length; i++) {
                    //update existing ones
                    if (existing = this.get(items[i])) {
                        existing.attributes = items[i].attributes;
                        //add new
                    } else {
                        if (typeof items[i].on === 'function') {
                            items[i].on('change', this._modelEvent, this);
                        }

                        this.data.push(items[i]);
                        this.length++;
                    }
                    modified.push(items[i]);
                }

                this.trigger('update');
                return modified;
            },

            /**
             *
             * @param model model or its ID
             * @returns {*}
             */
            get: function (item) {
                var id = item.id || item;
                for (var i = 0; i < this.data.length; i++) {
                    if (this.data[i].id == id) {
                        return this.data[i];
                    }
                }
                return null;
            },

            getFirst: function () {
                return this.data[0];
            },

            create: function () {
                var model = new this.Model();
                this.add(model);
                return model;
            },

            remove: function (items) {
                var items = !(items instanceof Array) ? [items] : items,
                    removed = [];
                for (var i = 0; i < items.length; i++) {
                    //check if exists
                    var current = this.get(items[i]);
                    if (!current) continue;

                    //get index
                    var index = -1;
                    for (var j = 0; index < this.data.length; j++) {
                        if (this.data[j].id === current.id) {
                            index = j;
                            break;
                        }
                    }
                    if (j > -1) {
                        this.data.splice(index, 1);
                        this.length--;
                        removed.push(current);
                    }
                }
                this.trigger('update');
                return removed;
            },

            has: function (item) {
                var data = this.get(item);
                return data !== undefined && data !== null;
            },

            size: function () {
                return this.data.length;
            },

            toJSON: function () {
                var json = [];
                for (var i = 0; i < this.data.length; i++) {
                    json.push(this.data[i].toJSON());
                }

                return json;
            },

            _modelEvent: function () {
                this.trigger('change');
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());
//{
//  id: 'yyyyy-yyyyyy-yyyyyyy-yyyyy',
//    warehouseID: -1, //occurrence_id
//  status: 'local', //sent
//  attr: {
//  'occurrence:comment': 'value',
//    'occAttr:12': 'value'
//},
//  images: [
//    {
//      status: 'local', //sent
//      url: 'http://..', // points to the image on server
//      data: 'data64:...'
//    }
//  ]
//};

    /***********************************************************************
     * OCCURRENCE MODULE
     **********************************************************************/

    m.Occurrence = (function () {

        var Module = function (options) {
            var name = null,
                value = null,
                key = null;

            options || (options = {});
            this.id = options.id || m.getNewUUID();
            this.attributes = {};

            if (options.attributes) {
                if (options.plainAttributes) {
                    this.attributes = options.attributes;

                //transform keys
                } else {
                    for (name in options.attributes) {
                        key = this.key(name);
                        value = this.value(name, options.attributes[name]);
                        this.attributes[key] = value;
                    }
                }
            }

            if (options.images) {
                this.images = new m.Collection({
                    model: m.Image,
                    data: options.images
                });
            } else {
                this.images = new m.Collection({
                    model: m.Image
                });
            }
        };

        Module.KEYS = {
                TAXON: {
                    id: 'taxa_taxon_list_id'
                },
                COMMENT: {
                    id: 'comment'
                }
        };

        m.extend(Module.prototype, {
            set: function (name, data) {
                var key = this.key(name),
                    value = this.value(name, data),
                    changed = false;

                if (this.attributes[key] !== value) {
                    changed = true;
                }

                this.attributes[key] = value;

                if (changed) {
                    this.trigger('change:' + name);
                }
            },

            get: function (name) {
                var key = this.key(name);
                return this.attributes[key];
            },

            remove: function (name) {
                var key = this.key(name);
                delete this.attributes[key];

                this.trigger('change:' + name);
            },

            clear: function () {
                this.attributes = {};

                this.trigger('change');
            },

            has: function(name) {
                var data = this.get(name);
                return data !== undefined && data !== null;
            },

            setImage: function (data, index) {
                index = index || this.images.length;
                this.images[index] = new m.Image ({data: data});
                this.trigger('change:image');
            },

            removeImage: function (index) {
                this.images = this.images.splice(index, 1);
                this.trigger('change:image');
            },

            removeAllImages: function () {
                this.images = [];
                this.trigger('change:image');
            },

            key: function (name) {
                name = name.toUpperCase();
                var key = Module.KEYS[name];
                if (!key || !key.id) {
                    console.warn('morel.Occurrence: no such key: ' + name);
                    return name;
                }
                return key.id;
            },

            value: function (name, data) {
                var value = null;
                name = name.toUpperCase();
                if (typeof data !== 'object' ||
                    !Module.KEYS[name] ||
                    !Module.KEYS[name].values) {
                    return data;
                }
                value = Module.KEYS[name].values[data];
                if (!value) {
                    console.warn('morel.Occurrence: no such ' + name + ' value: ' + data);
                    return data;
                }

                return value;
            },

            toJSON: function () {
                var data = {
                    id: this.id,
                    attributes: this.attributes,
                    images: this.images.toJSON()
                };
                //add occurrences
                return data;
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());
    /***********************************************************************
     * SAMPLE MODULE
     **********************************************************************/

    /**
     * Refers to the event in which the sightings were observed, in other
     * words it describes the place, date, people, environmental conditions etc.
     * Within a sample, you can have zero or more occurrences which refer to each
     * species sighted as part of the sample.
     */
    m.Sample = (function () {

        var Module = function (options) {
            var name = null,
                value = null,
                key = null;

            options || (options = {});

            this.id = options.id || m.getNewUUID();
            this.attributes = {};

            if (options.occurrences) {
                this.occurrences = new m.Collection({
                    model: m.Occurrence,
                    data: options.occurrences
                });
            } else {
                this.occurrences = new m.Collection({
                    model: m.Occurrence
                });
            }

            if (options.attributes) {
                if (options.plainAttributes) {
                    this.attributes = options.attributes;

                //transform keys
                } else {
                    for (name in options.attributes) {
                        key = this.key(name);
                        value = this.value(name, options.attributes[name]);
                        this.attributes[key] = value;
                    }
                }
            } else {
                this.attributes = {};

                var date = new Date();
                this.set('DATE', m.formatDate(date));
                this.set('LOCATION_TYPE', 'LATLON');
            }
        };

        Module.KEYS =  {
                ID: { id: 'id' },
                SURVEY: { id: 'survey_id' },
                DATE: { id: 'date' },
                COMMENT: { id: 'comment' },
                IMAGE: { id: 'image' },
                LOCATION: { id: 'entered_sref' },
                LOCATION_TYPE: {
                    id: 'entered_sref_system',
                    values: {
                        'BRITISH': 'OSGB', //for British National Grid
                        'IRISH': 'OSIE', //for Irish Grid
                        'LATLON': 4326 //for Latitude and Longitude in decimal form (WGS84 datum)
                    }
                },
                LOCATION_NAME: { id: 'location_name' },
                DELETED: { id: 'deleted' }
        };

        m.extend(Module.prototype, {
            set: function (name, data) {
                var key = this.key(name),
                    value = this.value(name, data),
                    changed = false;

                if (this.attributes[key] !== value) {
                    changed = true;
                }
                this.attributes[key] = value;

                if (changed) {
                    this.trigger('change:' + name);
                }
            },

            get: function (name) {
                var key = this.key(name);
                return this.attributes[key];
            },

            remove: function (name) {
                var key = this.key(name);
                delete this.attributes[key];
                this.trigger('change:' + name);
            },

            clear: function () {
                this.attributes = {};
                this.trigger('change');
            },

            has: function (name) {
                var data = this.get(name);
                return data !== undefined && data !== null;
            },

            key: function (name) {
                name = name.toUpperCase();
                var key = Module.KEYS[name];
                if (!key || !key.id) {
                    console.warn('morel.Sample: no such key: ' + name);
                    return name;
                }
                return key.id;
            },

            value: function (name, data) {
                var value = null;
                name = name.toUpperCase();
                if (typeof data !== 'string' ||
                    !Module.KEYS[name] ||
                    !Module.KEYS[name].values) {
                    return data;
                }
                value = Module.KEYS[name].values[data];
                if (!value) {
                    console.warn('morel.Sample: no such ' + name + ' value: ' + data);
                    return data;
                }

                return value;
            },

            toJSON: function () {
                var data = {
                        id: this.id,
                        attributes: this.attributes,
                        occurrences: this.occurrences.toJSON()
                    };

                return data;
            },

            flatten: function () {
                var json = this.toJSON(),
                    flattened = {};

                m.extend(flattened, json.attributes);

                for (var i = 0; i < json.occurrences.length; i++) {
                    m.extend(flattened, json.occurrences[i].attributes);
                }
                return flattened;
            }

        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());
    /***********************************************************************
     * AUTH MODULE
     **********************************************************************/

    m.Auth = (function (){

        /**
         * options:
         *  @appname String subdomain name to use for database
         *  @appsecret String API key
         *  @survey_id Int
         *  @website_id Int
         */
        var Module = function (options) {
            options || (options = {});
            m.extend(this.CONF, options);
        };

        m.extend(Module.prototype, {
            CONF: {
                appname: '',
                appsecret: '',
                survey_id: -1,
                website_id: -1
            },

            /**
             * Appends user and app authentication to the passed data object.
             * Note: object has to implement 'append' method.
             *
             * @param data An object to modify
             * @returns {*} A data object
             */
            append: function (data) {
                //user logins
                //this.appendUser(data);
                //app logins
                this.appendApp(data);
                //warehouse data
                this.appendWarehouse(data);

                return data;
            },

            /**
             * Appends user authentication - Email and Password to
             * the passed data object.
             * Note: object has to implement 'append' method.
             *
             * @param data An object to modify
             * @returns {*} A data object
             */
            appendUser: function (data) {
                if (this.isUser()) {
                    var user = this.getUser();

                    data.append('email', user.email);
                    data.append('usersecret', user.secret);
                }

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
            appendApp: function (data) {
                data.append('appname', this.CONF.appname);
                data.append('appsecret', this.CONF.appsecret);

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
            appendWarehouse: function (data) {
                data.append('website_id', this.CONF.website_id);
                data.append('survey_id', this.CONF.survey_id);

                return data;
            },

            /**
             * Checks if the user has authenticated with the app.
             *
             * @returns {boolean} True if the user exists, else False
             */
            isUser: function () {
                var obj = this.getUser();
                return Object.keys(obj).length !== 0;
            },

            /**
             * Brings the user details from the storage.
             *
             * @returns {Object|*}
             */
            getUser: function () {
                return m.settings(this.USER) || {};
            },

            /**
             * Saves the authenticated user details to the storage.
             *
             * @param user A user object
             */
            setUser: function (user) {
                m.settings(this.USER, user);
            },

            /**
             * Removes the current user details from the storage.
             */
            removeUser: function () {
                m.settings(this.USER, {});
            }
        });

        return Module;
    }());


    /***********************************************************************
     * STORAGE MODULE
     **********************************************************************/

    m.Storage = (function () {

        var Module = function () {
            this.storage = {};
        };

        m.extend(Module.prototype, {
            NAME: 'Storage',

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
     * LOCAL STORAGE MODULE
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

        m.extend(Module.prototype, {
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
     * ERROR MODULE
     **********************************************************************/

    m.Error = (function () {
        var Module = function (message) {
            this.message = message;
        };

        return Module;
    }());

    /***********************************************************************
     * DATABASE STORAGE MODULE
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

        m.extend(Module.prototype, {
            //because of iOS8 bug on home screen: null & readonly window.indexedDB
            indexedDB: window._indexedDB || window.indexedDB,
            IDBKeyRange: window._IDBKeyRange || window.IDBKeyRange,

            VERSION: 1,
            TYPE: 'DatabaseStorage',
            NAME: "morel",
            STORE_NAME: "samples",

            /**
             * Adds an item under a specified key to the database.
             * Note: might be a good idea to move the key assignment away from
             * the function parameters and rather auto assign one and return on callback.
             *
             * @param key
             * @param data
             * @param callback
             */
            set: function (key, data, callback) {
                this.open(function (err, store) {
                    if (err) {
                        callback && callback(err);
                        return;
                    }

                    var req = store.put(data.toJSON(), key);

                    req.onsuccess = function () {
                        callback && callback(null, data);
                    };

                    req.onerror = function (e) {
                        var message = 'Database Problem: ' + e.target.error.message,
                            error = new m.Error(message);
                        console.error(message);
                        callback(error);
                    };
                });
            },

            /**
             * Gets a specific saved data from the database.
             * @param key The stored data Id.
             * @param callback
             * @aram onError
             * @returns {*}
             */
            get: function (key, callback) {
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
                        callback(error);
                    };
                });
            },

            /**
             * Brings back all saved data from the database.
             */
            getAll: function (callback) {
                var that = this;

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
            },

            size: function (callback) {
                this.open(function (err, store) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    var req = store.count();
                    req.onsuccess = function () {
                        callback(null, req.result);
                    };

                    req.onerror = function (e) {
                        var message = 'Database Problem: ' + e.target.error.message,
                            error = new m.Error(message);
                        console.error(message);
                        callback(error);
                    };
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
                    req = this.indexedDB.open(this.NAME, this.VERSION);

                /**
                 * On Database opening success, returns the Records object store.
                 *
                 * @param e
                 */
                req.onsuccess = function (e) {
                    var db = e.target.result,
                        transaction = db.transaction([that.STORE_NAME], "readwrite"),
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
            }
        });

        return Module;
    }());


    /***********************************************************************
     * MANAGER MODULE
     **********************************************************************/

    m.Manager = (function () {
        var Module = function (options) {
            options || (options = {});

            this.CONF.url = options.url;
            this.CONF.appname = options.appname;

            this.auth = new m.Auth({
                appname: options.appname,
                appsecret: options.appsecret,
                survey_id: options.survey_id,
                website_id: options.website_id
            });

            this.Storage = options.Storage || m.LocalStorage;
            this.Sample = options.Sample || m.Sample;

            this.storage = new this.Storage({
                appname: options.appname
            });
        };

        m.extend(Module.prototype, {
            CONF: {
                url: '',
                appname: ''
            },

            get: function (item, callback) {
                var that = this,
                    key = typeof item === 'object' ? item.id : item;
                this.storage.get(key, function (err, data) {
                    var sample = data ? new that.Sample(data) : null;
                    callback(err, sample);
                });
            },

            getAll: function (callback) {
                var that = this;
                this.storage.getAll(function (err, data){
                    var samples = {},
                        sample = null,
                        keys = Object.keys(data);

                    for (var i = 0; i < keys.length; i++) {
                        sample = new that.Sample(m.extend(data[keys[i]], {
                           plainAttributes: true
                        }));
                        samples[sample.id] = sample;
                    }
                    callback(err, samples);
                });
            },

            set: function (item, callback) {
                var key = item.id;
                this.storage.set(key, item, callback);
            },

            remove: function (item, callback) {
                var key = typeof item === 'object' ? item.id : item;
                this.storage.remove(key, callback);
            },

            has: function (item, callback) {
                var key = typeof item === 'object' ? item.id : item;
                this.storage.has(key, callback);
            },

            clear: function (callback) {
              this.storage.clear(callback);
            },

            sync: function (item, callback) {
                var that = this;
                //synchronise with the server
                this.get(item, function (err, data) {
                    if (data) {
                        that.sendStored(data, callback);
                    } else {
                        callback(err);
                    }
                });
            },

            syncAll: function (callbackOnPartial, callback) {
                this.sendAllStored(callbackOnPartial, callback);
            },


            /**
             * Sending all saved records.
             *
             * @returns {undefined}
             */
            sendAllStored: function (callbackOnPartial, callback) {
                var that = this;
                this.getAll(function (err, samples) {
                    var sample = {},
                        samplesIDs = [];

                    if (err) {
                        callback(err);
                        return;
                    }

                    //recursively loop through samples
                    samplesIDs = Object.keys(samples);
                    for (var i = 0; i < samplesIDs.length; i++) {
                        sample = samples[samplesIDs[i]];
                        that.sendStored(sample, function (err, data) {
                            if (err) {
                                callback && callback(err);
                                return;
                            }

                            delete samples[samplesIDs[i]];

                            if (Object.keys(samples).length === 0) {
                                //finished
                                callback && callback(null);
                            } else {
                                callbackOnPartial && callbackOnPartial(null);
                            }
                        });
                    }
                })
            },

            sendStored: function (sample, callback) {
                var that = this,
                    onSuccess = function (data) {
                        //update sample
                        sample.warehouse_id = 'done';

                        //save sample
                        that.set(sample, function (err, data) {
                            callback && callback(null, data);
                        });
                    },

                    onError = function (err) {
                        callback && callback(err);
                    };

                this.send(sample, function (err, data) {
                    if (err) {
                        onError(err);
                    } else {
                        onSuccess(data);
                    }
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
                var flattened = sample.flatten(),
                    formData = new FormData();

                //images

                var keys = Object.keys(flattened);
                for (var i= 0; i < keys.length; i++) {
                    formData.append(keys[i], flattened[keys[i]]);
                }

                //Add authentication
                formData = this.auth.append(formData);

                this._post(formData, callback);
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
                                callback(null, ajax.response);
                                break;
                            case 400:
                                 error = new m.Error(ajax.response);
                                callback(error);
                                break;
                            default:
                                error = new m.Error('Unknown problem while sending request.');
                                callback && callback(error);
                        }
                    }
                };

                ajax.open('POST', this.CONF.url, true);
                ajax.setRequestHeader("Content-type", "multipart/form-data");
                ajax.send(formData);
            }
        });

        return Module;
    }());

    /***********************************************************************
     * GEOLOCATION MODULE
     **********************************************************************/

    /* global morel, _log */
    m.extend('geoloc', {
        //configuration should be setup in app config file
        CONF: {
            GPS_ACCURACY_LIMIT: 26000,
            HIGH_ACCURACY: true,
            TIMEOUT: 120000
        },

        //todo: limit the scope of the variables to this module's functions.
        latitude: null,
        longitude: null,
        accuracy: -1,

        startTime: 0,
        id: 0,
        map: null,

        /**
         * Sets the Latitude, Longitude and the Accuracy of the GPS lock.
         *
         * @param lat
         * @param lon
         * @param acc
         */
        set: function (lat, lon, acc) {
            this.latitude = lat;
            this.longitude = lon;
            this.accuracy = acc;
        },

        /**
         * Gets the the Latitude, Longitude and the Accuracy of the GPS lock.
         *
         * @returns {{lat: *, lon: *, acc: *}}
         */
        get: function () {
            return {
                'lat': this.latitude,
                'lon': this.longitude,
                'acc': this.accuracy
            };
        },

        /**
         * Clears the current GPS lock.
         */
        clear: function () {
            this.set(null, null, -1);
        },

        /**
         * Gets the accuracy of the current GPS lock.
         *
         * @returns {*}
         */
        getAccuracy: function () {
            return this.accuracy;
        },

        /**
         * Runs the GPS.
         *
         * @returns {*}
         */
        run: function (onUpdate, onSuccess, onError) {

            // Early return if geolocation not supported.
            if (!navigator.geolocation) {

                if (onError) {
                    onError({message: "Geolocation is not supported!"});
                }
                return;
            }

            //stop any other geolocation service started before
            m.geoloc.stop();
            m.geoloc.clear();

            this.startTime = new Date().getTime();

            // Request geolocation.
            this.id = m.geoloc.watchPosition(onUpdate, onSuccess, onError);
        },

        /**
         * Stops any currently running geolocation service.
         */
        stop: function () {
            navigator.geolocation.clearWatch(m.geoloc.id);
        },

        /**
         * Watches the GPS position.
         *
         * @param onUpdate
         * @param onSuccess
         * @param onError
         * @returns {Number} id of running GPS
         */
        watchPosition: function (onUpdate, onSuccess, onError) {
            var onGeolocSuccess = function (position) {
                //timeout
                var currentTime = new Date().getTime();
                if ((currentTime - m.geoloc.startTime) > m.geoloc.TIMEOUT) {
                    //stop everything
                    m.geoloc.stop();

                    if (onError) {
                        onError({message: "Geolocation timed out!"});
                    }
                    return;
                }

                var location = {
                    'lat': position.coords.latitude,
                    'lon': position.coords.longitude,
                    'acc': position.coords.accuracy
                };

                //set for the first time
                var prevAccuracy = m.geoloc.getAccuracy();
                if (prevAccuracy === -1) {
                    prevAccuracy = location.acc + 1;
                }

                //only set it up if the accuracy is increased
                if (location.acc > -1 && location.acc < prevAccuracy) {
                    m.geoloc.set(location.lat, location.lon, location.acc);
                    if (location.acc < m.geoloc.CONF.GPS_ACCURACY_LIMIT) {

                        m.geoloc.stop();

                        //save in storage
                        if (onSuccess) {
                            onSuccess(location);
                        }
                    } else {

                        if (onUpdate) {
                            onUpdate(location);
                        }
                    }
                }
            };

            // Callback if geolocation fails.
            var onGeolocError = function (error) {

                if (onError) {
                    onError({'message': error.message});
                }
            };

            // Geolocation options.
            var options = {
                enableHighAccuracy: this.CONF.HIGH_ACCURACY,
                maximumAge: 0,
                timeout: this.CONF.TIMEOUT
            };

            return navigator.geolocation.watchPosition(
                onGeolocSuccess,
                onGeolocError,
                options
            );
        },

        /**
         * Validates the current GPS lock quality.
         *
         * @returns {*}
         */
        valid: function () {
            var accuracy = this.getAccuracy();
            if (accuracy === -1) {
                //No GPS lock yet
                return m.ERROR;

            } else if (accuracy > this.CONF.GPS_ACCURACY_LIMIT) {
                //Geolocated with bad accuracy
                return m.FALSE;

            } else {
                //Geolocation accuracy is good enough
                return m.TRUE;
            }
        }
    });


    return m;
}));