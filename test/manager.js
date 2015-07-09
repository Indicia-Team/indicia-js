describe('Manager', function () {

    //init

    //set
    //get
    //getAll
    //remove
    //clear
    //sync
    //syncAll

});

//describe('record', function(){
//    beforeEach(function(){
//       //clear records
//    });
//
//    it('clear', function () {
//    });
//
//    it('', function(){
//        //create new
//        var manager = new morel.Manager();
//        var config = {
//
//        };
//        manager.init(config);
//
//        var sample = new morel.Sample();
//       // sample.setDate();
//        var occurrence = sample.addOccurrence();
//        //modify occurrence
//
//        manager.set(sample);
//
//        var sampleResult = manager.get(sample.id);
//
//        expect(sampleResult.id).to.be.equal(sample.id);
//    });
//
//});

//new with options

//remove

//remove all

//get(id)
//getAll()

//set
//set(id, {})
//submit(id) -> DB.submit(id)
//submitAll() -> DB.submitAll()


//
///**
// * morel.record.inputs.KEYS.*
// * morel.record.inputs.set(input, data)
// * morel.record.inputs.is(input)
// */
//it('inputs', function(){
//    //KEYS
//    expect(morel.record.inputs.KEYS).to.be.array;
//
//    //SET
//    var input = 'input';
//    var input_data = Math.random();
//
//    morel.record.inputs.set(input, input_data);
//    var f_input_data = morel.record.inputs.get(input);
//    expect(f_input_data).to.equal(input_data);
//
//    //IS
//    var exist = morel.record.inputs.is(input);
//    expect(exist).to.be.number;
//});

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
//
//describe('storage', function(){
//    beforeEach(function(){
//        morel.storage.tmpClear();
//    });
//    afterEach(function(){});
//
//    /**
//     * morel.storage.tmpGet
//     * morel.storage.tmpSet
//     */
//    it('main', function(){
//        //SET
//        var item = 'item';
//        var item_data = Math.random();
//        morel.storage.tmpSet(item, item_data);
//
//        var exists = morel.storage.tmpIs(item);
//        expect(exists).to.be.number;
//
//        //GET
//        var f_item_data = morel.storage.tmpGet(item);
//        expect(f_item_data).to.exist;
//        expect(f_item_data).to.be.equal(item_data);
//    });
//});
