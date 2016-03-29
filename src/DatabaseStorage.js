/** *********************************************************************
 * DATABASE STORAGE
 **********************************************************************/
import Error from './Error';

/**
 * options:
 *  @appname String subdomain name to use for storage
 */
class DatabaseStorage {
  constructor(options = {}) {
    // because of iOS8 bug on home screen: null & readonly window.indexedDB
    this.indexedDB = window._indexedDB || window.indexedDB;
    this.IDBKeyRange = window._IDBKeyRange || window.IDBKeyRange;

    this.VERSION = 1;
    this.TYPE = 'DatabaseStorage';
    this.NAME = 'morel';
    this.STORE_NAME = 'samples';

    this.NAME = options.appname ? `${this.NAME}-${options.appname}` : this.NAME;
  }

  /**
   * Adds an item under a specified key to the database.
   * Note: might be a good idea to move the key assignment away from
   * the function parameters and rather auto assign one and return on callback.
   *
   * @param key
   * @param data JSON or object having toJSON function
   * @param callback
   */
  set(key, data, callback) {
    try {
      this.open((err, store) => {
        if (err) {
          callback && callback(err);
          return;
        }

        const dataJSON = (typeof data.toJSON === 'function') ? data.toJSON() : data;

        const req = store.put(dataJSON, key);

        req.onsuccess = () => {
          callback && callback(null, dataJSON);
        };

        req.onerror = (e) => {
          const message = `Database Problem: ${e.target.error.message}`;
          const error = new Error(message);
          console.error(message);
          callback && callback(error);
        };
      });
    } catch (err) {
      callback && callback(err);
    }
  }

  /**
   * Gets a specific saved data from the database.
   * @param key The stored data Id.
   * @param callback
   * @aram onError
   * @returns {*}
   */
  get(key, callback) {
    try {
      this.open((err, store) => {
        if (err) {
          callback(err);
          return;
        }

        const req = store.index('id').get(key);
        req.onsuccess = (e) => {
          const data = e.target.result;
          callback(null, data);
        };

        req.onerror = (e) => {
          const message = `Database Problem: ${e.target.error.message}`;
          const error = new Error(message);
          console.error(message);
          callback(error);
        };
      });
    } catch (err) {
      callback(err);
    }
  }

  /**
   * Removes a saved data from the database.
   *
   * @param key
   * @param callback
   * @param onError
   */
  remove(key, callback) {
    const that = this;

    try {
      this.open((err, store) => {
        if (err) {
          callback && callback(err);
          return;
        }

        const req = store.openCursor(that.IDBKeyRange.only(key));
        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
          } else {
            callback && callback();
          }
        };
        req.onerror = (e) => {
          const message = `Database Problem: ${e.target.error.message}`;
          const error = new Error(message);

          console.error(message);
          callback && callback(error);
        };
      });
    } catch (err) {
      callback && callback(err);
    }
  }

  /**
   * Brings back all saved data from the database.
   */
  getAll(callback) {
    const that = this;

    try {
      this.open((err, store) => {
        if (err) {
          callback(err);
          return;
        }

        // Get everything in the store
        const keyRange = that.IDBKeyRange.lowerBound(0);
        const req = store.openCursor(keyRange);
        const data = {};

        req.onsuccess = (e) => {
          const result = e.target.result;

          // If there's data, add it to array
          if (result) {
            data[result.key] = result.value;
            result.continue();

            // Reach the end of the data
          } else {
            callback(null, data);
          }
        };

        req.onerror = (e) => {
          const message = `Database Problem: ${e.target.error.message}`;
          const error = new Error(message);

          console.error(message);
          callback(error);
        };
      });
    } catch (err) {
      callback(err);
    }
  }

  /**
   * Checks whether the data under a provided key exists in the database.
   *
   * @param key
   * @param callback
   * @param onError
   */
  has(key, callback) {
    this.get(key, (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, data !== undefined && data !== null);
    });
  }

  /**
   * Clears all the saved data.
   */
  clear(callback) {
    try {
      this.open((err, store) => {
        if (err) {
          callback && callback(err);
          return;
        }

        const req = store.clear();

        req.onsuccess = () => {
          callback && callback();
        };

        req.onerror = (e) => {
          const message = `Database Problem: ${e.target.error.message}`;
          const error = new Error(message);
          console.error(message);

          callback && callback(error);
        };
      });
    } catch (err) {
      callback && callback(err);
    }
  }

  size(callback) {
    this.getAll((err, data) => {
      if (err) {
        callback(err);
        return;
      }
      const size = JSON.stringify(data).length;
      callback(null, size);
    });
  }

  /**
   * Opens a database connection and returns a store.
   *
   * @param onError
   * @param callback
   */
  open(callback) {
    const that = this;
    let req = null;

    try {
      req = this.indexedDB.open(this.NAME, this.VERSION);

      /**
       * On Database opening success, returns the Records object store.
       *
       * @param e
       */
      req.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction([that.STORE_NAME], 'readwrite');
        if (transaction) {
          const store = transaction.objectStore(that.STORE_NAME);
          if (store) {
            callback(null, store);
          } else {
            const err = new Error('Database Problem: no such store');
            callback(err);
          }
        }
      };

      /**
       * If the Database needs an upgrade or is initialising.
       *
       * @param e
       */
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        db.createObjectStore(that.STORE_NAME);
      };

      /**
       * Error of opening the database.
       *
       * @param e
       */
      req.onerror = (e) => {
        const message = `Database Problem: ${e.target.error.message}`;
        const error = new Error(message);

        console.error(message);
        callback(error);
      };

      /**
       * Error on database being blocked.
       *
       * @param e
       */
      req.onblocked = (e) => {
        const message = `Database Problem: ${e.target.error.message}`;
        const error = new Error(message);

        console.error(message);
        callback(error);
      };
    } catch (err) {
      callback(err);
    }
  }
}

export { DatabaseStorage as default };
