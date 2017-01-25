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
import { SYNCHRONISING, CONFLICT, CHANGED_LOCALLY, CHANGED_SERVER, SYNCED, SERVER, LOCAL } from './constants';
import helpers from './helpers';
import Image from './Image';
import Occurrence from './Occurrence';
import Collection from './Collection';

const Sample = Backbone.Model.extend({
  Image,
  Occurrence,

  constructor(attributes = {}, options = {}) {
    const that = this;
    let attrs = attributes;

    const defaultAttrs = {
      date: new Date(),
      location_type: 'latlon',
    };

    attrs = _.extend(defaultAttrs, attrs);

    this.cid = options.cid || helpers.getNewUUID();
    this.manager = options.manager || this.manager;
    if (this.manager) this.sync = this.manager.sync;

    if (options.Image) this.Image = options.Image;
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

        warehouse_id: null,

        synced_on: null, // set when fully initialized only
        server_on: null, // updated on server
      };
    }

    if (options.occurrences) {
      const occurrences = [];
      _.each(options.occurrences, (occ) => {
        if (occ instanceof that.Occurrence) {
          occ.setSample(that);
          occurrences.push(occ);
        } else {
          const modelOptions = _.extend(occ, { sample: that });
          occurrences.push(new that.Occurrence(occ.attributes, modelOptions));
        }
      });
      this.occurrences = new Collection(occurrences, {
        model: this.Occurrence,
      });
    } else {
      this.occurrences = new Collection([], {
        model: this.Occurrence,
      });
    }

    if (options.images) {
      const images = [];
      _.each(options.images, (image) => {
        if (image instanceof this.Image) {
          image.setParent(that);
          images.push(image);
        } else {
          const modelOptions = _.extend(image, { parent: that });
          images.push(new this.Image(image.attributes, modelOptions));
        }
      });
      this.images = new Collection(images, {
        model: this.Image,
      });
    } else {
      this.images = new Collection([], {
        model: this.Image,
      });
    }

    this.initialize.apply(this, arguments);
  },

  /**
   * Saves the record to the record manager and if valid syncs it with DB
   * Returns on success: model, response, options
   */
  save(options = {}) {
    if (!this.manager) {
      return false;
    }

    // only update local cache and DB
    if (!options.remote) {
      // todo: add attrs if passed to model
      return this.manager.set(this);
    }

    if (this.validate()) {
      return false;
    }

    // remote
    return Backbone.Model.prototype.save.apply(this, [null, options]);
  },

  destroy(options = {}) {
    const promise = new Promise((fulfill, reject) => {
      if (this.manager && !options.noSave) {
        // save the changes permanentely
        this.manager.remove(this).then(fulfill).catch(reject);
      } else {
        // removes from all collections etc
        this.stopListening();
        this.trigger('destroy', this, this.collection, options);

        fulfill();
      }
    });

    return promise;
  },

  /**
   * Adds an occurrence to sample and sets the occurrence's sample to this.
   * @param occurrence
   */
  addOccurrence(occurrence) {
    if (!occurrence) return;
    occurrence.setSample(this);
    this.occurrences.push(occurrence);
  },

  /**
   * Adds an image to occurrence and sets the images's occurrence to this.
   * @param image
   */
  addImage(image) {
    if (!image) return;
    image.setParent(this);
    this.images.add(image);
  },


  validate(attributes) {
    const attrs = _.extend({}, this.attributes, attributes);

    const sample = {};
    const occurrences = {};

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

    // occurrences
    if (this.occurrences.length === 0) {
      sample.occurrences = 'no occurrences';
    } else {
      this.occurrences.each((occurrence) => {
        const errors = occurrence.validate();
        if (errors) {
          const occurrenceID = occurrence.cid;
          occurrences[occurrenceID] = errors;
        }
      });
    }

    if (!_.isEmpty(sample) || !_.isEmpty(occurrences)) {
      const errors = {
        sample,
        occurrences,
      };
      return errors;
    }

    return null;
  },

  /**
   * Returns an object with attributes and their values flattened and
   * mapped for warehouse submission.
   *
   * @param flattener
   * @returns {*}
   */
  flatten(flattener) {
    // images flattened separately
    const flattened = flattener.apply(this, [this.attributes, { keys: Sample.keys }]);

    // occurrences
    _.extend(flattened, this.occurrences.flatten(flattener));
    return flattened;
  },

  toJSON() {
    let occurrences;
    const occurrencesCollection = this.occurrences;
    if (!occurrencesCollection) {
      occurrences = [];
      console.warn('toJSON occurrences missing');
    } else {
      occurrences = occurrencesCollection.toJSON();
    }

    let images;
    const imagesCollection = this.images;
    if (!imagesCollection) {
      images = [];
      console.warn('toJSON images missing');
    } else {
      images = imagesCollection.toJSON();
    }

    const data = {
      id: this.id,
      cid: this.cid,
      metadata: this.metadata,
      attributes: this.attributes,
      occurrences,
      images,
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

    if (meta.warehouse_id) {
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
   * Detach all the listeners.
   */
  offAll() {
    this._events = {};
    this.occurrences.offAll();
    for (let i = 0; i < this.occurrences.data.length; i++) {
      this.occurrences.models[i].offAll();
    }
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
  image: { id: 'image' },
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
