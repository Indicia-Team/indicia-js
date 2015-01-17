/***********************************************************************
 * HELPER MODULE
 *
 * Functions that were to ambiguous to be placed in one module.
 **********************************************************************/

/**
 * Gets a query parameter from the URL.
 */
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * Takes care of application execution logging.
 *
 * Uses 5 levels of logging:
 *  0: none
 *  1: errors
 *  2: warnings
 *  3: information
 *  4: debug
 *
 * Levels values defined in core app module.
 *
 * @param message
 * @param level
 * @private
 */
function _log(message, level) {

  //do nothing if logging turned off
  if (app.CONF.LOG == app.LOG_NONE) {
    return;
  }

  if (app.CONF.LOG >= level || level == null) {
    switch (level) {
      case app.LOG_ERROR:
        _logError(message);
        break;
      case app.LOG_WARNING:
        console.warn(message);
        break;
      case app.LOG_INFO:
        console.log(message);
        break;
      case app.LOG_DEBUG:
      default:
        //IE does not support console.debug
        if (console.debug == null) {
          console.log(message);
          break;
        }
        console.debug(message);
    }
  }
}

/**
 * Prints and posts an error to the mobile authentication log.
 *
 * @param error object holding a 'message', and optionally 'url' and 'line' fields.
 * @private
 */
function _logError(error) {
  //print error
  console.error(error['message'], error['url'], error['line']);

  //prepare the message
  var message = '<b style="color: red">' + error['message'] + '</b>';
  message += '</br><b> app.version = </b><i>"' + app.version + '"</i>';

  message += '</br><b> app.CONF.NAME = </b><i>"' + app.CONF.NAME + '"</i>';
  message += '</br><b> app.CONF.VERSION = </b><i>"' + app.CONF.VERSION + '"</i></br>';

  message += '</br>' + navigator.appName;
  message += '</br>' + navigator.appVersion;

  var url = error['url'] + ' (' + error['line'] + ')';

  if (navigator.onLine) {
    //send to server

    var data = {};
    data.append = function (name, value) {
      this[name] = value;
    };
    data.append('message', message);
    data.append('url', url);
    app.auth.appendApp(data);

    //removing unnecessary information
    delete data.append;

    jQuery.ajax({
      url: Drupal.settings.basePath + 'mobile/log',
      type: 'post',
      dataType: 'json',
      success: function (data) {
        console.log(data);
      },
      data: data
    });
  } else {
    //save

  }


}

/**
 * Hook into window.error function.
 *
 * @param message
 * @param url
 * @param line
 * @returns {boolean}
 * @private
 */
function _onerror(message, url, line) {
  window.onerror = null;

  var error = {
    'message': message,
    'url': url || '',
    'line': line || -1
  };

  _log(error, app.LOG_ERROR);

  window.onerror = this; // turn on error handling again
  return true; // suppress normal error reporting
}

//todo: remove if not used.
function loadScript(src) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  document.body.appendChild(script);
}

/**
 * Starts an Appcache Manifest Downloading.
 *
 * @param id
 * @param files_no
 * @param src
 * @param callback
 * @param onError
 */
function startManifestDownload(id, files_no, src, callback, onError) {
  /*todo: Add better offline handling:
   If there is a network connection, but it cannot reach any
   Internet, it will carry on loading the page, where it should stop it
   at that point.
   */
  if (navigator.onLine) {
    src = Drupal.settings.basePath + src + '?base_path=' + Drupal.settings.basePath + '&files=' + files_no;
    var frame = document.getElementById(id);
    if (frame) {
      //update
      frame.contentWindow.applicationCache.update();
    } else {
      //init
      //app.navigation.popup('<iframe id="' + id + '" src="' + src + '" width="215px" height="215px" scrolling="no" frameBorder="0"></iframe>', true);
      app.navigation.message('<iframe id="' + id + '" src="' + src + '" width="215px" height="215px" scrolling="no" frameBorder="0"></iframe>', 0);
      frame = document.getElementById(id);

      //After frame loading set up its controllers/callbacks
      frame.onload = function () {
        _log('Manifest frame loaded', app.LOG_INFO);
        if (callback != null) {
          frame.contentWindow.finished = callback;
        }

        if (onError != null) {
          frame.contentWindow.error = onError;
        }
      }
    }
  } else {
    $.mobile.loading('show', {
      text: "Looks like you are offline!",
      theme: "b",
      textVisible: true,
      textonly: true
    });
  }
}

/**
 * Initialises and returns a variable.
 *
 * @param name
 * @returns {*}
 */
function varInit(name) {
  var name_array = name.split('.');
  window[name_array[0]] = window[name_array[0]] || {};
  var variable = window[name_array[0]];

  //iterate through the namespaces
  for (var i = 1; i < name_array.length; i++) {
    if (variable[name_array[i]] !== 'object') {
      //overwrite if it is not an object
      variable[name_array[i]] = {};
    }
    variable = variable[name_array[i]];
  }
  return variable;
}

/**
 * Clones an object.
 *
 * @param obj
 * @returns {*}
 */
function objClone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = objClone(obj[attr]);
  }
  return copy;
}

/**
 * Adds Enable/Disable JQM Tab functionality
 * FROM: http://kylestechnobabble.blogspot.co.uk/2013/08/easy-way-to-enable-disable-hide-jquery.html
 * USAGE:
 * $('MyTabSelector').disableTab(0);        // Disables the first tab
 * $('MyTabSelector').disableTab(1, true);  // Disables & hides the second tab
 */
(function ($) {
  $.fn.disableTab = function (tabIndex, hide) {

    // Get the array of disabled tabs, if any
    var disabledTabs = this.tabs("option", "disabled");

    if ($.isArray(disabledTabs)) {
      var pos = $.inArray(tabIndex, disabledTabs);

      if (pos < 0) {
        disabledTabs.push(tabIndex);
      }
    }
    else {
      disabledTabs = [tabIndex];
    }

    this.tabs("option", "disabled", disabledTabs);

    if (hide === true) {
      $(this).find('li:eq(' + tabIndex + ')').addClass('ui-state-hidden');
    }

    // Enable chaining
    return this;
  };

  $.fn.enableTab = function (tabIndex) {

    // Remove the ui-state-hidden class if it exists
    $(this).find('li:eq(' + tabIndex + ')').removeClass('ui-state-hidden');

    // Use the built-in enable function
    this.tabs("enable", tabIndex);

    // Enable chaining
    return this;

  };

})(jQuery);