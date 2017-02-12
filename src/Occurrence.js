/** *********************************************************************
 * OCCURRENCE
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';
import helpers from './helpers';
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

    if (options.Media) this.Media = options.Media;

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
      };
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

  save(options = {}) {
    if (!this.parent) return false;
    return this.parent.save(options);
  },

  destroy(options = {}) {
    const promise = new Promise((fulfill) => {
      // removes from all collections etc
      this.stopListening();
      this.trigger('destroy', this, this.collection, options);

      if (this.parent && !options.noSave) {
        // save the changes permanentely
        this.save(options).then(fulfill);
      } else {
        fulfill();
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
   * Adds an media to occurrence and sets the medias's parent to this.
   * @param media
   */
  addMedia(mediaObj) {
    if (!mediaObj) return;
    mediaObj.setParent(this);
    this.media.add(mediaObj);
  },

  // overwrite if you want to validate before saving remotely
  validate(attributes, options = {}) {
    if (options.remote) {
      return this.validateRemote(attributes, options);
    }
    return null;
  },

  validateRemote(attributes, options) {
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
   * Returns an object with attributes and their values flattened and
   * mapped for warehouse submission.
   *
   * @param flattener
   * @returns {*}
   */
  flatten(flattener, count) {
    // images flattened separately
    return flattener.apply(this, [this.attributes, { keys: Occurrence.keys, count }]);
  },
});

/**
 * Warehouse attributes and their values.
 */
Occurrence.keys = {
  taxon: {
    id: '',
  },
  comment: {
    id: 'comment',
  },
};

export { Occurrence as default };
