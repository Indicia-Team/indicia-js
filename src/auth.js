/***********************************************************************
 * AUTH MODULE
 **********************************************************************/

app = app || {};
app.auth = (function (m, $) {
  //module configuration should be setup in an app config file
  m.CONF = {
    APPNAME: "",
    APPSECRET: "",
    WEBSITE_ID: 0,
    SURVEY_ID: 0
  };

  //name under which the user details are stored
  m.USER = 'user';

  /**
   * Appends user and app authentication to the passed data object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  m.append = function (data) {
    //user logins
    m.appendUser(data);
    //app logins
    m.appendApp(data);
    //warehouse data
    m.appendWarehouse(data);

    return data;
  };

  /**
   * Appends user authentication - Email and Password to
   * the passed data object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  m.appendUser = function (data) {
    var user = m.getUser();
    if (m.isUser()) {
      data.append('email', user.email);
      data.append('password', user.password)
    }

    return data;
  };

  /**
   * Appends app authentication - Appname and Appsecret to
   * the passed object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  m.appendApp = function (data) {
    data.append('appname', this.CONF.APPNAME);
    data.append('appsecret', this.CONF.APPSECRET);

    return data;
  };

  /**
   * Appends warehouse related information - website_id and survey_id to
   * the passed data object.
   * Note: object has to implement 'append' method.
   *
   * This is necessary because the data must be associated to some
   * website and survey in the warehouse.
   *
   * @param data An object to modify
   * @returns {*} An data object
   */
  m.appendWarehouse = function (data) {
    data.append('website_id', this.CONF.WEBSITE_ID);
    data.append('survey_id', this.CONF.SURVEY_ID);

    return data;
  };

  /**
   * Checks if the user has authenticated with the app.
   *
   * @returns {boolean} True if the user exists, else False
   */
  m.isUser = function () {
    var user = m.getUser();
    return !$.isEmptyObject(user);
  };

  /**
   * Brings the user details from the storage.
   *
   * @returns {Object|*}
   */
  m.getUser = function () {
    return app.settings(m.USER);
  };

  /**
   * Saves the authenticated user details to the storage.
   *
   * @param user A user object
   */
  m.setUser = function (user) {
    app.settings(m.USER, user);
  };

  /**
   * Removes the current user details from the storage.
   */
  m.removeUser = function () {
    app.settings(m.USER, {});
  };

  return m;
}(app.auth || {}, jQuery));

