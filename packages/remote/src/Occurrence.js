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
    getSubmission(warehouseMediaNames = {}) {
      const occKeys = typeof this.keys === 'function' ? this.keys() : this.keys;
      const keys = { ...Occurrence.keys, ...occKeys }; // warehouse keys/values to transform

      const submission = {
        values: {
          external_key: this.cid,
        },

        media: [],
      };

      if (this.metadata.training) {
        submission.training = this.metadata.training;
      }
      if (this.metadata.release_status) {
        submission.release_status = this.metadata.release_status;
      }
      if (this.metadata.record_status) {
        submission.record_status = this.metadata.record_status;
      }
      if (this.metadata.sensitive) {
        submission.sensitive = this.metadata.sensitive;
      }
      if (this.metadata.confidential) {
        submission.confidential = this.metadata.confidential;
      }
      if (this.metadata.sensitivity_precision) {
        submission.sensitivity_precision = this.metadata.sensitivity_precision;
      }

      function mapValue(attr, value) {
        const valuesMapping = keys[attr].values;
        if (!valuesMapping) {
          return value;
        }

        if (typeof valuesMapping === 'function') {
          return valuesMapping(value, submission, this);
        }

        if (valuesMapping instanceof Array) {
          return valuesMapping.find(({ value: val }) => val === value).id;
        }

        if (value instanceof Array) {
          return value.map(v => valuesMapping[v]);
        }

        return valuesMapping[value];
      }

      const getValue = attr => {
        // no need to send attributes with no values
        let value = this.attrs[attr];

        const isEmpty = val => val === null || val === undefined;

        if (isEmpty(value)) {
          return;
        }

        if (!keys[attr]) {
          const isTesting = process;

          if (attr !== 'email' && !isTesting) {
            console.warn(`Indicia: no such key: ${attr}`);
          }
          submission.values[attr] = value;
          return;
        }

        const warehouseAttr = keys[attr].id || attr;

        value = mapValue(attr, value);

        if (isEmpty(value)) {
          return;
        }

        const attrKey = !Number.isNaN(Number(warehouseAttr))
          ? `occAttr:${warehouseAttr}`
          : warehouseAttr;

        submission.values[attrKey] = value;
      };

      Object.keys(this.attrs).forEach(getValue);

      this.media.forEach(model => {
        const modelSubmission = model.getSubmission(warehouseMediaNames);
        if (!modelSubmission) {
          return;
        }

        submission.media.push(modelSubmission);
      });

      return submission;
    }
  };
}
