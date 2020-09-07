const getErrorMessageFromObject = errors =>
  Object.entries(errors).reduce(
    (string, err) => `${string}${err[0]} ${err[1]}\n`,
    ''
  );

export async function makeRequest(url, options, timeout = 80000) {
  const timeoutTrigger = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), timeout)
  );

  const res = await Promise.race([fetch(url, options), timeoutTrigger]);
  let resJSON = {};
  try {
    resJSON = await res.text(); // using text and not json because of IIS issue, see below
    resJSON = JSON.parse(resJSON);
  } catch (e) {
    if (res.status === 201 && resJSON.includes('Document Moved')) {
      // IIS issue: https://forums.iis.net/p/1209573/2082988.aspx
      resJSON = JSON.parse(resJSON.slice(resJSON.indexOf('{"values')));
    } else {
      throw e;
    }
  }

  if (!res.ok) {
    let message = res.statusText;
    if (typeof resJSON.message === 'object') {
      message = getErrorMessageFromObject(resJSON.message);
    }

    const error = new Error(message);
    error.status = res.status;
    error.res = resJSON;

    throw error;
  }

  return resJSON;
}

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
