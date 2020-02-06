/** *********************************************************************
 * HELPER FUNCTIONS
 ********************************************************************* */

export async function makeRequest(url, options, timeout = 80000) {
  const timeoutTrigger = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), timeout)
  );

  const res = await Promise.race([fetch(url, options), timeoutTrigger]);
  const resJSON = (await res.json()) || {};
  if (!res.ok) {
    const error = new Error(res.statusText);
    error.status = res.status;

    if (!resJSON.errors) {
      error.errors = resJSON.errors;
    }
    throw error;
  }

  return resJSON;
}

/**
 * Generate UUID.
 */
/* eslint-disable no-bitwise */
export function getNewUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}
/* eslint-enable no-bitwise */

/**
 * Converts DataURI object to a Blob.
 *
 * @param {type} dataURI
 * @param {type} fileType
 * @returns {undefined}
 */
export function dataURItoBlob(dataURI, fileType) {
  const binary = atob(dataURI.split(',')[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: fileType,
  });
}

// Detecting data URLs
// https://gist.github.com/bgrins/6194623

// data URI - MDN https://developer.mozilla.org/en-US/docs/data_URIs
// The 'data' URL scheme: http://tools.ietf.org/html/rfc2397
// Valid URL Characters: http://tools.ietf.org/html/rfc2396#section2
export function isDataURL(string) {
  if (!string) {
    return false;
  }
  const normalized = string.toString(); // numbers

  /* eslint-disable no-useless-escape, max-len */
  const regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
  return !!normalized.match(regex);
}
/* eslint-enable no-useless-escape, max-len  */

// From jQuery 1.4.4 .
/* eslint-disable */
export function isPlainObject(obj) {
  function type(obj) {
    const class2type = {};
    const types = 'Boolean Number String Function Array Date RegExp Object'.split(
      ' '
    );
    for (let i = 0; i < types.length; i++) {
      class2type[`[object ${types[i]}]`] = types[i].toLowerCase();
    }
    return obj == null
      ? String(obj)
      : class2type[toString.call(obj)] || 'object';
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
  if (
    obj.constructor &&
    !hasOwn.call(obj, 'constructor') &&
    !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')
  ) {
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.

  let key;
  for (key in obj) {
  }

  return key === undefined || hasOwn.call(obj, key);
}

// checks if the object has any elements.
export function isEmptyObject(obj) {
  for (const key in obj) {
    return false;
  }
  return true;
}
/* eslint-enable */

/**
 * Formats the date to Indicia Warehouse format.
 * @param date String or Date object
 * @returns String formatted date
 */
export function formatDate(dateToFormat) {
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
    }
    if (regDash.test(date)) {
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
  day = `0${now.getDate()}`.slice(-2);
  month = `0${now.getMonth() + 1}`.slice(-2);

  return `${day}/${month}/${now.getFullYear()}`;
}

export function getBlobFromURL(url, mediaType) {
  if (isDataURL(url)) {
    const blob = dataURItoBlob(url, mediaType);
    return Promise.resolve(blob);
  }

  return new Promise(resolve => {
    // load image
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      const blob = xhr.response;
      resolve(blob);
    };
    // todo check error case

    xhr.send();
  });
}
