/* eslint-disable no-unused-expressions */

import { Sample, Occurrence, Media } from '../src';
import { getRandomSample, makeRequestResponse } from './helpers';

describe('Sample', function tests() {
  this.timeout(10000);

  it('should have default properties', () => {
    const sample = new Sample();

    expect(sample.cid).to.be.a.string;
    expect(sample.metadata).to.be.an('object');
    expect(sample.attrs).to.be.an('object');
    expect(sample.samples).to.be.an('array');
    expect(sample.occurrences).to.be.an('array');
    expect(sample.media).to.be.an('array');
  });

  it('should have default metadata', () => {
    // Given
    const sample = new Sample();

    // Then
    expect(sample.metadata).to.be.an('object');
    expect(sample.metadata.created_on).to.be.instanceOf(Date);
    expect(sample.metadata.updated_on).to.be.instanceOf(Date);
  });

  describe('toJSON', () => {
    it('should return JSON representation of the model and its submodels', () => {
      // Given
      const occurrence = new Occurrence();
      const sample = new Sample();
      const subSample = new Sample();
      subSample.occurrences.push(occurrence);
      sample.samples.push(subSample);

      // When
      const { occurrences, samples } = sample.toJSON();

      // Then
      expect(occurrences.length).to.be.equal(0);
      expect(samples.length).to.be.equal(1);
      expect(samples[0].cid).to.be.equal(subSample.cid);
      expect(samples[0].occurrences.length).to.be.equal(1);
      expect(samples[0].occurrences[0].cid).to.be.equal(occurrence.cid);
    });
  });

  describe('fromJSON', () => {
    it('should restore sample from JSON', () => {
      // Given
      const json = {
        cid: '132d30fa-81bf-43c4-9a45-86e3de72a6f9',
        metadata: {
          survey_id: null,
          input_form: null,
          created_on: '2020-01-09T07:55:21.445Z',
          updated_on: '2020-01-09T07:55:21.445Z',
          synced_on: null,
          server_on: null,
        },
        attrs: {
          date: '2020-01-10T09:07:22.227Z',
          location_type: 'latlon',
          comment: 'my comment',
        },
        occurrences: [],
        samples: [
          {
            cid: '7bbf45be-c061-4934-b004-8c9294806fe8',
            metadata: {
              survey_id: null,
              input_form: null,
              created_on: '2020-01-09T08:03:18.035Z',
              updated_on: '2020-01-09T08:03:18.035Z',
              synced_on: null,
              server_on: null,
              complex_survey: 'default',
            },
            attrs: {
              date: '2020-01-09T08:03:18.035Z',
              location_type: 'latlon',
            },
            occurrences: [
              {
                cid: '54c70a82-3a64-470a-bdaf-b2f4abbfcf0a',
                metadata: {
                  training: null,
                  created_on: '2020-01-09T08:03:18.049Z',
                  updated_on: '2020-01-09T08:03:18.049Z',
                  synced_on: null,
                  server_on: null,
                },
                attrs: {
                  taxon: {
                    array_id: 8541,
                    species_id: 5,
                    found_in_name: 0,
                    warehouse_id: 61710,
                    group: 132,
                    scientific_name: 'Ensis siliqua',
                    common_names: ['Pod Razor Shell'],
                  },
                  comment: 'asdasd',
                  'number-ranges': '6-20',
                  stage: 'Other',
                  identifiers: ['asdasd'],
                  sex: 'Male',
                },
                media: [],
              },
            ],
            samples: [],
            media: [],
          },
          {
            cid: '19f4cf2e-47d6-47e4-ba82-5571ef346fa0',
            metadata: {
              survey_id: null,
              input_form: null,
              created_on: '2020-01-09T08:57:57.643Z',
              updated_on: '2020-01-09T08:57:57.643Z',
              synced_on: null,
              server_on: null,
              complex_survey: 'default',
            },
            attrs: {
              date: '2020-01-09T08:57:57.643Z',
              location_type: 'latlon',
              location: {
                latitude: 51.78723735509322,
                longitude: -1.4214871476435456,
              },
            },
            occurrences: [
              {
                cid: 'a48d44a4-aa75-49b1-9148-d33ee285ddc4',
                metadata: {
                  training: true,
                  created_on: '2020-01-09T08:57:57.650Z',
                  updated_on: '2020-01-09T08:57:57.650Z',
                  synced_on: null,
                  server_on: null,
                },
                attrs: {
                  taxon: {
                    warehouse_id: 215642,
                  },
                },
                media: [],
              },
            ],
            samples: [],
            media: [],
          },
        ],
        media: [],
      };

      // When
      const sample = Sample.fromJSON(json);

      // Then
      expect(sample.samples.length).to.be.equal(2);
      expect(
        sample.samples[1].occurrences[0].attrs.taxon.warehouse_id
      ).to.be.equal(215642);

      expect(JSON.stringify(sample.toJSON())).to.deep.equal(
        JSON.stringify(json)
      );
    });
  });

  describe('saveRemote', () => {
    let _createRemoteStub;
    beforeEach(() => {
      _createRemoteStub = sinon.stub(Sample.prototype, '_createRemote');
    });
    afterEach(() => {
      _createRemoteStub.restore();
      Sample.__ResetDependency__('makeRequest');
    });

    it('should post submission', async () => {
      // Given
      const sample = getRandomSample();
      _createRemoteStub.resolves({ data: {} });

      // When
      await sample.saveRemote();

      // Then
      expect(_createRemoteStub.calledOnce).to.be.true;
    });

    it('should update model after success', async () => {
      // Given
      const newWarehouseId = 123;
      const sample = getRandomSample();
      _createRemoteStub.resolves({
        data: { id: newWarehouseId, external_key: sample.cid },
      });

      // When
      await sample.saveRemote();

      // Then
      expect(sample.id).to.eql(newWarehouseId);
      expect(sample.metadata.server_on).to.exist;
      expect(sample.metadata.synced_on).to.exist;
      expect(sample.metadata.updated_on).to.exist;
    });

    it('should update remote status', async () => {
      // Given
      const sample = getRandomSample();
      let resolve;
      _createRemoteStub.returns(new Promise(_r => (resolve = _r))); // eslint-disable-line

      // When

      const saveRemoteComplete = sample.saveRemote();

      // Then
      expect(sample.remote.synchronising).to.be.true;

      resolve({ data: {} });
      await saveRemoteComplete;

      expect(sample.remote.synchronising).to.be.false;
    });

    // todo: we should fix this eventually
    it('should ignore the duplication error', async () => {
      // Given
      const sample = getRandomSample();

      _createRemoteStub.restore();
      Sample.__Rewire__('makeRequest', () =>
        makeRequestResponse('DUPLICATE', sample)
      );

      expect(sample.id).to.be.undefined;
      expect(sample.occurrences[0].id).to.be.undefined;

      // When
      await sample.saveRemote();

      // Then
      expect(sample.id).to.be.a('number');
      expect(sample.occurrences[0].id).to.be.a('number');
    });

    it('should send both dataURI and absolute pathed images', async () => {
      // Given
      const image1 = new Media({
        attrs: {
          data: 'http://localhost:9876/base/test/images/image.jpg',
          type: 'png',
        },
      });

      const image2 = new Media({
        attrs: {
          data:
            'data:media/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAolBMVEX///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBgYAAAAAAAAAAAAFBQUFBQUEBAQEBAQEBAQICAQEBAQEBwQHBwcHBwcHBwcHBwMHCgMGBgYKCgoGBgYJCQYJCQkJCQkICwgICAgICwgICwgICwgICwgICwgLDQtGnG0lAAAANnRSTlMAAQIDBAUGDQ4PEBEUFRobHB4gIiMkJigsLjAyMzk6PEFCRUZISUtMUFBRVFdZW1xcXV5fYGEIq40aAAAAj0lEQVQYGZ3B2RZCUAAF0CNEAyql0iiNaDCc//+1ZK2L7kMP7Y3fjL6Gb8oiIYvARItyIPMH+bTQ8Jl6HQzOTHQI6osuSlrMOQSLd1SW3ENweEVlxhBCj1kXHxtuUYu4Q2mY0UbNLnhynXXKEA01YeWoo7Eio8stmKDFzJkZkISkD4lDxiokU3IEmeKN8ac3/toPTnqnlzkAAAAASUVORK5CYII=',
          type: 'png',
        },
      });

      const sample = getRandomSample();
      sample.media.push(image1, image2);

      const submission = new Promise(r =>
        _createRemoteStub.callsFake(data => r([...data.entries()]))
      );

      // When
      sample.saveRemote();

      // Then
      const [, file1, file2] = await submission;
      expect(file1).to.exist;
      expect(file1[1]).instanceOf(File);

      expect(file2).to.exist;
      expect(file2[1]).instanceOf(File);
    });
  });

  describe('getSubmission', () => {
    it('should return attribute values', () => {
      // Given
      const smp = new Sample({
        attrs: {
          comment: 'huge',
          sample_method_id: 1234,
        },
      });

      // When
      const [submission] = smp.getSubmission();

      // Then
      expect(submission.fields.comment).to.be.equal('huge');
      expect(submission.fields.sample_method_id).to.be.equal(1234);
    });

    it('should return translate attribute keys and values if keys mapping is provided', () => {
      // Given
      const keys = {
        size: {
          id: 'butterfly_size',
          values: {
            huge: 1,
          },
        },
      };
      const smp = new Sample({ attrs: { size: 'huge' } });
      smp.keys = keys;

      // When
      const [submission] = smp.getSubmission();

      // Then
      expect(submission.fields.butterfly_size).to.be.equal(1);
    });

    it('should support attribute value arrays', () => {
      // Given
      const keys = {
        colour: {
          id: 'butterfly_colour',
          values: {
            red: 1,
            green: 2,
            black: 3,
          },
        },
      };
      const smp = new Sample({ attrs: { colour: ['red', 'green'] } });
      smp.keys = keys;

      // When
      const [submission] = smp.getSubmission();

      // Then
      expect(submission.fields.butterfly_colour).to.be.eql([1, 2]);
    });

    it('should pass on child models flags', () => {
      // Given
      const sample = getRandomSample();
      sample.metadata = {
        ...sample.metadata,

        training: true,
        release_status: true,
        record_status: true,
        sensitive: true,
        confidential: true,
        sensitivity_precision: true,
      };
      sample.samples.push(getRandomSample());

      // When
      const [submission] = sample.getSubmission();

      // Then
      const [occ] = submission.occurrences;
      expect(occ.training).to.equal(true);
      expect(occ.release_status).to.equal(true);
      expect(occ.record_status).to.equal(true);
      expect(occ.sensitive).to.equal(true);
      expect(occ.confidential).to.equal(true);
      expect(occ.sensitivity_precision).to.equal(true);

      const [subSampleOcc] = submission.samples[0].occurrences;
      expect(subSampleOcc.training).to.equal(true);
      expect(subSampleOcc.release_status).to.equal(true);
      expect(subSampleOcc.record_status).to.equal(true);
      expect(subSampleOcc.sensitive).to.equal(true);
      expect(subSampleOcc.confidential).to.equal(true);
      expect(subSampleOcc.sensitivity_precision).to.equal(true);
    });
  });
});
