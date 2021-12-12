/* eslint max-classes-per-file: 0 */
import { Media as MediaOrig } from '@indicia-js/core';
import withRemote from '../';

const Media = withRemote(MediaOrig);

describe('Media', function tests() {
  it('should pass on the remote id', () => {
    const media = new Media({ id: 1 });
    expect(media.id).toBe(1);
  });
  it('should extract the remote id when toJSON', () => {
    const media = new Media({ id: 1 });
    expect(media.toJSON().id).toBe(1);
  });
});
