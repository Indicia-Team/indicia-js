//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global define, m */
define(['Occurrence', "Collection", "Events"], function () {
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
                if (options.plainAttributes) {
                    this.attributes = options.attributes;

                //transform keys
                } else {
                    for (name in options.attributes) {
                        key = this.key(name);
                        value = this.value(name, options.attributes[name]);
                        this.attributes[key] = value;
                    }
                }
            } else {
                this.attributes = {};

                var date = new Date();
                this.set('DATE', m.formatDate(date));
                this.set('LOCATION_TYPE', 'LATLON');
            }
        };

        Module.KEYS =  {
                ID: { id: 'id' },
                SURVEY: { id: 'survey_id' },
                DATE: { id: 'date' },
                COMMENT: { id: 'comment' },
                IMAGE: { id: 'image' },
                LOCATION: { id: 'entered_sref' },
                LOCATION_TYPE: {
                    id: 'entered_sref_system',
                    values: {
                        'BRITISH': 'OSGB', //for British National Grid
                        'IRISH': 'OSIE', //for Irish Grid
                        'LATLON': 4326 //for Latitude and Longitude in decimal form (WGS84 datum)
                    }
                },
                LOCATION_NAME: { id: 'location_name' },
                DELETED: { id: 'deleted' }
        };

        m.extend(Module.prototype, {
            set: function (name, data) {
                var key = this.key(name),
                    value = this.value(name, data),
                    changed = false;

                if (this.attributes[key] !== value) {
                    changed = true;
                }
                this.attributes[key] = value;

                if (changed) {
                    this.trigger('change:' + name);
                }
            },

            get: function (name) {
                var key = this.key(name);
                return this.attributes[key];
            },

            remove: function (name) {
                var key = this.key(name);
                delete this.attributes[key];
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

            key: function (name) {
                name = name.toUpperCase();
                var key = Module.KEYS[name];
                if (!key || !key.id) {
                    console.warn('morel.Sample: no such key: ' + name);
                    return name;
                }
                return key.id;
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

        m.extend(Module.prototype, m.Events);

        return Module;
    }());
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");