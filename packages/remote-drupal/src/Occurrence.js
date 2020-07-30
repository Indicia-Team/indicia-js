export default function add(Occurrence) {
  return class Extended extends Occurrence {
    /**
     * Warehouse attributes and their values.
     */
    static keys = {
      taxon: {
        id: 'taxa_taxon_list_id',
      },
      comment: { id: 'comment' },
    };

    id = null;

    keys = Extended.keys;

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

    /**
     * Returns an object with attributes and their values
     * mapped for warehouse submission.
     */
    getSubmission(options = {}) {
      const that = this;
      const occKeys = typeof this.keys === 'function' ? this.keys() : this.keys;
      const keys = { ...Occurrence.keys, ...occKeys }; // warehouse keys/values to transform
      const media = [...this.media]; // all media within this and child models

      const submission = {
        id: this.id,
        external_key: this.cid,
        fields: {},
        media: [],
      };

      if (this.metadata.training || options.training) {
        submission.training = this.metadata.training || options.training;
      }

      if (this.metadata.release_status || options.release_status) {
        submission.release_status =
          this.metadata.release_status || options.release_status;
      }

      if (this.metadata.record_status || options.record_status) {
        submission.record_status =
          this.metadata.record_status || options.record_status;
      }

      if (this.metadata.sensitive || options.sensitive) {
        submission.sensitive = this.metadata.sensitive || options.sensitive;
      }

      if (this.metadata.confidential || options.confidential) {
        submission.confidential =
          this.metadata.confidential || options.confidential;
      }

      if (
        this.metadata.sensitivity_precision ||
        options.sensitivity_precision
      ) {
        submission.sensitivity_precision =
          this.metadata.sensitivity_precision || options.sensitivity_precision;
      }

      function mapValue(attr, value) {
        const valuesMapping = keys[attr].values;
        if (!valuesMapping) {
          return value;
        }

        if (typeof valuesMapping === 'function') {
          return valuesMapping(value, submission, that);
        }

        if (valuesMapping instanceof Array) {
          return valuesMapping.find(({ value: val }) => val === value).id;
        }

        if (value instanceof Array) {
          return value.map(v => valuesMapping[v]);
        }

        return valuesMapping[value];
      }

      function getValue(attr) {
        // no need to send attributes with no values
        let value = that.attrs[attr];
        if (value === null || value === undefined) {
          return;
        }

        if (!keys[attr]) {
          const isTesting = process;

          if (attr !== 'email' && !isTesting) {
            console.warn(`Indicia: no such key: ${attr}`);
          }
          submission.fields[attr] = value;
          return;
        }

        const warehouseAttr = keys[attr].id || attr;

        value = mapValue(attr, value);

        // don't need to send null or undefined
        if (value) {
          submission.fields[warehouseAttr] = value;
        }
      }

      Object.keys(this.attrs).forEach(getValue);

      // transform sub models
      // media does not return any media-models only JSON data about them
      // media files will be attached separately
      const mediaSubmission = [];
      this.media.forEach(model => {
        const [modelSubmission] = model.getSubmission();
        mediaSubmission.push(modelSubmission);
      });
      submission.media = mediaSubmission;

      return [submission, media];
    }
  };
}
