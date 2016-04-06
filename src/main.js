import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Sample from './Sample';
import Occurrence from './Occurrence';
import Storage from './Storage';
import DatabaseStorage from './DatabaseStorage';
import LocalStorage from './LocalStorage';
import PlainStorage from './PlainStorage';
import Image from './Image';
import Error from './Error';
import CONST from './constants';
import helpers from './helpers';

class Morel {
  constructor(options = {}) {
    this.options = options;

    this.storage = new Storage({
      appname: options.appname,
      Sample: options.Sample,
      Storage: options.Storage,
      manager: this,
    });
    this.onSend = options.onSend;
    this._attachListeners();
    this.synchronising = false;
  }

  // storage functions
  get(model, callback, options) {
    this.storage.get(model, callback, options);
  }

  getAll(callback, options) {
    this.storage.getAll(callback, options);
  }

  set(model, callback, options) {
    model.manager = this; // set the manager on new model
    this.storage.set(model, callback, options);
  }

  remove(model, callback, options) {
    this.storage.remove(model, callback, options);
  }

  has(model, callback, options) {
    this.storage.has(model, callback, options);
  }

  clear(callback, options) {
    this.storage.clear(callback, options);
  }

  /**
   * Synchronises a collection
   * @param collection
   * @param options
   * @returns {*}
   */
  syncAll(method, collection, options = {}) {
    const returnPromise = new $.Deferred();

    // sync all in collection
    function syncEach(collectionToSync) {
      const toWait = [];
      collectionToSync.each((model) => {
        const promise = model.save(null, { remote: true });
        const passingPromise = new $.Deferred();
        if (!promise) {
          // model was invalid
          passingPromise.resolve();
        } else {
          // valid model, but in case it fails sync carry on
          promise.always(() => {
            passingPromise.resolve();
          });
        }
        toWait.push(passingPromise);
      });

      const dfd = $.when.apply($, toWait);
      dfd.then(() => {
        returnPromise.resolve();
        options.success && options.success();
      });
    }

    if (collection) {
      syncEach(collection);
      return returnPromise.promise();
    }

    // get all models to submit
    this.getAll((err, receivedCollection) => {
      if (err) {
        returnPromise.reject();
        callback && callback(err);
        return;
      }

      syncEach(receivedCollection);
    });
    return returnPromise.promise();
  }

  /**
   * Synchronises the model with the remote server.
   * @param method
   * @param model
   * @param options
   */
  sync(method, model, options = {}) {
    // don't resend
    if (model.getSyncStatus() === CONST.SYNCED ||
      model.getSyncStatus() === CONST.SYNCHRONISING) {
      return false;
    }

    options.url = model.manager.options.url; // get the URL

    // on success update the model and save to local storage
    const success = options.success;
    options.success = (successModel, request, successOptions) => {
      // resize images to snapshots
      successModel.resizeImages(() => {
        // save model
        successModel.save(null, {
          success: () => {
            successModel.trigger('sync');
            success && success(model, null, successOptions);
          },
          error: (saveErr) => {
            successModel.trigger('error');
            successOptions.error && successOptions.error(saveErr);
          },
        });
      });
    };

    const xhr = Morel.prototype.post.apply(model.manager, [model, options]);
    return xhr;
  }

  /**
   * Posts a record to remote server.
   * @param model
   * @param options
   */
  post(model, options) {
    // call user defined onSend function to modify
    const stopSending = this.onSend && this.onSend(model);
    if (stopSending) {
      // return since user says invalid
      return false;
    }

    model.metadata.synchronising = true;

    // on success
    const success = options.success;
    options.success = () => {
      model.metadata.synchronising = false;

      // update model
      model.metadata.warehouse_id = 1;
      model.metadata.server_on = new Date();
      model.metadata.synced_on = new Date();

      success && success(model, null, options);
    };

    // on error
    const error = options.error;
    options.error = (xhr, textStatus, errorThrown) => {
      model.metadata.synchronising = false;
      model.trigger('error');

      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // AJAX post
    const formData = this._getModelFormData(model);
    const xhr = options.xhr = Backbone.ajax({
      url: options.url,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: options.success,
      error: options.error,
    });
    model.trigger('request', model, xhr, options);
    return xhr;
  }

  _attachListeners() {
    const that = this;
    this.storage.on('update', () => {
      that.trigger('update');
    });
  }

  _getModelFormData(model) {
    const flattened = model.flatten(this._flattener);
    let formData = new FormData();

    // append images
    let occCount = 0;
    model.occurrences.each((occurrence) => {
      let imgCount = 0;
      occurrence.images.each((image) => {
        const data = image.get('data');
        const type = image.get('type');

        const name = `sc:${occCount}::photo${imgCount}`;
        const blob = helpers.dataURItoBlob(data, type);
        const extension = type.split('/')[1];
        formData.append(name, blob, `pic.${extension}`);
        imgCount++;
      });
      occCount++;
    });

    // append attributes
    const keys = Object.keys(flattened);
    for (let i = 0; i < keys.length; i++) {
      formData.append(keys[i], flattened[keys[i]]);
    }

    // Add authentication
    formData = this.appendAuth(formData);
    return formData;
  }

  _flattener(attributes, options) {
    const flattened = options.flattened || {};
    const keys = options.keys || {};
    const count = options.count;
    let attr = null;
    let name = null;
    let value = null;
    let prefix = '';
    let native = 'sample:';
    let custom = 'smpAttr:';

    if (this instanceof Occurrence) {
      prefix = 'sc:';
      native = '::occurrence:';
      custom = '::occAttr:';
    }

    for (attr in attributes) {
      if (!keys[attr]) {
        if (attr !== 'email' && attr !== 'usersecret') {
          console.warn(`Morel: no such key: ${attr}`);
        }
        flattened[attr] = attributes[attr];
        continue;
      }

      name = keys[attr].id;

      if (!name) {
        name = `${prefix + count}::present`;
      } else {
        if (parseInt(name, 10) >= 0) {
          name = custom + name;
        } else {
          name = native + name;
        }

        if (prefix) {
          name = prefix + count + name;
        }
      }

      // no need to send undefined
      if (!attributes[attr]) continue;

      value = attributes[attr];

      // check if has values to choose from
      if (keys[attr].values) {
        if (typeof keys[attr].values === 'function') {
          const fullOptions = _.extend(options, {
            flattener: Morel.prototype._flattener,
            flattened,
          });

          // get a value from a function
          value = keys[attr].values(value, fullOptions);
        } else {
          value = keys[attr].values[value];
        }
      }

      flattened[name] = value;
    }

    return flattened;
  }

  /**
   * Appends user and app authentication to the passed data object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  appendAuth(data) {
    // app logins
    this._appendAppAuth(data);
    // warehouse data
    this._appendWarehouseAuth(data);

    return data;
  }

  /**
   * Appends app authentication - Appname and Appsecret to
   * the passed object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  _appendAppAuth(data) {
    data.append('appname', this.options.appname);
    data.append('appsecret', this.options.appsecret);

    return data;
  }

  /**
   * Appends warehouse related information - website_id and survey_id to
   * the passed data object.
   * Note: object has to implement 'append' method.
   *
   * This is necessary because the data must be associated to some
   * website and survey in the warehouse.
   *
   * @param data An object to modify
   * @returns {*} An data object
   */
  _appendWarehouseAuth(data) {
    data.append('website_id', this.options.website_id);
    data.append('survey_id', this.options.survey_id);

    return data;
  }
}

_.extend(Morel.prototype, Backbone.Events);

_.extend(Morel, CONST, {
  VERSION: '0', // library version, generated/replaced by grunt

  Sample,
  Occurrence,
  DatabaseStorage,
  LocalStorage,
  PlainStorage,
  Image,
  Error,
});

export { Morel as default };
