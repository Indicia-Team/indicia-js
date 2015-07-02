//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
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

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
