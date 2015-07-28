//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define, */
define(['Occurrence', "Events"], function () {
//>>excludeEnd("buildExclude");

    m.OccurrenceCollection = (function () {

        var Module = function (options) {
            var occurrence = null;
            this.occurrences = [];

            if (options instanceof Array) {
                for (var i = 0; i < options.length; i++) {
                    occurrence = new this.Occurrence(options[i]);
                    this.occurrences.push(occurrence);
                }
            }
        };

        m.extend(Module.prototype, {
            Occurrence: m.Occurrence,

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
                        this.occurrences.push(items[i]);
                    }
                    modified.push(items[i]);
                }

                this.trigger('change');
                return modified;
            },

            /**
             *
             * @param occurrence occurrence or its ID
             * @returns {*}
             */
            get: function (item) {
                var id = item.id || item;
                for (var i = 0; i < this.occurrences.length; i++) {
                    if (this.occurrences[i].id == id) {
                        return this.occurrences[i];
                    }
                }
                return null;
            },

            getFirst: function () {
              return this.occurrences[0];
            },

            create: function () {
                var occurrence = new this.Occurrence();
                this.add(occurrence);
                return occurrence;
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
                    for (var j = 0; index < this.occurrences.length; j++) {
                        if (this.occurrences[j].id === current.id) {
                            index = j;
                            break;
                        }
                    }
                    if (j > -1) {
                        this.occurrences.splice(index, 1);
                        removed.push(current);
                    }
                }
                this.trigger('change');
                return removed;
            },

            has: function (item) {
                var data = this.get(item);
                return data !== undefined && data !== null;
            },

            size: function () {
                return this.occurrences.length;
            },

            toJSON: function () {
                var json = [];
                for (var i = 0; i < this.occurrences.length; i++) {
                    json.push(this.occurrences[i].toJSON());
                }

                return json;
            }
        });

        m.extend(Module.prototype, m.Events);

        return Module;
    }());
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");