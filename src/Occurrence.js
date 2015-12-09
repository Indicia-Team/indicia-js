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
        var attrs = attributes || {};

        options || (options = {});
        this.cid = options.cid || m.getNewUUID();
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};


        if (options.images) {
          this.images = new m.Collection(options.images, {
            model: m.Image
          });
        } else {
          this.images = new m.Collection([], {
            model: m.Image
          });
        }

        this.initialize.apply(this, arguments);
      },

      toJSON: function () {
        var data = {
          id: this.id,
          cid: this.cid,
          attributes: this.attributes,
          images: this.images.toJSON()
        };
        //add occurrences
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
        return flattener.apply(this, [Module.keys, this.attributes, count]);;
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