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
});

export { Collection as default };
