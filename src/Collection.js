//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define, */
define(['helpers', 'Events', 'Occurrence'], function () {
//>>excludeEnd('buildExclude');
    /***********************************************************************
     * COLLECTION MODULE
     **********************************************************************/

    m.Collection = (function () {

        var Module = function (options) {
            var model = null;
            this.Model = options.Model || m.Occurrence;

            this.models = [];
            this.length = 0;

            if (options.models instanceof Array) {
                for (var i = 0; i < options.models.length; i++) {
                    model = options.models[i];
                    if (model instanceof this.Model) {
                        this.models.push(model);
                    } else {
                        model = new this.Model(model);
                        this.models.push(model);
                    }
                    this.length++;
                }
            }

            this.on('add', this._updateEvent, this);
            this.on('remove', this._updateEvent, this);
        };

        m.extend(Module.prototype, {
            add: function (models, options) {
                return this.set(models, options);
            },

            set: function (models, options) {
                var modified = [],
                    existing = null,
                    toAdd = [];

                options || (options = {});

                //make an array if single object
                models = !(models instanceof Array) ? [models] : models;

                var model;
                for (var i = 0; i < models.length; i++) {
                    model = models[i];
                    //update existing ones
                    if (existing = this.get(model)) {
                        existing.attributes = model.attributes;
                        //add new
                    } else {
                        if (typeof model.on === 'function') {
                            model.on('change', this._modelEvent, this);
                        }

                        this.models.push(model);
                        this.length++;
                        toAdd.push(model);
                    }
                    modified.push(models[i]);
                }

                //fire events
                for (i = 0; i < toAdd.length; i++) {
                    model = toAdd[i];
                    model.trigger('add', model, this, options);
                }

                if (toAdd.length) this.trigger('update', this, options);

                return modified;
            },

            get: function (model) {
                var id = model.id || model;
                for (var i = 0; i < this.models.length; i++) {
                    if (this.models[i].id == id) {
                        return this.models[i];
                    }
                }
                return null;
            },

            getFirst: function () {
                return this.models[0];
            },

            each: function (method, context) {
                for (var i = 0; i < this.models.length; i++) {
                    method.apply(context || this, [this.models[i]]);
                }
            },

            create: function () {
                var model = new this.Model();
                this.add(model);
                return model;
            },

            remove: function (models) {
                var models = !(models instanceof Array) ? [models] : models,
                    removed = [];
                for (var i = 0; i < models.length; i++) {
                    //check if exists
                    var current = this.get(models[i]);
                    if (!current) continue;

                    //get index
                    var index = -1;
                    for (var j = 0; index < this.models.length; j++) {
                        if (this.models[j].id === current.id) {
                            index = j;
                            break;
                        }
                    }
                    if (j > -1) {
                        this.models.splice(index, 1);
                        this.length--;
                        removed.push(current);
                    }
                }
                removed.length && this.trigger('remove');
                return removed;
            },

            has: function (model) {
                var model = this.get(model);
                return model !== undefined && model !== null;
            },

            size: function () {
                return this.models.length;
            },

            clear: function () {
                this.models = [];
                this.length = 0;
                this.trigger('clear');
            },

            sort: function (comparator) {
              this.models.sort(comparator);
            },

            toJSON: function () {
                var json = [];
                for (var i = 0; i < this.models.length; i++) {
                    json.push(this.models[i].toJSON());
                }

                return json;
            },

            flatten: function (flattener) {
                var flattened = {};

                for (var i = 0; i < this.length; i++) {
                    m.extend(flattened, this.models[i].flatten(flattener, i))
                }
                return flattened;
            },

            _modelEvent: function () {
                this.trigger('change');
            },

            _updateEvent: function () {
                this.trigger('update');
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());
//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');