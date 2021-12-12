/* eslint max-classes-per-file: 0 */
import { Media as MediaOrig } from '@indicia-js/core';
import _mediaDependencies from '../Media';
import withRemote from '../';

const imageDataURI =
  'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7';

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

  it('should have a remote config placeholder', () => {
    // Given
    const media = new Media({ id: 1 });

    // When
    // Then
    expect(media.remote.synchronising).toBe(false);
  });

  describe('uploadFile', () => {
    it('should throw an error if the model has an id', async () => {
      // Given
      const media = new Media({ id: 1 });

      // When
      try {
        await media.uploadFile();
      } catch (error) {
        // Then
        expect(!!error).toBe(true);
        return;
      }

      // Then this should not execute
      expect(false).toBe(true);
    });

    it('should set a queued attr', async () => {
      // Given
      const media = new Media({ attrs: { type: 'gif', data: imageDataURI } });

      const queued = 'remoteName.gif';

      _mediaDependencies.__Rewire__('makeRequest', () =>
        Promise.resolve({ [media.cid]: { name: queued } })
      );

      // When
      await media.uploadFile();

      // Then
      expect(media.attrs.queued).toBe(queued);
    });

    it('should update synced_on', async () => {
      // Given
      const media = new Media({ attrs: { type: 'gif', data: imageDataURI } });

      const queued = 'remoteName.gif';

      _mediaDependencies.__Rewire__('makeRequest', () =>
        Promise.resolve({ [media.cid]: { name: queued } })
      );

      // When
      await media.uploadFile();

      // Then
      expect(media.metadata.created_on < media.metadata.synced_on).toBe(true);
    });
  });

  describe('getRemoteURL', () => {
    it('should return a remote media URL', () => {
      // Given
      const media = new Media({ attrs: { path: 'filename' } });
      media.remote.url = 'http://123';

      // When
      const URL = media.getRemoteURL();

      // Then this should not execute
      expect(URL).toBe('http://123/upload/filename');
    });

    it('should return a queued media URL', () => {
      // Given
      const media = new Media({ attrs: { queued: 'filename' } });
      media.remote.url = 'http://123';

      // When
      const URL = media.getRemoteURL();

      // Then this should not execute
      expect(URL).toBe('http://123/upload-queue/filename');
    });

    it('should throw an error if file was not queued or saved to remote', () => {
      // Given
      const media = new Media({ attrs: { queued: null } });
      media.remote.url = 'http://123';

      // When
      try {
        media.getRemoteURL();
      } catch (error) {
        // Then
        expect(error.message).toBe('No media queued or path attribute.');
        return;
      }

      // Then this should not execute
      expect(false).toBe(true);
    });

    it('should throw an error if no remote config was set', () => {
      // Given
      const media = new Media({ attrs: { queued: 'filename' } });

      // When
      try {
        media.getRemoteURL();
      } catch (error) {
        // Then
        expect(error.message).toBe('No remote url was set.');
        return;
      }

      // Then this should not execute
      expect(false).toBe(true);
    });
  });
});
