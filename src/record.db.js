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
    var dbName = morel.CONF.NAME + '-' + m.DB_MAIN;
    var req = window.indexedDB.open(dbName, m.DB_VERSION);

    /**
     * On Database opening success, returns the Records object store.
     *
     * @param e
     */
    req.onsuccess = function (e) {
      
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
  };

  /**
   * Saves a record using dynamic inputs.
   */
  m.save = function (recordInputs, callback, onError) {
    var record = recordInputs || morel.record.get();

    
    //get new record ID
    var settings = morel.record.getSettings();
    var savedRecordId = ++settings[morel.record.LASTID];

    //INPUTS
    var onExtractFilesSuccess = function (files) {
      //merge files and the rest of the inputs
      jQuery.extend(record, files);

      
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

      
      try {
        records[savedRecordId] = recordArray;
        m.setAll(records);
        morel.record.setSettings(settings);
      } catch (e) {
        
        
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