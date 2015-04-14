Provides general use Indicia targeted mobile app recording libraries.

Install using Bower: `bower install 'NERC-CEH/morel'`

## Use

```javascript
//configuration
$.extend(morel.io.CONF, {
  RECORD_URL: 'https://example.com/'
});
$.extend(morel.auth.CONF, {
  APPNAME: "appName",
  APPSECRET: "appSecret",
  WEBSITE_ID: 1,
  SURVEY_ID: 2
});

//save input
morel.record.inputs.set('sample:date', '12/12/1923');

//get input
morel.record.inputs.get('sample:date');
morel.record.inputs.get(morel.record.inputs.KEYS.DATE); //same as previous

//get current record
morel.record.get()

//send current record
morel.io.sendSavedRecord(savedRecordId, onSuccess, onError);

//save current record
morel.record.db.save(onSuccess, onError);

//get saved records
morel.record.db.getAll(onSuccess, onError);
morel.record.db.get(savedRecordId, onSuccess, onError); //individual

```

## Requirements

[jQuery](https://jquery.com/).

[IndexedDBShim](http://nparashuram.com/IndexedDBShim/) is optional if localStorage is enough.

## Building

- Install [NodeJS](http://nodejs.org/)
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

This will create a `dist` folder with the javascript code.


## Bugs and feature requests

Have a bug or a feature request? search for existing and closed issues. [Please open a new issue](https://github.com/NERC-CEH/morel/issues).


## Creators

**Karolis Kazlauskis**

- <https://github.com/kazlauskis>



## Copyright and license

Code and documentation copyright 2015 CEH. Code released under the [GNU GPL v3 license](LICENSE).
