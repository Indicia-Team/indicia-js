/** *********************************************************************
 * IMAGE
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';

import helpers from './helpers';
import Error from './Error';

const THUMBNAIL_WIDTH = 100; // px
const THUMBNAIL_HEIGHT = 100; // px

const ImageModel = Backbone.Model.extend({
  constructor(attributes = {}, options = {}) {
    let attrs = attributes;
    if (typeof attributes === 'string') {
      const data = attributes;
      attrs = { data };
      return;
    }

    this.cid = options.cid || helpers.getNewUUID();
    this._occurrence = options._occurrence;
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

    this.initialize.apply(this, arguments);
  },

  save(callback) {
    if (!this._occurrence) {
      callback && callback(new Error({ message: 'No occurrence.' }));
      return;
    }

    this._occurrence.save(callback);
  },

  destroy(callback) {
    if (this._occurrence) {
      this._occurrence.images.remove(this);
      this.save(() => {
        callback && callback();
      });
    } else {
      Backbone.Model.prototype.destroy.call(this);
    }
  },

  /**
   * Resizes itself.
   */
  resize(MAX_WIDTH, MAX_HEIGHT, callback) {
    const that = this;
    ImageModel.resize(this.attributes.data, this.attributes.type, MAX_WIDTH, MAX_HEIGHT,
      (err, image, data) => {
        if (err) {
          callback && callback(err);
          return;
        }
        that.attributes.data = data;
        callback && callback(null, image, data);
      });
  },

  /**
   * Adds a thumbnail to image model.
   * @param callback
   * @param options
   */
  addThumbnail(callback, options = {}) {
    const that = this;
    // check if data source is dataURI

    const re = /^data:/i;
    if (re.test(this.attributes.data)) {
      ImageModel.resize(
        this.attributes.data,
        this.attributes.type,
        THUMBNAIL_WIDTH || options.width,
        THUMBNAIL_WIDTH || options.width,
        (err, image, data) => {
          that.set('thumbnail', data);
          callback && callback();
        });
      return;
    }

    ImageModel.getDataURI(this.attributes.data, (err, data) => {
      that.set('thumbnail', data);
      callback && callback();
    }, {
      width: THUMBNAIL_WIDTH || options.width,
      height: THUMBNAIL_HEIGHT || options.height,
    });
  },

  toJSON() {
    const data = {
      id: this.id,
      metadata: this.metadata,
      attributes: this.attributes,
    };
    return data;
  },
});

_.extend(ImageModel, {
  /**
   * Transforms and resizes an image file into a string.
   * Can accept file image path and a file input file.
   *
   * @param onError
   * @param file
   * @param onSaveSuccess
   * @returns {number}
   */
  getDataURI(file, callback, options = {}) {
    // file paths
    if (typeof file === 'string') {
      // get extension
      const fileType = file.replace(/.*\.([a-z]+)$/i, '$1');
      ImageModel.resize(file, fileType, options.width, options.height, (err, image, dataURI) => {
        callback(null, dataURI, fileType);
      });
      return;
    }

    // file inputs
    if (!window.FileReader) {
      const message = 'No File Reader';
      const error = new Error(message);
      console.error(message);

      callback(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      if (options.width || options.height) {
        // resize
        ImageModel.resize(event.target.result, file.type, options.width, options.height, (err, image, dataURI) => {
          callback(null, dataURI, file.type);
        });
      } else {
        callback(null, event.target.result, file.type);
      }
    };
    reader.readAsDataURL(file);
    return;
  },

  /**
   * http://stackoverflow.com/questions/2516117/how-to-scale-an-image-in-data-uri-format-in-javascript-real-scaling-not-usin
   * @param data
   * @param width
   * @param height
   * @param callback
   */
  resize(data, fileType, MAX_WIDTH, MAX_HEIGHT, callback) {
    const image = new window.Image(); // native one

    image.onload = () => {
      let width = image.width;
      let height = image.height;
      let canvas = null;
      let res = null;

      // resizing
      if (width > height) {
        res = width / MAX_WIDTH;
      } else {
        res = height / MAX_HEIGHT;
      }

      width = width / res;
      height = height / res;

      // Create a canvas with the desired dimensions
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // Scale and draw the source image to the canvas
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);

      // Convert the canvas to a data URL in some format
      callback(null, image, canvas.toDataURL(fileType));
    };

    image.src = data;
  },
});

export { ImageModel as default };
