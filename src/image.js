//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * IMAGE MODULE
     **********************************************************************/

    /* global morel, _log */
    m.extend('image', {
        //todo: move to CONF.
        MAX_IMG_HEIGHT: 800,
        MAX_IMG_WIDTH: 800,

        /**
         * Returns all the images resized and stingified from an element.
         *
         * @param elem DOM element to look for files
         * @param callback function with an array parameter
         */
        extractAll: function (elem, callback, onError) {
            var fileInputs = m.image.findAll(elem);
            if (fileInputs.length > 0) {
                m.image.toStringAll(fileInputs, callback, onError);
            } else {
                callback();
            }
        },

        /**
         * Transforms and resizes an image file into a string and saves it in the storage.
         *
         * @param onError
         * @param file
         * @param onSaveSuccess
         * @returns {number}
         */
        toString: function (file, onSaveSuccess, onError) {
            if (file) {


                var reader = new FileReader();
                //#2
                reader.onload = function () {

                    var image = new Image();
                    //#4
                    image.onload = function (e) {
                        var width = image.width;
                        var height = image.height;

                        //resizing
                        var res;
                        if (width > height) {
                            res = width / m.image.MAX_IMG_WIDTH;
                        } else {
                            res = height / m.image.MAX_IMG_HEIGHT;
                        }

                        width = width / res;
                        height = height / res;

                        var canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;

                        var imgContext = canvas.getContext('2d');
                        imgContext.drawImage(image, 0, 0, width, height);

                        var shrinked = canvas.toDataURL(file.type);

                        _log("IMAGE: done shrinking file (" +
                        (shrinked.length / 1024) + "KB).", m.LOG_DEBUG);

                        onSaveSuccess(shrinked);

                    };
                    reader.onerror = function (e) {

                        e.message = e.getMessage();
                        onError(e);
                    };

                    //#3
                    image.src = reader.result;
                };
                //1#
                reader.readAsDataURL(file);
            }
        },

        /**
         * Saves all the files. Uses recursion.
         *
         * @param files An array of files to be saved
         * @param onSaveAllFilesSuccess
         * @param onError
         */
        toStringAll: function (fileInputs, onSaveAllFilesSuccess, onError) {
            //recursive calling to save all the images
            saveAllFilesRecursive(fileInputs, null);
            function saveAllFilesRecursive(fileInputs, files) {
                files = files || {};

                //recursive files saving
                if (fileInputs.length > 0) {
                    var filesInfo = fileInputs.pop();
                    //get next file in file array
                    var file = filesInfo.file;
                    var name = filesInfo.input_field_name;

                    //recursive saving of the files
                    var onSaveSuccess = function (file) {
                        files[name] = file;
                        saveAllFilesRecursive(fileInputs, files, onSaveSuccess);
                    };
                    m.image.toString(file, onSaveSuccess, onError);
                } else {
                    onSaveAllFilesSuccess(files);
                }
            }
        },

        /**
         * Extracts all files from the page inputs having data-form attribute.
         */
        findAll: function (elem) {
            if (!elem) {
                elem = window.document;
            }

            var files = [];
            var inputs = elem.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                if (input.getAttribute('type') === "file" && input.files.length > 0) {
                    var file = m.image.find(input);
                    files.push(file);
                }
            }
            return files;
        },

        /**
         * Returns a file object with its name.
         *
         * @param input The file input Id
         * @returns {{file: *, input_field_name: *}}
         */
        find: function (input) {
            var file = {
                'file': input.files[0],
                'input_field_name': input.attributes.name.value
            };
            return file;
        }
    });

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
