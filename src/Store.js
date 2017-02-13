import Backbone from 'backbone';
import LocalForage from 'localforage';

/*!
 Inspired by localForage Backbone Adapter
 */

// For now, we aren't complicated: just set a property off Backbone to
// serve as our export point.
class Store {
  constructor(options = {}) {
    const that = this;

    // initialize db
    this.localForage = null;
    const _dbPromise = new Promise((resolve, reject) => {
      // check custom drivers (eg. SQLite)
      const customDriversPromise = new Promise((_resolve) => {
        if (options.driverOrder && typeof options.driverOrder[0] === 'object') {
          LocalForage.defineDriver(options.driverOrder[0]).then(_resolve);
        } else {
          _resolve();
        }
      });

      // config
      customDriversPromise.then(() => {
        const dbConfig = {
          name: options.name || 'morel',
          storeName: options.storeName || 'models',
        };

        if (options.version) {
          dbConfig.version = options.version;
        }

        const driverOrder = options.driverOrder || ['indexeddb', 'websql', 'localstorage'];
        const drivers = that._getDriverOrder(driverOrder);
        const DB = options.LocalForage || LocalForage;

        // init
        that.localForage = DB.createInstance(dbConfig);
        that.localForage.setDriver(drivers)
          .then(() => {
            resolve(that.localForage);
          })
          .catch(reject);
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

  sync(method, model, options) {
    switch (method) {
      case 'read':
        return model.cid ? this.find(model, options) : this.findAll(model, options);
      case 'create':
        return this.create(model, options);
      case 'update':
        return this.update(model, options);
      case 'delete':
        return this.destroy(model, options);
    }
  }

  save(model) {
    // early return if no id or cid
    if (!model.id && !model.cid) {
      return Promise.reject(new Error('Invalid model passed to store'));
    }

    const key = model.cid;
    return this.localForage.setItem(key, model.toJSON());
  }

  create(model, options) {
    // We always have an ID available by this point, so we just call
    // the update method.
    return this.update(model, options);
  }

  update(model, options) {
    return this.save(model, options);
  }

  find(model) {
    return this.localForage.getItem(model.cid).then((data) => {
      if (!data) {
        return Promise.reject(`LocalForage entry with ${model.cid} as key not found`);
      }
      return data;
    });
  }

  // Only used by `Backbone.Collection#sync`.
  findAll(collection, options) {
    const that = this;

    // build up samples
    const samples = [];
    const promise = this.localForage.iterate((value) => {
      const modelOptions = _.extend(value, { store: that });
      const sample = new that.model(value.attributes, modelOptions);
      samples.push(sample);
    }).then(() => {
      // attach the samples as collection
      if (samples.length) {
        that.reset(samples, _.extend({ silent: true }, options));
      }

      that._initialized = true;
      that.trigger('init');

      return Promise.resolve(samples);
    });

    return promise;
  }

  destroy(model) {
    // early return if no id or cid
    if (!model.id && !model.cid) {
      return Promise.reject(new Error('Invalid model passed to store'));
    }

    const key = model.cid;
    return this.localForage.removeItem(key)
      .then(() => Promise.resolve(model.toJSON()));
  }
}

export default Store;

