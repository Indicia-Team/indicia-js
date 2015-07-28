//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define */
define(['Sample', 'Auth', 'Storage', 'LocalStorage', 'DatabaseStorage'], function () {
//>>excludeEnd("buildExclude");

    m.Manager = (function () {
        var Module = function (options) {
            options || (options = {});

            this.conf.url = options.url;
            this.conf.appname = options.appname;

            this.auth = new m.Auth({
                appname: options.appname,
                appsecret: options.appsecret,
                survey_id: options.survey_id,
                website_id: options.website_id
            });

            this.Storage = options.Storage || m.LocalStorage;
            this.Sample = options.Sample || m.Sample;

            this.storage = new this.Storage({
                appname: options.appname
            });
        };

        m.extend(Module.prototype, {
            conf: {
                url: '',
                appname: ''
            },

            get: function (item, callback) {
                var that = this,
                    key = typeof item === 'object' ? item.id : item;
                this.storage.get(key, function (err, data) {
                    var sample = data ? new that.Sample(data) : null;
                    callback(err, sample);
                });
            },

            getAll: function (callback) {
                var that = this;
                this.storage.getAll(function (err, data){
                    var samples = {},
                        sample = null,
                        keys = Object.keys(data);

                    for (var i = 0; i < keys.length; i++) {
                        sample = new that.Sample(m.extend(data[keys[i]], {
                           plainAttributes: true
                        }));
                        samples[sample.id] = sample;
                    }
                    callback(err, samples);
                });
            },

            set: function (item, callback) {
                var key = item.id;
                this.storage.set(key, item, callback);
            },

            remove: function (item, callback) {
                var key = typeof item === 'object' ? item.id : item;
                this.storage.remove(key, callback);
            },

            has: function (item, callback) {
                var key = typeof item === 'object' ? item.id : item;
                this.storage.has(key, callback);
            },

            clear: function (callback) {
              this.storage.clear(callback);
            },

            sync: function (item, callback) {
                var that = this;
                //synchronise with the server
                this.get(item, function (err, data) {
                    if (data) {
                        that.sendStored(data, callback);
                    } else {
                        callback(err);
                    }
                });
            },

            syncAll: function (callbackOnPartial, callback) {
                this.sendAllStored(callbackOnPartial, callback);
            },


            /**
             * Sending all saved records.
             *
             * @returns {undefined}
             */
            sendAllStored: function (callbackOnPartial, callback) {
                var that = this;
                this.getAll(function (err, samples) {
                    var sample = {},
                        samplesIDs = [];

                    if (err) {
                        callback(err);
                        return;
                    }

                    //recursively loop through samples
                    samplesIDs = Object.keys(samples);
                    for (var i = 0; i < samplesIDs.length; i++) {
                        sample = samples[samplesIDs[i]];
                        that.sendStored(sample, function (err, data) {
                            if (err) {
                                callback && callback(err);
                                return;
                            }

                            delete samples[samplesIDs[i]];

                            if (Object.keys(samples).length === 0) {
                                //finished
                                callback && callback(null);
                            } else {
                                callbackOnPartial && callbackOnPartial(null);
                            }
                        });
                    }
                })
            },

            sendStored: function (sample, callback) {
                var that = this,
                    onSuccess = function (data) {
                        //update sample
                        sample.warehouse_id = 'done';

                        //save sample
                        that.set(sample, function (err, data) {
                            callback && callback(null, data);
                        });
                    },

                    onError = function (err) {
                        callback && callback(err);
                    };

                this.send(sample, function (err, data) {
                    if (err) {
                        onError(err);
                    } else {
                        onSuccess(data);
                    }
                });
            },

            /**
             * Sends the saved record
             *
             * @param recordKey
             * @param callback
             * @param onError
             * @param onSend
             */
            send: function (sample, callback) {
                var flattened = sample.flatten(),
                    formData = new FormData();

                //images

                var keys = Object.keys(flattened);
                for (var i= 0; i < keys.length; i++) {
                    formData.append(keys[i], flattened[keys[i]]);
                }

                //Add authentication
                formData = this.auth.append(formData);

                this._post(formData, callback);
            },

            /**
             * Submits the record.
             */
            _post: function (formData, callback) {
                var ajax = new XMLHttpRequest();

                ajax.onreadystatechange = function () {
                    var error = null;
                    if (ajax.readyState === XMLHttpRequest.DONE) {
                        switch (ajax.status) {
                            case 200:
                                callback(null, ajax.response);
                                break;
                            case 400:
                                 error = new m.Error(ajax.response);
                                callback(error);
                                break;
                            default:
                                error = new m.Error('Unknown problem while sending request.');
                                callback && callback(error);
                        }
                    }
                };

                ajax.open('POST', this.conf.url, true);
                ajax.setRequestHeader("Content-type", "multipart/form-data");
                ajax.send(formData);
            }
        });

        return Module;
    }());

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");