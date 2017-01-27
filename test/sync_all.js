import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import serverResponses from './server_responses.js';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';

/* eslint-disable no-unused-expressions */
const SAMPLE_POST_URL = API_BASE + API_VER + API_SAMPLES_PATH;

export default function (manager) {
  describe('Sync All', () => {
    let server;

    function generateSampleResponse(sample) {
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses('OK', {
            cid: sample.cid,
            submodel_cid: sample.occurrences.at(0).cid,
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
        manager,
      });

      return sample;
    }

    before((done) => {
      server = sinon.fakeServer.create();
      server.respondImmediately = true;
      manager.clear().then(done);
    });

    beforeEach(() => {
      sinon.spy(manager, 'sync');
      sinon.spy(Morel.prototype, 'post');
    });

    after((done) => {
      server.restore();
      manager.clear().then(done);
    });

    afterEach((done) => {
      Morel.prototype.post.restore();
      manager.sync.restore();
      manager.clear().then(done);
    });


    it('should return a promise', () => {
      const promise = manager.syncAll();
      expect(promise.then).to.be.a.function;
    });

    it('should post all', (done) => {
      manager.getAll()
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
              return manager.syncAll();
            })
            .then(() => {
              expect(manager.sync.calledOnce).to.be.true;

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
          Promise.all([manager.syncAll(), manager.syncAll()])
            .then(() => {
              expect(manager.sync.callCount).to.be.equal(2);
              expect(Morel.prototype.post.calledOnce).to.be.true;
              done();
            });
        });
    });
  });
}
