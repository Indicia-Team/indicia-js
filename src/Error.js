/** *********************************************************************
 * ERROR
 **********************************************************************/
class Error {
  constructor(options) {
    if (typeof options === 'string') {
      this.number = -1;
      this.message = options;
      return;
    }

    this.number = options.number || -1;
    this.message = options.message || '';
  }
}

export { Error as default };
