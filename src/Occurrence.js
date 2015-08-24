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
define(['helpers', 'Image', "Events", "Collection"], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * OCCURRENCE MODULE
     **********************************************************************/

    m.Occurrence = (function () {

        var Module = function (options) {
            options || (options = {});

            this.id = options.id || m.getNewUUID();
            this.attributes = options.attributes || {};

            if (options.images) {
                this.images = new m.Collection({
                    model: m.Image,
                    data: options.images
                });
            } else {
                this.images = new m.Collection({
                    model: m.Image
                });
            }
        };

        Module.keys = {
                taxon: {
                    id: 'taxa_taxon_list_id'
                },
                comment: {
                    id: 'comment'
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

            has: function(name) {
                var data = this.get(name);
                return data !== undefined && data !== null;
            },

            setImage: function (data, index) {
                index = index || this.images.length;
                this.images[index] = new m.Image ({data: data});
                this.trigger('change:image');
            },

            removeImage: function (index) {
                this.images = this.images.splice(index, 1);
                this.trigger('change:image');
            },

            removeAllImages: function () {
                this.images = [];
                this.trigger('change:image');
            },

            toJSON: function () {
                var data = {
                    id: this.id,
                    attributes: this.attributes,
                    images: this.images.toJSON()
                };
                //add occurrences
                return data;
            },

            flatten: function (flattener) {
                var flattened =  flattener.apply(this, [Module.keys, this.attributes]);

                m.extend(flattened, this.images.flatten(flattener));

                return flattened;
            },

            /**
             * Get Warehouse key.
             *
             * @param name
             * @returns {*}
             * @private
             */
            _key: function (name) {
                name = name.toUpperCase();
                var key = Module.keys[name];
                if (!key || !key.id) {
                    console.warn('morel.Occurrence: no such key: ' + name);
                    return name;
                }
                return key.id;
            },

            /**
             * Get Warehouse value.
             *
             * @param name
             * @param data
             * @returns {*}
             * @private
             */
            _value: function (name, data) {
                var value = null;
                name = name.toUpperCase();
                if (typeof data !== 'object' ||
                    !Module.keys[name] ||
                    !Module.keys[name].values) {
                    return data;
                }
                value = Module.keys[name].values[data];
                if (!value) {
                    console.warn('morel.Occurrence: no such ' + name + ' value: ' + data);
                    return data;
                }

                return value;
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");