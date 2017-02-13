/** *********************************************************************
 * COLLECTION MODULE
 **********************************************************************/
import Backbone from 'backbone';
import _ from 'underscore';

const Collection = Backbone.Collection.extend({
  flatten(flattener) {
    const flattened = {};

    for (let i = 0; i < this.length; i++) {
      _.extend(flattened, this.models[i].flatten(flattener, i));
    }
    return flattened;
  },

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
});

export { Collection as default };
