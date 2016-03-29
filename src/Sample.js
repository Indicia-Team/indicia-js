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
import CONST from './constants';
import helpers from './helpers';
import Occurrence from './Occurrence';
import Collection from './Collection';

const Sample = Backbone.Model.extend({
  Occurrence,

  constructor(attributes, options) {
    const that = this;
    let attrs = attributes;

    if (!attrs) {
      attrs = {
        date: new Date(),
        location_type: 'latlon',
      };
    }

    options || (options = {});
    this.cid = options.cid || helpers.getNewUUID();
    this._manager = options._manager;
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
          occ._sample = that;
          occurrences.push(occ);
        } else {
          const modelOptions = _.extend(occ, { _sample: that });
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
   */
  save(callback) {
    const that = this;
    if (!this._manager) {
      callback && callback(new Error({ message: 'No manager.' }));
      return;
    }

    this._manager.set(this, () => {
      // todo sync
      callback && callback(null, that);
    });
  },

  destroy(callback) {
    if (this._manager) {
      this._manager.remove(this, callback);
    } else {
      // remove from all collections it belongs
      Backbone.Model.prototype.destroy.call(this);
      callback && callback();
    }
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
    const data = {
      id: this.id,
      cid: this.cid,
      metadata: this.metadata,
      attributes: this.attributes,
      occurrences: this.occurrences.toJSON(),
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
    if (meta.synchronising) {
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
