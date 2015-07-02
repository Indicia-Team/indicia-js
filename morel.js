/*!
 * Mobile Recording Library for biological data collection. 
 * Version: 3.0.0-alpha
 *
 * https://github.com/NERC-CEH/morel
 *
 * Author 2015 Karols Kazlauskis
 * Released under the GNU GPL v3 * license.
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

  /*
   * Things to work on:
   *  - Decouple the modules as much as possible
   *  - Close as many global variables
   */
  "use strict";

  m.VERSION = '3.0.0-alpha'; //library version, generated/replaced by grunt

  //library wide configuration
  m.CONF = {};

  //CONSTANTS:
  m.TRUE = 1;
  m.FALSE = 0;
  m.ERROR = -1;

  m.SETTINGS_KEY = 'morel-settings';

  /**
   * Extends the morel library with the provided namespace and its object.
   *
   * @param name
   * @param obj
   * @returns {*|{}}
   */
  m.extend = function (name, obj) {
    //if a function than initialize it otherwise assign an object
    obj = typeof(obj) === "function" ? obj(variable) : obj || {};

    var nameArray = name.split('.');

    var variable = m; //variable for working with deep namespace

    //iterate through the namespaces creating objects & return reference
    // of last parent object
    for (var nameCount = 0; nameCount < (nameArray.length - 1); nameCount++) {
      if (typeof variable[nameArray[nameCount]] !== 'object') {
        //overwrite if it is not an object
        variable[nameArray[nameCount]] = {};
      }
      variable = variable[nameArray[nameCount]];
    }
    //assign new object
    variable[nameArray[nameArray.length - 1]] =  obj;

    return m[nameArray[0]];
  };

  /**
   * Initialises the application settings.
   */
  m.initSettings = function () {
    m.storage.set(m.SETTINGS_KEY, {});
  };

  /**
   * Sets an app setting.
   *
   * @param item
   * @param data
   * @returns {*}
   */
  m.settings = function (item, data) {
    var settings = m.storage.get(m.SETTINGS_KEY);
    if (!settings) {
      m.initSettings();
      settings = m.storage.get(m.SETTINGS_KEY);
    }

    if (data) {
      settings[item] = data;
      return m.storage.set(m.SETTINGS_KEY, settings);
    } else {
      return (item) ? settings[item] : settings;
    }
  };

  /**
   * Resets the morel to the initial state.
   *
   * Clears localStorage.
   * Clears sessionStorage.
   * Clears databases.
   */
  m.reset = function () {
    m.storage.clear();
    m.storage.tmpClear();

    m.db.clear();
  };


/***********************************************************************
 * IO MODULE
 **********************************************************************/

  /* global morel, _log */
  m.extend('io', {
    //configuration should be setup in app config file
    CONF: {
      RECORD_URL: "" //todo: set to null and throw error if undefined
    },

    /**
     * Sending all saved records.
     *
     * @returns {undefined}
     */
    sendAllSavedRecords: function (callback, callbackDone) {
      var onSuccess = null;
      var that = this;
      if (navigator.onLine) {
        onSuccess = function (records) {
          var id = Object.keys(records)[0]; //getting the first one of the array
          if (id) {

            var onSendSavedSuccess = function (data) {
              var recordKey = this.callback_data.recordKey;


              m.db.remove(recordKey);
              if (callback){
                callback();
              }
              m.io.sendAllSavedRecords(callback, callbackDone);
            };

            id = parseInt(id); //only numbers
            that.sendSavedRecord(id, onSendSavedSuccess);
          } else {
            if (callbackDone){
              callbackDone();
            }
          }
        };

        m.db.getAll(onSuccess);
      } else {
        $.mobile.loading('show', {
          text: "Looks like you are offline!",
          theme: "b",
          textVisible: true,
          textonly: true
        });

        setTimeout(function () {
          $.mobile.loading('hide');
        }, 3000);
      }
    },

    /**
     * Sends the saved record
     *
     * @param recordKey
     * @param callback
     * @param onError
     * @param onSend
     */
    sendSavedRecord: function (recordKey, callback, onError, onSend) {
      var that = this;

      function onSuccess(data) {
        var record = {
          'data': data,
          'recordKey': recordKey
        };
        function onPostError(xhr, ajaxOptions, thrownError) {


          var message = "";
          if (xhr.responseText || thrownError){
            message = xhr.status + " " + thrownError + " " + xhr.responseText;
          } else {
            message = "Error occurred while sending.";
          }
          var err = {
            message: message
          };
          if (onError){
            onError(err);
          }
        }
        that.postRecord(record, callback, onPostError, onSend);
      }
      m.db.getData(recordKey, onSuccess);
    },

    /**
     * Submits the record.
     */
    postRecord: function (record, onSuccess, onError, onSend) {

      var data = {};
      if (!record.data) {
        //extract the record data
        var form = document.getElementById(record.id);
        data = new FormData(form);
      } else {
        data = record.data;
      }

      //Add authentication
      data = m.auth.append(data);

      $.ajax({
        url: this.getRecordURL(),
        type: 'POST',
        data: data,
        callback_data: record,
        cache: false,
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        success: onSuccess || function (data) {
          var recordKey = this.callback_data.recordKey;

        },
        error: onError || function (xhr, ajaxOptions, thrownError) {


        },
        beforeSend: onSend || function () {

        }
      });
    },

    /**
     * Returns App main record Path.
     *
     * @param basePath
     * @returns {*}
     */
    getRecordURL: function () {
      return this.CONF.RECORD_URL;
    }
  });


 /***********************************************************************
 * AUTH MODULE
 **********************************************************************/


  /* global morel */
  m.extend('auth', {
    //module configuration should be setup in an app config file
    CONF: {
      APPNAME: "",
      APPSECRET: "",
      WEBSITE_ID: 0,
      SURVEY_ID: 0
    },

    //name under which the user details are stored
    USER: 'user',

    /**
     * Appends user and app authentication to the passed data object.
     * Note: object has to implement 'append' method.
     *
     * @param data An object to modify
     * @returns {*} A data object
     */
    append: function (data) {
      //user logins
      this.appendUser(data);
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
      data.append('appname', this.CONF.APPNAME);
      data.append('appsecret', this.CONF.APPSECRET);

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
      data.append('website_id', this.CONF.WEBSITE_ID);
      data.append('survey_id', this.CONF.SURVEY_ID);

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


/***********************************************************************
 * GEOLOC MODULE
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
            m.settings('location', location);
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


/***********************************************************************
 * HELPER FUNCTIONS
 *
 * Functions that were too ambiguous to be placed in one module.
 **********************************************************************/

  /**
   * Clones an object.
   *
   * @param obj
   * @returns {*}
   */
  m.objClone = function(obj) {
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
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
  m.dataURItoBlob = function(dataURI, fileType) {
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
  m.isPlainObject = function(obj) {
    function type( obj ) {
      var class2type = {};
      var types = "Boolean Number String Function Array Date RegExp Object".split(" ");
      for (var i = 0; i < types.length; i++) {
        class2type["[object " + types[i] + "]"] = types[i].toLowerCase();
      }
      return obj == null ?
        String( obj ) :
      class2type[ toString.call(obj) ] || "object";
    }

    function isWindow( obj ) {
      return obj && typeof obj === "object" && "setInterval" in obj;
    }

    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if ( !obj || type(obj) !== "object" || obj.nodeType || isWindow( obj ) ) {
      return false;
    }

    // Not own constructor property must be Object
    if ( obj.constructor &&
      !hasOwn.call(obj, "constructor") &&
      !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
      return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.

    var key;
    for ( key in obj ) {}

    return key === undefined || hasOwn.call( obj, key );
  };

  //checks if the object has any elements.
  m.isEmptyObject = function(obj) {
    for (var key in obj) {
      return false;
    }
    return true;
  };

  function extend (a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  }


/***********************************************************************
 * IMAGE MODULE
 **********************************************************************/

  /* global morel, _log */
  m.extend('image', {
    //todo: move to CONF.
    MAX_IMG_HEIGHT: 800,
    MAX_IMG_WIDTH: 800,

    /**
     * Returns all the images resized and stingified from an element.
     *
     * @param elem DOM element to look for files
     * @param callback function with an array parameter
     */
    extractAll: function (elem, callback, onError) {
      var fileInputs = m.image.findAll(elem);
      if (fileInputs.length > 0) {
        m.image.toStringAll(fileInputs, callback, onError);
      } else {
        callback();
      }
    },

    /**
     * Transforms and resizes an image file into a string and saves it in the storage.
     *
     * @param onError
     * @param file
     * @param onSaveSuccess
     * @returns {number}
     */
    toString: function (file, onSaveSuccess, onError) {
      if (file) {


        var reader = new FileReader();
        //#2
        reader.onload = function () {

          var image = new Image();
          //#4
          image.onload = function (e) {
            var width = image.width;
            var height = image.height;

            //resizing
            var res;
            if (width > height) {
              res = width / m.image.MAX_IMG_WIDTH;
            } else {
              res = height / m.image.MAX_IMG_HEIGHT;
            }

            width = width / res;
            height = height / res;

            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            var imgContext = canvas.getContext('2d');
            imgContext.drawImage(image, 0, 0, width, height);

            var shrinked = canvas.toDataURL(file.type);

            _log("IMAGE: done shrinking file (" +
            (shrinked.length / 1024) + "KB).", m.LOG_DEBUG);

            onSaveSuccess(shrinked);

          };
          reader.onerror = function (e) {

            e.message = e.getMessage();
            onError(e);
          };

          //#3
          image.src = reader.result;
        };
        //1#
        reader.readAsDataURL(file);
      }
    },

    /**
     * Saves all the files. Uses recursion.
     *
     * @param files An array of files to be saved
     * @param onSaveAllFilesSuccess
     * @param onError
     */
    toStringAll: function (fileInputs, onSaveAllFilesSuccess, onError) {
      //recursive calling to save all the images
      saveAllFilesRecursive(fileInputs, null);
      function saveAllFilesRecursive(fileInputs, files) {
        files = files || {};

        //recursive files saving
        if (fileInputs.length > 0) {
          var filesInfo = fileInputs.pop();
          //get next file in file array
          var file = filesInfo.file;
          var name = filesInfo.input_field_name;

          //recursive saving of the files
          var onSaveSuccess = function (file) {
            files[name] = file;
            saveAllFilesRecursive(fileInputs, files, onSaveSuccess);
          };
          m.image.toString(file, onSaveSuccess, onError);
        } else {
          onSaveAllFilesSuccess(files);
        }
      }
    },

    /**
     * Extracts all files from the page inputs having data-form attribute.
     */
    findAll: function (elem) {
      if (!elem) {
        elem = window.document;
      }

      var files = [];
      var inputs = elem.getElementsByTagName('input');
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (input.getAttribute('type') === "file" && input.files.length > 0) {
          var file = m.image.find(input);
          files.push(file);
        }
      }
      return files;
    },

    /**
     * Returns a file object with its name.
     *
     * @param input The file input Id
     * @returns {{file: *, input_field_name: *}}
     */
    find: function (input) {
      var file = {
        'file': input.files[0],
        'input_field_name': input.attributes.name.value
      };
      return file;
    }
  });


/***********************************************************************
 * RECORD MODULE
 *
 * Things to work on:
 *  - Validation should be moved to the app controllers level.
 **********************************************************************/

  /* global morel, _log */
  m.extend('record', {
    //CONSTANTS
    //todo: add _KEY to each constant name to distinguish all KEYS
    RECORD: "record", //name under which the record is stored
    MULTIPLE_GROUP_KEY: "multiple_", //to separate a grouped input
    COUNT: "record_count",
    STORAGE: "record_",
    PIC: "_pic_",
    DATA: "data",
    FILES: "files",
    SETTINGS: "morel",
    LASTID: "lastId",

    //GLOBALS
    totalFiles: 0,

    /**
     * Initialises the recording environment.
     *
     * @returns {*}
     */
    init: function () {
      var settings = this.getSettings();
      if (!settings) {
        settings = {};
        settings[this.LASTID] = 0;
        this.setSettings(settings);
        return settings;
      }
      return null;
    },

    /**
     * Record settings. A separate DOM storage unit for storing
     * recording specific data.
     * Note: in the future, if apart of LastFormId no other uses arises
     * should be merged with default m.settings.
     *
     * @param settings
     */
    setSettings: function (settings) {
      m.storage.set(this.SETTINGS, settings);
    },

    /**
     * Initializes and returns the settings.
     *
     * @returns {{}}
     */
    initSettings: function () {
      var settings = {};
      settings[this.LASTID] = 0;
      this.setSettings(settings);
      return settings;
    },

    /**
     * Returns the settings.
     *
     * @returns {*|{}}
     */
    getSettings: function () {
      var settings = m.storage.get(this.SETTINGS) || this.initSettings();
      return settings;
    },

    /**
     * Returns the current record.
     *
     * @returns {*}
     */
    get: function () {
      return m.storage.tmpGet(this.RECORD) || {};
    },

    /**
     * Sets the current record.
     *
     * @param record The current record to be stored.
     */
    set: function (record) {
      m.storage.tmpSet(this.RECORD, record);
    },

    /**
     * Clears the current record.
     */
    clear: function () {
      m.storage.tmpRemove(this.RECORD);
    },

    /**
     * Extracts data (apart from files) from provided record into a record_array that it returns.
     *
     * @param record
     * @returns {Array}
     */
    extractFromRecord: function (record) {
      //extract record data
      var recordArray = [];
      var name, value, type, id, needed;

      record.find('input').each(function (index, input) {
        //todo: refactor to $NAME
        name = $(input).attr("name");
        value = $(input).attr('value');
        type = $(input).attr('type');
        id = $(input).attr('id');
        needed = true; //if the input is empty, no need to send it

        switch (type) {
          case "checkbox":
            needed = $(input).is(":checked");
            break;
          case "text":
            value = $(input).val();
            break;
          case "radio":
            needed = $(input).is(":checked");
            break;
          case "button":
          case "file":
            needed = false;
            //do nothing as the files are all saved
            break;
          case "hidden":
            break;
          default:

            break;
        }

        if (needed) {
          if (value !== "") {
            recordArray.push({
              "name": name,
              "value": value,
              "type": type
            });
          }
        }
      });

      //TEXTAREAS
      record.find('textarea').each(function (index, textarea) {
        //todo: refactor to $NAME
        name = $(textarea).attr('name');
        value = $(textarea).val();
        type = "textarea";

        if (value !== "") {
          recordArray.push({
            "name": name,
            "value": value,
            "type": type
          });
        }
      });

      //SELECTS
      record.find("select").each(function (index, select) {
        //todo: refactor to $NAME
        name = $(select).attr('name');
        value = $(select).find(":selected").val();
        type = "select";

        if (value !== "") {
          recordArray.push({
            "name": name,
            "value": value,
            "type": type
          });
        }
      });

      return recordArray;
    }

});


/***********************************************************************
 * RECORD.DB MODULE
 *
 * Takes care of the record database functionality.
 **********************************************************************/

  /* global morel, _log, IDBKeyRange, dataURItoBlob */
  m.extend('db', {
    //because of iOS8 bug on home screen: null & readonly window.indexedDB
    indexedDB: window._indexedDB || window.indexedDB,
    IDBKeyRange: window._IDBKeyRange || window.IDBKeyRange,

    RECORDS: "records",

    DB_VERSION: 1,
    DB_MAIN: "morel",
    STORE_RECORDS: "records",

    /**
     * Opens a database connection and returns a records store.
     *
     * @param onError
     * @param callback
     */
    open: function (callback, onError) {
      var dbName = m.CONF.NAME + '-' + this.DB_MAIN;
      var req = this.indexedDB.open(dbName, this.DB_VERSION);
      var that = this;

      /**
       * On Database opening success, returns the Records object store.
       *
       * @param e
       */
      req.onsuccess = function (e) {

        var db = e.target.result;
        var transaction = db.transaction([that.STORE_RECORDS], "readwrite");
        var store = transaction.objectStore(that.STORE_RECORDS);

        if (callback) {
          callback(store);
        }
      };

      /**
       * If the Database needs an upgrade or is initialising.
       *
       * @param e
       */
      req.onupgradeneeded = function (e) {

        var db = e.target.result;

        var store = db.createObjectStore(that.STORE_RECORDS, {'keyPath': 'id'});
        store.createIndex('id', 'id', {unique: true});
      };

      /**
       * Error of opening the database.
       *
       * @param e
       */
      req.onerror = function (e) {

        e.message = "Database NOT opened successfully.";
        if (onError) {
          onError(e);
        }
      };

      /**
       * Error on database being blocked.
       *
       * @param e
       */
      req.onblocked = function (e) {

        if (onError) {
          onError(e);
        }
      };
    },

    /**
     * Adds a record under a specified key to the database.
     * Note: might be a good idea to move the key assignment away from
     * the function parameters and rather auto assign one and return on callback.
     *
     * @param record
     * @param key
     * @param callback
     * @param onError
     */
    add: function (record, key, callback, onError) {
      this.open(function (store) {

        record.id = key;
        var req = store.add(record);
        req.onsuccess = function (event) {
          if (callback) {
            callback();
          }
        };
        store.transaction.db.close();
      }, onError);
    },

    /**
     * Gets a specific saved record from the database.
     * @param key The stored record Id.
     * @param callback
     * @aram onError
     * @returns {*}
     */
    get: function (key, callback, onError) {
      this.open(function (store) {


        var req = store.index('id').get(key);
        req.onsuccess = function (e) {
          var result = e.target.result;

          if (callback) {
            callback(result);
          }
        };
      }, onError);
    },

    /**
     * Removes a saved record from the database.
     *
     * @param key
     * @param callback
     * @param onError
     */
    remove: function (key, callback, onError) {
      var that = this;

      this.open(function (store) {
        var req = store.openCursor(that.IDBKeyRange.only(key));
        req.onsuccess = function () {
          var cursor = req.result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
          } else {
            if (callback) {
              callback();
            }
          }
        };
      }, onError);
    },

    /**
     * Brings back all saved records from the database.
     */
    getAll: function (callback, onError) {
      var that = this;

      this.open(function (store) {
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
            if (callback) {
              callback(data);
            }
          }
        };

      }, onError);
    },

    /**
     * Checks whether the record under a provided key exists in the database.
     *
     * @param key
     * @param callback
     * @param onError
     */
    is: function (key, callback, onError) {
      function onSuccess(data) {
        if (isPlainObject(data)) {
          if (callback) {
            callback(!isEmptyObject(data));
          }
        } else {
          if (callback) {
            callback(data);
          }
        }
      }

      this.get(key, onSuccess, onError);
    },

    /**
     * Clears all the saved records.
     */
    clear: function (callback, onError) {
      this.open(function (store) {

        store.clear();

        if (callback) {
          callback();
        }
      }, onError);
    },

    /**
     * Returns a specific saved record in FormData format.
     *
     * @param recordKey
     * @param callback
     * @param onError
     * @returns {FormData}
     */
    getData: function (recordKey, callback, onError) {
      function onSuccess(savedRecord) {
        var data = new FormData();

        var savedRecordInputs = Object.keys(savedRecord);
        for (var k = 0; k < savedRecordInputs.length; k++) {
          var name = savedRecordInputs[k];
          var value = savedRecord[savedRecordInputs[k]];

          if (isDataURL(value)) {
            var file = value;
            var type = file.split(";")[0].split(":")[1];
            var extension = type.split("/")[1];
            data.append(name, dataURItoBlob(file, type), "pic." + extension);
          } else {
            data.append(name, value);
          }
        }
        callback(data);
      }

      //Extract data from database
      this.get(recordKey, onSuccess, onError);
    },

    /**
     * Saves a record using dynamic inputs.
     */
    save: function (recordInputs, callback, onError) {
      var record = recordInputs || m.record.get();
      var that = this;

      //get new record ID
      var settings = m.record.getSettings();
      var savedRecordId = ++settings[m.record.LASTID];

      //INPUTS
      var onExtractFilesSuccess = function (files) {
        //merge files and the rest of the inputs
        extend(record, files);


        function onSuccess() {
          //on record save success
          m.record.setSettings(settings);

          if (callback) {
            callback(savedRecordId);
          }
        }

        that.add(record, savedRecordId, onSuccess, onError);
      };

      m.image.extractAll(null, onExtractFilesSuccess, onError);
      return m.TRUE;
    },

    /*
     * Saves the provided record.
     * Returns the savedRecordId of the saved record, otherwise an m.ERROR.
     */
    saveForm: function (formId, onSuccess) {
      var records = this.getAll();
      var that = this;

      //get new record ID
      var settings = m.record.getSettings();
      var savedRecordId = ++settings[m.record.LASTID];

      //INPUTS
      //todo: refactor to $record
      var record = document.getElementById(formId);
      var onSaveAllFilesSuccess = function (filesArray) {
        //get all the inputs/selects/textboxes into array
        var recordArray = m.record.extractFromRecord(record);

        //merge files and the rest of the inputs
        recordArray = recordArray.concat(filesArray);


        try {
          records[savedRecordId] = recordArray;
          that.setAll(records);
          m.record.setSettings(settings);
        } catch (e) {


          return m.ERROR;
        }

        if (onSuccess) {
          onSuccess(savedRecordId);
        }
      };

      m.image.getAll(onSaveAllFilesSuccess);
      return m.TRUE;
    }

  });


/***********************************************************************
 * RECORD.INPUTS MODULE
 *
 * Object responsible for record input management.
 **********************************************************************/

  /* global morel, _log* */
  m.extend('record.inputs', {
    //todo: move KEYS to CONF.
    KEYS: {
      SREF: 'sample:entered_sref',
      SREF_SYSTEM: 'sample:entered_sref_system',
      SREF_ACCURACY: 'smpAttr:273',
      TAXON: 'occurrence:taxa_taxon_list_id',
      DATE: 'sample:date',
      COMMENT: 'sample:comment'
    },

    /**
     * Sets an input in the current record.
     *
     * @param item Input name
     * @param data Input value
     */
    set: function (item, data) {
      var record = m.record.get();
      record[item] = data;
      m.record.set(record);
    },

    /**
     * Returns an input value from the current record.
     *
     * @param item The Input name
     * @returns {*} null if the item does not exist
     */
    get: function (item) {
      var record = m.record.get();
      return record[item];
    },

    /**
     * Removes an input from the current record.
     *
     * @param item Input name
     */
    remove: function (item) {
      var record = m.record.get();
      delete record[item];
      m.record.set(record);
    },

    /**
     * Checks if the input is setup.
     *
     * @param item Input name
     * @returns {boolean}
     */
    is: function (item) {
      var val = this.get(item);
      if (m.isPlainObject(val)) {
        return !m.isEmptyObject(val);
      } else {
        return val;
      }
    }

  });


/***********************************************************************
 * STORAGE MODULE
 **********************************************************************/

  /* global morel, log */
  m.extend('storage', {

    /**
     * Checks if there is enough space in the storage.
     *
     * @param size
     * @returns {*}
     */
    hasSpace: function (size) {
      return localStorageHasSpace(size);
    },

    /**
     * Gets an item from the storage.
     *
     * @param item
     */
    get: function (item) {
      item = m.CONF.NAME + '-' + item;

      var data = localStorage.getItem(item);
      data = JSON.parse(data);
      return data;
    },

    /**
     * Sets an item in the storage.
     * Note: it overrides any existing item with the same name.
     *
     * @param item
     */
    set: function (item, data) {
      item = m.CONF.NAME + '-' + item;

      data = JSON.stringify(data);
      return localStorage.setItem(item, data);
    },

    /**
     * Removes the item from the storage.
     *
     * @param item
     */
    remove: function (item) {
      item = m.CONF.NAME + '-' + item;

      return localStorage.removeItem(item);
    },


    /**
     * Checks if the item exists.
     *
     * @param item Input name
     * @returns {boolean}
     */
    is: function (item) {
      var val = this.get(item);
      if (m.isPlainObject(val)) {
        return !m.isEmptyObject(val);
      } else {
        return val;
      }
    },


    /**
     * Clears the storage.
     */
    clear: function () {
      localStorage.clear();
    },


    /**
     * Returns the item from the temporary storage.
     *
     * @param item
     */
    tmpGet: function (item) {
      item = m.CONF.NAME + '-' + item;

      var data = sessionStorage.getItem(item);
      data = JSON.parse(data);
      return data;
    },


    /**
     * Sets an item in temporary storage.
     * @param data
     * @param item
     */
    tmpSet: function (item, data) {
      item = m.CONF.NAME + '-' + item;

      data = JSON.stringify(data);
      return sessionStorage.setItem(item, data);
    },


    /**
     * Removes an item in temporary storage.
     *
     * @param item
     */
    tmpRemove: function (item) {
      item = m.CONF.NAME + '-' + item;

      return sessionStorage.removeItem(item);
    },


    /**
     * Checks if the temporary item exists.
     *
     * @param item Input name
     * @returns {boolean}
     */
    tmpIs: function (item) {
      var val = this.tmpGet(item);
      if (m.isPlainObject(val)) {
        return !m.isEmptyObject(val);
      } else {
        return val;
      }
    },


    /**
     * Clears the temporary storage.
     */
    tmpClear: function () {
      sessionStorage.clear();
    },

    /**
     * Checks if it is possible to store some sized data in localStorage.
     */
    localStorageHasSpace: function (size) {
      var taken = JSON.stringify(localStorage).length;
      var left = 1024 * 1024 * 5 - taken;
      if ((left - size) > 0) {
        return 1;
      } else {
        return 0;
      }
    }
});


  return m;
}));