//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define, */
define(['Occurrence'], function () {
//>>excludeEnd("buildExclude");

    m.OccurrenceCollection = (function () {

        var Module = function () {
        };

        m.extend(Module.prototype, {
            occurrences: [],

            Occurrence: m.Occurrence,

            add: function (occurrences) {
                return this.set(occurrences);
            },

            set: function (occurrences, options) {
                //make an array if single object
                if (!(occurrences instanceof Array)) {
                    occurrences = [occurrences];
                }

                var existing;
                for (var i = 0; i < occurrences.length; i++) {
                    //update existing ones
                    if (existing = this.get(occurrences[i])) {
                        existing.set(occurrences[i].attributes);

                    //add new
                    } else {
                        this.occurrences.push(occurrences[i]);
                    }
                }
                return occurrences;
            },

            /**
             *
             * @param occurrence occurrence or its ID
             * @returns {*}
             */
            get: function (occurrence) {
                var id = occurrence.id || occurrence;
                for (var i = 0; i < this.occurrences.length; i++) {
                    if (this.occurrences[i].id == id) {
                        return this.occurrences[i];
                    }
                }
                return null;
            },

            create: function () {
                var occurrence = new this.Occurrence();
                this.add(occurrence);
                return occurrence;
            },

            remove: function (occurrences) {
                var removed = [];
                for (var i = 0; i < this.occurrences.length; i++) {
                    var occurrence = this.get(occurrences[i]);
                    if (!occurrence) continue;

                    //get index
                    var index = -1;
                    for (var j = 0; index < this.occurrences.length; j++) {
                        if (this.occurrences[j].id === occurrence.id) {
                            index = j;
                            break;
                        }
                    }
                    if (j > -1) {
                        this.occurrences.slice(index, 1);
                        removed.push(occurrence);
                    }
                }
                return removed;
            }
        });

        return Module;
    }());
//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");