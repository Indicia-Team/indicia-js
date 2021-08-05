import { getNewUUID } from './helpers';
import DefaultMedia from './Media';

function defaultMetadata() {
  const today = new Date().toISOString();
  return {
    training: null,

    created_on: today,
    updated_on: today,

    synced_on: null, // set when fully initialized only
    server_on: null, // updated on server
  };
}

export default class Occurrence {
  cid = getNewUUID();

  attrs = {};

  metadata = defaultMetadata();

  media = [];

  constructor(options = {}) {
    this.cid = options.cid || this.cid;

    this.attrs = {
      ...this.attrs,
      ...options.attrs,
      ...options.attributes, // backwards compatible
    };
    this.metadata = { ...this.metadata, ...options.metadata };
  }

  toJSON() {
    let media;
    if (!this.media) {
      media = [];
      console.warn('toJSON media missing');
    } else {
      media = this.media.map(m => m.toJSON());
    }
    const data = {
      cid: this.cid,
      metadata: this.metadata,
      attrs: this.attrs,
      media,
    };
    return data;
  }

  static fromJSON(json, Media = DefaultMedia) {
    const { media, ...options } = json;
    const occurrence = new this(options);
    media.forEach(m => occurrence.media.push(Media.fromJSON(m)));
    return occurrence;
  }
}
