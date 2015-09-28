//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global m, define */
define([], function () {
//>>excludeEnd('buildExclude');
    /***********************************************************************
     * ERROR
     **********************************************************************/

    m.Error = (function () {
        var Module = function (options) {
            if (typeof options === 'string') {
                this.number = -1;
                this.message = options;
                return;
            }

            this.number = options.number || -1;
            this.message = options.message || '';
        };

        return Module;
    }());

//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');