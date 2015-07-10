describe('Storage:', function(storage){
    var tests = function (storage) {
        beforeEach(function () {
        });

        it('set get has', function(){
            var item = Date.now().toString(), value = Math.random();
            storage.clear(function(err) {
                if (err) throw err.message;

                storage.set(item, value, function (err, data) {
                    if (err) throw err.message;

                    storage.get(item, function (err, data) {
                        if (err) throw err.message;

                        expect(data).to.be.equal(value);

                        storage.has(item, function (err, data) {
                            expect(data).to.be.number;
                        })
                    });
                });
            });
        });

        it('size, clear', function () {
            storage.clear(function(err) {
                if (err) throw err.message;

                storage.size(function (err, data) {
                    if (err) throw err.message;

                    var item = Date.now().toString(), value = Math.random();
                    expect(data).to.be.equal(0);

                    storage.set(item, value, function (err, data) {
                        if (err) throw err.message;

                        storage.size(function (err, data) {
                            if (err) throw err.message;

                            expect(data).to.be.equal(1);
                            storage.clear(function (err) {
                                if (err) throw err.message;

                                storage.size(function (err, data) {
                                    if (err) throw err.message;

                                    expect(data).to.be.equal(0);
                                })
                            });
                        });
                    });
                })
            });
        });

        it('getAll', function(){
            storage.clear(function(err) {
                if (err) throw err.message;

                storage.getAll(function (err, data) {
                    if (err) throw err.message;

                    var item = Date.now().toString(), value = Math.random();
                    expect(data).to.be.an.object;

                    storage.set(item, value, function (err, data) {
                        if (err) throw err.message;

                        storage.getAll(function (err, data) {
                            if (err) throw err.message;

                            var allItemsKeys = Object.keys(data);
                            storage.size(function (err, data) {
                                if (err) throw err.message;

                                expect(allItemsKeys.length).to.be.equal(data);
                            })
                        });
                    });
                })
            });
        });
    };

    tests(new morel.Storage());
    tests(new morel.LocalStorage());
    tests(new morel.DatabaseStorage());
});