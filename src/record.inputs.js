//>>excludeStart("buildExclude", pragmas.buildExclude);
define([], function () {
//>>excludeEnd("buildExclude");
/***********************************************************************
 * RECORD.INPUTS MODULE
 *
 * Object responsible for record input management.
 **********************************************************************/

  /* global morel, _log* */
  m.extend('record.inputs', {
    //todo: move KEYS to CONF.
    KEYS: {
      SREF: 'sample:entered_sref',
      SREF_SYSTEM: 'sample:entered_sref_system',
      SREF_ACCURACY: 'smpAttr:273',
      TAXON: 'occurrence:taxa_taxon_list_id',
      DATE: 'sample:date',
      COMMENT: 'sample:comment'
    },

    /**
     * Sets an input in the current record.
     *
     * @param item Input name
     * @param data Input value
     */
    set: function (item, data) {
      var record = m.record.get();
      record[item] = data;
      m.record.set(record);
    },

    /**
     * Returns an input value from the current record.
     *
     * @param item The Input name
     * @returns {*} null if the item does not exist
     */
    get: function (item) {
      var record = m.record.get();
      return record[item];
    },

    /**
     * Removes an input from the current record.
     *
     * @param item Input name
     */
    remove: function (item) {
      var record = m.record.get();
      delete record[item];
      m.record.set(record);
    },

    /**
     * Checks if the input is setup.
     *
     * @param item Input name
     * @returns {boolean}
     */
    is: function (item) {
      var val = this.get(item);
      if (m.isPlainObject(val)) {
        return !m.isEmptyObject(val);
      } else {
        return val;
      }
    }

  });

//>>excludeStart("buildExclude", pragmas.buildExclude);
});
//>>excludeEnd("buildExclude");
