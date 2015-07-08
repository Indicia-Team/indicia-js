//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global define, m */
define([], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * STORAGE MODULE
     **********************************************************************/

    m.LocalStorage = (function () {
        var Module = function () {
        };

        m.extend(Module.prototype, {
            NAME: 'LocalStorage',

            /**
             * Gets an key from the storage.
             *
             * @param key
             */
            get: function (key, callback) {
                var data = localStorage.getItem(key);
                data = JSON.parse(data);

                callback(null, data);
            },

            /**
             * Returns all the keys from the store;
             * @returns {{}}
             */
            getAll: function (callback) {
                var data = {};
                var key = '';
                for ( var i = 0, len = localStorage.length; i < len; ++i ) {
                    key = localStorage.key(i);
                    data[key] = localStorage.getItem(key);
                }
                callback(null, data);
            },

            /**
             * Sets an key in the storage.
             * Note: it overrides any existing key with the same name.
             *
             * @param key
             */
            set: function (key, data, callback) {
                data = JSON.stringify(data);
                localStorage.setItem(key, data);
                callback && callback(null, data);
            },

            /**
             * Removes the key from the storage.
             *
             * @param key
             */
            remove: function (key, callback) {
                localStorage.removeItem(key);
                callback && callback();
            },


            /**
             * Checks if the key exists.
             *
             * @param key Input name
             * @returns {boolean}
             */
            has: function (key, callback) {
                var data = null;
                var val = this.get(key, function (err, data) {
                    if (m.isPlainObject(val)) {
                        data = !m.isEmptyObject(val);
                    } else {
                        data = val;
                    }

                    callback(null, data !== null);
                });
            },


            /**
             * Clears the storage.
             */
            clear: function (callback) {
                localStorage.clear();
                callback && callback();
            },

            size: function (callback) {
                callback(null, localStorage.length);
            },

            /**
             * Checks if there is enough space in the storage.
             *
             * @param size
             * @returns {*}
             */
            hasSpace: function (size, callback) {
                var taken = JSON.stringify(localStorage).length;
                var left = 1024 * 1024 * 5 - taken;
                if ((left - size) > 0) {
                    callback(null, 1);
                } else {
                    callback(null, 0);
                }
            }

        });

        return Module;
    })();

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
