/* eslint no-unused-expressions: 0, max-classes-per-file: 0 */

import { Occurrence } from '../src';

describe('Occurrence', function tests() {
  this.timeout(10000);

  it('should have default properties', () => {
    const occurrence = new Occurrence();

    expect(occurrence.cid).to.be.a.string;
    expect(occurrence.metadata).to.be.an('object');
    expect(occurrence.attrs).to.be.an('object');
    expect(occurrence.media).to.be.an('array');
    expect(Object.keys(occurrence.attrs).length).to.be.equal(0);
  });

  it('should return JSON', () => {
    const item = Date.now().toString();
    const value = Math.random();
    const occurrence = new Occurrence();
    occurrence.attrs[item] = value;
    occurrence.metadata[item] = value;

    const json = occurrence.toJSON();

    expect(json.cid).to.be.equal(occurrence.cid);
    expect(json.attrs[item]).to.be.equal(value);
    expect(json.metadata[item]).to.be.equal(value);
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

      expect(submission[0].fields.size).to.be.equal('huge');
      expect(submission[0].fields.number).to.be.equal(1234);
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

      expect(submission[0].fields.butterfly_size).to.be.equal(1);
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
      expect(submission.fields.butterfly_size).to.be.equal(1);
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

      expect(submission[0].fields.butterfly_colour).to.be.eql([1, 2]);
    });
  });
});
