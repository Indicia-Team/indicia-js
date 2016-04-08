/** *********************************************************************
 * OCCURRENCE
 **********************************************************************/
import $ from 'jquery';
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
    this.setSample(options.sample || this.sample);

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
          image.setOccurrence(that);
          images.push(image);
        } else {
          const modelOptions = _.extend(image, { occurrence: that });
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

  save(attrs, options = {}) {
    if (!this.sample) return false;
    return this.sample.save(attrs, options);
  },

  destroy(options = {}) {
    const dfd = new $.Deferred();

    // removes from all collections etc
    this.stopListening();
    this.trigger('destroy', this, this.collection, options);

    if (this.sample && !options.noSave) {
      const success = options.success;
      options.success = () => {
        dfd.resolve();
        success && success();
      };

      // save the changes permanentely
      this.save(null, options);
    } else {
      dfd.resolve();
      options.success && options.success();
    }

    return dfd.promise();
  },

  /**
   * Sets parent Sample.
   * @param occurrence
   */
  setSample(sample) {
    if (!sample) return;

    const that = this;
    this.sample = sample;
    this.sample.on('destroy', () => {
      that.destroy({ noSave: true });
    });
  },

  /**
   * Adds an image to occurrence and sets the images's occurrence to this.
   * @param image
   */
  addImage(image) {
    if (!image) return;
    image.setOccurrence(this);
    this.images.add(image);
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
