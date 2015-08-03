//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global define, m */
define([], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * LOCAL STORAGE MODULE
     **********************************************************************/

    m.LocalStorage = (function () {
        /**
         * options:
         *  @appname String subdomain name to use for storage
         */
        var Module = function (options) {
            options || (options = {});

            this.storage = window.localStorage;

            this.NAME = options.appname ? this.NAME + '-' + options.appname : this.NAME;
        };

        m.extend(Module.prototype, {
            TYPE: 'LocalStorage',
            NAME: 'morel',

            /**
             * Gets an item from the storage.
             *
             * @param key
             */
            get: function (key, callback) {
                var data = this.storage.getItem(this._getKey(key));
                data = JSON.parse(data);

                callback(null, data);
            },

            /**
             * Returns all items from the storage;
             *
             * @returns {{}|*|m.Storage.storage}
             */
            getAll: function (callback) {
                var data = {};
                var key = '';
                for (var i = 0, len = this.storage.length; i < len; ++i ) {
                    key = this.storage.key(i);
                    //check if the key belongs to this storage
                    if (key.indexOf(this._getPrefix()) !== -1) {
                        var parsed = JSON.parse(this.storage.getItem(key));
                        data[key] = parsed;
                    }
                }
                callback(null, data);
            },

            /**
             * Sets an item in the storage.
             * Note: it overrides any existing key with the same name.
             *
             * @param key
             */
            set: function (key, data, callback) {
                data = JSON.stringify(data);
                this.storage.setItem(this._getKey(key), data);
                callback && callback(null, data);
            },

            /**
             * Removes an item from the storage.
             *
             * @param key
             */
            remove: function (key, callback) {
                this.storage.removeItem(this._getKey(key));
                callback && callback();
            },


            /**
             * Checks if a key exists.
             *
             * @param key Input name
             * @returns {boolean}
             */
            has: function (key, callback) {
                var data = null;
                this.get(this._getKey(key), function (err, data) {
                    callback(null, data !== undefined && data !== null);
                });
            },


            /**
             * Clears the storage.
             */
            clear: function (callback) {
                this.storage.clear();
                callback && callback();
            },

            /**
             * Calculates current occupied the size of the storage.
             *
             * @param callback
             */
            size: function (callback) {
                callback(null, this.storage.length);
            },

            /**
             * Checks if there is enough space in the storage.
             *
             * @param size
             * @returns {*}
             */
            hasSpace: function (size, callback) {
                var taken = JSON.stringify(this.storage).length;
                var left = 1024 * 1024 * 5 - taken;
                if ((left - size) > 0) {
                    callback(null, 1);
                } else {
                    callback(null, 0);
                }
            },

            _getKey: function (key) {
                return this._getPrefix() + key;
            },

            _getPrefix: function () {
                return this.NAME + '-';
            }

    });

        return Module;
    })();

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
