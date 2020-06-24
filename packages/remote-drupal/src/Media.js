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

    getSubmission() {
      const submission = {
        id: this.id,
        name: this.cid,
      };

      return [submission];
    }
  };
}
