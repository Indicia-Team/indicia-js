import {
  Sample as SmpOrig,
  Occurrence as OccOrig,
  Media as MediaOrig,
} from '@indicia-js/core';
import sinon from 'sinon';
import _sampleDependencies, { addModelMediaToFormData } from '../Sample';
import withRemote from '../';

const Sample = withRemote(SmpOrig);
const Occurrence = withRemote(OccOrig);
const Media = withRemote(MediaOrig);

function getRandomSample(samples = [], occurrences = [], media = []) {
  if (!occurrences.length) {
    const occurrence = new Occurrence({
      taxon: 1234,
    });
    occurrence.media.push(...media);
    occurrences.push(occurrence);
  }

  class RemoteReadySample extends Sample {
    remote = {
      url: 'x',
      timeout: 100,
    };

    attrs = { location: ' 12.12, -0.23' };

    samples = samples || [];

    occurrences = occurrences || [];
  }

  return new RemoteReadySample();
}

const getBasicRemoteCreateResponse = () => ({
  values: {
    id: 1,
    created_on: '2020-09-04T15:06:44+01:00',
    updated_on: '2020-09-04T15:06:44+01:00',
  },
  occurrences: [
    {
      values: {
        id: 1,
        created_on: '2020-09-04T15:06:44+01:00',
        updated_on: '2020-09-04T15:06:44+01:00',
      },
    },
  ],
});

describe('Sample', () => {
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

  describe('_getMediaFormData', () => {
    it('should return ', async () => {
      // Given
      const media1 = new Media({
        attrs: {
          type: 'gif',
          data: 'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
        },
      });

      const sampleNested = getRandomSample(undefined, undefined, [media1]);
      const sample = getRandomSample([sampleNested], undefined, [media1]);

      const formData = [];

      // When
      await addModelMediaToFormData(sample, formData);

      // Then
      expect(formData.length).toBe(2);
      expect(formData[0][2]).toBe(`${media1.cid}.gif`);
    });
  });

  describe('saveRemote', () => {
    let _createRemoteStub;
    let _uploadMediaStub;
    beforeEach(() => {
      _createRemoteStub = sinon.stub(Sample.prototype, '_createRemote');
      _uploadMediaStub = sinon.stub(Sample.prototype, '_uploadMedia');
    });
    afterEach(() => {
      _createRemoteStub.restore();
      _uploadMediaStub.restore();
      _sampleDependencies.__ResetDependency__('makeRequest');
    });

    it('should post submission', async () => {
      // Given
      const sample = getRandomSample();
      _createRemoteStub.resolves(getBasicRemoteCreateResponse());
      _uploadMediaStub.resolves({});

      // When
      await sample.saveRemote();

      // Then
      expect(_createRemoteStub.calledOnce).toBe(true);
    });

    it('should update model after success', async () => {
      // Given
      const newWarehouseId = 123;
      const sample = getRandomSample();
      const basicRemoteCreateResponse = getBasicRemoteCreateResponse();
      basicRemoteCreateResponse.values.id = newWarehouseId;
      _createRemoteStub.resolves(basicRemoteCreateResponse);

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

      resolve(getBasicRemoteCreateResponse());
      await saveRemoteComplete;

      expect(sample.remote.synchronising).toBe(false);
    });

    it('should ignore the duplication error', async () => {
      // Given
      const sample = getRandomSample();

      _createRemoteStub.restore();
      _sampleDependencies.__Rewire__('makeRequest', () => {
        const res = {
          code: 409,
          status: 'Conflict',
          message: 'Duplicate external_key would be created',
          duplicate_of: {
            id: 1,
            href: 'https://localhost/index.php/services/rest/samples/1',
          },
        };
        const error = new Error(res.message);
        error.res = res;
        error.status = 409;
        return Promise.reject(error);
      });

      expect(sample.id).toBeUndefined();
      expect(sample.occurrences[0].id).toBeUndefined();

      // When
      await sample.saveRemote();

      // Then
      expect(sample.id).toBe(1);
      expect(sample.occurrences[0].id).toBe(-1);
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
      const submission = smp.getSubmission();

      // Then
      expect(submission.values.comment).toBe('huge');
      expect(submission.values.sample_method_id).toBe(1234);
    });

    it('should not return anything for empty attribute values', () => {
      // Given
      const smp = new Sample({
        attrs: {
          comment: 'huge',
          customAttribute: null,
          customFalsyAttribute: 0,
          customFalsyBoolAttribute: false,
          customFalsyStrAttribute: '',
        },
      });

      // When
      const submission = smp.getSubmission();

      // Then
      expect(submission.values.comment).toBe('huge');
      expect(submission.values.customAttribute).toBeUndefined();
      expect(submission.values.customFalsyAttribute).toBe(0);
      expect(submission.values.customFalsyBoolAttribute).toBe(false);
      expect(submission.values.customFalsyStrAttribute).toBe('');
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
      const submission = smp.getSubmission();

      // Then
      expect(submission.values.butterfly_size).toBe(1);
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
      const submission = smp.getSubmission();

      // Then
      expect(submission.values.butterfly_size).toBe(1);
    });

    it("should thow error if key value arrays mapping isn't found", () => {
      // Given
      const keys = {
        size: {
          id: 'butterfly_size',
          values: [
            {
              value: 'small',
              id: 1,
            },
          ],
        },
      };
      const smp = new Sample({ attrs: { size: 'huge' } });
      smp.keys = keys;

      // When
      try {
        smp.getSubmission();
        throw new Error('the test is broken');
      } catch (e) {
        // Then
        expect(e.message).toBe(
          'A "size" attribute "huge" value could not be mapped to a remote database field.'
        );
      }
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
      const submission = smp.getSubmission();

      // Then
      expect(submission.values.butterfly_colour).toEqual([1, 2]);
    });

    it('should attach metadata flags', () => {
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
      const submission = sample.getSubmission();

      // Then
      expect(submission.values.training).toBe(true);
      expect(submission.values.release_status).toBe(true);
      expect(submission.values.record_status).toBe(true);
      expect(submission.values.sensitive).toBe(true);
      expect(submission.values.confidential).toBe(true);
      expect(submission.values.sensitivity_precision).toBe(true);
    });

    it('should support submodels', () => {
      // Given
      const sample = getRandomSample();
      sample.samples.push(getRandomSample());

      // When
      const submission = sample.getSubmission();

      // Then
      expect(typeof submission.samples[0].values.external_key).toBe('string');
      expect(typeof submission.occurrences[0].values.external_key).toBe(
        'string'
      );
    });

    it('should set media Ids', () => {
      // Given
      const sample = getRandomSample();
      const media1 = new Media();
      sample.media.push(media1);
      const media2 = new Media();
      sample.samples.push(getRandomSample());
      sample.samples[0].media.push(media2);

      const warehouseMediaNames = {
        [media1.cid]: { name: 1 },
        [media2.cid]: { name: 2 },
      };

      // When
      const submission = sample.getSubmission(warehouseMediaNames);

      // Then
      expect(submission.media[0].values.queued).toBe(1);
      expect(submission.samples[0].media[0].values.queued).toBe(2);
    });

    it('should ignore subModels which return null from getSubmission', () => {
      // Given
      const sample = getRandomSample();
      sample.samples.push(getRandomSample());

      sample.samples[0].getSubmission = () => null;
      sample.occurrences[0].getSubmission = () => null;

      // When
      const submission = sample.getSubmission();

      // Then
      expect(submission.occurrences.length).toBe(0);
      expect(submission.samples.length).toBe(0);
    });
  });
});
