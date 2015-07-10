//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global define, m */
define([], function () {
//>>excludeEnd("buildExclude");
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
             * Gets an key from the storage.
             *
             * @param key
             */
            get: function (key, callback) {
                var data = this.storage[key];
                callback(null, data);
            },

            /**
             * Returns all the keys from the storage;
             *
             * @returns {{}|*|m.Storage.storage}
             */
            getAll: function (callback) {
                var data = this.storage;
                callback(null, data);
            },

            /**
             * Sets an key in the storage.
             * Note: it overrides any existing key with the same name.
             *
             * @param key
             */
            set: function (key, data, callback) {
                this.storage[key] = data;
                callback && callback(null, data);
            },

            /**
             * Removes the key from the storage.
             *
             * @param key
             */
            remove: function (key, callback) {
                delete this.storage[key];
                callback && callback();
            },

            /**
             * Checks if the key exists.
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

            size: function (callback) {
                var data = Object.keys(this.storage).length;
                callback(null, data);
            }
        });

        return Module;
    })();
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
