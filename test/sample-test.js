import Backbone from 'backbone';
import Store from '../src/Store';
import Media from '../src/Media';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import Collection from '../src/Collection';
import { getRandomSample, generateSampleResponse } from './helpers';
import { SYNCED } from '../src/constants';

/* eslint-disable no-unused-expressions */

describe('Sample', function tests() {
  this.timeout(10000);

  const storedCollection = new Collection(null, { model: Sample });
  const cleanUp = () =>
    storedCollection.fetch().then(() => storedCollection.destroy());

  before(cleanUp);
  beforeEach(cleanUp);
  after(cleanUp);
  afterEach(cleanUp);

  it('should be a Backbone model', () => {
    const sample = new Sample();

    expect(sample).to.be.instanceOf(Backbone.Model);
    expect(sample.cid).to.be.a.string;
    expect(sample.attributes).to.be.an.object;
  });

  it('should return JSON', () => {
    const occurrence = new Occurrence();
    const sample = new Sample();
    const subSample = new Sample();
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
    const sample = new Sample();
    expect(sample.metadata).to.be.an('object');
    expect(sample.metadata.created_on).to.be.instanceOf(Date);
    expect(sample.metadata.updated_on).to.be.instanceOf(Date);
  });

  it('should overwrite default metadata', () => {
    let sample = new Sample(null, {
      survey_id: 1,
    });
    expect(sample.metadata.survey_id).to.be.equal(1);

    sample = new Sample(null, {
      survey_id: 1,
      metadata: { survey_id: 2, created_on: 'x' },
    });
    expect(sample.metadata.survey_id).to.be.equal(2);
    expect(sample.metadata.created_on).to.be.equal('x');

    const NewSample = Sample.extend({
      metadata: { survey_id: 3, created_on: 'y' },
    });
    sample = new NewSample(null, {
      survey_id: 1,
    });
    expect(sample.metadata.survey_id).to.be.equal(3);
    expect(sample.metadata.created_on).to.be.equal('y');

    sample = new NewSample(null, {
      survey_id: 1,
      metadata: { survey_id: 2, created_on: 'x' },
    });
    expect(sample.metadata.survey_id).to.be.equal(2);
    expect(sample.metadata.created_on).to.be.equal('x');

    sample = new NewSample(null, {
      survey_id: 1,
      metadata: { survey_id: null, created_on: null },
    });
    expect(sample.metadata.survey_id).to.not.exist;
    expect(sample.metadata.created_on).to.not.exist;
  });

  it('should have default occurrences collection', () => {
    const sample = new Sample();
    expect(sample.occurrences).to.be.instanceOf(Backbone.Collection);
    expect(sample.occurrences.model).to.be.equal(Occurrence);
  });

  it('should have default samples collection', () => {
    const sample = new Sample();
    expect(sample.samples).to.be.instanceOf(Backbone.Collection);
    expect(sample.samples.model).to.be.equal(Sample);
  });

  it('should have default media collection', () => {
    const sample = new Sample();
    expect(sample.media).to.be.instanceOf(Backbone.Collection);
    expect(sample.media.model).to.be.equal(Media);
  });

  it('should have default store', () => {
    const sample = new Sample();
    expect(sample.store).to.be.an('object');
    expect(sample.store).to.be.instanceOf(Store);
  });

  // validation

  it('should have remote and local validators', () => {
    const sample = new Sample();
    expect(sample.validate).to.be.a('function');
    expect(sample.validateRemote).to.be.a('function');
  });

  it('should validate location, location type, date and occurrences', () => {
    const sample = new Sample();
    const subSample = new Sample();

    // location type
    delete sample.attributes.location_type;
    let allInvalids = sample.validate(null, { remote: true });
    let invalids = allInvalids.attributes;
    expect(invalids).to.be.an('object');
    expect(invalids.location).to.be.a('string');
    expect(invalids.location_type).to.be.a('string');

    // subsample
    sample.samples.set(subSample);
    allInvalids = sample.validate(null, { remote: true });
    invalids = allInvalids.attributes;
    expect(invalids.samples).to.be.undefined;

    // occurrence
    const occurrence = new Occurrence(); // no taxon
    subSample.occurrences.set(occurrence);
    sample.occurrences.set(occurrence);
    allInvalids = sample.validate(null, { remote: true });
    expect(allInvalids.samples[subSample.cid].occurrences).to.not.be.empty;
    expect(allInvalids.occurrences).to.not.be.empty;
  });

  // synchronisation

  describe('Sync', () => {
    it('should throw an error if sync with no store', done => {
      const sample = new Sample();
      delete sample.store;
      sample.save().catch(() => done());
    });

    describe('Local', () => {
      it('should save and fetch and update', done => {
        const sample = new Sample();

        sample.save({ hello: 'world!' }).then(model => {
          const cid = model.cid;

          expect(model).to.exist;
          expect(cid).to.exist;
          expect(model.get('hello')).to.be.equal('world!');

          // get direct from storage
          const sampleStored = new Sample(null, { cid });
          sampleStored.fetch().then(modelStored => {
            expect(sampleStored.get('hello')).to.be.equal('world!');
            expect(modelStored.get('hello')).to.be.equal('world!');
            done();
          });
        });
      });

      it('should destroy', done => {
        const sample = new Sample();

        sample.destroy().then(model => {
          const cid = model.cid;
          expect(cid).to.be.equal(sample.cid);

          // get direct from storage
          const sampleStored = new Sample(null, { cid });
          sampleStored.fetch().catch(() => done());
        });
      });

      it('should destroy submodels on sample destroy', done => {
        const media = new Media();
        sinon.spy(media, 'destroy');

        const occurrence = new Occurrence(null, {
          media: [media],
        });
        const sample = getRandomSample(null, null, [occurrence]);

        sample.destroy().then(() => {
          expect(media.destroy.calledOnce).to.be.true;
          media.destroy.restore();
          done();
        });
      });

      it('should fire model sync events', done => {
        const eventsFired = [];
        const sample = getRandomSample();

        sample.on('request', () => {
          eventsFired.push('request');
        });

        sample.on('sync', () => {
          eventsFired.push('sync');
        });

        sample.save().then(() => {
          // send an error
          delete sample.store;

          sample.on('error', () => {
            eventsFired.push('error');
            if (eventsFired.length === 3) {
              done();
            }
          });

          sample.save(null, { remote: true }).catch(() => {});
        });
      });

      it('should save parent on destroy', done => {
        const sample = getRandomSample();
        const sample2 = getRandomSample();
        sample.addSample(sample2);

        // add sample to local storage
        sample.save().then(() => {
          sample
            .getSample()
            .destroy()
            .then(() => {
              const newCollection = new Collection(null, { model: Sample });
              newCollection.fetch().then(() => {
                expect(newCollection.length).to.be.equal(1);
                const subsampleFromDB = newCollection.at(0).getSample();

                expect(subsampleFromDB).to.not.exist;
                expect(sample.samples.length).to.be.equal(0);
                done();
              });
            });
        });
      });

      it('should fire model sync events', done => {
        const events = ['request', 'sync', 'error'];
        const eventsFired = [];
        const sample = getRandomSample();

        sample.on('request', () => {
          eventsFired.push('request');
        });

        sample.on('sync', () => {
          eventsFired.push('sync');
        });

        sample.save().then(() => {
          // send an error
          const newSample = getRandomSample();

          newSample.on('error', () => {
            newSample.store.sync.restore();

            eventsFired.push('error');
            if (events.length === 3) {
              done();
            }
          });

          sinon
            .stub(newSample.store, 'sync')
            .returns(Promise.reject('Some problem'));

          newSample.save().catch(() => {});
        });
      });
    });

    describe('Remote', () => {
      let server;

      beforeEach(() => {
        server = sinon.fakeServer.create();
        server.respondImmediately = true;
        sinon.spy(Sample.prototype, '_syncRemote');
        sinon.spy(Sample.prototype, '_create');
      });

      afterEach(() => {
        server.restore();
        Sample.prototype._syncRemote.restore();
        Sample.prototype._create.restore();
      });

      it('should post with remote option', done => {
        const sample = getRandomSample();

        generateSampleResponse(server, 'OK', sample);
        const valid = sample.save(null, { remote: true }).then(() => {
          expect(sample._syncRemote.calledOnce).to.be.true;
          done();
        });

        expect(valid).to.be.instanceOf(Promise);
      });

      it('should pass on child models flags', done => {
        const sample = getRandomSample();
        const subSample = getRandomSample();

        sample.addSample(subSample);
        sample.metadata.training = true;
        sample.metadata.release_status = true;
        sample.metadata.record_status = true;
        sample.metadata.sensitive = true;
        sample.metadata.confidential = true;
        sample.metadata.sensitivity_precision = true;

        const spy = sinon.spy(sample, '_normaliseModelData');
        generateSampleResponse(server, 'OK', sample);

        sample.save(null, { remote: true }).then(() => {
          const occArgs = spy.args[0][0].occurrences[0];
          expect(occArgs.training).to.equal(true);
          expect(occArgs.release_status).to.equal(true);
          expect(occArgs.record_status).to.equal(true);
          expect(occArgs.sensitive).to.equal(true);
          expect(occArgs.confidential).to.equal(true);
          expect(occArgs.sensitivity_precision).to.equal(true);

          const smpOccArgs = spy.args[0][0].samples[0].occurrences[0];
          expect(smpOccArgs.training).to.equal(true);
          expect(smpOccArgs.release_status).to.equal(true);
          expect(smpOccArgs.record_status).to.equal(true);
          expect(smpOccArgs.sensitive).to.equal(true);
          expect(smpOccArgs.confidential).to.equal(true);
          expect(smpOccArgs.sensitivity_precision).to.equal(true);

          spy.restore();
          done();
        });
      });

      it('should send both dataURI and absolute pathed images', done => {
        const image1 = new Media({
          data:
            'https://wiki.ceh.ac.uk/download/attachments/119117334/ceh%20logo.png',
          type: 'png',
        });

        const image2 = new Media({
          data:
            'data:media/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAolBMVEX///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBgYAAAAAAAAAAAAFBQUFBQUEBAQEBAQEBAQICAQEBAQEBwQHBwcHBwcHBwcHBwMHCgMGBgYKCgoGBgYJCQYJCQkJCQkICwgICAgICwgICwgICwgICwgICwgLDQtGnG0lAAAANnRSTlMAAQIDBAUGDQ4PEBEUFRobHB4gIiMkJigsLjAyMzk6PEFCRUZISUtMUFBRVFdZW1xcXV5fYGEIq40aAAAAj0lEQVQYGZ3B2RZCUAAF0CNEAyql0iiNaDCc//+1ZK2L7kMP7Y3fjL6Gb8oiIYvARItyIPMH+bTQ8Jl6HQzOTHQI6osuSlrMOQSLd1SW3ENweEVlxhBCj1kXHxtuUYu4Q2mY0UbNLnhynXXKEA01YeWoo7Eio8stmKDFzJkZkISkD4lDxiokU3IEmeKN8ac3/toPTnqnlzkAAAAASUVORK5CYII=',
          type: 'png',
        });

        const occurrence = new Occurrence(
          {
            taxon: 1234,
          },
          {
            media: [image1, image2],
          }
        );

        const sample = getRandomSample(null, null, [occurrence]);
        generateSampleResponse(server, 'OK', sample);

        sample.save(null, { remote: true }).then(() => done());
      });

      it('should post with remote option (subsample)', done => {
        const subSample = getRandomSample();
        const sample = getRandomSample(null, [subSample]);

        generateSampleResponse(server, 'OK_SUBSAMPLE', sample);

        const valid = sample.save(null, { remote: true }).then(() => {
          expect(sample._syncRemote.calledOnce).to.be.true;
          done();
        });

        expect(valid).to.be.instanceOf(Promise);
      });

      it('should update remotely synced record', done => {
        const sample = getRandomSample();
        generateSampleResponse(server, 'OK', sample);

        sample
          .save(null, { remote: true })
          .then(() => sample.save())
          .then(() => {
            // get new storedCollection without cached samples
            const cid = sample.cid;
            const newSample = new Sample(null, { cid });
            newSample.fetch().then(() => {
              expect(newSample.getSyncStatus()).to.be.equal(SYNCED);
              done();
            });
          });
      });

      it('should validate before remote sending', () => {
        const occurrence = new Occurrence();
        const sample = new Sample(null, {
          occurrences: [occurrence],
        });

        const valid = sample.save(null, { remote: true });
        expect(valid).to.be.false;
      });

      it('should return error if unsuccessful remote sync', done => {
        const sample = getRandomSample();

        generateSampleResponse(server, 'ERR');

        const valid = sample.save(null, { remote: true }).catch(err => {
          expect(sample._syncRemote.calledOnce).to.be.true;
          expect(err.message).to.not.be.null;
          done();
        });

        expect(valid).to.be.instanceOf(Promise);
      });

      // todo: we should fix this eventually
      it('should ignore the duplication error', done => {
        const sample = getRandomSample();

        generateSampleResponse(server, 'DUPLICATE', sample);

        expect(sample.id).to.be.undefined;
        expect(sample.getOccurrence().id).to.be.undefined;

        sample.save(null, { remote: true }).then(() => {
          expect(sample.id).to.be.a('number');
          expect(sample.getOccurrence().id).to.be.a('number');
          expect(sample._syncRemote.calledOnce).to.be.true;
          done();
        });
      });

      it('should set synchronising flag on sample', done => {
        const sample = getRandomSample();
        generateSampleResponse(server, 'OK', sample);

        sample.save(null, { remote: true }).then(() => done());
        expect(sample.remote.synchronising).to.be.true;
      });

      it('should not double create the record', done => {
        const sample = getRandomSample();
        generateSampleResponse(server, 'OK', sample);

        sample.save(null, { remote: true }).then(() => {
          sample.save(null, { remote: true }).catch(() => {
            expect(sample._syncRemote.calledTwice).to.be.true;
            expect(sample._create.calledOnce).to.be.true;
            done();
          });
        });
      });

      it('should call onSend with the submission model if exists', done => {
        const sample = getRandomSample();

        let called = false;
        sample.onSend = (submission, media) => {
          called = true;
          expect(submission).to.be.an.object;
          expect(media).to.be.an.object;

          return Promise.resolve([submission, media]);
        };

        generateSampleResponse(server, 'OK', sample);

        sample.save(null, { remote: true }).then(() => {
          expect(called).to.be.true;
          done();
        });
      });

      // todo: should update

      it('should timeout', done => {
        server.respondImmediately = false;
        const clock = sinon.useFakeTimers();
        const errorCallback = sinon.spy();

        // hook onto exact time when ajax is called - it is all async in between
        const origCall = Backbone.$.ajax;
        const stub = sinon.stub(Backbone.$, 'ajax', (...args) => {
          stub.restore();
          origCall.apply(Backbone.$, args).catch((jqXHR, textStatus) => {
            expect(textStatus).to.be.equal('timeout');
            errorCallback();
          });
          clock.tick(29000);
          expect(errorCallback.calledOnce).to.be.false;
          clock.tick(2000);
          expect(errorCallback.calledOnce).to.be.true;
          done();
        });

        const sample = getRandomSample();

        sample.save(null, { remote: true }).catch(() => {
          done();
        });
        clock.tick(29000);
      });

      it('should fire model sync events', done => {
        const eventsFired = [];
        const sample = getRandomSample();

        sample.on('request:remote', () => {
          eventsFired.push('request:remote');
        });

        sample.on('sync:remote', () => {
          eventsFired.push('sync:remote');
        });

        generateSampleResponse(server, 'OK', sample);

        sample.save(null, { remote: true }).then(() => {
          // send an error
          const newSample = getRandomSample();
          generateSampleResponse(server, 'ERR');

          newSample.on('error:remote', () => {
            eventsFired.push('error:remote');
            if (eventsFired.length === 3) {
              done();
            }
          });

          newSample.save(null, { remote: true }).catch(() => {});
        });
      });

      describe('_getModelData method', () => {
        it('should have it', () => {
          const sample = getRandomSample();
          expect(sample._getModelData).to.be.a('function');
        });

        it('should should throw if no model passed', done => {
          const sample = getRandomSample();

          try {
            sample._getModelData();
          } catch (e) {
            done();
          }
        });

        it('should return a valid JSON string', done => {
          const sample = getRandomSample();
          const promise = sample._getModelData(sample).then(submission => {
            expect(submission).to.be.a('string');
            expect(JSON.parse(submission)).to.be.an.object;
            done();
          });
          expect(promise).to.be.instanceOf(Promise);
        });

        it('should return a formData with images', done => {
          const sample = getRandomSample();
          const image = new Media({ type: 'jpg', data: 'xxxx' });
          const image2 = new Media({ type: 'jpg', data: 'xxxx' });

          sample.addMedia(image2);
          sample.getOccurrence().addMedia(image);

          const promise = sample._getModelData(sample).then(data => {
            expect(data).to.be.instanceOf(FormData);

            // formData.get is not widely supported
            if (data.get) {
              expect(data.get(image.cid)).to.exist;
              expect(data.get(image2.cid)).to.exist;

              const submission = data.get('submission');
              expect(submission).to.exist;
              expect(JSON.parse(submission)).to.be.an.object;
            }

            done();
          });
          expect(promise).to.be.instanceOf(Promise);
        });
      });

      describe('_getSubmission', () => {
        it('should return attribute values', () => {
          const smp = new Sample({
            comment: 'huge',
            sample_method_id: 1234,
          });
          const submission = smp._getSubmission();

          expect(submission[0].fields.comment).to.be.equal('huge');
          expect(submission[0].fields.sample_method_id).to.be.equal(1234);
        });

        it('should return translate attribute keys and values if keys mapping is provided', () => {
          const keys = {
            size: {
              id: 'butterfly_size',
              values: {
                huge: 1,
              },
            },
          };
          const smp = new Sample(
            {
              size: 'huge',
            },
            { keys }
          );
          const submission = smp._getSubmission();

          expect(submission[0].fields.butterfly_size).to.be.equal(1);
        });

        it('should support attribute value arrays', () => {
          const keys = {
            colour: {
              id: 'butterfly_colour',
              values: {
                red: 1,
                green: 2,
                black: 3,
              },
            },
          };
          const smp = new Sample(
            {
              colour: ['red', 'green'],
            },
            { keys }
          );
          const submission = smp._getSubmission();

          expect(submission[0].fields.butterfly_colour).to.be.eql([1, 2]);
        });
      });
    });
  });
});
