import _ from 'underscore';
import Morel from '../src/main';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import ImageModel from '../src/Image';

/* eslint-disable no-unused-expressions */

const options = {
  host: API_BASE + API_VER + API_SAMPLES_PATH,
  appname: 'test',
  appsecret: 'mytest',
  website_id: 23,
  survey_id: 42,
};

let manager;

describe('Saving/destroying propagation', () => {
  before((done) => {
    manager = new Morel(_.extend(options, { }));
    manager.clear().then(done);
  });

  beforeEach(() => {
    manager = new Morel(_.extend(options, { }));
  });

  afterEach((done) => {
    manager.clear().then(done);
  });

  describe('Image', () => {
    it('should save sample on image save', (done) => {
      const image = new ImageModel();
      const subModel = new Occurrence(null, {
        images: [image],
      });
      const sample = new Sample(null, {
        subModels: [subModel],
      });

      // add sample to storage
      manager.set(sample)
        .then(() => {
          expect(manager.storage._cache.length).to.be.equal(1);

          // update the image and save it - the save should be permenant
          image.set('data', '1234');
          const req = image.save().then(() => {
            const newManager = new Morel(_.extend(options, { }));
            newManager.getAll()
              .then((samples) => {
                expect(samples.length).to.be.equal(1);
                const subModelFromDB = samples.at(0).subModels.at(0);
                const imageFromDB = subModelFromDB.images.at(0);
                // check if change to image is permenant
                expect(imageFromDB.get('data')).to.be.equal('1234');
                done();
              });
          });
          expect(req).to.be.an.instanceof(Promise);
        })
        .catch((err) => {
          if (err) throw err.message;
        });
    });

    it('should save sample on image destroy', (done) => {
      const image = new ImageModel();
      const subModel = new Occurrence(null, {
        images: [image],
      });
      const sample = new Sample(null, {
        subModels: [subModel],
      });

      // add sample to storage
      manager.set(sample).then(() => {
        expect(manager.storage._cache.length).to.be.equal(1);

        image.destroy().then(() => {
          const newManager = new Morel(_.extend(options, { }));
          newManager.getAll().then((samples) => {
            expect(samples.length).to.be.equal(1);
            const subModelFromDB = samples.at(0).subModels.at(0);
            // check if change to image is permenant
            expect(subModelFromDB.images.length).to.be.equal(0);
            done();
          });
        });
      });
    });
  });

  describe('Sample', () => {
    it('destroys the images on sample destroy', (done) => {
      const image = new ImageModel();
      const subModel = new Occurrence(null, {
        images: [image],
      });
      const sample = new Sample(null, {
        subModels: [subModel],
      });

      // add sample to storage
      manager.set(sample).then(() => {
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
