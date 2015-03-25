/***********************************************************************
 * IO MODULE
 **********************************************************************/

/* global morel, _log */
morel.extend('io', function (m) {
  "use strict";

  //configuration should be setup in app config file
  m.CONF = {
    RECORD_URL: "" //todo: set to null and throw error if undefined
  };

  /**
   * Sending all saved records.
   *
   * @returns {undefined}
   */
  m.sendAllSavedRecords = function (callback, callbackDone) {
    var onSuccess = null;
    if (navigator.onLine) {
      onSuccess = function (records) {
        var id = Object.keys(records)[0]; //getting the first one of the array
        if (id) {
          
          var onSendSavedSuccess = function (data) {
            var recordKey = this.callback_data.recordKey;
            

            morel.record.db.remove(recordKey);
            if (callback){
              callback();
            }
            morel.io.sendAllSavedRecords(callback, callbackDone);
          };

          id = parseInt(id); //only numbers
          m.sendSavedRecord(id, onSendSavedSuccess);
        } else {
          if (callbackDone){
            callbackDone();
          }
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
    
    function onSuccess(data) {
      var record = {
        'data': data,
        'recordKey': recordKey
      };
      function onPostError(xhr, ajaxOptions, thrownError) {
        
        
        var message = "";
        if (xhr.responseText || thrownError){
          message = xhr.status + " " + thrownError + " " + xhr.responseText;
        } else {
          message = "Error occurred while sending.";
        }
        var err = {
          message: message
        };
        if (onError){
          onError(err);
        }
      }
      m.postRecord(record, callback, onPostError, onSend);
    }
    morel.record.db.getData(recordKey, onSuccess);
  };

  /**
   * Submits the record.
   */
  m.postRecord = function (record, onSuccess, onError, onSend) {
    
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
        
      },
      error: onError || function (xhr, ajaxOptions, thrownError) {
        
        
      },
      beforeSend: onSend || function () {
        
      }
    });
  };

  /**
   * Returns App main record Path.
   *
   * @param basePath
   * @returns {*}
   */
  m.getRecordURL = function () {
    return m.CONF.RECORD_URL;
  };

  return m;
});