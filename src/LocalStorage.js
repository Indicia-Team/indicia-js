import Error from './Error';

class LocalStorage {
  constructor(options = {}) {
    this.TYPE = 'LocalStorage';
    this.NAME = 'morel';
    this.storage = window.localStorage;

    this.NAME = options.appname ? `${this.NAME}-${options.appname}` : this.NAME;
  }

  /**
   * Gets an item from the storage.
   *
   * @param key
   */
  get(key, callback) {
    let data = this.storage.getItem(this._getKey(key));
    data = JSON.parse(data);

    callback(null, data);
  }

  /**
   * Returns all items from the storage;
   *
   * @returns {{}|*|m.Storage.storage}
   */
  getAll(callback) {
    const data = {};
    let key = '';
    for (let i = 0, len = this.storage.length; i < len; ++i) {
      key = this.storage.key(i);
      // check if the key belongs to this storage
      if (key.indexOf(this._getPrefix()) !== -1) {
        const parsed = JSON.parse(this.storage.getItem(key));
        data[key] = parsed;
      }
    }
    callback(null, data);
  }

  /**
   * Sets an item in the storage.
   * Note: it overrides any existing key with the same name.
   *
   * @param key
   * @param data JSON object
   */
  set(key, data, callback) {
    const stringifiedData = JSON.stringify(data);
    try {
      this.storage.setItem(this._getKey(key), stringifiedData);
      callback && callback(null, stringifiedData);
    } catch (err) {
      const exceeded = this._isQuotaExceeded(err);
      const message = exceeded ? 'Storage exceed.' : err.message;

      callback && callback(new Error(message), stringifiedData);
    }
  }

  /**
   * Removes an item from the storage.
   *
   * @param key
   */
  remove(key, callback) {
    this.storage.removeItem(this._getKey(key));
    callback && callback();
  }

  /**
   * Checks if a key exists.
   *
   * @param key Input name
   * @returns {boolean}
   */
  has(key, callback) {
    this.get(key, (err, data) => {
      callback(null, data !== undefined && data !== null);
    });
  }


  /**
   * Clears the storage.
   */
  clear(callback) {
    this.storage.clear();
    callback && callback();
  }

  /**
   * Calculates current occupied the size of the storage.
   *
   * @param callback
   */
  size(callback) {
    callback(null, this.storage.length);
  }

  /**
   * Checks if there is enough space in the storage.
   *
   * @param size
   * @returns {*}
   */
  hasSpace(size, callback) {
    const taken = JSON.stringify(this.storage).length;
    const left = 1024 * 1024 * 5 - taken;
    if ((left - size) > 0) {
      callback(null, 1);
    } else {
      callback(null, 0);
    }
  }

  _getKey(key) {
    return this._getPrefix() + key;
  }

  _getPrefix() {
    return `${this.NAME}-`;
  }

  /**
   * http://crocodillon.com/blog/always-catch-localstorage-security-and-quota-exceeded-errors
   * @param e
   * @returns {boolean}
   * @private
   */
  _isQuotaExceeded(e) {
    let quotaExceeded = false;
    if (e) {
      if (e.code) {
        switch (e.code) {
          case 22:
            quotaExceeded = true;
            break;
          case 1014:
            // Firefox
            if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
              quotaExceeded = true;
            }
            break;
          default:
        }
      } else if (e.number === -2147024882) {
        // Internet Explorer 8
        quotaExceeded = true;
      }
    }
    return quotaExceeded;
  }
}

export { LocalStorage as default };
