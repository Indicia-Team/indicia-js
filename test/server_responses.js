const responses = {
  duplicate(options) {
    const data = {
      errors: [
        {
          id: Math.random(),
          external_key: options.cid,
          sample_id: Math.random(),
          title: 'Occurrence already exists.',
        },
      ],
    };

    return [409, data];
  },

  OK(options) {
    const data = {
      data: {
        id: Math.random(),
        external_key: options.cid,
        submodels: [
          {
            id: Math.random(),
            external_key: options.submodel_cid,
          },
        ],
      },
    };

    return [200, data];
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
