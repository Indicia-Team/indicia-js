import Backbone from 'backbone';
import _ from 'underscore';
import Occurrence from '../src/Occurrence';
import Collection from '../src/Collection';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Store from '../src/Store';
import Media from '../src/Media';
import helpers from '../src/helpers';
import serverResponses from './server_responses.js';
import { getRandomSample } from './helpers';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';

/* eslint-disable no-unused-expressions */
const SAMPLE_POST_URL = API_BASE + API_VER + API_SAMPLES_PATH;

describe('Collection', () => {
  const store = new Store();
  const storedCollection = new Collection(null, { store });

  before((done) => {
    // clean up in case of trash
    storedCollection.destroy().then(() => done());
  });

  beforeEach((done) => {
    // clean up in case of trash
    storedCollection.destroy().then(() => done());
  });

  after((done) => {
    // clean up afterwards
    storedCollection.destroy().then(() => done());
  });

  it('should set, get and has', (done) => {
    const sample = new Sample();
    const key = Date.now().toString();
    const value = Math.random();

    sample.set(key, value);

    storedCollection.destroy()
      .then(() => storedCollection.set(sample))
      .then(() => storedCollection.get(sample))
      .then((data) => {
        expect(data).to.be.instanceof(Sample);
        expect(sample.get(key)).to.be.equal(data.get(key));
      })
      .then(() => storedCollection.has(sample))
      .then((contains) => {
        expect(contains).to.be.true;
        return storedCollection.has(new Sample());
      })
      .then((finalContains) => {
        expect(finalContains).to.be.false;
        done();
      })
      .catch((err) => {
        if (err) throw err.message;
      });
  });


  it('should save', (done) => {
    storedCollection.create({ hello: 'world!' })
    then((model) => {
      id = model.get('id');

      expect(model).toBeDefined();
      expect(id).toBeDefined();
      expect(model.get('hello')).toEqual('world!');

      done();
    });
  });

  it('should fetch', (done) => {
    storedCollection.fetch({
      success: function() {
        expect(storedCollection.length).toEqual(1);

        var model = storedCollection.get(id);

        expect(model).toBeDefined();
        expect(model.attributes).toEqual({
          id: id,
          hello: 'world!'
        });

        done();
      }
    });
  });

  it('should update', (done) => {
    storedCollection.get(id).save({hello: 'you!'}, {
      success: function() {
        expect(storedCollection.get(id).get('hello')).toEqual('you!');

        done();
      }
    });
  });

  it('should remove', (done) => {
    localforage.getItem(storedCollection.sync.localforageKey, function(err, values) {
      storedCollection.get(id).destroy({
        success: function() {
          expect(storedCollection.length).toEqual(0);

          // expect storedCollection references to be reset
          localforage.getItem(storedCollection.sync.localforageKey, function(err, values2) {
            expect(values2.length).toEqual(values.length - 1);

            // test complete
            done();
          });
        }
      });
    });
  });

  it('should return JSON', () => {
    const occurrence = new Occurrence();
    const collection = new Collection([], {
      model: Occurrence,
    });
    expect(collection.model).to.be.equal(Occurrence);

    collection.set(occurrence);
    expect(collection.length).to.be.equal(1);
    const json = collection.toJSON();

    expect(json).to.be.an.array;
    expect(json.length).to.be.equal(1);
    expect(json[0].cid).to.be.equal(occurrence.cid);
  });

  it('should return promises', (done) => {
    const sample = new Sample();
    const key = Date.now().toString();
    const value = Math.random();

    sample.set(key, value);

    storedCollection.destroy()
      .then(() => {
        storedCollection.set(sample)
          .then(() => {
            storedCollection.get(sample)
              .then((data) => {
                expect(data).to.be.instanceof(Sample);
                expect(sample.get(key)).to.be.equal(data.get(key));
              });

            storedCollection.has(sample)
              .then((contains) => {
                expect(contains).to.be.true;
                storedCollection.has(new Sample())
                  .then((finalContains) => {
                    expect(finalContains).to.be.false;
                    done();
                  });
              });
          });
      });
  });

  it('should fetch and destroy', (done) => {
    const sample = new Sample();
    const sample2 = new Sample();

    throw 'todo';

    storedCollection.destroy()
      .then(() => storedCollection.set(sample))
      .then(() => storedCollection.set(sample2))
      .then(() => storedCollection.has(sample))
      .then((contains) => {
        expect(contains).to.be.true;
        expect(storedCollection.length).to.be.equal(2);

        storedCollection.destroy()
          .then(() => {
            storedCollection.has(sample)
              .then((finalContains) => {
                expect(finalContains).to.be.false;
                done();
              });
          });
      });
  });

  it('should remove', (done) => {
    const sample = new Sample();

    storedCollection.destroy()
      .then(() => storedCollection.set(sample))
      .then(() => storedCollection.has(sample))
      .then((contains) => {
        expect(contains).to.be.true;
        return storedCollection.remove(sample);
      })
      .then(() => storedCollection.has(sample))
      .then((finalContains) => {
        expect(finalContains).to.be.false;
        done();
      });
  });


  it('should be a storedCollection', (done) => {
    expect(storedCollection).to.be.instanceOf(Backbone.Collection);

    if (!storedCollection.ready()) {
      storedCollection.on('init', () => {
        expect(storedCollection.ready()).to.be.true;
        done();
      });
      return;
    }
    done();
  });

  it('should return error if no id or cid has been passed', (done) => {
    storedCollection.set(12345).catch((err) => {
      expect(err).to.be.an('object');
      done();
    });
  });

  it('should locally set get has', (done) => {
    const item = {
      cid: helpers.getNewUUID(),
    };

    storedCollection.set(item)
      .then(() => storedCollection.get(item))
      .then((data) => {
        expect(data instanceof storedCollection.model).to.be.true;
        expect(data.cid).to.be.equal(item.cid);

        return storedCollection.has(item);
      })
      .then((contains) => {
        expect(contains).to.be.true;
        done();
      });
  });

  it('should return promises', (done) => {
    const item = {
      cid: helpers.getNewUUID(),
    };

    storedCollection.set(item)
      .then(() => {
        storedCollection.get(item)
          .then((data) => {
            expect(data instanceof storedCollection.model).to.be.true;
            expect(data.cid).to.be.equal(item.cid);
            storedCollection.has(item)
              .then((contains) => {
                expect(contains).to.be.true;
                done();
              });
          });
      });
  });

  it('should size', (done) => {
    storedCollection.size()
      .then((size) => {
        expect(size).to.be.equal(0);
        return storedCollection.set({ cid: helpers.getNewUUID() });
      })
      .then(() => storedCollection.size())
      .then((newSize) => {
        expect(newSize).to.be.equal(1);
        return storedCollection.destroy();
      })
      .then(() => storedCollection.size())
      .then((finalSize) => {
        expect(finalSize).to.be.equal(0);
        done();
      });
  });

  it('should pass error object to on database error', (done) => {
    // on WebSQL+LocalForage this does not generate an error
    if (window.navigator.userAgent.search('Safari')) {
      done();
      return;
    }

    const item = {
      cid: helpers.getNewUUID(),
      corruptedAttribute: () => {
      },
    };

    storedCollection.set(item).catch((setErr) => {
      expect(setErr).to.be.not.null;
      done();
    });
  });
});

let storedCollection;

describe('Saving/destroying propagation', () => {
  const store = new Store();

  before((done) => {
    storedCollection = new Morel.Collection(null, { store });
    storedCollection.destroy().then(() => done());
  });

  beforeEach(() => {
    storedCollection = new Morel.Collection(null, { store });
  });

  afterEach((done) => {
    storedCollection.destroy().then(() => done());
  });

  describe('Media', () => {
    it('should save sample on media save', (done) => {
      const media = new Media();
      const occurrence = new Occurrence(null, {
        media: [media],
      });
      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add sample to storedCollection
      storedCollection.set(sample)
        .then(() => {
          expect(storedCollection.length).to.be.equal(1);

          // update the media and save it - the save should be permenant
          media.set('data', '1234');
          const req = media.save().then(() => {
            const newCollection = new Morel.Collection(null, { store });

            expect(newCollection.length).to.be.equal(1);

            const occurrenceFromDB = newCollection.at(0).getOccurrence();
            const imageFromDB = occurrenceFromDB.media.at(0);

            // check if change to media is permenant
            expect(imageFromDB.get('data')).to.be.equal('1234');
            done();
          });
          expect(req).to.be.an.instanceof(Promise);
        })
        .catch((err) => {
          if (err) throw err.message;
        });
    });

    it('should save sample on media destroy', (done) => {
      const media = new Media();
      const occurrence = new Occurrence(null, {
        media: [media],
      });
      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add sample to storedCollection
      storedCollection.set(sample).then(() => {
        expect(storedCollection.length).to.be.equal(1);

        media.destroy().then(() => {
          const newCollection = new Morel.Collection(null, { store });
          expect(newCollection.length).to.be.equal(1);

          const occurrenceFromDB = newCollection.at(0).getOccurrence();

          // check if change to media is permenant
          expect(occurrenceFromDB.media.length).to.be.equal(0);
          done();
        });
      });
    });
  });

  describe('Sample', () => {
    it('destroys the media on sample destroy', (done) => {
      const media = new Media();
      const occurrence = new Occurrence(null, {
        media: [media],
      });
      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add sample to storedCollection
      storedCollection.set(sample).then(() => {
        sinon.spy(media, 'destroy');

        sample.destroy().then(() => {
          expect(media.destroy.calledOnce).to.be.true;
          media.destroy.restore();
          done();
        });
      });
    });
  });

  describe('Sync All', () => {
    let server;

    function generateSampleResponse(sample) {
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses('OK', {
          cid: sample.cid,
          occurrence_cid: sample.getOccurrence().cid,
        }),
      );
    }

    before((done) => {
      server = sinon.fakeServer.create();
      server.respondImmediately = true;
      storedCollection.destroy().then(() => done());
    });

    beforeEach(() => {
      sinon.spy(storedCollection, 'sync');
      sinon.spy(Morel.Collection.prototype, 'post');
    });

    after((done) => {
      server.restore();
      storedCollection.destroy().then(() => done());
    });

    afterEach((done) => {
      Morel.Collection.prototype.post.restore();
      storedCollection.sync.restore();
      storedCollection.destroy().then(() => done());
    });


    it('should return a promise', () => {
      const promise = storedCollection.syncAll();
      expect(promise.then).to.be.a.function;
    });

    it('should post all', (done) => {
      // check if storedCollection is empty
      expect(storedCollection.length).to.be.equal(0);

      // add two valid samples
      const sample = getRandomSample();
      const sample2 = getRandomSample();

      generateSampleResponse(sample);

      // delete occurrences for the sample to become invalid to sync
      _.each(_.clone(sample2.occurrences.models), (model) => {
        model.destroy({ noSave: true });
      });

      Promise.all([sample.save(), sample2.save()])
        .then(() => {
          expect(storedCollection.length).to.be.equal(2);
          // synchronise storedCollection
          return storedCollection.syncAll();
        })
        .then(() => {
          expect(storedCollection.sync.calledOnce).to.be.true;

          // check sample status
          storedCollection.each((model) => {
            const status = model.getSyncStatus();
            if (model.cid === sample2.cid) {
              // invalid record (without occurrences)
              // should not be synced
              expect(status).to.be.equal(Morel.LOCAL);
            } else {
              expect(status).to.be.equal(Morel.SYNCED);
            }
          });
          done();
        });
    });

    it('should not double sync all', (done) => {
      // add two valid samples
      const sample = getRandomSample();
      generateSampleResponse(sample);

      generateSampleResponse(sample);
      Promise.all([sample.save()])
        .then(() => {
          // synchronise storedCollection twice
          Promise.all([storedCollection.syncAll(), storedCollection.syncAll()])
            .then(() => {
              expect(storedCollection.sync.callCount).to.be.equal(2);
              expect(Morel.Collection.prototype.post.calledOnce).to.be.true;
              done();
            });
        });
    });
  });
});

