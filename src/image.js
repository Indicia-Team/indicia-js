/***********************************************************************
 * IMAGE MODULE
 **********************************************************************/

/* global morel, _log */
morel.extend('image', function (m) {
  "use strict";

  //todo: move to CONF.
  m.MAX_IMG_HEIGHT = 800;
  m.MAX_IMG_WIDTH = 800;

  /**
   * Returns all the images resized and stingified from an element.
   *
   * @param elem DOM element to look for files
   * @param callback function with an array parameter
   */
  m.extractAllToArray = function (elem, callback, onError) {
    var files = morel.image.findAll(elem);
    if (files.length > 0) {
      morel.image.toStringAll(files, callback, onError);
    } else {
      callback(files);
    }
  };

  /**
   * Transforms and resizes an image file into a string and saves it in the storage.
   *
   * @param onError
   * @param file
   * @param onSaveSuccess
   * @returns {number}
   */
  m.toString = function (file, onSaveSuccess, onError) {
    if (file) {
      _log("IMAGE: working with " + file.name + ".", morel.LOG_DEBUG);

      var reader = new FileReader();
      //#2
      reader.onload = function () {
        _log("IMAGE: resizing file.", morel.LOG_DEBUG);
        var image = new Image();
        //#4
        image.onload = function (e) {
          var width = image.width;
          var height = image.height;

          //resizing
          var res;
          if (width > height) {
            res = width / morel.image.MAX_IMG_WIDTH;
          } else {
            res = height / morel.image.MAX_IMG_HEIGHT;
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
          (shrinked.length / 1024) + "KB).", morel.LOG_DEBUG);

          onSaveSuccess(shrinked);

        };
        reader.onerror = function (e) {
          _log("IMAGE: reader " + e + ".", morel.LOG_ERROR);
          e.message = e.getMessage();
          onError(e);
        };

        //#3
        image.src = reader.result;
      };
      //1#
      reader.readAsDataURL(file);
    }
  };

  /**
   * Saves all the files. Uses recursion.
   *
   * @param files An array of files to be saved
   * @param onSaveAllFilesSuccess
   * @param onError
   */
  m.toStringAll = function (files, onSaveAllFilesSuccess, onError) {
    //recursive calling to save all the images
    saveAllFilesRecursive(files, null);
    function saveAllFilesRecursive(files, filesArray) {
      filesArray = filesArray || [];

      //recursive files saving
      if (files.length > 0) {
        var filesInfo = files.pop();
        //get next file in file array
        var file = filesInfo.file;
        var name = filesInfo.input_field_name;

        //recursive saving of the files
        var onSaveSuccess = function (file) {
          filesArray.push({
            "name": name,
            "value": file,
            "type": 'file'
          });
          saveAllFilesRecursive(files, filesArray, onSaveSuccess);
        };
        morel.image.toString(file, onSaveSuccess, onError);
      } else {
        onSaveAllFilesSuccess(filesArray);
      }
    }
  };

  /**
   * Extracts all files from the page inputs having data-form attribute.
   */
  m.findAll = function (elem) {
    if (!elem) {
      elem = $(document);
    }

    var files = [];
    $(elem).find('input').each(function (index, input) {
      if ($(input).attr('type') === "file" && input.files.length > 0) {
        var file = morel.image.find(input);
        files.push(file);
      }
    });
    return files;
  };

  /**
   * Returns a file object with its name.
   *
   * @param input The file input Id
   * @returns {{file: *, input_field_name: *}}
   */
  m.find = function (input) {
    var file = {
      'file': input.files[0],
      'input_field_name': input.attributes.name.value
    };
    return file;
  };

  return m;
});

