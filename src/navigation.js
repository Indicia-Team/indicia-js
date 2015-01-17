/***********************************************************************
 * NAVIGATION MODULE
 **********************************************************************/

app = app || {};
app.navigation = (function (m, $) {

  /**
   * Updates the dialog box appended to the page
   * todo: remove hardcoded dialog ID
   */
  m.makeDialog = function (text) {
    $('#app-dialog-content').empty().append(text);
  };

  /**
   * Created a popup.
   * todo: remove hardcoded popup ID
   *
   * @param text
   * @param addClose
   */
  m.popup = function (text, addClose) {
    this.makePopup(text, addClose);
    $('#app-popup').popup();
    $('#app-popup').popup('open').trigger('create');
  };

  /**
   * Updates the popup div appended to the page
   */
  m.makePopup = function (text, addClose) {
    var PADDING_WIDTH = 10;
    var PADDING_HEIGHT = 20;
    var CLOSE_KEY = "<a href='#' data-rel='back' data-role='button '" +
      "data-theme='b' data-icon='delete' data-iconpos='notext '" +
      "class='ui-btn-right ui-link ui-btn ui-btn-b ui-icon-delete " +
      "ui-btn-icon-notext ui-shadow ui-corner-all '" +
      "role='button'>Close</a>";

    if (addClose) {
      text = CLOSE_KEY + text;
    }

    if (PADDING_WIDTH > 0 || PADDING_HEIGHT > 0) {
      text = "<div style='padding:" + PADDING_WIDTH + "px " + PADDING_HEIGHT + "px;'>" +
      text + "<div>";
    }

    $('#app-popup').empty().append(text);
  };

  /**
   * Closes a popup.
   * todo: remove hardcoded popup ID
   */
  m.closePopup = function () {
    $('#app-popup').popup("close");
  };

  /**
   * Creates a loader
   */
  m.makeLoader = function (text, time) {
    //clear previous loader
    $.mobile.loading('hide');

    //display new one
    $.mobile.loading('show', {
      theme: "b",
      html: "<div style='padding:5px 5px;'>" + text + "</div>",
      textVisible: true,
      textonly: true
    });

    setTimeout(function () {
      $.mobile.loading('hide');
    }, time);
  };

  /**
   * Displays a self disappearing lightweight message.
   *
   * @param text
   * @param time 0 if no hiding, null gives default 3000ms delay
   */
  m.message = function (text, time) {
    if (text == null) {
      _log('NAVIGATION: no text provided to message.', app.LOG_ERROR);
      return;
    }

    var messageId = 'appLoaderMessage';

    text = '<div id="' + messageId + '">' + text + '</div>';

    $.mobile.loading('show', {
      theme: "b",
      textVisible: true,
      textonly: true,
      html: text
    });

    //trigger JQM beauty
    $('#' + messageId).trigger('create');

    if (time != 0) {
      setTimeout(function () {
        $.mobile.loading('hide');
      }, time || 3000);
    }
  };

  /**
   * Opens particular app page-path.
   *
   * @param delay
   * @param path If no path supplied goes to app.PATH
   */
  m.go = function (delay, path) {
    setTimeout(function () {
      path = (path == undefined) ? "" : path;
      window.location = Drupal.settings.basePath + app.CONF.HOME + path;
    }, delay);
  };

  /**
   * Opens the app home page.
   */
  //todo: clean setting of the timeout and hardcoded '/form'
  m.goRecord = function (delay) {
    setTimeout(function () {
      $.mobile.changePage(Drupal.settings.mobileIformStartPath + '/form');
    }, delay);
  };

  return m;
}(app.navigation || {}, app.$ || jQuery));