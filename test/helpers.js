import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import serverResponses from './server_responses.js';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';

function getRandomSample(store, samples = [], occurrences = []) {
  if (!occurrences.length) {
    const occurrence = new Occurrence({
      taxon: 1234,
    });
    occurrences.push(occurrence);
  }

  const sample = new Sample(
    {
      location: ' 12.12, -0.23',
    },
    {
      api_key: 'x',
      remote_host: 'x',
      store,
      occurrences,
      samples,
    }
  );

  return sample;
}

function generateSampleResponse(server, type, data) {
  const SAMPLE_POST_URL = 'x' + API_BASE + API_VER + API_SAMPLES_PATH;

  switch (type) {
    case 'OK':
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses(type, {
            cid: data.cid,
            occurrence_cid: data.getOccurrence().cid,
          },
        ),
      );
      break;

    case 'OK_SUBSAMPLE':
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses(type, {
          cid: data.cid,
          subsample_cid: data.getSample().cid,
          occurrence_cid: data.getSample().getOccurrence().cid,
        }),
      );
      break;

    case 'DUPLICATE':
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses(type, {
            cid: data.getOccurrence().cid,
          },
        ),
      );
      break;

    case 'ERR':
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses(type),
      );
      break;
    default:

  }
}

export {
  getRandomSample,
  generateSampleResponse,
};
