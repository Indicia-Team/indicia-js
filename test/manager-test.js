import Morel from '../src/main';
import Sample from '../src/Sample';
import syncTests from './sync';
import syncAllTests from './sync_all';

/* eslint-disable no-unused-expressions */

const options = {
  host: '',
  api_key: 'mytest',
  website_id: 23,
  survey_id: 42,
};

describe('Manager', () => {
  const manager = new Morel(options);

  before((done) => {
    manager.clear().then(done);
  });

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
      .then(() => manager.set(sample))
      .then(() => manager.get(sample))
      .then((data) => {
        expect(data).to.be.instanceof(Sample);
        expect(sample.get(key)).to.be.equal(data.get(key));
      })
      .then(() => manager.has(sample))
      .then((contains) => {
        expect(contains).to.be.true;
        return manager.has(new Sample());
      })
      .then((finalContains) => {
        expect(finalContains).to.be.false;
        done();
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
      .then(() => manager.set(sample))
      .then(() => manager.set(sample2))
      .then(() => manager.has(sample))
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

    manager.clear()
      .then(() => manager.set(sample))
      .then(() => manager.has(sample))
      .then((contains) => {
        expect(contains).to.be.true;
        return manager.remove(sample);
      })
      .then(() => manager.has(sample))
      .then((finalContains) => {
        expect(finalContains).to.be.false;
        done();
      });
  });

  describe('Synchronisation', () => {
    syncTests(manager);
    syncAllTests(manager);
  });
});
