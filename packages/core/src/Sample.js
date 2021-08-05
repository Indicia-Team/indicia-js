import { getNewUUID } from './helpers';
import DefaultMedia from './Media';
import DefaultOccurrence from './Occurrence';

function defaultMetadata() {
  const today = new Date().toISOString();
  return {
    survey_id: null,
    input_form: null,

    created_on: today,
    updated_on: today,

    synced_on: null, // set when fully initialized only
    server_on: null, // updated on server
  };
}

export default class Sample {
  static fromJSON(
    json,
    Occurrence = DefaultOccurrence,
    Sample = this, // eslint-disable-line
    Media = DefaultMedia
  ) {
    const { samples, occurrences, media, ...options } = json;
    const sample = new this(options);
    samples.forEach(smp => sample.samples.push(Sample.fromJSON(smp)));
    occurrences.forEach(occ =>
      sample.occurrences.push(Occurrence.fromJSON(occ))
    );
    media.forEach(m => sample.media.push(Media.fromJSON(m)));
    return sample;
  }

  cid = getNewUUID();

  attrs = {
    date: new Date().toISOString(),
    location_type: 'latlon',
  };

  metadata = defaultMetadata();

  media = [];

  occurrences = [];

  samples = [];

  constructor(options = {}) {
    this.cid = options.cid || getNewUUID();

    this.attrs = {
      ...this.attrs,
      ...options.attrs,
      ...options.attributes, // backwards compatible
    };
    this.metadata = { ...this.metadata, ...options.metadata };
  }

  toJSON() {
    let occurrences;
    if (!this.occurrences) {
      occurrences = [];
      console.warn('toJSON occurrences missing');
    } else {
      occurrences = this.occurrences.map(model => model.toJSON());
    }

    let samples;
    if (!this.samples) {
      samples = [];
      console.warn('toJSON samples missing');
    } else {
      samples = this.samples.map(model => model.toJSON());
    }

    let media;
    if (!this.media) {
      media = [];
      console.warn('toJSON media missing');
    } else {
      media = this.media.map(model => model.toJSON());
    }

    const data = {
      cid: this.cid,
      metadata: this.metadata,
      attrs: this.attrs,
      occurrences,
      samples,
      media,
    };

    return data;
  }
}
