//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global define, m */
define(['helpers', 'Occurrence', 'Collection', 'Events'], function () {
//>>excludeEnd('buildExclude');
    /***********************************************************************
     * SAMPLE
     *
     * Refers to the event in which the sightings were observed, in other
     * words it describes the place, date, people, environmental conditions etc.
     * Within a sample, you can have zero or more occurrences which refer to each
     * species sighted as part of the sample.
     **********************************************************************/

    m.Sample = (function () {

        var Module = function (options) {
            options || (options = {});

            this.id = options.id || m.getNewUUID();

            if (options.metadata) {
                this.metadata = options.metadata;
            } else {
                this.metadata = {
                    created_on: new Date(),
                    updated_on: new Date(),

                    warehouse_id: null,

                    synced_on: null, //set when fully initialized only
                    server_on: null //updated on server
                };
            }

            if (options.attributes) {
                this.attributes = options.attributes;
            } else {
                this.attributes = {
                    date: m.formatDate(new Date()),
                    location_type: 'latlon'
                };
            }

            if (options.occurrences) {
                this.occurrences = new m.Collection({
                    Model: m.Occurrence,
                    data: options.occurrences
                });
            } else {
                this.occurrences = new m.Collection({
                    model: m.Occurrence
                });
            }

        };

        m.extend(Module.prototype, {
            set: function (name, data) {
                var changed = false;

                if (this.attributes[name] !== data) {
                    changed = true;
                }
                this.attributes[name] = data;

                if (changed) {
                    this.trigger('change:' + name);
                }
            },

            get: function (name) {
                return this.attributes[name];
            },

            remove: function (name) {
                delete this.attributes[name];
                this.trigger('change:' + name);
            },

            clear: function () {
                this.attributes = {};
                this.trigger('change');
            },

            has: function (name) {
                var data = this.get(name);
                return data !== undefined && data !== null;
            },

            toJSON: function () {
                var data = {
                        id: this.id,
                        metadata: this.metadata,
                        attributes: this.attributes,
                        occurrences: this.occurrences.toJSON()
                    };

                return data;
            },

            /**
             * Returns an object with attributes and their values flattened and
             * mapped for warehouse submission.
             *
             * @param flattener
             * @returns {*}
             */
            flatten: function (flattener) {
                var flattened = flattener.apply(this, [Module.keys, this.attributes]);

                //occurrences
                m.extend(flattened, this.occurrences.flatten(flattener));
                return flattened;
            },

            /**
             * Detach all the listeners.
             */
            offAll: function () {
                this._events = {};
                this.occurrences.offAll();
                for (var i = 0; i < this.occurrences.data.length; i++) {
                    this.occurrences.data[i].offAll();
                }
            },


            /**
             * Sync statuses:
             * synced, local, server, changed_locally, changed_server, conflict
             */
            getSyncStatus: function () {
                var meta = this.metadata;
                //on server
                if (meta.warehouse_id) {
                    //fully initialized
                    if (meta.synced_on) {
                        //changed_locally
                        if (meta.synced_on < meta.updated_on) {
                            //changed_server - conflict!
                            if (meta.synced_on < meta.server_on) {
                                return m.CONFLICT;
                            }
                            return m.CHANGED_LOCALLY;
                            //changed_server
                        } else if (meta.synced_on < meta.server_on) {
                            return m.CHANGED_SERVER;
                        } else {
                            return m.SYNCED;
                        }
                        //partially initialized - we know the record exists on
                        //server but has not yet been downloaded
                    } else {
                        return m.SERVER;
                    }
                    //local only
                } else {
                    return m.LOCAL;
                }
            }
        });

        //add events
        m.extend(Module.prototype, m.Events);

        /**
         * Warehouse attributes and their values.
         */
        Module.keys =  {
            id: { id: 'id' },
            survey: { id: 'survey_id' },
            date: { id: 'date' },
            comment: { id: 'comment' },
            image: { id: 'image' },
            location: { id: 'entered_sref' },
            location_type: {
                id: 'entered_sref_system',
                values: {
                    british: 'OSGB', //for British National Grid
                    irish: 'OSIE', //for Irish Grid
                    latlon: 4326 //for Latitude and Longitude in decimal form (WGS84 datum)
                }
            },
            location_name: { id: 'location_name' },
            group: { id: 'group_id' },
            deleted: { id: 'deleted' }
        };

        return Module;
    }());
//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');