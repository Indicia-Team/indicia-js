import $ from 'jquery';
import { API_BASE, API_VER, API_REPORTS_PATH } from './constants';

class Report {

  constructor(options = {}) {
    this.remote_host = options.remote_host || this.remote_host;
    this.user = options.user || this.user;
    this.password = options.password || this.password;
    this.report_path = options.report_path || this.report_path;

    this.api_key = options.api_key || this.api_key;
    this.params = options.params || this.params;
    this.timeout = options.timeout || 180000; // 3 min;
  }

  run(params) {
    const that = this;
    const promise = new Promise((fulfill, reject) => {
      const url = this.remote_host + API_BASE + API_VER + API_REPORTS_PATH +
        this.report_path;

      $.get({
        url,
        params: params || that.params,
        timeout: that.timeout,
        beforeSend(xhr) {
          xhr.setRequestHeader('Authorization', `Basic ${that.getUserAuth()}`);
        },
        success: fulfill,
        error: reject,
      });
    });

    return promise;
  }

  getUserAuth() {
    const name = typeof this.name === 'function' ? this.name() : this.name;
    const password = typeof this.password === 'function' ? this.password() : this.password;
    return btoa(`${name}:${password}`);
  }

}

export default Report;
