/* eslint no-unused-expressions: 0, max-classes-per-file: 0 */

import { Occurrence } from '../';

describe('Occurrence', function tests() {
  it('should have default properties', () => {
    const occurrence = new Occurrence();

    expect(typeof occurrence.cid).toBe('string');
    expect(occurrence.metadata).toBeInstanceOf(Object);
    expect(occurrence.attrs).toBeInstanceOf(Object);
    expect(Array.isArray(occurrence.media)).toBe(true);
    expect(Object.keys(occurrence.attrs).length).toBe(0);
  });

  it('should return JSON', () => {
    const item = Date.now().toString();
    const value = Math.random();
    const occurrence = new Occurrence();
    occurrence.attrs[item] = value;
    occurrence.metadata[item] = value;

    const json = occurrence.toJSON();

    expect(json.cid).toBe(occurrence.cid);
    expect(json.attrs[item]).toBe(value);
    expect(json.metadata[item]).toBe(value);
  });
});
