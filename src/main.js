import _ from 'underscore';
import Backbone from 'backbone';
import Sample from './Sample';
import Occurrence from './Occurrence';
import Storage from './Storage';
import DatabaseStorage from './DatabaseStorage';
import LocalStorage from './LocalStorage';
import ImageModel from './Image';
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
    let syncAllPromiseResolve;
    let syncAllPromiseReject;
    const returnPromise = new Promise((fulfill, reject) => {
      syncAllPromiseResolve = fulfill;
      syncAllPromiseReject = reject;
    });

    // sync all in collection
    function syncEach(collectionToSync) {
      const toWait = [];
      collectionToSync.each((model) => {
        // todo: reuse the passed options model
        const xhr = model.save(null, {
          remote: true,
          timeout: options.timeout,
        });
        let syncPromise;
        if (!xhr) {
          // model was invalid
          syncPromise = Promise.resolve();
        } else {
          // valid model, but in case it fails sync carry on
          syncPromise = new Promise((fulfill) => {
            xhr.then(() => {
              fulfill();
            }).catch(() => {
              fulfill();
            });
          });
        }
        toWait.push(syncPromise);
      });

      Promise.all(toWait).then(() => {
        // after all is synced
        syncAllPromiseResolve();
        options.success && options.success();
      });
    }

    if (collection) {
      syncEach(collection);
      return returnPromise;
    }

    // get all models to submit
    this.getAll((err, receivedCollection) => {
      if (err) {
        syncAllPromiseReject();
        options.error && options.error(err);
        return;
      }

      syncEach(receivedCollection);
    });
    return returnPromise;
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
    options.success = (successModel) => {
      successModel.save().then(() => {
        successModel.trigger('sync');
        success && success();
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
    const that = this;
    // call user defined onSend function to modify
    const onSend = model.onSend || this.onSend;
    const stopSending = onSend && onSend(model);
    if (stopSending) {
      // return since user says invalid
      return false;
    }

    model.synchronising = true;

    // on success
    const success = options.success;
    options.success = () => {
      model.synchronising = false;

      // update model
      model.metadata.warehouse_id = 1;
      model.metadata.server_on =
      model.metadata.updated_on =
      model.metadata.synced_on = new Date();

      success && success(model, null, options);
    };

    // on error
    const error = options.error;
    options.error = (xhr, textStatus, errorThrown) => {
      model.synchronising = false;
      model.trigger('error');

      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    const promise = new Promise((fulfill, reject) => {
      // async call to get the form data
      that._getModelFormData(model, (err, formData) => {
        // AJAX post
        const xhr = options.xhr = Backbone.ajax({
          url: options.url,
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          timeout: options.timeout || 30000, // 30s
          success: options.success,
          error: options.error,
        });

        // also resolve the promise
        xhr.done((data, textStatus, jqXHR) => {
          fulfill(data, textStatus, jqXHR);
        });
        xhr.fail((jqXHR, textStatus, errorThrown) => {
          reject(jqXHR, textStatus, errorThrown);
        });
        model.trigger('request', model, xhr, options);
      });
    });

    return promise;
  }

  _attachListeners() {
    const that = this;
    this.storage.on('update', () => {
      that.trigger('update');
    });
  }

  _getModelFormData(model, callback) {
    const flattened = model.flatten(this._flattener);
    let formData = new FormData();

    // append images
    let occCount = 0;
    const occurrenceProcesses = [];
    model.occurrences.each((occurrence) => {
      // on async run occCount will be incremented before used for image name
      const localOccCount = occCount;
      let imgCount = 0;

      const imageProcesses = [];

      occurrence.images.each((image) => {
        let imagePromiseResolve;
        const imagePromise = new Promise((fulfill) => {
          imagePromiseResolve = fulfill;
        });
        imageProcesses.push(imagePromise);

        const url = image.getURL();
        const type = image.get('type');

        function onSuccess(err, img, dataURI, blob) {
          const name = `sc:${localOccCount}::photo${imgCount}`;

          // can provide both image/jpeg and jpeg
          let extension = type;
          let mediaType = type;
          if (type.match(/image.*/)) {
            extension = type.split('/')[1];
          } else {
            mediaType = `image/${mediaType}`;
          }
          if (!blob) {
            blob = helpers.dataURItoBlob(dataURI, mediaType);
          }

          formData.append(name, blob, `pic.${extension}`);
          imgCount++;
          imagePromiseResolve();
        }

        if (!helpers.isDataURL(url)) {
          // load image
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.responseType = 'blob';
          xhr.onload = () => {
            onSuccess(null, null, null, xhr.response);
          };
          // todo check error case

          xhr.send();
        } else {
          onSuccess(null, null, url);
        }
      });

      occurrenceProcesses.push(Promise.all(imageProcesses));
      occCount++;
    });

    Promise.all(occurrenceProcesses).then(() => {
      // append attributes
      const keys = Object.keys(flattened);
      for (let i = 0; i < keys.length; i++) {
        formData.append(keys[i], flattened[keys[i]]);
      }

      // Add authentication
      formData = this.appendAuth(formData);
      callback(null, formData);
    });
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

    // add external ID
    const id = this.cid || this.id;
    if (id) {
      if (this instanceof Occurrence) {
        flattened[`${prefix + count + native}external_key`] = id;
      } else {
        flattened[`${native}external_key`] = this.cid || this.id;
      }
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

      // don't need to send null or undefined
      if (value) {
        flattened[name] = value;
      }
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
  /* global LIB_VERSION */
  VERSION: LIB_VERSION, // replaced by build

  Sample,
  Occurrence,
  DatabaseStorage,
  LocalStorage,
  Image: ImageModel,
  Error,
});

export { Morel as default };
