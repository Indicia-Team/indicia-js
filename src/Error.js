/** *********************************************************************
 * ERROR
 * http://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax/32749533#32749533
 **********************************************************************/

class IndiciaError extends Error {
  constructor(message) {
    // array of errors
    if (message instanceof Array) {
      const concaMessage = message.reduce(
        (name, error) => `${name}${error.title}\n`,
        ''
      );
      message = concaMessage;
    }

    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export { IndiciaError as default };
