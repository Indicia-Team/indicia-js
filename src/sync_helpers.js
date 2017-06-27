import _ from 'underscore';

const helpers = {
  save(key, val, options) {
    const model = this;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    let attrs;
    if (key == null || typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = _.extend({ validate: true, parse: true }, options);
    const wait = options.wait;

    // If we're not waiting and attributes exist, save acts as
    // `set(attr).save(null, opts)` with validation. Otherwise, check if
    // the model will be valid when the attributes, if any, are set.
    if (attrs && !wait) {
      if (!this.set(attrs, options)) return false;
    } else if (!this._validate(attrs, options)) {
      return false;
    }

    // After a successful server-side save, the client is (optionally)
    // updated with the server-side state.
    const attributes = model.attributes;

    // Set temporary attributes if `{wait: true}` to properly find new ids.
    if (attrs && wait) model.attributes = _.extend({}, attributes, attrs);

    let method = 'create';
    if (!model.isNew() && options.remote) {
      method = options.patch ? 'patch' : 'update';
    }
    if (method === 'patch' && !options.attrs) options.attrs = attrs;


    // parent save
    if (model.parent && !options.remote) {
      return model.parent.save(key, val, options)
        .then(() => {
          // Ensure attributes are restored during synchronous saves.
          model.attributes = attributes;
          model.trigger('sync', model, null, options);
          return model;
        })
        .catch((err) => {
          model.trigger('error', err);
          return Promise.reject(err);
        });
    }


    // model save
    return model.sync(method, model, options)
      .then((resp) => {
        if (options.remote) {
          // update the model and occurrences with new remote IDs
          model._remoteCreateParse(model, resp.data);

          // update metadata
          const timeNow = new Date();
          model.metadata.server_on = timeNow;
          model.metadata.updated_on = timeNow;
          model.metadata.synced_on = timeNow;

          // Ensure attributes are restored during synchronous saves.
          model.attributes = attributes;

          // save model's changes locally
          return model.save().then(() => {
            model.trigger('sync:remote', model, resp, options);
            return model;
          });
        }

        model.trigger('sync', model, resp, options);
        return model;
      })
      .catch((err) => {
        model.trigger('error', err);
        return Promise.reject(err);
      });
  },

  /**
   *
   * @param options
   * @returns {Promise}
   */
  destroy(options = {}) {
    const model = this;
    const collection = this.collection; // keep reference for triggering

    const promise = new Promise((fulfill, reject) => {
      function finalise() {
        // removes from all collections etc
        model.stopListening();
        model.trigger('destroy', model, collection, options);

        if (!options.noSave) {
          // parent save the changes permanently
          model.parent.save(null, options).then(() => {
            model.trigger('sync', model, null, options);
            fulfill(model);
          });
        } else {
          model.trigger('sync', model, null, options);
          fulfill(model);
        }
      }

      if (model.parent) {
        if (options.remote) {
          // destroy remotely
          model.sync('delete', model, options)
            .then(finalise);
        } else {
          finalise();
        }
      } else {
        // destroy locally/remotely
        model.sync('delete', model, options)
          .then(() => {
            // removes from all collections etc
            model.stopListening();
            model.trigger('destroy', model, collection, options);
            model.trigger('sync', model, null, options);

            fulfill(model);
          })
          .catch(reject);
      }
    });

    return promise;
  },
};

export default helpers;
