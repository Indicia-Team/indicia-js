/** *********************************************************************
 * SAMPLE
 *
 * Refers to the event in which the sightings were observed, in other
 * words it describes the place, date, people, environmental conditions etc.
 * Within a sample, you can have zero or more occurrences which refer to each
 * species sighted as part of the sample.
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';
import { SYNCHRONISING, CONFLICT, CHANGED_LOCALLY, CHANGED_SERVER, SYNCED,
  SERVER, LOCAL, API_BASE, API_VER, API_SAMPLES_PATH } from './constants';
import helpers from './helpers';
import Media from './Media';
import Occurrence from './Occurrence';
import Collection from './Collection';

const Sample = Backbone.Model.extend({
  Media,
  Occurrence,

  remote_host: null, // must be set up for remote sync
  api_key: null, // must be set up for remote sync

  user: null, // must be set up for remote sync
  password: null, // must be set up for remote sync

  constructor(attributes = {}, options = {}) {
    const that = this;

    this.id = options.id; // remote ID
    this.cid = options.cid || helpers.getNewUUID();
    this.setParent(options.parent || this.parent);

    this.store = options.store || this.store;

    if (options.Media) this.Media = options.Media;
    if (options.Occurrence) this.Occurrence = options.Occurrence;
    if (options.onSend) this.onSend = options.onSend;

    // remote host defaults
    this.remote_host = options.remote_host || this.remote_host;
    this.api_key = options.api_key || this.api_key;
    this.user = options.user || this.user;
    this.password = options.password || this.password;

    // attrs
    this.attributes = {};
    const defaultAttrs = {
      date: new Date(),
      location_type: 'latlon',
    };
    let attrs = _.extend(defaultAttrs, attributes);
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};

    // metadata
    if (options.metadata) {
      this.metadata = options.metadata;
    } else {
      const today = new Date();
      this.metadata = {
        survey_id: null,
        training: false,

        created_on: today,
        updated_on: today,

        synced_on: null, // set when fully initialized only
        server_on: null, // updated on server
      };
    }

    // initialise sub models
    this.occurrences = this._parseModels(options.occurrences, this.Occurrence);
    this.samples = this._parseModels(options.samples, Sample);
    this.media = this._parseModels(options.media, this.Media);

    this.initialize.apply(this, arguments);
  },


  /**
   * Synchronises the model with the collection.
   * @param method
   * @param model
   * @param options
   */
  sync(method, model, options = {}) {
    if (options.remote) {
      return this._syncRemote(method, model, options);
    }

    if (!this.store) {
      return Promise.reject(new Error('Trying to locally save a model without a store'));
    }

    this.trigger('request', model, null, options);
    return this.store.sync(method, model, options);
  },


  /**
   * Syncs the record to the remote server.
   * Returns on success: model, response, options
   */
  _syncRemote(method, model, options) {
    // Ensure that we have a URL.
    if (!this.remote_host) {
      return Promise.reject(new Error('A "url" property or function must be specified'));
    }

    // model.trigger('request', model, xhr, options);
    switch (method) {
      case 'create':
        return this._create(model, options);

      case 'update':
        // todo
        return Promise.resolve();

      case 'read':
        // todo
        return Promise.resolve();

      default:
        return Promise.reject(new Error(`No such remote sync option: ${method}`));
    }
  },

  /**
   * Posts a record to remote server.
   * @param model
   * @param options
   */
  _create(model, options) {
    const that = this;
    model.synchronising = true;

    // async call to get the form data
    return that._getModelFormData(model)
      .then(formData => that._ajaxModel(formData, model, options));
  },

  _ajaxModel(formData, model, options) {
    const that = this;
    // todo: use ajax promise
    const promise = new Promise((fulfill, reject) => {
      // AJAX post
      const url = that.remote_host + API_BASE + API_VER + API_SAMPLES_PATH;
      const xhr = options.xhr = Backbone.ajax({
        url,
        type: 'POST',
        data: formData,
        headers: {
          Authorization: that.getUserAuth(),
        },
        processData: false,
        contentType: false,
        timeout: options.timeout || 30000, // 30s
      });

      function getIDs(subModels = []) {
        const ids = {};
        subModels.forEach((subModel) => {
          ids[subModel.external_key] = subModel.id;
          if (subModel.occurrences) {
            _.extend(ids, getIDs(subModel.occurrences)); // recursive iterate
          }

          // todo: samples & media
        });
        return ids;
      }

      function setModelRemoteID(model, newRemoteIDs) {
        model.id = newRemoteIDs[model.cid];

        // todo
        // if (model.samples) {
        //   model.samples.each((sample) => {
        //     // recursively iterate over samples
        //     setModelRemoteID(sample, newRemoteIDs);
        //   });
        // }

        if (model.occurrences) {
          model.occurrences.each((occurrence) => {
            // recursively iterate over occurrences
            setModelRemoteID(occurrence, newRemoteIDs);
          });
        }

        // todo
        // if (model.media) {
        //   model.media.each((media) => {
        //     // recursively iterate over occurrences
        //     setModelRemoteID(media, newRemoteIDs);
        //   });
        // }
      }

      xhr.done((responseData) => {
        model.synchronising = false;

        // update the model and occurrences with new remote IDs
        const newRemoteIDs = {};
        newRemoteIDs[responseData.data.external_key] = responseData.data.id;
        _.extend(newRemoteIDs, getIDs(responseData.data.subModels));
        setModelRemoteID(model, newRemoteIDs);

        const timeNow = new Date();
        model.metadata.server_on = timeNow;
        model.metadata.updated_on = timeNow;
        model.metadata.synced_on = timeNow;

        fulfill();
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
          fulfill();
          return;
        }

        const error = new Error({ code: jqXHR.status, message: errorThrown });
        model.trigger('error', error);
        reject(error);
      });

      model.trigger('request', model, xhr, options);
    });

    return promise;
  },

  _getModelFormData(model) {
    const that = this;

    const promise = new Promise((fulfill) => {
      let formData = new FormData(); // for submission

      // get submission model and all the media
      const [submission, media] = model._getSubmission();
      formData.append('submission', submission);

      // append media
      that._mediaAppend(media, formData).then(() => {
        // Add authentication and survey id
        formData.append('api_key', that.api_key);
        formData.append('survey_id', that.metadata.survey_id);

        fulfill(formData);
      });
    });

    return promise;
  },

  _mediaAppend(media, formData) {
    const mediaProcesses = [];
    media.forEach((mediaModel) => {
      const imagePromise = new Promise((_fulfill) => {
        const url = mediaModel.getURL();
        const type = mediaModel.get('type');

        function onSuccess(err, img, dataURI, blob) {
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

          formData.append(media.cid, blob, `pic.${extension}`);
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
      mediaProcesses.push(imagePromise);
    });

    return Promise.all(mediaProcesses);
  },

  save(key, val, options) {
    const model = this;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    let attrs;
    if (key == null || typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = _.extend({ validate: true, parse: true }, options);
    const wait = options.wait;

    // If we're not waiting and attributes exist, save acts as
    // `set(attr).save(null, opts)` with validation. Otherwise, check if
    // the model will be valid when the attributes, if any, are set.
    if (attrs && !wait) {
      if (!this.set(attrs, options)) return false;
    } else if (!this._validate(attrs, options)) {
      return false;
    }

    const promise = new Promise((fulfill, reject) => {
      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      const success = options.success;
      const attributes = model.attributes;

      // Set temporary attributes if `{wait: true}` to properly find new ids.
      if (attrs && wait) model.attributes = _.extend({}, attributes, attrs);

      let method = 'create';
      if (!model.isNew() && options.remote) {
        method = options.patch ? 'patch' : 'update';
      }
      if (method === 'patch' && !options.attrs) options.attrs = attrs;

      if (model.parent && !options.remote) {
        // parent save
        model.parent.save(key, val, options)
          .then(() => {
            // Ensure attributes are restored during synchronous saves.
            model.attributes = attributes;
            model.trigger('sync', model, null, options);
            fulfill(model);
          })
          .catch(reject);
      } else {
        // model save
        model.sync(method, model, options)
          .then((resp) => {
            // Ensure attributes are restored during synchronous saves.
            model.attributes = attributes;
            let serverAttrs = options.parse ? model.parse(resp, options) : resp;
            if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
            if (serverAttrs && !model.set(serverAttrs, options)) return false;
            if (success) success.call(options.context, model, resp, options);
            model.trigger('sync', model, resp, options);
            fulfill(model);
            return null;
          })
          .catch((err) => {
            model.trigger('error', err);
            reject(err);
          });
      }

      // Restore attributes.
      model.attributes = attributes;
    });

    return promise;
  },

  // Fetch the model from the server, merging the response with the model's
  // local attributes. Any changed attributes will trigger a "change" event.
  fetch(options) {
    const model = this;
    const promise = new Promise((fulfill, reject) => {
      options = _.extend({ parse: true }, options);
      return this.sync('read', this, options)
        .then((resp) => {
          // set the returned model's data
          model.id = resp.id;
          model.metadata = resp.metadata;
          if (!model.set(resp.attributes, options)) return false;

          // initialise sub models
          model.occurrences = model._parseModels(resp.occurrences, model.Occurrence);
          model.samples = model._parseModels(resp.samples, Sample);
          model.media = model._parseModels(resp.media, model.Media);

          model.trigger('sync', model, resp, options);

          fulfill(model);
          return null;
        })
        .catch(reject);
    });

    return promise;
  },

  /**
   *
   * @param options
   * @returns {Promise}
   */
  destroy(options) {
    const model = this;
    const collection = this.collection; // keep reference for triggering

    const promise = new Promise((fulfill, reject) => {
      function finalise() {
        // removes from all collections etc
        model.stopListening();
        model.trigger('destroy', model, collection, options);

        // parent save the changes permanently
        model.parent.save(null, options).then(() => {
          model.trigger('sync', model, null, options);
          fulfill(model);
        });
      }

      if (model.parent) {
        if (options.remote) {
          // destroy remotely
          model.sync('delete', model, options)
            .then(finalise);
        } else {
          finalise();
        }
      } else {
        // destroy locally/remotely
        model.sync('delete', model, options)
          .then(() => {
            // removes from all collections etc
            model.stopListening();
            model.trigger('destroy', model, collection, options);
            model.trigger('sync', model, null, options);

            fulfill(model);
          })
          .catch(reject);
      }
    });

    return promise;
  },

  /**
   * Sets parent.
   * @param parent
   */
  setParent(parent) {
    if (!parent) return;

    const that = this;
    this.parent = parent;
    this.parent.on('destroy', () => {
      that.destroy({ noSave: true });
    });
  },

  /**
   * Adds a subsample to the sample and sets the samples's parent to this.
   * @param sample
   */
  addSample(sample) {
    if (!sample) return;
    sample.setParent(this);

    this.samples.push(sample);
  },

  /**
   * Adds an occurrence to sample and sets the occurrence's sample to this.
   * @param occurrence
   */
  addOccurrence(occurrence) {
    if (!occurrence) return;
    occurrence.setParent(this);

    this.occurrences.push(occurrence);
  },

  /**
   * Adds an media to occurrence and sets the media's occurrence to this.
   * @param media
   */
  addMedia(media) {
    if (!media) return;
    media.setParent(this);
    this.media.add(media);
  },

// overwrite if you want to validate before saving locally
  validate(attributes, options = {}) {
    if (options.remote) {
      return this.validateRemote(attributes, options);
    }
    return null;
  },

  validateRemote(attributes) {
    const attrs = _.extend({}, this.attributes, attributes);

    const sample = {};
    const samples = {};
    const occurrences = {};
    const media = {};

    // location
    if (!attrs.location) {
      sample.location = 'can\'t be blank';
    }

    // location type
    if (!attrs.location_type) {
      sample.location_type = 'can\'t be blank';
    }

    // date
    if (!attrs.date) {
      sample.date = 'can\'t be blank';
    } else {
      const date = new Date(attrs.date);
      if (date === 'Invalid Date' || date > new Date()) {
        sample.date = (new Date(date) > new Date()) ? 'future date' : 'invalid';
      }
    }

    // check if has any indirect occurrences
    if (!this.samples.length && !this.occurrences.length) {
      sample.occurrences = 'no occurrences';
    }

    // samples
    if (this.samples.length) {
      this.samples.each((model) => {
        const errors = model.validateRemote();
        if (errors) {
          const sampleID = model.cid;
          samples[sampleID] = errors;
        }
      });
    }

    // occurrences
    if (this.occurrences.length) {
      this.occurrences.each((occurrence) => {
        const errors = occurrence.validateRemote();
        if (errors) {
          const occurrenceID = occurrence.cid;
          occurrences[occurrenceID] = errors;
        }
      });
    }

    // todo: validateRemote media

    if (!_.isEmpty(sample) || !_.isEmpty(occurrences)) {
      const errors = {
        sample,
        samples,
        occurrences,
        media,
      };
      return errors;
    }

    return null;
  },

  /**
   * Returns an object with attributes and their values
   * mapped for warehouse submission.
   *
   * @returns {*}
   */
  _getSubmission() {
    const that = this;
    const keys = Sample.keys; // warehouse keys/values to transform
    const media = _.clone(this.media.models); // all media within this and child models

    const submission = {
      id: this.id,
      external_key: this.cid,
      fields: {},
      media: [],
    };

    // add media references
    this.media.models.forEach((model) => {
      submission.media.push(model.cid);
    });

    // transform attributes
    Object.keys(this.attributes).forEach((attr) => {
      // no need to send attributes with no values
      let value = that.attributes[attr];
      if (!value) return;

      if (!keys[attr]) {
        if (attr !== 'email') {
          console.warn(`Morel: no such key: ${attr}`);
        }
        submission.fields[attr] = value;
        return;
      }

      const warehouseAttr = keys[attr].id || attr;

      // check if has values to choose from
      if (keys[attr].values) {
        if (typeof keys[attr].values === 'function') {
          // get a value from a function
          value = keys[attr].values(value, submission);
        } else {
          value = keys[attr].values[value];
        }
      }

      // don't need to send null or undefined
      if (value) {
        submission.fields[warehouseAttr] = value;
      }
    });

    // transform child occurrences
    const [occurrences, occurrencesMedia] = this.occurrences._getSubmission();
    submission.occurrences = occurrences;
    _.extend(media, occurrencesMedia);

    // transform child samples
    const [samples, samplesMedia] = this.samples._getSubmission();
    submission.samples = samples;
    _.extend(media, samplesMedia);

    return [submission, media];
  },

  toJSON() {
    let occurrences;
    if (!this.occurrences) {
      occurrences = [];
      console.warn('toJSON occurrences missing');
    } else {
      occurrences = this.occurrences.toJSON();
    }

    let samples;
    if (!this.samples) {
      samples = [];
      console.warn('toJSON samples missing');
    } else {
      samples = this.samples.toJSON();
    }

    let media;
    if (!this.media) {
      media = [];
      console.warn('toJSON media missing');
    } else {
      media = this.media.toJSON();
    }

    const data = {
      id: this.id,
      cid: this.cid,
      metadata: this.metadata,
      attributes: this.attributes,
      occurrences,
      samples,
      media,
    };

    return data;
  },

  /**
   * Sync statuses:
   * synchronising, synced, remote, server, changed_remotely, changed_server, conflict
   */
  getSyncStatus() {
    const meta = this.metadata;
    // on server
    if (this.synchronising) {
      return SYNCHRONISING;
    }

    if (this.id >= 0) {
      // fully initialized
      if (meta.synced_on) {
        // changed_remotely
        if (meta.synced_on < meta.updated_on) {
          // changed_server - conflict!
          if (meta.synced_on < meta.server_on) {
            return CONFLICT;
          }
          return CHANGED_LOCALLY;
          // changed_server
        } else if (meta.synced_on < meta.server_on) {
          return CHANGED_SERVER;
        }
        return SYNCED;

        // partially initialized - we know the record exists on
        // server but has not yet been downloaded
      }
      return SERVER;

      // local only
    }
    return LOCAL;
  },

  /**
   * Returns occurrence.
   * @param index
   * @returns {*}
   */
  getOccurrence(index = 0) {
    return this.occurrences.at(index);
  },

  /**
   * Returns occurrence.
   * @param index
   * @returns {*}
   */
  getSample(index = 0) {
    return this.samples.at(index);
  },

  getUserAuth() {
    const user = typeof this.user === 'function' ? this.user() : this.user;
    const password = typeof this.password === 'function' ? this.password() : this.password;
    const basicAuth = btoa(`${user}:${password}`);

    return `Basic  ${basicAuth}`;
  },

  _parseModels(models, Model) {
    if (!models) {
      // init empty samples collection
      return new Collection([], { model: Model });
    }

    const that = this;

    const modelsArray = [];
    _.each(models, (model) => {
      if (model instanceof Model) {
        model.setParent(that);
        modelsArray.push(model);
      } else {
        const modelOptions = _.extend(model, { parent: that });
        const newModel = new Model(model.attributes, modelOptions);
        modelsArray.push(newModel);
      }
    });

    return new Collection(modelsArray, { model: Model });
  },

  isNew() {
    return !this.id;
  },
});

/**
 * Warehouse attributes and their values.
 */
Sample.keys = {
  id: { id: 'id' },
  survey: { id: 'survey_id' },
  date: { id: 'date' },
  comment: { id: 'comment' },
  media: { id: 'media' },
  location: { id: 'entered_sref' },
  location_type: {
    id: 'entered_sref_system',
    values: {
      british: 'OSGB', // for British National Grid
      irish: 'OSIE', // for Irish Grid
      latlon: 4326, // for Latitude and Longitude in decimal form (WGS84 datum)
    },
  },
  location_name: { id: 'location_name' },
  form: { id: 'input_form' },
  group: { id: 'group_id' },
  deleted: { id: 'deleted' },
};

export { Sample as default };
