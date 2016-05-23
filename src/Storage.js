/** *********************************************************************
 * STORAGE
 **********************************************************************/
import _ from 'underscore';
import Backbone from 'backbone';

import Error from './Error';
import Sample from './Sample';
import Collection from './Collection';
import LocalStorage from './LocalStorage';

class Storage {
  constructor(options = {}) {
    const that = this;

    this.Sample = options.Sample || Sample;
    this.manager = options.manager;

    // internal storage
    this.Storage = options.Storage || LocalStorage;
    this.storage = new this.Storage({
      appname: options.appname,
    });

    // initialize the cache
    this.cache = {};
    this.initialized = false;
    this.storage.getAll((err, data) => {
      data || (data = {});

      const samples = [];
      let sample = null;
      const keys = Object.keys(data);

      for (let i = 0; i < keys.length; i++) {
        const current = data[keys[i]];
        const modelOptions = _.extend(current, { manager: that.manager });
        sample = new that.Sample(current.attributes, modelOptions);
        samples.push(sample);
      }
      that.cache = new Collection(samples, {
        model: that.Sample,
      });
      that._attachListeners();

      that.initialized = true;
      that.trigger('init');
    });
  }

  get(model, callback, options = {}) {
    const that = this;
    if (!this.initialized) {
      this.on('init', () => {
        this.get(model, callback, options);
      });
      return;
    }

    const key = typeof model === 'object' ? model.id || model.cid : model;

    // a non cached version straight from storage medium
    if (options.nonCached) {
      this.storage.get(key, (err, data) => {
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

    callback(null, this.cache.get(key));
  }

  getAll(callback) {
    if (!this.initialized) {
      this.on('init', () => {
        this.getAll(callback);
      });
      return;
    }
    callback(null, this.cache);
  }

  set(model = {}, callback) {
    // early return if no id or cid
    if (!model.id && !model.cid) {
      const error = new Error('Invalid model passed to storage');
      callback(error);
      return;
    }

    // needs to be on and running
    if (!this.initialized) {
      this.on('init', () => {
        this.set(model, callback);
      });
      return;
    }

    const that = this;
    const key = model.id || model.cid;
    this.storage.set(key, model, (err) => {
      if (err) {
        callback && callback(err);
        return;
      }
      that.cache.set(model, { remove: false });
      callback && callback(null, model);
    });
  }

  remove(model, callback) {
    if (!this.initialized) {
      this.on('init', () => {
        this.remove(model, callback);
      });
      return;
    }
    const key = typeof model === 'object' ? model.id || model.cid : model;
    this.storage.remove(key, (err) => {
      if (err) {
        callback && callback(err);
        return;
      }
      delete model.manager;
      model.destroy().then(callback); // removes from cache
    });
  }

  has(model, callback) {
    if (!this.initialized) {
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
    if (!this.initialized) {
      this.on('init', () => {
        this.clear(callback);
      });
      return;
    }
    const that = this;
    this.storage.clear((err) => {
      if (err) {
        callback && callback(err);
        return;
      }
      that.cache.reset();
      callback && callback();
    });
  }

  size(callback) {
    this.storage.size(callback);
  }

  _attachListeners() {
    const that = this;
    // listen on cache because it is last updated
    this.cache.on('update', () => {
      that.trigger('update');
    });
  }
}

// add events
_.extend(Storage.prototype, Backbone.Events);

export { Storage as default };
