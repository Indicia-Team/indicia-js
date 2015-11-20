//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define */
define(['helpers', 'Events', 'Collection', 'Sample', 'PlainStorage',
    'LocalStorage', 'DatabaseStorage'], function () {
//>>excludeEnd('buildExclude');
    /***********************************************************************
     * STORAGE
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
                data || (data = {});

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
                    Model: that.Sample,
                    models: samples
                });
                that._attachListeners();

                that.initialized = true;
                that.trigger('init');
            });
        };

        m.extend(Module.prototype, {
            get: function (model, callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.get(model, callback);
                    });
                    return;
                }

                var key = typeof model === 'object' ? model.id : model;
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

            set: function (model, callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.set(model, callback);
                    });
                    return;
                }
                var that = this,
                    key = model.id;
                this.storage.set(key, model, function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    that.cache.set(model);
                    callback && callback(null, model);
                });
            },

            remove: function (model, callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.remove(model, callback);
                    });
                    return;
                }
                var that = this,
                    key = typeof model === 'object' ? model.id : model;
                this.storage.remove(key, function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    that.cache.remove(model);
                    callback && callback();
                });
            },

            has: function (model, callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.has(model, callback);
                    }, this);
                    return;
                }
                var key = typeof model === 'object' ? model.id : model;
                this.cache.has(key, callback);
            },

            clear: function (callback) {
                if (!this.initialized) {
                    this.on('init', function () {
                        this.clear(callback);
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

            size: function (callback) {
              this.storage.size(callback);
            },

            _attachListeners: function () {
                var that = this;
                //listen on cache because it is last updated
                this.cache.on('update', function () {
                    that.trigger('update');
                });
            }
        });

        //add events
        m.extend(Module.prototype, m.Events);

        return Module;
    }());

//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');