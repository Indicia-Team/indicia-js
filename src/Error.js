//>>excludeStart("buildExclude", pragmas.buildExclude);
/*global m, define */
define([], function () {
//>>excludeEnd("buildExclude");
    /***********************************************************************
     * ERROR MODULE
     **********************************************************************/

    m.Error = (function () {
        var Module = function (message) {
            this.message = message;
        };

        return Module;
    }());

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");