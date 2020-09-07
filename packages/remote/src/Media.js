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
  };
}
