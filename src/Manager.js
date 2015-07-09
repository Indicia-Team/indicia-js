//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");


    m.extend('Manager', function () {
        var Manager = function (options) {
            this.storage = new this.Storage();
        };

        m.extend(Manager, {
            //Sample: m.Sample,
            Storage: m.LocalStorage,

            get: function (item, callback) {
                var key = item.id;
                return this.storage.get(key, callback);
            },

            getAll: function (callback) {
                this.storage.getAll(callback);
            },

            set: function (item, callback) {
                var key = item.id;
                this.storage.set(key, item, callback);
            },

            remove: function (item, callback) {
                var key = item.id;
                this.storage.remove(key, callback);
            },

            clear: function (callback) {
              this.storage.clear(callback);
            },

            sync: function (item, callback) {
                //synchronise with the server
            },

            syncAll: function (callback) {

            }

        });

        return Manager;
    });

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");