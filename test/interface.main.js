/**
 * Interface testing functions.
 *
 * Until the code is fully covered in tests, it is the most important to
 * test the library functions/interface that the mobile apps directly call.
 */

describe('app interface', function(){

    /**
     * Testing:
     app
     app.CONF
     app.TRUE
     app.ERROR
     app.LOG_*

     app.data
     app.settings
     */
    it('main', function(){
        expect(app).to.exist;
        expect(app.CONF).to.exist;
        expect(app.TRUE).to.exist;
        expect(app.ERROR).to.exist;
        expect(app.LOG_NONE).to.exist;
        expect(app.LOG_ERROR).to.exist;
        expect(app.LOG_WARNING).to.exist;
        expect(app.LOG_INFO).to.exist;
        expect(app.LOG_DEBUG).to.exist;
        expect(app.data).to.exist;
        expect(app.settings).to.exist;
    })
});

describe('record interface', function(){
    beforeEach(function(){
        app.storage.clear();
        app.record.clear();
    });
    afterEach(function(){

    });

    /**
     * Testing:
     -app.record.validate()
     app.record.clear()
     */
    it('main', function(){
        //CLEAR
        var input = 'input';
        var input_data = Math.random();
        app.record.inputs.set(input, input_data);

        var record = app.record.get();
        expect(record).to.be.an.object;
        var record_keys = Object.keys(record);
        expect(record_keys.length).to.be.equal(1);

        app.record.clear();

        record = app.record.get();
        expect(record).to.be.an.object;
        record_keys = Object.keys(record);
        expect(record_keys.length).to.be.equal(0);

    });

    /**
     * Testing:
     app.record.db.remove(savedRecordId)
     app.record.db.save(onSaveSuccess);
     +app.record.db.getAll()
     */
    it('storage', function(){
        //SAVE
        var input = 'input';
        var input_data = Math.random();
        app.record.inputs.set(input, input_data);

        app.record.db.save(function(savedRecordId){
            //GETALL
            app.record.db.getAll(function(records){
                expect(records).to.be.an.array;
                expect(records.length).to.be.equal(1);
                expect(records[0][0].value).to.be.equal(input_data);

                expect(savedRecordId).to.be.equal(1);

                //REMOVE
                app.record.db.remove(savedRecordId);
                app.record.db.getAll(function(records){
                    expect(records).to.be.an.array;
                    expect(records.length).to.be.equal(0);
                });

            });

        });
    });

    /** Testing:
     app.record.inputs.KEYS.*
     app.record.inputs.set(input, data)
     app.record.inputs.is(input)
     */
    it('inputs', function(){
        //KEYS
        expect(app.record.inputs.KEYS).to.be.array;

        //SET
        var input = 'input';
        var input_data = Math.random();

        app.record.inputs.set(input, input_data);
        var f_input_data = app.record.inputs.get(input);
        expect(f_input_data).to.equal(input_data);

        //IS
        var exist = app.record.inputs.is(input);
        expect(exist).to.be.true;
    });
});


describe('authentication interface', function(){
    beforeEach(function(){
        app.auth.removeUser()
    });
    afterEach(function(){});

    /**
     * Testing:
     app.auth.CONF
     app.auth.removeUser();
     app.auth.setUser(user);
     app.auth.isUser();
     */
    it('main', function(){
        //CONF
        expect(app.auth.CONF).to.be.object;

        //SET
        var user = {
            'name': 'Tom',
            'surname': 'Jules',
            'email': 'tom@jules.com',
            'usersecret': Math.random()
        };
        app.auth.setUser(user);
        var f_user = app.auth.getUser();
        expect(f_user).to.be.an.object;
        expect(f_user).to.have.property('name', 'Tom');

        //IS
        var exists = app.auth.isUser();
        expect(exists).to.be.true;

        //REMOVE
        app.auth.removeUser();
        exists = app.auth.isUser();
        expect(exists).to.be.false;

        f_user = app.auth.getUser();
        expect(f_user).not.to.be.null;

        //checking if getting a user hasn't initialised one
        exists = app.auth.isUser();
        expect(exists).to.be.false;

    });
});


describe('navigation interface', function(){
    beforeEach(function(){});
    afterEach(function(){});

    /**
     * Testing
     -app.navigation.makePopup()
     -app.navigation.popup()
     -app.navigation.message()
     -app.navigation.go()
     */
    it('main', function(){

    });
});

describe('geoloc interface', function(){
    beforeEach(function(){
        app.geoloc.clear();
    });
    afterEach(function(){});

    /**
     * Testing
     app.geoloc.set()
     app.geoloc.get()
     -app.geoloc.start()
     -app.geoloc.validate()
     */
    it('main', function(){
        //SET
        var location = {
            'lat' : Math.random(),
            'lon' : Math.random(),
            'acc' : Math.random()
        };
        app.geoloc.set(location.lat, location.lon, location.acc);

        //GET
        var f_location = app.geoloc.get();

        expect(f_location).to.be.an.object;
        expect(f_location.lat).to.be.equal(location.lat);
        expect(f_location.lon).to.be.equal(location.lon);
        expect(f_location.acc).to.be.equal(location.acc);

        //VALIDATE
        app.geoloc.CONF.GPS_ACCURACY_LIMIT = 0;
        var valid = app.geoloc.valid();
        expect(valid).to.be.equal(app.FALSE);

        var acc = Math.random();
        app.geoloc.set(location.lat, location.lon, acc);

        app.geoloc.CONF.GPS_ACCURACY_LIMIT = acc + 1;
        valid = app.geoloc.valid();
        expect(valid).to.be.equal(app.TRUE);

    });
});

describe('io interface', function(){
    beforeEach(function(){});
    afterEach(function(){});

    /**
     * Testing
     -app.io.sendSavedForm()
     -app.io.sendAllSavedRecords()
     -app.io.sendSavedRecord(savedRecordId)
     */
    it('main', function(){

    });
});

describe('storage interface', function(){
    beforeEach(function(){
        app.storage.tmpClear();
    });
    afterEach(function(){});

    /**
     * Testing:
     app.storage.tmpGet
     app.storage.tmpSet
     */
    it('main', function(){
        //SET
        var item = 'item';
        var item_data = Math.random();
        app.storage.tmpSet(item, item_data);

        var exists = app.storage.tmpIs(item);
        expect(exists).to.be.true;

        //GET
        var f_item_data = app.storage.tmpGet(item);
        expect(f_item_data).to.exist;
        expect(f_item_data).to.be.equal(item_data);
    });
});
