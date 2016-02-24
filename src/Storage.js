//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define */
define(['helpers', 'Collection', 'Sample', 'PlainStorage',
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
      this.manager = options.manager;

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
          var current = data[keys[i]];
          var modelOptions = _.extend(current, {_manager: that.manager});
          sample = new that.Sample(current.attributes, modelOptions);
          samples.push(sample);
        }
        that.cache =  new m.Collection(samples, {
          model: that.Sample
        });
        that._attachListeners();

        that.initialized = true;
        that.trigger('init');
      });
    };

    _.extend(Module.prototype, {
      get: function (model, callback) {
        if (!this.initialized) {
          this.on('init', function () {
            this.get(model, callback);
          });
          return;
        }

        var key = typeof model === 'object' ? model.id || model.cid : model;
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
          key = model.id || model.cid;
        this.storage.set(key, model, function (err) {
          if (err) {
            callback && callback(err);
            return;
          }
          that.cache.set(model, {remove: false});
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
          key = typeof model === 'object' ? model.id || model.cid : model;
        this.storage.remove(key, function (err) {
          if (err) {
            callback && callback(err);
            return;
          }
          delete model._manager;
          model.destroy(callback); //removes from cache
        });
      },

      has: function (model, callback) {
        if (!this.initialized) {
          this.on('init', function () {
            this.has(model, callback);
          }, this);
          return;
        }
        var key = typeof model === 'object' ? model.id || model.cid : model;
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
            callback && callback(err);
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
    _.extend(Module.prototype, Backbone.Events);

    return Module;
  }());

//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');