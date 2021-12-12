# @indicia-js/remote [![version](https://img.shields.io/npm/v/@indicia-js/remote/latest.svg)](https://www.npmjs.com/package/@indicia-js/remote) [![Build Status](https://travis-ci.org/Indicia-Team/indicia-js.svg)](https://travis-ci.org/Indicia-Team/indicia-js)

Indicia Warehouse REST API data synchronization functions.

## Usage

```js
import { Sample, Occurrence, Media } from '@indicia-js/core';
import withRemote from '@indicia-js/remote';

const SampleWithRemote = withRemote(Sample);
const OccurrenceWithRemote = withRemote(Occurrence);
const MediaWithRemote = withRemote(Media);

const sample = new SampleWithRemote();

sample.metadata = {
  survey_id: 1,
  training: true, // optional
  confidential: true, // optional
  sensitive: true, // optional
  release_status: 'R', // optional R-eleased/P-recheck/...
  record_status: 'C', // optional C-omplete/I-ncomplete/...
};

sample.remote.url = '<WAREHOUSE_HOST>/index.php/services/rest';
sample.remote.headers = {}; // can be an async function

sample.attrs.date = '12/2/2012';
sample.attrs.location = '12.345, -12.345';

var occ = new OccurrenceWithRemote();

sample.occurrences.push(occ);

// Upload to Indicia warehouse
await sample.saveRemote();
```

## Initialization

```
npm i @indicia-js/remote
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
    values(value) {
      return 'ome calculated value here';
    },
  },
};
```

### API

```typescript

// all models

model.id: null | Number
model.keys: Object | Function
model.getSubmission() ⇒ Object

// Sample
sample.remote: Object
sample.saveRemote() ⇒ Promise

// Media
media.remote: Object
media.upload() ⇒ Promise
media.getRemoteURL() ⇒ string
```

## Bugs and feature requests

Have a bug or a feature request? Search for existing and closed issues. [Please open a new issue](https://github.com/Indicia-Team/indicia-js/issues).

## Creators

**Karolis Kazlauskis**

- <https://github.com/flumensio>

## Copyright and license

Code and documentation copyright 2020 CEH. Code released under the [GNU GPL v3 license](LICENSE).
