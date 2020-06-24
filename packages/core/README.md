# @indicia-js/core [![version](https://img.shields.io/npm/v/@indicia-js/core/latest.svg)](https://www.npmjs.com/package/@indicia-js/core) [![Build Status](https://travis-ci.org/Indicia-Team/indicia-js.svg)](https://travis-ci.org/Indicia-Team/indicia-js)

A tiny library with no dependencies that helps to manage biological records based on Samples and Occurrences.

## Usage

```javascript
import { Sample, Occurrence, Media } from '@indicia-js/core';

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
```

## Initialization

### Step 1: Get the library

```
npm i @indicia-js/core
```

### Step 2: include JS files

You can find them in the root folder of the library.

```html
<!-- Add JS library file -->
<script src="path/to/indicia.js"></script>
```
or 

```javascript
import { Sample, Occurrence, Media } from 'indicia';
```

### API

```typescript

// all models
static Model.fromJSON() ⇒ Promise

model.cid: UUID
model.attrs: Object
model.metadata: Object

model.toJSON() ⇒ Promise


// Sample
sample.occurrences: Array
sample.samples: Array
sample.media: Array

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

- <https://github.com/flumensio>

## Copyright and license

Code and documentation copyright 2020 CEH. Code released under the [GNU GPL v3 license](LICENSE).
