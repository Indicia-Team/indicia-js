var URL = 'http://192.171.199.230/irecord7/mobile/submit',
    APPNAME = 'test',
    APPSECRET = 'mytest',
    WEBSITE_ID= 23,
    SURVEY_ID = 42,

    options = {
        url: URL,
        appname: APPNAME,
        appsecret: APPSECRET,
        website_id: WEBSITE_ID,
        survey_id: SURVEY_ID
    },
    manager = null;

var tests = function (manager, callback) {
    describe('Manager', function () {
            after(callback);

            it('new', function () {
                expect(manager.conf.url).to.be.equal(URL);
            });

            it('set get has', function () {
                var sample = new morel.Sample(),
                    key = Date.now().toString(),
                    value = Math.random();

                sample.set(key, value);

                manager.clear(function (err) {
                    if (err) throw err.message;

                    manager.set(sample, function (err) {
                        if (err) throw err.message;
                        manager.get(sample, function (err, data) {
                            if (err) throw err.message;

                            expect(data instanceof morel.Sample).to.be.true;
                            expect(sample.get(key)).to.be.equal(data.get(key));
                        });

                        manager.has(sample, function (err, data) {
                            if (err) throw err.message;

                            expect(data).to.be.true;
                            manager.has(new morel.Sample(), function (err, data) {
                                expect(data).to.be.false;
                            });
                        });

                    });
                });
            });

            it('getall clear', function () {
                var sample = new morel.Sample(),
                    sample2 = new morel.Sample();

                manager.clear(function (err) {
                    if (err) throw err.message;

                    //add one
                    manager.set(sample, function (err) {
                        if (err) throw err.message;

                        //add two
                        manager.set(sample2, function (err) {
                            if (err) throw err.message;

                            manager.has(sample, function (err, data) {
                                if (err) throw err.message;
                                expect(data).to.be.true;

                                //getall
                                manager.getAll(function (err, data) {
                                    expect(Object.keys(data).length).to.be.equal(2);

                                    manager.clear(function (err, data) {
                                        manager.has(sample, function (err, data) {
                                            expect(data).to.be.false;
                                        });
                                    })
                                });
                            });
                        });
                    });
                });
            });


            it('remove', function () {
                var sample = new morel.Sample();

                manager.clear(function (err) {
                    if (err) throw err.message;

                    manager.set(sample, function (err) {
                        if (err) throw err.message;

                        manager.has(sample, function (err, data) {
                            if (err) throw err.message;

                            expect(data).to.be.true;

                            manager.remove(sample, function (err) {
                                manager.has(sample, function (err, data) {
                                    expect(data).to.be.false;
                                });
                            });
                        });

                    });
                });
            });
            //sync
            //syncAll
    });
};

manager = new morel.Manager(options);
tests(manager, function () {
    manager = new morel.Manager(morel.extend(options, {Storage: morel.Storage}));
    tests(manager, function () {
        manager = new morel.Manager(morel.extend(options, {Storage: morel.DatabaseStorage}));
        tests(manager, function () {});
    });
});


//
//describe('authentication', function(){
//    beforeEach(function(){
//        morel.auth.removeUser()
//    });
//    afterEach(function(){});
//
//    /**
//     * morel.auth.CONF
//     * morel.auth.removeUser();
//     * morel.auth.setUser(user);
//     * morel.auth.isUser();
//     */
//    it('main', function(){
//        //CONF
//        expect(morel.auth.CONF).to.be.object;
//
//        //SET
//        var user = {
//            'name': 'Tom',
//            'surname': 'Jules',
//            'email': 'tom@jules.com',
//            'usersecret': Math.random()
//        };
//        morel.auth.setUser(user);
//        var f_user = morel.auth.getUser();
//        expect(f_user).to.be.an.object;
//        expect(f_user).to.have.property('name', 'Tom');
//
//        //IS
//        var exists = morel.auth.isUser();
//        expect(exists).to.be.true;
//
//        //REMOVE
//        morel.auth.removeUser();
//        exists = morel.auth.isUser();
//        expect(exists).to.be.false;
//
//        f_user = morel.auth.getUser();
//        expect(f_user).not.to.be.null;
//
//        //checking if getting a user hasn't initialised one
//        exists = morel.auth.isUser();
//        expect(exists).to.be.false;
//
//    });
//});
//
//describe('geoloc', function(){
//    beforeEach(function(){
//        morel.geoloc.clear();
//    });
//    afterEach(function(){});
//
//    /**
//     * morel.geoloc.set()
//     * morel.geoloc.get()
//     * -morel.geoloc.start()
//     * -morel.geoloc.validate()
//     */
//    it('main', function(){
//        //SET
//        var location = {
//            'lat' : Math.random(),
//            'lon' : Math.random(),
//            'acc' : Math.random()
//        };
//        morel.geoloc.set(location.lat, location.lon, location.acc);
//
//        //GET
//        var f_location = morel.geoloc.get();
//
//        expect(f_location).to.be.an.object;
//        expect(f_location.lat).to.be.equal(location.lat);
//        expect(f_location.lon).to.be.equal(location.lon);
//        expect(f_location.acc).to.be.equal(location.acc);
//
//        //VALIDATE
//        morel.geoloc.CONF.GPS_ACCURACY_LIMIT = 0;
//        var valid = morel.geoloc.valid();
//        expect(valid).to.be.equal(morel.FALSE);
//
//        var acc = Math.random();
//        morel.geoloc.set(location.lat, location.lon, acc);
//
//        morel.geoloc.CONF.GPS_ACCURACY_LIMIT = acc + 1;
//        valid = morel.geoloc.valid();
//        expect(valid).to.be.equal(morel.TRUE);
//
//    });
//});
//
//describe('io', function(){
//    beforeEach(function(){});
//    afterEach(function(){});
//
//    /**
//     * -morel.io.sendSavedForm()
//     * -morel.io.sendAllSavedRecords()
//     * -morel.io.sendSavedRecord(savedRecordId)
//     */
//    it('main', function(){
//
//    });
//});
