import serverResponses from './server_responses';

function makeRequestResponse(type, data) {
  switch (type) {
    case 'OK':
      return (_, options) => {
        let model = data;
        if (typeof data === 'function') {
          let submission;
          if (options.body instanceof FormData) {
            submission = JSON.parse(options.body.get('submission'));
          } else {
            submission = JSON.parse(options.body);
          }

          model = data(submission.data.external_key);
        }

        return serverResponses(type, {
          cid: model.cid,
          occurrence_cid: model.occurrences[0].cid,
        });
      };

    case 'OK_SUBSAMPLE':
      return serverResponses(type, {
        cid: data.cid,
        subsample_cid: data.samples[0].cid,
        occurrence_cid: data.samples[0].occurrences[0].cid,
      });

    case 'DUPLICATE':
      throw serverResponses(type, {
        occurrence_cid: data.occurrences[0].cid,
        cid: data.cid,
      });

    case 'ERR':
      throw serverResponses(type);
    default:
  }

  return null;
}

export default makeRequestResponse;
