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
define(['helpers', "Events"], function () {
//>>excludeEnd("buildExclude");

    m.Occurrence = (function () {

        var Module = function (options) {
            options || (options = {});
            this.id = options.id || m.getNewUUID();
            this.attributes = options.attributes || {};
            this.images = options.images || [];
        };

        Module.KEYS = {
                TAXON: {
                    name: 'occurrence:taxa_taxon_list_id'
                },
                COMMENT: {
                    name: 'occurrence:comment'
                }
        };

        m.extend(Module.prototype, {
            set: function (name, data) {
                var key = this.key(name),
                    value = this.value(name, data);
                this.attributes[key] = value;

                this.trigger('change');
            },

            get: function (name) {
                var key = this.key(name);
                return this.attributes[key];
            },

            remove: function (name) {
                var key = this.key(name);
                delete this.attributes[key];

                this.trigger('change');
            },

            clear: function () {
                this.attributes = {};

                this.trigger('change');
            },

            has: function(name) {
                var data = this.get(name);
                return data !== undefined && data !== null;
            },

            removeAllImages: function () {
                this.images = [];
            },

            key: function (name) {
                name = name.toUpperCase();
                var key = Module.KEYS[name];
                if (!key || !key.name) {
                    console.warn('morel.Occurrence: no such key: ' + name);
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
                    console.warn('morel.Occurrence: no such ' + name + ' value: ' + data);
                    return data;
                }

                return value;
            },

            toJSON: function () {
                var data = {
                    id: this.id,
                    attributes: this.attributes,
                    images: this.images
                };
                //add occurrences
                return data;
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");