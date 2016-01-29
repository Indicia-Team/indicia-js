//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define */
define(['helpers', 'Sample', 'Storage'], function () {
//>>excludeEnd('buildExclude');
  /***********************************************************************
   * MANAGER
   **********************************************************************/

  m.Manager = (function () {
    var Module = function (options) {
      this.options = options || (options = {});

      this.storage = new m.Storage({
        appname: options.appname,
        Sample: options.Sample,
        Storage: options.Storage,
        manager: this
      });
      this._attachListeners();
      this.synchronising = false;
    };

    _.extend(Module.prototype, {
      //storage functions
      get: function (model, callback) {
        this.storage.get(model, callback);
      },
      getAll: function (callback) {
        this.storage.getAll(callback);
      },
      set: function (model, callback) {
        model._manager = this; // set the manager on new model
        this.storage.set(model, callback);
      },
      remove: function (model, callback) {
        this.storage.remove(model, callback);
      },
      has: function (model, callback) {
        this.storage.has(model, callback);
      },
      clear: function (callback) {
        this.storage.clear(callback);
      },

      sync: function (model, callback) {
        var that = this;

        if (model instanceof m.Sample) {

          if (!model.metadata.synchronising) {
            model.metadata.synchronising = true;
            that.sendStored(model, function (err) {
              model.metadata.synchronising = false;
              callback && callback(err);
            });
          }
          return;
        }

        this.get(model, function (err, sample) {
          if (err) {
            callback && callback(err);
            return;
          }

          if (!sample.metadata.synchronising) {
            sample.metadata.synchronising = true;
            that.sendStored(sample, function (err) {
              sample.metadata.synchronising = false;
              callback && callback(err);
            });
          }
        });
      },

      syncAll: function (onSample, callback) {
        var that = this;
        if (!this.synchronising) {
          this.synchronising = true;
          this.sendAllStored(onSample, function (err) {
            that.synchronising = false;
            callback && callback(err);
          });
        } else {
          that.trigger('sync:done');
          callback && callback();
        }
      },


      /**
       * Sending all saved records.
       *
       * @returns {undefined}
       */
      sendAllStored: function (onSend, callback) {
        var that = this;
        this.getAll(function (err, samples) {
          if (err) {
            that.trigger('sync:error');
            callback(err);
            return;
          }

          that.trigger('sync:request');

          //shallow copy
          var remainingSamples = _.extend([], samples.models);

          //recursively loop through samples
          for (var i = 0; i < remainingSamples.length; i++) {
            var sample = remainingSamples[i];
            if (sample.validate() || sample.getSyncStatus() === m.SYNCED) {
              remainingSamples.splice(i, 1);
              i--; //return the cursor
              continue;
            }

            //call user defined onSend function
            onSend && onSend(sample);

            that.sendStored(sample, function (err, sample) {
              if (err) {
                that.trigger('sync:error');
                callback(err);
                return;
              }

              for (var k = 0; k < remainingSamples.length; k++) {
                if (remainingSamples[k].id === sample.id ||
                  remainingSamples[k].cid === sample.cid) {
                  remainingSamples.splice(k, 1);
                  break;
                }
              }

              if (remainingSamples.length === 0) {
                //finished
                that.trigger('sync:done');
                callback();
              }
            });
          }

          if (!remainingSamples.length) {
            that.trigger('sync:done');
            callback();
          }
        })
      },

      sendStored: function (sample, callback) {
        var that = this;

        //don't resend
        if (sample.getSyncStatus() === m.SYNCED) {
          sample.trigger('sync:done');
          callback && callback(null, sample);
          return;
        }

        sample.metadata.synchronising = true;
        sample.trigger('sync:request');

        this.send(sample, function (err) {
          sample.metadata.synchronising = false;
          if (err) {
            sample.trigger('sync:error');
            callback && callback(err);
            return;
          }

          //update sample
          sample.metadata.warehouse_id = 1;
          sample.metadata.server_on = new Date();
          sample.metadata.synced_on = new Date();

          //resize images to snapshots
          that._resizeImages(sample, function () {
            //save sample
            that.set(sample, function (err) {
              if (err) {
                sample.trigger('sync:error');
                callback && callback(err);
                return;
              }

              sample.trigger('sync:done');
              callback && callback(null, sample);
            });
          });
        });
      },

      /**
       * Sends the saved record
       *
       * @param recordKey
       * @param callback
       * @param onError
       * @param onSend
       */
      send: function (sample, callback) {
        var flattened = sample.flatten(this._flattener),
          formData = new FormData();


        //append images
        var occCount = 0;
        sample.occurrences.each(function (occurrence) {
          var imgCount = 0;
          occurrence.images.each(function (image) {
            var data = image.get('data'),
              type = image.get('type');

            var name = 'sc:' + occCount + '::photo' + imgCount;
            var blob = m.dataURItoBlob(data, type);
            var extension = type.split('/')[1];
            formData.append(name, blob, 'pic.' + extension);
          });
          occCount++;
        });

        //append attributes
        var keys = Object.keys(flattened);
        for (var i= 0; i < keys.length; i++) {
          formData.append(keys[i], flattened[keys[i]]);
        }

        //Add authentication
        formData = this.appendAuth(formData);

        this._post(formData, function (err) {
          callback (err, sample);
        });
      },

      /**
       * Submits the record.
       */
      _post: function (formData, callback) {
        var ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
          var error = null;
          if (ajax.readyState === XMLHttpRequest.DONE) {
            var status = ajax.status + '';
            switch (true) {
              case /2\d\d/.test(status):
                callback && callback();
                break;
              case /4\d\d/.test(status):
                error = new m.Error(ajax.response);
                callback && callback(error);
                break;
              default:
                error = new m.Error({
                  message: 'Unknown problem while sending request.',
                  number: ajax.status
                });
                callback && callback(error);
            }
          }
        };

        ajax.open('POST', this.options.url);
        ajax.send(formData);
      },

      _attachListeners: function () {
        var that = this;
        this.storage.on('update', function () {
          that.trigger('update');
        });
      },

      _flattener: function (keys, attributes, count) {
        var flattened = {},
          attr = null,
          name = null,
          value = null,
          prefix = '',
          native = 'sample:',
          custom = 'smpAttr:';

        if (this instanceof m.Occurrence) {
          prefix = 'sc:';
          native = '::occurrence:';
          custom = '::occAttr:';
        }

        for (attr in attributes) {
          if (!keys[attr]) {
            if (attr != 'email' && attr != 'usersecret') {
              console.warn('morel.Manager: no such key: ' + attr);
            }
            flattened[attr] = attributes[attr];
            continue;
          }

          name = keys[attr].id;

          if (!name) {
            name = prefix + count + '::present'
          } else {
            if (parseInt(name, 10) >= 0) {
              name = custom + name;
            } else {
              name = native + name;
            }

            if (prefix) {
              name = prefix + count + name;
            }
          }

          //no need to send undefined
          if (!attributes[attr]) continue;

          value = attributes[attr];

          if (keys[attr].values) {
            if (typeof keys[attr].values === 'function') {
              value = keys[attr].values(value);
            } else {
              value = keys[attr].values[value];
            }
          }

          flattened[name] = value;
        }

        return flattened;
      },

      _resizeImages: function (sample, callback) {
        var images_count = 0;
        //get number of images to resize - synchronous
        sample.occurrences.each(function (occurrence) {
          occurrence.images.each(function (image) {
            images_count++;
          });
        });

        if (!images_count) {
          callback();
          return;
        }

        //resize
        //each occurrence
        sample.occurrences.each(function (occurrence) {
          //each image
          occurrence.images.each(function (image) {
            image.resize(75, 75, function () {
              images_count--;
              if (images_count === 0) {
                callback();
              }
            });

          }, occurrence);
        });
      },

      /**
       * Appends user and app authentication to the passed data object.
       * Note: object has to implement 'append' method.
       *
       * @param data An object to modify
       * @returns {*} A data object
       */
      appendAuth: function (data) {
        //app logins
        this._appendAppAuth(data);
        //warehouse data
        this._appendWarehouseAuth(data);

        return data;
      },

      /**
       * Appends app authentication - Appname and Appsecret to
       * the passed object.
       * Note: object has to implement 'append' method.
       *
       * @param data An object to modify
       * @returns {*} A data object
       */
      _appendAppAuth: function (data) {
        data.append('appname', this.options.appname);
        data.append('appsecret', this.options.appsecret);

        return data;
      },

      /**
       * Appends warehouse related information - website_id and survey_id to
       * the passed data object.
       * Note: object has to implement 'append' method.
       *
       * This is necessary because the data must be associated to some
       * website and survey in the warehouse.
       *
       * @param data An object to modify
       * @returns {*} An data object
       */
      _appendWarehouseAuth: function (data) {
        data.append('website_id', this.options.website_id);
        data.append('survey_id', this.options.survey_id);

        return data;
      }
    });

    _.extend(Module.prototype, Backbone.Events);

    return Module;
  }());

//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');
