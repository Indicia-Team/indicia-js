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