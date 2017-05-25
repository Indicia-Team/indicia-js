/** *********************************************************************
 * HELPER FUNCTIONS
 **********************************************************************/

/**
 * Generate UUID.
 */
const getNewUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
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
const dataURItoBlob = (dataURI: string, fileType: string) => {
  const binary = atob(dataURI.split(',')[1]);
  const array: number[] = [];
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
const isDataURL = (string: string) => {
  if (!string) {
    return false;
  }
  const normalized = string.toString(); // numbers
  // tslint:disable-next-line
  const regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
  return !!normalized.match(regex);
};

/**
 * Formats the date to Indicia Warehouse format.
 * @param date String or Date object
 * @returns String formatted date
 */
const formatDate = (dateToFormat: Date|string) => {
  let date = dateToFormat;
  let now = new Date();
  let day = '0';
  let month = '0';
  const reg = /\d{2}\/\d{2}\/\d{4}$/;
  const regDash = /\d{4}-\d{1,2}-\d{1,2}$/;
  const regDashInv = /\d{1,2}-\d{1,2}-\d{4}$/;
  let dateArray: string[] = [];

  if (typeof date === 'string') {
    dateArray = date.split('-');
    // check if valid
    if (reg.test(date)) {
      return date;
      // dashed
    } else if (regDash.test(date)) {
      date = new Date(
        parseInt(dateArray[0], 10),
        parseInt(dateArray[1], 10) - 1,
        parseInt(dateArray[2], 10),
      );
      // inversed dashed
    } else if (regDashInv.test(date)) {
      date = new Date(
        parseInt(dateArray[2], 10),
        parseInt(dateArray[1], 10) - 1,
        parseInt(dateArray[0], 10),
      );
    } else {
      throw new Error('Unknown date format');
    }
  }

  now = date || now;
  day = (`0${now.getDate()}`).slice(-2);
  month = (`0${(now.getMonth() + 1)}`).slice(-2);

  return `${day}/${month}/${now.getFullYear()}`;
};

export default {
  getNewUUID,
  dataURItoBlob,
  isDataURL,
  formatDate,
};
