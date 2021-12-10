/* eslint-disable no-unused-expressions */

import { Media } from '../';

describe('Media', function tests() {
  it('should have default properties', () => {
    const media = new Media();

    expect(typeof media.cid).toBe('string');
    expect(typeof media.metadata.created_on).toBe('string');
    expect(media.metadata.synced_on).toBe(null);
    expect(media.attrs).toBeInstanceOf(Object);
    expect(Object.keys(media.attrs).length).toBe(0);
  });

  describe('getDataURI', () => {
    // it('should accept media path', async () => {
    //   const file = '/base/test/images/image.jpg';

    //   const args = await Media.getDataURI(file);

    //   const [, type, width, height] = args;
    //   expect(type).toBe('jpeg');
    //   expect(width).toBe(960);
    //   expect(height).toBe(710);
    // });

    // it('should accept file input', done => {
    //   const xhr = new XMLHttpRequest();
    //   xhr.open('GET', '/base/test/images/image.jpg', true);
    //   xhr.responseType = 'blob';
    //   xhr.onload = async function() {
    //     if (this.status === 200) {
    //       const file = this.response; // blob
    //       const args = await Media.getDataURI(file);
    //       const [, type, width, height] = args;
    //       expect(type).toBe('jpeg');
    //       expect(width).toBe(960);
    //       expect(height).toBe(710);

    //       done();
    //     }
    //   };
    //   xhr.send();
    // });

    it('should return its absolute URL', () => {
      const URL = 'http://domain.com/media.jpeg';
      const media = new Media({
        attrs: { data: URL },
      });
      expect(media.getURL).toBeInstanceOf(Function);
      expect(media.getURL()).toBe(URL);
    });
  });
});
