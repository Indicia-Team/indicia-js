import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import Collection from '../src/Collection';

describe('Sample', () => {
  it('new', () => {
    var sample = new Sample();
    expect(sample.id).to.be.a.string;
    expect(sample.attributes).to.be.an.object;
    expect(sample.occurrences).to.be.instanceOf(Collection);
  });

  it('should return JSON', () => {
    const occurrence = new Occurrence();
    const sample = new Sample();

    var json = sample.toJSON();

    expect(json).to.be.an.object;
    expect(json.occurrences.length).to.be.equal(0);

    sample.occurrences.set(occurrence);
    json = sample.toJSON();

    expect(json.occurrences.length).to.be.equal(1);
  });
});
