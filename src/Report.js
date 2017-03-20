import $ from 'jquery';
import { API_BASE, API_VER, API_REPORTS_PATH } from './constants';

class Report {

  constructor(options = {}) {
    this.host_url = options.host_url || this.host_url;
    this.user = options.user || this.user;
    this.password = options.password || this.password;
    this.report = options.report || this.report;

    this.api_key = options.api_key || this.api_key;
    this.params = options.params || this.params;
    this.timeout = options.timeout || 180000; // 3 min;
  }

  run(params) {
    const that = this;
    const promise = new Promise((fulfill, reject) => {
      const url = this.host_url + API_BASE + API_VER + API_REPORTS_PATH +
        this.report;

      params = $.extend(params || that.params, { api_key: that.api_key });
      $.get({
        url,
        data: params,
        timeout: that.timeout,
        headers: {
          authorization: that.getUserAuth(),
          'x-api-key': that.api_key,
        },
        success: fulfill,
        error: (jqXHR, textStatus, errorThrown) => {
          let error = new Error(errorThrown);
          if (jqXHR.responseJSON && jqXHR.responseJSON.errors) {
            const message = jqXHR.responseJSON.errors.reduce(
              (name, err) => `${name}${err.title}\n`,
              ''
            );
            error = new Error(message);
          }
          reject(error);
        },
      });
    });

    return promise;
  }

  getUserAuth() {
    if (!this.user || !this.password) {
      return null;
    }

    const user = typeof this.user === 'function' ? this.user() : this.user;
    const password = typeof this.password === 'function' ? this.password() : this.password;
    const basicAuth = btoa(`${user}:${password}`);

    return `Basic  ${basicAuth}`;
  }

}

export default Report;
