/* eslint-disable no-unused-expressions */

import Media from '../src/Media';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import Collection from '../src/Collection';
import helpers from '../src/helpers';

describe('Sample', () => {
  it('new', () => {
    const sample = new Sample();
    expect(sample.cid).to.be.a.string;
    expect(sample.attributes).to.be.an.object;
    expect(sample.occurrences).to.be.instanceOf(Collection);
    expect(sample.occurrences.model).to.be.equal(Occurrence);
    expect(sample.samples).to.be.instanceOf(Collection);
    expect(sample.samples.model).to.be.equal(Sample);
    expect(sample.media.model).to.be.equal(Media);
  });

  it('should add missing date and location type if missing', () => {
    const sample = new Sample();
    expect(sample.get('date')).to.be.not.null;
    expect(sample.get('location_type')).to.be.not.null;

    const sampleFull = new Sample({
      date: helpers.formatDate(new Date()),
    });

    expect(sampleFull.get('date')).to.be.equal(helpers.formatDate(new Date()));
    expect(sampleFull.get('location_type')).to.be.equal('latlon');
  });

  it('should return JSON', () => {
    const occurrence = new Occurrence();
    const sample = new Sample();
    const subSample = new Sample();
    subSample.occurrences.set(occurrence);

    let json = sample.toJSON();

    expect(json).to.be.an.object;
    expect(json.occurrences.length).to.be.equal(0);

    sample.samples.set(subSample);
    json = sample.toJSON();

    expect(json.samples.length).to.be.equal(1);
    expect(json.samples[0].cid).to.be.equal(subSample.cid);

    expect(json.samples[0].occurrences.length).to.be.equal(1);
    expect(json.samples[0].occurrences[0].cid).to.be.equal(occurrence.cid);
  });

  it('should have a validator', () => {
    const sample = new Sample();
    expect(sample.validate).to.be.a('function');
  });

  it('should validate location, location type, date and occurrences', () => {
    const sample = new Sample();
    const subSample = new Sample();
    const occurrence = new Occurrence();

    delete sample.attributes.location_type;
    let allInvalids = sample.validate();
    let invalids = allInvalids.sample;

    expect(invalids).to.be.an('object');
    expect(invalids.location).to.be.a('string');
    expect(invalids.location_type).to.be.a('string');

    sample.samples.set(subSample);

    allInvalids = sample.validate();
    invalids = allInvalids.sample;
    expect(invalids.samples).to.be.undefined;
    expect(allInvalids.samples).to.not.be.empty;

    subSample.occurrences.set(occurrence);

    allInvalids = sample.validate();
    expect(allInvalids.samples[subSample.cid].occurrences).to.not.be.empty;
  });
});
