/**
 * Interface testing functions.
 *
 * Until the code is fully covered in tests, it is the most important to
 * test the library functions/interface that the mobile apps directly call.
 */

describe('morel interface', function(){

    /**
     * Testing:
     morel
     morel.CONF
     morel.TRUE
     morel.ERROR
     morel.LOG_*

     morel.data
     morel.settings
     */
    it('main', function(){
        expect(morel).to.exist;
        expect(morel.CONF).to.exist;
        expect(morel.TRUE).to.exist;
        expect(morel.ERROR).to.exist;
        expect(morel.LOG_NONE).to.exist;
        expect(morel.LOG_ERROR).to.exist;
        expect(morel.LOG_WARNING).to.exist;
        expect(morel.LOG_INFO).to.exist;
        expect(morel.LOG_DEBUG).to.exist;
        expect(morel.data).to.exist;
        expect(morel.settings).to.exist;
    })
});

describe('record interface', function(){
    beforeEach(function(){
        morel.storage.clear();
        morel.record.clear();
    });
    afterEach(function(){

    });

    /**
     * Testing:
     -morel.record.validate()
     morel.record.clear()
     */
    it('main', function(){
        //CLEAR
        var input = 'input';
        var input_data = Math.random();
        morel.record.inputs.set(input, input_data);

        var record = morel.record.get();
        expect(record).to.be.an.object;
        var record_keys = Object.keys(record);
        expect(record_keys.length).to.be.equal(1);

        morel.record.clear();

        record = morel.record.get();
        expect(record).to.be.an.object;
        record_keys = Object.keys(record);
        expect(record_keys.length).to.be.equal(0);

    });

    /**
     * Testing:
     morel.record.db.remove(savedRecordId)
     morel.record.db.save(onSaveSuccess);
     +morel.record.db.getAll()
     */
    it('storage', function(){
        //SAVE
        var input = 'input';
        var input_data = Math.random();
        morel.record.inputs.set(input, input_data);

        morel.record.db.save(function(savedRecordId){
            //GETALL
            morel.record.db.getAll(function(records){
                expect(records).to.be.an.array;
                expect(records.length).to.be.equal(1);
                expect(records[0][0].value).to.be.equal(input_data);

                expect(savedRecordId).to.be.equal(1);

                //REMOVE
                morel.record.db.remove(savedRecordId);
                morel.record.db.getAll(function(records){
                    expect(records).to.be.an.array;
                    expect(records.length).to.be.equal(0);
                });

            });

        });
    });

    /** Testing:
     morel.record.inputs.KEYS.*
     morel.record.inputs.set(input, data)
     morel.record.inputs.is(input)
     */
    it('inputs', function(){
        //KEYS
        expect(morel.record.inputs.KEYS).to.be.array;

        //SET
        var input = 'input';
        var input_data = Math.random();

        morel.record.inputs.set(input, input_data);
        var f_input_data = morel.record.inputs.get(input);
        expect(f_input_data).to.equal(input_data);

        //IS
        var exist = morel.record.inputs.is(input);
        expect(exist).to.be.true;
    });
});


describe('authentication interface', function(){
    beforeEach(function(){
        morel.auth.removeUser()
    });
    afterEach(function(){});

    /**
     * Testing:
     morel.auth.CONF
     morel.auth.removeUser();
     morel.auth.setUser(user);
     morel.auth.isUser();
     */
    it('main', function(){
        //CONF
        expect(morel.auth.CONF).to.be.object;

        //SET
        var user = {
            'name': 'Tom',
            'surname': 'Jules',
            'email': 'tom@jules.com',
            'usersecret': Math.random()
        };
        morel.auth.setUser(user);
        var f_user = morel.auth.getUser();
        expect(f_user).to.be.an.object;
        expect(f_user).to.have.property('name', 'Tom');

        //IS
        var exists = morel.auth.isUser();
        expect(exists).to.be.true;

        //REMOVE
        morel.auth.removeUser();
        exists = morel.auth.isUser();
        expect(exists).to.be.false;

        f_user = morel.auth.getUser();
        expect(f_user).not.to.be.null;

        //checking if getting a user hasn't initialised one
        exists = morel.auth.isUser();
        expect(exists).to.be.false;

    });
});


describe('navigation interface', function(){
    beforeEach(function(){});
    afterEach(function(){});

    /**
     * Testing
     -morel.navigation.makePopup()
     -morel.navigation.popup()
     -morel.navigation.message()
     -morel.navigation.go()
     */
    it('main', function(){

    });
});

describe('geoloc interface', function(){
    beforeEach(function(){
        morel.geoloc.clear();
    });
    afterEach(function(){});

    /**
     * Testing
     morel.geoloc.set()
     morel.geoloc.get()
     -morel.geoloc.start()
     -morel.geoloc.validate()
     */
    it('main', function(){
        //SET
        var location = {
            'lat' : Math.random(),
            'lon' : Math.random(),
            'acc' : Math.random()
        };
        morel.geoloc.set(location.lat, location.lon, location.acc);

        //GET
        var f_location = morel.geoloc.get();

        expect(f_location).to.be.an.object;
        expect(f_location.lat).to.be.equal(location.lat);
        expect(f_location.lon).to.be.equal(location.lon);
        expect(f_location.acc).to.be.equal(location.acc);

        //VALIDATE
        morel.geoloc.CONF.GPS_ACCURACY_LIMIT = 0;
        var valid = morel.geoloc.valid();
        expect(valid).to.be.equal(morel.FALSE);

        var acc = Math.random();
        morel.geoloc.set(location.lat, location.lon, acc);

        morel.geoloc.CONF.GPS_ACCURACY_LIMIT = acc + 1;
        valid = morel.geoloc.valid();
        expect(valid).to.be.equal(morel.TRUE);

    });
});

describe('io interface', function(){
    beforeEach(function(){});
    afterEach(function(){});

    /**
     * Testing
     -morel.io.sendSavedForm()
     -morel.io.sendAllSavedRecords()
     -morel.io.sendSavedRecord(savedRecordId)
     */
    it('main', function(){

    });
});

describe('storage interface', function(){
    beforeEach(function(){
        morel.storage.tmpClear();
    });
    afterEach(function(){});

    /**
     * Testing:
     morel.storage.tmpGet
     morel.storage.tmpSet
     */
    it('main', function(){
        //SET
        var item = 'item';
        var item_data = Math.random();
        morel.storage.tmpSet(item, item_data);

        var exists = morel.storage.tmpIs(item);
        expect(exists).to.be.true;

        //GET
        var f_item_data = morel.storage.tmpGet(item);
        expect(f_item_data).to.exist;
        expect(f_item_data).to.be.equal(item_data);
    });
});
