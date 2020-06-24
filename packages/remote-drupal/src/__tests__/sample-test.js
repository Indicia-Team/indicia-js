import {
  Sample as SmpOrig,
  Media as MediaOrig,
  Occurrence as OccOrig,
} from '@indicia-js/core';
import sinon from 'sinon';
import _sampleDependencies from '../Sample';
import withRemote from '../';
import makeRequestResponse from './helpers';

const Sample = withRemote(SmpOrig);
const Occurrence = withRemote(OccOrig);
const Media = withRemote(MediaOrig);

function getRandomSample(samples = [], occurrences = []) {
  if (!occurrences.length) {
    const occurrence = new Occurrence({
      taxon: 1234,
    });
    occurrences.push(occurrence);
  }

  class RemoteReadySample extends Sample {
    remote = {
      api_key: 'x',
      host_url: 'x',
      timeout: 100,
    };

    attrs = { location: ' 12.12, -0.23' };

    samples = samples || [];

    occurrences = occurrences || [];
  }

  return new RemoteReadySample();
}

describe('Sample', function tests() {
  it('should have static keys property', () => {
    expect(typeof Sample.keys).toBe('object');
  });

  it('should have keys property', () => {
    const smp = new Sample();
    expect(smp.keys).toBe(Sample.keys);
  });

  it('should pass on the remote id', () => {
    const smp = new Sample({ id: 1 });
    expect(smp.id).toBe(1);
  });

  it('should extract the remote id when toJSON', () => {
    const smp = new Sample({ id: 1 });
    expect(smp.toJSON().id).toBe(1);
  });

  it('should have a remote config placeholder', () => {
    // Given
    // When
    const smp = new Sample({ id: 1 });

    // Then
    expect(smp.remote.synchronising).toBe(false);
  });

  describe('saveRemote', () => {
    let _createRemoteStub;
    beforeEach(() => {
      _createRemoteStub = sinon.stub(Sample.prototype, '_createRemote');
    });
    afterEach(() => {
      _createRemoteStub.restore();
      _sampleDependencies.__ResetDependency__('makeRequest');
    });

    it('should post submission', async () => {
      // Given
      const sample = getRandomSample();
      _createRemoteStub.resolves({ data: {} });

      // When
      await sample.saveRemote();

      // Then
      expect(_createRemoteStub.calledOnce).toBe(true);
    });

    it('should update model after success', async () => {
      // Given
      const newWarehouseId = 123;
      const sample = getRandomSample();
      _createRemoteStub.resolves({
        data: { id: newWarehouseId, external_key: sample.cid },
      });

      // When
      await sample.saveRemote();

      // Then
      expect(sample.id).toEqual(newWarehouseId);
      expect(sample.metadata.server_on).toBeDefined();
      expect(sample.metadata.synced_on).toBeDefined();
      expect(sample.metadata.updated_on).toBeDefined();
    });

    it('should update remote status', async () => {
      // Given
      const sample = getRandomSample();
      let resolve;
      _createRemoteStub.returns(new Promise(_r => (resolve = _r))); // eslint-disable-line

      // When
      const saveRemoteComplete = sample.saveRemote();

      // Then
      expect(sample.remote.synchronising).toBe(true);

      resolve({ data: {} });
      await saveRemoteComplete;

      expect(sample.remote.synchronising).toBe(false);
    });

    // todo: we should fix this eventually
    it('should ignore the duplication error', async () => {
      // Given
      const sample = getRandomSample();

      _createRemoteStub.restore();
      _sampleDependencies.__Rewire__('makeRequest', () =>
        makeRequestResponse('DUPLICATE', sample)
      );

      expect(sample.id).toBeUndefined();
      expect(sample.occurrences[0].id).toBeUndefined();

      // When
      await sample.saveRemote();

      // Then
      expect(typeof sample.id).toBe('number');
      expect(typeof sample.occurrences[0].id).toBe('number');
    });

    it('should send both dataURI', async () => {
      // Given
      const image1 = new Media({
        attrs: {
          data:
            'data:media/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAolBMVEX///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBgYAAAAAAAAAAAAFBQUFBQUEBAQEBAQEBAQICAQEBAQEBwQHBwcHBwcHBwcHBwMHCgMGBgYKCgoGBgYJCQYJCQkJCQkICwgICAgICwgICwgICwgICwgICwgLDQtGnG0lAAAANnRSTlMAAQIDBAUGDQ4PEBEUFRobHB4gIiMkJigsLjAyMzk6PEFCRUZISUtMUFBRVFdZW1xcXV5fYGEIq40aAAAAj0lEQVQYGZ3B2RZCUAAF0CNEAyql0iiNaDCc//+1ZK2L7kMP7Y3fjL6Gb8oiIYvARItyIPMH+bTQ8Jl6HQzOTHQI6osuSlrMOQSLd1SW3ENweEVlxhBCj1kXHxtuUYu4Q2mY0UbNLnhynXXKEA01YeWoo7Eio8stmKDFzJkZkISkD4lDxiokU3IEmeKN8ac3/toPTnqnlzkAAAAASUVORK5CYII=',
          type: 'png',
        },
      });

      const sample = getRandomSample();
      sample.media.push(image1);

      let submission;
      _createRemoteStub.callsFake(data => {
        submission = [...data.entries()];
        return { data: {} };
      });

      // When
      await sample.saveRemote();

      // Then
      const [, file1] = submission;
      expect(file1).toBeDefined();
      expect(file1[1]).toBeInstanceOf(File);
    });
  });

  describe('getSubmission', () => {
    it('should return attribute values', () => {
      // Given
      const smp = new Sample({
        attrs: {
          comment: 'huge',
          sample_method_id: 1234,
        },
      });

      // When
      const [submission] = smp.getSubmission();

      // Then
      expect(submission.fields.comment).toBe('huge');
      expect(submission.fields.sample_method_id).toBe(1234);
    });

    it('should return translate attribute keys and values if keys mapping is provided', () => {
      // Given
      const keys = {
        size: {
          id: 'butterfly_size',
          values: {
            huge: 1,
          },
        },
      };
      const smp = new Sample({ attrs: { size: 'huge' } });
      smp.keys = keys;

      // When
      const [submission] = smp.getSubmission();

      // Then
      expect(submission.fields.butterfly_size).toBe(1);
    });

    it('should support key value arrays', () => {
      // Given
      const keys = {
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
      const smp = new Sample({ attrs: { size: 'huge' } });
      smp.keys = keys;

      // When
      const [submission] = smp.getSubmission();

      // Then
      expect(submission.fields.butterfly_size).toBe(1);
    });

    it('should support attribute value arrays', () => {
      // Given
      const keys = {
        colour: {
          id: 'butterfly_colour',
          values: {
            red: 1,
            green: 2,
            black: 3,
          },
        },
      };
      const smp = new Sample({ attrs: { colour: ['red', 'green'] } });
      smp.keys = keys;

      // When
      const [submission] = smp.getSubmission();

      // Then
      expect(submission.fields.butterfly_colour).toEqual([1, 2]);
    });

    it('should pass on child models flags', () => {
      // Given
      const sample = getRandomSample();
      sample.metadata = {
        ...sample.metadata,

        training: true,
        release_status: true,
        record_status: true,
        sensitive: true,
        confidential: true,
        sensitivity_precision: true,
      };
      sample.samples.push(getRandomSample());

      // When
      const [submission] = sample.getSubmission();

      // Then
      const [occ] = submission.occurrences;
      expect(occ.training).toBe(true);
      expect(occ.release_status).toBe(true);
      expect(occ.record_status).toBe(true);
      expect(occ.sensitive).toBe(true);
      expect(occ.confidential).toBe(true);
      expect(occ.sensitivity_precision).toBe(true);

      const [subSampleOcc] = submission.samples[0].occurrences;
      expect(subSampleOcc.training).toBe(true);
      expect(subSampleOcc.release_status).toBe(true);
      expect(subSampleOcc.record_status).toBe(true);
      expect(subSampleOcc.sensitive).toBe(true);
      expect(subSampleOcc.confidential).toBe(true);
      expect(subSampleOcc.sensitivity_precision).toBe(true);
    });

    it('should ignore subModels which return null from getSubmission', () => {
      // Given
      const sample = getRandomSample();
      sample.samples.push(getRandomSample());

      sample.samples[0].getSubmission = () => [];
      sample.occurrences[0].getSubmission = () => [];

      // When
      const [submission] = sample.getSubmission();

      // Then
      expect(submission.occurrences.length).toBe(0);
      expect(submission.samples.length).toBe(0);
    });
  });
});
