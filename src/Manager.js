//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define */
define(['helpers', 'Events', 'Sample', 'Auth', 'Storage'], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * MANAGER MODULE
     **********************************************************************/

    m.Manager = (function () {
        var Module = function (options) {
            options || (options = {});

            this.CONF.url = options.url;
            this.CONF.appname = options.appname;

            this.auth = new m.Auth({
                appname: options.appname,
                appsecret: options.appsecret,
                survey_id: options.survey_id,
                website_id: options.website_id
            });

            this.storage = new m.Storage({
                appname: options.appname,
                Storage: options.Storage
            });
            this._attachListeners();
        };

        m.extend(Module.prototype, {
            CONF: {
                url: '',
                appname: ''
            },

            //storage functions
            get: function (item, callback) {
                this.storage.get(item, callback);
            },
            getAll: function (callback) {
                this.storage.getAll(callback);
            },
            set: function (item, callback) {
                this.storage.set(item, callback);
            },
            remove: function (item, callback) {
                this.storage.remove(item, callback);
            },
            has: function (item, callback) {
                this.storage.has(item, callback);
            },
            clear: function (callback) {
                this.storage.clear(callback);
            },

            sync: function (item, callback) {
                var that = this;

                if (item instanceof m.Sample) {
                    this.sendStored(item, callback);
                    return;
                }

                this.get(item, function (err, sample) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    that.sendStored(sample, callback);
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
                    if (err) {
                        callback(err);
                        return;
                    }

                    //shallow copy
                    var remainingSamples = m.extend({}, samples.data);

                    //recursively loop through samples
                    for (var i = 0; i < remainingSamples.length; i++) {
                        var sample = remainingSamples[i];
                        if (sample.warehouse_id) {
                            delete remainingSamples[i];
                            continue;
                        }
                        that.sendStored(sample, function (err, data) {
                            if (err) {
                                callback && callback(err);
                                return;
                            }

                            delete remainingSamples[i];

                            if (remainingSamples.length === 0) {
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
                var that = this;

                sample.trigger('sync:request');
                this.send(sample, function (err, data) {
                    if (err) {
                        sample.trigger('sync:error');
                        callback && callback(err);
                    } else {
                        //update sample
                        sample.warehouse_id = 'done';

                        //save sample
                        that.set(sample, function (err, data) {
                            sample.trigger('sync:done');
                            callback && callback(null, data);
                        });
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
                var flattened = sample.flatten(this._flattener),
                    formData = new FormData();


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

                ajax.open('POST', this.CONF.url);
                ajax.send(formData);
            },

            _attachListeners: function () {
                var that = this;
                this.storage.on('update', function () {
                    that.trigger('update');
                });
            },

            _flattener: function (keys, attributes, images) {
                var flattened = {},
                    attr = null,
                    name = null,
                    value = null,
                    native = 'sample:',
                    custom = 'smpAttr:';
                if (this instanceof m.Image) {
                    return {'occurrence:image': attributes};
                }

                if (this instanceof m.Occurrence) {
                    native = 'occurrence';
                    custom = 'occAttr';
                }

                for (attr in attributes) {
                    if (!keys[attr]) {
                        console.warn('morel.Occurrence: no such key: ' + attr);
                        flattened[attr] = attributes;
                        continue;
                    }

                    name = keys[attr].id;
                    name = parseInt(name, 10) >= 0 ? custom + name : native + name;

                    value = attributes[attr];

                    if (keys[attr].values) {
                        value = keys[attr].values[value];
                    }

                    flattened[name] = value;
                }



                return flattened;
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");