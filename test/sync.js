import $ from 'jquery';
import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';

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
      const sample = getRandomSample();

      const valid = sample.save(null, {
        remote: true,
        success: () => {
          expect(manager.sync.calledOnce).to.be.true;
          done();
        },
      });

      expect(valid).to.be.an('object');

      server.respondWith('POST', '/mobile/submit', okResponse);
      server.respond();
    });

    it('should update remotely synced record', (done) => {
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

      server.respondWith('POST', '/mobile/submit', okResponse);
      server.respond();
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
      const sample = getRandomSample();

      const valid = sample.save(null, {
        remote: true,
        error: (model, xhr, errorThrown) => {
          expect(manager.sync.calledOnce).to.be.true;
          expect(errorThrown).to.not.be.null;
          done();
        },
      });

      expect(valid).to.be.an('object');

      server.respondWith('POST', '/mobile/submit', errResponse);
      server.respond();
    });

    it('should not double sync', (done) => {
      const sample = getRandomSample();

      let valid = sample.save(null, {
        remote: true,
        success: () => {
          expect(manager.sync.calledTwice).to.be.true;
          expect(Morel.prototype.post.calledOnce).to.be.true;
          done();
        },
      });

      expect(valid).to.be.an('object');

      valid = sample.save(null, {
        remote: true,
        // should not be called
        success: () => { expect(true).to.be.false; },
        error: () => { expect(true).to.be.false; },
      });

      expect(valid).to.be.false;

      server.respondWith('POST', '/mobile/submit', okResponse);
      server.respond();
    });

    it('should timeout', () => {
      const clock = sinon.useFakeTimers();
      const errorCallback = sinon.spy();
      const sample = getRandomSample();

      sample.save(null, {
        remote: true,
        error: errorCallback,
      });

      clock.tick(29000);
      expect(errorCallback.calledOnce).to.be.false;
      clock.tick(2000);
      expect(errorCallback.calledOnce).to.be.true;
    });
  });
}
