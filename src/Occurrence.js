//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define, */
define(['helpers', 'Image', 'Collection'], function () {
//>>excludeEnd('buildExclude');
  /***********************************************************************
   * OCCURRENCE
   **********************************************************************/

  m.Occurrence = (function () {
    var Module = Backbone.Model.extend({
      constructor: function (attributes, options){
        var that = this;
        var attrs = attributes || {};

        options || (options = {});
        this.cid = options.cid || m.getNewUUID();
        this._sample = options._sample;
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};


        if (options.images) {
          var images = [];
          _.each(options.images, function (image) {
            if (image instanceof m.Image) {
              image._occurrence = that;
              images.push(image);
            } else {
              var modelOptions = _.extend(image, {_occurrence: that});
              images.push(new m.Image(image.attributes, modelOptions));
            }
          });
          this.images = new m.Collection(images, {
            model: m.Image
          });
        } else {
          this.images = new m.Collection([], {
            model: m.Image
          });
        }

        this.initialize.apply(this, arguments);
      },

      save: function (callback) {
        if (!this._sample) {
          callback && callback(new Error({message: 'No sample.'}));
          return;
        }

        this._sample.save(callback);
      },

      destroy: function (callback) {
        if (this._sample) {
          this._sample.occurrences.remove(this);
          this.save(function () {
            callback && callback();
          });
        } else {
          Backbone.Model.prototype.destroy.call(this);
        }
      },

      toJSON: function () {
        var data = {
          id: this.id,
          cid: this.cid,
          attributes: this.attributes,
          images: this.images.toJSON()
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
      flatten: function (flattener, count) {
        //images flattened separately
        return flattener.apply(this, [this.attributes, {keys: Module.keys, count: count}]);
      }
    });


    /**
     * Warehouse attributes and their values.
     */
    Module.keys = {
      taxon: {
        id: ''
      },
      comment: {
        id: 'comment'
      }
    };

    return Module;
  }());
//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');