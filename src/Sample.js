//data = {
//    id: 'xxxxxxx-xxxxxx-xxxxxx-xxxx',
//    status: 'local', // sent
//    warehouseId: -1, //sample_id - 1234567 - 32bit
//    sample: {},
//    occurrences: []
//};

//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global define, m */
define(["OccurrenceCollection"], function () {
//>>excludeEnd("buildExclude");

    m.Sample = (function () {

        var Module = function (options) {
            this.id = m.getNewUUID();
            this.occurrences = new m.OccurrenceCollection();
        };

        m.extend(Module.prototype, {
            id: '',
            status: 'local',
            warehouseId: -1,
            userId: -1,
            attributes: {},
            occurrences: {},

            set: function (key, data) {
                this.attributes[key] = data;
            },

            get: function (key) {
                return this.attributes[key];
            },

            remove: function (key) {
                delete this.attributes[key];
            },

            clear: function () {
                this.attributes = {};
            },

            has: function (key) {
                return this.get(key) !== null;
            },

            toJSON: function () {
                var data = {
                    sample: this.sample
                };
                //add occurrences
                return data;
            }
        });

        return Module;
    }());
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");