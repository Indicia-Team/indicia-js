//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
/***********************************************************************
 * STORAGE MODULE
 **********************************************************************/

  /* global morel, log */
  m.extend('storage', {

    /**
     * Checks if there is enough space in the storage.
     *
     * @param size
     * @returns {*}
     */
    hasSpace: function (size) {
      return localStorageHasSpace(size);
    },

    /**
     * Gets an item from the storage.
     *
     * @param item
     */
    get: function (item) {
      item = m.CONF.NAME + '-' + item;

      var data = localStorage.getItem(item);
      data = JSON.parse(data);
      return data;
    },

    /**
     * Sets an item in the storage.
     * Note: it overrides any existing item with the same name.
     *
     * @param item
     */
    set: function (item, data) {
      item = m.CONF.NAME + '-' + item;

      data = JSON.stringify(data);
      return localStorage.setItem(item, data);
    },

    /**
     * Removes the item from the storage.
     *
     * @param item
     */
    remove: function (item) {
      item = m.CONF.NAME + '-' + item;

      return localStorage.removeItem(item);
    },


    /**
     * Checks if the item exists.
     *
     * @param item Input name
     * @returns {boolean}
     */
    is: function (item) {
      var val = this.get(item);
      if (m.isPlainObject(val)) {
        return !m.isEmptyObject(val);
      } else {
        return val;
      }
    },


    /**
     * Clears the storage.
     */
    clear: function () {
      localStorage.clear();
    },


    /**
     * Returns the item from the temporary storage.
     *
     * @param item
     */
    tmpGet: function (item) {
      item = m.CONF.NAME + '-' + item;

      var data = sessionStorage.getItem(item);
      data = JSON.parse(data);
      return data;
    },


    /**
     * Sets an item in temporary storage.
     * @param data
     * @param item
     */
    tmpSet: function (item, data) {
      item = m.CONF.NAME + '-' + item;

      data = JSON.stringify(data);
      return sessionStorage.setItem(item, data);
    },


    /**
     * Removes an item in temporary storage.
     *
     * @param item
     */
    tmpRemove: function (item) {
      item = m.CONF.NAME + '-' + item;

      return sessionStorage.removeItem(item);
    },


    /**
     * Checks if the temporary item exists.
     *
     * @param item Input name
     * @returns {boolean}
     */
    tmpIs: function (item) {
      var val = this.tmpGet(item);
      if (m.isPlainObject(val)) {
        return !m.isEmptyObject(val);
      } else {
        return val;
      }
    },


    /**
     * Clears the temporary storage.
     */
    tmpClear: function () {
      sessionStorage.clear();
    },

    /**
     * Checks if it is possible to store some sized data in localStorage.
     */
    localStorageHasSpace: function (size) {
      var taken = JSON.stringify(localStorage).length;
      var left = 1024 * 1024 * 5 - taken;
      if ((left - size) > 0) {
        return 1;
      } else {
        return 0;
      }
    }
});

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
