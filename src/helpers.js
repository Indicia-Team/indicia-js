/** *********************************************************************
 * HELPER FUNCTIONS
 **********************************************************************/

/**
 * Clones an object.
 *
 * @param obj
 * @returns {*}
 */
const cloneDeep = (obj) => {
  if (null === obj || 'object' !== typeof obj) {
    return obj;
  }
  const copy = {};
  for (const attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = objClone(obj[attr]);
    }
  }
  return copy;
};


/**
 * Generate UUID.
 */
const getNewUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);

    return v.toString(16);
  });
};

/**
 * Converts DataURI object to a Blob.
 *
 * @param {type} dataURI
 * @param {type} fileType
 * @returns {undefined}
 */
const dataURItoBlob = (dataURI, fileType) => {
  const binary = atob(dataURI.split(',')[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: fileType,
  });
};

// Detecting data URLs
// https://gist.github.com/bgrins/6194623

// data URI - MDN https://developer.mozilla.org/en-US/docs/data_URIs
// The 'data' URL scheme: http://tools.ietf.org/html/rfc2397
// Valid URL Characters: http://tools.ietf.org/html/rfc2396#section2
const isDataURL = (string) => {
  if (!string) {
    return false;
  }
  const normalized = string.toString(); // numbers

  const regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
  return !!normalized.match(regex);
};

// From jQuery 1.4.4 .
const isPlainObject = (obj) => {
  function type(obj) {
    const class2type = {};
    const types = 'Boolean Number String Function Array Date RegExp Object'.split(' ');
    for (let i = 0; i < types.length; i++) {
      class2type['[object ' + types[i] + ']'] = types[i].toLowerCase();
    }
    return obj == null ?
      String(obj) :
    class2type[toString.call(obj)] || 'object';
  }

  function isWindow(obj) {
    return obj && typeof obj === 'object' && 'setInterval' in obj;
  }

  // Must be an Object.
  // Because of IE, we also have to check the presence of the constructor property.
  // Make sure that DOM nodes and window objects don't pass through, as well
  if (!obj || type(obj) !== 'object' || obj.nodeType || isWindow(obj)) {
    return false;
  }

  // Not own constructor property must be Object
  if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.

  let key;
  for (key in obj) {
  }

  return key === undefined || hasOwn.call(obj, key);
};

// checks if the object has any elements.
const isEmptyObject = (obj) => {
  for (const key in obj) {
    return false;
  }
  return true;
};

/**
 * Formats the date to Indicia Warehouse format.
 * @param date String or Date object
 * @returns String formatted date
 */
const formatDate = (dateToFormat) => {
  let date = dateToFormat;
  let now = new Date();
  let day = 0;
  let month = 0;
  const reg = /\d{2}\/\d{2}\/\d{4}$/;
  const regDash = /\d{4}-\d{1,2}-\d{1,2}$/;
  const regDashInv = /\d{1,2}-\d{1,2}-\d{4}$/;
  let dateArray = [];

  if (typeof date === 'string') {
    dateArray = date.split('-');
    // check if valid
    if (reg.test(date)) {
      return date;
      // dashed
    } else if (regDash.test(date)) {
      date = new Date(
        window.parseInt(dateArray[0]),
        window.parseInt(dateArray[1]) - 1,
        window.parseInt(dateArray[2])
      );
      // inversed dashed
    } else if (regDashInv.test(date)) {
      date = new Date(
        window.parseInt(dateArray[2]),
        window.parseInt(dateArray[1]) - 1,
        window.parseInt(dateArray[0])
      );
    }
  }

  now = date || now;
  day = (`0${now.getDate()}`).slice(-2);
  month = (`0${(now.getMonth() + 1)}`).slice(-2);

  return `${day}/${month}/${now.getFullYear()}`;
};

export default {
  cloneDeep,
  getNewUUID,
  dataURItoBlob,
  isDataURL,
  isPlainObject,
  isEmptyObject,
  formatDate,
};
