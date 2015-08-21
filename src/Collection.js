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
    /***********************************************************************
     * COLLECTION MODULE
     **********************************************************************/

    /*
     no option is provided for transformed keys without creating
     an Model object. Eg. this is not possible:
     new Collection([
         {
             id: 'xxxx'
             attributes: {
                taxon: 'xxxx'
             }
         }
     ])

     must be:

     new Collection([
         {
             id: 'xxxx'
             attributes: {
                Model:taxon_taxon_list_id: 'xxxx'
             }
         }
     ])

     or:

     new Collection([
         new Model({
             id: 'xxxx'
             attributes: {
                taxon: 'xxxx'
             }
         })
     ])
     */

    m.Collection = (function () {

        var Module = function (options) {
            var model = null;
            this.Model = options.model;

            this.data = [];
            this.length = 0;

            if (options.data instanceof Array) {
                for (var i = 0; i < options.data.length; i++) {
                    model = options.data[i];
                    if (model instanceof this.Model) {
                        this.data.push(model);
                    } else {
                        m.extend(model, {
                            plainAttributes: true
                        });
                        model = new this.Model(model);
                        this.data.push(model);
                    }
                    this.length++;
                }
            }

            this.initialize();
        };

        m.extend(Module.prototype, {
            initialize: function () {},

            add: function (items) {
                return this.set(items);
            },

            set: function (items) {
                var modified = [],
                    existing = null;
                //make an array if single object
                items = !(items instanceof Array) ? [items] : items;
                for (var i = 0; i < items.length; i++) {
                    //update existing ones
                    if (existing = this.get(items[i])) {
                        existing.attributes = items[i].attributes;
                        //add new
                    } else {
                        if (typeof items[i].on === 'function') {
                            items[i].on('change', this._modelEvent, this);
                        }

                        this.data.push(items[i]);
                        this.length++;
                    }
                    modified.push(items[i]);
                }

                this.trigger('update');
                return modified;
            },

            /**
             *
             * @param model model or its ID
             * @returns {*}
             */
            get: function (item) {
                var id = item.id || item;
                for (var i = 0; i < this.data.length; i++) {
                    if (this.data[i].id == id) {
                        return this.data[i];
                    }
                }
                return null;
            },

            getFirst: function () {
                return this.data[0];
            },

            each: function (method) {
                for (var i = 0; i < this.data.length; i++) {
                    method(this.data[i]);
                }
            },

            create: function () {
                var model = new this.Model();
                this.add(model);
                return model;
            },

            remove: function (items) {
                var items = !(items instanceof Array) ? [items] : items,
                    removed = [];
                for (var i = 0; i < items.length; i++) {
                    //check if exists
                    var current = this.get(items[i]);
                    if (!current) continue;

                    //get index
                    var index = -1;
                    for (var j = 0; index < this.data.length; j++) {
                        if (this.data[j].id === current.id) {
                            index = j;
                            break;
                        }
                    }
                    if (j > -1) {
                        this.data.splice(index, 1);
                        this.length--;
                        removed.push(current);
                    }
                }
                this.trigger('update');
                return removed;
            },

            has: function (item) {
                var data = this.get(item);
                return data !== undefined && data !== null;
            },

            size: function () {
                return this.data.length;
            },

            clear: function () {
                this.data = [];
                this.length = 0;
                this.trigger('update');
            },

            toJSON: function () {
                var json = [];
                for (var i = 0; i < this.data.length; i++) {
                    json.push(this.data[i].toJSON());
                }

                return json;
            },

            flatten: function (flattener) {
                var flattened = {};

                for (var i = 0; i < this.length; i++) {
                    m.extend(flattened, this.data[i].flatten(flattener))
                }
                return flattened;
            },

            _modelEvent: function () {
                this.trigger('change');
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");