//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define */
define([], function () {
//>>excludeEnd("buildExclude");

    m.Events = (function (){

        var Module = {
            on: function (name, callback, context) {
                var callbacks = this._init(name);
                callbacks.push({callback: callback, context: context});
            },

            trigger: function (name) {
                var callbacks = this._init(name);

                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].callback.call(callbacks[i].context || this);
                }
            },

            _init: function (name) {
                name = name.toLowerCase();
                var namespace = name.split(':');

                this._events = this._events || {};
                if (!this._events[namespace[0]]) {
                    this._events[namespace[0]] = {
                        any: []
                    }
                }

                if (namespace.length === 1) {
                    return this._events[namespace[0]].any;
                } else {
                    if (!this._events[namespace[0]][namespace[1]]) {
                        this._events[namespace[0]][namespace[1]] = [];
                    }

                    return this._events[namespace[0]][namespace[1]]
                }

            }
        };

        return Module;
    }());

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
