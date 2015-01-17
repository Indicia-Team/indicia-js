/***********************************************************************
 * GEOLOC MODULE
 **********************************************************************/

app = app || {};
app.geoloc = (function (m, $) {

  //configuration should be setup in app config file
  m.CONF = {
    GPS_ACCURACY_LIMIT: 26000,
    HIGH_ACCURACY: true,
    TIMEOUT: 120000
  };

  //todo: limit the scope of the variables to this module's functions.
  m.latitude = null;
  m.longitude = null;
  m.accuracy = -1;

  m.start_time = 0;
  m.id = 0;
  m.map = null;

  /**
   * Sets the Latitude, Longitude and the Accuracy of the GPS lock.
   *
   * @param lat
   * @param lon
   * @param acc
   */
  m.set = function (lat, lon, acc) {
    this.latitude = lat;
    this.longitude = lon;
    this.accuracy = acc;
  };

  /**
   * Gets the the Latitude, Longitude and the Accuracy of the GPS lock.
   *
   * @returns {{lat: *, lon: *, acc: *}}
   */
  m.get = function () {
    return {
      'lat': this.latitude,
      'lon': this.longitude,
      'acc': this.accuracy
    }
  };

  /**
   * Clears the current GPS lock.
   */
  m.clear = function () {
    m.set(null, null, -1);
  };

  /**
   * Gets the accuracy of the current GPS lock.
   *
   * @returns {*}
   */
  m.getAccuracy = function () {
    return this.accuracy;
  };

  /**
   * Runs the GPS.
   *
   * @returns {*}
   */
  m.run = function (onUpdate, onSuccess, onError) {
    _log('GEOLOC: run.', app.LOG_INFO);

    // Early return if geolocation not supported.
    if (!navigator.geolocation) {
      _log("GEOLOC: not supported!", app.LOG_ERROR);
      if (onError != null) {
        onError({message: "Geolocation is not supported!"});
      }
      return;
    }

    //stop any other geolocation service started before
    app.geoloc.stop();
    app.geoloc.clear();

    ////check if the lock is acquired and the accuracy is good enough
    //var accuracy = app.geoloc.getAccuracy();
    //if ((accuracy > -1) && (accuracy < this.CONF.GPS_ACCURACY_LIMIT)){
    //    _log('GEOLOC: lock is good enough (acc: ' + accuracy + ' meters).');
    //    if (onSuccess != null) {
    //        onSuccess(this.get());
    //    }
    //    return;
    //}

    this.start_time = new Date().getTime();

    // Request geolocation.
    this.id = app.geoloc.watchPosition(onUpdate, onSuccess, onError);
  };

  /**
   * Stops any currently running geolocation service.
   */
  m.stop = function () {
    navigator.geolocation.clearWatch(app.geoloc.id);
  };

  /**
   * Watches the GPS position.
   *
   * @param onUpdate
   * @param onSuccess
   * @param onError
   * @returns {Number} id of running GPS
   */
  m.watchPosition = function (onUpdate, onSuccess, onError) {
    var onGeolocSuccess = function (position) {
      //timeout
      var current_time = new Date().getTime();
      if ((current_time - app.geoloc.start_time) > app.geoloc.TIMEOUT) {
        //stop everything
        app.geoloc.stop();
        _log("GEOLOC: timeout.", app.LOG_ERROR);
        if (onError != null) {
          onError({message: "Geolocation timed out!"});
        }
        return;
      }

      var location = {
        'lat': position.coords.latitude,
        'lon': position.coords.longitude,
        'acc': position.coords.accuracy
      };

      //set for the first time
      var prev_accuracy = app.geoloc.getAccuracy();
      if (prev_accuracy == -1) {
        prev_accuracy = location.acc + 1;
      }

      //only set it up if the accuracy is increased
      if (location.acc > -1 && location.acc < prev_accuracy) {
        app.geoloc.set(location.lat, location.lon, location.acc);
        if (location.acc < app.geoloc.CONF.GPS_ACCURACY_LIMIT) {
          _log("GEOLOC: finished: " + location.acc + " meters.", app.LOG_INFO);
          app.geoloc.stop();

          //save in storage
          app.settings('location', location);
          if (onSuccess != null) {
            onSuccess(location);
          }
        } else {
          _log("GEOLOC: updated acc: " + location.acc + " meters.", app.LOG_INFO);
          if (onUpdate != null) {
            onUpdate(location);
          }
        }
      }
    };

    // Callback if geolocation fails.
    var onGeolocError = function (error) {
      _log("GEOLOC: ERROR.", app.LOG_ERROR);
      if (onError != null) {
        onError({'message': error.message});
      }
    };

    // Geolocation options.
    var options = {
      enableHighAccuracy: m.CONF.HIGH_ACCURACY,
      maximumAge: 0,
      timeout: m.CONF.TIMEOUT
    };

    return navigator.geolocation.watchPosition(
      onGeolocSuccess,
      onGeolocError,
      options
    );
  };

  /**
   * Validates the current GPS lock quality.
   *
   * @returns {*}
   */
  m.valid = function () {
    var accuracy = this.getAccuracy();
    if (accuracy == -1) {
      //No GPS lock yet
      return app.ERROR;

    } else if (accuracy > this.CONF.GPS_ACCURACY_LIMIT) {
      //Geolocated with bad accuracy
      return app.FALSE;

    } else {
      //Geolocation accuracy is good enough
      return app.TRUE;
    }
  };

  return m;
})(app.geoloc || {}, app.$ || jQuery);
