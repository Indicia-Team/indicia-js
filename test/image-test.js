import ImageModel from '../src/Image';

describe('Image', () => {

  describe('getDataURI', () => {
    it('should accept image path', (done) => {
      const file = '/base/test/images/image.jpg';
      ImageModel.getDataURI(file, (err, dataURI, type, width, height) => {
        expect(type).to.be.equal('jpeg');
        expect(width).to.be.equal(960);
        expect(height).to.be.equal(710);
        done();
      });
    });


    it('should accept file input', (done) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/base/test/images/image.jpg', true);
      xhr.responseType = 'blob';
      xhr.onload = function(e) {
        if (this.status === 200) {
          var file = this.response; // blob
          ImageModel.getDataURI(file, (err, dataURI, type, width, height) => {
            expect(type).to.be.equal('jpeg');
            expect(width).to.be.equal(960);
            expect(height).to.be.equal(710);
            done();
          });
        }
      };
      xhr.send();
    });
  });
});
