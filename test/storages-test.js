import helpers from '../src/helpers';
import Collection from '../src/Collection';
import Storage from '../src/Storage';

/* eslint-disable no-unused-expressions */

describe('Storage', () => {
  const storage = new Storage({ });

  // clean up
  after((done) => {
    storage.clear(done);
  });

  beforeEach((done) => {
    storage.clear(done);
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
    storage.set(12345, (err) => {
      expect(err).to.be.an('object');
      done();
    });
  });

  it('should set get has', (done) => {
    const item = {
      id: helpers.getNewUUID(),
    };

    storage.set(item, (setErr) => {
      if (setErr) throw setErr.message;

      storage.get(item, (getErr, data) => {
        if (getErr) throw getErr.message;

        expect(data instanceof storage.Sample).to.be.true;
        expect(data.id).to.be.equal(item.cid);

        storage.has(item, (hasErr, contains) => {
          expect(contains).to.be.true;
          done();
        });
      });
    });
  });

  it('should return promises', (done) => {
    const item = {
      id: helpers.getNewUUID(),
    };

    storage.set(item)
      .then(() => {
        storage.get(item)
          .then((data) => {
            expect(data instanceof storage.Sample).to.be.true;
            expect(data.id).to.be.equal(item.cid);
            storage.has(item)
              .then((contains) => {
                expect(contains).to.be.true;
                done();
              });
          });
      });
  });

  it('should size', (done) => {
    storage.size((sizeErr, size) => {
      if (sizeErr) throw sizeErr.message;

      const item = {
        id: helpers.getNewUUID(),
      };

      expect(size).to.be.equal(0);

      storage.set(item, (setErr) => {
        if (setErr) throw setErr.message;

        storage.size((newSizeErr, newSize) => {
          if (newSizeErr) throw newSizeErr.message;

          expect(newSize).to.be.equal(1);
          storage.clear((clearErr) => {
            if (clearErr) throw clearErr.message;

            storage.size((finalSizeErr, finalSize) => {
              if (finalSizeErr) throw finalSizeErr.message;

              expect(finalSize).to.be.equal(0);
              done();
            });
          });
        });
      });
    });
  });

  it('should getAll', (done) => {
    storage.getAll((getAllErr, allItems) => {
      if (getAllErr) throw getAllErr.message;

      const item = {
        id: helpers.getNewUUID(),
      };
      expect(allItems).to.be.an.object;

      storage.set(item, (setErr) => {
        if (setErr) throw setErr.message;

        storage.getAll((finalGetAllErr, newAllItems) => {
          if (finalGetAllErr) throw finalGetAllErr.message;

          storage.size((sizeErr, size) => {
            if (sizeErr) throw sizeErr.message;

            expect(size).to.be.equal(newAllItems.length);
            done();
          });
        });
      });
    });
  });

  it('should pass error object to on database error', (done) => {
    const item = {
      id: helpers.getNewUUID(),
      corruptedAttribute: () => {},
    };

    storage.set(item, (setErr) => {
      expect(setErr).to.be.not.null;
      done();
    });
  });
});
