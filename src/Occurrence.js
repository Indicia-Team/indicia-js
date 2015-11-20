//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define, */
define(['helpers', 'Image', 'Events', 'Collection'], function () {
//>>excludeEnd('buildExclude');
    /***********************************************************************
     * OCCURRENCE
     **********************************************************************/

    m.Occurrence = (function () {

        var Module = function (options) {
            options || (options = {});

            this.id = options.id || m.getNewUUID();
            this.attributes = options.attributes || {};

            if (options.images) {
                this.images = new m.Collection({
                    Model: m.Image,
                    models: options.images
                });
            } else {
                this.images = new m.Collection({
                    Model: m.Image
                });
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

            toJSON: function () {
                var data = {
                    id: this.id,
                    attributes: this.attributes,
                    images: this.images.toJSON()
                };
                //add occurrences
                return data;
            },

            /**
             * Returns an object with attributes and their values flattened and
             * mapped for warehouse submission.
             *
             * @param flattener
             * @returns {*}
             */
            flatten: function (flattener, count) {
                //images flattened separately
                return flattener.apply(this, [Module.keys, this.attributes, count]);;
            }
        });

        //add events
        m.extend(Module.prototype, m.Events);

        /**
         * Warehouse attributes and their values.
         */
        Module.keys = {
            taxon: {
                id: ''
            },
            comment: {
                id: 'comment'
            }
        };

        return Module;
    }());
//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');