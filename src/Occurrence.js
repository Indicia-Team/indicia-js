/** *********************************************************************
 * OCCURRENCE
 **********************************************************************/
import helpers from './helpers';
import syncHelpers from './sync_helpers';
import Media from './Media';

class Occurrence {
  /**
   * Warehouse attributes and their values.
   */
  static keys = {
    taxon: {
      id: 'taxa_taxon_list_id',
    },
    comment: { id: 'comment' },
  };

  Media = Media;
  keys = Occurrence.keys;

  constructor(attributes = {}, options = {}) {
  
    this.id = options.id; // remote ID
    this.cid = options.cid || helpers.getNewUUID();

    this.setParent(options.parent);

    this.attributes = { ...attributes };

    this.metadata = this._getDefaultMetadata(options);

    this.media = [...options.media].map(media => {
      if (media instanceof this.Media) {
        media.setParent(this);
        return media;
      } else {
        const modelOptions = { ...media, ...{ parent: that } };
        return new this.Media(media.attributes, modelOptions);
      }
    });
  }

  /**
   * Sets parent.
   * todo: move to private _space
   * @param parent
   */
  setParent(parent) {
    if (!parent) return;

    const that = this;
    this.parent = parent;
    this.parent.on('destroy', () => {
      that.destroy({ noSave: true });
    });
  }

  /**
   * Adds an media to occurrence and sets the medias's parent to this.
   * @param media
   */
  addMedia(mediaObj) {
    if (!mediaObj) return;
    mediaObj.setParent(this);
    this.media.add(mediaObj);
  }

  /**
   * Returns child media.
   * @param index
   * @returns {*}
   */
  getMedia(index = 0) {
    return this.media.at(index);
  }

  // overwrite if you want to validate before saving remotely
  validate(attributes, options = {}) {
    if (options.remote) {
      return this.validateRemote(attributes, options);
    }
    return null;
  }

  validateRemote() {
    const attrs = { ...{}, ...this.attributes };
    const media = {};

    const modelErrors = {};

    // location
    if (!attrs.taxon) {
      modelErrors.taxon = "can't be blank";
    }

    // media
    if (this.media.length) {
      this.media.each(mediaModel => {
        const errors = mediaModel.validateRemote();
        if (errors) {
          const mediaID = mediaModel.cid;
          media[mediaID] = errors;
        }
      });
    }

    const errors = {};
    if (Object.keys(media).length) {
      errors.media = media;
    }
    if (Object.keys(modelErrors).length) {
      errors.attributes = modelErrors;
    }

    if (Object.keys(herrors).length) {
      return errors;
    }

    return null;
  }

  toJSON() {
    let media;
    if (!this.media) {
      media = [];
      console.warn('toJSON media missing');
    } else {
      media = this.media.map(m => m.toJSON());
    }
    const data = {
      id: this.id,
      cid: this.cid,
      metadata: this.metadata,
      attributes: this.attributes,
      media,
    };
    return data;
  }

  /**
   * Returns an object with attributes and their values
   * mapped for warehouse submission.
   *
   * @returns {*}
   */
  _getSubmission(options = {}) {
    const that = this;
    const occKeys = typeof this.keys === 'function' ? this.keys() : this.keys;
    const keys = { ...Occurrence.keys, ...occKeys }; // warehouse keys/values to transform
    const media = [...this.media.models]; // all media within this and child models

    const submission = {
      id: this.id,
      external_key: this.cid,
      fields: {},
      media: [],
    };

    if (this.metadata.training || options.training) {
      submission.training = this.metadata.training || options.training;
    }

    if (this.metadata.release_status || options.release_status) {
      submission.release_status =
        this.metadata.release_status || options.release_status;
    }

    if (this.metadata.record_status || options.record_status) {
      submission.record_status =
        this.metadata.record_status || options.record_status;
    }

    if (this.metadata.sensitive || options.sensitive) {
      submission.sensitive = this.metadata.sensitive || options.sensitive;
    }

    if (this.metadata.confidential || options.confidential) {
      submission.confidential =
        this.metadata.confidential || options.confidential;
    }

    if (this.metadata.sensitivity_precision || options.sensitivity_precision) {
      submission.sensitivity_precision =
        this.metadata.sensitivity_precision || options.sensitivity_precision;
    }

    // transform attributes
    Object.keys(this.attributes).forEach(attr => {
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
        } else if (value instanceof Array) {
          // the attribute has multiple values
          value = value.map(v => keys[attr].values[v]);
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
    // media - does not return any media-models only JSON data about them
    let mediaSubmission = [];
    this.media.forEach(model => {
      const [, modelMedia] = model._getSubmission();
      mediaSubmission = mediaSubmission.concat(modelMedia);
    });
    submission.media = mediaSubmission;

    return [submission, media];
  }

  _getDefaultMetadata(options) {
    const metadata =
      typeof this.metadata === 'function' ? this.metadata() : this.metadata;

    options.metadata = options.metadata || {};

    const today = new Date();
    const defaults = {
      training: options.training,

      created_on: today,
      updated_on: today,

      synced_on: null, // set when fully initialized only
      server_on: null, // updated on server
    };

    return { ...defaults, ...metadata, ...options.metadata };
  }
}

// Occurrence.prototype = { ...Occurrence.prototype, ...syncHelpers };

export { Occurrence as default };
