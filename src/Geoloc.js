//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * GEOLOCATION MODULE
     **********************************************************************/

    /* global morel, _log */
    m.extend('Geoloc', {
        CONF: {
            GPS_ACCURACY_LIMIT: 100, //meters
            HIGH_ACCURACY: true,
            TIMEOUT: 120000
        },

        TIMEOUT_ERR: 1, //code

        latitude: null,
        longitude: null,
        accuracy: -1,

        startTime: 0,
        id: 0,

        /**
         * Sets the Latitude, Longitude and the Accuracy of the GPS lock.
         *
         * @param lat
         * @param lon
         * @param acc
         */
        set: function (lat, lon, acc) {
            this.latitude = lat;
            this.longitude = lon;
            this.accuracy = acc;
        },

        /**
         * Gets the the Latitude, Longitude and the Accuracy of the GPS lock.
         *
         * @returns {{lat: *, lon: *, acc: *}}
         */
        get: function () {
            return {
                'lat': this.latitude,
                'lon': this.longitude,
                'acc': this.accuracy
            };
        },

        /**
         * Clears the current GPS lock.
         */
        clear: function () {
            this.set(null, null, -1);
        },

        isRunning: function () {
          return this.id;
        },

        /**
         * Runs the GPS.
         *
         * @returns {*}
         */
        run: function (onUpdate, callback, accuracyLimit) {
            accuracyLimit = accuracyLimit || this.CONF.GPS_ACCURACY_LIMIT;

            // Early return if geolocation not supported.
            if (!navigator.geolocation) {
                var error = new m.Error("Geolocation is not supported.");
                callback && callback(error);
                return;
            }

            //stop any other geolocation service started before
            this.stop();
            this.clear();

            this.startTime = new Date().getTime();

            // Request geolocation.
            this.id = this.watchPosition(onUpdate, callback, accuracyLimit);
        },

        /**
         * Stops any currently running geolocation service.
         */
        stop: function () {
            navigator.geolocation.clearWatch(this.id);
            this.id = 0;
        },

        /**
         * Watches the GPS position.
         *
         * @param onUpdate
         * @param callback
         * @param accuracyLimit accuracy in meters to which capture location
         * @returns {Number} id of running GPS
         */
        watchPosition: function (onUpdate, callback, accuracyLimit) {
            var that = this,
                options = {
                    enableHighAccuracy: this.CONF.HIGH_ACCURACY,
                    maximumAge: 0,
                    timeout: this.CONF.TIMEOUT
                };

            var onSuccess = function (position) {
                var currentTime = new Date().getTime();
                if ((currentTime - that.startTime) > that.TIMEOUT) {
                    //timed out
                    that.stop();

                    var error = new m.Error({
                        number: that.TIMEOUT_ERR,
                        message: "Geolocation timed out."
                    });
                    callback && callback(error);
                    return;
                }

                var location = {
                    'lat': position.coords.latitude,
                    'lon': position.coords.longitude,
                    'acc': position.coords.accuracy
                };

                //set for the first time
                var prevAccuracy = that.accuracy;
                if (prevAccuracy === -1) {
                    prevAccuracy = location.acc + 1;
                }

                if (location.acc > -1 && location.acc < prevAccuracy) {
                    //only set it up if the accuracy has increased
                    that.set(location.lat, location.lon, location.acc);

                    if (location.acc < accuracyLimit) {
                        that.stop();

                        callback && callback(null, location);
                    } else {
                        onUpdate && onUpdate(location);
                    }
                }
            };

            //Callback if geolocation fails
            var onError = function (err) {
                var error = new m.Error(err.message);
                callback && callback(error);
            };

            return navigator.geolocation.watchPosition(onSuccess, onError, options);
        }
    });

    m.extend(m.Geoloc, m.Events);

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
