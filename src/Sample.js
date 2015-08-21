//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global define, m */
define(['helpers', 'Occurrence', "Collection", "Events"], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * SAMPLE MODULE
     **********************************************************************/

    /**
     * Refers to the event in which the sightings were observed, in other
     * words it describes the place, date, people, environmental conditions etc.
     * Within a sample, you can have zero or more occurrences which refer to each
     * species sighted as part of the sample.
     */
    m.Sample = (function () {

        var Module = function (options) {
            var name = null,
                value = null,
                key = null;

            options || (options = {});

            this.id = options.id || m.getNewUUID();
            this.attributes = {};

            if (options.occurrences) {
                this.occurrences = new m.Collection({
                    model: m.Occurrence,
                    data: options.occurrences
                });
            } else {
                this.occurrences = new m.Collection({
                    model: m.Occurrence
                });
            }

            if (options.attributes) {
                this.attributes = options.attributes;
            } else {
                this.attributes = {};

                var date = new Date();
                this.set('date', m.formatDate(date));
                this.set('location_type', 'latlon');
            }
        };

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
                deleted: { id: 'deleted' }
        };

        m.extend(Module.prototype, m.Events);

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
                        attributes: this.attributes,
                        occurrences: this.occurrences.toJSON()
                    };

                return data;
            },

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
            }

        });

        return Module;
    }());
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");