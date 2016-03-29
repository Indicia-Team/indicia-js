describe('Occurrence', function () {
    it('new', function () {
        var occurrence = new morel.Occurrence();
        expect(occurrence.attributes).to.be.an.object;
        expect(occurrence instanceof morel.Occurrence).to.be.true;
        expect(Object.keys(occurrence.attributes).length).to.be.equal(0);
        expect(occurrence.id).to.be.a.string;
    });

    it('toJSON', function () {
        var item = Date.now().toString(),
            value = Math.random(),
            occurrence = new morel.Occurrence();
        occurrence.set(item, value);

        var json = occurrence.toJSON();

        expect(json.id).to.be.equal(occurrence.id);
        expect(json.attributes[item]).to.be.equal(value);
    });
});