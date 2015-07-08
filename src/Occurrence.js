//{
//  id: 'yyyyy-yyyyyy-yyyyyyy-yyyyy',
//    warehouseID: -1, //occurrence_id
//  status: 'local', //sent
//  attr: {
//  'occurrence:comment': 'value',
//    'occAttr:12': 'value'
//},
//  images: [
//    {
//      status: 'local', //sent
//      url: 'http://..', // points to the image on server
//      data: 'data64:...'
//    }
//  ]
//};

//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define, */
define(['helpers'], function () {
//>>excludeEnd("buildExclude");

    m.Occurrence = (function () {

        var Module = function () {
            this.id = m.getNewUUID();
        };

        m.extend(Module.prototype, {
            id: '',
            warehouseID: -1,
            status: 'local',
            attributes: {},
            images: [],

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

            has: function(key) {
                return this.get(key) !== null;
            },

            removeAllImages: function () {
                this.images = [];
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