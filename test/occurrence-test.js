import Occurrence from '../src/Occurrence';
// import Sample from '../src/Sample';
// import { getRandomSample } from './helpers';

/* eslint-disable no-unused-expressions */
describe('Occurrence', function tests() {
  this.timeout(10000);

  it('should have default properties', () => {
    const occurrence = new Occurrence();

    expect(occurrence.cid).to.be.a.string;
    // expect(occurrence.attributes).to.be.an.object;
    // expect(Object.keys(occurrence.attributes).length).to.be.equal(0);
  });

  // it('should return JSON', () => {
  //   const item = Date.now().toString();
  //   const value = Math.random();
  //   const occurrence = new Occurrence();
  //   occurrence.set(item, value);

  //   const json = occurrence.toJSON();

  //   expect(json.cid).to.be.equal(occurrence.cid);
  //   expect(json.attributes[item]).to.be.equal(value);
  // });

  // it('should have a validator', () => {
  //   const occurrence = new Occurrence();
  //   expect(occurrence.validate).to.be.a('function');
  // });

  // it('should validate taxon', () => {
  //   const occurrence = new Occurrence();
  //   let invalids = occurrence.validate(null, { remote: true });

  //   expect(invalids).to.be.an('object');
  //   expect(invalids.attributes).to.be.an('object');
  //   expect(invalids.attributes.taxon).to.be.a('string');

  //   occurrence.set('taxon', 1234);

  //   invalids = occurrence.validate(null, { remote: true });
  //   expect(invalids).to.be.null;
  // });

  // it.skip('should save parent on destroy', done => {
  //   const sample = getRandomSample();

  //   // add sample to local storage
  //   sample.save().then(() => {
  //     sample
  //       .getOccurrence()
  //       .destroy()
  //       .then(() => {
  //         const newCollection = new Collection(null, { model: Sample });
  //         newCollection.fetch().then(() => {
  //           expect(newCollection.length).to.be.equal(1);
  //           const occurrenceFromDB = newCollection.at(0).getOccurrence();

  //           expect(occurrenceFromDB).to.not.exist;
  //           expect(sample.occurrences.length).to.be.equal(0);
  //           done();
  //         });
  //       });
  //   });
  // });

  // describe.skip('_getSubmission', () => {
  //   it('should return attribute values', () => {
  //     const occurrence = new Occurrence({
  //       size: 'huge',
  //       number: 1234,
  //     });
  //     const submission = occurrence._getSubmission();

  //     expect(submission[0].fields.size).to.be.equal('huge');
  //     expect(submission[0].fields.number).to.be.equal(1234);
  //   });

  //   it('should return translate attribute keys and values if keys mapping is provided', () => {
  //     const keys = {
  //       size: {
  //         id: 'butterfly_size',
  //         values: {
  //           huge: 1,
  //         },
  //       },
  //     };
  //     const occurrence = new Occurrence(
  //       {
  //         size: 'huge',
  //       },
  //       { keys }
  //     );
  //     const submission = occurrence._getSubmission();

  //     expect(submission[0].fields.butterfly_size).to.be.equal(1);
  //   });

  //   it('should support attribute value arrays', () => {
  //     const keys = {
  //       colour: {
  //         id: 'butterfly_colour',
  //         values: {
  //           red: 1,
  //           green: 2,
  //           black: 3,
  //         },
  //       },
  //     };
  //     const occurrence = new Occurrence(
  //       {
  //         colour: ['red', 'green'],
  //       },
  //       { keys }
  //     );
  //     const submission = occurrence._getSubmission();

  //     expect(submission[0].fields.butterfly_colour).to.be.eql([1, 2]);
  //   });
  // });
});
