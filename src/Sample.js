//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global define, m */
define(["OccurrenceCollection"], function () {
//>>excludeEnd("buildExclude");

    /**
     * Refers to the event in which the sightings were observed, in other
     * words it describes the place, date, people, environmental conditions etc.
     * Within a sample, you can have zero or more occurrences which refer to each
     * species sighted as part of the sample.
     */
    m.Sample = (function () {

        var Module = function (options) {
            options || (options = {});

            this.id = options.id || m.getNewUUID();

            if (options.occurrences) {
                this.occurrences = new m.OccurrenceCollection(options.occurrences);
            } else {
                this.occurrences = new m.OccurrenceCollection();
            }

            if (options.attributes) {
                this.attributes =  options.attributes;
            } else {
                this.attributes = {};

                var date = new Date();
                this.set('DATE', m.formatDate(date));
                this.set('LOCATION_TYPE', 'LATLON');
            }
        };

        Module.KEYS =  {
                ID: {
                    name: 'sample:id'
                },
                SURVEY: {
                    name: 'sample:survey_id'
                },
                DATE: {
                    name: 'sample:date'
                },
                COMMENT: {
                    name: 'sample:comment'
                },
                IMAGE: {
                    name: 'sample:image'
                },
                LOCATION: {
                    name: 'sample:entered_sref'
                },
                LOCATION_TYPE: {
                    name: 'sample:entered_sref_system',
                    values: {
                        'BRITISH': 'OSGB', //for British National Grid
                        'IRISH': 'OSIE', //for Irish Grid
                        'LATLON': 4326 //for Latitude and Longitude in decimal form (WGS84 datum)
                    }
                },
                LOCATION_NAME: {
                    name: 'sample:location_name'
                },
                DELETED: {
                    name: 'sample:deleted'
                }
        };

        m.extend(Module.prototype, {
            set: function (name, data) {
                var key = this.key(name),
                    value = this.value(name, data);
                this.attributes[key] = value;
            },

            get: function (name) {
                var key = this.key(name);
                return this.attributes[key];
            },

            remove: function (name) {
                var key = this.key(name);
                delete this.attributes[key];
            },

            clear: function () {
                this.attributes = {};
            },

            has: function (name) {
                var data = this.get(name);
                return data !== undefined && data !== null;
            },

            key: function (name) {
                name = name.toUpperCase();
                var key = Module.KEYS[name];
                if (!key || !key.name) {
                    console.warn('morel.Sample: no such key: ' + name);
                    return name;
                }
                return key.name;
            },

            value: function (name, data) {
                var value = null;
                name = name.toUpperCase();
                if (typeof data !== 'string' ||
                    !Module.KEYS[name] ||
                    !Module.KEYS[name].values) {
                    return data;
                }
                value = Module.KEYS[name].values[data];
                if (!value) {
                    console.warn('morel.Sample: no such ' + name + ' value: ' + data);
                    return data;
                }

                return value;
            },

            toJSON: function () {
                var data = {
                        id: this.id,
                        attributes: this.attributes
                    };

                data.occurrences = this.occurrences.toJSON();
                return data;
            },

            flatten: function () {
                var json = this.toJSON(),
                    flattened = {};

                m.extend(flattened, json.attributes);

                for (var i = 0; i < json.occurrences.length; i++) {
                    m.extend(flattened, json.occurrences[i].attributes);
                }
                return flattened;
            }

        });

        return Module;
    }());
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");