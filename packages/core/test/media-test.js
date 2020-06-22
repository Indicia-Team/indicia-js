/* eslint-disable no-unused-expressions */

import { Media } from '../src';

describe('Media', function tests() {
  this.timeout(10000);

  it('should have default properties', () => {
    const media = new Media();

    expect(media.cid).to.be.a.string;
    expect(media.metadata).to.be.an('object');
    expect(media.attrs).to.be.an('object');
    expect(Object.keys(media.attrs).length).to.be.equal(0);
  });

  describe('getDataURI', () => {
    it('should accept media path', done => {
      const file = '/base/test/images/image.jpg';
      Media.getDataURI(file).then(args => {
        const [, type, width, height] = args;
        expect(type).to.be.equal('jpeg');
        expect(width).to.be.equal(960);
        expect(height).to.be.equal(710);
        done();
      });
    });

    it('should accept file input', done => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/base/test/images/image.jpg', true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        if (this.status === 200) {
          const file = this.response; // blob
          Media.getDataURI(file).then(args => {
            const [, type, width, height] = args;
            expect(type).to.be.equal('jpeg');
            expect(width).to.be.equal(960);
            expect(height).to.be.equal(710);
            done();
          });
        }
      };
      xhr.send();
    });

    it('should return its absolute URL', () => {
      const URL = 'http://domain.com/media.jpeg';
      const media = new Media({
        attrs: { data: URL },
      });
      expect(media.getURL).to.be.an('function');
      expect(media.getURL()).to.be.equal(URL);
    });
  });
});
