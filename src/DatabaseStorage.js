//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define, isEmptyObject, isPlainObject, IDBKeyRange, indexedDB */
define(['Error'], function () {
//>>excludeEnd("buildExclude");

    m.DatabaseStorage = (function () {
        var Module = function () {
        };

        m.extend(Module.prototype, {
            //because of iOS8 bug on home screen: null & readonly window.indexedDB

            indexedDB: window._indexedDB || window.indexedDB,
            IDBKeyRange: window._IDBKeyRange || window.IDBKeyRange,

            VERSION: 1,
            NAME: 'DatabaseStorage',
            DB_NAME: "morel",
            STORE_NAME: "samples",

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
            set: function (key, data, callback) {
                this.open(function (err, store) {
                    if (err) {
                        if (callback) {
                            callback(err);
                        }
                        return;
                    }

                    var req = store.put(data, key);

                    req.onsuccess = function () {
                        if (callback) {
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
                        if (callback) {
                            callback(err);
                        }
                        return;
                    }

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
                        if (callback) {
                            callback(err);
                        }
                        return;
                    }

                    var req = store.clear();

                    req.onsuccess = function () {
                        if (callback) {
                            callback();
                        }
                    };

                    req.onerror = function (e) {
                        var message = 'Database Problem: ' + e.target.error.message,
                            error = new m.Error(message);
                        console.error(message);

                        if (callback) {
                            callback(error);
                        }
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
             * Opens a database connection and returns a records store.
             *
             * @param onError
             * @param callback
             */
            open: function (callback) {
                var that = this,
                    req = this.indexedDB.open(this.DB_NAME, this.VERSION);

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

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
