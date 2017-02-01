import Occurrence from '../src/Occurrence';

/* eslint-disable no-unused-expressions */

describe('Occurrence', () => {
  it('should create new', () => {
    const subModel = new Occurrence();
    expect(subModel.attributes).to.be.an.object;
    expect(subModel instanceof Occurrence).to.be.true;
    expect(Object.keys(subModel.attributes).length).to.be.equal(0);
    expect(subModel.cid).to.be.a.string;
  });

  it('should return JSON', () => {
    const item = Date.now().toString();
    const value = Math.random();
    const subModel = new Occurrence();
    subModel.set(item, value);

    const json = subModel.toJSON();

    expect(json.cid).to.be.equal(subModel.cid);
    expect(json.attributes[item]).to.be.equal(value);
  });

  it('should have a validator', () => {
    const subModel = new Occurrence();
    expect(subModel.validate).to.be.a('function');
  });

  it('should validate taxon', () => {
    const subModel = new Occurrence();
    let invalids = subModel.validate();

    expect(invalids).to.be.an('object');
    expect(invalids.taxon).to.be.a('string');

    subModel.set('taxon', 1234);

    invalids = subModel.validate();
    expect(invalids).to.be.null;
  });
});
