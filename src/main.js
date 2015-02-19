/***********************************************************************
 * MAIN
 *
 * Things to work on:
 *  - Decouple the modules as much as possible
 *  - Close as many global variables
 **********************************************************************/

/*global _log*/
var morel = (function () {
  "use strict";

  var m = {};
  m.version = '0'; //library version, generated/replaced by grunt

  //configuration should be setup in morel config file
  m.CONF = {
    HOME: "",
    NAME: "", //todo: set to null to force an application name
    LOG: m.LOG_ERROR
  };

  //CONSTANTS:
  m.TRUE = 1;
  m.FALSE = 0;
  m.ERROR = -1;

  m.SETTINGS = 'morel-settings';

  //levels of morel logging
  m.LOG_NONE = 0;
  m.LOG_ERROR = 1;
  m.LOG_WARNING = 2;
  m.LOG_INFO = 3;
  m.LOG_DEBUG = 4;

  /**
   * Extends the morel library with the provided namespace and its object.
   *
   * @param name
   * @param obj
   * @returns {*|{}}
   */
  m.extend = function (name, obj) {
    var nameArray = name.split('.');
    var variable = m[nameArray[0]] = m[nameArray[0]] || {};

    //iterate through the namespaces
    for (var i = 1; i < nameArray.length; i++) {
      if (variable[nameArray[i]] !== 'object') {
        //overwrite if it is not an object
        variable[nameArray[i]] = {};
      }
      variable = variable[nameArray[i]];
    }
    //if a function than initialize it otherwise assign an object
    variable = typeof(obj) === "function" ? obj(variable) : obj || {};
    return variable;
  };

  /**
   * Initialises the application settings.
   */
  m.initSettings = function () {
    morel.storage.set(m.SETTINGS, {});
  };

  /**
   * Sets an app setting.
   *
   * @param item
   * @param data
   * @returns {*}
   */
  m.settings = function (item, data) {
    var settings = morel.storage.get(m.SETTINGS);
    if (!settings) {
      morel.initSettings();
      settings = morel.storage.get(m.SETTINGS);
    }

    if (data) {
      settings[item] = data;
      return morel.storage.set(m.SETTINGS, settings);
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
    morel.storage.clear();
    morel.storage.tmpClear();

    //morel.db.clear();
    morel.record.db.clear();
  };

  return m;
})(); //END