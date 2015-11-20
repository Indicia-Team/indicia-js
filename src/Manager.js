//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define */
define(['helpers', 'Events', 'Sample', 'Auth', 'Storage'], function () {
//>>excludeEnd('buildExclude');
    /***********************************************************************
     * MANAGER
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
            this.synchronising = false;
        };

        m.extend(Module.prototype, {
            CONF: {
                url: '',
                appname: ''
            },

            //storage functions
            get: function (model, callback) {
                this.storage.get(model, callback);
            },
            getAll: function (callback) {
                this.storage.getAll(callback);
            },
            set: function (model, callback) {
                this.storage.set(model, callback);
            },
            remove: function (model, callback) {
                this.storage.remove(model, callback);
            },
            has: function (model, callback) {
                this.storage.has(model, callback);
            },
            clear: function (callback) {
                this.storage.clear(callback);
            },

            sync: function (model, callback) {
                var that = this;

                if (model instanceof m.Sample) {

                    if (!model.synchronising) {
                        model.synchronising = true;
                        that.sendStored(model, function (err) {
                            model.synchronising = false;
                            callback && callback(err);
                        });
                    }
                    return;
                }

                this.get(model, function (err, sample) {
                    if (err) {
                        callback && callback(err);
                        return;
                    }

                    if (!sample.synchronising) {
                        sample.synchronising = true;
                        that.sendStored(sample, function (err) {
                            sample.synchronising = false;
                            callback && callback(err);
                        });
                    }
                });
            },

            syncAll: function (onSample, callback) {
                var that = this;
                if (!this.synchronising) {
                    this.synchronising = true;
                    this.sendAllStored(onSample, function (err) {
                        that.synchronising = false;

                        callback && callback(err);
                    });
                } else {
                    that.trigger('sync:done');
                    callback && callback();
                }
            },


            /**
             * Sending all saved records.
             *
             * @returns {undefined}
             */
            sendAllStored: function (onSend, callback) {
                var that = this;
                this.getAll(function (err, samples) {
                    if (err) {
                        that.trigger('sync:error');
                        callback(err);
                        return;
                    }

                    that.trigger('sync:request');

                    //shallow copy
                    var remainingSamples = m.extend([], samples.models);

                    //recursively loop through samples
                    for (var i = 0; i < remainingSamples.length; i++) {
                        var sample = remainingSamples[i];
                        if (sample.getSyncStatus() === m.SYNCED) {
                            remainingSamples.splice(i, 1);
                            i--; //return the cursor
                            continue;
                        }

                        onSend(sample);

                        that.sendStored(sample, function (err, sample) {
                            if (err) {
                                that.trigger('sync:error');
                                callback(err);
                                return;
                            }

                            for (var k = 0; k < remainingSamples.length; k++) {
                                if (remainingSamples[k].id === sample.id) {
                                    remainingSamples.splice(k, 1);
                                    break;
                                }
                            }

                            if (remainingSamples.length === 0) {
                                //finished
                                that.trigger('sync:done');
                                callback();
                            }
                        });
                    }

                    if (!remainingSamples.length) {
                        that.trigger('sync:done');
                        callback();
                    }
                })
            },

            sendStored: function (sample, callback) {
                var that = this;

                //don't resend
                if (sample.getSyncStatus() === m.SYNCED) {
                    sample.trigger('sync:done');
                    callback && callback(null, sample);
                    return;
                }

                sample.trigger('sync:request');
                this.send(sample, function (err, sample) {
                    if (err) {
                        sample.trigger('sync:error');
                        callback && callback(err);
                        return;
                    }

                    //update sample
                    sample.metadata.warehouse_id = 1;
                    sample.metadata.server_on = new Date();
                    sample.metadata.synced_on = new Date();

                    //resize images to snapshots
                    that._resizeImages(sample, function () {
                        //save sample
                        that.set(sample, function (err, sample) {
                            sample.trigger('sync:done');
                            callback && callback(null, sample);
                        });
                    });
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


                //append images
                var occCount = 0;
                sample.occurrences.each(function (occurrence) {
                    var imgCount = 0;
                    occurrence.images.each(function (image) {
                        var name = 'sc:' + occCount + '::photo' + imgCount;
                        var blob = m.dataURItoBlob(image.data, image.type);
                        var extension = image.type.split('/')[1];
                        formData.append(name, blob, 'pic.' + extension);
                    });
                    occCount++;
                });

                //append attributes
                var keys = Object.keys(flattened);
                for (var i= 0; i < keys.length; i++) {
                    formData.append(keys[i], flattened[keys[i]]);
                }

                //Add authentication
                formData = this.auth.append(formData);

                this._post(formData, function (err) {
                    callback (err, sample);
                });
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
                                callback && callback();
                                break;
                            case 400:
                                error = new m.Error(ajax.response);
                                callback && callback(error);
                                break;
                            default:
                                error = new m.Error({
                                    message: 'Unknown problem while sending request.',
                                    number: ajax.status
                                });
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

            _flattener: function (keys, attributes, count) {
                var flattened = {},
                    attr = null,
                    name = null,
                    value = null,
                    prefix = '',
                    native = 'sample:',
                    custom = 'smpAttr:';

                if (this instanceof m.Occurrence) {
                    prefix = 'sc:';
                    native = '::occurrence:';
                    custom = '::occAttr:';
                }

                for (attr in attributes) {
                    if (!keys[attr]) {
                        console.warn('morel.Manager: no such key: ' + attr);
                        flattened[attr] = attributes;
                        continue;
                    }

                    name = keys[attr].id;

                    if (!name) {
                        name = prefix + count + '::present'
                    } else {
                        if (parseInt(name, 10) >= 0) {
                            name = custom + name;
                        } else {
                            name = native + name;
                        }

                        if (prefix) {
                            name = prefix + count + name;
                        }
                    }

                    value = attributes[attr];

                    if (keys[attr].values) {
                        value = keys[attr].values[value];
                    }

                    flattened[name] = value;
                }

                return flattened;
            },

            _resizeImages: function (sample, callback) {
                var images_count = 0;
                //get number of images to resize - synchronous
                sample.occurrences.each(function (occurrence) {
                    occurrence.images.each(function (image) {
                        images_count++;
                    });
                });

                if (!images_count) {
                    callback();
                    return;
                }

                //resize
                //each occurrence
                sample.occurrences.each(function (occurrence) {
                    //each image
                    occurrence.images.each(function (image) {
                        image.resize(75, 75, function () {
                            images_count--;
                            if (images_count === 0) {
                                callback();
                            }
                        });

                    }, occurrence);
                });
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());

//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');
