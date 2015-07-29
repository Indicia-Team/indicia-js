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
            var name = null,
                value = null,
                key = null;

            options || (options = {});
            this.id = options.id || m.getNewUUID();
            this.attributes = {};

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
            }

            this.images = options.images || [];
        };

        Module.KEYS = {
                TAXON: {
                    id: 'taxa_taxon_list_id'
                },
                COMMENT: {
                    id: 'comment'
                }
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
                if (!key || !key.id) {
                    console.warn('morel.Occurrence: no such key: ' + name);
                    return name;
                }
                return key.id;
            },

            value: function (name, data) {
                var value = null;
                name = name.toUpperCase();
                if (typeof data !== 'object' ||
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