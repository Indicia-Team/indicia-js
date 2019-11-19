import Backbone from 'backbone';
import LocalForage from 'localforage';
import _ from 'underscore';

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
    this.ready = new Promise((resolve, reject) => {
      // check custom drivers (eg. SQLite)
      const customDriversPromise = new Promise(_resolve => {
        if (options.driverOrder && typeof options.driverOrder[0] === 'object') {
          LocalForage.defineDriver(options.driverOrder[0]).then(_resolve);
        } else {
          _resolve();
        }
      });

      // config
      customDriversPromise.then(() => {
        const dbConfig = {
          name: options.name || 'indicia',
          storeName: options.storeName || 'models',
        };

        if (options.version) {
          dbConfig.version = options.version;
        }

        const driverOrder = options.driverOrder || [
          'indexeddb',
          'websql',
          'localstorage',
        ];
        const drivers = Store._getDriverOrder(driverOrder);
        const DB = options.LocalForage || LocalForage;

        // init
        that.localForage = DB.createInstance(dbConfig);
        that.localForage
          .setDriver(drivers)
          .then(() => {
            resolve(that.localForage);
          })
          .catch(reject);
      });
    });
  }

  static _getDriverOrder(driverOrder) {
    return driverOrder.map(driver => {
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
        return model.cid
          ? this.find(model, options)
          : this.findAll(model, options);
      case 'create':
        return this.create(model, options);
      case 'update':
        return this.update(model, options);
      case 'delete':
        return this.destroy(model, options);
      default:
        return Promise.reject(
          new Error(`Local Sync method not found ${method}`)
        );
    }
  }

  save(model, options) {
    return this._callWhenReady(() => {
      // save collection
      if (model instanceof Backbone.Collection) {
        if (!model.models.length) {
          return Promise.resolve();
        }

        const toWait = [];
        _.each(model.models, collectionModel => {
          if (collectionModel.store) {
            toWait.push(collectionModel.save(null, options));
          }
        });
        return Promise.all(toWait);
      }

      // early return if no id or cid
      if (!model.id && !model.cid) {
        return Promise.reject(new Error('Invalid model passed to store'));
      }

      const key = model.cid;
      return this.localForage
        .setItem(key, model.toJSON())
        .then(() => Promise.resolve()); // don't return anything to update the model
    });
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
    return this._callWhenReady(() =>
      // eslint-disable-line
      this.localForage.getItem(model.cid).then(data => {
        if (!data) {
          return Promise.reject(
            `LocalForage entry with ${model.cid} as key not found`
          );
        }
        return data;
      })
    );
  }

  // Only used by `Backbone.Collection#sync`.
  findAll() {
    return this._callWhenReady(() => {
      // build up samples
      const models = [];
      return this.localForage
        .iterate(value => {
          models.push(value);
        })
        .then(() => Promise.resolve(models));
    });
  }

  destroy(model) {
    return this._callWhenReady(() => {
      // collection destroy
      if (model instanceof Backbone.Collection) {
        if (!model.models.length) {
          return Promise.resolve();
        }

        const toWait = [];
        // need to clone:
        // http://stackoverflow.com/questions/10858935/cleanest-way-to-destroy-every-model-in-a-collection-in-backbone
        _.each(_.clone(model.models), collectionModel => {
          if (collectionModel.store) toWait.push(collectionModel.destroy());
        });
        return Promise.all(toWait);
      }

      // early return if no id or cid
      if (!model.id && !model.cid) {
        return Promise.reject(new Error('Invalid model passed to store'));
      }

      const key = model.cid;
      return this.localForage
        .removeItem(key)
        .then(() => Promise.resolve(model.toJSON()));
    });
  }

  _callWhenReady(func) {
    const that = this;
    return this.ready.then(() => func.bind(that)());
  }
}

export default Store;
