import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import serverResponses from './server_responses.js';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';

function getRandomSample(storage) {
  const occurrence = new Occurrence({
    taxon: 1234,
  });
  const sample = new Sample(
    {
      location: ' 12.12, -0.23',
    },
    {
      api_key: 'x',
      storage,
      occurrences: [occurrence],
    }
  );

  return sample;
}

function generateSampleResponse(server, sample) {
  const SAMPLE_POST_URL = API_BASE + API_VER + API_SAMPLES_PATH;
  server.respondWith(
    'POST',
    SAMPLE_POST_URL,
    serverResponses('OK', {
        cid: sample.cid,
        occurrence_cid: sample.getOccurrence().cid,
      },
    ),
  );
}

export default {
  getRandomSample,
  generateSampleResponse,
};
