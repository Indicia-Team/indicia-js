import $ from 'jquery';
import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import ImageModel from '../src/Image';

/* eslint-disable no-unused-expressions */

const options = {
  url: '/mobile/submit',
  appname: 'test',
  appsecret: 'mytest',
  website_id: 23,
  survey_id: 42,
};

export default function (manager) {
  describe('Sync', () => {
    let server;

    const okResponse = [200, { 'Content-Type': 'text/html' }, ''];
    const errResponse = [502, { 'Content-Type': 'text/html' }, ''];

    function getRandomSample() {
      const occurrence = new Occurrence({
        taxon: 1234,
      });
      const sample = new Sample({
        location: ' 12.12, -0.23',
      }, {
        occurrences: [occurrence],
        manager,
      });

      return sample;
    }

    before(() => {
      server = sinon.fakeServer.create();
      server.respondImmediately = true;
    });

    beforeEach(() => {
      sinon.spy(manager, 'sync');
      sinon.spy(Morel.prototype, 'post');
    });

    after(() => {
      server.restore();
    });

    afterEach((done) => {
      Morel.prototype.post.restore();
      manager.sync.restore();
      manager.clear(done);
    });

    it('should return error if no manager', () => {
      const sample = new Sample();
      sample.save(null, {
        error: (err) => {
          expect(err).to.not.be.null;
        },
      });
    });

    it('should save locally', (done) => {
      const sample = getRandomSample();

      const valid = sample.save(null, {
        success: () => {
          expect(manager.sync.called).to.be.false;
          done();
        },
      });

      expect(valid).to.be.not.false;
    });

    it('should post with remote option', (done) => {
      server.respondWith('POST', '/mobile/submit', okResponse);
      const sample = getRandomSample();

      const valid = sample.save(null, {
        remote: true,
        success: () => {
          expect(manager.sync.calledOnce).to.be.true;
          done();
        },
      });

      expect(valid).to.be.instanceOf(Promise);
    });

    it('should update remotely synced record', (done) => {
      server.respondWith('POST', '/mobile/submit', okResponse);
      const sample = getRandomSample();

      sample.save(null, {
        remote: true,
        success: () => {
          // get new manager without cached samples
          const Storage = manager.storage.Storage;
          const newManager = new Morel(_.extend(options, { Storage }));
          newManager.get(sample, (err, savedSample) => {
            expect(savedSample.getSyncStatus()).to.be.equal(Morel.SYNCED);
            done(err);
          });
        },
      });
    });

    it('should validate before remote sending', () => {
      const occurrence = new Occurrence();
      const sample = new Sample(null, {
        occurrences: [occurrence],
        manager,
      });

      const valid = sample.save(null, { remote: true });
      expect(valid).to.be.false;
    });

    it('should return error if unsuccessful remote sync', (done) => {
      server.respondWith('POST', '/mobile/submit', errResponse);
      const sample = getRandomSample();

      const valid = sample.save(null, {
        remote: true,
        error: (model, xhr, errorThrown) => {
          expect(manager.sync.calledOnce).to.be.true;
          expect(errorThrown).to.not.be.null;
          done();
        },
      });

      expect(valid).to.be.instanceOf(Promise);
    });

    it('should set synchronising flag on sample', () => {
      const sample = getRandomSample();

      sample.save(null, { remote: true });
      expect(sample.synchronising).to.be.true;
    });


    it('should not double sync', (done) => {
      server.respondWith('POST', '/mobile/submit', okResponse);
      const sample = getRandomSample();

      let valid = sample.save(null, {
        remote: true,
        success: () => {
          expect(manager.sync.calledTwice).to.be.true;
          expect(Morel.prototype.post.calledOnce).to.be.true;
          done();
        },
      });

      expect(valid).to.be.instanceOf(Promise);

      valid = sample.save(null, {
        remote: true,
        // should not be called
        success: () => { expect(true).to.be.false; },
        error: () => { expect(true).to.be.false; },
      });

      expect(valid).to.be.false;
    });

    it('should timeout', (done) => {
      server.respondImmediately = false;
      const clock = sinon.useFakeTimers();
      const errorCallback = sinon.spy();

      const origCall = $.ajax;
      const stub = sinon.stub($, 'ajax', (...args) => {
        origCall.apply($, args);
        clock.tick(29000);
        expect(errorCallback.calledOnce).to.be.false;
        clock.tick(2000);
        expect(errorCallback.calledOnce).to.be.true;
        stub.restore();
        done();
      });

      const sample = getRandomSample();

      sample.save(null, {
        remote: true,
        error: errorCallback,
      });
    });

    // it('should fire model sync events', (done) => {
    //   const events = ['sync', 'request', 'error'];
    //   const sample = getRandomSample();
    //
    //   manager.set(sample, () => {
    //     manager.on(events.join(' '), () => {
    //       events.pop();
    //       if (!events.length) done();
    //     });
    //
    //     sample.trigger('sync');
    //     sample.trigger('request');
    //     sample.trigger('error');
    //   });
    // });

    describe('occurrences with images', (done) => {
      it('should send both dataURI and absolute pathed images', () => {
        server.respondWith('POST', '/mobile/submit', okResponse);
        const image1 = new ImageModel({
          data: 'https://wiki.ceh.ac.uk/download/attachments/119117334/ceh%20logo.png',
          type: 'png',
        });

        const image2 = new ImageModel({
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAolBMVEX///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBgYAAAAAAAAAAAAFBQUFBQUEBAQEBAQEBAQICAQEBAQEBwQHBwcHBwcHBwcHBwMHCgMGBgYKCgoGBgYJCQYJCQkJCQkICwgICAgICwgICwgICwgICwgICwgLDQtGnG0lAAAANnRSTlMAAQIDBAUGDQ4PEBEUFRobHB4gIiMkJigsLjAyMzk6PEFCRUZISUtMUFBRVFdZW1xcXV5fYGEIq40aAAAAj0lEQVQYGZ3B2RZCUAAF0CNEAyql0iiNaDCc//+1ZK2L7kMP7Y3fjL6Gb8oiIYvARItyIPMH+bTQ8Jl6HQzOTHQI6osuSlrMOQSLd1SW3ENweEVlxhBCj1kXHxtuUYu4Q2mY0UbNLnhynXXKEA01YeWoo7Eio8stmKDFzJkZkISkD4lDxiokU3IEmeKN8ac3/toPTnqnlzkAAAAASUVORK5CYII=',
          type: 'png',
        });

        const occurrence = new Occurrence({
          taxon: 1234,
        }, {
          images: [image1, image2],
        });
        const sample = new Sample({
          location: ' 12.12, -0.23',
        }, {
          occurrences: [occurrence],
          manager,
        });

        sample.save(null, {
          remote: true,
          success: () => {
            done();
          },
        });
      });
    });
  });
}
