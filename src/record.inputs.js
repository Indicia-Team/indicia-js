/***********************************************************************
 * RECORD.INPUTS MODULE
 *
 * Object responsible for record input management.
 **********************************************************************/

/* global morel, _log* */
morel.extend('record.inputs', function (m) {
  "use strict";

  //todo: move KEYS to CONF.
  m.KEYS = {
    SREF: 'sample:entered_sref',
    SREF_SYSTEM: 'sample:entered_sref_system',
    SREF_ACCURACY: 'smpAttr:273',
    TAXON: 'occurrence:taxa_taxon_list_id',
    DATE: 'sample:date',
    COMMENT: 'sample:comment'
  };

  /**
   * Sets an input in the current record.
   *
   * @param item Input name
   * @param data Input value
   */
  m.set = function (item, data) {
    var record = morel.record.get();
    record[item] = data;
    morel.record.set(record);
  };

  /**
   * Returns an input value from the current record.
   *
   * @param item The Input name
   * @returns {*} null if the item does not exist
   */
  m.get = function (item) {
    var record = morel.record.get();
    return record[item];
  };

  /**
   * Removes an input from the current record.
   *
   * @param item Input name
   */
  m.remove = function (item) {
    var record = morel.record.get();
    delete record[item];
    morel.record.set(record);
  };

  /**
   * Checks if the input is setup.
   *
   * @param item Input name
   * @returns {boolean}
   */
  m.is = function (item) {
    var val = this.get(item);
    if (isPlainObject(val)) {
      return !isEmptyObject(val);
    } else {
      return val;
    }
  };

  return m;
});