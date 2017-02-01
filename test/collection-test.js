import Occurrence from '../src/Occurrence';
import Collection from '../src/Collection';

/* eslint-disable no-unused-expressions */

describe('Collection', () => {
  it('should return JSON', () => {
    const subModel = new Occurrence();
    const collection = new Collection([], {
      model: Occurrence,
    });
    expect(collection.model).to.be.equal(Occurrence);

    collection.set(subModel);
    expect(collection.length).to.be.equal(1);
    const json = collection.toJSON();

    expect(json).to.be.an.array;
    expect(json.length).to.be.equal(1);
    expect(json[0].cid).to.be.equal(subModel.cid);
  });
});
