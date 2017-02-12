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

  save(model, options) {
    if (model.parent) {
      return this.parent.sync('create', model, options);
    }

    // early return if no id or cid
    if (!model.id && !model.cid) {
      return Promise.reject(new Error('Invalid model passed to store'));
    }

    const key = model.cid;
    const dataJSON = (typeof model.toJSON === 'function') ? model.toJSON() : model;
    return this.store.db.setItem(key, dataJSON);

    // return this.store.db.setItem(key, dataJSON)
    //   .then(() => {
    //     if (model instanceof that.model) {
    //       that.add(model, { remove: false });
    //     } else {
    //       const modelOptions = _.extend(model, { store: model.store });
    //       const sample = new model.store.model(model.attributes, modelOptions);
    //       that.add(sample, { remove: false });
    //     }
    //     resolve(model);
    //   })
    //   .catch(reject);
  }

  create(model, options) {
    // We always have an ID available by this point, so we just call
    // the update method.
    return this.update(model, options);
  }

  update(model, options) {
    return this.save(model, options);
  }

  find(model, options) {
    return this.localForage.getItem(model.cid);
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

  destroy(model, options) {
    if (this.store && !options.noSave) {
      // save the changes permanently
      const key = typeof model === 'object' ? model.cid : model;
      this.store.db.removeItem(key)
        .then(() => {
          delete model.store; // delete a reference
          return model.destroy().then(fulfill); // removes from collections
        })
        .catch(reject);
    } else {
      // removes from all collections etc
      this.stopListening();
      this.trigger('destroy', this, this.collection, options);

      if (this.parent && !options.noSave) {
        // save the changes permanently
        this.save(options).then(fulfill);
      } else {
        fulfill();
      }
    }

    return this.localForage.removeItem(model.cid)
      .then(() => {
        return Promise.resolve(model.toJSON());
      });
  }
}

export default Store;

