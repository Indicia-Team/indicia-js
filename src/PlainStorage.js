/** *********************************************************************
 * PLAIN STORAGE
 **********************************************************************/
class PlainStorage {
  constructor() {
    this.NAME = 'PlainStorage';

    this.storage = {};
  }

  /**
   * Gets an item from the storage.
   *
   * @param key
   */
  get(key, callback) {
    const data = this.storage[key];
    callback(null, data);
  }

  /**
   * Returns all items from the storage;
   *
   * @returns {{}|*|m.Storage.storage}
   */
  getAll(callback) {
    const data = this.storage;
    callback(null, data);
  }

  /**
   * Sets an item in the storage.
   * Note: it overrides any existing key with the same name.
   *
   * @param key
   * @param data
   * @param callback
   */
  set(key, data, callback) {
    this.storage[key] = data;
    callback && callback(null, data);
  }

  /**
   * Removes an item from the storage.
   *
   * @param key
   */
  remove(key, callback) {
    delete this.storage[key];
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
    this.storage = {};
    callback && callback(null, this.storage);
  }

  /**
   * Calculates current occupied the size of the storage.
   * @param callback
   */
  size(callback) {
    const data = Object.keys(this.storage).length;
    callback(null, data);
  }
}

export { PlainStorage as default };

