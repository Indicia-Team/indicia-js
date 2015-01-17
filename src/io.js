/***********************************************************************
 * IO MODULE
 **********************************************************************/

app = app || {};
app.io = (function (m, $) {
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
    if (navigator.onLine) {
      function onSuccess() {
        //todo
        var key = Object.keys(records)[0]; //getting the first one of the array
        if (key != null) {
          $.mobile.loading('show');
          _log("IO: sending record: " + key + ".", app.LOG_INFO);
          var onSendSavedSuccess = function (data) {
            var recordKey = this.callback_data.recordKey;
            _log("IO: record ajax (success): " + recordKey + ".", app.LOG_INFO);

            app.record.db.remove(recordKey);
            app.io.sendAllSavedRecords();
          };
          m.sendSavedRecord(key, onSendSavedSuccess);
        } else {
          $.mobile.loading('hide');
        }
      }

      app.record.db.getAll(onSuccess);
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
   */
  m.sendSavedRecord = function (recordKey, callback, onError, onSend) {
    _log("IO: creating the record.", app.LOG_DEBUG);
    function onSuccess(data) {
      var record = {
        'data': data,
        'recordKey': recordKey
      };

      function onPostError(xhr, ajaxOptions, thrownError) {
        _log("IO: ERROR record ajax (" + xhr.status + " " + thrownError + ").", app.LOG_ERROR);
        //_log(xhr.responseText);
        var err = {
          message: xhr.status + " " + thrownError + " " + xhr.responseText
        };

        onError(err);
      }

      m.postRecord(record, callback, onPostError, onSend)
    }

    app.record.db.getData(recordKey, onSuccess);

  };

  /**
   * Submits the record.
   */
  m.postRecord = function (record, onSuccess, onError, onSend) {
    _log('IO: posting a record with AJAX.', app.LOG_INFO);
    var data = {};
    if (record.data == null) {
      //extract the record data
      form = document.getElementById(record.id);
      data = new FormData(form);
    } else {
      data = record.data;
    }

    //Add authentication
    data = app.auth.append(data);

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
        _log("IO: record ajax (success): " + recordKey + ".", app.LOG_INFO);
      },
      error: onError || function (xhr, ajaxOptions, thrownError) {
        _log("IO: record ajax (" + xhr.status + " " + thrownError + ").", app.LOG_ERROR);
        //_log(xhr.responseText);
      },
      beforeSend: onSend || function () {
        _log("IO: onSend.", app.LOG_DEBUG);
      }
    });
  };

  /**
   * Returns App main record Path.
   *
   * @returns {*}
   */
  m.getRecordURL = function () {
    return Drupal.settings.basePath + m.CONF.RECORD_URL;
  };

  return m;
}(app.io || {}, jQuery));