//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define, */
define(['helpers', 'Occurrence'], function () {
//>>excludeEnd('buildExclude');
  /***********************************************************************
   * COLLECTION MODULE
   **********************************************************************/

  m.Collection = (function () {

    var Module = Backbone.Collection.extend({
      flatten: function (flattener) {
        var flattened = {};

        for (var i = 0; i < this.length; i++) {
          _.extend(flattened, this.models[i].flatten(flattener, i))
        }
        return flattened;
      },

      comparator: function (a) {
        return a.metadata.created_on;
      }
    });


    return Module;
  }());
//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');