describe('Sample', function () {
    it('new', function () {
        var sample = new morel.Sample();
        expect(sample.id).to.be.a.string;
        expect(sample.attributes).to.be.an.object;
        expect(sample.occurrences instanceof morel.Collection).to.be.true
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