import httpsRequest from './https-request';

const DEFAULT_NUMBER_OF_RESULTS = 10;

const hotbits = (key) => {
  if (key === undefined || key === '') {
    return Promise.reject(new Error('No API key specified'));
  }
  if (key === null) {
    return Promise.reject(new Error('API key must be type string. Got null.'));
  }
  if (typeof key !== 'string') {
    return Promise.reject(new Error(`API key must be type string. Got ${typeof key}.`));
  }

  const encodedKey = encodeURIComponent(key);

  const params = {
    host: 'www.fourmilab.ch',
    path: `/cgi-bin/Hotbits.api?nbytes=${DEFAULT_NUMBER_OF_RESULTS}&fmt=json&apikey=${encodedKey}`,
  };

  return httpsRequest(params).then(({ headers, body }) => {
    const contentType = headers['content-type'];

    if (contentType === 'text/html' && body.includes('HotBits API Key invalid')) {
      throw new Error('HotBits API Key invalid');
    }

    if (contentType !== 'application/json') {
      throw new Error(`${contentType} content-type received from server. expected application/json`);
    }

    return JSON.parse(body).data;
  });
};

Object.defineProperty(hotbits, 'DEFAULT_NUMBER_OF_RESULTS', {
  value: DEFAULT_NUMBER_OF_RESULTS,
  writable: false,
});

export default hotbits;
