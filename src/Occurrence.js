/** *********************************************************************
 * OCCURRENCE
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';
import helpers from './helpers';
import Image from './Image';
import Collection from './Collection';

const Occurrence = Backbone.Model.extend({
  Image,
  constructor(attributes = {}, options = {}) {
    const that = this;
    let attrs = attributes;

    this.cid = options.cid || helpers.getNewUUID();
    this.sample = options.sample;

    if (options.Image) this.Image = options.Image;

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

    if (options.images) {
      const images = [];
      _.each(options.images, (image) => {
        if (image instanceof this.Image) {
          image._occurrence = that;
          images.push(image);
        } else {
          const modelOptions = _.extend(image, { _occurrence: that });
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

  save(callback) {
    if (!this.sample) {
      callback && callback(new Error({ message: 'No sample.' }));
      return;
    }

    this.sample.save(callback);
  },

  destroy(callback, options = {}) {
    if (this.sample && !options.noSave) {
      this.sample.occurrences.remove(this);
      this.save(() => {
        callback && callback();
      });
    } else {
      Backbone.Model.prototype.destroy.call(this);
    }
  },

  validate(attributes) {
    const attrs = _.extend({}, this.attributes, attributes);

    const errors = {};

    // location
    if (!attrs.taxon) {
      errors.taxon = 'can\'t be blank';
    }

    if (! _.isEmpty(errors)) {
      return errors;
    }

    return null;
  },

  toJSON() {
    const data = {
      id: this.id,
      cid: this.cid,
      metadata: this.metadata,
      attributes: this.attributes,
      images: this.images.toJSON(),
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
