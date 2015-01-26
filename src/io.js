/***********************************************************************
 * IO MODULE
 **********************************************************************/

var morel = morel || {};
morel.io = (function (m, $) {
  "use strict";
  /*global _log*/
  //configuration should be setup in app config file
  m.CONF = {
    RECORD_URL: "" //todo: set to null and throw error if undefined
  };

  /**
   * Sending all saved records.
   *
   * @returns {undefined}
   */
  m.sendAllSavedRecords = function () {
    var onSuccess = null;
    if (navigator.onLine) {
      onSuccess = function (records) {
        //todo
        var key = Object.keys(records)[0]; //getting the first one of the array
        if (key) {
          $.mobile.loading('show');
          _log("IO: sending record: " + key + ".", morel.LOG_INFO);
          var onSendSavedSuccess = function (data) {
            var recordKey = this.callback_data.recordKey;
            _log("IO: record ajax (success): " + recordKey + ".", morel.LOG_INFO);

            morel.record.db.remove(recordKey);
            morel.io.sendAllSavedRecords();
          };
          m.sendSavedRecord(key, onSendSavedSuccess);
        } else {
          $.mobile.loading('hide');
        }
      };

      morel.record.db.getAll(onSuccess);
    } else {
      $.mobile.loading('show', {
        text: "Looks like you are offline!",
        theme: "b",
        textVisible: true,
        textonly: true
      });

      setTimeout(function () {
        $.mobile.loading('hide');
      }, 3000);
    }
  };

  /**
   * Sends the saved record
   *
   * @param recordKey
   * @param callback
   * @param onError
   * @param onSend
   */
  m.sendSavedRecord = function (recordKey, callback, onError, onSend) {
    _log("IO: creating the record.", morel.LOG_DEBUG);
    function onSuccess(data) {
      var record = {
        'data': data,
        'recordKey': recordKey
      };

      function onPostError(xhr, ajaxOptions, thrownError) {
        _log("IO: ERROR record ajax (" + xhr.status + " " + thrownError + ").", morel.LOG_ERROR);
        //_log(xhr.responseText);
        var err = {
          message: xhr.status + " " + thrownError + " " + xhr.responseText
        };

        onError(err);
      }

      m.postRecord(record, callback, onPostError, onSend);
    }

    morel.record.db.getData(recordKey, onSuccess);

  };

  /**
   * Submits the record.
   */
  m.postRecord = function (record, onSuccess, onError, onSend) {
    _log('IO: posting a record with AJAX.', morel.LOG_INFO);
    var data = {};
    if (!record.data) {
      //extract the record data
      var form = document.getElementById(record.id);
      data = new FormData(form);
    } else {
      data = record.data;
    }

    //Add authentication
    data = morel.auth.append(data);

    $.ajax({
      url: m.getRecordURL(),
      type: 'POST',
      data: data,
      callback_data: record,
      cache: false,
      enctype: 'multipart/form-data',
      processData: false,
      contentType: false,
      success: onSuccess || function (data) {
        var recordKey = this.callback_data.recordKey;
        _log("IO: record ajax (success): " + recordKey + ".", morel.LOG_INFO);
      },
      error: onError || function (xhr, ajaxOptions, thrownError) {
        _log("IO: record ajax (" + xhr.status + " " + thrownError + ").", morel.LOG_ERROR);
        //_log(xhr.responseText);
      },
      beforeSend: onSend || function () {
        _log("IO: onSend.", morel.LOG_DEBUG);
      }
    });
  };

  /**
   * Returns App main record Path.
   *
   * @param basePath
   * @returns {*}
   */
  m.getRecordURL = function (basePath) {
    return basePath + m.CONF.RECORD_URL;
  };

  return m;
}(morel.io || {}, jQuery));