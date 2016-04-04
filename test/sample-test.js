import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import Image from '../src/Image';
import Collection from '../src/Collection';
import helpers from '../src/helpers';

describe('Sample', () => {
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

  it('can resize all occurrence images', (done) => {
    const sample = new Sample();
    expect(sample.resizeImages).to.be.a('function');

    // create random image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(100, 100); //px

    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = (Math.random() * 100).toFixed(0);
      imgData.data[i + 1] = (Math.random() * 100).toFixed(0);
      imgData.data[i + 2] = (Math.random() * 100).toFixed(0);
      imgData.data[i + 3] = 105;
    }
    ctx.putImageData(imgData, 10, 10);
    const data = canvas.toDataURL('jpeg');
    const originalImageSize = data.length;

    const image = new Image({
      data,
      type: 'image/png',
    });

    // create occurrence
    const occurrence = new Occurrence();
    occurrence.images.set(image);
    sample.occurrences.set(occurrence);

    sample.resizeImages((err) => {
      if (err) throw err.message;

      const resizedImage = sample.occurrences.at(0).images.at(0).get('data');
      expect(resizedImage.length).to.be.below(originalImageSize);
      done();
    });
  });
});
