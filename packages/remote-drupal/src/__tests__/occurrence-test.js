/* eslint max-classes-per-file: 0 */
import { Occurrence as OccOrig } from '@indicia-js/core';
import withRemote from '../';

const Occurrence = withRemote(OccOrig);

describe('Occurrence', function tests() {
  it('should have static keys property', () => {
    expect(typeof Occurrence.keys).toBe('object');
  });

  it('should have keys property', () => {
    const occ = new Occurrence();
    expect(occ.keys).toBe(Occurrence.keys);
  });

  it('should pass on the remote id', () => {
    const occ = new Occurrence({ id: 1 });
    expect(occ.id).toBe(1);
  });

  it('should extract the remote id when toJSON', () => {
    const occ = new Occurrence({ id: 1 });
    expect(occ.toJSON().id).toBe(1);
  });

  describe('getSubmission', () => {
    it('should return attribute values', () => {
      const occurrence = new Occurrence({
        attrs: {
          size: 'huge',
          number: 1234,
        },
      });
      occurrence.keys = { size: {}, number: {} };
      const submission = occurrence.getSubmission();
      expect(submission[0].fields.size).toBe('huge');
      expect(submission[0].fields.number).toBe(1234);
    });
    it('should return translate attribute keys and values if keys mapping is provided', () => {
      class CustomOccurrence extends Occurrence {
        keys = {
          size: {
            id: 'butterfly_size',
            values: {
              huge: 1,
            },
          },
        };
      }
      const occurrence = new CustomOccurrence({
        attrs: {
          size: 'huge',
        },
      });
      const submission = occurrence.getSubmission();
      expect(submission[0].fields.butterfly_size).toBe(1);
    });
    it('should support key value arrays', () => {
      // Given
      class CustomOccurrence extends Occurrence {
        keys = {
          size: {
            id: 'butterfly_size',
            values: [
              {
                value: 'huge',
                id: 1,
              },
            ],
          },
        };
      }
      const occurrence = new CustomOccurrence({
        attrs: { size: 'huge' },
      });
      // When
      const [submission] = occurrence.getSubmission();
      // Then
      expect(submission.fields.butterfly_size).toBe(1);
    });
    it('should support attribute value arrays', () => {
      class CustomOccurrence extends Occurrence {
        keys = {
          colour: {
            id: 'butterfly_colour',
            values: {
              red: 1,
              green: 2,
              black: 3,
            },
          },
        };
      }
      const occurrence = new CustomOccurrence({
        attrs: {
          colour: ['red', 'green'],
        },
      });
      const submission = occurrence.getSubmission();
      expect(submission[0].fields.butterfly_colour).toEqual([1, 2]);
    });
  });
});
