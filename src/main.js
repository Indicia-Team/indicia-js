import _ from 'underscore';
import Backbone from 'backbone';
import Sample from './Sample';
import Occurrence from './Occurrence';
import Storage from './Storage';
import ImageModel from './Image';
import Error from './Error';
import * as CONST from './constants';
import helpers from './helpers';

class Morel {
  constructor(options = {}) {
    this.options = options;
    options.manager = this;

    this.storage = new Storage(options);
    this.onSend = options.onSend;
    this._attachListeners();
    this.synchronising = false;
  }

  // storage functions
  get(model, options) {
    return this.storage.get(model, options);
  }

  getAll(options) {
    return this.storage.getAll(options);
  }

  set(model, options) {
    if (model instanceof Sample) {
      // not JSON but a whole sample model
      model.manager = this; // set the manager on new model
    }
    return this.storage.set(model, options);

    // this.storage.set(model, (...args) => {
    //   this._addReference(model);
    //   callback && callback(args);
    // }, options);
  }

  remove(model, options) {
    return this.storage.remove(model, options);

    // this.storage.remove(model, (...args) => {
    //   this._removeReference(model);
    //   callback && callback(args);
    // }, options);
  }

  has(model, options) {
    return this.storage.has(model, options);
  }

  clear(options) {
    return this.storage.clear(options);
  }

  /**
   * Synchronises a collection
   * @param collection
   * @param options
   * @returns {*}
   */
  syncAll(method, collection, options = {}) {
    // sync all in collection
    function syncEach(collectionToSync) {
      const toWait = [];
      collectionToSync.each((model) => {
        // todo: reuse the passed options model
        const xhr = model.save({
          remote: true,
          timeout: options.timeout,
        });
        let syncPromise;
        if (!xhr) {
          // model was invalid
          syncPromise = Promise.resolve();
        } else {
          // valid model, but in case it fails sync carry on
          syncPromise = new Promise((fulfillSync) => {
            xhr.then(fulfillSync, fulfillSync);
          });
        }
        toWait.push(syncPromise);
      });

      // after all is synced
      return Promise.all(toWait);
    }

    if (collection) {
      return syncEach(collection);
    }

    // get all models to submit
    return this.getAll().then(syncEach);
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

    const promise = new Promise((fulfill, reject) => {
      options.host = model.manager.options.host; // get the URL

      Morel.prototype.post.apply(model.manager, [model, options])
        .then((successModel) => {
          // on success update the model and save to local storage
          successModel.save().then(() => {
            successModel.trigger('sync');
            fulfill(successModel);
          });
        })
        .catch(reject);
    });

    return promise;
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

    // async call to get the form data
    return that._getModelFormData(model)
      .then(formData => Morel._ajaxModel(formData, model, options));
  }

  static _ajaxModel(formData, model, options) {
    // todo: use ajax promise
    const promise = new Promise((fulfill, reject) => {
      // AJAX post
      const fullSamplePostPath = CONST.API_BASE + CONST.API_VER + CONST.API_SAMPLES_PATH;
      const xhr = options.xhr = Backbone.ajax({
        url: options.host + fullSamplePostPath,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        timeout: options.timeout || 30000, // 30s
      });

      function getIDs(submodels = []) {
        const ids = {};
        submodels.forEach((submodel) => {
          ids[submodel.external_key] = submodel.id;
          if (submodel.subModels) {
            _.extend(ids, getIDs(submodel.subModels)); // recursive iterate
          }
        });
        return ids;
      }

      function setModelRemoteID(model, newRemoteIDs) {
        model.id = newRemoteIDs[model.cid];

        if (model.subModels) {
          model.subModels.each((subModel) => {
            // recursively iterate over submodels
            setModelRemoteID(subModel, newRemoteIDs);
          });
        }
      }

      xhr.done((responseData) => {
        model.synchronising = false;

        // update the model and submodels with new remote IDs
        const newRemoteIDs = {};
        newRemoteIDs[responseData.data.external_key] = responseData.data.id;
        _.extend(newRemoteIDs, getIDs(responseData.data.subModels));
        setModelRemoteID(model, newRemoteIDs);

        const timeNow = new Date();
        model.metadata.server_on = timeNow;
        model.metadata.updated_on = timeNow;
        model.metadata.synced_on = timeNow;

        model.save().then(fulfill);
      });

      xhr.fail((jqXHR, textStatus, errorThrown) => {
        model.synchronising = false;

        if (errorThrown === 'Conflict') {
          // duplicate occurred
          const newRemoteIDs = {};
          jqXHR.responseJSON.errors.forEach((error) => {
            newRemoteIDs[model.cid] = error.sample_id;
            newRemoteIDs[error.external_key] = error.id;
          });
          setModelRemoteID(model, newRemoteIDs);

          const timeNow = new Date();
          model.metadata.server_on = timeNow;
          model.metadata.updated_on = timeNow;
          model.metadata.synced_on = timeNow;
          model.save().then(fulfill);
          return;
        }

        model.trigger('error');

        const error = new Error({ code: jqXHR.status, message: errorThrown });
        reject(error);
      });

      model.trigger('request', model, xhr, options);
    });

    return promise;
  }

  _attachListeners() {
    const that = this;
    this.storage.on('update', () => {
      that.trigger('update');
    });
  }

  _getModelFormData(model) {
    const promise = new Promise((fulfill) => {
      const flattened = model.flatten(this._flattener);
      let formData = new FormData();

      // append images
      let occCount = 0;
      const subModelProcesses = [];
      model.subModels.each((subModel) => {
        // on async run occCount will be incremented before used for image name
        const localOccCount = occCount;
        let imgCount = 0;

        const imageProcesses = [];

        subModel.images.each((image) => {
          const imagePromise = new Promise((_fulfill) => {
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
              _fulfill();
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
          imageProcesses.push(imagePromise);
        });

        subModelProcesses.push(Promise.all(imageProcesses));
        occCount++;
      });

      Promise.all(subModelProcesses).then(() => {
        // append attributes
        const keys = Object.keys(flattened);
        for (let i = 0; i < keys.length; i++) {
          formData.append(keys[i], flattened[keys[i]]);
        }

        // Add authentication
        formData = this.appendAuth(formData);
        fulfill(formData);
      });
    });

    return promise;
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
    const cid = this.cid;
    if (cid) {
      if (this instanceof Occurrence) {
        flattened[`${prefix + count + native}external_key`] = cid;
      } else {
        flattened[`${native}external_key`] = this.cid;
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
   * Appends app authentication to the passed object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  _appendAppAuth(data) {
    data.append('api_key', this.options.api_key);

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

  // _addReference(model) {
  //   model.on('all', this._onSampleEvent, this);
  // }
  //
  // _removeReference(model) {
  //   model.off('all', this._onSampleEvent, this);
  // }
  //
  // _onSampleEvent(...args) {
  //   this.trigger.apply(this, args);
  // }
}

_.extend(Morel.prototype, Backbone.Events);

_.extend(Morel, CONST, {
  /* global LIB_VERSION */
  VERSION: LIB_VERSION, // replaced by build

  Sample,
  Occurrence,
  Image: ImageModel,
  Error,
});

export { Morel as default };
