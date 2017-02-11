/** *********************************************************************
 * STORAGE
 **********************************************************************/
import _ from 'underscore';
import Backbone from 'backbone';
import LocalForage from 'localforage';

import Error from './Error';
import Sample from './Sample';

const Storage = Backbone.Collection.extend({
  model: Sample,
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
   storage
   * @param options
   */
  initialize(options = {}) {
    const that = this;
    this._initialized = false;
    const customConfig = options.storage || {};

    // initialize db
    this.db = null;
    const _dbPromise = new Promise((resolve, reject) => {
      // check custom drivers (eg. SQLite)
      const customDriversPromise = new Promise((_resolve) => {
        if (customConfig.driverOrder && typeof customConfig.driverOrder[0] === 'object') {
          LocalForage.defineDriver(customConfig.driverOrder[0]).then(_resolve);
        } else {
          _resolve();
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
          .catch(reject);
      });
    });

    // initialize the cache
    _dbPromise.then(() => {
      // build up samples
      const samples = [];
      this.db.iterate((value) => {
        const modelOptions = _.extend(value, { storage: that });
        const sample = new that.model(value.attributes, modelOptions);
        samples.push(sample);
      }).then(() => {
        // attach the samples as collection
        that.reset(samples, _.extend({ silent: true }, options));

        that._initialized = true;
        that.trigger('init');
      });
    });
  },

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
  },

  ready() {
    return this._initialized;
  },

  get(model) {
    if (model == null) return void 0;

    const promise = new Promise((resolve, reject) => {
      if (!this.ready()) {
        this.on('init', () => {
          this.get(model).then(resolve, reject);
        });
        return;
      }

      const cachedModel = this._byId[model] ||
        this._byId[this.modelId(model.attributes || model)] ||
        (model.cid && this._byId[model.cid]);

      resolve(cachedModel);
    });

    return promise;
  },

  save(model = {}) {
    const promise = new Promise((resolve, reject) => {
      // early return if no id or cid
      if (!model.cid) {
        const error = new Error('Invalid model passed to storage');
        reject(error);
        return;
      }

      // needs to be on and running
      if (!this.ready()) {
        this.on('init', () => {
          this.save(model).then(resolve, reject);
        });
        return;
      }

      const that = this;
      const key = model.cid;
      const dataJSON = (typeof model.toJSON === 'function') ? model.toJSON() : model;
      this.db.setItem(key, dataJSON)
        .then(() => {
          if (model instanceof that.model) {
            that.add(model, { remove: false });
          } else {
            const modelOptions = _.extend(model, { storage: that.storage });
            const sample = new that.model(model.attributes, modelOptions);
            that.add(sample, { remove: false });
          }
          resolve(model);
        })
        .catch(reject);
    });

    return promise;
  },

  remove(model) {
    const promise = new Promise((resolve, reject) => {
      if (!this.ready()) {
        this.on('init', () => {
          this.remove(model).then(resolve, reject);
        });
        return;
      }
      const key = typeof model === 'object' ? model.cid : model;
      this.db.removeItem(key)
        .then(() => {
          delete model.storage; // delete a reference
          return model.destroy().then(resolve); // removes from cache
        })
        .catch(reject);
    });

    return promise;
  },

  sync(method, model, options = {}) {
    this.each((model) => {
      model.sync(method, model, options);
    });
  },

  has(model) {
    const promise = new Promise((resolve, reject) => {
      if (!this.ready()) {
        this.on('init', () => {
          this.has(model).then(resolve, reject);
        }, this);
        return;
      }

      this.get(model).then((data) => {
        resolve(data != null);
      });
    });

    return promise;
  },

  clear() {
    const promise = new Promise((resolve, reject) => {
      if (!this.ready()) {
        this.on('init', () => {
          this.clear().then(resolve, reject);
        });
        return;
      }
      const that = this;
      this.db.clear()
        .then(() => {
          that.reset();
          resolve();
        })
        .catch(reject);
    });

    return promise;
  },

  size() {
    const promise = new Promise((resolve, reject) => {
      this.db.length().then(resolve, reject);
    });

    return promise;
  },
});

// add events
_.extend(Storage.prototype, Backbone.Events);

export { Storage as default };
