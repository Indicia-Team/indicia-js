import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';

/* eslint-disable no-unused-expressions */
const SAMPLE_POST_URL = API_BASE + API_VER + API_SAMPLES_PATH;

export default function (manager) {
  describe('Sync All', () => {
    let server;

    const okResponse = [200, { 'Content-Type': 'text/html' }, ''];
    const errResponse = [502, { 'Content-Type': 'text/html' }, ''];

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

    before(() => {
      server = sinon.fakeServer.create();
      server.respondImmediately = true;
    });

    beforeEach(() => {
      sinon.spy(manager, 'sync');
      sinon.spy(Morel.prototype, 'post');
    });

    after(() => {
      server.restore();
    });

    afterEach((done) => {
      Morel.prototype.post.restore();
      manager.sync.restore();
      manager.clear(done);
    });


    it('should return a promise', (done) => {
      let finished = false;
      const promise = manager.syncAll().then(() => {
        if (finished) done();
        finished = true;
      });

      expect(promise.then).to.be.a.function;
    });

    it('should post all', (done) => {
      server.respondWith('POST', SAMPLE_POST_URL, okResponse);

      manager.getAll((err, models) => {
        // check if collection is empty
        expect(models.length).to.be.equal(0);

        // add two valid samples
        const sample = getRandomSample();
        const sample2 = getRandomSample();
        const sample3 = getRandomSample();

        // delete occurrences for the sample to become invalid to sync
        _.each(_.clone(sample3.occurrences.models), (model) => {
          model.destroy({ noSave: true });
        });

        Promise.all([sample.save(), sample2.save(), sample3.save()])
          .then(() => {
            expect(models.length).to.be.equal(3);
            // synchronise collection
            manager.syncAll()
              .then(() => {
                expect(manager.sync.calledTwice).to.be.true;

                // check sample status
                models.each((model) => {
                  const status = model.getSyncStatus();
                  if (model.cid === sample3.cid) {
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
    });

    it('should not double sync all', (done) => {
      // add two valid samples
      const sample = getRandomSample();
      const sample2 = getRandomSample();

      server.respondWith('POST', SAMPLE_POST_URL, okResponse);
      Promise.all([sample.save(), sample2.save()])
        .then(() => {
          // synchronise collection twice
          Promise.all([manager.syncAll(), manager.syncAll()])
            .then(() => {
              expect(manager.sync.callCount).to.be.equal(4);
              expect(Morel.prototype.post.calledTwice).to.be.true;
              done();
            });
        });
    });
  });
}
