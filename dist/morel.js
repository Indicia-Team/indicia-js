/*!
 * Mobile Recording Library for biological data collection. 
 * Version: 1.0.0
 *
 * https://github.com/NERC-CEH/morel
 *
 * Author 2015 Karols Kazlauskis
 * Released under the GNU GPL v3 license.
 */
/***********************************************************************
 * APP MODULE
 *
 * Things to work on:
 *  - Decouple the modules as much as possible
 *  - Add better data management - app.data - should be strictly managed
 *  - Close as many global variables
 **********************************************************************/

app = (function (m, $) {
  m.version = '1.0.0'; //library version, generated/replaced by grunt

  //configuration should be setup in app config file
  m.CONF = {
    HOME: "",
    NAME: "", //todo: set to null to force an application name
    LOG: m.LOG_ERROR
  };

  //GLOBALS
  m.$ = $; //todo: remove if not used
  m.data = {};

  //CONSTANTS:
  m.TRUE = 1;
  m.FALSE = 0;
  m.ERROR = -1;

  //levels of app logging
  m.LOG_NONE = 0;
  m.LOG_ERROR = 1;
  m.LOG_WARNING = 2;
  m.LOG_INFO = 3;
  m.LOG_DEBUG = 4;

  /**
   * Events from.
   * http://jqmtricks.wordpress.com/2014/03/26/jquery-mobile-page-events/
   */
  m.pageEvents = [
    'pagebeforecreate',
    'pagecreate',
    'pagecontainerbeforechange ',
    'pagecontainerbeforetransition',
    'pagecontainerbeforehide',
    'pagecontainerhide',
    'pagecontainerbeforeshow',
    'pagecontainershow',
    'pagecontainertransition',
    'pagecontainerchange',
    'pagecontainerchangefailed',
    'pagecontainerbeforeload',
    'pagecontainerload',
    'pagecontainerloadfailed',
    'pagecontainerremove'
  ];

  /**
   * Init function.
   */
  m.initialise = function () {
    _log('APP: initialised.', app.LOG_INFO);

    //todo: needs tidying up
    //Bind JQM page events with page controller handlers
    $(document).on(app.pageEvents.join(' '), function (e, data) {
      var event = e.type;
      var id = null;
      switch (event) {
        case 'pagecreate':
        case 'pagecontainerbeforechange':
          id = data.prevPage != null ? data.prevPage[0].id : e.target.id;
          break;

        case 'pagebeforecreate':
          id = e.target.id;
          break;

        case 'pagecontainershow':
        case 'pagecontainerbeforetransition':
        case 'pagecontainerbeforehide':
        case 'pagecontainerbeforeshow':
        case 'pagecontainertransition':
        case 'pagecontainerhide':
        case 'pagecontainerchangefailed':
        case 'pagecontainerchange':
          id = data.toPage[0].id;
          break;

        case 'pagecontainerbeforeload':
        case 'pagecontainerload':
        case 'pagecontainerloadfailed':
        default:
          break;
      }

      //  var ihd = e.target.id || data.toPage[0].id;
      var controller = app.controller[id];

      //if page has controller and it has an event handler
      if (controller && controller[event]) {
        controller[event](e, data);
      }
    });
  };

  /**
   * Initialises the application settings.
   */
  m.initSettings = function () {
    app.storage.set('settings', {});
  };

  /**
   * Sets an app setting.
   *
   * @param item
   * @param data
   * @returns {*}
   */
  m.settings = function (item, data) {
    var settings = app.storage.get('settings');
    if (settings == null) {
      app.initSettings();
      settings = app.storage.get('settings');
    }

    if (data != null) {
      settings[item] = data;
      return app.storage.set('settings', settings);
    } else {
      return (item != undefined) ? settings[item] : settings;
    }
  };

  /**
   * Resets the app to the initial state.
   *
   * Clears localStorage.
   * Clears sessionStorage.
   * Clears databases.
   */
  m.reset = function () {
    app.storage.clear();
    app.storage.tmpClear();

    //app.db.clear();
    app.record.db.clear();
  };

  return m;
}(window.app || {}, jQuery)); //END

/**
 * Since the back button does not work in current iOS 7.1.1 while in app mode, it is
 * necessary to manually assign the back button urls.
 *
 * Set up the URL replacements so that the id of the page is matched with the new URL
 * of the back buttons it contains. The use of wild cards is possible eg.

 backButtonUrls = {
  'app-*':'home',
  'app-examples':'home',
  'tab-location':'home' 
};
 */

/**
 * Fixes back buttons for specific page
 */
function fixPageBackButtons(currentPageURL, nextPageId) {
  console.log('FIXING: back buttons ( ' + nextPageId + ')');

  var buttons = jQuery("div[id='" + nextPageId + "'] a[data-rel='back']");
  buttons.each(function (index, button) {
    jQuery(button).removeAttr('data-rel');

    //skip external pages
    if (currentPageURL != null) {
      //assign new url to the button
      jQuery(button).attr('href', currentPageURL);
    }
  });
}

/**
 * Generic function to detect the browser
 * 
 * Chrome has to have and ID of both Chrome and Safari therefore
 * Safari has to have an ID of only Safari and not Chrome
 */
function browserDetect(browser) {
  if (browser == 'Chrome' || browser == 'Safari') {
    var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
    var is_safari = navigator.userAgent.indexOf("Safari") > -1;
    var is_mobile = navigator.userAgent.indexOf("Mobile") > -1;

    if (is_safari) {
      if (browser == 'Chrome') {
        //Chrome
        return (is_chrome) ? true : false;
      } else {
        //Safari
        return (!is_chrome) ? true : false;
      }
    } else if (is_mobile) {
      //Safari homescreen Agent has only 'Mobile'
      return true;
    }
    return false;
  }
  return (navigator.userAgent.indexOf(browser) > -1);
}

/***********************************************************************
 * AUTH MODULE
 **********************************************************************/

app = app || {};
app.auth = (function (m, $) {
  //module configuration should be setup in an app config file
  m.CONF = {
    APPNAME: "",
    APPSECRET: "",
    WEBSITE_ID: 0,
    SURVEY_ID: 0
  };

  //name under which the user details are stored
  m.USER = 'user';

  /**
   * Appends user and app authentication to the passed data object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  m.append = function (data) {
    //user logins
    m.appendUser(data);
    //app logins
    m.appendApp(data);
    //warehouse data
    m.appendWarehouse(data);

    return data;
  };

  /**
   * Appends user authentication - Email and Password to
   * the passed data object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  m.appendUser = function (data) {
    var user = m.getUser();
    if (m.isUser()) {
      data.append('email', user.email);
      data.append('password', user.password)
    }

    return data;
  };

  /**
   * Appends app authentication - Appname and Appsecret to
   * the passed object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  m.appendApp = function (data) {
    data.append('appname', this.CONF.APPNAME);
    data.append('appsecret', this.CONF.APPSECRET);

    return data;
  };

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
  m.appendWarehouse = function (data) {
    data.append('website_id', this.CONF.WEBSITE_ID);
    data.append('survey_id', this.CONF.SURVEY_ID);

    return data;
  };

  /**
   * Checks if the user has authenticated with the app.
   *
   * @returns {boolean} True if the user exists, else False
   */
  m.isUser = function () {
    var user = m.getUser();
    return !$.isEmptyObject(user);
  };

  /**
   * Brings the user details from the storage.
   *
   * @returns {Object|*}
   */
  m.getUser = function () {
    return app.settings(m.USER);
  };

  /**
   * Saves the authenticated user details to the storage.
   *
   * @param user A user object
   */
  m.setUser = function (user) {
    app.settings(m.USER, user);
  };

  /**
   * Removes the current user details from the storage.
   */
  m.removeUser = function () {
    app.settings(m.USER, {});
  };

  return m;
}(app.auth || {}, jQuery));



/***********************************************************************
 * DB MODULE
 *
 * Module responsible for large data management.
 **********************************************************************/

app = app || {};
app.db = (function (m, $) {

  //todo: move to CONF.
  m.DB_VERSION = 1;
  m.DB_MAIN = "app";
  m.STORE_MAIN = "main";

  /**
   * Opens a database.
   *
   * @param name
   * @param storeName
   * @param callback
   */
  m.open = function (name, storeName, callback) {
    var req = window.indexedDB.open(name, m.DB_VERSION);

    req.onsuccess = function (e) {
      _log("DB: opened successfully.", app.LOG_DEBUG);
      var db = e.target.result;
      var transaction = db.transaction([storeName], "readwrite");
      var store = transaction.objectStore(storeName);

      if (callback != null) {
        callback(store);
      }
    };

    req.onupgradeneeded = function (e) {
      _log("DB: upgrading.", app.LOG_INFO);
      var db = e.target.result;

      db.deleteObjectStore(app.db.STORE_MAIN);
      db.createObjectStore(app.db.STORE_MAIN);
    };

    req.onerror = function (e) {
      _log("DB: NOT opened successfully.", app.LOG_ERROR);
      // _log(e);
    };

    req.onblocked = function (e) {
      _log("DB: database blocked.", app.LOG_ERROR);
      // _log(e);
    }

  };

  /**
   * Adds a record to the database store.
   *
   * @param record
   * @param key
   * @param callback
   */
  m.add = function (record, key, callback) {
    m.open(m.DB_MAIN, m.STORE_MAIN, function (store) {
      _log("DB: adding to the store.", app.LOG_DEBUG);

      store.add(record, key);
      store.transaction.db.close();

      if (callback != null) {
        callback();
      }
    });
  };

  /**
   * Gets a specific record from the database store.
   *
   * @param key
   * @param callback
   */
  m.get = function (key, callback) {
    m.open(m.DB_MAIN, m.STORE_MAIN, function (store) {
      _log('DB: getting from the store.', app.LOG_DEBUG);

      var result = store.get(key);
      if (callback != null) {
        callback(result);
      }

    });
  };

  /**
   * Gets all the records from the database store.
   *
   * @param callback
   */
  m.getAll = function (callback) {
    m.open(m.DB_MAIN, m.STORE_MAIN, function (store) {
      _log('DB: getting all from the store.', app.LOG_DEBUG);

      // Get everything in the store
      var keyRange = IDBKeyRange.lowerBound(0);
      var req = store.openCursor(keyRange);

      var data = [];
      req.onsuccess = function (e) {
        var result = e.target.result;

        // If there's data, add it to array
        if (result) {
          data.push(result.value);
          result.continue();

          // Reach the end of the data
        } else {
          if (callback != null) {
            callback(data);
          }
        }
      };

    });
  };

  /**
   * Checks if the record exists in the database store.
   *
   * @param key
   * @param callback
   */
  m.is = function (key, callback) {
    //todo: implement
  };

  /**
   * Clears the database store.
   *
   * @param callback
   */
  m.clear = function (callback) {
    m.open(m.DB_MAIN, m.STORE_RECORDS, function (store) {
      _log('DB: clearing store', app.LOG_DEBUG);
      store.clear();

      if (callback != null) {
        callback(data);
      }
    });
  };

  return m;
}(app.db || {}, app.$ || jQuery));

/***********************************************************************
 * GEOLOC MODULE
 **********************************************************************/

app = app || {};
app.geoloc = (function (m, $) {

  //configuration should be setup in app config file
  m.CONF = {
    GPS_ACCURACY_LIMIT: 26000,
    HIGH_ACCURACY: true,
    TIMEOUT: 120000
  };

  //todo: limit the scope of the variables to this module's functions.
  m.latitude = null;
  m.longitude = null;
  m.accuracy = -1;

  m.start_time = 0;
  m.id = 0;
  m.map = null;

  /**
   * Sets the Latitude, Longitude and the Accuracy of the GPS lock.
   *
   * @param lat
   * @param lon
   * @param acc
   */
  m.set = function (lat, lon, acc) {
    this.latitude = lat;
    this.longitude = lon;
    this.accuracy = acc;
  };

  /**
   * Gets the the Latitude, Longitude and the Accuracy of the GPS lock.
   *
   * @returns {{lat: *, lon: *, acc: *}}
   */
  m.get = function () {
    return {
      'lat': this.latitude,
      'lon': this.longitude,
      'acc': this.accuracy
    }
  };

  /**
   * Clears the current GPS lock.
   */
  m.clear = function () {
    m.set(null, null, -1);
  };

  /**
   * Gets the accuracy of the current GPS lock.
   *
   * @returns {*}
   */
  m.getAccuracy = function () {
    return this.accuracy;
  };

  /**
   * Runs the GPS.
   *
   * @returns {*}
   */
  m.run = function (onUpdate, onSuccess, onError) {
    _log('GEOLOC: run.', app.LOG_INFO);

    // Early return if geolocation not supported.
    if (!navigator.geolocation) {
      _log("GEOLOC: not supported!", app.LOG_ERROR);
      if (onError != null) {
        onError({message: "Geolocation is not supported!"});
      }
      return;
    }

    //stop any other geolocation service started before
    app.geoloc.stop();
    app.geoloc.clear();

    ////check if the lock is acquired and the accuracy is good enough
    //var accuracy = app.geoloc.getAccuracy();
    //if ((accuracy > -1) && (accuracy < this.CONF.GPS_ACCURACY_LIMIT)){
    //    _log('GEOLOC: lock is good enough (acc: ' + accuracy + ' meters).');
    //    if (onSuccess != null) {
    //        onSuccess(this.get());
    //    }
    //    return;
    //}

    this.start_time = new Date().getTime();

    // Request geolocation.
    this.id = app.geoloc.watchPosition(onUpdate, onSuccess, onError);
  };

  /**
   * Stops any currently running geolocation service.
   */
  m.stop = function () {
    navigator.geolocation.clearWatch(app.geoloc.id);
  };

  /**
   * Watches the GPS position.
   *
   * @param onUpdate
   * @param onSuccess
   * @param onError
   * @returns {Number} id of running GPS
   */
  m.watchPosition = function (onUpdate, onSuccess, onError) {
    var onGeolocSuccess = function (position) {
      //timeout
      var current_time = new Date().getTime();
      if ((current_time - app.geoloc.start_time) > app.geoloc.TIMEOUT) {
        //stop everything
        app.geoloc.stop();
        _log("GEOLOC: timeout.", app.LOG_ERROR);
        if (onError != null) {
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
      var prev_accuracy = app.geoloc.getAccuracy();
      if (prev_accuracy == -1) {
        prev_accuracy = location.acc + 1;
      }

      //only set it up if the accuracy is increased
      if (location.acc > -1 && location.acc < prev_accuracy) {
        app.geoloc.set(location.lat, location.lon, location.acc);
        if (location.acc < app.geoloc.CONF.GPS_ACCURACY_LIMIT) {
          _log("GEOLOC: finished: " + location.acc + " meters.", app.LOG_INFO);
          app.geoloc.stop();

          //save in storage
          app.settings('location', location);
          if (onSuccess != null) {
            onSuccess(location);
          }
        } else {
          _log("GEOLOC: updated acc: " + location.acc + " meters.", app.LOG_INFO);
          if (onUpdate != null) {
            onUpdate(location);
          }
        }
      }
    };

    // Callback if geolocation fails.
    var onGeolocError = function (error) {
      _log("GEOLOC: ERROR.", app.LOG_ERROR);
      if (onError != null) {
        onError({'message': error.message});
      }
    };

    // Geolocation options.
    var options = {
      enableHighAccuracy: m.CONF.HIGH_ACCURACY,
      maximumAge: 0,
      timeout: m.CONF.TIMEOUT
    };

    return navigator.geolocation.watchPosition(
      onGeolocSuccess,
      onGeolocError,
      options
    );
  };

  /**
   * Validates the current GPS lock quality.
   *
   * @returns {*}
   */
  m.valid = function () {
    var accuracy = this.getAccuracy();
    if (accuracy == -1) {
      //No GPS lock yet
      return app.ERROR;

    } else if (accuracy > this.CONF.GPS_ACCURACY_LIMIT) {
      //Geolocated with bad accuracy
      return app.FALSE;

    } else {
      //Geolocation accuracy is good enough
      return app.TRUE;
    }
  };

  return m;
})(app.geoloc || {}, app.$ || jQuery);


/***********************************************************************
 * HELPER MODULE
 *
 * Functions that were to ambiguous to be placed in one module.
 **********************************************************************/

/**
 * Gets a query parameter from the URL.
 */
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * Takes care of application execution logging.
 *
 * Uses 5 levels of logging:
 *  0: none
 *  1: errors
 *  2: warnings
 *  3: information
 *  4: debug
 *
 * Levels values defined in core app module.
 *
 * @param message
 * @param level
 * @private
 */
function _log(message, level) {

  //do nothing if logging turned off
  if (app.CONF.LOG == app.LOG_NONE) {
    return;
  }

  if (app.CONF.LOG >= level || level == null) {
    switch (level) {
      case app.LOG_ERROR:
        _logError(message);
        break;
      case app.LOG_WARNING:
        console.warn(message);
        break;
      case app.LOG_INFO:
        console.log(message);
        break;
      case app.LOG_DEBUG:
      default:
        //IE does not support console.debug
        if (console.debug == null) {
          console.log(message);
          break;
        }
        console.debug(message);
    }
  }
}

/**
 * Prints and posts an error to the mobile authentication log.
 *
 * @param error object holding a 'message', and optionally 'url' and 'line' fields.
 * @private
 */
function _logError(error) {
  //print error
  console.error(error['message'], error['url'], error['line']);

  //prepare the message
  var message = '<b style="color: red">' + error['message'] + '</b>';
  message += '</br><b> app.version = </b><i>"' + app.version + '"</i>';

  message += '</br><b> app.CONF.NAME = </b><i>"' + app.CONF.NAME + '"</i>';
  message += '</br><b> app.CONF.VERSION = </b><i>"' + app.CONF.VERSION + '"</i></br>';

  message += '</br>' + navigator.appName;
  message += '</br>' + navigator.appVersion;

  var url = error['url'] + ' (' + error['line'] + ')';

  if (navigator.onLine) {
    //send to server

    var data = {};
    data.append = function (name, value) {
      this[name] = value;
    };
    data.append('message', message);
    data.append('url', url);
    app.auth.appendApp(data);

    //removing unnecessary information
    delete data.append;

    jQuery.ajax({
      url: Drupal.settings.basePath + 'mobile/log',
      type: 'post',
      dataType: 'json',
      success: function (data) {
        console.log(data);
      },
      data: data
    });
  } else {
    //save

  }


}

/**
 * Hook into window.error function.
 *
 * @param message
 * @param url
 * @param line
 * @returns {boolean}
 * @private
 */
function _onerror(message, url, line) {
  window.onerror = null;

  var error = {
    'message': message,
    'url': url || '',
    'line': line || -1
  };

  _log(error, app.LOG_ERROR);

  window.onerror = this; // turn on error handling again
  return true; // suppress normal error reporting
}

//todo: remove if not used.
function loadScript(src) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  document.body.appendChild(script);
}

/**
 * Starts an Appcache Manifest Downloading.
 *
 * @param id
 * @param files_no
 * @param src
 * @param callback
 * @param onError
 */
function startManifestDownload(id, files_no, src, callback, onError) {
  /*todo: Add better offline handling:
   If there is a network connection, but it cannot reach any
   Internet, it will carry on loading the page, where it should stop it
   at that point.
   */
  if (navigator.onLine) {
    src = Drupal.settings.basePath + src + '?base_path=' + Drupal.settings.basePath + '&files=' + files_no;
    var frame = document.getElementById(id);
    if (frame) {
      //update
      frame.contentWindow.applicationCache.update();
    } else {
      //init
      //app.navigation.popup('<iframe id="' + id + '" src="' + src + '" width="215px" height="215px" scrolling="no" frameBorder="0"></iframe>', true);
      app.navigation.message('<iframe id="' + id + '" src="' + src + '" width="215px" height="215px" scrolling="no" frameBorder="0"></iframe>', 0);
      frame = document.getElementById(id);

      //After frame loading set up its controllers/callbacks
      frame.onload = function () {
        _log('Manifest frame loaded', app.LOG_INFO);
        if (callback != null) {
          frame.contentWindow.finished = callback;
        }

        if (onError != null) {
          frame.contentWindow.error = onError;
        }
      }
    }
  } else {
    $.mobile.loading('show', {
      text: "Looks like you are offline!",
      theme: "b",
      textVisible: true,
      textonly: true
    });
  }
}

/**
 * Initialises and returns a variable.
 *
 * @param name
 * @returns {*}
 */
function varInit(name) {
  var name_array = name.split('.');
  window[name_array[0]] = window[name_array[0]] || {};
  var variable = window[name_array[0]];

  //iterate through the namespaces
  for (var i = 1; i < name_array.length; i++) {
    if (variable[name_array[i]] !== 'object') {
      //overwrite if it is not an object
      variable[name_array[i]] = {};
    }
    variable = variable[name_array[i]];
  }
  return variable;
}

/**
 * Clones an object.
 *
 * @param obj
 * @returns {*}
 */
function objClone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = objClone(obj[attr]);
  }
  return copy;
}

/**
 * Adds Enable/Disable JQM Tab functionality
 * FROM: http://kylestechnobabble.blogspot.co.uk/2013/08/easy-way-to-enable-disable-hide-jquery.html
 * USAGE:
 * $('MyTabSelector').disableTab(0);        // Disables the first tab
 * $('MyTabSelector').disableTab(1, true);  // Disables & hides the second tab
 */
(function ($) {
  $.fn.disableTab = function (tabIndex, hide) {

    // Get the array of disabled tabs, if any
    var disabledTabs = this.tabs("option", "disabled");

    if ($.isArray(disabledTabs)) {
      var pos = $.inArray(tabIndex, disabledTabs);

      if (pos < 0) {
        disabledTabs.push(tabIndex);
      }
    }
    else {
      disabledTabs = [tabIndex];
    }

    this.tabs("option", "disabled", disabledTabs);

    if (hide === true) {
      $(this).find('li:eq(' + tabIndex + ')').addClass('ui-state-hidden');
    }

    // Enable chaining
    return this;
  };

  $.fn.enableTab = function (tabIndex) {

    // Remove the ui-state-hidden class if it exists
    $(this).find('li:eq(' + tabIndex + ')').removeClass('ui-state-hidden');

    // Use the built-in enable function
    this.tabs("enable", tabIndex);

    // Enable chaining
    return this;

  };

})(jQuery);

/***********************************************************************
 * IMAGE MODULE
 **********************************************************************/

app = app || {};
app.image = (function (m, $) {

  //todo: move to CONF.
  m.MAX_IMG_HEIGHT = 800;
  m.MAX_IMG_WIDTH = 800;

  /**
   * Returns all the images resized and stingified from an element.
   *
   * @param elem DOM element to look for files
   * @param callback function with an array parameter
   */
  m.extractAllToArray = function (elem, callback, onError) {
    var files = app.image.findAll(elem);
    if (files.length > 0) {
      app.image.toStringAll(files, callback, onError);
    } else {
      callback(files);
    }
  };

  /**
   * Transforms and resizes an image file into a string and saves it in the storage.
   *
   * @param key
   * @param file
   * @param onSaveSuccess
   * @returns {number}
   */
  m.toString = function (file, onSaveSuccess, onError) {
    if (file != null) {
      _log("IMAGE: working with " + file.name + ".", app.LOG_DEBUG);

      var reader = new FileReader();
      //#2
      reader.onload = function () {
        _log("IMAGE: resizing file.", app.LOG_DEBUG);
        var image = new Image();
        //#4
        image.onload = function (e) {
          var width = image.width;
          var height = image.height;

          //resizing
          var res;
          if (width > height) {
            res = width / app.image.MAX_IMG_WIDTH;
          } else {
            res = height / app.image.MAX_IMG_HEIGHT;
          }

          width = width / res;
          height = height / res;

          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          var imgContext = canvas.getContext('2d');
          imgContext.drawImage(image, 0, 0, width, height);

          var shrinked = canvas.toDataURL(file.type);

          _log("IMAGE: done shrinking file ("
          + (shrinked.length / 1024) + "KB).", app.LOG_DEBUG);

          onSaveSuccess(shrinked);

        };
        reader.onerror = function (e) {
          _log("IMAGE: reader " + e + ".", app.LOG_ERROR);
          e.message = e.getMessage();
          onError(e);
        };

        //#3
        image.src = reader.result;
      };
      //1#
      reader.readAsDataURL(file);
    }
  };

  /**
   * Saves all the files. Uses recursion.
   *
   * @param files An array of files to be saved
   * @param onSaveAllFilesSuccess
   */
  m.toStringAll = function (files, onSaveAllFilesSuccess, onError) {
    //recursive calling to save all the images
    saveAllFilesRecursive(files, null);
    function saveAllFilesRecursive(files, files_array) {
      files_array = files_array || [];

      //recursive files saving
      if (files.length > 0) {
        var file_info = files.pop();
        //get next file in file array
        var file = file_info['file'];
        var name = file_info['input_field_name'];

        //recursive saving of the files
        var onSaveSuccess = function (file) {
          files_array.push({
            "name": name,
            "value": file,
            "type": 'file'
          });
          saveAllFilesRecursive(files, files_array, onSaveSuccess);
        };
        app.image.toString(file, onSaveSuccess, onError);
      } else {
        onSaveAllFilesSuccess(files_array);
      }
    }
  };

  /**
   * Extracts all files from the page inputs having data-form attribute.
   */
  m.findAll = function (elem) {
    if (elem == null) {
      elem = $(document);
    }

    var files = [];
    $(elem).find('input').each(function (index, input) {
      if ($(input).attr('type') == "file" && input.files.length > 0) {
        var file = app.image.find(input);
        files.push(file);
      }
    });
    return files;
  };

  /**
   * Returns a file object with its name.
   *
   * @param inputId The file input Id
   * @returns {{file: *, input_field_name: *}}
   */
  m.find = function (input) {
    var file = {
      'file': input.files[0],
      'input_field_name': input.attributes.name.value
    };
    return file;
  };

  return m;
}(app.image || {}, jQuery));



/***********************************************************************
 * IO MODULE
 **********************************************************************/

app = app || {};
app.io = (function (m, $) {
  //configuration should be setup in app config file
  m.CONF = {
    RECORD_URL: "" //todo: set to null and throw error if undefined
  };

  /**
   * Sending all saved records.
   *
   * @returns {undefined}
   */
  m.sendAllSavedRecords = function () {
    if (navigator.onLine) {
      function onSuccess() {
        //todo
        var key = Object.keys(records)[0]; //getting the first one of the array
        if (key != null) {
          $.mobile.loading('show');
          _log("IO: sending record: " + key + ".", app.LOG_INFO);
          var onSendSavedSuccess = function (data) {
            var recordKey = this.callback_data.recordKey;
            _log("IO: record ajax (success): " + recordKey + ".", app.LOG_INFO);

            app.record.db.remove(recordKey);
            app.io.sendAllSavedRecords();
          };
          m.sendSavedRecord(key, onSendSavedSuccess);
        } else {
          $.mobile.loading('hide');
        }
      }

      app.record.db.getAll(onSuccess);
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
  };

  /**
   * Sends the saved record
   */
  m.sendSavedRecord = function (recordKey, callback, onError, onSend) {
    _log("IO: creating the record.", app.LOG_DEBUG);
    function onSuccess(data) {
      var record = {
        'data': data,
        'recordKey': recordKey
      };

      function onPostError(xhr, ajaxOptions, thrownError) {
        _log("IO: ERROR record ajax (" + xhr.status + " " + thrownError + ").", app.LOG_ERROR);
        //_log(xhr.responseText);
        var err = {
          message: xhr.status + " " + thrownError + " " + xhr.responseText
        };

        onError(err);
      }

      m.postRecord(record, callback, onPostError, onSend)
    }

    app.record.db.getData(recordKey, onSuccess);

  };

  /**
   * Submits the record.
   */
  m.postRecord = function (record, onSuccess, onError, onSend) {
    _log('IO: posting a record with AJAX.', app.LOG_INFO);
    var data = {};
    if (record.data == null) {
      //extract the record data
      form = document.getElementById(record.id);
      data = new FormData(form);
    } else {
      data = record.data;
    }

    //Add authentication
    data = app.auth.append(data);

    $.ajax({
      url: m.getRecordURL(),
      type: 'POST',
      data: data,
      callback_data: record,
      cache: false,
      enctype: 'multipart/form-data',
      processData: false,
      contentType: false,
      success: onSuccess || function (data) {
        var recordKey = this.callback_data.recordKey;
        _log("IO: record ajax (success): " + recordKey + ".", app.LOG_INFO);
      },
      error: onError || function (xhr, ajaxOptions, thrownError) {
        _log("IO: record ajax (" + xhr.status + " " + thrownError + ").", app.LOG_ERROR);
        //_log(xhr.responseText);
      },
      beforeSend: onSend || function () {
        _log("IO: onSend.", app.LOG_DEBUG);
      }
    });
  };

  /**
   * Returns App main record Path.
   *
   * @returns {*}
   */
  m.getRecordURL = function () {
    return Drupal.settings.basePath + m.CONF.RECORD_URL;
  };

  return m;
}(app.io || {}, jQuery));

/***********************************************************************
 * NAVIGATION MODULE
 **********************************************************************/

app = app || {};
app.navigation = (function (m, $) {

  /**
   * Updates the dialog box appended to the page
   * todo: remove hardcoded dialog ID
   */
  m.makeDialog = function (text) {
    $('#app-dialog-content').empty().append(text);
  };

  /**
   * Created a popup.
   * todo: remove hardcoded popup ID
   *
   * @param text
   * @param addClose
   */
  m.popup = function (text, addClose) {
    this.makePopup(text, addClose);
    $('#app-popup').popup();
    $('#app-popup').popup('open').trigger('create');
  };

  /**
   * Updates the popup div appended to the page
   */
  m.makePopup = function (text, addClose) {
    var PADDING_WIDTH = 10;
    var PADDING_HEIGHT = 20;
    var CLOSE_KEY = "<a href='#' data-rel='back' data-role='button '" +
      "data-theme='b' data-icon='delete' data-iconpos='notext '" +
      "class='ui-btn-right ui-link ui-btn ui-btn-b ui-icon-delete " +
      "ui-btn-icon-notext ui-shadow ui-corner-all '" +
      "role='button'>Close</a>";

    if (addClose) {
      text = CLOSE_KEY + text;
    }

    if (PADDING_WIDTH > 0 || PADDING_HEIGHT > 0) {
      text = "<div style='padding:" + PADDING_WIDTH + "px " + PADDING_HEIGHT + "px;'>" +
      text + "<div>";
    }

    $('#app-popup').empty().append(text);
  };

  /**
   * Closes a popup.
   * todo: remove hardcoded popup ID
   */
  m.closePopup = function () {
    $('#app-popup').popup("close");
  };

  /**
   * Creates a loader
   */
  m.makeLoader = function (text, time) {
    //clear previous loader
    $.mobile.loading('hide');

    //display new one
    $.mobile.loading('show', {
      theme: "b",
      html: "<div style='padding:5px 5px;'>" + text + "</div>",
      textVisible: true,
      textonly: true
    });

    setTimeout(function () {
      $.mobile.loading('hide');
    }, time);
  };

  /**
   * Displays a self disappearing lightweight message.
   *
   * @param text
   * @param time 0 if no hiding, null gives default 3000ms delay
   */
  m.message = function (text, time) {
    if (text == null) {
      _log('NAVIGATION: no text provided to message.', app.LOG_ERROR);
      return;
    }

    var messageId = 'appLoaderMessage';

    text = '<div id="' + messageId + '">' + text + '</div>';

    $.mobile.loading('show', {
      theme: "b",
      textVisible: true,
      textonly: true,
      html: text
    });

    //trigger JQM beauty
    $('#' + messageId).trigger('create');

    if (time != 0) {
      setTimeout(function () {
        $.mobile.loading('hide');
      }, time || 3000);
    }
  };

  /**
   * Opens particular app page-path.
   *
   * @param delay
   * @param path If no path supplied goes to app.PATH
   */
  m.go = function (delay, path) {
    setTimeout(function () {
      path = (path == undefined) ? "" : path;
      window.location = Drupal.settings.basePath + app.CONF.HOME + path;
    }, delay);
  };

  /**
   * Opens the app home page.
   */
  //todo: clean setting of the timeout and hardcoded '/form'
  m.goRecord = function (delay) {
    setTimeout(function () {
      $.mobile.changePage(Drupal.settings.mobileIformStartPath + '/form');
    }, delay);
  };

  return m;
}(app.navigation || {}, app.$ || jQuery));

/***********************************************************************
 * RECORD.DB MODULE
 *
 * Takes care of the record database functionality.
 **********************************************************************/

app = app || {};
app.record = app.record || {};

app.record.db = (function (m, $) {
  //todo: move to CONF.
  m.RECORDS = "records";

  m.DB_VERSION = 5;
  m.DB_MAIN = "app";
  m.STORE_RECORDS = "records";

  /**
   * Opens a database connection and returns a records store.
   *
   * @param name
   * @param storeName
   * @param callback
   */
  m.open = function (callback, onError) {
    var req = window.indexedDB.open(m.DB_MAIN, m.DB_VERSION);

    /**
     * On Database opening success, returns the Records object store.
     *
     * @param e
     */
    req.onsuccess = function (e) {
      _log("RECORD.DB: opened successfully.", app.LOG_DEBUG);
      var db = e.target.result;
      var transaction = db.transaction([m.STORE_RECORDS], "readwrite");
      var store = transaction.objectStore(m.STORE_RECORDS);

      if (callback != null) {
        callback(store);
      }
    };

    /**
     * If the Database needs an upgrade or is initialising.
     *
     * @param e
     */
    req.onupgradeneeded = function (e) {
      _log("RECORD.DB: upgrading", app.LOG_INFO);
      var db = e.target.result;

      var store = db.createObjectStore(m.STORE_RECORDS, {'keyPath': 'id'});
      store.createIndex('id', 'id', {unique: true});
    };

    /**
     * Error of opening the database.
     *
     * @param e
     */
    req.onerror = function (e) {
      _log("RECORD.DB: not opened successfully.", app.LOG_ERROR);
      // _log(e);
      e.message = "Database NOT opened successfully.";
      if (onError != null) {
        onError(e);
      }
    };

    /**
     * Error on database being blocked.
     *
     * @param e
     */
    req.onblocked = function (e) {
      _log("RECORD.DB: database blocked.", app.LOG_ERROR);
      // _log(e);
      if (onError != null) {
        onError(e);
      }
    }

  };

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
  m.add = function (record, key, callback, onError) {
    m.open(function (store) {
      _log("RECORD.DB: adding to the store.", app.LOG_DEBUG);
      record['id'] = key;
      var req = store.add(record);
      req.onsuccess = function (event) {
        if (callback != null) {
          callback();
        }
      };
      store.transaction.db.close();
    }, onError);
  };

  /**
   * Gets a specific saved record from the database.
   * @param recordKey The stored record Id.
   * @returns {*}
   */
  m.get = function (key, callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: getting from the store.', app.LOG_DEBUG);

      var req = store.index('id').get(key);
      req.onsuccess = function (e) {
        var result = e.target.result;

        if (callback != null) {
          callback(result);
        }
      };

    }, onError);
  };

  /**
   * Removes a saved record from the database.
   *
   * @param recordKey
   */
  m.remove = function (key, callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: removing from the store.', app.LOG_DEBUG);

      var req = store.openCursor(IDBKeyRange.only(key));
      req.onsuccess = function () {
        var cursor = req.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          if (callback != null) {
            callback();
          }
        }
      }

    }, onError);
  };

  /**
   * Brings back all saved records from the database.
   */
  m.getAll = function (callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: getting all from the store.', app.LOG_DEBUG);

      // Get everything in the store
      var keyRange = IDBKeyRange.lowerBound(0);
      var req = store.openCursor(keyRange);

      var data = [];
      req.onsuccess = function (e) {
        var result = e.target.result;

        // If there's data, add it to array
        if (result) {
          data.push(result.value);
          result.continue();

          // Reach the end of the data
        } else {
          if (callback != null) {
            callback(data);
          }
        }
      };

    }, onError);
  };

  /**
   * Checks whether the record under a provided key exists in the database.
   *
   * @param key
   * @param callback
   * @param onError
   */
  m.is = function (key, callback, onError) {
    function onSuccess(data) {
      if ($.isPlainObject(data)) {
        if (callback != null) {
          callback(!$.isEmptyObject(data));
        }
      } else {
        if (callback != null) {
          callback(data != null);
        }
      }
    }

    this.get(key, onSuccess, onError);
  };

  /**
   * Clears all the saved records.
   */
  m.clear = function (callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: clearing store.', app.LOG_DEBUG);
      store.clear();

      if (callback != null) {
        callback(data);
      }
    }, onError);
  };

  /**
   * Returns a specific saved record in FormData format.
   *
   * @param recordKey
   * @returns {FormData}
   */
  m.getData = function (recordKey, callback, onError) {
    function onSuccess(savedRecord) {
      var data = new FormData();

      for (var k = 0; k < savedRecord.length; k++) {
        if (savedRecord[k].type == "file") {
          var file = savedRecord[k].value;
          var type = file.split(";")[0].split(":")[1];
          var extension = type.split("/")[1];
          data.append(savedRecord[k].name, dataURItoBlob(file, type), "pic." + extension);
        } else {
          var name = savedRecord[k].name;
          var value = savedRecord[k].value;
          data.append(name, value);
        }
      }
      callback(data);
    }

    //Extract data from database
    var savedRecord = this.get(recordKey, onSuccess, onError);
  };

  /**
   * Saves a record using dynamic inputs.
   */
  m.save = function (callback, onError) {
    _log("RECORD.DB: saving dynamic record.", app.LOG_INFO);
    //get new record ID
    var settings = app.record.getSettings();
    var savedRecordId = ++settings[app.record.LASTID];

    //INPUTS
    var onExtractFilesSuccess = function (files_array) {
      var record_array = app.record.extract();
      //merge files and the rest of the inputs
      record_array = record_array.concat(files_array);

      _log("RECORD.DB: saving the record into database.", app.LOG_DEBUG);
      function onSuccess() {
        //on record save success
        app.record.setSettings(settings);

        if (callback != null) {
          callback(savedRecordId);
        }
      }

      m.add(record_array, savedRecordId, onSuccess, onError);
    };

    app.image.extractAllToArray(null, onExtractFilesSuccess, onError);
    return app.TRUE;
  };

  /*
   * Saves the provided record.
   * Returns the savedRecordId of the saved record, otherwise an app.ERROR.
   */
  m.saveForm = function (formId, onSuccess) {
    _log("RECORD.DB: saving a DOM record.", app.LOG_INFO);
    var records = this.getAll();

    //get new record ID
    var settings = app.record.getSettings();
    var savedRecordId = ++settings[app.record.LASTID];

    //INPUTS
    //todo: refactor to $record
    var record = $(formId);
    var onSaveAllFilesSuccess = function (files_array) {
      //get all the inputs/selects/textboxes into array
      var record_array = app.record.extractFromRecord(record);

      //merge files and the rest of the inputs
      record_array = record_array.concat(files_array);

      _log("RECORD.DB: saving the record into database.", app.LOG_DEBUG);
      try {
        records[savedRecordId] = record_array;
        m.setAll(records);
        app.record.setSettings(settings);
      } catch (e) {
        _log("RECORD.DB: while saving the record.", app.LOG_ERROR);
        //_log(e);
        return app.ERROR;
      }

      if (onSuccess != null) {
        onSuccess(savedRecordId);
      }
    };

    app.image.getAll(onSaveAllFilesSuccess);
    return app.TRUE;
  };

  return m;
}(app.record.db || {}, app.$ || jQuery));

/***********************************************************************
 * RECORD.INPUTS MODULE
 *
 * Object responsible for record input management.
 **********************************************************************/

app = app || {};
app.record = app.record || {};

app.record.inputs = (function (m, $) {
  //todo: move KEYS to CONF.
  m.KEYS = {
    'SREF': 'sample:entered_sref',
    'SREF_SYSTEM': 'sample:entered_sref_system',
    'SREF_ACCURACY': 'smpAttr:273',
    'TAXON': 'occurrence:taxa_taxon_list_id',
    'DATE': 'sample:date'
  };

  /**
   * Sets an input in the current record.
   *
   * @param item Input name
   * @param data Input value
   */
  m.set = function (item, data) {
    var record = app.record.get();
    record[item] = data;
    app.record.set(record);
  };

  /**
   * Returns an input value from the current record.
   *
   * @param item The Input name
   * @returns {*} null if the item does not exist
   */
  m.get = function (item) {
    var record = app.record.get();
    return record[item];
  };

  /**
   * Removes an input from the current record.
   *
   * @param item Input name
   */
  m.remove = function (item) {
    var record = app.record.get();
    delete record[item];
    app.record.set(record);
  };

  /**
   * Checks if the input is setup.
   *
   * @param item Input name
   * @returns {boolean}
   */
  m.is = function (item) {
    var val = this.get(item);
    if ($.isPlainObject(val)) {
      return !$.isEmptyObject(val);
    } else {
      return val != null;
    }
  };

  return m;
}(app.record.inputs || {}, app.$ || jQuery));

/***********************************************************************
 * RECORD MODULE
 *
 * Things to work on:
 *  - Validation should be moved to the app controllers level.
 **********************************************************************/

app = app || {};
app.record = (function (m, $) {

  //CONSTANTS
  //todo: add _KEY to each constant name to distinguish all KEYS
  m.RECORD = "record"; //name under which the record is stored
  m.MULTIPLE_GROUP_KEY = "multiple_"; //to separate a grouped input
  m.COUNT = "record_count";
  m.STORAGE = "record_";
  m.PIC = "_pic_";
  m.DATA = "data";
  m.FILES = "files";
  m.SETTINGS = "recordSettings";
  m.LASTID = "lastId";

  //GLOBALS
  m.totalFiles = 0;

  /**
   * Initialises the recording environment.
   *
   * @returns {*}
   */
  m.init = function () {
    var settings = m.getSettings();
    if (settings == null) {
      settings = {};
      settings[m.LASTID] = 0;
      m.setSettings(settings);
      return settings;
    }
    return null;
  };

  /**
   * Record settings. A separate DOM storage unit for storing
   * recording specific data.
   * Note: in the future, if apart of LastFormId no other uses arises
   * should be merged with default app.settings.
   *
   * @param settings
   */
  m.setSettings = function (settings) {
    app.storage.set(m.SETTINGS, settings);
  };

  /**
   * Initializes and returns the settings.
   *
   * @returns {{}}
   */
  m.initSettings = function () {
    var settings = {};
    settings[m.LASTID] = 0;
    m.setSettings(settings);
    return settings;
  };

  /**
   * Returns the settings.
   *
   * @returns {*|{}}
   */
  m.getSettings = function () {
    var settings = app.storage.get(m.SETTINGS) || m.initSettings();
    return settings;
  };

  /**
   * Returns the current record.
   *
   * @returns {*}
   */
  m.get = function () {
    return app.storage.tmpGet(m.RECORD) || {};
  };

  /**
   * Sets the current record.
   *
   * @param record The currenr record to be stored.
   */
  m.set = function (record) {
    app.storage.tmpSet(m.RECORD, record);
  };

  /**
   * Clears the current record.
   */
  m.clear = function () {
    app.storage.tmpRemove(m.RECORD);
  };

  /**
   * TODO: this and validator() functions need refactoring.
   *
   * @param recordId
   */
  m.addValidator = function (recordId) {
    //todo: refactor to $validator
    var validator = $(recordId).validate({
      ignore: ":hidden,.inactive",
      errorClass: "inline-error",
      errorElement: 'p',
      highlight: function (element, errorClass) {
        //todo: refactor to $jqElement
        var jqElement = $(element);
        if (jqElement.is(':radio') || jqElement.is(':checkbox')) {
          //if the element is a radio or checkbox group then highlight the group
          var jqBox = jqElement.parents('.control-box');
          if (jqBox.length !== 0) {
            jqBox.eq(0).addClass('ui-state-error');
          } else {
            jqElement.addClass('ui-state-error');
          }
        } else {
          jqElement.addClass('ui-state-error');
        }
      },
      unhighlight: function (element, errorClass) {
        //todo: refactor to $jqElement
        var jqElement = $(element);
        if (jqElement.is(':radio') || jqElement.is(':checkbox')) {
          //if the element is a radio or checkbox group then highlight the group
          var jqBox = jqElement.parents('.control-box');
          if (jqBox.length !== 0) {
            jqBox.eq(0).removeClass('ui-state-error');
          } else {
            jqElement.removeClass('ui-state-error');
          }
        } else {
          jqElement.removeClass('ui-state-error');
        }
      },
      invalidHandler: function (record, validator) {
        var tabselected = false;
        jQuery.each(validator.errorMap, function (ctrlId, error) {
          // select the tab containing the first error control
          var ctrl = jQuery('[name=' + ctrlId.replace(/:/g, '\\:').replace(/\[/g, '\\[').replace(/\]/g, '\\]') + ']');
          if (!tabselected) {
            var tp = ctrl.filter('input,select,textarea').closest('.ui-tabs-panel');
            if (tp.length === 1) {
              $(tp).parent().tabs('select', tp.id);
            }
            tabselected = true;
          }
          ctrl.parents('fieldset').removeClass('collapsed');
          ctrl.parents('.fieldset-wrapper').show();
        });
      },
      messages: [],
      errorPlacement: function (error, element) {
        var jqBox, nexts;
        if (element.is(':radio') || element.is(':checkbox')) {
          jqBox = element.parents('.control-box');
          element = jqBox.length === 0 ? element : jqBox;
        }
        nexts = element.nextAll(':visible');
        element = nexts && $(nexts[0]).hasClass('deh-required') ? nexts[0] : element;
        error.insertAfter(element);
      }
    });
    //Don't validate whilst user is still typing in field
    //validator.settings.onkeyup = false;
  };

  /**
   * Record validation.
   */
  m.validate = function (recordId) {
    var invalids = [];

    //todo: refactor to $tabinputs
    var tabinputs = $('#' + recordId).find('input,select,textarea').not(':disabled,[name=],.scTaxonCell,.inactive');
    if (tabinputs.length > 0) {
      tabinputs.each(function (index) {
        if (!$(this).valid()) {
          var found = false;

          //this is necessary to check if there was an input with
          //the same name in the invalids array, if found it means
          //this new invalid input belongs to the same group and should
          //be ignored.
          for (var i = 0; i < invalids.length; i++) {
            if (invalids[i].name == (app.record.MULTIPLE_GROUP_KEY + this.name)) {
              found = true;
              break;
            }
            if (invalids[i].name == this.name) {
              var new_id = (this.id).substr(0, this.id.lastIndexOf(':'));
              invalids[i].name = app.record.MULTIPLE_GROUP_KEY + this.name;
              invalids[i].id = new_id;
              found = true;
              break;
            }
          }
          //save the input as a invalid
          if (!found)
            invalids.push({"name": this.name, "id": this.id});
        }
      });
    }

    //todo: refactor to $tabtaxoninputs
    var tabtaxoninputs = $('#entry_record .scTaxonCell').find('input,select').not(':disabled');
    if (tabtaxoninputs.length > 0) {
      tabtaxoninputs.each(function (index) {
        invalids.push({"name": this.name, "id": this.id});
      });
    }

    //constructing a response about invalid fields to the user
    if (invalids.length > 0) {
      return invalids;
    }
    return [];
  };

  /**
   * Returns a recording record array from stored inputs.
   */
  m.extract = function () {
    //extract record data
    var record_array = [];
    var inputName, inputValue;

    var record = app.record.get();
    if (record == null) {
      return record_array;
    }
    var inputs = Object.keys(record);
    for (var inputNum = 0; inputNum < inputs.length; inputNum++) {
      inputName = inputs[inputNum];
      inputValue = record[inputName];
      record_array.push({
        "name": inputName,
        "value": inputValue
      });
    }

    return record_array;
  };

  /**
   * Extracts data (apart from files) from provided record into a record_array that it returns.
   *
   * @param record
   * @returns {Array}
   */
  m.extractFromRecord = function (record) {
    //extract record data
    var record_array = [];
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
          _log("RECORD: unknown input type: " + type + '.', app.LOG_ERROR);
          break;
      }

      if (needed) {
        if (value != "") {
          record_array.push({
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

      if (value != "") {
        record_array.push({
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

      if (value != "") {
        record_array.push({
          "name": name,
          "value": value,
          "type": type
        });
      }
    });

    return record_array;
  };

  return m;
}(app.record || {}, app.$ || jQuery));

/***********************************************************************
 * STORAGE MODULE
 **********************************************************************/

app = app || {};
app.storage = (function (m, $) {
  /**
   * Checks if there is enough space in the storage.
   *
   * @param size
   * @returns {*}
   */
  m.hasSpace = function (size) {
    return localStorageHasSpace(size);
  };

  /**
   * Gets an item from the storage.
   *
   * @param item
   */
  m.get = function (item) {
    item = app.CONF.NAME + '_' + item;

    var data = localStorage.getItem(item);
    data = JSON.parse(data);
    return data;
  };

  /**
   * Sets an item in the storage.
   * Note: it overrides any existing item with the same name.
   *
   * @param item
   */
  m.set = function (item, data) {
    item = app.CONF.NAME + '_' + item;

    data = JSON.stringify(data);
    return localStorage.setItem(item, data);
  };

  /**
   * Removes the item from the storage.
   *
   * @param item
   */
  m.remove = function (item) {
    item = app.CONF.NAME + '_' + item;

    return localStorage.removeItem(item);
  };

  /**
   * Checks if the item exists.
   *
   * @param item Input name
   * @returns {boolean}
   */
  m.is = function (item) {
    var val = this.get(item);
    if ($.isPlainObject(val)) {
      return !$.isEmptyObject(val);
    } else {
      return val != null;
    }
  };

  /**
   * Clears the storage.
   */
  m.clear = function () {
    _log('STORAGE: clearing', app.LOG_DEBUG);

    localStorage.clear();
  };

  /**
   * Returns the item from the temporary storage.
   *
   * @param item
   */
  m.tmpGet = function (item) {
    item = app.CONF.NAME + '_' + item;

    var data = sessionStorage.getItem(item);
    data = JSON.parse(data);
    return data;
  };

  /**
   * Sets an item in temporary storage.
   *
   * @param item
   */
  m.tmpSet = function (item, data) {
    item = app.CONF.NAME + '_' + item;

    data = JSON.stringify(data);
    return sessionStorage.setItem(item, data);
  };

  /**
   * Removes an item in temporary storage.
   *
   * @param item
   */
  m.tmpRemove = function (item) {
    item = app.CONF.NAME + '_' + item;

    return sessionStorage.removeItem(item);
  };

  /**
   * Checks if the temporary item exists.
   *
   * @param item Input name
   * @returns {boolean}
   */
  m.tmpIs = function (item) {
    var val = this.tmpGet(item);
    if ($.isPlainObject(val)) {
      return !$.isEmptyObject(val);
    } else {
      return val != null;
    }
  };

  /**
   * Clears the temporary storage.
   */
  m.tmpClear = function () {
    _log('STORAGE: clearing temporary', app.LOG_DEBUG);

    sessionStorage.clear();
  };

  /**
   * Checks if it is possible to store some sized data in localStorage.
   */
  function localStorageHasSpace(size) {
    var taken = JSON.stringify(localStorage).length;
    var left = 1024 * 1024 * 5 - taken;
    if ((left - size) > 0)
      return 1;
    else
      return 0;
  }

  return m;
}(app.storage || {}, jQuery));



/*##############
 ## HELPER  ####
  //todo: should find a better place for this.
 ##############*/

/**
 * Converts DataURI object to a Blob.
 *
 * @param {type} form_count
 * @param {type} pic_count
 * @param {type} file
 * @returns {undefined}
 */
function dataURItoBlob(dataURI, file_type) {
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: file_type
  });
}