import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import Store from '../src/Store';
import serverResponses from './server_responses.js';
import { API_BASE, API_VER, API_SAMPLES_PATH } from '../src/constants';

function getRandomSample(store = new Store(), samples = [], occurrences = []) {
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
      host_url: 'x',
      store,
      occurrences,
      samples,
    }
  );

  return sample;
}

function generateSampleResponse(server, type, data) {
  const SAMPLE_POST_URL = `x${API_BASE}${API_VER}${API_SAMPLES_PATH}`;

  switch (type) {
    case 'OK':
      server.respondWith(req => {
        let model = data;
        if (typeof data === 'function') {
          let submission;
          if (req.requestBody instanceof FormData) {
            submission = JSON.parse(req.requestBody.get('submission'));
          } else {
            submission = JSON.parse(req.requestBody);
          }

          model = data(submission.data.external_key);
        }

        req.respond(
          ...serverResponses(type, {
            cid: model.cid,
            occurrence_cid: model.getOccurrence().cid,
          })
        );
      });
      break;

    case 'OK_SUBSAMPLE':
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses(type, {
          cid: data.cid,
          subsample_cid: data.getSample().cid,
          occurrence_cid: data.getSample().getOccurrence().cid,
        })
      );
      break;

    case 'DUPLICATE':
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses(type, {
          occurrence_cid: data.getOccurrence().cid,
          cid: data.cid,
        })
      );
      break;

    case 'ERR':
      server.respondWith('POST', SAMPLE_POST_URL, serverResponses(type));
      break;
    default:
  }
}

export { getRandomSample, generateSampleResponse };
