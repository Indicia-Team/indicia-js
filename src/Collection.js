/** *********************************************************************
 * COLLECTION MODULE
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';

const Collection = Backbone.Collection.extend({
  constructor(attributes = {}, options = {}) {
    this.store = options.store || this.store;

    if (!options.model) {
      console.error('Collection\'s model must be provided');
      return;
    }

    Backbone.Collection.prototype.constructor.apply(this, arguments);
  },

  comparator(a) {
    return a.metadata.created_on;
  },

  /**
   * Synchronises the collection.
   * @param method
   * @param model
   * @param options
   */
  sync(method, model, options = {}) {
    if (options.remote) {
      return this._syncRemote(method, model, options);
    }

    if (!this.store) {
      return Promise.reject(new Error('Trying to locally sync a model without a store'));
    }

    this.trigger('request', model, null, options);
    return this.store.sync(method, model, options);
  },


  /**
   * New function to destroy all models within the collection.
   * @returns {Promise<any>|Promise<TAll[]>|Promise.<*>}
   */
  destroy() {
    if (!this.models.length) {
      return Promise.resolve();
    }

    const toWait = [];
    _.each(_.clone(this.models), (model) => {
      if (model.store) toWait.push(model.destroy());
    });
    return Promise.all(toWait);
  },

  fetch(options) {
    options = _.extend({ parse: true }, options);
    const collection = this;

    return this.sync('read', this, options).then((resp) => {
      const method = options.reset ? 'reset' : 'set';

      collection[method](resp, options);
      collection.trigger('sync', collection, resp, options);
    });
  },

  size() {
    return Promise.resolve(this.size());
  },

  _syncRemote() {
    const error = new Error()
    return Promise.reject(error);
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
    const model = new this.model(attrs, options);
    if (!model.validationError) return model;
    this.trigger('invalid', this, model.validationError, options);
    return false;
  },
});

export { Collection as default };
