/** *********************************************************************
 * ERROR
 **********************************************************************/
class Error {
  constructor(options = {}) {
    if (typeof options === 'string') {
      this.code = -1;
      this.message = options;
      return;
    }

    this.code = options.code || -1;
    this.message = options.message || '';
  }
}

export { Error as default };
