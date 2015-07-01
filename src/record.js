//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
/***********************************************************************
 * RECORD MODULE
 *
 * Things to work on:
 *  - Validation should be moved to the app controllers level.
 **********************************************************************/

  /* global morel, _log */
  m.extend('record', {
    //CONSTANTS
    //todo: add _KEY to each constant name to distinguish all KEYS
    RECORD: "record", //name under which the record is stored
    MULTIPLE_GROUP_KEY: "multiple_", //to separate a grouped input
    COUNT: "record_count",
    STORAGE: "record_",
    PIC: "_pic_",
    DATA: "data",
    FILES: "files",
    SETTINGS: "morel",
    LASTID: "lastId",

    //GLOBALS
    totalFiles: 0,

    /**
     * Initialises the recording environment.
     *
     * @returns {*}
     */
    init: function () {
      var settings = this.getSettings();
      if (!settings) {
        settings = {};
        settings[this.LASTID] = 0;
        this.setSettings(settings);
        return settings;
      }
      return null;
    },

    /**
     * Record settings. A separate DOM storage unit for storing
     * recording specific data.
     * Note: in the future, if apart of LastFormId no other uses arises
     * should be merged with default m.settings.
     *
     * @param settings
     */
    setSettings: function (settings) {
      m.storage.set(this.SETTINGS, settings);
    },

    /**
     * Initializes and returns the settings.
     *
     * @returns {{}}
     */
    initSettings: function () {
      var settings = {};
      settings[this.LASTID] = 0;
      this.setSettings(settings);
      return settings;
    },

    /**
     * Returns the settings.
     *
     * @returns {*|{}}
     */
    getSettings: function () {
      var settings = m.storage.get(this.SETTINGS) || this.initSettings();
      return settings;
    },

    /**
     * Returns the current record.
     *
     * @returns {*}
     */
    get: function () {
      return m.storage.tmpGet(this.RECORD) || {};
    },

    /**
     * Sets the current record.
     *
     * @param record The current record to be stored.
     */
    set: function (record) {
      m.storage.tmpSet(this.RECORD, record);
    },

    /**
     * Clears the current record.
     */
    clear: function () {
      m.storage.tmpRemove(this.RECORD);
    },

    /**
     * Extracts data (apart from files) from provided record into a record_array that it returns.
     *
     * @param record
     * @returns {Array}
     */
    extractFromRecord: function (record) {
      //extract record data
      var recordArray = [];
      var name, value, type, id, needed;

      record.find('input').each(function (index, input) {
        //todo: refactor to $NAME
        name = $(input).attr("name");
        value = $(input).attr('value');
        type = $(input).attr('type');
        id = $(input).attr('id');
        needed = true; //if the input is empty, no need to send it

        switch (type) {
          case "checkbox":
            needed = $(input).is(":checked");
            break;
          case "text":
            value = $(input).val();
            break;
          case "radio":
            needed = $(input).is(":checked");
            break;
          case "button":
          case "file":
            needed = false;
            //do nothing as the files are all saved
            break;
          case "hidden":
            break;
          default:

            break;
        }

        if (needed) {
          if (value !== "") {
            recordArray.push({
              "name": name,
              "value": value,
              "type": type
            });
          }
        }
      });

      //TEXTAREAS
      record.find('textarea').each(function (index, textarea) {
        //todo: refactor to $NAME
        name = $(textarea).attr('name');
        value = $(textarea).val();
        type = "textarea";

        if (value !== "") {
          recordArray.push({
            "name": name,
            "value": value,
            "type": type
          });
        }
      });

      //SELECTS
      record.find("select").each(function (index, select) {
        //todo: refactor to $NAME
        name = $(select).attr('name');
        value = $(select).find(":selected").val();
        type = "select";

        if (value !== "") {
          recordArray.push({
            "name": name,
            "value": value,
            "type": type
          });
        }
      });

      return recordArray;
    }

});

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
