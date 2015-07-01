//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
/***********************************************************************
 * IO MODULE
 **********************************************************************/

  /* global morel, _log */
  m.extend('io', {
    //configuration should be setup in app config file
    CONF: {
      RECORD_URL: "" //todo: set to null and throw error if undefined
    },

    /**
     * Sending all saved records.
     *
     * @returns {undefined}
     */
    sendAllSavedRecords: function (callback, callbackDone) {
      var onSuccess = null;
      if (navigator.onLine) {
        onSuccess = function (records) {
          var id = Object.keys(records)[0]; //getting the first one of the array
          if (id) {

            var onSendSavedSuccess = function (data) {
              var recordKey = this.callback_data.recordKey;


              m.record.db.remove(recordKey);
              if (callback){
                callback();
              }
              m.io.sendAllSavedRecords(callback, callbackDone);
            };

            id = parseInt(id); //only numbers
            this.sendSavedRecord(id, onSendSavedSuccess);
          } else {
            if (callbackDone){
              callbackDone();
            }
          }
        };

        m.record.db.getAll(onSuccess);
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
    },

    /**
     * Sends the saved record
     *
     * @param recordKey
     * @param callback
     * @param onError
     * @param onSend
     */
    sendSavedRecord: function (recordKey, callback, onError, onSend) {

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
        this.postRecord(record, callback, onPostError, onSend);
      }
      m.record.db.getData(recordKey, onSuccess);
    },

    /**
     * Submits the record.
     */
    postRecord: function (record, onSuccess, onError, onSend) {

      var data = {};
      if (!record.data) {
        //extract the record data
        var form = document.getElementById(record.id);
        data = new FormData(form);
      } else {
        data = record.data;
      }

      //Add authentication
      data = m.auth.append(data);

      $.ajax({
        url: this.getRecordURL(),
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
    },

    /**
     * Returns App main record Path.
     *
     * @param basePath
     * @returns {*}
     */
    getRecordURL: function () {
      return this.CONF.RECORD_URL;
    }
  });

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
