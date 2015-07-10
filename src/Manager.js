//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define */
define(['Sample', 'Storage', 'LocalStorage', 'DatabaseStorage'], function () {
//>>excludeEnd("buildExclude");


    m.Manager = (function () {
        var Module = function (options) {
            m.extend(this.conf, options);
            this.storage = new this.Storage();
        };

        m.extend(Module.prototype, {
            conf: {
                url: '',
                appname: '',
                appsecret: '',
                survey_id: -1,
                website_id: -1
            },
            Sample: m.Sample,
            Storage: m.LocalStorage,

            get: function (item, callback) {
                var that = this,
                    key = typeof item === 'object' ? item.id : item;
                this.storage.get(key, function (err, data) {
                    var sample = new that.Sample(data);
                    callback(err, sample);
                });
            },

            getAll: function (callback) {
                var that = this;
                this.storage.getAll(function (err, data){
                    var samples = {},
                        sample = null;

                    for (var i = 0; i < data.length; i++) {
                        sample = new that.Sample(data[i]);
                        samples[sample.id] = sample;
                    }
                    callback(err, samples);
                });
            },

            set: function (item, callback) {
                var key = item.id;
                this.storage.set(key, item, callback);
            },

            remove: function (item, callback) {
                var key = item.id;
                this.storage.remove(key, callback);
            },

            has: function (item, callback) {
                var key = item.id;
                this.storage.has(key, callback);
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

        return Module;
    }());

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");