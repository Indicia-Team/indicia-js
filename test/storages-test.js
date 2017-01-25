import helpers from '../src/helpers';
import Collection from '../src/Collection';
import Storage from '../src/Storage';

/* eslint-disable no-unused-expressions */

describe('Storage', () => {
  const storage = new Storage({});

  // clean up
  after((done) => {
    storage.clear().then(done);
  });

  beforeEach((done) => {
    storage.clear().then(done);
  });

  it('should have a cache', (done) => {
    expect(storage._cache).to.not.be.null;

    if (!storage.ready()) {
      storage.on('init', () => {
        expect(storage.ready()).to.be.true;
        expect(storage._cache).to.be.instanceOf(Collection);
        done();
      });
      return;
    }
    expect(storage._cache).to.be.instanceOf(Collection);
    done();
  });

  it('should return error if no id or cid has been passed', (done) => {
    storage.set(12345).catch((err) => {
      expect(err).to.be.an('object');
      done();
    });
  });

  it('should set get has', (done) => {
    const item = {
      cid: helpers.getNewUUID(),
    };

    storage.set(item)
      .then(() => storage.get(item))
      .then((data) => {
        expect(data instanceof storage.Sample).to.be.true;
        expect(data.cid).to.be.equal(item.cid);

        return storage.has(item);
      })
      .then((contains) => {
        expect(contains).to.be.true;
        done();
      });
  });

  it('should return promises', (done) => {
    const item = {
      cid: helpers.getNewUUID(),
    };

    storage.set(item)
      .then(() => {
        storage.get(item)
          .then((data) => {
            expect(data instanceof storage.Sample).to.be.true;
            expect(data.cid).to.be.equal(item.cid);
            storage.has(item)
              .then((contains) => {
                expect(contains).to.be.true;
                done();
              });
          });
      });
  });

  it('should size', (done) => {
    storage.size()
      .then((size) => {
        expect(size).to.be.equal(0);
        return storage.set({ cid: helpers.getNewUUID() });
      })
      .then(() => storage.size())
      .then((newSize) => {
        expect(newSize).to.be.equal(1);
        return storage.clear();
      })
      .then(() => storage.size())
      .then((finalSize) => {
        expect(finalSize).to.be.equal(0);
        done();
      });
  });

  it('should getAll', (done) => {
    storage.getAll()
      .then((allItems) => {
        const item = { cid: helpers.getNewUUID() };
        expect(allItems).to.be.an.object;
        return storage.set(item);
      })
      .then(() => storage.getAll())
      .then((newAllItems) => {
        storage.size().then((size) => {
          expect(size).to.be.equal(newAllItems.length);
          done();
        });
      });
  });

  it('should pass error object to on database error', (done) => {
    const item = {
      cid: helpers.getNewUUID(),
      corruptedAttribute: () => {
      },
    };

    storage.set(item).catch((setErr) => {
      expect(setErr).to.be.not.null;
      done();
    });
  });
});
