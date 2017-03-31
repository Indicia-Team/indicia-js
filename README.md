# IndiciaJS [![Build Status](https://travis-ci.org/Indicia-Team/indicia-js.svg?branch=v4)](https://travis-ci.org/Indicia-Team/indicia-js)

Indicia Javascript SDK

Helps to locally store and synchronise data with Indicia warehouse (through Indicia API (v1) Drupal module).

## Features 
- Effortless work with biological records (Samples and Occurrences)
- Offline storage (SQLite, LocalStorage, IndexedDB and easily added more)
- Synchronisation with the warehouse
- Warehouse reporting

## Requirements

[Backbone](http://backbonejs.org/) - used to structure the data and its management.
[jQuery](http://backbonejs.org/) - because why not? :)
[LocalForage](http://backbonejs.org/) - used to store models for offline usage.

## Usage

```javascript

// Sample
var sample = new Indicia.Sample();
sample.set('date', '12/2/2012')
sample.set('location', '12.345, -12.345')

// Occurrence
var occurrence = new Indicia.Occurrence();
occurrence.set('taxon', 'bee')
occurrence.set('number', 5);

sample.occurrences.set(occurrence);

// Image
var image = new Indicia.Media()
image.resize(800, 400)

occurrence.media.set(image);


// Save (locally for offline use)
sample.save();

// Save (remote warehouse)
sample.api_key = '<YOUR_API_KEY>';
sample.host_url = '<YOUR_API_HOST_URL>';
sample.save(null, { remote: true });

```

## Initialization

### Step 1: Get the library
- Install using Bower: `bower install 'Indicia-Team/indicia-js'` or
- Git clone: `git clone git://github.com/Indicia-Team/indicia-js`


### Step 2: include JS files

You can find them in the root folder of the library.

```html
<!-- Add JS library file -->
<script src="path/to/indicia.min.js"></script>
```

It doesn't matter how and where you load the library. Code is executed only when you 
initialize the library. `IndiciaJS` also supports AMD loaders like RequireJS or CommonJS:

```javascript
require(['path/to/indicia.min.js'], function (Indicia) {
    let sample = new Indicia.Sample();
});

```

## Configuration

```javascript
var options = {
  host_url: "<YOUR_API_HOST_URL>",
  api_key: "<YOUR_API_KEY>",
  survey_id: 1,
  training: true, // optional
  confidential: true, // optional
  sensitive: true, // optional
  release_status: 'R', // optional R-eleased/P-recheck/...
  record_status: 'C', // optional C-omplete/I-ncomplete/...
}

var sample = new Indicia.Sample(null, options);

```

You can set human friendly warehouse attribute names (ids) and values for both Sample and Occurrence
attributes:

So instead of `occurrence.set(232, 12343)` one can 
`occurrence.set('taxon', 'bee')`, examples:

```javascript
//Samples
Indicia.Sample.keys = {
  name: {
    id: 574
  },
  email: {
    id: 572
  }
};

//Occurrences
Indicia.Occurrence.keys = {
  certain: {
    id: 398
  },
  taxon: {
    id: 232,
    values: {
      1: 272198,
      bee: 12343
    }
  }
};
```

### Indicia functions

It uses Backbone Models and Collections,
so each Sample, Occurrence or Media has also other [Backbone Model functions](http://backbonejs.org/#Model)
like set(attr, value), get(attr), validate(options) etc.

```javascript
// Sample

model.save(attrs, options); // returns Promise [local and remote]
model.destroy(options); // returns Promise [local]
model.fetch(options); // returns Promise [local]
model.getSyncStatus();
model.toJSON();
model.validateRemote(attributes);
model.addSample(model);
model.getSample(modelID);
model.addOccurrence(model);
model.getOccurrence(modelID);
model.addMedia(model);
model.getMedia(modelID);

// Occurrence

model.save(attrs, options); // returns Promise [local]
model.destroy(options); // returns Promise [local]
model.fetch(options); // returns Promise [local]
model.getSyncStatus();
model.toJSON();
model.validateRemote(attributes);
model.addMedia(model);
model.getMedia(modelID);

// Media

model.save(attrs, options); // returns Promise [local]
model.destroy(options); // returns Promise [local]
model.getURL();
model.addThumbnail(); // returns Promise
model.resize(MAX_WIDTH, MAX_HEIGHT); // returns Promise
model.toJSON();

// Collection

collection.save(attrs, options); // returns Promise [local and remote]
collection.destroy(options); // returns Promise [local]
collection.fetch(options); // returns Promise [local]

```

## Examples

* Saving to local storage
```javascript

// Create new empty sample
const sample = new Indicia.Sample();

// Let's add some value
sample.set('date', '12/10/2017');

// Save the sample to local storage, default IndexedDB
sample
  .save()
  .then(() => {
    console.log('Saved!');
  });

```

* Retreiving from local storage

```javascript

const sampleFromStorage = new Indicia.Sample(null, {
  cid: sample.cid, // needs a saved sample cid
});

// Let's retreive this saved sample
sampleFromStorage
  .fetch()
  .then(() => {
    console.log('Fetched!');
    sample.get('date'); // '12/10/2017'
  });

```

* Destroying from local storage

```javascript

// Let's retreive this saved sample
const sampleFromStorage = new Indicia.Sample(null, {
  cid: sample.cid, // needs a saved sample cid
});

sampleFromStorage
  .destroy()
  .then(() => {
    console.log('Destroyed!');
  });

```

* Remote sending to the warehouse

```javascript

// Let's retreive this saved sample
const sampleFromStorage = new Indicia.Sample(null, {
  cid: sample.cid, // needs a saved sample cid
  host_url: "<YOUR_API_HOST_URL>",
  api_key: "<YOUR_API_KEY>",
});

sampleFromStorage
  .fetch() // should fetch from storage if saved
  .save(null, { remote: true })
  .then(() => {
    console.log('Saved remotely!');
    sampleFromStorage.getSyncStatus() === Indicia.SERVER; // true
  });

```

## Building

To compile IndiciaJS by yourself make sure that you have  [Node.js](http://nodejs.org/) and [Grunt.js](https://github.com/cowboy/grunt)

- Get a copy of the source by running:

```bash
git clone git://github.com/Indicia-Team/indicia-js.git
```

- Enter the `indicia-js` directory and install the npm build dependancies:

```bash
cd indicia-js && npm install
```

- Build the library: 

```bash
npm start
```

This will update `indicia.js` and `indicia.min.js`.

- Test the code
 
 ```bash
 npm test
 ```

## Bugs and feature requests

Have a bug or a feature request? search for existing and closed issues. [Please open a new issue](https://github.com/Indicia-Team/indicia-js/issues).


## Creators

**Karolis Kazlauskis**

- <https://github.com/kazlauskis>


## Copyright and license

Code and documentation copyright 2017 CEH. Code released under the [GNU GPL v3 license](LICENSE).
