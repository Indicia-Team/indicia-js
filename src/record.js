/***********************************************************************
 * RECORD MODULE
 *
 * Things to work on:
 *  - Validation should be moved to the app controllers level.
 **********************************************************************/

app = app || {};
app.record = (function (m, $) {

  //CONSTANTS
  //todo: add _KEY to each constant name to distinguish all KEYS
  m.RECORD = "record"; //name under which the record is stored
  m.MULTIPLE_GROUP_KEY = "multiple_"; //to separate a grouped input
  m.COUNT = "record_count";
  m.STORAGE = "record_";
  m.PIC = "_pic_";
  m.DATA = "data";
  m.FILES = "files";
  m.SETTINGS = "recordSettings";
  m.LASTID = "lastId";

  //GLOBALS
  m.totalFiles = 0;

  /**
   * Initialises the recording environment.
   *
   * @returns {*}
   */
  m.init = function () {
    var settings = m.getSettings();
    if (settings == null) {
      settings = {};
      settings[m.LASTID] = 0;
      m.setSettings(settings);
      return settings;
    }
    return null;
  };

  /**
   * Record settings. A separate DOM storage unit for storing
   * recording specific data.
   * Note: in the future, if apart of LastFormId no other uses arises
   * should be merged with default app.settings.
   *
   * @param settings
   */
  m.setSettings = function (settings) {
    app.storage.set(m.SETTINGS, settings);
  };

  /**
   * Initializes and returns the settings.
   *
   * @returns {{}}
   */
  m.initSettings = function () {
    var settings = {};
    settings[m.LASTID] = 0;
    m.setSettings(settings);
    return settings;
  };

  /**
   * Returns the settings.
   *
   * @returns {*|{}}
   */
  m.getSettings = function () {
    var settings = app.storage.get(m.SETTINGS) || m.initSettings();
    return settings;
  };

  /**
   * Returns the current record.
   *
   * @returns {*}
   */
  m.get = function () {
    return app.storage.tmpGet(m.RECORD) || {};
  };

  /**
   * Sets the current record.
   *
   * @param record The currenr record to be stored.
   */
  m.set = function (record) {
    app.storage.tmpSet(m.RECORD, record);
  };

  /**
   * Clears the current record.
   */
  m.clear = function () {
    app.storage.tmpRemove(m.RECORD);
  };

  /**
   * TODO: this and validator() functions need refactoring.
   *
   * @param recordId
   */
  m.addValidator = function (recordId) {
    //todo: refactor to $validator
    var validator = $(recordId).validate({
      ignore: ":hidden,.inactive",
      errorClass: "inline-error",
      errorElement: 'p',
      highlight: function (element, errorClass) {
        //todo: refactor to $jqElement
        var jqElement = $(element);
        if (jqElement.is(':radio') || jqElement.is(':checkbox')) {
          //if the element is a radio or checkbox group then highlight the group
          var jqBox = jqElement.parents('.control-box');
          if (jqBox.length !== 0) {
            jqBox.eq(0).addClass('ui-state-error');
          } else {
            jqElement.addClass('ui-state-error');
          }
        } else {
          jqElement.addClass('ui-state-error');
        }
      },
      unhighlight: function (element, errorClass) {
        //todo: refactor to $jqElement
        var jqElement = $(element);
        if (jqElement.is(':radio') || jqElement.is(':checkbox')) {
          //if the element is a radio or checkbox group then highlight the group
          var jqBox = jqElement.parents('.control-box');
          if (jqBox.length !== 0) {
            jqBox.eq(0).removeClass('ui-state-error');
          } else {
            jqElement.removeClass('ui-state-error');
          }
        } else {
          jqElement.removeClass('ui-state-error');
        }
      },
      invalidHandler: function (record, validator) {
        var tabselected = false;
        jQuery.each(validator.errorMap, function (ctrlId, error) {
          // select the tab containing the first error control
          var ctrl = jQuery('[name=' + ctrlId.replace(/:/g, '\\:').replace(/\[/g, '\\[').replace(/\]/g, '\\]') + ']');
          if (!tabselected) {
            var tp = ctrl.filter('input,select,textarea').closest('.ui-tabs-panel');
            if (tp.length === 1) {
              $(tp).parent().tabs('select', tp.id);
            }
            tabselected = true;
          }
          ctrl.parents('fieldset').removeClass('collapsed');
          ctrl.parents('.fieldset-wrapper').show();
        });
      },
      messages: [],
      errorPlacement: function (error, element) {
        var jqBox, nexts;
        if (element.is(':radio') || element.is(':checkbox')) {
          jqBox = element.parents('.control-box');
          element = jqBox.length === 0 ? element : jqBox;
        }
        nexts = element.nextAll(':visible');
        element = nexts && $(nexts[0]).hasClass('deh-required') ? nexts[0] : element;
        error.insertAfter(element);
      }
    });
    //Don't validate whilst user is still typing in field
    //validator.settings.onkeyup = false;
  };

  /**
   * Record validation.
   */
  m.validate = function (recordId) {
    var invalids = [];

    //todo: refactor to $tabinputs
    var tabinputs = $('#' + recordId).find('input,select,textarea').not(':disabled,[name=],.scTaxonCell,.inactive');
    if (tabinputs.length > 0) {
      tabinputs.each(function (index) {
        if (!$(this).valid()) {
          var found = false;

          //this is necessary to check if there was an input with
          //the same name in the invalids array, if found it means
          //this new invalid input belongs to the same group and should
          //be ignored.
          for (var i = 0; i < invalids.length; i++) {
            if (invalids[i].name == (app.record.MULTIPLE_GROUP_KEY + this.name)) {
              found = true;
              break;
            }
            if (invalids[i].name == this.name) {
              var new_id = (this.id).substr(0, this.id.lastIndexOf(':'));
              invalids[i].name = app.record.MULTIPLE_GROUP_KEY + this.name;
              invalids[i].id = new_id;
              found = true;
              break;
            }
          }
          //save the input as a invalid
          if (!found)
            invalids.push({"name": this.name, "id": this.id});
        }
      });
    }

    //todo: refactor to $tabtaxoninputs
    var tabtaxoninputs = $('#entry_record .scTaxonCell').find('input,select').not(':disabled');
    if (tabtaxoninputs.length > 0) {
      tabtaxoninputs.each(function (index) {
        invalids.push({"name": this.name, "id": this.id});
      });
    }

    //constructing a response about invalid fields to the user
    if (invalids.length > 0) {
      return invalids;
    }
    return [];
  };

  /**
   * Returns a recording record array from stored inputs.
   */
  m.extract = function () {
    //extract record data
    var record_array = [];
    var inputName, inputValue;

    var record = app.record.get();
    if (record == null) {
      return record_array;
    }
    var inputs = Object.keys(record);
    for (var inputNum = 0; inputNum < inputs.length; inputNum++) {
      inputName = inputs[inputNum];
      inputValue = record[inputName];
      record_array.push({
        "name": inputName,
        "value": inputValue
      });
    }

    return record_array;
  };

  /**
   * Extracts data (apart from files) from provided record into a record_array that it returns.
   *
   * @param record
   * @returns {Array}
   */
  m.extractFromRecord = function (record) {
    //extract record data
    var record_array = [];
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
          _log("RECORD: unknown input type: " + type + '.', app.LOG_ERROR);
          break;
      }

      if (needed) {
        if (value != "") {
          record_array.push({
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

      if (value != "") {
        record_array.push({
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

      if (value != "") {
        record_array.push({
          "name": name,
          "value": value,
          "type": type
        });
      }
    });

    return record_array;
  };

  return m;
}(app.record || {}, app.$ || jQuery));