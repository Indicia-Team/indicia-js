describe('Collection', function () {
    it('new', function () {
        var collection = new morel.Collection({
            model: morel.Occurrence
        });
        expect(collection.models).to.be.an.array;
        expect(collection.models.length).to.be.equal(0);
    });


    it('set get remove has', function () {
        var collection = new morel.Collection({
                model: morel.Occurrence
            }),
            occurrence = new morel.Occurrence(),
            occurrence2 = new morel.Occurrence(),
            item = Date.now().toString(),
            value = Math.random();

        expect(collection.size()).to.be.equal(0);

        collection.set(occurrence);
        expect(collection.size()).to.be.equal(1);

        collection.set(occurrence2);
        expect(collection.size()).to.be.equal(2);

        //update
        occurrence2.set(item, value);
        expect(collection.get(occurrence2).get(item)).to.be.equal(value); //updates through reference
        collection.set(occurrence2);
        expect(collection.size()).to.be.equal(2);

        collection.remove(occurrence2);
        expect(collection.size()).to.be.equal(1);

        expect(collection.has(occurrence)).to.be.true;
        expect(collection.has(occurrence2)).to.be.false;
    });

    it('create', function () {
        var collection = new morel.Collection({
            model: morel.Occurrence
        });
        expect(collection.size()).to.be.equal(0);
        var occurrence = collection.create();

        expect(collection.size()).to.be.equal(1);
        expect(collection.has(occurrence)).to.be.true;
    });

    it('toJSON', function () {
        var item = Date.now().toString(),
            value = Math.random(),
            occurrence = new morel.Occurrence(),
            collection = new morel.Collection({
                model: morel.Occurrence
            });
        collection.set(occurrence);

        var json = collection.toJSON();

        expect(json).to.be.an.array;
        expect(json.length).to.be.equal(1);
        expect(json[0].id).to.be.equal(occurrence.id);
    });

});