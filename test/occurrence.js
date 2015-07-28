describe('Occurrence', function () {
    it('new', function () {
        var occurrence = new morel.Occurrence();
        expect(occurrence.attributes).to.be.an.object;
        expect(occurrence instanceof morel.Occurrence).to.be.true;
        expect(Object.keys(occurrence.attributes).length).to.be.equal(0);
        expect(occurrence.id).to.be.a.string;
    });

    it('set get remove has', function () {
        var item = Date.now().toString(),
            value = Math.random(),
            occurrence = new morel.Occurrence();
        expect(Object.keys(occurrence.attributes).length).to.be.equal(0);

        occurrence.set(item, value);
        expect(occurrence.has(item)).to.be.true;

        expect(occurrence.get(item)).to.be.equal(value);

        occurrence.remove(item);
        expect(occurrence.has(item)).to.be.false;
    });

    it('clear', function () {
        var item = Date.now().toString(),
            value = Math.random(),
            occurrence = new morel.Occurrence();

        occurrence.set(item, value);
        expect(Object.keys(occurrence.attributes).length).to.be.equal(1);
        occurrence.clear();
        expect(Object.keys(occurrence.attributes).length).to.be.equal(0);
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