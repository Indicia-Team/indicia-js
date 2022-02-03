import { makeRequest, getBlobFromURL } from './helpers';

export default function add(Media) {
  return class Extended extends Media {
    id = null;

    keys = {};

    remote = {
      synchronising: false,
      url: null, // must be set up for remote sync
      headers: {}, // auth and other headers
      timeout: 60000, // 60s
    };

    constructor(options = {}) {
      super(options);
      this.id = options.id;
    }

    toJSON() {
      return {
        ...super.toJSON(),
        id: this.id,
      };
    }

    getSubmission(warehouseMediaNames = {}) {
      const queued = warehouseMediaNames[this.cid];
      if (!queued) {
        throw new Error('Image queued ID is missing.');
      }

      const submission = {
        values: {
          queued: queued.name,
        },
      };

      return submission;
    }

    async uploadFile() {
      if (this.id) {
        throw new Error(
          'A file of a media on the remote cannot be uploaded again.'
        );
      }

      // if !force and queued exists but less than 22 hours then return

      // else
      const formData = await this.getFormData();
      const data = new FormData();
      data.append(...formData);

      const headers =
        typeof this.remote.headers === 'function'
          ? await this.remote.headers()
          : this.remote.headers;

      const options = {
        method: 'POST',
        headers,
        body: data,
      };

      const res = await makeRequest(`${this.remote.url}/media-queue`, options);
      this.attrs.queued = (res[this.cid] || {}).name;
      this.metadata.synced_on = new Date().getTime();
    }

    async getFormData() {
      // can provide both image/jpeg and jpeg
      const { type } = this.attrs;
      let extension = type;
      let mediaType = type;
      if (type.match(/image.*/)) {
        [, extension] = type.split('/');
      } else {
        mediaType = `image/${mediaType}`;
      }

      const url = this.getURL();
      const blob = await getBlobFromURL(url, mediaType);

      const name = this.cid;
      return [name, blob, `${name}.${extension}`];
    }

    getRemoteURL() {
      if (!this.remote.url) {
        throw new Error('No remote url was set.');
      }

      if (!this.attrs.queued && !this.attrs.path) {
        throw new Error('No media queued or path attribute.');
      }

      const baseRemoteURL = this.remote.url.replace(
        '/index.php/services/rest',
        ''
      );
      if (this.attrs.queued) {
        return `${baseRemoteURL}/upload-queue/${this.attrs.queued}`;
      }

      return `${baseRemoteURL}/upload/${this.attrs.path}`;
    }
  };
}
