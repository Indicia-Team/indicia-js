import Backbone from 'backbone';
import Collection from '../src/Collection';
import Sample from '../src/Sample';
import Store from '../src/Store';
import Occurrence from '../src/Occurrence';
import Media from '../src/Media';
import { getRandomSample } from './helpers';

/* eslint-disable no-unused-expressions */

describe('Media', function tests() {
  this.timeout(10000);

  const store = new Store();
  const storedCollection = new Collection(null, { store, model: Sample });
  const cleanUp = () =>
    storedCollection.fetch().then(() => storedCollection.destroy());

  before(cleanUp);
  beforeEach(cleanUp);
  after(cleanUp);
  afterEach(cleanUp);

  it('should be a Backbone model', () => {
    const media = new Media();

    expect(media).to.be.instanceOf(Backbone.Model);
    expect(media.cid).to.be.a.string;
    expect(media.attributes).to.be.an.object;
    expect(Object.keys(media.attributes).length).to.be.equal(0);
  });

  // validation

  it('should have remote and local validators', () => {
    const media = new Media();
    expect(media.validate).to.be.a('function');
    expect(media.validateRemote).to.be.a('function');
  });

  it('should validate location, location type, date and occurrences', () => {
    const media = new Media();

    const invalids = media.validate(null, { remote: true });

    expect(invalids).to.be.an('object');
    expect(invalids.attributes.type).to.be.a('string');
  });

  it('should save parent on media save', done => {
    const media = new Media();
    const sample = getRandomSample(store);
    sample.getOccurrence().addMedia(media);

    // update the media and save it - the save should be permanent
    media.set('data', '1234');
    const promise = media.save().then(() => {
      const collection = new Collection(null, { store, model: Sample });

      collection.fetch().then(() => {
        expect(collection.length).to.be.equal(1);

        const savedSample = collection.get(sample);
        const savedMedia = savedSample.getOccurrence().getMedia();

        // check if change to media is permenant
        expect(savedMedia.get('data')).to.be.equal('1234');
        done();
      });
    });

    expect(promise).to.be.an.instanceof(Promise);
  });

  it('should save parent on destroy', done => {
    const media = new Media();
    const occurrence = new Occurrence(null, {
      media: [media],
    });
    const sample = getRandomSample(store, null, [occurrence]);

    // add sample to local storage
    const collection = new Collection(null, { store, model: Sample });
    collection.set(sample);
    collection.save().then(() => {
      media.destroy().then(() => {
        const newCollection = new Collection(null, { store, model: Sample });
        newCollection.fetch().then(() => {
          expect(newCollection.length).to.be.equal(1);

          const occurrenceFromDB = newCollection.at(0).getOccurrence();

          // check if change to media is permanent
          expect(occurrenceFromDB.media.length).to.be.equal(0);
          done();
        });
      });
    });
  });

  describe('getDataURI', () => {
    it('should accept media path', done => {
      const file = '/base/test/images/image.jpg';
      Media.getDataURI(file).then(args => {
        const [, type, width, height] = args;
        expect(type).to.be.equal('jpeg');
        expect(width).to.be.equal(960);
        expect(height).to.be.equal(710);
        done();
      });
    });

    it('should accept file input', done => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/base/test/images/image.jpg', true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        if (this.status === 200) {
          const file = this.response; // blob
          Media.getDataURI(file).then(args => {
            const [, type, width, height] = args;
            expect(type).to.be.equal('jpeg');
            expect(width).to.be.equal(960);
            expect(height).to.be.equal(710);
            done();
          });
        }
      };
      xhr.send();
    });

    it('should return its absolute URL', () => {
      const URL = 'http://domain.com/media.jpeg';
      const media = new Media({
        data: URL,
      });
      expect(media.getURL).to.be.a.function;
      expect(media.getURL()).to.be.equal(URL);
    });
  });
});
