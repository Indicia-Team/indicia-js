/* eslint-disable no-unused-expressions */
import stringify from 'json-stable-stringify'; // eslint-disable-line
import { Sample, Occurrence } from '../';

describe('Sample', function tests() {
  it('should have default properties', () => {
    const sample = new Sample();

    expect(typeof sample.cid).toBe('string');
    expect(sample.metadata).toBeInstanceOf(Object);
    expect(sample.attrs).toBeInstanceOf(Object);
    expect(Array.isArray(sample.samples)).toBe(true);
    expect(Array.isArray(sample.occurrences)).toBe(true);
    expect(Array.isArray(sample.media)).toBe(true);
  });

  it('should have default metadata', () => {
    // Given
    const sample = new Sample();

    // Then
    expect(sample.metadata).toBeInstanceOf(Object);
    expect(sample.metadata.created_on).toBeInstanceOf(Date);
    expect(sample.metadata.updated_on).toBeInstanceOf(Date);
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
      expect(occurrences.length).toBe(0);
      expect(samples.length).toBe(1);
      expect(samples[0].cid).toBe(subSample.cid);
      expect(samples[0].occurrences.length).toBe(1);
      expect(samples[0].occurrences[0].cid).toBe(occurrence.cid);
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
      expect(sample.samples.length).toBe(2);
      expect(sample.samples[1].occurrences[0].attrs.taxon.warehouse_id).toBe(
        215642
      );

      expect(stringify(sample.toJSON())).toEqual(stringify(json));
    });
  });
});
