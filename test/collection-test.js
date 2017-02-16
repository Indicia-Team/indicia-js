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
  const storedCollection = new Collection([], { store, model: Sample });

  before((done) => {
    // clean up in case of trash
    storedCollection.fetch()
      .then(() => storedCollection.destroy())
      .then(() => done());
  });

  beforeEach((done) => {
    // clean up in case of trash
    storedCollection.fetch()
      .then(() => storedCollection.destroy())
      .then(() => done());
  });

  after((done) => {
    // clean up afterwards
    storedCollection.fetch()
      .then(() => storedCollection.destroy())
      .then(() => done());
  });

  it('should be a Backbone collection', () => {
    expect(storedCollection).to.be.instanceOf(Backbone.Collection);
  });

  it('should set, get and has', (done) => {
    const sample = new Sample();
    const key = Date.now().toString();
    const value = Math.random();

    sample.set(key, value);

    storedCollection.set(sample);

    const data = storedCollection.get(sample);
    expect(data).to.be.instanceof(Sample);
    expect(sample.get(key)).to.be.equal(data.get(key));

    let contains = storedCollection.has(sample)
    expect(contains).to.be.true;

    contains = storedCollection.has(new Sample());
    expect(contains).to.be.false;

    done();
  });

  it('should remove', () => {
    const sample = new Sample();

    storedCollection.set(sample)
    let contains = storedCollection.has(sample);
    expect(contains).to.be.true;

    storedCollection.remove(sample);
    contains = storedCollection.has(sample);
    expect(contains).to.be.false;
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

  it('should return promises', () => {
    expect(storedCollection.fetch()).to.be.instanceOf(Promise);
    expect(storedCollection.destroy()).to.be.instanceOf(Promise);
    expect(storedCollection.size()).to.be.instanceOf(Promise);
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

  describe('Sync', () => {
    describe('Local', () => {
      it('should fetch', (done) => {
        const sample = getRandomSample(store);
        sample.save({ myattr: 'val' }).then(() => {
          const collection = new Collection([], { store, model: Sample });

          collection.fetch()
            .then(() => {
              expect(collection.length).to.be.equal(1);

              const model = collection.get(sample);

              expect(model).to.exist;
              expect(model.get('myattr')).to.be.equal(sample.get('myattr'));

              done();
            });
        });
      });

      it('should destroy', (done) => {
        const sample = getRandomSample(store);
        sample.save().then(() => {
          const collection = new Collection([], { store, model: Sample });
          collection.fetch().then(() => {
            expect(collection.length).to.be.equal(1);

            collection.destroy().then(() => collection.fetch())
              .then(() => {
                expect(collection.length).to.be.equal(0);

                const model = collection.get(sample);

                expect(model).to.not.exist;

                done();
              });
          });
        });
      });

      it('should save', () => {
        throw 'todo';
      });
    });

    describe('Remote', () => {
      // it('should post all', (done) => {
      //   // check if storedCollection is empty
      //   expect(storedCollection.length).to.be.equal(0);
      //
      //   // add two valid samples
      //   const sample = getRandomSample();
      //   const sample2 = getRandomSample();
      //
      //   generateSampleResponse(sample);
      //
      //   // delete occurrences for the sample to become invalid to sync
      //   _.each(_.clone(sample2.occurrences.models), (model) => {
      //     model.destroy({ noSave: true });
      //   });
      //
      //   Promise.all([sample.save(), sample2.save()])
      //     .then(() => {
      //       expect(storedCollection.length).to.be.equal(2);
      //       // synchronise storedCollection
      //       return storedCollection.syncAll();
      //     })
      //     .then(() => {
      //       expect(storedCollection.sync.calledOnce).to.be.true;
      //
      //       // check sample status
      //       storedCollection.each((model) => {
      //         const status = model.getSyncStatus();
      //         if (model.cid === sample2.cid) {
      //           // invalid record (without occurrences)
      //           // should not be synced
      //           expect(status).to.be.equal(Morel.LOCAL);
      //         } else {
      //           expect(status).to.be.equal(Morel.SYNCED);
      //         }
      //       });
      //       done();
      //     });
      // });
      //
      // it('should not double sync all', (done) => {
      //   // add two valid samples
      //   const sample = getRandomSample();
      //
      //   generateSampleResponse(sample);
      //   Promise.all([sample.save()])
      //     .then(() => {
      //       // synchronise storedCollection twice
      //       Promise.all([storedCollection.syncAll(), storedCollection.syncAll()])
      //         .then(() => {
      //           expect(storedCollection.sync.callCount).to.be.equal(2);
      //           expect(Morel.Collection.prototype.post.calledOnce).to.be.true;
      //           done();
      //         });
      //     });
      // });
    });
  });
});