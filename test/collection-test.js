import Backbone from 'backbone';
import Occurrence from '../src/Occurrence';
import Collection from '../src/Collection';
import Sample from '../src/Sample';
import Store from '../src/Store';
import helpers from '../src/helpers';
import { SYNCED } from '../src/constants';
import { getRandomSample, generateSampleResponse } from './helpers';

/* eslint-disable no-unused-expressions */

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

    let contains = storedCollection.has(sample);
    expect(contains).to.be.true;

    contains = storedCollection.has(new Sample());
    expect(contains).to.be.false;

    done();
  });

  it('should remove', () => {
    const sample = new Sample();

    storedCollection.set(sample);
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
        storedCollection.set({ cid: helpers.getNewUUID() });
        return storedCollection.size();
      })
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

      it('should save', (done) => {
        const sample = getRandomSample(store);
        const sample2 = getRandomSample(store);
        const collection = new Collection([], { store, model: Sample });

        // add and save samples
        collection.add(sample);
        collection.add(sample2);
        collection.save().then(() => {
          const savedCollection = new Collection([], { store, model: Sample });

          savedCollection.fetch().then(() => {
            expect(savedCollection.length).to.be.equal(2);
            done();
          });
        });
      });
    });

    describe('Remote', () => {
      let server;

      before(() => {
        server = sinon.fakeServer.create();
        server.respondImmediately = true;
      });

      beforeEach(() => {
        sinon.spy(Sample.prototype, '_syncRemote');
        sinon.spy(Sample.prototype, '_create');
      });

      after(() => {
        server.restore();
      });

      afterEach(() => {
        Sample.prototype._syncRemote.restore();
        Sample.prototype._create.restore();
      });

      it('should post all', (done) => {
        const sample = getRandomSample(store);
        const sample2 = getRandomSample(store);
        const collection = new Collection([], { store, model: Sample });

        generateSampleResponse(server, 'OK', (cid) => collection.get(cid));

        // add and save samples
        collection.add(sample);
        collection.add(sample2);
        collection.save(null, { remote: true }).then(() => {
          const savedCollection = new Collection([], { store, model: Sample });

          expect(Sample.prototype._create.calledTwice).to.be.true;

          savedCollection.fetch().then(() => {
            savedCollection.forEach((model) => {
              expect(model.getSyncStatus()).to.be.equal(SYNCED);
            });
            expect(savedCollection.length).to.be.equal(2);
            done();
          });
        });
      });
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
