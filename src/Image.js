//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define */
define(['helpers'], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * EVENTS MODULE
     **********************************************************************/

    m.Image = (function (){

        var Module = function (options) {
            options || (options = {});

            this.id = options.id || m.getNewUUID();

            if (typeof options === 'string') {
                this.data = options;
                return;
            }

            this.url = options.url || '';
            this.data = options.data || '';
        };


        m.extend(Module, {
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
                    canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    // Scale and draw the source image to the canvas
                    canvas.getContext("2d").drawImage(image, 0, 0, width, height);

                    // Convert the canvas to a data URL in PNG format
                    callback(null, image, canvas.toDataURL(fileType));
                };

                image.src = data;
            }
        });

        m.extend(Module.prototype, {
            toJSON: function () {
                var data = {
                    id: this.id,
                    url: this.url,
                    data: this.data
                };
                return data;
            }
        });

        return Module;
    }());

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
