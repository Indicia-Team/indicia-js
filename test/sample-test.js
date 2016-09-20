import _ from 'underscore';

import Morel from '../src/main';
import DatabaseStorage from '../src/DatabaseStorage';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import Image from '../src/Image';
import Error from '../src/Error';
import Collection from '../src/Collection';
import helpers from '../src/helpers';

const options = {
  url: '/mobile/submit',
  appname: 'test',
  appsecret: 'mytest',
  website_id: 23,
  survey_id: 42,
};

describe('Sample', () => {
  const morel = new Morel(_.extend(options, { Storage: DatabaseStorage }));

  it('new', () => {
    const sample = new Sample();
    expect(sample.id).to.be.a.string;
    expect(sample.attributes).to.be.an.object;
    expect(sample.occurrences).to.be.instanceOf(Collection);
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

    let json = sample.toJSON();

    expect(json).to.be.an.object;
    expect(json.occurrences.length).to.be.equal(0);

    sample.occurrences.set(occurrence);
    json = sample.toJSON();

    expect(json.occurrences.length).to.be.equal(1);
  });

  it('should have a validator', () => {
    const sample = new Sample();
    expect(sample.validate).to.be.a('function');
  });

  it('should validate location, location type, date and occurrences', () => {
    const sample = new Sample();
    delete sample.attributes.location_type;
    let allInvalids = sample.validate();
    let invalids = allInvalids.sample;

    expect(invalids).to.be.an('object');
    expect(invalids.location).to.be.a('string');
    expect(invalids.location_type).to.be.a('string');
    expect(invalids.occurrences).to.be.a('string');

    sample.occurrences.set(new Occurrence());

    allInvalids = sample.validate();
    invalids = allInvalids.sample;
    expect(invalids.occurrences).to.be.undefined;
    expect(allInvalids.occurrences).to.not.be.empty;
  });
});
