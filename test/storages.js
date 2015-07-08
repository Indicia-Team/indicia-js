describe('Storage:', function(storage){
    var tests = function (storage) {
        beforeEach(function () {
        });

        it('set get has', function(){
            var item = Date.now().toString(), value = Math.random();
            storage.clear(function(err) {
                storage.set(item, value, function (err, data) {

                    console.log(storage.NAME + ': ' + data);

                    storage.get(item, function (err, data) {
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
                storage.size(function (err, data) {
                    var item = Date.now().toString(), value = Math.random();
                    expect(data).to.be.equal(0);

                    storage.set(item, value, function (err, data) {
                        storage.size(function (err, data) {
                            expect(data).to.be.equal(1);

                            storage.clear(function () {
                                storage.size(function (err, data) {
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

                storage.getAll(function (err, data) {
                    var item = Date.now().toString(), value = Math.random();
                    expect(data).to.be.an.object;

                    storage.set(item, value, function (err, data) {
                        storage.getAll(function (err, data) {
                            var allItemsKeys = Object.keys(data);
                            storage.size(function (err, data) {
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