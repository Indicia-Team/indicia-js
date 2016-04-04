import helpers from '../src/helpers';
import Collection from '../src/Collection';
import Storage from '../src/Storage';
import PlainStorage from '../src/PlainStorage';
import DatabaseStorage from '../src/DatabaseStorage';
import LocalStorage from '../src/LocalStorage';

function tests(storage) {
  it('should have a cache', (done) => {
    expect(storage.cache).to.not.be.null;

    if (!storage.initialized) {
      storage.on('init', () => {
        expect(storage.initialized).to.be.true;
        expect(storage.cache).to.be.instanceOf(Collection);
        done();
      });
      return;
    }
    expect(storage.cache).to.be.instanceOf(Collection);
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

    storage.clear((err) => {
      if (err) throw err.message;

      storage.set(item, (setErr) => {
        if (setErr) throw setErr.message;

        storage.get(item, (getErr, data) => {
          if (getErr) throw getErr.message;

          expect(data.id).to.be.equal(item.id);

          storage.has(item, (hasErr, contains) => {
            expect(contains).to.be.true;
            done();
          });
        });
      });
    });
  });

  it('should size, clear', (done) => {
    storage.clear((err) => {
      if (err) throw err.message;

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
  });

  it('should getAll', (done) => {
    storage.clear((err) => {
      if (err) throw err.message;

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
  });
}

describe('Storage', () => {
  const storage = new Storage({ Storage: PlainStorage });
  const localStorage = new Storage({ Storage: LocalStorage });
  const databaseStorage = new Storage({ Storage: DatabaseStorage });

  // clean up
  after((done) => {
    storage.clear(() => {
      localStorage.clear(() => {
        databaseStorage.clear(done);
      });
    });
  });

  describe('(plain)', () => {
    tests(storage);
  });
  describe('(local)', () => {
    tests(localStorage);
  });
  describe('(database)', () => {
    tests(databaseStorage);
  });
});
