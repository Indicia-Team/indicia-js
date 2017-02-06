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
    this.manager = options.manager || this.manager;
    if (this.manager) this.sync = this.manager.sync;

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
   * Saves the record to the record manager and if valid syncs it with DB
   * Returns on success: model, response, options
   */
  save(options = {}) {
    if (this.parent) {
      return this.parent.save(options);
    }

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
        this.manager.remove(this).then(fulfill, reject);
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
  addOccurrence(sample) {
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

  validate(attributes) {
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
        const errors = sample.validate();
        if (errors) {
          const sampleID = sample.cid;
          samples[sampleID] = errors;
        }
      });
    }

    // occurrences
    if (this.occurrences.length) {
      this.occurrences.each((occurrence) => {
        const errors = occurrence.validate();
        if (errors) {
          const occurrenceID = occurrence.cid;
          occurrences[occurrenceID] = errors;
        }
      });
    }

    // todo: validate media

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
