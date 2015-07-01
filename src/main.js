//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");

  /*
   * Things to work on:
   *  - Decouple the modules as much as possible
   *  - Close as many global variables
   */
  "use strict";

  m.VERSION = '0'; //library version, generated/replaced by grunt

  //library wide configuration
  m.CONF = {};

  //CONSTANTS:
  m.TRUE = 1;
  m.FALSE = 0;
  m.ERROR = -1;

  m.SETTINGS_KEY = 'morel-settings';

  /**
   * Extends the morel library with the provided namespace and its object.
   *
   * @param name
   * @param obj
   * @returns {*|{}}
   */
  m.extend = function (name, obj) {
    //if a function than initialize it otherwise assign an object
    obj = typeof(obj) === "function" ? obj(variable) : obj || {};

    var nameArray = name.split('.');

    var variable = m; //variable for working with deep namespace

    //iterate through the namespaces creating objects & return reference
    // of last parent object
    for (var nameCount = 0; nameCount < (nameArray.length - 1); nameCount++) {
      if (typeof variable[nameArray[nameCount]] !== 'object') {
        //overwrite if it is not an object
        variable[nameArray[nameCount]] = {};
      }
      variable = variable[nameArray[nameCount]];
    }
    //assign new object
    variable[nameArray[nameArray.length - 1]] =  obj;

    return m[nameArray[0]];
  };

  /**
   * Initialises the application settings.
   */
  m.initSettings = function () {
    m.storage.set(m.SETTINGS_KEY, {});
  };

  /**
   * Sets an app setting.
   *
   * @param item
   * @param data
   * @returns {*}
   */
  m.settings = function (item, data) {
    var settings = m.storage.get(m.SETTINGS_KEY);
    if (!settings) {
      m.initSettings();
      settings = m.storage.get(m.SETTINGS_KEY);
    }

    if (data) {
      settings[item] = data;
      return m.storage.set(m.SETTINGS_KEY, settings);
    } else {
      return (item) ? settings[item] : settings;
    }
  };

  /**
   * Resets the morel to the initial state.
   *
   * Clears localStorage.
   * Clears sessionStorage.
   * Clears databases.
   */
  m.reset = function () {
    m.storage.clear();
    m.storage.tmpClear();

    //m.db.clear();
    m.record.db.clear();
  };

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
