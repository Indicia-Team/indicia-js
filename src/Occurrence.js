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

    this.id = options.id; // remote ID
    this.cid = options.cid || helpers.getNewUUID();
    this.setParent(options.parent || this.parent);

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
   * Adds an image to occurrence and sets the images's parent to this.
   * @param image
   */
  addImage(image) {
    if (!image) return;
    image.setParent(this);
    this.images.add(image);
  },

  validate(attributes) {
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
      images,
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
