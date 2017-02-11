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
  user: 'x',
  password: 'x',
};

describe('RecordStorage', () => {
  const recordStorage = new Morel.Storage(options);

  before((done) => {
    recordStorage.clear().then(done);
  });

  // clean up
  after((done) => {
    recordStorage.clear().then(done);
  });

  it('should have HOST passed through options', () => {
    const HOST = options.host;
    expect(recordStorage.options.host).to.be.equal(HOST);
  });

  it('should set, get and has', (done) => {
    const sample = new Sample();
    const key = Date.now().toString();
    const value = Math.random();

    sample.set(key, value);

    recordStorage.clear()
      .then(() => recordStorage.save(sample))
      .then(() => recordStorage.get(sample))
      .then((data) => {
        expect(data).to.be.instanceof(Sample);
        expect(sample.get(key)).to.be.equal(data.get(key));
      })
      .then(() => recordStorage.has(sample))
      .then((contains) => {
        expect(contains).to.be.true;
        return recordStorage.has(new Sample());
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

    recordStorage.clear()
      .then(() => {
        recordStorage.save(sample)
          .then(() => {
            recordStorage.get(sample)
              .then((data) => {
                expect(data).to.be.instanceof(Sample);
                expect(sample.get(key)).to.be.equal(data.get(key));
              });

            recordStorage.has(sample)
              .then((contains) => {
                expect(contains).to.be.true;
                recordStorage.has(new Sample())
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

    recordStorage.clear()
      .then(() => recordStorage.save(sample))
      .then(() => recordStorage.save(sample2))
      .then(() => recordStorage.has(sample))
      .then((contains) => {
        expect(contains).to.be.true;

        // getall
        recordStorage.getAll()
          .then((collection) => {
            expect(collection.length).to.be.equal(2);

            recordStorage.clear()
              .then(() => {
                recordStorage.has(sample)
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

    recordStorage.clear()
      .then(() => recordStorage.save(sample))
      .then(() => recordStorage.has(sample))
      .then((contains) => {
        expect(contains).to.be.true;
        return recordStorage.remove(sample);
      })
      .then(() => recordStorage.has(sample))
      .then((finalContains) => {
        expect(finalContains).to.be.false;
        done();
      });
  });

  describe('Synchronisation', () => {
    syncTests(recordStorage);
    syncAllTests(recordStorage);
  });
});
