//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * HELPER FUNCTIONS
     *
     * Functions that were too ambiguous to be placed in one module.
     **********************************************************************/

    /**
     * Clones an object.
     *
     * @param obj
     * @returns {*}
     */
    m.objClone = function (obj) {
        if (null === obj || "object" !== typeof obj) {
            return obj;
        }
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = objClone(obj[attr]);
            }
        }
        return copy;
    };

    /**
     * Generate UUID.
     */
    m.getNewUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    /**
     * Converts DataURI object to a Blob.
     *
     * @param {type} dataURI
     * @param {type} fileType
     * @returns {undefined}
     */
    m.dataURItoBlob = function (dataURI, fileType) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {
            type: fileType
        });
    };

    // Detecting data URLs
    // https://gist.github.com/bgrins/6194623

    // data URI - MDN https://developer.mozilla.org/en-US/docs/data_URIs
    // The "data" URL scheme: http://tools.ietf.org/html/rfc2397
    // Valid URL Characters: http://tools.ietf.org/html/rfc2396#section2
    m.isDataURL = function (s) {
        if (!s) {
            return false;
        }
        s = s.toString(); //numbers

        var regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
        return !!s.match(regex);
    };

    //From jQuery 1.4.4 .
    m.isPlainObject = function (obj) {
        function type(obj) {
            var class2type = {};
            var types = "Boolean Number String Function Array Date RegExp Object".split(" ");
            for (var i = 0; i < types.length; i++) {
                class2type["[object " + types[i] + "]"] = types[i].toLowerCase();
            }
            return obj == null ?
                String(obj) :
            class2type[toString.call(obj)] || "object";
        }

        function isWindow(obj) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        }

        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
            return false;
        }

        // Not own constructor property must be Object
        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for (key in obj) {
        }

        return key === undefined || hasOwn.call(obj, key);
    };

    //checks if the object has any elements.
    m.isEmptyObject = function (obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    };

    m.extend = function (a, b) {
        if (typeof b === 'function') {
            b = b();
        }

        //extend the library itself
        if (typeof a === 'string') {
            m[a] || (m[a] = {});
            return ext(m[a], b);

            //normal object extend
        } else {
            return ext(a, b);
        }

        function ext(a, b) {
            for (var key in b) {
                if (b.hasOwnProperty(key)) {
                    a[key] = b[key];
                }
            }
            return a;
        }
    };

    m.formatDate = function (date) {
        var now = new Date(),
            day = 0, month = 0,
            reg = /\d{4}-\d{1,2}-\d{1,2}$/,
            regInv = /\d{1,2}-\d{1,2}-\d{4}$/,
            dateArray = [];

        if (typeof date === 'string') {
            dateArray = date.split('-');
            if (reg.test(date)) {
                date = new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]));
            } else if (regInv.test(date)) {
                date = new Date(parseInt(dateArray[2]), parseInt(dateArray[1]) - 1, parseInt(dateArray[0]));
            }
        }

        now = date || now;
        day = ("0" + now.getDate()).slice(-2);
        month = ("0" + (now.getMonth() + 1)).slice(-2);

        return (day) + "/" + (month) + "/" + now.getFullYear();
    };

    /**
     * Transforms and resizes an image file into a string.
     *
     * @param onError
     * @param file
     * @param onSaveSuccess
     * @returns {number}
     */
    m.imageToString = function (file, callback) {
        var MAX_IMG_HEIGHT = 800,
            MAX_IMG_WIDTH = 800;

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
                    res = width / MAX_IMG_WIDTH;
                } else {
                    res = height / MAX_IMG_HEIGHT;
                }

                width = width / res;
                height = height / res;

                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                var imgContext = canvas.getContext('2d');
                imgContext.drawImage(image, 0, 0, width, height);

                var shrinked = canvas.toDataURL(file.type);

                callback(null, shrinked);

            };
            reader.onerror = function (e) {
                var error = new m.Error(e.getMessage());
                callback(error);
            };

            //#3
            image.src = reader.result;
        };
        //1#
        reader.readAsDataURL(file);
    };

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
