/** *********************************************************************
 * STORAGE
 **********************************************************************/
import _ from 'underscore';
import Backbone from 'backbone';
import LocalForage from 'localforage';

import Error from './Error';
import Sample from './Sample';
import Collection from './Collection';

class Storage {
  /**
   * From ionic storage
   * https://github.com/driftyco/ionic-storage/blob/master/src/storage.ts
   driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
   name        : 'myApp',
   version     : 1.0,
   size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
   storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
   description : 'some description'
   Sample
   manager
   * @param options
   */
  constructor(options = {}) {
    const that = this;

    this._initialized = false;

    this.Sample = options.Sample || Sample;
    this.manager = options.manager;

    const customConfig = options.storage || {};

    // initialize db
    this.db = null;
    const _dbPromise = new Promise((resolve, reject) => {
      // check custom drivers (eg. SQLite)
      const customDriversPromise = new Promise((resolve, reject) => {
        if (customConfig.driverOrder && typeof customConfig.driverOrder[0] === 'object') {
          LocalForage.defineDriver(customConfig.driverOrder[0]).then(resolve);
        } else {
          resolve();
        }
      });

      // config
      customDriversPromise.then(() => {
        const dbConfig = {
          name: customConfig.name || 'morel',
          storeName: customConfig.storeName || 'samples',
        };

        if (customConfig.version) {
          dbConfig.version = customConfig.version;
        }

        const driverOrder = customConfig.driverOrder || ['indexeddb', 'websql', 'localstorage'];
        const drivers = that._getDriverOrder(driverOrder);
        const DB = customConfig.LocalForage || LocalForage;

        // init
        that.db = DB.createInstance(dbConfig);
        that.db.setDriver(drivers)
          .then(() => {
            resolve(that.db);
          })
          .catch(reason => reject(reason));
      });
    });

    // initialize db cache
    this._cache = {};
    _dbPromise.then(() => {
      // build up samples
      const samples = [];
      this.db.iterate((value, key) =>{
        const modelOptions = _.extend(value, { manager: that.manager });
        const sample = new that.Sample(value.attributes, modelOptions);
        samples.push(sample);
      }).then(() => {
        // attach the samples as collection
        that._cache = new Collection(samples, {
          model: that.Sample,
        });
        that._attachListeners();

        that._initialized = true;
        that.trigger('init');
      });
    });
  }

  _getDriverOrder(driverOrder) {
    return driverOrder.map((driver) => {
      switch (driver) {
        case 'indexeddb':
          return LocalForage.INDEXEDDB;
        case 'websql':
          return LocalForage.WEBSQL;
        case 'localstorage':
          return LocalForage.LOCALSTORAGE;
        default:
          // custom
          if (typeof driver === 'object' && driver._driver) {
            return driver._driver;
          }
          return console.error('No such db driver!');
      }
    });
  }

  ready() {
    return this._initialized;
  }

  get(model, callback, options = {}) {
    const that = this;
    if (!this.ready()) {
      this.on('init', () => {
        this.get(model, callback, options);
      });
      return;
    }

    const key = typeof model === 'object' ? model.id || model.cid : model;

    // a non cached version straight from storage medium
    if (options.nonCached) {
      this.db.getItem(key, (err, data) => {
        if (err) {
          callback(err);
          return;
        }
        const modelOptions = _.extend(data, { manager: that.manager });
        const sample = new that.Sample(data.attributes, modelOptions);
        callback(null, sample);
      });
      return;
    }

    callback(null, this._cache.get(key));
  }

  getAll(callback) {
    if (!this.ready()) {
      this.on('init', () => {
        this.getAll(callback);
      });
      return;
    }
    callback(null, this._cache);
  }

  set(model = {}, callback) {
    // early return if no id or cid
    if (!model.id && !model.cid) {
      const error = new Error('Invalid model passed to storage');
      callback(error);
      return;
    }

    // needs to be on and running
    if (!this.ready()) {
      this.on('init', () => {
        this.set(model, callback);
      });
      return;
    }

    const that = this;
    const key = model.id || model.cid;
    const dataJSON = (typeof model.toJSON === 'function') ? model.toJSON() : model;
    this.db.setItem(key, dataJSON, (err) => {
      if (err) {
        callback && callback(err);
        return;
      }
      that._cache.set(model, { remove: false });
      callback && callback(null, model);
    });
  }

  remove(model, callback) {
    if (!this.ready()) {
      this.on('init', () => {
        this.remove(model, callback);
      });
      return;
    }
    const key = typeof model === 'object' ? model.id || model.cid : model;
    this.db.removeItem(key, (err) => {
      if (err) {
        callback && callback(err);
        return;
      }
      delete model.manager;
      model.destroy().then(callback); // removes from cache
    });
  }

  has(model, callback) {
    if (!this.ready()) {
      this.on('init', () => {
        this.has(model, callback);
      }, this);
      return;
    }
    this.get(model, (err, data) => {
      const found = typeof data === 'object';
      callback(null, found);
    });
  }

  clear(callback) {
    if (!this.ready()) {
      this.on('init', () => {
        this.clear(callback);
      });
      return;
    }
    const that = this;
    this.db.clear((err) => {
      if (err) {
        callback && callback(err);
        return;
      }
      that._cache.reset();
      callback && callback();
    });
  }

  size(callback) {
    this.db.length(callback);
  }

  _attachListeners() {
    const that = this;
    // listen on cache because it is last updated
    this._cache.on('update', () => {
      that.trigger('update');
    });
  }
}

// add events
_.extend(Storage.prototype, Backbone.Events);

export { Storage as default };
