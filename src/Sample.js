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

  constructor(attributes = {}, options = {}) {
    const that = this;
    let attrs = attributes;

    const defaultAttrs = {
      date: new Date(),
      location_type: 'latlon',
    };

    attrs = _.extend(defaultAttrs, attrs);

    this.id = options.id; // remote ID
    this.cid = options.cid || helpers.getNewUUID();
    this.setParent(options.parent || this.parent);
    this.storage = options.storage || this.storage;

    if (options.Media) this.Media = options.Media;
    if (options.Occurrence) this.Occurrence = options.Occurrence;
    if (options.onSend) this.onSend = options.onSend;

    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};

    if (options.metadata) {
      this.metadata = options.metadata;
    } else {
      const today = new Date();
      this.metadata = {
        created_on: today,
        updated_on: today,

        synced_on: null, // set when fully initialized only
        server_on: null, // updated on server
      };
    }

    if (options.occurrences) {
      // fill in existing ones
      const occurrences = [];
      _.each(options.occurrences, (occurrence) => {
        if (occurrence instanceof that.Occurrence) {
          occurrence.setParent(that);
          occurrences.push(occurrence);
        } else {
          const modelOptions = _.extend(occurrence, { parent: that });
          const newOccurrence = new that.Occurrence(occurrence.attributes, modelOptions);
          occurrences.push(newOccurrence);
        }
      });
      this.occurrences = new Collection(occurrences, { model: this.Occurrence });
    } else {
      // init empty occurrences collection
      this.occurrences = new Collection([], { model: this.Occurrence });
    }

    if (options.samples) {
      // fill in existing ones
      const samples = [];
      _.each(options.samples, (sample) => {
        if (sample instanceof Sample) {
          sample.setParent(that);
          samples.push(sample);
        } else {
          const modelOptions = _.extend(sample, { parent: that });
          const newSample = new Sample(sample.attributes, modelOptions);
          samples.push(newSample);
        }
      });
      this.samples = new Collection(samples, { model: Sample });
    } else {
      // init empty occurrences collection
      this.samples = new Collection([], { model: Sample });
    }

    if (options.media) {
      const mediaArray = [];
      _.each(options.media, (media) => {
        if (media instanceof this.Media) {
          media.setParent(that);
          mediaArray.push(media);
        } else {
          const modelOptions = _.extend(media, { parent: that });
          mediaArray.push(new this.Media(media.attributes, modelOptions));
        }
      });
      this.media = new Collection(mediaArray, {
        model: this.Media,
      });
    } else {
      this.media = new Collection([], {
        model: this.Media,
      });
    }

    this.initialize.apply(this, arguments);
  },


  /**
   * Synchronises the model with the remote server.
   * @param method
   * @param model
   * @param options
   */
  sync(method, model, options = {}) {
    if (options.local) {
      return this._syncLocal(method, model, options);
    }

    const that = this;

    // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    const methodMap = {
      create: 'POST',
      update: 'PUT',
      patch: 'PATCH',
      delete: 'DELETE',
      read: 'GET',
    };

    const type = methodMap[method];

    // Default JSON-request options.
    const params = { type };

    // Ensure that we have a URL.
    params.url = options.url || _.result(model, 'url');
    if (!params.url) {
      throw new Error('A "url" property or function must be specified')
    }

    // model.trigger('request', model, xhr, options);
    const promise = new Promise((fulfill, reject) => {
      switch (method) {
        case 'create':
          that.post(model, options)
            .then((successModel) => {
              successModel.trigger('sync');
              fulfill(successModel);
            })
            .catch(reject);
          break;

        case 'read':
          // todo
          break;

        default:
      }
    });

    return promise;
  },


  /**
   * Saves the record to the record storage and if valid syncs it with DB
   * Returns on success: model, response, options
   */
  _syncLocal(method, model, options) {
    switch (method) {
      case 'create':
        if (this.parent) {
          return this.parent.sync(method, model, options);
        }

        if (!this.storage) {
          return false;
        }

        return this.storage.set(this);

      case 'delete':
        const promise = new Promise((fulfill, reject) => {
          if (this.storage && !options.noSave) {
            // save the changes permanentely
            this.storage.remove(this).then(fulfill, reject);
          } else {
            // removes from all collections etc
            this.stopListening();
            this.trigger('destroy', this, this.collection, options);

            if (this.parent && !options.noSave) {
              // save the changes permanentely
              this.save(options).then(fulfill);
            } else {
              fulfill();
            }
          }
        });

        return promise;
      default:
        return null;
    }
  },

  /**
   * Posts a record to remote server.
   * @param model
   * @param options
   */
  post(model, options) {
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
      const fullSamplePostPath = API_BASE + API_VER + API_SAMPLES_PATH;
      const xhr = options.xhr = Backbone.ajax({
        url: options.host + fullSamplePostPath,
        type: 'POST',
        data: formData,
        headers: {
          Authorization: `Basic  ${that.getUserAuth()}`,
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

        model.trigger('error');

        const error = new Error({ code: jqXHR.status, message: errorThrown });
        reject(error);
      });

      model.trigger('request', model, xhr, options);
    });

    return promise;
  },

  _getModelFormData(model) {
    const promise = new Promise((fulfill) => {
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

        occurrence.media.each((image) => {
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
        fulfill(formData);
      });
    });

    return promise;
  },

  destroy(options) {
    options = options ? _.clone(options) : {};
    var model = this;
    var success = options.success;
    var wait = options.wait;

    var destroy = function() {
      model.stopListening();
      model.trigger('destroy', model, model.collection, options);
    };

    options.success = function(resp) {
      if (wait) destroy();
      if (success) success.call(options.context, model, resp, options);
      if (!model.isNew()) model.trigger('sync', model, resp, options);
    };

    var xhr = false;
    if (!options.local && this.isNew()) {
      _.defer(options.success);
    } else {
      wrapError(this, options);
      xhr = this.sync('delete', this, options);
    }
    if (!wait) destroy();
    return xhr;
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

  validate(attributes, options = {}) {
    if (options.local) {
      return this.validateLocal(attributes, options);
    }

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
        sample.date = (new Date(date) > new Date) ? 'future date' : 'invalid';
      }
    }

    // check if has any indirect occurrences
    if (!this.samples.length && !this.occurrences.length) {
      sample.occurrences = 'no occurrences';
    }

    // samples
    if (this.samples.length) {
      this.samples.each((sample) => {
        const errors = sample.validateLocal();
        if (errors) {
          const sampleID = sample.cid;
          samples[sampleID] = errors;
        }
      });
    }

    // occurrences
    if (this.occurrences.length) {
      this.occurrences.each((occurrence) => {
        const errors = occurrence.validateLocal();
        if (errors) {
          const occurrenceID = occurrence.cid;
          occurrences[occurrenceID] = errors;
        }
      });
    }

    // todo: validateLocal media

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

  validateLocal() {
    // overwrite if you want to validate before saving locally
  },

  /**
   * Returns an object with attributes and their values flattened and
   * mapped for warehouse submission.
   *
   * @param flattener
   * @returns {*}
   */
  flatten(flattener) {
    // media flattened separately
    const flattened = flattener.apply(this, [this.attributes, { keys: Sample.keys }]);

    // occurrences
    _.extend(flattened, this.occurrences.flatten(flattener));
    return flattened;
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
   * synchronising, synced, local, server, changed_locally, changed_server, conflict
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
        // changed_locally
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
