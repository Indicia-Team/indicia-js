import { getBlobFromURL } from './helpers';

export default function add(Media) {
  return class Extended extends Media {
    id = null;

    keys = {};

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
  };
}
