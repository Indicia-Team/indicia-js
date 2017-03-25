/** *********************************************************************
 * COLLECTION MODULE
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';
import Store from './Store';

const Collection = Backbone.Collection.extend({
  constructor(attributes = {}, options = {}) {
    this.store = options.store || this.store || new Store();

    if (!options.model && !this.model) {
      console.error('Collection\'s model must be provided');
      return;
    }

    Backbone.Collection.prototype.constructor.apply(this, arguments);
  },

  comparator(a) {
    return a.metadata.created_on;
  },

  size() {
    return Promise.resolve(this.length);
  },

  /**
   * New function to save all models within the collection.
   * @param models
   * @param options
   */
  save(collection, options) {
    return this.sync('create', collection || this, options);
  },

  /**
   * New function to destroy all models within the collection.
   * @returns {*}
   */
  destroy(collection, options) {
    return this.sync('delete', collection || this, options);
  },

  /**
   * New function to fetch all models within the collection.
   * @returns {*}
   */
  fetch(options) {
    options = _.extend({ parse: true }, options);
    const collection = this;

    return this.sync('read', this, options).then((resp) => {
      const method = options.reset ? 'reset' : 'set';

      collection[method](resp, options);
      collection.trigger('sync', collection, resp, options);
    });
  },

  /**
   * Synchronises the collection.
   * @param method
   * @param model
   * @param options
   */
  sync(method, collection, options = {}) {
    if (options.remote) {
      return this._syncRemote(method, collection, options);
    }

    if (!this.store) {
      return Promise.reject(new Error('Trying to locally sync a collection without a store'));
    }

    this.trigger('request', collection, null, options);
    return this.store.sync(method, collection, options);
  },


  /**
   * Syncs the collection to the remote server.
   * Returns on success: model, response, options
   */
  _syncRemote(method, collection, options) {
    collection.synchronising = true;

    // model.trigger('request', model, xhr, options);
    switch (method) {
      case 'create':
        if (!collection.models.length) {
          return Promise.resolve();
        }
        const toWait = [];
        _.each(collection.models, (model) => {
          if (model.store) toWait.push(model.save(null, options));
        });
        return Promise.all(toWait);

      case 'update':
        // todo
        collection.synchronising = false;
        return Promise.reject(new Error('Updating the model is not possible yet.'));

      case 'read':
        // todo
        collection.synchronising = false;
        return Promise.reject(new Error('Reading the model is not possible yet.'));

      case 'delete':
        // todo
        collection.synchronising = false;
        return Promise.reject(new Error('Deleting the model is not possible yet.'));

      default:
        collection.synchronising = false;
        return Promise.reject(new Error(`No such remote sync option: ${method}`));
    }
  },

  /**
   * Returns an object with attributes and their values
   * mapped for warehouse submission.
   *
   * @returns {*}
   */
  _getSubmission() {
    const submission = [];
    const media = [];

    // transform its models
    this.models.forEach((model) => {
      const [modelSubmission, modelMedia] = model._getSubmission();
      submission.push(modelSubmission);
      _.extend(media, modelMedia);
    });

    return [submission, media];
  },

  // Prepare a hash of attributes (or other model) to be added to this
  // collection.
  _prepareModel(options) {
    if (this._isModel(options)) {
      if (!options.collection) options.collection = this;
      return options;
    }

    const attrs = options.attributes;

    options = options ? _.clone(options) : {};
    options.collection = this;
    options.store = this.store;
    const model = new this.model(attrs, options); // eslint-disable-line
    if (!model.validationError) return model;
    this.trigger('invalid', this, model.validationError, options);
    return false;
  },
});

export { Collection as default };
