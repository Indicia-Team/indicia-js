/** *********************************************************************
 * IMAGE
 **********************************************************************/
import $ from 'jquery';
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
    this.setParent(options.parent || this.parent);

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
        return;
      }
      fulfill();
    });

    return promise;
  },

  /**
   * Returns image's absolute URL or dataURI.
   */
  getURL() {
    return this.get('data');
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
   * Resizes itself.
   */
  resize(MAX_WIDTH, MAX_HEIGHT) {
    const that = this;
    const promise = new Promise((fulfill, reject) => {
      ImageModel.resize(this.getURL(), this.get('type'), MAX_WIDTH, MAX_HEIGHT)
        .then((args) => {
          const [image, data] = args;
          that.set('data', data);
          fulfill([image, data]);
        })
        .catch(reject);
    });
    return promise;
  },

  /**
   * Adds a thumbnail to image model.
   * @param options
   */
  addThumbnail(options = {}) {
    const that = this;

    const promise = new Promise((fulfill, reject) => {
      // check if data source is dataURI
      const re = /^data:/i;
      if (re.test(this.getURL())) {
        ImageModel.resize(
          this.getURL(),
          this.get('type'),
          THUMBNAIL_WIDTH || options.width,
          THUMBNAIL_WIDTH || options.width
        )
          .then((args) => {
            const [image, data] = args;
            that.set('thumbnail', data);
            fulfill();
          })
          .catch(reject);
        return;
      }

      ImageModel.getDataURI(this.getURL(), {
        width: THUMBNAIL_WIDTH || options.width,
        height: THUMBNAIL_HEIGHT || options.height,
      })
        .then((data) => {
          that.set('thumbnail', data);
          fulfill();
        })
        .catch(reject);
    });

    return promise;
  },

  toJSON() {
    const data = {
      id: this.id,
      cid: this.cid,
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
  getDataURI(file, options = {}) {
    const promise = new Promise((fulfill, reject) => {
      // file paths
      if (typeof file === 'string') {
        // get extension
        let fileType = file.replace(/.*\.([a-z]+)$/i, '$1');
        if (fileType === 'jpg') fileType = 'jpeg'; // to match media types image/jpeg

        ImageModel.resize(file, fileType, options.width, options.height)
          .then((args) => {
            const [image, dataURI] = args;
            fulfill([dataURI, fileType, image.width, image.height]);
          });
        return;
      }

      // file inputs
      if (!window.FileReader) {
        const message = 'No File Reader';
        const error = new Error(message);
        console.error(message);

        reject(error);
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        if (options.width || options.height) {
          // resize
          ImageModel.resize(event.target.result, file.type, options.width, options.height)
            .then((args) => {
              const [image, dataURI] = args;
              fulfill([dataURI, file.type, image.width, image.height]);
            });
        } else {
          const image = new window.Image(); // native one

          image.onload = () => {
            const type = file.type.replace(/.*\/([a-z]+)$/i, '$1');
            fulfill([event.target.result, type, image.width, image.height]);
          };
          image.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    });

    return promise;
  },

  /**
   * http://stackoverflow.com/questions/2516117/how-to-scale-an-image-in-data-uri-format-in-javascript-real-scaling-not-usin
   * @param data
   * @param fileType
   * @param MAX_WIDTH
   * @param MAX_HEIGHT
   */
  resize(data, fileType, MAX_WIDTH, MAX_HEIGHT) {
    const promise = new Promise((fulfill, reject) => {
      const image = new window.Image(); // native one

      image.onload = () => {
        let width = image.width;
        let height = image.height;
        const maxWidth = MAX_WIDTH || width;
        const maxHeight = MAX_HEIGHT || height;

        let canvas = null;
        let res = null;

        // resizing
        if (width > height) {
          res = width / maxWidth;
        } else {
          res = height / maxHeight;
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
        fulfill([image, canvas.toDataURL(fileType)]);
      };

      image.src = data;
    });

    return promise;
  },
});

export { ImageModel as default };
