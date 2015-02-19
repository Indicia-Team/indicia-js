/*!
 * Mobile Recording Library for biological data collection. 
 * Version: 2.3.0
 *
 * https://github.com/NERC-CEH/morel
 *
 * Author 2015 Karols Kazlauskis
 * Released under the GNU GPL v3 * license.
 */
/***********************************************************************
 * MAIN
 *
 * Things to work on:
 *  - Decouple the modules as much as possible
 *  - Close as many global variables
 **********************************************************************/

/*global _log*/
var morel = (function () {
  "use strict";

  var m = {};
  m.version = '2.3.0'; //library version, generated/replaced by grunt

  //configuration should be setup in morel config file
  m.CONF = {
    HOME: "",
    NAME: "", //todo: set to null to force an application name
    LOG: m.LOG_ERROR
  };

  //CONSTANTS:
  m.TRUE = 1;
  m.FALSE = 0;
  m.ERROR = -1;

  m.SETTINGS = 'morel-settings';

  //levels of morel logging
  m.LOG_NONE = 0;
  m.LOG_ERROR = 1;
  m.LOG_WARNING = 2;
  m.LOG_INFO = 3;
  m.LOG_DEBUG = 4;

  /**
   * Extends the morel library with the provided namespace and its object.
   *
   * @param name
   * @param obj
   * @returns {*|{}}
   */
  m.extend = function (name, obj) {
    var nameArray = name.split('.');
    var variable = m[nameArray[0]] = m[nameArray[0]] || {};

    //iterate through the namespaces
    for (var i = 1; i < nameArray.length; i++) {
      if (variable[nameArray[i]] !== 'object') {
        //overwrite if it is not an object
        variable[nameArray[i]] = {};
      }
      variable = variable[nameArray[i]];
    }
    //if a function than initialize it otherwise assign an object
    variable = typeof(obj) === "function" ? obj(variable) : obj || {};
    return variable;
  };

  /**
   * Initialises the application settings.
   */
  m.initSettings = function () {
    morel.storage.set(m.SETTINGS, {});
  };

  /**
   * Sets an app setting.
   *
   * @param item
   * @param data
   * @returns {*}
   */
  m.settings = function (item, data) {
    var settings = morel.storage.get(m.SETTINGS);
    if (!settings) {
      morel.initSettings();
      settings = morel.storage.get(m.SETTINGS);
    }

    if (data) {
      settings[item] = data;
      return morel.storage.set(m.SETTINGS, settings);
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
    morel.storage.clear();
    morel.storage.tmpClear();

    //morel.db.clear();
    morel.record.db.clear();
  };

  return m;
})(); //END

/***********************************************************************
 * IO MODULE
 **********************************************************************/

/* global morel, _log */
morel.extend('io', function (m) {
  "use strict";

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
    var onSuccess = null;
    if (navigator.onLine) {
      onSuccess = function (records) {
        //todo
        var record = records[0]; //getting the first one of the array
        if (record) {
          var id = record.id
          $.mobile.loading('show');
          _log("IO: sending record: " + id + ".", morel.LOG_INFO);
          var onSendSavedSuccess = function (data) {
            var recordKey = this.callback_data.recordKey;
            _log("IO: record ajax (success): " + recordKey + ".", morel.LOG_INFO);

            morel.record.db.remove(recordKey);
            morel.io.sendAllSavedRecords();
          };
          m.sendSavedRecord(id, onSendSavedSuccess);
        } else {
          $.mobile.loading('hide');
        }
      };

      morel.record.db.getAll(onSuccess);
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
   *
   * @param recordKey
   * @param callback
   * @param onError
   * @param onSend
   */
  m.sendSavedRecord = function (recordKey, callback, onError, onSend) {
    _log("IO: creating the record.", morel.LOG_DEBUG);
    function onSuccess(data) {
      var record = {
        'data': data,
        'recordKey': recordKey
      };
      function onPostError(xhr, ajaxOptions, thrownError) {
        _log("IO: ERROR record ajax (" + xhr.status + " " + thrownError + ").", morel.LOG_ERROR);
        //_log(xhr.responseText);
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
      m.postRecord(record, callback, onPostError, onSend);
    }
    morel.record.db.getData(recordKey, onSuccess);
  };

  /**
   * Submits the record.
   */
  m.postRecord = function (record, onSuccess, onError, onSend) {
    _log('IO: posting a record with AJAX.', morel.LOG_INFO);
    var data = {};
    if (!record.data) {
      //extract the record data
      var form = document.getElementById(record.id);
      data = new FormData(form);
    } else {
      data = record.data;
    }

    //Add authentication
    data = morel.auth.append(data);

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
        _log("IO: record ajax (success): " + recordKey + ".", morel.LOG_INFO);
      },
      error: onError || function (xhr, ajaxOptions, thrownError) {
        _log("IO: record ajax (" + xhr.status + " " + thrownError + ").", morel.LOG_ERROR);
        //_log(xhr.responseText);
      },
      beforeSend: onSend || function () {
        _log("IO: onSend.", morel.LOG_DEBUG);
      }
    });
  };

  /**
   * Returns App main record Path.
   *
   * @param basePath
   * @returns {*}
   */
  m.getRecordURL = function (basePath) {
    return m.CONF.RECORD_URL;
  };

  return m;
});

/***********************************************************************
 * DB MODULE
 *
 * Module responsible for large data management.
 **********************************************************************/

/* global morel */
morel.extend('db', function (m) {
  "use strict";
  /*global _log, IDBKeyRange*/

  //todo: move to CONF.
  m.DB_VERSION = 1;
  m.DB_MAIN = "morel";
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
      _log("DB: opened successfully.", morel.LOG_DEBUG);
      var db = e.target.result;
      var transaction = db.transaction([storeName], "readwrite");
      var store = transaction.objectStore(storeName);

      if (callback) {
        callback(store);
      }
    };

    req.onupgradeneeded = function (e) {
      _log("DB: upgrading.", morel.LOG_INFO);
      var db = e.target.result;

      db.deleteObjectStore(morel.db.STORE_MAIN);
      db.createObjectStore(morel.db.STORE_MAIN);
    };

    req.onerror = function (e) {
      _log("DB: NOT opened successfully:" + e, morel.LOG_ERROR);
    };

    req.onblocked = function (e) {
      _log("DB: database blocked:" + e, morel.LOG_ERROR);
    };
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
      _log("DB: adding to the store.", morel.LOG_DEBUG);

      store.add(record, key);
      store.transaction.db.close();

      if (callback) {
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
      _log('DB: getting from the store.', morel.LOG_DEBUG);

      var result = store.get(key);
      if (callback) {
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
      _log('DB: getting all from the store.', morel.LOG_DEBUG);

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
          if (callback) {
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
      _log('DB: clearing store', morel.LOG_DEBUG);
      store.clear();

      if (callback) {
        callback();
      }
    });
  };

  return m;
});

/***********************************************************************
 * AUTH MODULE
 **********************************************************************/

/* global morel */
morel.extend('auth', function (m) {
  "use strict";

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
    if (m.isUser()) {
      var user = m.getUser();

      data.append('email', user.email);
      data.append('password', user.password);
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
    var obj = m.getUser();
    return Object.keys(obj).length !== 0;
  };

  /**
   * Brings the user details from the storage.
   *
   * @returns {Object|*}
   */
  m.getUser = function () {
    return morel.settings(m.USER);
  };

  /**
   * Saves the authenticated user details to the storage.
   *
   * @param user A user object
   */
  m.setUser = function (user) {
    morel.settings(m.USER, user);
  };

  /**
   * Removes the current user details from the storage.
   */
  m.removeUser = function () {
    morel.settings(m.USER, {});
  };

  return m;
});



/***********************************************************************
 * RECORD MODULE
 *
 * Things to work on:
 *  - Validation should be moved to the app controllers level.
 **********************************************************************/

/* global morel, _log */
morel.extend('record', function (m) {
  "use strict";

  //CONSTANTS
  //todo: add _KEY to each constant name to distinguish all KEYS
  m.RECORD = "record"; //name under which the record is stored
  m.MULTIPLE_GROUP_KEY = "multiple_"; //to separate a grouped input
  m.COUNT = "record_count";
  m.STORAGE = "record_";
  m.PIC = "_pic_";
  m.DATA = "data";
  m.FILES = "files";
  m.SETTINGS = "morel";
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
    if (!settings) {
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
   * should be merged with default morel.settings.
   *
   * @param settings
   */
  m.setSettings = function (settings) {
    morel.storage.set(m.SETTINGS, settings);
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
    var settings = morel.storage.get(m.SETTINGS) || m.initSettings();
    return settings;
  };

  /**
   * Returns the current record.
   *
   * @returns {*}
   */
  m.get = function () {
    return morel.storage.tmpGet(m.RECORD) || {};
  };

  /**
   * Sets the current record.
   *
   * @param record The current record to be stored.
   */
  m.set = function (record) {
    morel.storage.tmpSet(m.RECORD, record);
  };

  /**
   * Clears the current record.
   */
  m.clear = function () {
    morel.storage.tmpRemove(m.RECORD);
  };

  /**
   * Extracts data (apart from files) from provided record into a record_array that it returns.
   *
   * @param record
   * @returns {Array}
   */
  m.extractFromRecord = function (record) {
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
          _log("RECORD: unknown input type: " + type + '.', morel.LOG_ERROR);
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
  };

  return m;
});

/***********************************************************************
 * RECORD.DB MODULE
 *
 * Takes care of the record database functionality.
 **********************************************************************/

/* global morel, _log, IDBKeyRange, dataURItoBlob */
morel.extend('record.db', function (m) {
  "use strict";

  //todo: move to CONF.
  m.RECORDS = "records";

  m.DB_VERSION = 5;
  m.DB_MAIN = "morel";
  m.STORE_RECORDS = "records";

  /**
   * Opens a database connection and returns a records store.
   *
   * @param onError
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
      _log("RECORD.DB: opened successfully.", morel.LOG_DEBUG);
      var db = e.target.result;
      var transaction = db.transaction([m.STORE_RECORDS], "readwrite");
      var store = transaction.objectStore(m.STORE_RECORDS);

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
      _log("RECORD.DB: upgrading", morel.LOG_INFO);
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
      _log("RECORD.DB: not opened successfully.", morel.LOG_ERROR);
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
      _log("RECORD.DB: database blocked.", morel.LOG_ERROR);
      if (onError) {
        onError(e);
      }
    };
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
      _log("RECORD.DB: adding to the store.", morel.LOG_DEBUG);
      record.id = key;
      var req = store.add(record);
      req.onsuccess = function (event) {
        if (callback) {
          callback();
        }
      };
      store.transaction.db.close();
    }, onError);
  };

  /**
   * Gets a specific saved record from the database.
   * @param key The stored record Id.
   * @param callback
   * @aram onError
   * @returns {*}
   */
  m.get = function (key, callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: getting from the store.', morel.LOG_DEBUG);

      var req = store.index('id').get(key);
      req.onsuccess = function (e) {
        var result = e.target.result;

        if (callback) {
          callback(result);
        }
      };
    }, onError);
  };

  /**
   * Removes a saved record from the database.
   *
   * @param key
   * @param callback
   * @param onError
   */
  m.remove = function (key, callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: removing from the store.', morel.LOG_DEBUG);

      var req = store.openCursor(IDBKeyRange.only(key));
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
  };

  /**
   * Brings back all saved records from the database.
   */
  m.getAll = function (callback, onError) {
    m.open(function (store) {
      _log('RECORD.DB: getting all from the store.', morel.LOG_DEBUG);

      // Get everything in the store
      var keyRange = IDBKeyRange.lowerBound(0);
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
        if (callback) {
          callback(!$.isEmptyObject(data));
        }
      } else {
        if (callback) {
          callback(data);
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
      _log('RECORD.DB: clearing store.', morel.LOG_DEBUG);
      store.clear();

      if (callback) {
        callback();
      }
    }, onError);
  };

  /**
   * Returns a specific saved record in FormData format.
   *
   * @param recordKey
   * @param callback
   * @param onError
   * @returns {FormData}
   */
  m.getData = function (recordKey, callback, onError) {
    function onSuccess(savedRecord) {
      var data = new FormData();

      for (var k = 0; k < savedRecord.length; k++) {
        if (savedRecord[k].type === "file") {
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
    this.get(recordKey, onSuccess, onError);
  };

  /**
   * Saves a record using dynamic inputs.
   */
  m.save = function (recordInputs, callback, onError) {
    var record = recordInputs || morel.record.get();

    _log("RECORD.DB: saving dynamic record.", morel.LOG_INFO);
    //get new record ID
    var settings = morel.record.getSettings();
    var savedRecordId = ++settings[morel.record.LASTID];

    //INPUTS
    var onExtractFilesSuccess = function (files) {
      //merge files and the rest of the inputs
      jQuery.extend(record, files);

      _log("RECORD.DB: saving the record into database.", morel.LOG_DEBUG);
      function onSuccess() {
        //on record save success
        morel.record.setSettings(settings);

        if (callback) {
          callback(savedRecordId);
        }
      }

      m.add(record, savedRecordId, onSuccess, onError);
    };

    morel.image.extractAll(null, onExtractFilesSuccess, onError);
    return morel.TRUE;
  };

  /*
   * Saves the provided record.
   * Returns the savedRecordId of the saved record, otherwise an morel.ERROR.
   */
  m.saveForm = function (formId, onSuccess) {
    _log("RECORD.DB: saving a DOM record.", morel.LOG_INFO);
    var records = this.getAll();

    //get new record ID
    var settings = morel.record.getSettings();
    var savedRecordId = ++settings[morel.record.LASTID];

    //INPUTS
    //todo: refactor to $record
    var record = $(formId);
    var onSaveAllFilesSuccess = function (filesArray) {
      //get all the inputs/selects/textboxes into array
      var recordArray = morel.record.extractFromRecord(record);

      //merge files and the rest of the inputs
      recordArray = recordArray.concat(filesArray);

      _log("RECORD.DB: saving the record into database.", morel.LOG_DEBUG);
      try {
        records[savedRecordId] = recordArray;
        m.setAll(records);
        morel.record.setSettings(settings);
      } catch (e) {
        _log("RECORD.DB: while saving the record.", morel.LOG_ERROR);
        //_log(e);
        return morel.ERROR;
      }

      if (onSuccess) {
        onSuccess(savedRecordId);
      }
    };

    morel.image.getAll(onSaveAllFilesSuccess);
    return morel.TRUE;
  };

  return m;
});

/***********************************************************************
 * RECORD.INPUTS MODULE
 *
 * Object responsible for record input management.
 **********************************************************************/

/* global morel, _log* */
morel.extend('record.inputs', function (m) {
  "use strict";

  //todo: move KEYS to CONF.
  m.KEYS = {
    SREF: 'sample:entered_sref',
    SREF_SYSTEM: 'sample:entered_sref_system',
    SREF_ACCURACY: 'smpAttr:273',
    TAXON: 'occurrence:taxa_taxon_list_id',
    DATE: 'sample:date',
    COMMENT: 'sample:comment'
  };

  /**
   * Sets an input in the current record.
   *
   * @param item Input name
   * @param data Input value
   */
  m.set = function (item, data) {
    var record = morel.record.get();
    record[item] = data;
    morel.record.set(record);
  };

  /**
   * Returns an input value from the current record.
   *
   * @param item The Input name
   * @returns {*} null if the item does not exist
   */
  m.get = function (item) {
    var record = morel.record.get();
    return record[item];
  };

  /**
   * Removes an input from the current record.
   *
   * @param item Input name
   */
  m.remove = function (item) {
    var record = morel.record.get();
    delete record[item];
    morel.record.set(record);
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
      return val;
    }
  };

  return m;
});

/***********************************************************************
 * GEOLOC MODULE
 **********************************************************************/

/* global morel, _log */
morel.extend('geoloc', function (m) {
  "use strict";

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

  m.startTime = 0;
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
    };
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
    _log('GEOLOC: run.', morel.LOG_INFO);

    // Early return if geolocation not supported.
    if (!navigator.geolocation) {
      _log("GEOLOC: not supported!", morel.LOG_ERROR);
      if (onError) {
        onError({message: "Geolocation is not supported!"});
      }
      return;
    }

    //stop any other geolocation service started before
    morel.geoloc.stop();
    morel.geoloc.clear();

    this.startTime = new Date().getTime();

    // Request geolocation.
    this.id = morel.geoloc.watchPosition(onUpdate, onSuccess, onError);
  };

  /**
   * Stops any currently running geolocation service.
   */
  m.stop = function () {
    navigator.geolocation.clearWatch(morel.geoloc.id);
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
      var currentTime = new Date().getTime();
      if ((currentTime - morel.geoloc.startTime) > morel.geoloc.TIMEOUT) {
        //stop everything
        morel.geoloc.stop();
        _log("GEOLOC: timeout.", morel.LOG_ERROR);
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
      var prevAccuracy = morel.geoloc.getAccuracy();
      if (prevAccuracy === -1) {
        prevAccuracy = location.acc + 1;
      }

      //only set it up if the accuracy is increased
      if (location.acc > -1 && location.acc < prevAccuracy) {
        morel.geoloc.set(location.lat, location.lon, location.acc);
        if (location.acc < morel.geoloc.CONF.GPS_ACCURACY_LIMIT) {
          _log("GEOLOC: finished: " + location.acc + " meters.", morel.LOG_INFO);
          morel.geoloc.stop();

          //save in storage
          morel.settings('location', location);
          if (onSuccess) {
            onSuccess(location);
          }
        } else {
          _log("GEOLOC: updated acc: " + location.acc + " meters.", morel.LOG_INFO);
          if (onUpdate) {
            onUpdate(location);
          }
        }
      }
    };

    // Callback if geolocation fails.
    var onGeolocError = function (error) {
      _log("GEOLOC: ERROR.", morel.LOG_ERROR);
      if (onError) {
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
    if (accuracy === -1) {
      //No GPS lock yet
      return morel.ERROR;

    } else if (accuracy > this.CONF.GPS_ACCURACY_LIMIT) {
      //Geolocated with bad accuracy
      return morel.FALSE;

    } else {
      //Geolocation accuracy is good enough
      return morel.TRUE;
    }
  };

  return m;
});


/***********************************************************************
 * STORAGE MODULE
 **********************************************************************/

/* global morel, log */
morel.extend('storage', function (m) {
  "use strict";

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
    item = morel.CONF.NAME + '-' + item;

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
    item = morel.CONF.NAME + '-' + item;

    data = JSON.stringify(data);
    return localStorage.setItem(item, data);
  };

  /**
   * Removes the item from the storage.
   *
   * @param item
   */
  m.remove = function (item) {
    item = morel.CONF.NAME + '-' + item;

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
      return val;
    }
  };

  /**
   * Clears the storage.
   */
  m.clear = function () {
    _log('STORAGE: clearing', morel.LOG_DEBUG);

    localStorage.clear();
  };

  /**
   * Returns the item from the temporary storage.
   *
   * @param item
   */
  m.tmpGet = function (item) {
    item = morel.CONF.NAME + '-' + item;

    var data = sessionStorage.getItem(item);
    data = JSON.parse(data);
    return data;
  };

  /**
   * Sets an item in temporary storage.
   * @param data
   * @param item
   */
  m.tmpSet = function (item, data) {
    item = morel.CONF.NAME + '-' + item;

    data = JSON.stringify(data);
    return sessionStorage.setItem(item, data);
  };

  /**
   * Removes an item in temporary storage.
   *
   * @param item
   */
  m.tmpRemove = function (item) {
    item = morel.CONF.NAME + '-' + item;

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
      return val;
    }
  };

  /**
   * Clears the temporary storage.
   */
  m.tmpClear = function () {
    _log('STORAGE: clearing temporary', morel.LOG_DEBUG);

    sessionStorage.clear();
  };

  /**
   * Checks if it is possible to store some sized data in localStorage.
   */
  function localStorageHasSpace(size) {
    var taken = JSON.stringify(localStorage).length;
    var left = 1024 * 1024 * 5 - taken;
    if ((left - size) > 0) {
      return 1;
    } else {
      return 0;
    }
  }

  return m;
});


/***********************************************************************
 * IMAGE MODULE
 **********************************************************************/

/* global morel, _log */
morel.extend('image', function (m) {
  "use strict";

  //todo: move to CONF.
  m.MAX_IMG_HEIGHT = 800;
  m.MAX_IMG_WIDTH = 800;

  /**
   * Returns all the images resized and stingified from an element.
   *
   * @param elem DOM element to look for files
   * @param callback function with an array parameter
   */
  m.extractAll = function (elem, callback, onError) {
    var fileInputs = morel.image.findAll(elem);
    if (fileInputs.length > 0) {
      morel.image.toStringAll(fileInputs, callback, onError);
    } else {
      callback();
    }
  };

  /**
   * Transforms and resizes an image file into a string and saves it in the storage.
   *
   * @param onError
   * @param file
   * @param onSaveSuccess
   * @returns {number}
   */
  m.toString = function (file, onSaveSuccess, onError) {
    if (file) {
      _log("IMAGE: working with " + file.name + ".", morel.LOG_DEBUG);

      var reader = new FileReader();
      //#2
      reader.onload = function () {
        _log("IMAGE: resizing file.", morel.LOG_DEBUG);
        var image = new Image();
        //#4
        image.onload = function (e) {
          var width = image.width;
          var height = image.height;

          //resizing
          var res;
          if (width > height) {
            res = width / morel.image.MAX_IMG_WIDTH;
          } else {
            res = height / morel.image.MAX_IMG_HEIGHT;
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
          (shrinked.length / 1024) + "KB).", morel.LOG_DEBUG);

          onSaveSuccess(shrinked);

        };
        reader.onerror = function (e) {
          _log("IMAGE: reader " + e + ".", morel.LOG_ERROR);
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
   * @param onError
   */
  m.toStringAll = function (fileInputs, onSaveAllFilesSuccess, onError) {
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
        morel.image.toString(file, onSaveSuccess, onError);
      } else {
        onSaveAllFilesSuccess(files);
      }
    }
  };

  /**
   * Extracts all files from the page inputs having data-form attribute.
   */
  m.findAll = function (elem) {
    if (!elem) {
      elem = $(document);
    }

    var files = [];
    $(elem).find('input').each(function (index, input) {
      if ($(input).attr('type') === "file" && input.files.length > 0) {
        var file = morel.image.find(input);
        files.push(file);
      }
    });
    return files;
  };

  /**
   * Returns a file object with its name.
   *
   * @param input The file input Id
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
});



/***********************************************************************
 * HELPER MODULE
 *
 * Functions that were to ambiguous to be placed in one module.
 **********************************************************************/

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
  "use strict";
  /* global morel */
  //do nothing if logging turned off
  if (morel.CONF.LOG === morel.LOG_NONE) {
    return;
  }

  if (morel.CONF.LOG >= level || !level ) {
    switch (level) {
      case morel.LOG_ERROR:
        _logError(morel.CONF.basePath, message);
        break;
      case morel.LOG_WARNING:
        console.warn(message);
        break;
      case morel.LOG_INFO:
        console.log(message);
        break;
      case morel.LOG_DEBUG:
      /* falls through */
      default:
        //IE does not support console.debug
        if (!console.debug) {
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
function _logError(basePath, error) {
  "use strict";
  //print error
  console.error(error.message, error.url, error.line);

  //prepare the message
  var message = '<b style="color: red">' + error.message + '</b>';
  message += '</br><b> morel.version = </b><i>"' + morel.version + '"</i>';

  message += '</br><b> morel.CONF.NAME = </b><i>"' + morel.CONF.NAME + '"</i>';
  message += '</br><b> morel.CONF.VERSION = </b><i>"' + morel.CONF.VERSION + '"</i></br>';

  message += '</br>' + navigator.appName;
  message += '</br>' + navigator.appVersion;

  var url = error.url + ' (' + error.line + ')';

  if (navigator.onLine) {
    //send to server

    var data = {};
    data.append = function (name, value) {
      this[name] = value;
    };
    data.append('message', message);
    data.append('url', url);
    morel.auth.appendApp(data);

    //removing unnecessary information
    delete data.append;

    jQuery.ajax({
      url: basePath + 'mobile/log',
      type: 'post',
      dataType: 'json',
      success: function (data) {
        console.log(data);
      },
      data: data
    });
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
  "use strict";
  window.onerror = null;

  var error = {
    'message': message,
    'url': url || '',
    'line': line || -1
  };

  _log(error, morel.LOG_ERROR);

  window.onerror = this; // turn on error handling again
  return true; // suppress normal error reporting
}

/**
 * Clones an object.
 *
 * @param obj
 * @returns {*}
 */
function objClone(obj) {
  "use strict";
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
}

/**
 * Converts DataURI object to a Blob.
 *
 * @param {type} dataURI
 * @param {type} fileType
 * @returns {undefined}
 */
function dataURItoBlob(dataURI, fileType) {
  "use strict";

  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: fileType
  });
}