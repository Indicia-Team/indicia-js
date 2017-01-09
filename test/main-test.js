import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import ImageModel from '../src/Image';

const options = {
  url: '/mobile/submit',
  appname: 'test',
  appsecret: 'mytest',
  website_id: 23,
  survey_id: 42,
};

let manager;

describe('Saving/destroying propagation', () => {
  beforeEach(() => {
    manager = new Morel(_.extend(options, { }));
  });

  afterEach((done) => {
    manager.clear(done);
  });

  describe('Image', () => {
    it('should save sample on image save', (done) => {
      const image = new ImageModel();
      const occurrence = new Occurrence(null, {
        images: [image],
      });
      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add sample to storage
      manager.set(sample, (err) => {
        if (err) throw err.message;
        expect(manager.storage._cache.length).to.be.equal(1);

        // update the image and save it - the save should be permenant
        image.set('data', '1234');
        const req = image.save(null, {
          success() {
            const newManager = new Morel(_.extend(options, { }));
            newManager.getAll((err, samples) => {
              expect(samples.length).to.be.equal(1);
              const occurrenceFromDB = samples.at(0).occurrences.at(0);
              const imageFromDB = occurrenceFromDB.images.at(0);
              // check if change to image is permenant
              expect(imageFromDB.get('data')).to.be.equal('1234');
              done();
            });
          },
        });
        expect(req).to.be.an.instanceof(Promise);
      });
    });

    it('should save sample on image destroy', (done) => {
      const image = new ImageModel();
      const occurrence = new Occurrence(null, {
        images: [image],
      });
      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add sample to storage
      manager.set(sample, (err) => {
        expect(manager.storage._cache.length).to.be.equal(1);

        image.destroy().then(() => {
          const newManager = new Morel(_.extend(options, { }));
          newManager.getAll((err, samples) => {
            expect(samples.length).to.be.equal(1);
            const occurrenceFromDB = samples.at(0).occurrences.at(0);
            // check if change to image is permenant
            expect(occurrenceFromDB.images.length).to.be.equal(0);
            done();
          });
        });
      });
    });
  });

  describe('Sample', () => {
    it('destroys the images on sample destroy', (done) => {
      const image = new ImageModel();
      const occurrence = new Occurrence(null, {
        images: [image],
      });
      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add sample to storage
      manager.set(sample, () => {
        sinon.spy(image, 'destroy');

        sample.destroy().then(() => {
          expect(image.destroy.calledOnce).to.be.true;
          image.destroy.restore();
          done();
        });
      });
    });
  });
});
