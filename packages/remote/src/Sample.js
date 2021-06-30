import { makeRequest, getBlobFromURL } from './helpers';

function setNewRemoteID(model, responseData) {
  if (!responseData || !responseData.values) {
    console.warn("Model didn't receive an id from the server");
    return;
  }

  model.id = responseData.values.id;

  // do that for all submodels
  if (model.samples && responseData.samples) {
    model.samples.forEach((subModel, index) =>
      setNewRemoteID(subModel, responseData.samples[index])
    );
  }

  if (model.occurrences && responseData.occurrences) {
    model.occurrences.forEach((subModel, index) =>
      setNewRemoteID(subModel, responseData.occurrences[index])
    );
  }

  if (model.media && responseData.media) {
    model.media.forEach((subModel, index) =>
      setNewRemoteID(subModel, responseData.media[index])
    );
  }
}

function remoteCreateParse(model, responseData) {
  setNewRemoteID(model, responseData);
}

async function appendModelToFormData(mediaModel, media) {
  // can provide both image/jpeg and jpeg
  const { type } = mediaModel.attrs;
  let extension = type;
  let mediaType = type;
  if (type.match(/image.*/)) {
    [, extension] = type.split('/');
  } else {
    mediaType = `image/${mediaType}`;
  }

  const url = mediaModel.getURL();
  const blob = await getBlobFromURL(url, mediaType);

  const name = mediaModel.cid;
  media.push([name, blob, `${name}.${extension}`]);
}

const addModelMediaToFormData = async (model, media) => {
  if (model.media) {
    await Promise.all(model.media.map(m => appendModelToFormData(m, media)));
  }
  if (model.occurrences) {
    await Promise.all(
      model.occurrences.map(m => addModelMediaToFormData(m, media))
    );
  }
  if (model.samples) {
    await Promise.all(
      model.samples.map(m => addModelMediaToFormData(m, media))
    );
  }
};

function handleDuplicates(model, existingId) {
  const fullResponse = {
    values: {
      id: existingId || -1,
    },
  };

  if (model.occurrences) {
    fullResponse.occurrences = model.occurrences.map(m => handleDuplicates(m));
  }

  if (model.samples) {
    fullResponse.samples = model.samples.map(m => handleDuplicates(m));
  }

  if (model.media) {
    fullResponse.media = model.media.map(m => handleDuplicates(m));
  }

  return fullResponse;
}

export default function add(Sample) {
  return class Extended extends Sample {
    /**
     * Warehouse attributes and their values.
     */
    static keys = {
      date: { id: 'date' },
      sample_method_id: { id: 'sample_method_id' },
      location: { id: 'entered_sref' },
      location_type: {
        id: 'entered_sref_system',
        values: {
          british: 'OSGB', // for British National Grid
          irish: 'OSIE', // for Irish Grid
          channel: 'utm30ed50', // for Channel Islands Grid
          latlon: 4326, // for Latitude and Longitude in decimal form (WGS84 datum)
        },
      },
      form: { id: 'input_form' },
      group: { id: 'group_id' },
      comment: { id: 'comment' },
    };

    id = null;

    keys = Extended.keys;

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
      const sampleKeys =
        typeof this.keys === 'function' ? this.keys() : this.keys;
      const keys = { ...Sample.keys, ...sampleKeys }; // warehouse keys/values to transform

      const submission = {
        values: {
          external_key: this.cid,
          survey_id: this.metadata.survey_id,
          input_form: this.metadata.input_form,
        },

        media: [],
        samples: [],
        occurrences: [],
      };

      const mapValue = (attr, value) => {
        const valuesMapping = keys[attr].values;
        if (!valuesMapping) {
          return value;
        }

        if (typeof valuesMapping === 'function') {
          return valuesMapping(value, submission, this);
        }

        if (value instanceof Array) {
          return value.map(v => mapValue(attr, v));
        }

        if (valuesMapping instanceof Array) {
          const mapping = valuesMapping.find(({ value: val }) => val === value);
          if (!mapping || !mapping.id) {
            throw new Error(
              `A "${attr}" attribute "${value}" value could not be mapped to a remote database field.`
            );
          }
          return mapping.id;
        }

        return valuesMapping[value];
      };

      const getValue = attr => {
        let value = this.attrs[attr];

        const isEmpty = val => val === null || val === undefined;

        if (isEmpty(value)) {
          return;
        }

        if (!keys[attr]) {
          const isTesting = process.env.NODE_ENV === 'test';
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
          ? `smpAttr:${warehouseAttr}`
          : warehouseAttr;

        submission.values[attrKey] = value;
      };

      Object.keys(this.attrs).forEach(getValue);

      this.metadata.training &&
        (submission.values.training = this.metadata.training);
      this.metadata.release_status &&
        (submission.values.release_status = this.metadata.release_status);
      this.metadata.record_status &&
        (submission.values.record_status = this.metadata.record_status);
      this.metadata.sensitive &&
        (submission.values.sensitive = this.metadata.sensitive);
      this.metadata.confidential &&
        (submission.values.confidential = this.metadata.confidential);
      this.metadata.sensitivity_precision &&
        (submission.values.sensitivity_precision = this.metadata.sensitivity_precision);

      this.samples.forEach(model => {
        const modelSubmission = model.getSubmission(warehouseMediaNames);
        if (!modelSubmission) {
          return;
        }

        submission.samples.push(modelSubmission);
      });

      this.occurrences.forEach(model => {
        const modelSubmission = model.getSubmission(warehouseMediaNames);
        if (!modelSubmission) {
          return;
        }

        submission.occurrences.push(modelSubmission);
      });

      this.media.forEach(model => {
        const modelSubmission = model.getSubmission(warehouseMediaNames);
        if (!modelSubmission) {
          return;
        }

        submission.media.push(modelSubmission);
      });

      return submission;
    }

    async saveRemote() {
      // Ensure that we have a URL.
      const configIsMissing = !this.remote.url;
      const oldConfigIsMissing = !this.remote.host_url || !this.remote.api_key;
      if (configIsMissing && oldConfigIsMissing) {
        return Promise.reject(
          new Error('A "remote" property is not configured.')
        );
      }

      try {
        this.remote.synchronising = true;
        const warehouseMediaNames = await this._uploadMedia();
        const submission = this.getSubmission(warehouseMediaNames);
        const resp = await this._createRemote(submission);
        this.remote.synchronising = false;

        // update the model and occurrences with new remote IDs
        remoteCreateParse(this, resp);

        // update metadata
        const timeNow = new Date();
        this.metadata.server_on = timeNow;
        this.metadata.updated_on = timeNow;
        this.metadata.synced_on = timeNow;

        return this;
      } catch (err) {
        this.remote.synchronising = false;
        throw err;
      }
    }

    async _createRemote(data) {
      const { url } = this.remote;

      const headers =
        typeof this.remote.headers === 'function'
          ? await this.remote.headers()
          : this.remote.headers;

      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      };

      try {
        return await makeRequest(`${url}/samples`, options);
      } catch (e) {
        if (e.status === 409 && e.res && e.res.duplicate_of) {
          return handleDuplicates(this, e.res.duplicate_of.id);
        }

        throw e;
      }
    }

    async _uploadMedia() {
      let warehouseMediaNames = {};

      const media = []; // for submission
      await addModelMediaToFormData(this, media);

      const hasPhotos = media.length;
      if (!hasPhotos) {
        return warehouseMediaNames;
      }

      const upload = async data => {
        const { url } = this.remote;

        const headers =
          typeof this.remote.headers === 'function'
            ? await this.remote.headers()
            : this.remote.headers;

        const options = {
          method: 'POST',
          headers,
          body: data,
        };

        return makeRequest(`${url}/media-queue`, options);
      };

      const chunk = 5;
      for (let index = 0; index < media.length; index += chunk) {
        const mediaChunkToUpload = media.slice(index, index + chunk);
        const data = new FormData();
        mediaChunkToUpload.forEach(m => data.append(...m));

        const ids = await upload(data); // eslint-disable-line

        warehouseMediaNames = { ...warehouseMediaNames, ...ids };
      }

      return warehouseMediaNames;
    }
  };
}
