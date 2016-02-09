//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define */
define(['helpers'], function () {
//>>excludeEnd('buildExclude');
  /***********************************************************************
   * IMAGE
   **********************************************************************/

  m.Image = (function (){

    var Module = Backbone.Model.extend({
      constructor: function (attributes, options) {

        if (typeof attributes === 'string') {
          var data = attributes;
          attributes = {data: data};
          return;
        }
        var attrs = attributes || {};

        options || (options = {});
        this.cid = options.cid || m.getNewUUID();
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};


        this.initialize.apply(this, arguments);
      },

      destroy: function (){

      },

      /**
       * Resizes itself.
       */
      resize: function (MAX_WIDTH, MAX_HEIGHT, callback) {
        var that = this;
        Module.resize(this.attributes.data, this.attributes.type, MAX_WIDTH, MAX_HEIGHT,
          function (err, image, data) {
            if (err) {
              callback && callback(err);
              return;
            }
            that.attributes.data = data;
            callback && callback(null, image, data);
          });
      },

      toJSON: function () {
        var data = {
          id: this.id,
          url: this.attributes.url,
          type: this.attributes.type,
          data: this.attributes.data
        };
        return data;
      }
    });

    _.extend(Module, {
      /**
       * Transforms and resizes an image file into a string.
       *
       * @param onError
       * @param file
       * @param onSaveSuccess
       * @returns {number}
       */
      toString: function (file, callback) {
        if (!window.FileReader) {
          var message = 'No File Reader',
            error = new m.Error(message);
          console.error(message);

          return callback(error);
        }

        var reader = new FileReader();
        reader.onload = function (event) {
          callback(null, event.target.result, file.type);
        };
        reader.readAsDataURL(file);
      },

      /**
       * http://stackoverflow.com/questions/2516117/how-to-scale-an-image-in-data-uri-format-in-javascript-real-scaling-not-usin
       * @param data
       * @param width
       * @param height
       * @param callback
       */
      resize: function(data, fileType, MAX_WIDTH, MAX_HEIGHT, callback) {
        var image = new Image();

        image.onload = function() {
          var width = image.width,
            height = image.height,
            canvas = null,
            res = null;

          //resizing
          if (width > height) {
            res = width / MAX_WIDTH;
          } else {
            res = height / MAX_HEIGHT;
          }

          width = width / res;
          height = height / res;

          // Create a canvas with the desired dimensions
          canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          // Scale and draw the source image to the canvas
          canvas.getContext('2d').drawImage(image, 0, 0, width, height);

          // Convert the canvas to a data URL in some format
          callback(null, image, canvas.toDataURL(fileType));
        };

        image.src = data;
      }
    });

    return Module;
  }());

//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');
