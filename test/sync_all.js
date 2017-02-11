import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import serverResponses from './server_responses.js';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';

/* eslint-disable no-unused-expressions */
const SAMPLE_POST_URL = API_BASE + API_VER + API_SAMPLES_PATH;

export default function (recordStorage) {
  describe('Sync All', () => {
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


    it('should return a promise', () => {
      const promise = recordStorage.syncAll();
      expect(promise.then).to.be.a.function;
    });

    it('should post all', (done) => {
      recordStorage.getAll()
        .then((models) => {
          // check if collection is empty
          expect(models.length).to.be.equal(0);

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
              expect(models.length).to.be.equal(2);
              // synchronise collection
              return recordStorage.syncAll();
            })
            .then(() => {
              expect(recordStorage.sync.calledOnce).to.be.true;

              // check sample status
              models.each((model) => {
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
    });

    it('should not double sync all', (done) => {
      // add two valid samples
      const sample = getRandomSample();
      generateSampleResponse(sample);

      generateSampleResponse(sample);
      Promise.all([sample.save()])
        .then(() => {
          // synchronise collection twice
          Promise.all([recordStorage.syncAll(), recordStorage.syncAll()])
            .then(() => {
              expect(recordStorage.sync.callCount).to.be.equal(2);
              expect(Morel.Storage.prototype.post.calledOnce).to.be.true;
              done();
            });
        });
    });
  });
}
