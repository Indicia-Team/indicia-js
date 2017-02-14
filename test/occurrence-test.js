import Occurrence from '../src/Occurrence';

/* eslint-disable no-unused-expressions */

describe('Occurrence', () => {
  it('should create new', () => {
    const occurrence = new Occurrence();
    expect(occurrence.attributes).to.be.an.object;
    expect(occurrence instanceof Occurrence).to.be.true;
    expect(Object.keys(occurrence.attributes).length).to.be.equal(0);
    expect(occurrence.cid).to.be.a.string;
  });

  it('should return JSON', () => {
    const item = Date.now().toString();
    const value = Math.random();
    const occurrence = new Occurrence();
    occurrence.set(item, value);

    const json = occurrence.toJSON();

    expect(json.cid).to.be.equal(occurrence.cid);
    expect(json.attributes[item]).to.be.equal(value);
  });

  it('should have a validator', () => {
    const occurrence = new Occurrence();
    expect(occurrence.validate).to.be.a('function');
  });

  it('should validate taxon', () => {
    const occurrence = new Occurrence();
    let invalids = occurrence.validate(null, { remote: true });

    expect(invalids).to.be.an('object');
    expect(invalids.taxon).to.be.a('string');

    occurrence.set('taxon', 1234);

    invalids = occurrence.validate(null, { remote: true });
    expect(invalids).to.be.null;
  });
});
