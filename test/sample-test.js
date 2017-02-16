import Backbone from 'backbone';
import Store from '../src/Store';
import Media from '../src/Media';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import Collection from '../src/Collection';
import { getRandomSample, generateSampleResponse } from './helpers';
import { SYNCED } from '../src/constants';

/* eslint-disable no-unused-expressions */

describe('Sample', () => {
  const store = new Store();
  const storedCollection = new Collection(null, { store, model: Sample });

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

  afterEach((done) => {
    // clean up afterwards
    storedCollection.fetch()
      .then(() => storedCollection.destroy())
      .then(() => done());
  });

  it('should be a Backbone model', () => {
    const sample = new Sample(null, { store });

    expect(sample).to.be.instanceOf(Backbone.Model);
    expect(sample.cid).to.be.a.string;
    expect(sample.attributes).to.be.an.object
  });

  it('should return JSON', () => {
    const occurrence = new Occurrence();
    const sample = new Sample(null, { store });
    const subSample = new Sample(null, { store });
    subSample.occurrences.set(occurrence);

    let json = sample.toJSON();

    expect(json).to.be.an.object;
    expect(json.occurrences.length).to.be.equal(0);

    sample.samples.set(subSample);
    json = sample.toJSON();

    expect(json.samples.length).to.be.equal(1);
    expect(json.samples[0].cid).to.be.equal(subSample.cid);

    expect(json.samples[0].occurrences.length).to.be.equal(1);
    expect(json.samples[0].occurrences[0].cid).to.be.equal(occurrence.cid);
  });

  // defaults

  it('should have default metadata', () => {
    const sample = new Sample(null, { store });
    expect(sample.metadata).to.be.an('object');
    expect(sample.metadata.training).to.be.equal(false);
    expect(sample.metadata.created_on).to.be.instanceOf(Date);
    expect(sample.metadata.updated_on).to.be.instanceOf(Date);
  });

  it('should have default occurrences collection', () => {
    const sample = new Sample(null, { store });
    expect(sample.occurrences).to.be.instanceOf(Backbone.Collection);
    expect(sample.occurrences.model).to.be.equal(Occurrence);
  });

  it('should have default samples collection', () => {
    const sample = new Sample(null, { store });
    expect(sample.samples).to.be.instanceOf(Backbone.Collection);
    expect(sample.samples.model).to.be.equal(Sample);
  });

  it('should have default media collection', () => {
    const sample = new Sample(null, { store });
    expect(sample.media).to.be.instanceOf(Backbone.Collection);
    expect(sample.media.model).to.be.equal(Media);
  });

  // validation

  it('should have remote and local validators', () => {
    const sample = new Sample(null, { store });
    expect(sample.validate).to.be.a('function');
    expect(sample.validateRemote).to.be.a('function');
  });


  it('should validate location, location type, date and occurrences', () => {
    const sample = new Sample(null, { store });
    const subSample = new Sample(null, { store });
    const occurrence = new Occurrence();

    delete sample.attributes.location_type;
    let allInvalids = sample.validate(null, { remote: true });
    let invalids = allInvalids.sample;

    expect(invalids).to.be.an('object');
    expect(invalids.location).to.be.a('string');
    expect(invalids.location_type).to.be.a('string');

    sample.samples.set(subSample);

    allInvalids = sample.validate(null, { remote: true });
    invalids = allInvalids.sample;
    expect(invalids.samples).to.be.undefined;

    subSample.occurrences.set(occurrence);
    sample.occurrences.set(occurrence);

    allInvalids = sample.validate(null, { remote: true });
    expect(allInvalids.samples[subSample.cid].occurrences).to.not.be.empty;
    expect(allInvalids.occurrences).to.not.be.empty;
  });

  // synchronisation

  describe('Sync', () => {
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

    it('should throw an error if sync with no store', (done) => {
      const sample = new Sample();
      sample.save()
        .catch(() => done());
    });

    describe('Local', () => {
      it('should save and fetch and update', (done) => {
        const sample = new Sample(null, { store });

        sample.save({ hello: 'world!' })
          .then((model) => {
            const cid = model.cid;

            expect(model).to.exist;
            expect(cid).to.exist;
            expect(model.get('hello')).to.be.equal('world!');

            // get direct from storage
            const sampleStored = new Sample(null, { cid, store });
            sampleStored.fetch().then((modelStored) => {
              expect(sampleStored.get('hello')).to.be.equal('world!');
              expect(modelStored.get('hello')).to.be.equal('world!');
              done();
            });
          });
      });

      it('should destroy', (done) => {
        const sample = new Sample(null, { store });

        sample.destroy()
          .then((model) => {
            const cid = model.cid;
            expect(cid).to.be.equal(sample.cid);

            // get direct from storage
            const sampleStored = new Sample(null, { cid, store });
            sampleStored.fetch().catch(() => done());
          });
      });

      it('should fire model sync events', (done) => {
        const events = ['request', 'sync', 'error'];
        const eventsFired = [];
        const sample = getRandomSample(store);

        sample.on('request', () => {
          eventsFired.push('request');
        });

        sample.on('sync', () => {
          eventsFired.push('sync');
        });

        sample.save()
          .then(() => {
            // send an error
            const newSample = getRandomSample(store);

            newSample.on('error', () => {
              newSample.store.sync.restore();

              eventsFired.push('error');
              if (events.length === 3) {
                done();
              }
            });

            sinon.stub(newSample.store, 'sync')
              .returns(Promise.reject('Some problem'));

            newSample.save().catch(() => {});
          });
      });
    });

    describe('Remote', () => {
      it('should post with remote option', (done) => {
        const sample = getRandomSample(store);

        generateSampleResponse(server, 'OK', sample);
        const valid = sample.save(null, { remote: true }).then(() => {
          expect(sample._syncRemote.calledOnce).to.be.true;
          done();
        });

        expect(valid).to.be.instanceOf(Promise);
      });

      it('should post with remote option (subsample)', (done) => {
        const subSample = getRandomSample(store);
        const sample = getRandomSample(store, [subSample]);

        generateSampleResponse(server, 'OK_SUBSAMPLE', sample);

        const valid = sample.save(null, { remote: true }).then(() => {
          expect(sample._syncRemote.calledOnce).to.be.true;
          done();
        });

        expect(valid).to.be.instanceOf(Promise);
      });

      it('should update remotely synced record', (done) => {
        const sample = getRandomSample(store);
        generateSampleResponse(server, 'OK', sample);

        sample.save(null, { remote: true })
          .then(() => sample.save())
          .then(() => {
            // get new storedCollection without cached samples
            const cid = sample.cid;
            const newSample = new Sample(null, { cid, store });
            newSample.fetch()
              .then(() => {
                expect(newSample.getSyncStatus()).to.be.equal(SYNCED);
                done();
              });
          });
      });

      it('should validate before remote sending', () => {
        const occurrence = new Occurrence();
        const sample = new Sample(null, {
          occurrences: [occurrence],
          store,
        });

        const valid = sample.save(null, { remote: true });
        expect(valid).to.be.false;
      });

      it('should return error if unsuccessful remote sync', (done) => {
        const sample = getRandomSample(store);

        generateSampleResponse(server, 'ERR');

        const valid = sample.save(null, { remote: true })
          .catch((err) => {
            expect(sample._syncRemote.calledOnce).to.be.true;
            expect(err.message).to.not.be.null;
            done();
          });

        expect(valid).to.be.instanceOf(Promise);
      });

      // todo: we should fix this eventually
      it('should ignore the duplication error', (done) => {
        const sample = getRandomSample(store);

        generateSampleResponse(server, 'DUPLICATE', sample);

        expect(sample.id).to.be.undefined;
        expect(sample.getOccurrence().id).to.be.undefined;

        sample.save(null, { remote: true })
          .then(() => {
            expect(sample.id).to.be.a('number');
            expect(sample.getOccurrence().id).to.be.a('number');
            expect(sample._syncRemote.calledOnce).to.be.true;
            done();
          });
      });

      it('should set synchronising flag on sample', () => {
        const sample = getRandomSample(store);

        sample.save(null, { remote: true });
        expect(sample.synchronising).to.be.true;
      });


      it('should not double create the record', (done) => {
        const sample = getRandomSample(store);
        generateSampleResponse(server, 'OK', sample);

        let promise = sample.save(null, { remote: true }).then(() => {
          let newPromise = sample.save(null, { remote: true })
            .catch(() => {
              expect(newPromise).to.be.instanceOf(Promise);

              expect(sample._syncRemote.calledTwice).to.be.true;
              expect(sample._create.calledOnce).to.be.true;
              done();
            });
        });

        expect(promise).to.be.instanceOf(Promise);
      });

      // todo: should update


      // it('should timeout', (done) => {
      //   server.respondImmediately = false;
      //   const clock = sinon.useFakeTimers();
      //   const errorCallback = sinon.spy();
      //
      //   const origCall = $.ajax;
      //   const stub = sinon.stub($, 'ajax', (...args) => {
      //     stub.restore();
      //     origCall.apply($, args).catch(() => {
      //       errorCallback();
      //     });
      //     clock.tick(29000);
      //     expect(errorCallback.calledOnce).to.be.false;
      //     clock.tick(2000);
      //     expect(errorCallback.calledOnce).to.be.true;
      //     done();
      //   });
      //
      //   const sample = getRandomSample(store);
      //
      //   sample.save(null, { remote: true }).catch(() => {
      //     done();
      //   });
      //   clock.tick(29000);
      // });

      it('should fire model sync events', (done) => {
        const events = ['request', 'sync', 'error'];
        const eventsFired = [];
        const sample = getRandomSample(store);

        sample.on('request', () => {
          eventsFired.push('request');
        });

        sample.on('sync', () => {
          eventsFired.push('sync');
        });

        generateSampleResponse(server, 'OK', sample);

        sample.save(null, { remote: true })
          .then(() => {
            // send an error
            const newSample = getRandomSample(store);
            generateSampleResponse(server, 'ERR');

            newSample.on('error', () => {
              eventsFired.push('error');
              if (events.length === 3) {
                done();
              }
            });

            newSample.save(null, { remote: true }).catch(() => {});
          });
      });
    });

    describe('occurrences with media', () => {
      before((done) => {
        storedCollection.destroy().then(() => done());
      });

      after((done) => {
        storedCollection.destroy().then(() => done());
      });

      it('should send both dataURI and absolute pathed images', (done) => {
        const image1 = new Media({
          data: 'https://wiki.ceh.ac.uk/download/attachments/119117334/ceh%20logo.png',
          type: 'png',
        });

        const image2 = new Media({
          data: 'data:media/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAolBMVEX///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBgYAAAAAAAAAAAAFBQUFBQUEBAQEBAQEBAQICAQEBAQEBwQHBwcHBwcHBwcHBwMHCgMGBgYKCgoGBgYJCQYJCQkJCQkICwgICAgICwgICwgICwgICwgICwgLDQtGnG0lAAAANnRSTlMAAQIDBAUGDQ4PEBEUFRobHB4gIiMkJigsLjAyMzk6PEFCRUZISUtMUFBRVFdZW1xcXV5fYGEIq40aAAAAj0lEQVQYGZ3B2RZCUAAF0CNEAyql0iiNaDCc//+1ZK2L7kMP7Y3fjL6Gb8oiIYvARItyIPMH+bTQ8Jl6HQzOTHQI6osuSlrMOQSLd1SW3ENweEVlxhBCj1kXHxtuUYu4Q2mY0UbNLnhynXXKEA01YeWoo7Eio8stmKDFzJkZkISkD4lDxiokU3IEmeKN8ac3/toPTnqnlzkAAAAASUVORK5CYII=',
          type: 'png',
        });

        const occurrence = new Occurrence({
          taxon: 1234,
        }, {
          media: [image1, image2],
        });

        const sample = getRandomSample(store, null, [occurrence]);
        generateSampleResponse(server, 'OK', sample);

        sample.save(null, { remote: true }).then(() => done());
      });
    });
  });
});
