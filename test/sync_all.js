import $ from 'jquery';
import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';

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
    it('should return a promise and use callbacks', (done) => {
      const promise = manager.syncAll(null, null, {
        success: () => {
          done();
        },
      });

      expect(promise.then).to.be.a.function;
    });

    it('should post all', (done) => {
      manager.getAll((err, models) => {
        // check if collection is empty
        expect(models.length).to.be.equal(0);

        // add two valid samples
        const sample = getRandomSample();
        const sample2 = getRandomSample();
        const sample3 = getRandomSample();
        _.each(_.clone(sample3.occurrences.models), (model) => {
          model.destroy({ noSave: true });
        });

        server.respondWith('POST', '/mobile/submit', okResponse);
        $.when(sample.save(), sample2.save(), sample3.save())
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
            server.respond();
          });
      });
    });

    it('should not double sync all', (done) => {
      // add two valid samples
      const sample = getRandomSample();
      const sample2 = getRandomSample();

      server.respondWith('POST', '/mobile/submit', okResponse);
      $.when(sample.save(), sample2.save())
        .then(() => {
          // synchronise collection twice
          $.when(manager.syncAll(), manager.syncAll())
            .then(() => {
              expect(manager.sync.callCount).to.be.equal(4);
              expect(Morel.prototype.post.calledTwice).to.be.true;
              done();
            });

          server.respond();
        });
    });
  });
}
