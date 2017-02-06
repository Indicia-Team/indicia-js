import _ from 'underscore';
import Morel from '../src/main';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import Media from '../src/Media';

/* eslint-disable no-unused-expressions */

const options = {
  host: API_BASE + API_VER + API_SAMPLES_PATH,
  api_key: 'mytest',
  website_id: 23,
  survey_id: 42,
  user: 'x',
  password: 'x',
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

  describe('Media', () => {
    it('should save sample on media save', (done) => {
      const media = new Media();
      const occurrence = new Occurrence(null, {
        media: [media],
      });
      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add sample to storage
      manager.set(sample)
        .then(() => {
          expect(manager.storage._cache.length).to.be.equal(1);

          // update the media and save it - the save should be permenant
          media.set('data', '1234');
          const req = media.save().then(() => {
            const newManager = new Morel(_.extend(options, { }));
            newManager.getAll()
              .then((samples) => {
                expect(samples.length).to.be.equal(1);
                const occurrenceFromDB = samples.at(0).occurrences.at(0);
                const imageFromDB = occurrenceFromDB.media.at(0);
                // check if change to media is permenant
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

    it('should save sample on media destroy', (done) => {
      const media = new Media();
      const occurrence = new Occurrence(null, {
        media: [media],
      });
      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add sample to storage
      manager.set(sample).then(() => {
        expect(manager.storage._cache.length).to.be.equal(1);

        media.destroy().then(() => {
          const newManager = new Morel(_.extend(options, { }));
          newManager.getAll().then((samples) => {
            expect(samples.length).to.be.equal(1);
            const occurrenceFromDB = samples.at(0).occurrences.at(0);
            // check if change to media is permenant
            expect(occurrenceFromDB.media.length).to.be.equal(0);
            done();
          });
        });
      });
    });
  });

  describe('Sample', () => {
    it('destroys the media on sample destroy', (done) => {
      const media = new Media();
      const occurrence = new Occurrence(null, {
        media: [media],
      });
      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add sample to storage
      manager.set(sample).then(() => {
        sinon.spy(media, 'destroy');

        sample.destroy().then(() => {
          expect(media.destroy.calledOnce).to.be.true;
          media.destroy.restore();
          done();
        });
      });
    });
  });
});
