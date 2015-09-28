Indicia Javascript SDK

Modular and framework independent JS library for biological record 
management and communication with Indicia Drupal API (mobile_auth module)

## Features 
- Effortless work with biological records (Samples and Occurrences)
- Offline storage (LocalStorage, IndexedDB and easily added more)
- Two way synchronisation with the cloud (Drupal mobile_auth module)

## Initialization

### Step 1: Get the library
#### Install using Bower: `bower install 'NERC-CEH/morel'`
#### Git clone: `git clone git://github.com/NERC-CEH/morel.git`


### Step 2: include JS files

You can find them in the root folder of the library.

```html
<!-- Add JS library file -->
<script src="path/to/morel.min.js"></script>
```

It doesn't matter how and where you load the library. Code is executed only when you 
initialize the library.

`morel` also supports AMD loaders like RequireJS or CommonJS:

```javascript
require(['path/to/morel.min.js'], function (morel) {
    //var Manager = new morel.Manager();
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

var manager = new morel.Manager(options);

```

You can set human friendly warehouse attribute names (ids) and values for both Sample and Occurrence
attributes:

So instead of `occurrence.set(232, 12343)` one can `occurrence.set('taxon', 'bee')`

```javascript
 //Samples
 morel.extend(morel.Sample.keys, {
        name: {
            id: 574
        },
        email: {
            id: 572
        }
    });


   //Occurrences
   morel.extend(morel.Occurrence.keys, {
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

## Usage

```javascript

//Sample

var sample = new morel.Sample();

sample.set('date', '12/2/2012')

sample.set('location', '12.345, -12.345')

//Occurrence

var occurrence = new morel.Occurrence();

occurrence.set('taxon', 'bee')

occurrence.set('number', 5);

sample.occurrences.set(occurrence);

//Image

var image = new morel.Image()

image.resize(800, 400)

occurrence.images.set(image);

//Manager

var manager = new morel.Manager()

manager.set(sample);

manager.syncAll();

```

### All functions
Manager:
clear: (callback)
get: (item, callback)
getAll: (callback)
has: (item, callback)
off: (name, callback, context)
offAll: ()
on: (name, callback, context)
remove: (item, callback)
send: (sample, callback)
sendStored: (sample, callback)
set: (item, callback)
sync: (item, callback)
syncAll: (onSample, callback)
trigger: (name, attributes)

Sample:
clear: ()
flatten: (flattener)
get: (name)
getSyncStatus: ()
has: (name)
off: (name, callback, context)
offAll: ()
on: (name, callback, context)
remove: (name)
set: (name, data)
toJSON: ()
trigger: (name, attributes)

Occurrence:
clear: ()
flatten: (flattener, count)
get: (name)
has: (name)
off: (name, callback, context)
offAll: ()
on: (name, callback, context)
remove: (name)
set: (name, data)
toJSON: ()
trigger: (name, attributes)

Image:
off: (name, callback, context)
offAll: ()
on: (name, callback, context)
resize: (MAX_WIDTH, MAX_HEIGHT, callback)
toJSON: ()
trigger: (name, attributes)

Collection:
add: (items)
clear: ()
create: ()
each: (method, context)
flatten: (flattener)
get: (item)
getFirst: ()
has: (item)
off: (name, callback, context)
offAll: ()
on: (name, callback, context)
remove: (items)
set: (items)
size: ()
sort: (comparator)
toJSON: ()
trigger: (name, attributes)

## Requirements

[IndexedDBShim](http://nparashuram.com/IndexedDBShim/) - optional if no IndexedDB 
is not in use or is fully supported by targeted browsers, or localStorage is enough.

## Building

To compile morel by yourself make sure that you have  [Node.js](http://nodejs.org/) and [Grunt.js](https://github.com/cowboy/grunt) 

- Get a copy of the source by running:

```bash
git clone git://github.com/NERC-CEH/morel.git
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

Have a bug or a feature request? search for existing and closed issues. [Please open a new issue](https://github.com/NERC-CEH/morel/issues).


## Creators

**Karolis Kazlauskis**

- <https://github.com/kazlauskis>



## Copyright and license

Code and documentation copyright 2015 CEH. Code released under the [GNU GPL v3 license](LICENSE).
