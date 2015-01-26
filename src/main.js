/***********************************************************************
 * MAIN
 *
 * Things to work on:
 *  - Decouple the modules as much as possible
 *  - Add better data management - morel.data - should be strictly managed
 *  - Close as many global variables
 **********************************************************************/

var morel = (function (m, $) {
  "use strict";
  /*global _log*/

  m.version = '0'; //library version, generated/replaced by grunt

  //configuration should be setup in morel config file
  m.CONF = {
    HOME: "",
    NAME: "", //todo: set to null to force an application name
    LOG: m.LOG_ERROR
  };

  //GLOBALS
  m.$ = $; //todo: remove if not used
  m.data = {};

  //CONSTANTS:
  m.TRUE = 1;
  m.FALSE = 0;
  m.ERROR = -1;

  //levels of morel logging
  m.LOG_NONE = 0;
  m.LOG_ERROR = 1;
  m.LOG_WARNING = 2;
  m.LOG_INFO = 3;
  m.LOG_DEBUG = 4;

  /**
   * Events from.
   * http://jqmtricks.wordpress.com/2014/03/26/jquery-mobile-page-events/
   */
  m.pageEvents = [
    'pagebeforecreate',
    'pagecreate',
    'pagecontainerbeforechange ',
    'pagecontainerbeforetransition',
    'pagecontainerbeforehide',
    'pagecontainerhide',
    'pagecontainerbeforeshow',
    'pagecontainershow',
    'pagecontainertransition',
    'pagecontainerchange',
    'pagecontainerchangefailed',
    'pagecontainerbeforeload',
    'pagecontainerload',
    'pagecontainerloadfailed',
    'pagecontainerremove'
  ];

  /**
   * Init function.
   */
  m.initialise = function () {
    _log('APP: initialised.', morel.LOG_INFO);

    //todo: needs tidying up
    //Bind JQM page events with page controller handlers
    $(document).on(morel.pageEvents.join(' '), function (e, data) {
      var event = e.type;
      var id = null;
      switch (event) {
        case 'pagecreate':
        case 'pagecontainerbeforechange':
          id = data.prevPage ? data.prevPage[0].id : e.target.id;
          break;

        case 'pagebeforecreate':
          id = e.target.id;
          break;

        case 'pagecontainershow':
        case 'pagecontainerbeforetransition':
        case 'pagecontainerbeforehide':
        case 'pagecontainerbeforeshow':
        case 'pagecontainertransition':
        case 'pagecontainerhide':
        case 'pagecontainerchangefailed':
        case 'pagecontainerchange':
          id = data.toPage[0].id;
          break;

        case 'pagecontainerbeforeload':
        case 'pagecontainerload':
        case 'pagecontainerloadfailed':
          /* falls through */
        default:
          break;
      }

      //  var ihd = e.target.id || data.toPage[0].id;
      var controller = morel.controller[id];

      //if page has controller and it has an event handler
      if (controller && controller[event]) {
        controller[event](e, data);
      }
    });
  };

  /**
   * Initialises the application settings.
   */
  m.initSettings = function () {
    morel.storage.set('settings', {});
  };

  /**
   * Sets an app setting.
   *
   * @param item
   * @param data
   * @returns {*}
   */
  m.settings = function (item, data) {
    var settings = morel.storage.get('settings');
    if (!settings) {
      morel.initSettings();
      settings = morel.storage.get('settings');
    }

    if (data) {
      settings[item] = data;
      return morel.storage.set('settings', settings);
    } else {
      return (item) ? settings[item] : settings;
    }
  };

  /**
   * Resets the app to the initial state.
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
}(window.morel || {}, jQuery)); //END