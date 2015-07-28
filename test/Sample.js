describe('Sample', function () {
    it('new', function () {
        var sample = new morel.Sample();
        expect(sample.id).to.be.a.string;
        expect(sample.attributes).to.be.an.object;
        expect(sample.occurrences instanceof morel.OccurrenceCollection).to.be.true
    });

    it('set get has', function () {
        var sample = new morel.Sample(),
            key = Date.now().toString(),
            data = Math.random();

        sample.set(key, data);
        expect(sample.attributes[key]).to.be.equal(data);
        expect(sample.get(key)).to.be.equal(data);
        expect(sample.has(key)).to.be.true;
    });

    it('clear', function () {
        var sample = new morel.Sample(),
            key = Date.now().toString(),
            data = Math.random();

        sample.set(key, data);
        sample.clear();
        var keys = Object.keys(sample.attributes);
        expect(keys.length).to.be.equal(0);
    });

    it('remove', function () {
        var sample = new morel.Sample(),
            key = Date.now().toString(),
            data = Math.random();

        sample.set(key, data);
        sample.remove(key);
        expect(sample.get(key)).to.be.undefined;
    });

    it('toJSON', function () {
        var item = Date.now().toString(),
            value = Math.random(),
            occurrence = new morel.Occurrence(),
            sample = new morel.Sample();

        var json = sample.toJSON();

        expect(json).to.be.an.object;
        expect(json.occurrences.length).to.be.equal(0);

        sample.occurrences.set(occurrence);
        json = sample.toJSON();

        expect(json.occurrences.length).to.be.equal(1);
    });
});