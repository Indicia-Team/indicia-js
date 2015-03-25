/***********************************************************************
 * DB MODULE
 *
 * Module responsible for large data management.
 **********************************************************************/

/* global morel */
morel.extend('db', function (m) {
  "use strict";
  /*global _log, IDBKeyRange*/

  //because of iOS8 bug on home screen: null & readonly window.indexedDB
  m.indexedDB = window._indexedDB || window.indexedDB;
  m.IDBKeyRange = window._IDBKeyRange || window.IDBKeyRange;

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
    var req = m.indexedDB.open(name, m.DB_VERSION);

    req.onsuccess = function (e) {
      
      var db = e.target.result;
      var transaction = db.transaction([storeName], "readwrite");
      var store = transaction.objectStore(storeName);

      if (callback) {
        callback(store);
      }
    };

    req.onupgradeneeded = function (e) {
      
      var db = e.target.result;

      db.deleteObjectStore(morel.db.STORE_MAIN);
      db.createObjectStore(morel.db.STORE_MAIN);
    };

    req.onerror = function (e) {
      
    };

    req.onblocked = function (e) {
      
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
    var dbName = morel.CONF.NAME + '-' + m.DB_MAIN;

    m.open(dbName, m.STORE_MAIN, function (store) {
      

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
    var dbName = morel.CONF.NAME + '-' + m.DB_MAIN;

    m.open(dbName, m.STORE_MAIN, function (store) {
      

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
    var dbName = morel.CONF.NAME + '-' + m.DB_MAIN;

    m.open(dbName, m.STORE_MAIN, function (store) {
      

      // Get everything in the store
      var keyRange = m.IDBKeyRange.lowerBound(0);
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
    var dbName = morel.CONF.NAME + '-' + m.DB_MAIN;
    m.open(dbName, m.STORE_RECORDS, function (store) {
      
      store.clear();

      if (callback) {
        callback();
      }
    });
  };

  return m;
});