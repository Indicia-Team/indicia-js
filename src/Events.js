//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define */
define([], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * EVENTS MODULE
     **********************************************************************/

    m.Events = (function (){

        var Module = {
            on: function (name, callback, context) {
                var callbacks = this._callbacks(name);
                callbacks.push({callback: callback, context: context});
            },

            trigger: function (name) {
                var callbacks = this._callbacks(name, true);

                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].callback.call(callbacks[i].context || this);
                }
            },

            _callbacks: function (name, trigger) {
                name = name.toLowerCase();
                var namespace = name.split(':'),
                    events = [];

                this._events = this._events || {};
                if (!this._events[namespace[0]]) {
                    this._events[namespace[0]] = {
                        all: []
                    }
                }

                if (namespace.length === 1) {
                    return this._events[namespace[0]].all;
                } else {
                    if (!this._events[namespace[0]][namespace[1]]) {
                        this._events[namespace[0]][namespace[1]] = [];
                    }

                    events = this._events[namespace[0]][namespace[1]];
                    if (trigger) {
                        events = events.concat(this._events[namespace[0]].all);
                    }

                    return events;
                }

            }
        };

        return Module;
    }());

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
