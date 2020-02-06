# IndiciaJS [![Build Status](https://travis-ci.org/Indicia-Team/indicia-js.svg)](https://travis-ci.org/Indicia-Team/indicia-js)

Indicia Javascript SDK

A tiny library with no dependencies that helps to manage and synchronize biological records with Indicia warehouse (through [Indicia API Drupal module](https://github.com/Indicia-Team/drupal-8-module-indicia-api)).

## Features

- Manage Indicia records (Sample and Occurrence based)
- Synchronization with the warehouse

## Usage

```javascript
import { Sample, Occurrence, Media } from '@indicia/core';

// Sample
var sample = new Sample();
sample.attrs.date = '12/2/2012';
sample.attrs.location = '12.345, -12.345';

// Occurrence
var occ = new Occurrence();
occ.attrs.taxon = 'bee';
occ.attrs.number = 5;
occ.attrs.colours = ['red', 'green'];

sample.occurrences.push(occ);

// Image
var image = new Media();
await image.resize(800, 400);
await image.addThumbnail();

occ.media.push(image);

// Upload to Indicia warehouse
sample.remote.api_key = '<YOUR_API_KEY>';
sample.remote.host_url = '<YOUR_API_HOST_URL>';
await sample.saveRemote();
```

## Initialization

### Step 1: Get the library

```
npm i @indicia/core
```

### Step 2: include JS files

You can find them in the root folder of the library.

```html
<!-- Add JS library file -->
<script src="path/to/indicia.min.js"></script>
```

It doesn't matter how and where you load the library. Code is executed only when you
initialize the library. `IndiciaJS` also supports AMD loaders like RequireJS or CommonJS:

```javascript
import Indicia, { Sample, Occurrence, Media } from 'indicia';

// or

require(['path/to/indicia.min.js'], function(Indicia) {
  let sample = new Indicia.Sample();
});
```

## Configuration

```javascript
const sample = new Sample({
  metadata: {
    survey_id: 1,
    training: true, // optional
    confidential: true, // optional
    sensitive: true, // optional
    release_status: 'R', // optional R-eleased/P-recheck/...
    record_status: 'C', // optional C-omplete/I-ncomplete/...
  },
});

sample.remote = {
  host_url: '<YOUR_API_HOST_URL>',
  api_key: '<YOUR_API_KEY>',
};
```

You can set human friendly warehouse attribute names (ids) and values for both Sample and Occurrence
attributes:

So instead of `occurrence.attrs[232] = 12343` one can
`occurrence.attrs.taxon = 'bee'`, examples:

```javascript
// Sample.keys
Occurrence.keys = {
  certain: {
    id: 398,
  },
  taxon: {
    id: 232,
    values: {
      1: 272198,
      bee: 12343,
    },
  },
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
static Model.fromJSON() ⇒ Promise

model.cid: Number
model.id: null | Number
model.attrs: Object
model.metadata: Object
model.keys: Object | Function

model.toJSON() ⇒ Promise
model.getSubmission() ⇒ Array


// Sample
sample.occurrences: Array
sample.samples: Array
sample.media: Array
sample.remote: Object

// TODO: sample.fetch(options) ⇒ Promise
sample.saveRemote() ⇒ Promise


// Occurrence
occurrence.media: Array

// Media
media.getURL() ⇒ String
media.addThumbnail() ⇒ Promise
media.resize(MAX_WIDTH, MAX_HEIGHT) ⇒ Promise

```

## Bugs and feature requests

Have a bug or a feature request? search for existing and closed issues. [Please open a new issue](https://github.com/Indicia-Team/indicia-js/issues).

## Creators

**Karolis Kazlauskis**

- <https://github.com/kazlauskis>

## Copyright and license

Code and documentation copyright 2020 CEH. Code released under the [GNU GPL v3 license](LICENSE).
