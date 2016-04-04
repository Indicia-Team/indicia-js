/** *********************************************************************
 * MANAGER
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';

import CONST from './constants';
import helpers from './helpers';
import Error from './Error';
import Sample from './Sample';
import Occurrence from './Occurrence';
import Storage from './Storage';

class Manager {
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
  get(model, callback) {
    this.storage.get(model, callback);
  }

  getAll(callback) {
    this.storage.getAll(callback);
  }

  set(model, callback) {
    model._manager = this; // set the manager on new model
    this.storage.set(model, callback);
  }

  remove(model, callback) {
    this.storage.remove(model, callback);
  }

  has(model, callback) {
    this.storage.has(model, callback);
  }

  clear(callback) {
    this.storage.clear(callback);
  }

  sync(model, callback) {
    const that = this;

    if (model instanceof Sample) {
      if (!model.metadata.synchronising) {
        model.metadata.synchronising = true;
        that.sendStored(model, (err) => {
          model.metadata.synchronising = false;
          callback && callback(err);
        });
      }
      return;
    }

    this.get(model, (err, sample) => {
      if (err) {
        callback && callback(err);
        return;
      }

      if (!sample.metadata.synchronising) {
        sample.metadata.synchronising = true;
        that.sendStored(sample, (sendErr) => {
          sample.metadata.synchronising = false;
          callback && callback(sendErr);
        });
      }
    });
  }

  syncAll(callback) {
    const that = this;
    if (!this.synchronising) {
      this.synchronising = true;
      this.sendAllStored((err) => {
        that.synchronising = false;
        callback && callback(err);
      });
    } else {
      that.trigger('sync:done');
      callback && callback();
    }
  }


  /**
   * Sending all saved records.
   *
   * @returns {undefined}
   */
  sendAllStored(callback) {
    const that = this;
    this.getAll((err, samples) => {
      if (err) {
        that.trigger('sync:error');
        callback(err);
        return;
      }

      that.trigger('sync:request');

      // shallow copy
      const remainingSamples = _.extend([], samples.models);

      // recursively loop through samples
      for (let i = 0; i < remainingSamples.length; i++) {
        const sample = remainingSamples[i];
        if (!sample.isValid() || sample.getSyncStatus() === CONST.SYNCED) {
          remainingSamples.splice(i, 1);
          i--; // return the cursor
          continue;
        }

        that.sendStored(sample, (sendErr, sendSample) => {
          if (sendErr) {
            that.trigger('sync:error');
            callback(sendErr);
            return;
          }

          for (let k = 0; k < remainingSamples.length; k++) {
            if (remainingSamples[k].id === sendSample.id ||
              remainingSamples[k].cid === sendSample.cid) {
              remainingSamples.splice(k, 1);
              break;
            }
          }

          if (remainingSamples.length === 0) {
            // finished
            that.trigger('sync:done');
            callback();
          }
        });
      }

      if (!remainingSamples.length) {
        that.trigger('sync:done');
        callback();
      }
    });
  }

  sendStored(sample, callback) {
    const that = this;

    // don't resend
    if (sample.getSyncStatus() === CONST.SYNCED) {
      sample.trigger('sync:done');
      callback && callback(null, sample);
      return;
    }

    // this will be reached only when calling the function directly
    // sendAllStored pre validates so does not reach this point
    if (!sample.isValid()) {
      const invalids = sample.validate();
      callback && callback(invalids);
      return;
    }

    // call user defined onSend function to modify
    const stopSending = this.onSend && this.onSend(sample);
    if (stopSending) {
      callback && callback(null, sample);
      return;
    }

    sample.metadata.synchronising = true;
    sample.trigger('sync:request');

    this.send(sample, (err) => {
      sample.metadata.synchronising = false;
      if (err) {
        sample.trigger('sync:error');
        callback && callback(err);
        return;
      }

      // update sample
      sample.metadata.warehouse_id = 1;
      sample.metadata.server_on = new Date();
      sample.metadata.synced_on = new Date();

      // resize images to snapshots
      sample.resizeImages(() => {
        // save sample
        that.set(sample, (setErr) => {
          if (setErr) {
            sample.trigger('sync:error');
            callback && callback(setErr);
            return;
          }

          sample.trigger('sync:done');
          callback && callback(null, sample);
        });
      });
    });
  }

  /**
   * Sends the saved record
   *
   * @param recordKey
   * @param callback
   * @param onError
   */
  send(sample, callback) {
    const flattened = sample.flatten(this._flattener);
    let formData = new FormData();

    // append images
    let occCount = 0;
    sample.occurrences.each((occurrence) => {
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

    this._post(formData, (err) => {
      callback(err, sample);
    });
  }

  /**
   * Submits the record.
   */
  _post(formData, callback) {
    Backbone.ajax({
      url: this.options.url,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: (val) => {
        callback && callback(null, val);
      },
      error: (jqXHR, textStatus, errorThrown) => {
        const error = new Error({
          number: jqXHR.status,
          message: errorThrown,
        });
        callback && callback(error);
      },
    });
  }

  _attachListeners() {
    const that = this;
    this.storage.on('update', () => {
      that.trigger('update');
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

    for (attr in attributes) {
      if (!keys[attr]) {
        if (attr !== 'email' && attr !== 'usersecret') {
          console.warn(`morel.Manager: no such key: ${attr}`);
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
            flattener: Manager.prototype._flattener,
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

_.extend(Manager.prototype, Backbone.Events);

export { Manager as default };
