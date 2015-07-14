//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define */
define([], function () {
//>>excludeEnd("buildExclude");

    m.Events = (function (){

        var Module = {
            on: function (name, callback) {
                this._init(name);
                this._events[name].push(callback);
            },

            trigger: function (name) {
                this._init(name);
                var callbacks = this._events[name];

                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].call();
                }
            },

            _init: function (name) {
                this._events = this._events || {};
                this._events[name] || (this._events[name] = []);
            }

        };

        return Module;
    }());

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
