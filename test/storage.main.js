describe("Core suite", function() {
    beforeEach(function() { });
    afterEach(function() { });
    //it('should fail', function() { expect(true).to.be.false; });
    it('basic functionality', function() {
        var randNum = Math.random();
        var item = 'num';

        morel.storage.set(item, randNum);
        morel.storage.get(item).should.equal(randNum);
    });
});
