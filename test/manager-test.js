import Morel from '../src/main';
import Sample from '../src/Sample';
import syncTests from './sync';
import syncAllTests from './sync_all';

/* eslint-disable no-unused-expressions */

const options = {
  host: '',
  appname: 'test',
  appsecret: 'mytest',
  website_id: 23,
  survey_id: 42,
};

describe('Manager', () => {
  const manager = new Morel(options);

  // clean up
  after((done) => {
    manager.clear().then(done);
  });

  it('should have HOST passed through options', () => {
    const HOST = options.host;
    expect(manager.options.host).to.be.equal(HOST);
  });

  it('should set, get and has', (done) => {
    const sample = new Sample();
    const key = Date.now().toString();
    const value = Math.random();

    sample.set(key, value);

    manager.clear()
      .then(() => {
        return manager.set(sample);
      })
      .then(() => {
        manager.get(sample)
          .then((data) => {
            expect(data).to.be.instanceof(Sample);
            expect(sample.get(key)).to.be.equal(data.get(key));
          });

        manager.has(sample)
          .then((contains) => {
            expect(contains).to.be.true;
            manager.has(new Sample())
              .then((finalContains) => {
                expect(finalContains).to.be.false;
                done();
              });
          });
      })
      .catch((err) => {
        if (err) throw err.message;
      });
  });

  it('should return promises', (done) => {
    const sample = new Sample();
    const key = Date.now().toString();
    const value = Math.random();

    sample.set(key, value);

    manager.clear()
      .then(() => {
        manager.set(sample)
          .then(() => {
            manager.get(sample)
              .then((data) => {
                expect(data).to.be.instanceof(Sample);
                expect(sample.get(key)).to.be.equal(data.get(key));
              });

            manager.has(sample)
              .then((contains) => {
                expect(contains).to.be.true;
                manager.has(new Sample())
                  .then((finalContains) => {
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

    manager.clear()
      .then(() => {
        // add one
        return manager.set(sample);
      })
      .then(() => {
        // add two
        return manager.set(sample2)
      })
      .then(() => {
        return manager.has(sample);
      })
      .then((contains) => {
        expect(contains).to.be.true;

        // getall
        manager.getAll()
          .then((collection) => {
            expect(collection.length).to.be.equal(2);

            manager.clear()
              .then(() => {
                manager.has(sample)
                  .then((finalContains) => {
                    expect(finalContains).to.be.false;
                    done();
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
    syncTests(manager);
    syncAllTests(manager);
  });
});
