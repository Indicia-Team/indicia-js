//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");

    /*
     * Things to work on:
     *  - Decouple the modules as much as possible
     *  - Close as many global variables
     */
    "use strict";

    m.VERSION = '0'; //library version, generated/replaced by grunt

    //library wide configuration
    m.CONF = {};

    //CONSTANTS:
    m.TRUE = 1;
    m.FALSE = 0;
    m.ERROR = -1;

    m.SETTINGS_KEY = 'morel-settings';

    /**
     * Initialises the application settings.
     */
    m.initSettings = function () {
        m.storage.set(m.SETTINGS_KEY, {});
    };

    /**
     * Resets the morel to the initial state.
     *
     * Clears localStorage.
     * Clears sessionStorage.
     * Clears databases.
     */
    m.reset = function () {
        m.storage.clear();
        m.storage.tmpClear();

        m.db.clear();
    };

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
