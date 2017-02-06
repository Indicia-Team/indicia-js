const responses = {
  duplicate(options) {
    const reponse = {
      errors: [
        {
          id: Math.random(),
          external_key: options.cid,
          sample_id: Math.random(),
          title: 'Occurrence already exists.',
        },
      ],
    };

    return [409, reponse];
  },

  // model -> type
  // children -> occurrences
  // struct -> data
  OK(options) {
    const data = {
      type: 'sample',
      id: Math.random(),
      external_key: options.cid,
      occurrences: [
        {
          type: 'occurrence',
          id: Math.random(),
          external_key: options.occurrence_cid,
        },
      ],
    };

    return [200, { data }];
  },

  OK_SUBSAMPLE(options) {
    const data = {
      type: 'sample',
      id: Math.random(),
      external_key: options.cid,
      samples: [
        {
          type: 'sample',
          id: Math.random(),
          external_key: options.subsample_cid,
          occurrences: [
            {
              type: 'occurrence',
              id: Math.random(),
              external_key: options.occurrence_cid,
            },
          ],
        },
      ],
    };

    return [200, { data }];
  },

  err() {
    return [502, {}];
  },
};

export default function (functionName, options) {
  const func = responses[functionName];
  if (!func) {
    throw 'No such return function';
  }
  const [code, data] = func(options);
  return [code, { 'Content-Type': 'application/json' }, JSON.stringify(data)];
}
