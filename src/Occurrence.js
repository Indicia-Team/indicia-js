/** *********************************************************************
 * OCCURRENCE
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';
import $ from 'jquery';
import helpers from './helpers';
import syncHelpers from './sync_helpers';
import Media from './Media';
import Collection from './Collection';

const Occurrence = Backbone.Model.extend({
  Media,

  constructor(attributes = {}, options = {}) {
    const that = this;
    let attrs = attributes;

    this.id = options.id; // remote ID
    this.cid = options.cid || helpers.getNewUUID();
    this.setParent(options.parent || this.parent);

    this.keys = options.keys || this.keys; // warehouse attribute keys

    if (options.Media) this.Media = options.Media;

    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};

    this.metadata = this._getDefaultMetadata(options);

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

    this.initialize.apply(this, arguments); // eslint-disable-line
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
   * Adds an media to occurrence and sets the medias's parent to this.
   * @param media
   */
  addMedia(mediaObj) {
    if (!mediaObj) return;
    mediaObj.setParent(this);
    this.media.add(mediaObj);
  },

  /**
   * Returns child media.
   * @param index
   * @returns {*}
   */
  getMedia(index = 0) {
    return this.media.at(index);
  },

  // overwrite if you want to validate before saving remotely
  validate(attributes, options = {}) {
    if (options.remote) {
      return this.validateRemote(attributes, options);
    }
    return null;
  },

  validateRemote(attributes) {
    const attrs = _.extend({}, this.attributes, attributes);

    const errors = {};

    // location
    if (!attrs.taxon) {
      errors.taxon = 'can\'t be blank';
    }

    if (!_.isEmpty(errors)) {
      return errors;
    }

    return null;
  },

  toJSON() {
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
      media,
    };
    return data;
  },


  /**
   * Returns an object with attributes and their values
   * mapped for warehouse submission.
   *
   * @returns {*}
   */
  _getSubmission() {
    const that = this;
    const keys = $.extend(true, Occurrence.keys, this.keys); // warehouse keys/values to transform
    const media = _.clone(this.media.models); // all media within this and child models

    const submission = {
      id: this.id,
      external_key: this.cid,
      fields: {},
      media: [],
    };

    if (this.metadata.training) {
      submission.training = this.metadata.training;
    }

    if (this.metadata.release_status) {
      submission.release_status = this.metadata.release_status;
    }

    if (this.metadata.record_status) {
      submission.record_status = this.metadata.record_status;
    }

    if (this.metadata.sensitive) {
      submission.sensitive = this.metadata.sensitive;
    }

    if (this.metadata.confidential) {
      submission.confidential = this.metadata.confidential;
    }

    if (this.metadata.sensitivity_precision) {
      submission.sensitivity_precision = this.metadata.sensitivity_precision;
    }

    // transform attributes
    Object.keys(this.attributes).forEach((attr) => {
      // no need to send attributes with no values
      let value = that.attributes[attr];
      if (!value) return;

      if (!keys[attr]) {
        if (attr !== 'email') {
          console.warn(`Indicia: no such key: ${attr}`);
        }
        submission.fields[attr] = value;
        return;
      }

      const warehouseAttr = keys[attr].id || attr;

      // check if has values to choose from
      if (keys[attr].values) {
        if (typeof keys[attr].values === 'function') {
          // get a value from a function
          value = keys[attr].values(value, submission, that);
        } else {
          value = keys[attr].values[value];
        }
      }

      // don't need to send null or undefined
      if (value) {
        submission.fields[warehouseAttr] = value;
      }
    });


    // transform sub models
    // media does not return any media-models only JSON data about them
    // media files will be attached separately
    const [mediaSubmission] = this.media._getSubmission();
    submission.media = mediaSubmission;

    return [submission, media];
  },

  /**
   * Synchronises the model.
   * @param method
   * @param model
   * @param options
   */
  sync(method, model, options = {}) {
    if (options.remote) {
      return this._syncRemote(method, model, options);
    }

    return Promise.reject(new Error('Local sync is not possible yet.'));
  },


  /**
   * Syncs the record to the remote server.
   * Returns on success: model, response, options
   */
  _syncRemote() {
    return Promise.reject(new Error('Remote sync is not possible yet.'));
  },

  _getDefaultMetadata(options) {
    const metadata = typeof this.metadata === 'function' ?
      this.metadata() : this.metadata;

    options.metadata = options.metadata || {};

    const today = new Date();
    const defaults = {
      training: options.training,

      created_on: today,
      updated_on: today,

      synced_on: null, // set when fully initialized only
      server_on: null, // updated on server
    };

    return $.extend(true, defaults, metadata, options.metadata);
  },
});

_.extend(Occurrence.prototype, syncHelpers);

/**
 * Warehouse attributes and their values.
 */
Occurrence.keys = {
  taxon: {
    id: 'taxa_taxon_list_id',
  },
};

export { Occurrence as default };
