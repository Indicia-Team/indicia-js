//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * GEOLOC MODULE
     **********************************************************************/


    /* global morel, _log */
    m.extend('geoloc', {
        //configuration should be setup in app config file
        CONF: {
            GPS_ACCURACY_LIMIT: 26000,
            HIGH_ACCURACY: true,
            TIMEOUT: 120000
        },

        //todo: limit the scope of the variables to this module's functions.
        latitude: null,
        longitude: null,
        accuracy: -1,

        startTime: 0,
        id: 0,
        map: null,

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

        /**
         * Gets the accuracy of the current GPS lock.
         *
         * @returns {*}
         */
        getAccuracy: function () {
            return this.accuracy;
        },

        /**
         * Runs the GPS.
         *
         * @returns {*}
         */
        run: function (onUpdate, onSuccess, onError) {


            // Early return if geolocation not supported.
            if (!navigator.geolocation) {

                if (onError) {
                    onError({message: "Geolocation is not supported!"});
                }
                return;
            }

            //stop any other geolocation service started before
            m.geoloc.stop();
            m.geoloc.clear();

            this.startTime = new Date().getTime();

            // Request geolocation.
            this.id = m.geoloc.watchPosition(onUpdate, onSuccess, onError);
        },

        /**
         * Stops any currently running geolocation service.
         */
        stop: function () {
            navigator.geolocation.clearWatch(m.geoloc.id);
        },

        /**
         * Watches the GPS position.
         *
         * @param onUpdate
         * @param onSuccess
         * @param onError
         * @returns {Number} id of running GPS
         */
        watchPosition: function (onUpdate, onSuccess, onError) {
            var onGeolocSuccess = function (position) {
                //timeout
                var currentTime = new Date().getTime();
                if ((currentTime - m.geoloc.startTime) > m.geoloc.TIMEOUT) {
                    //stop everything
                    m.geoloc.stop();

                    if (onError) {
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
                var prevAccuracy = m.geoloc.getAccuracy();
                if (prevAccuracy === -1) {
                    prevAccuracy = location.acc + 1;
                }

                //only set it up if the accuracy is increased
                if (location.acc > -1 && location.acc < prevAccuracy) {
                    m.geoloc.set(location.lat, location.lon, location.acc);
                    if (location.acc < m.geoloc.CONF.GPS_ACCURACY_LIMIT) {

                        m.geoloc.stop();

                        //save in storage
                        m.settings('location', location);
                        if (onSuccess) {
                            onSuccess(location);
                        }
                    } else {

                        if (onUpdate) {
                            onUpdate(location);
                        }
                    }
                }
            };

            // Callback if geolocation fails.
            var onGeolocError = function (error) {

                if (onError) {
                    onError({'message': error.message});
                }
            };

            // Geolocation options.
            var options = {
                enableHighAccuracy: this.CONF.HIGH_ACCURACY,
                maximumAge: 0,
                timeout: this.CONF.TIMEOUT
            };

            return navigator.geolocation.watchPosition(
                onGeolocSuccess,
                onGeolocError,
                options
            );
        },

        /**
         * Validates the current GPS lock quality.
         *
         * @returns {*}
         */
        valid: function () {
            var accuracy = this.getAccuracy();
            if (accuracy === -1) {
                //No GPS lock yet
                return m.ERROR;

            } else if (accuracy > this.CONF.GPS_ACCURACY_LIMIT) {
                //Geolocated with bad accuracy
                return m.FALSE;

            } else {
                //Geolocation accuracy is good enough
                return m.TRUE;
            }
        }
    });

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
