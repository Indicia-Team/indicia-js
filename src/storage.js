/***********************************************************************
 * STORAGE MODULE
 **********************************************************************/

app = app || {};
app.storage = (function (m, $) {
  /**
   * Checks if there is enough space in the storage.
   *
   * @param size
   * @returns {*}
   */
  m.hasSpace = function (size) {
    return localStorageHasSpace(size);
  };

  /**
   * Gets an item from the storage.
   *
   * @param item
   */
  m.get = function (item) {
    item = app.CONF.NAME + '_' + item;

    var data = localStorage.getItem(item);
    data = JSON.parse(data);
    return data;
  };

  /**
   * Sets an item in the storage.
   * Note: it overrides any existing item with the same name.
   *
   * @param item
   */
  m.set = function (item, data) {
    item = app.CONF.NAME + '_' + item;

    data = JSON.stringify(data);
    return localStorage.setItem(item, data);
  };

  /**
   * Removes the item from the storage.
   *
   * @param item
   */
  m.remove = function (item) {
    item = app.CONF.NAME + '_' + item;

    return localStorage.removeItem(item);
  };

  /**
   * Checks if the item exists.
   *
   * @param item Input name
   * @returns {boolean}
   */
  m.is = function (item) {
    var val = this.get(item);
    if ($.isPlainObject(val)) {
      return !$.isEmptyObject(val);
    } else {
      return val != null;
    }
  };

  /**
   * Clears the storage.
   */
  m.clear = function () {
    _log('STORAGE: clearing', app.LOG_DEBUG);

    localStorage.clear();
  };

  /**
   * Returns the item from the temporary storage.
   *
   * @param item
   */
  m.tmpGet = function (item) {
    item = app.CONF.NAME + '_' + item;

    var data = sessionStorage.getItem(item);
    data = JSON.parse(data);
    return data;
  };

  /**
   * Sets an item in temporary storage.
   *
   * @param item
   */
  m.tmpSet = function (item, data) {
    item = app.CONF.NAME + '_' + item;

    data = JSON.stringify(data);
    return sessionStorage.setItem(item, data);
  };

  /**
   * Removes an item in temporary storage.
   *
   * @param item
   */
  m.tmpRemove = function (item) {
    item = app.CONF.NAME + '_' + item;

    return sessionStorage.removeItem(item);
  };

  /**
   * Checks if the temporary item exists.
   *
   * @param item Input name
   * @returns {boolean}
   */
  m.tmpIs = function (item) {
    var val = this.tmpGet(item);
    if ($.isPlainObject(val)) {
      return !$.isEmptyObject(val);
    } else {
      return val != null;
    }
  };

  /**
   * Clears the temporary storage.
   */
  m.tmpClear = function () {
    _log('STORAGE: clearing temporary', app.LOG_DEBUG);

    sessionStorage.clear();
  };

  /**
   * Checks if it is possible to store some sized data in localStorage.
   */
  function localStorageHasSpace(size) {
    var taken = JSON.stringify(localStorage).length;
    var left = 1024 * 1024 * 5 - taken;
    if ((left - size) > 0)
      return 1;
    else
      return 0;
  }

  return m;
}(app.storage || {}, jQuery));



/*##############
 ## HELPER  ####
  //todo: should find a better place for this.
 ##############*/

/**
 * Converts DataURI object to a Blob.
 *
 * @param {type} form_count
 * @param {type} pic_count
 * @param {type} file
 * @returns {undefined}
 */
function dataURItoBlob(dataURI, file_type) {
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: file_type
  });
}