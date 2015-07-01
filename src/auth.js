//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
 /***********************************************************************
 * AUTH MODULE
 **********************************************************************/


  /* global morel */
  m.extend('auth', {
    //module configuration should be setup in an app config file
    CONF: {
      APPNAME: "",
      APPSECRET: "",
      WEBSITE_ID: 0,
      SURVEY_ID: 0
    },

    //name under which the user details are stored
    USER: 'user',

    /**
     * Appends user and app authentication to the passed data object.
     * Note: object has to implement 'append' method.
     *
     * @param data An object to modify
     * @returns {*} A data object
     */
    append: function (data) {
      //user logins
      this.appendUser(data);
      //app logins
      this.appendApp(data);
      //warehouse data
      this.appendWarehouse(data);

      return data;
    },

    /**
     * Appends user authentication - Email and Password to
     * the passed data object.
     * Note: object has to implement 'append' method.
     *
     * @param data An object to modify
     * @returns {*} A data object
     */
    appendUser: function (data) {
      if (this.isUser()) {
        var user = this.getUser();

        data.append('email', user.email);
        data.append('usersecret', user.secret);
      }

      return data;
    },

    /**
     * Appends app authentication - Appname and Appsecret to
     * the passed object.
     * Note: object has to implement 'append' method.
     *
     * @param data An object to modify
     * @returns {*} A data object
     */
    appendApp: function (data) {
      data.append('appname', this.CONF.APPNAME);
      data.append('appsecret', this.CONF.APPSECRET);

      return data;
    },

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
    appendWarehouse: function (data) {
      data.append('website_id', this.CONF.WEBSITE_ID);
      data.append('survey_id', this.CONF.SURVEY_ID);

      return data;
    },

    /**
     * Checks if the user has authenticated with the app.
     *
     * @returns {boolean} True if the user exists, else False
     */
    isUser: function () {
      var obj = this.getUser();
      return Object.keys(obj).length !== 0;
    },

    /**
     * Brings the user details from the storage.
     *
     * @returns {Object|*}
     */
    getUser: function () {
      return m.settings(this.USER) || {};
    },

    /**
     * Saves the authenticated user details to the storage.
     *
     * @param user A user object
     */
    setUser: function (user) {
      m.settings(this.USER, user);
    },

    /**
     * Removes the current user details from the storage.
     */
    removeUser: function () {
      m.settings(this.USER, {});
    }
  });

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
