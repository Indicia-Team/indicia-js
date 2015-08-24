//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define */
define(['helpers', 'Events', 'Collection', 'Sample', 'PlainStorage',
    'LocalStorage', 'DatabaseStorage'], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * STORAGE MODULE
     **********************************************************************/

    m.Storage = (function () {
        var Module = function (options) {
            options || (options = {});

            var that = this;

            this.Sample = options.Sample || m.Sample;

            //internal storage
            this.Storage = options.Storage || m.LocalStorage;
            this.storage = new this.Storage({
                appname: options.appname
            });

            //initialize the cache
            this.cache = {};
            this.initialized = false;
            this.storage.getAll(function (err, data) {
                var samples = [],
                    sample = null,
                    keys = Object.keys(data);

                for (var i = 0; i < keys.length; i++) {
                    sample = new that.Sample(m.extend(data[keys[i]], {
                        plainAttributes: true
                    }));
                    samples.push(sample);
                }
                that.cache =  new m.Collection({
                    model: that.Sample,
                    data: samples
                });
                that._attachListeners();

                that.initialized = true;
                that.trigger('init');
            });
        };

        m.extend(Module.prototype, {
            get: function (item, callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.get(item, callback);
                    });
                    return;
                }

                var key = typeof item === 'object' ? item.id : item;
                callback(null, this.cache.get(key));
            },

            getAll: function (callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.getAll(callback);
                    });
                    return;
                }
                callback(null, this.cache);
            },

            set: function (item, callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.set(item, callback);
                    });
                    return;
                }
                var that = this,
                    key = item.id;
                this.storage.set(key, item, function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    that.cache.set(item);
                    callback && callback(null, item);
                });
            },

            remove: function (item, callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.remove(item, callback);
                    });
                    return;
                }
                var that = this,
                    key = typeof item === 'object' ? item.id : item;
                this.storage.remove(key, function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    that.cache.remove(item);
                    callback && callback();
                });
            },

            has: function (item, callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.has(item, callback);
                    });
                    return;
                }
                var key = typeof item === 'object' ? item.id : item;
                this.cache.has(key, callback);
            },

            clear: function (callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.clear(item, callback);
                    });
                    return;
                }
                var that = this;
                this.storage.clear(function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    that.cache.clear();
                    callback && callback();
                });
            },

            _attachListeners: function () {
                var that = this;
                //listen on cache because it is last updated
                this.cache.on('update', function () {
                    that.trigger('update');
                });
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");