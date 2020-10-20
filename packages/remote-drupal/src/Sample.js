import { makeRequest, getBlobFromURL } from './helpers';

function handleDuplicates(errors) {
  // duplicate occurred - this fixes only occurrence duplicates!
  // todo: remove once this is sorted
  const res = {
    data: {
      id: null,
      external_key: null,
      occurrences: [],
    },
  };

  errors.forEach(error => {
    res.data.id = error.sample_id;
    res.data.external_key = error.sample_external_key;
    res.data.occurrences.push({
      id: error.id,
      external_key: error.external_key,
    });
  });

  return res;
}

async function appendModelToFormData(mediaModel, formData) {
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
  formData.append(name, blob, `${name}.${extension}`);
}

function setNewRemoteID(model, remoteIDs) {
  // set new remote ID
  const remoteID = remoteIDs[model.cid];
  if (remoteID) {
    model.id = remoteID;
  }

  // do that for all submodels
  if (model.samples) {
    model.samples.forEach(subModel => setNewRemoteID(subModel, remoteIDs));
  }
  if (model.occurrences) {
    model.occurrences.forEach(subModel => setNewRemoteID(subModel, remoteIDs));
  }
  if (model.media) {
    model.media.forEach(subModel => setNewRemoteID(subModel, remoteIDs));
  }
}

/**
 * Creates a stringified JSON representation of the model or a FormData object.
 * If the media is present then it creates a FormData so that the record
 * could be submitted in one call.
 */
async function normaliseModelData(data, media) {
  const dataStr = JSON.stringify({ data });

  if (!media.length) {
    return dataStr;
  }

  const formData = new FormData(); // for submission
  formData.append('submission', dataStr);

  const mediaProcesses = media.map(m => appendModelToFormData(m, formData));
  await Promise.all(mediaProcesses);

  return formData;
}

function remoteCreateParse(model, responseData) {
  // get new ids
  const remoteIDs = {};

  // recursively extracts ids from collection of response models
  function getIDs(data) {
    remoteIDs[data.external_key] = data.id;
    if (data.samples) {
      data.samples.forEach(subModel => getIDs(subModel));
    }
    if (data.occurrences) {
      data.occurrences.forEach(subModel => getIDs(subModel));
    }
    // Images don't store external_keys yet.
    // if (data.media) data.media.forEach(subModel => getIDs(subModel));
  }

  getIDs(responseData);

  setNewRemoteID(model, remoteIDs);
}

function getUserAuth(remote) {
  const isTesting = !!process;
  !isTesting &&
    console.warn(
      'Using Basic auth is deprecated, please use remote.headers function to pass OAuth2 access_token in the auth header.'
    );

  if (!remote.user || !remote.password) {
    return null;
  }

  const user = typeof remote.user === 'function' ? remote.user() : remote.user;
  const password =
    typeof remote.password === 'function' ? remote.password() : remote.password;
  const basicAuth = btoa(`${user}:${password}`);

  return `Basic  ${basicAuth}`;
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

      host_url: null, // deprecated
      api_key: null, // deprecated
      user: null, // deprecated
      password: null, // deprecated
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

    getSubmission(options = {}) {
      const that = this;
      const sampleKeys =
        typeof this.keys === 'function' ? this.keys() : this.keys;
      const keys = { ...Sample.keys, ...sampleKeys }; // warehouse keys/values to transform
      let media = [...this.media]; // all media within this and child models

      const submission = {
        id: this.id,
        external_key: this.cid,
        survey_id: this.metadata.survey_id,
        input_form: this.metadata.input_form,
        fields: {},
        media: [],
      };

      const mapValue = (attr, value) => {
        const valuesMapping = keys[attr].values;
        if (!valuesMapping) {
          return value;
        }

        if (typeof valuesMapping === 'function') {
          return valuesMapping(value, submission, that);
        }

        if (value instanceof Array) {
          return value.map(v => mapValue(attr, v));
        }

        if (valuesMapping instanceof Array) {
          return valuesMapping.find(({ value: val }) => val === value).id;
        }

        return valuesMapping[value];
      };

      const getValue = attr => {
        let value = that.attrs[attr];

        const isEmpty = val => val === null || val === undefined;

        if (isEmpty(value)) {
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

        if (isEmpty(value)) {
          return;
        }

        submission.fields[warehouseAttr] = value;
      };

      Object.keys(this.attrs).forEach(getValue);

      const sampleOptions = { ...options };
      this.metadata.training &&
        (sampleOptions.training = this.metadata.training);
      this.metadata.release_status &&
        (sampleOptions.release_status = this.metadata.release_status);
      this.metadata.record_status &&
        (sampleOptions.record_status = this.metadata.record_status);
      this.metadata.sensitive &&
        (sampleOptions.sensitive = this.metadata.sensitive);
      this.metadata.confidential &&
        (sampleOptions.confidential = this.metadata.confidential);
      this.metadata.sensitivity_precision &&
        (sampleOptions.sensitivity_precision = this.metadata.sensitivity_precision);

      // transform sub models
      // occurrences

      const occurrences = [];
      let occurrencesMedia = [];
      this.occurrences.forEach(model => {
        const [modelSubmission, modelMedia] = model.getSubmission(
          sampleOptions
        );
        if (!modelSubmission) {
          return;
        }

        occurrences.push(modelSubmission);
        occurrencesMedia = occurrencesMedia.concat(modelMedia);
      });

      submission.occurrences = occurrences;
      media = media.concat(occurrencesMedia);

      // samples
      const samples = [];
      let samplesMedia = [];
      this.samples.forEach(model => {
        const [modelSubmission, modelMedia] = model.getSubmission(
          sampleOptions
        );
        if (!modelSubmission) {
          return;
        }

        samples.push(modelSubmission);
        samplesMedia = samplesMedia.concat(modelMedia);
      });

      submission.samples = samples;
      media = media.concat(samplesMedia);

      // media - does not return any media-models only JSON data about them
      const mediaSubmission = [];
      this.media.forEach(model => {
        const [modelSubmission] = model.getSubmission();
        mediaSubmission.push(modelSubmission);
      });

      submission.media = mediaSubmission;

      return [submission, media];
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

        // get submission model and all the media
        const [submission, media] = this.getSubmission();
        submission.type = 'samples';

        const data = await normaliseModelData(submission, media);
        const resp = await this._createRemote(data);
        this.remote.synchronising = false;

        // update the model and occurrences with new remote IDs
        remoteCreateParse(this, resp.data);

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
      let { url } = this.remote;

      if (this.remote.host_url) {
        // backwards compatible
        url = `${this.remote.host_url}api/v1/samples`;
      }

      let headers =
        typeof this.remote.headers === 'function'
          ? await this.remote.headers()
          : this.remote.headers;

      if (!this.remote.headers) {
        // backwards compatible
        headers = {
          authorization: getUserAuth(this.remote),
          'x-api-key': this.remote.api_key,
        };
      }

      const options = {
        method: 'POST',
        headers,
        body: data,
      };

      try {
        return await makeRequest(url, options);
      } catch (e) {
        const { status, errors = [] } = e;
        if (status === 409) {
          return handleDuplicates(errors);
        }

        if (errors) {
          const message = errors.reduce(
            (name, err) => `${name}${err.title}\n`,
            ''
          );
          throw new Error(message);
        }

        throw e;
      }
    }
  };
}
