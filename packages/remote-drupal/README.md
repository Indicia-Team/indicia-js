# @indicia-js/remote-drupal [![version](https://img.shields.io/npm/v/@indicia-js/remote-drupal/latest.svg)](https://www.npmjs.com/package/@indicia-js/remote-drupal) [![Build Status](https://travis-ci.org/Indicia-Team/indicia-js.svg)](https://travis-ci.org/Indicia-Team/indicia-js)

Drupal 8 indicia-api module data synchronization functions. Helps to synchronize biological records with Indicia Warehouse (through [Indicia API Drupal module](https://github.com/Indicia-Team/drupal-8-module-indicia-api)).

## Usage

```javascript
import { Sample, Occurrence, Media } from '@indicia-js/core';
import withRemote from '@indicia-js/remote-drupal';

const SampleWithRemote = withRemote(Sample);
const OccurrenceWithRemote = withRemote(Occurrence);
const MediaWithRemote = withRemote(Media);

const sample = new SampleWithRemote({
  metadata: {
    survey_id: 1,
    training: true, // optional
    confidential: true, // optional
    sensitive: true, // optional
    release_status: 'R', // optional R-eleased/P-recheck/...
    record_status: 'C', // optional C-omplete/I-ncomplete/...
  },
});

sample.attrs.date = '12/2/2012';
sample.attrs.location = '12.345, -12.345';

var occ = new OccurrenceWithRemote();

sample.occurrences.push(occ);

// Upload to Indicia warehouse
sample.remote.api_key = '<YOUR_API_KEY>';
sample.remote.host_url = '<YOUR_API_HOST_URL>';
await sample.saveRemote();
```

## Initialization

```
npm i @indicia-js/remote-drupal
```

## Configuration

You can set human friendly warehouse attribute names (ids) and values for both Sample and Occurrence
attributes:

So instead of `occurrence.attrs[232] = 12343` one can
`occurrence.attrs.taxon = 'bee'`, examples:

```javascript
// Sample.keys
Occurrence.keys = {
  // no value mapping
  certain: {
    id: 398,
  },
  // object
  taxon: {
    id: 232,
    values: {
      1: 272198,
      bee: 12343,
    },
  },
  // array
  weather: {
    id: 122,
    values: [
      { value: 'sunny', id: 272398 },
      { value: 'rainy', id: 132343 },
    ],
  },
  // function
  colour: {
    id: 251,
    values() {
      return 'some calculated value';
    },
  },
};
```

### API

```typescript

// all models

model.id: null | Number
model.keys: Object | Function
model.getSubmission() ⇒ Array

// Sample
sample.remote: Object

// TODO: sample.fetch(options) ⇒ Promise
sample.saveRemote() ⇒ Promise
```

## Bugs and feature requests

Have a bug or a feature request? search for existing and closed issues. [Please open a new issue](https://github.com/Indicia-Team/indicia-js/issues).

## Creators

**Karolis Kazlauskis**

- <https://github.com/flumensio>

## Copyright and license

Code and documentation copyright 2020 CEH. Code released under the [GNU GPL v3 license](LICENSE).
