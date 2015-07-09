describe('OccurrenceCollection', function () {
    it('new', function () {
        var collection = new morel.OccurrenceCollection();
        expect(collection.occurrences).to.be.an.array;
        expect(collection.occurrences.length).to.be.equal(0);
    });


    it('set get remove has', function () {
        var collection = new morel.OccurrenceCollection(),
             occurrence = new morel.Occurrence(),
             occurrence2 = new morel.Occurrence();
        expect(collection.size()).to.be.equal(0);

        collection.set(occurrence);
        expect(collection.size()).to.be.equal(1);

        collection.set(occurrence2);
        expect(collection.size()).to.be.equal(2);

        collection.remove(occurrence2);
        expect(collection.size()).to.be.equal(1);

        expect(collection.has(occurrence)).to.be.true;
        expect(collection.has(occurrence2)).to.be.false;
    });

    it('create', function () {
        var collection = new morel.OccurrenceCollection();
        expect(collection.size()).to.be.equal(0);
        var occurrence = collection.create();

        expect(collection.size()).to.be.equal(1);
        expect(collection.has(occurrence)).to.be.true;
    });

});