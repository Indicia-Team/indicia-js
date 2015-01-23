describe("Core suite", function() {
    beforeEach(function() {
        morel.record.clear();
    });
    afterEach(function() { });

    /**
     * Clearing the record.
     */
    it('clear record', function(){
        //set up input that will not be removed
        var input = 'input';
        var input_data = Math.random();
        morel.storage.tmpSet(input, input_data);

        //add record
        var record = {'recordinput': Math.random()};
        morel.record.set(record);

        //remove record
        morel.record.clear();

        //check if the record is removed
        var finalRecord = morel.storage.tmpGet(morel.record.RECORD);
        expect(finalRecord).to.be.null;

        //check if the input still exists
        morel.storage.tmpGet(input).should.equal(input_data);
    });

    /**
     * Setting up and removing a record.
     */
    it('set record', function() {
        var record = {};
        morel.record.set(record);
        var finalRecord = morel.record.get();
        expect(finalRecord)
            .to.be.an('object')
            .that.is.empty;
    });

    /**
     * Setting up, changing and removing an input.
     */
    it('set input', function() {
        //general setting up a record with an input
        var input = 'input';
        var input_data = Math.random();
        morel.record.inputs.set(input, input_data);
        var finalRecord = morel.record.get();
        expect(finalRecord)
            .to.be.an('object')
            .that.has.property('input')
                .that.to.be.equal(input_data);

        //set another input
        var input2 = 'input2';
        var input2_data = Math.random();
        morel.record.inputs.set(input2, input2_data);
        morel.record.inputs.get(input2).should.equal(input2_data);

        //changing input
        input_data = Math.random();
        morel.record.inputs.set(input2, input2_data);
        morel.record.inputs.get(input2).should.equal(input2_data);

        //removing input
        morel.record.inputs.remove(input2);
        finalRecord = morel.record.get();
        expect(finalRecord).to.not.have.property(input2);

    });


});
