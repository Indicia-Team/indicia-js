/** *********************************************************************
 * COLLECTION MODULE
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';

const Collection = Backbone.Collection.extend({
  comparator(a) {
    return a.metadata.created_on;
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
      toWait.push(model.destroy());
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
});

export { Collection as default };
