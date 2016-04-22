/** *********************************************************************
 * SAMPLE
 *
 * Refers to the event in which the sightings were observed, in other
 * words it describes the place, date, people, environmental conditions etc.
 * Within a sample, you can have zero or more occurrences which refer to each
 * species sighted as part of the sample.
 **********************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';
import CONST from './constants';
import helpers from './helpers';
import Occurrence from './Occurrence';
import Collection from './Collection';

const Sample = Backbone.Model.extend({
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
      this.metadata = {
        created_on: new Date(),
        updated_on: new Date(),

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

    this.initialize.apply(this, arguments);
  },

  /**
   * Saves the record to the record manager and if valid syncs it with DB
   * Returns on success: model, response, options
   */
  save(attrs, options = {}) {
    const model = this;

    if (!this.manager) return false;

    // only update local cache and DB
    if (!options.remote) {
      // todo: add attrs if passed to model
      const deferred = Backbone.$.Deferred();

      this.manager.set(this, (err) => {
        if (err) {
          deferred.reject(err);
          options.error && options.error(err);
          return;
        }
        deferred.resolve(model, {}, options);
        options.success && options.success(model, {}, options);
      });
      return deferred.promise();
    }

    // remote
    const xhr = Backbone.Model.prototype.save.apply(this, arguments);
    return xhr;
  },

  destroy(options = {}) {
    const dfd = new $.Deferred();

    if (this.manager && !options.noSave) {
      // save the changes permanentely
      this.manager.remove(this, (err) => {
        if (err) {
          options.error && options.error(err);
          return;
        }
        dfd.resolve();
        options.success && options.success();
      });
    } else {
      // removes from all collections etc
      this.stopListening();
      this.trigger('destroy', this, this.collection, options);

      dfd.resolve();
      options.success && options.success();
    }

    return dfd.promise();
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
          const occurrenceID = occurrence.id || occurrence.cid;
          occurrences[occurrenceID] = errors;
        }
      });
    }

    if (! _.isEmpty(sample) || ! _.isEmpty(occurrences)) {
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

    const data = {
      id: this.id,
      cid: this.cid,
      metadata: this.metadata,
      attributes: this.attributes,
      occurrences,
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
      return CONST.SYNCHRONISING;
    }

    if (meta.warehouse_id) {
      // fully initialized
      if (meta.synced_on) {
        // changed_locally
        if (meta.synced_on < meta.updated_on) {
          // changed_server - conflict!
          if (meta.synced_on < meta.server_on) {
            return CONST.CONFLICT;
          }
          return CONST.CHANGED_LOCALLY;
          // changed_server
        } else if (meta.synced_on < meta.server_on) {
          return CONST.CHANGED_SERVER;
        }
        return CONST.SYNCED;

        // partially initialized - we know the record exists on
        // server but has not yet been downloaded
      }
      return CONST.SERVER;

      // local only
    }
    return CONST.LOCAL;
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
  deleted: { id: 'deleted' },
};

export { Sample as default };
