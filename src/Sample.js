/** *********************************************************************
 * SAMPLE
 *
 * Refers to the event in which the sightings were observed, in other
 * words it describes the place, date, people, environmental conditions etc.
 * Within a sample, you can have zero or more subModels which refer to each
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

    this.type = 'sample';
    this.id = options.id; // remote ID
    this.cid = options.cid || helpers.getNewUUID();
    this.setParent(options.parent || this.parent);
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

        synced_on: null, // set when fully initialized only
        server_on: null, // updated on server
      };
    }

    if (options.subModels) {
      const subModels = [];
      _.each(options.subModels, (subModel) => {
        if (subModel instanceof that.Occurrence || subModel instanceof Sample) {
          subModel.setParent(that);
          subModels.push(subModel);
        } else {
          const modelOptions = _.extend(subModel, { parent: that });
          let newSubModel;
          if (subModel.type === 'sample') {
            newSubModel = new Sample(subModel.attributes, modelOptions);
          } else {
            newSubModel = new that.Occurrence(subModel.attributes, modelOptions);
          }
          subModels.push(newSubModel);
        }
      });
      this.subModels = new Collection(subModels, {
        model: this.Occurrence,
      });
    } else {
      this.subModels = new Collection([], {
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
   * Adds an subModel to sample and sets the subModel's sample to this.
   * @param subModel
   */
  addSubModel(subModel) {
    if (!subModel) return;
    subModel.setParent(this);
    this.subModels.push(subModel);
  },

  /**
   * Adds an image to subModel and sets the images's subModel to this.
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
    const subModels = {};

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

    // subModels
    if (this.subModels.length === 0) {
      sample.subModels = 'no subModels';
    } else {
      this.subModels.each((subModel) => {
        const errors = subModel.validate();
        if (errors) {
          const subModelID = subModel.cid;
          subModels[subModelID] = errors;
        }
      });
    }

    if (!_.isEmpty(sample) || !_.isEmpty(subModels)) {
      const errors = {
        sample,
        subModels,
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

    // subModels
    _.extend(flattened, this.subModels.flatten(flattener));
    return flattened;
  },

  toJSON() {
    let subModels;
    const subModelsCollection = this.subModels;
    if (!subModelsCollection) {
      subModels = [];
      console.warn('toJSON subModels missing');
    } else {
      subModels = subModelsCollection.toJSON();
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
      type: this.type,
      id: this.id,
      cid: this.cid,
      metadata: this.metadata,
      attributes: this.attributes,
      subModels,
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
   * Detach all the listeners.
   */
  offAll() {
    this._events = {};
    this.subModels.offAll();
    for (let i = 0; i < this.subModels.data.length; i++) {
      this.subModels.models[i].offAll();
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
