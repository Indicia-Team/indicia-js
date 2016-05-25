# Morel [![Build Status](https://travis-ci.org/Indicia-Team/morel.svg?branch=v3.1)](https://travis-ci.org/Indicia-Team/morel)

Indicia Javascript SDK

Biological record management and communication with Indicia Drupal API (mobile_auth module). 

## Features 
- Effortless work with biological records (Samples and Occurrences)
- Offline storage (LocalStorage, IndexedDB and easily added more)
- Synchronisation with the cloud (Drupal mobile_auth module)

## Usage

```javascript

//Sample
var sample = new Morel.Sample();
sample.set('date', '12/2/2012')
sample.set('location', '12.345, -12.345')

//Occurrence
var occurrence = new Morel.Occurrence();
occurrence.set('taxon', 'bee')
occurrence.set('number', 5);

sample.occurrences.set(occurrence);

//Image
var image = new Morel.Image()
image.resize(800, 400)

occurrence.images.set(image);

//Manager
var manager = new Morel.Manager()
manager.set(sample);
manager.syncAll();

```

## Initialization

### Step 1: Get the library
- Install using Bower: `bower install 'Indicia-Team/morel'` or 
- Git clone: `git clone git://github.com/Indicia-Team/morel.git`


### Step 2: include JS files

You can find them in the root folder of the library.

```html
<!-- Add JS library file -->
<script src="path/to/morel.min.js"></script>
```

It doesn't matter how and where you load the library. Code is executed only when you 
initialize the library. `Morel` also supports AMD loaders like RequireJS or CommonJS:

```javascript
require(['path/to/morel.min.js'], function (Morel) {
    //var Manager = new Morel.Manager();
});

```

## Configuration

```javascript
var options = {
  url: 'http://example.com/mobile/submit',
  appname: "appName",
  appsecret: "appSecret",
  website_id: 1,
  survey_id: 2,
}

var manager = new Morel.Manager(options);

```

You can set human friendly warehouse attribute names (ids) and values for both Sample and Occurrence
attributes:

So instead of `occurrence.set(232, 12343)` one can 
`occurrence.set('taxon', 'bee')`, examples:

```javascript
 //Samples
 Morel.extend(Morel.Sample.keys, {
        name: {
            id: 574
        },
        email: {
            id: 572
        }
    });


   //Occurrences
   Morel.extend(Morel.Occurrence.keys, {
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
   });

```

### All functions

It uses Backbone Models and Collections, so each Sample and Occurrence has also other Backbone Model functions.

**Manager:***

* get(model, callback, options)
* getAll(callback, options)
* has(model, callback, options)
* remove(model, callback, options)
* set(model, callback, options)
* sync(method, model)
* syncAll(method, collection)

***Sample:***

* constructor()
* addOccurrence(occurrence)
* constructor()
* destroy()
* getSyncStatus()
* save(attrs)
* toJSON()
* validate(attributes)

***Occurrence:***

* addImage(image)
* constructor()
* destroy()
* save(attrs)
* setSample(sample)
* toJSON()
* validate(attributes)

***Image:***

* addThumbnail(callback)
* destroy()
* getURL()
* resize(MAX_WIDTH, MAX_HEIGHT, callback)
* save(attrs)
* setOccurrence(occurrence)
* toJSON()

## Requirements

[Backbone](http://backbone.org) 

[IndexedDBShim](http://nparashuram.com/IndexedDBShim/) - optional if no IndexedDB 
is not in use or is fully supported by targeted browsers, or localStorage is enough.

## Building

To compile morel by yourself make sure that you have  [Node.js](http://nodejs.org/) and [Grunt.js](https://github.com/cowboy/grunt) 

- Get a copy of the source by running:

```bash
git clone git://github.com/Indicia-Team/morel.git
```

- Enter the `morel` directory and install the npm build dependancies:

```bash
cd morel && npm install
```

- Build the library: 

```bash
grunt
```

This will update a `morel.js` and `morel.min.js`.

- Test the code
 
 ```bash
 grunt test
 ```

## Bugs and feature requests

Have a bug or a feature request? search for existing and closed issues. [Please open a new issue](https://github.com/Indicia-Team/morel/issues).


## Creators

**Karolis Kazlauskis**

- <https://github.com/kazlauskis>



## Copyright and license

Code and documentation copyright 2016 CEH. Code released under the [GNU GPL v3 license](LICENSE).
