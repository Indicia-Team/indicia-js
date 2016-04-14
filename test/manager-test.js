import $ from 'jquery';
import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import DatabaseStorage from '../src/DatabaseStorage';

const options = {
  url: '/mobile/submit',
  appname: 'test',
  appsecret: 'mytest',
  website_id: 23,
  survey_id: 42,
};

function tests(manager) {
  it('should have URL passed through options', () => {
    const URL = options.url;
    expect(manager.options.url).to.be.equal(URL);
  });

  it('should set, get and has', (done) => {
    const sample = new Sample();
    const key = Date.now().toString();
    const value = Math.random();

    sample.set(key, value);

    manager.clear((err) => {
      if (err) throw err.message;

      manager.set(sample, (serErr) => {
        if (serErr) throw serErr.message;

        manager.get(sample, (getErr, data) => {
          if (getErr) throw getErr.message;

          expect(data).to.be.instanceof(Sample);
          expect(sample.get(key)).to.be.equal(data.get(key));
        });

        manager.has(sample, (hasErr, contains) => {
          if (hasErr) throw hasErr.message;

          expect(contains).to.be.true;
          manager.has(new Sample(), (finalHasErr, finalContains) => {
            if (finalHasErr) throw finalHasErr.message;

            expect(finalContains).to.be.false;
            done();
          });
        });
      });
    });
  });

  it('should getall and clear', (done) => {
    const sample = new Sample();
    const sample2 = new Sample();

    manager.clear((err) => {
      if (err) throw err.message;

      // add one
      manager.set(sample, (setErr) => {
        if (setErr) throw setErr.message;

        // add two
        manager.set(sample2, (setErr2) => {
          if (setErr2) throw setErr2.message;

          manager.has(sample, (hasErr, contains) => {
            if (hasErr) throw hasErr.message;
            expect(contains).to.be.true;

            // getall
            manager.getAll((getAllErr, collection) => {
              if (getAllErr) throw getAllErr.message;

              expect(collection.length).to.be.equal(2);

              manager.clear((clearErr) => {
                if (clearErr) throw clearErr.message;

                manager.has(sample, (finalHasErr, finalContains) => {
                  if (finalHasErr) throw finalHasErr.message;

                  expect(finalContains).to.be.false;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  it('should remove', (done) => {
    const sample = new Sample();

    manager.clear((err) => {
      if (err) throw err.message;

      manager.set(sample, (setErr) => {
        if (setErr) throw setErr.message;

        manager.has(sample, (hasErr, contains) => {
          if (hasErr) throw hasErr.message;

          expect(contains).to.be.true;

          manager.remove(sample, (removeErr) => {
            if (removeErr) throw removeErr.message;

            manager.has(sample, (finalHasErr, finalContains) => {
              if (finalHasErr) throw finalHasErr.message;

              expect(finalContains).to.be.false;
              done();
            });
          });
        });
      });
    });
  });


  describe('Synchronisation', () => {
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

    it('should return error if no manager', () => {
      const sample = new Sample();
      sample.save(null, {
        error: (err) => {
          expect(err).to.not.be.null;
        },
      });
    });

    it('should save locally', (done) => {
      const sample = getRandomSample();

      const valid = sample.save(null, {
        success: () => {
          expect(manager.sync.called).to.be.false;
          done();
        },
      });

      expect(valid).to.be.not.false;
    });

    it('should post with remote option', (done) => {
      const sample = getRandomSample();

      const valid = sample.save(null, {
        remote: true,
        success: () => {
          expect(manager.sync.calledOnce).to.be.true;
          done();
        },
      });

      expect(valid).to.be.an('object');

      server.respondWith('POST', '/mobile/submit', okResponse);
      server.respond();
    });

    it('should update remotely synced record', (done) => {
      const sample = getRandomSample();

      sample.save(null, {
        remote: true,
        success: () => {
          // get new manager without cached samples
          const Storage = manager.storage.Storage;
          const newManager = new Morel(_.extend(options, { Storage }));
          newManager.get(sample, (err, savedSample) => {
            expect(savedSample.getSyncStatus()).to.be.equal(Morel.SYNCED);
            done(err);
          });
        },
      });

      server.respondWith('POST', '/mobile/submit', okResponse);
      server.respond();
    });

    it('should validate before remote sending', () => {
      const occurrence = new Occurrence();
      const sample = new Sample(null, {
        occurrences: [occurrence],
        manager,
      });

      const valid = sample.save(null, { remote: true });
      expect(valid).to.be.false;
    });

    it('should return error if unsuccessful remote sync', (done) => {
      const sample = getRandomSample();

      const valid = sample.save(null, {
        remote: true,
        error: (model, xhr, errorThrown) => {
          expect(manager.sync.calledOnce).to.be.true;
          expect(errorThrown).to.not.be.null;
          done();
        },
      });

      expect(valid).to.be.an('object');

      server.respondWith('POST', '/mobile/submit', errResponse);
      server.respond();
    });

    it('should not double sync', (done) => {
      const sample = getRandomSample();

      let valid = sample.save(null, {
        remote: true,
        success: () => {
          expect(manager.sync.calledTwice).to.be.true;
          expect(Morel.prototype.post.calledOnce).to.be.true;
          done();
        },
      });

      expect(valid).to.be.an('object');

      valid = sample.save(null, {
        remote: true,
        // should not be called
        success: () => { expect(true).to.be.false; },
        error: () => { expect(true).to.be.false; },
      });

      expect(valid).to.be.false;

      server.respondWith('POST', '/mobile/submit', okResponse);
      server.respond();
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

describe('Manager', () => {
  const manager = new Morel(options);
  const databaseStorageManager = new Morel(_.extend(options, { Storage: DatabaseStorage }));

  // clean up
  after((done) => {
    manager.clear(() => {
      databaseStorageManager.clear(done);
    });
  });

  describe('(default)', () => {
    tests(manager);
  });

  describe('(database storage)', () => {
    tests(databaseStorageManager);
  });
});
