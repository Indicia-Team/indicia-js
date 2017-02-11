import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import ImageModel from '../src/Media';
import serverResponses from './server_responses.js';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';

/* eslint-disable no-unused-expressions */
const SAMPLE_POST_URL = API_BASE + API_VER + API_SAMPLES_PATH;
const options = {
  host: SAMPLE_POST_URL,
  api_key: 'mytest',
  website_id: 23,
  survey_id: 42,
  user: 'x',
  password: 'x',
};

export default function (recordStorage) {
  describe('Sync', () => {
    let server;

    function generateSampleResponse(sample) {
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses('OK', {
            cid: sample.cid,
            occurrence_cid: sample.occurrences.at(0).cid,
          },
        ),
      );
    }

    function getRandomSample() {
      const occurrence = new Occurrence({
        taxon: 1234,
      });
      const sample = new Sample({
        location: ' 12.12, -0.23',
      }, {
        occurrences: [occurrence],
        recordStorage,
      });

      return sample;
    }

    before((done) => {
      server = sinon.fakeServer.create();
      server.respondImmediately = true;
      recordStorage.clear().then(done);
    });

    beforeEach(() => {
      sinon.spy(recordStorage, 'sync');
      sinon.spy(Morel.Storage.prototype, 'post');
    });

    after((done) => {
      server.restore();
      recordStorage.clear().then(done);
    });

    afterEach((done) => {
      Morel.Storage.prototype.post.restore();
      recordStorage.sync.restore();
      recordStorage.clear().then(done);
    });

    it('should return false if no recordStorage', () => {
      const sample = new Sample();
      const promise = sample.save();
      expect(promise).to.be.false;
    });

    it('should save locally', (done) => {
      const sample = getRandomSample();

      const valid = sample.save().then(() => {
        expect(recordStorage.sync.called).to.be.false;
        done();
      });

      expect(valid).to.be.not.false;
    });

    it('should post with remote option', (done) => {
      const sample = getRandomSample();

      generateSampleResponse(sample);
      const valid = sample.save({ remote: true }).then(() => {
        expect(recordStorage.sync.calledOnce).to.be.true;
        done();
      });

      expect(valid).to.be.instanceOf(Promise);
    });

    it('should post with remote option (subsample)', (done) => {
      const occurrence = new Occurrence({
        taxon: 1234,
      });
      const subSample = new Sample({
          location: ' 12.12, -0.23',
        },
        {
          occurrences: [occurrence],
        },
      );

      const sample = new Sample({
        location: ' 12.12, -0.23',
      }, {
        samples: [subSample],
        recordStorage,
      });

      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses('OK_SUBSAMPLE', {
            cid: sample.cid,
            subsample_cid: subSample.cid,
            occurrence_cid: subSample.occurrences.at(0).cid,
          },
        ),
      );

      const valid = sample.save({ remote: true }).then(() => {
        expect(recordStorage.sync.calledOnce).to.be.true;
        done();
      });

      expect(valid).to.be.instanceOf(Promise);
    });

    it('should update remotely synced record', (done) => {
      const sample = getRandomSample();
      generateSampleResponse(sample);

      sample.save({ remote: true }).then(() => {
        // get new recordStorage without cached samples
        const newRecordStorage = new Morel.Storage(_.extend(options));
        newRecordStorage.get(sample)
          .then((savedSample) => {
            expect(savedSample.getSyncStatus()).to.be.equal(Morel.SYNCED);
            done();
          });
      });
    });

    it('should validate before remote sending', () => {
      const occurrence = new Occurrence();
      const sample = new Sample(null, {
        occurrences: [occurrence],
        recordStorage,
      });

      const valid = sample.save({ remote: true });
      expect(valid).to.be.false;
    });

    it('should return error if unsuccessful remote sync', (done) => {
      server.respondWith('POST', SAMPLE_POST_URL, serverResponses('err'));
      const sample = getRandomSample();

      const valid = sample.save({ remote: true })
        .catch((err) => {
          expect(recordStorage.sync.calledOnce).to.be.true;
          expect(err.message).to.not.be.null;
          done();
        });

      expect(valid).to.be.instanceOf(Promise);
    });

    // todo: we should fix this eventually
    it('should ignore the duplication error', (done) => {
      const sample = getRandomSample();
      server.respondWith('POST',
        SAMPLE_POST_URL,
        serverResponses('duplicate', { cid: sample.occurrences.at(0).cid },
        ),
      );
      expect(sample.id).to.be.undefined;
      expect(sample.occurrences.at(0).id).to.be.undefined;

      sample.save({ remote: true })
        .then(() => {
          expect(sample.id).to.be.a('number');
          expect(sample.occurrences.at(0).id).to.be.a('number');
          expect(recordStorage.sync.calledOnce).to.be.true;
          done();
        });
    });

    it('should set synchronising flag on sample', () => {
      const sample = getRandomSample();

      sample.save({ remote: true });
      expect(sample.synchronising).to.be.true;
    });


    it('should not double sync', (done) => {
      const sample = getRandomSample();
      generateSampleResponse(sample);

      const valid = sample.save({ remote: true }).then(() => {
        const newValid = sample.save({ remote: true });

        expect(newValid).to.be.false;
        expect(recordStorage.sync.calledTwice).to.be.true;
        expect(Morel.Storage.prototype.post.calledOnce).to.be.true;
        done();
      });

      expect(valid).to.be.instanceOf(Promise);
    });

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
    //   const sample = getRandomSample();
    //
    //   sample.save(null, { remote: true }).catch(() => {
    //     done();
    //   });
    //   clock.tick(29000);
    // });

    // it('should fire model sync events', (done) => {
    //   const events = ['sync', 'request', 'error'];
    //   const sample = getRandomSample();
    //
    //   recordStorage.save(sample, () => {
    //     recordStorage.on(events.join(' '), () => {
    //       events.pop();
    //       if (!events.length) done();
    //     });
    //
    //     sample.trigger('sync');
    //     sample.trigger('request');
    //     sample.trigger('error');
    //   });
    // });

    describe('occurrences with media', () => {
      before((done) => {
        recordStorage.clear().then(done);
      });

      after((done) => {
        recordStorage.clear().then(done);
      });

      it('should send both dataURI and absolute pathed images', (done) => {
        const image1 = new ImageModel({
          data: 'https://wiki.ceh.ac.uk/download/attachments/119117334/ceh%20logo.png',
          type: 'png',
        });

        const image2 = new ImageModel({
          data: 'data:media/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAolBMVEX///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBgYAAAAAAAAAAAAFBQUFBQUEBAQEBAQEBAQICAQEBAQEBwQHBwcHBwcHBwcHBwMHCgMGBgYKCgoGBgYJCQYJCQkJCQkICwgICAgICwgICwgICwgICwgICwgLDQtGnG0lAAAANnRSTlMAAQIDBAUGDQ4PEBEUFRobHB4gIiMkJigsLjAyMzk6PEFCRUZISUtMUFBRVFdZW1xcXV5fYGEIq40aAAAAj0lEQVQYGZ3B2RZCUAAF0CNEAyql0iiNaDCc//+1ZK2L7kMP7Y3fjL6Gb8oiIYvARItyIPMH+bTQ8Jl6HQzOTHQI6osuSlrMOQSLd1SW3ENweEVlxhBCj1kXHxtuUYu4Q2mY0UbNLnhynXXKEA01YeWoo7Eio8stmKDFzJkZkISkD4lDxiokU3IEmeKN8ac3/toPTnqnlzkAAAAASUVORK5CYII=',
          type: 'png',
        });

        const occurrence = new Occurrence({
          taxon: 1234,
        }, {
          media: [image1, image2],
        });
        const sample = new Sample({
          location: ' 12.12, -0.23',
        }, {
          occurrences: [occurrence],
          recordStorage,
        });
        generateSampleResponse(sample);

        sample.save({ remote: true }).then(() => done());
      });
    });
  });
}
