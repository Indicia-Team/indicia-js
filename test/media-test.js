import Backbone from 'backbone';
import Collection from '../src/Collection';
import Store from '../src/Store';
import Occurrence from '../src/Occurrence';
import Media from '../src/Media';
import { getRandomSample } from './helpers';

/* eslint-disable no-unused-expressions */

describe('Media', () => {
  const store = new Store();

  it('should be a Backbone model', () => {
    const media = new Media();

    expect(media).to.be.instanceOf(Backbone.Model);
    expect(media.cid).to.be.a.string;
    expect(media.attributes).to.be.an.object;
    expect(Object.keys(media.attributes).length).to.be.equal(0);
  });
  
  describe('getDataURI', () => {
    it('should accept media path', (done) => {
      const file = '/base/test/images/image.jpg';
      Media.getDataURI(file).then((args) => {
        const [dataURI, type, width, height] = args;
        expect(type).to.be.equal('jpeg');
        expect(width).to.be.equal(960);
        expect(height).to.be.equal(710);
        done();
      });
    });


    it('should accept file input', (done) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/base/test/images/image.jpg', true);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (this.status === 200) {
          const file = this.response; // blob
          Media.getDataURI(file).then((args) => {
            const [dataURI, type, width, height] = args;
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



    describe('Media', () => {
      it('should save sample on media save', (done) => {
        const media = new Media();
        const sample = getRandomSample(store);
        sample.getOccurrence().media.add(media);

        // update the media and save it - the save should be permenant
        media.set('data', '1234');
        const req = media.save().then(() => {
          const collection = new Collection(null, { store });

          expect(collection.length).to.be.equal(1);

          const savedSample = collection.get(sample);
          const savedMedia = savedSample.getOccurrence().getMedia();

          // check if change to media is permenant
          expect(savedMedia.get('data')).to.be.equal('1234');
          done();
        });

        expect(req).to.be.an.instanceof(Promise);
      });

      it('should save sample on media destroy', (done) => {
        const media = new Media();
        const occurrence = new Occurrence(null, {
          media: [media],
        });
        const sample = new Sample(null, {
          occurrences: [occurrence],
        });

        // add sample to storedCollection
        storedCollection.set(sample).then(() => {
          expect(storedCollection.length).to.be.equal(1);

          media.destroy().then(() => {
            const newCollection = new Morel.Collection(null, { store });
            expect(newCollection.length).to.be.equal(1);

            const occurrenceFromDB = newCollection.at(0).getOccurrence();

            // check if change to media is permenant
            expect(occurrenceFromDB.media.length).to.be.equal(0);
            done();
          });
        });
      });
    });
  });
});
