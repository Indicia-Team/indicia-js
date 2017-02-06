import _ from 'underscore';
import Error from '../src/Error';

/* eslint-disable no-unused-expressions */

import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import Collection from '../src/Collection';
import helpers from '../src/helpers';

const options = {
  host: '',
  api_key: 'mytest',
  website_id: 23,
  survey_id: 42,
  user: 'x',
  password: 'x',
};

describe('Sample', () => {
  const morel = new Morel(_.extend(options, { }));

  it('new', () => {
    const sample = new Sample();
    expect(sample.cid).to.be.a.string;
    expect(sample.attributes).to.be.an.object;
    expect(sample.subModels).to.be.instanceOf(Collection);
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
    subSample.subModels.set(occurrence);

    let json = sample.toJSON();

    expect(json).to.be.an.object;
    expect(json.subModels.length).to.be.equal(0);

    sample.subModels.set(subSample);
    json = sample.toJSON();

    expect(json.subModels.length).to.be.equal(1);
    expect(json.subModels[0].cid).to.be.equal(subSample.cid);

    expect(json.subModels[0].subModels.length).to.be.equal(1);
    expect(json.subModels[0].subModels[0].cid).to.be.equal(occurrence.cid);
  });

  it('should have a validator', () => {
    const sample = new Sample();
    expect(sample.validate).to.be.a('function');
  });

  it('should validate location, location type, date and subModels', () => {
    const sample = new Sample();
    const subSample = new Sample();
    const occurrence = new Occurrence();

    delete sample.attributes.location_type;
    let allInvalids = sample.validate();
    let invalids = allInvalids.sample;

    expect(invalids).to.be.an('object');
    expect(invalids.location).to.be.a('string');
    expect(invalids.location_type).to.be.a('string');
    expect(invalids.subModels).to.be.a('string');

    sample.subModels.set(subSample);

    allInvalids = sample.validate();
    invalids = allInvalids.sample;
    expect(invalids.subModels).to.be.undefined;
    expect(allInvalids.subModels).to.not.be.empty;

    subSample.subModels.set(occurrence);

    allInvalids = sample.validate();
    invalids = allInvalids.sample;
    expect(allInvalids.subModels[subSample.cid].subModels).to.not.be.empty;
  });

  it('should not allow mixed subModel types', (done) => {
    const sample = new Sample();
    const subSample = new Sample();
    const subSample2 = new Occurrence();

    sample.addSubModel(subSample);
    try {
      sample.addSubModel(subSample2);
    } catch (err) {
      expect(err instanceof Error).to.be.true;
      done();
    }
  });
});
