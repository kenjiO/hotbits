import extractError from './extractError';
import httpsRequest from './https-request';

const DEFAULT_NUMBER_OF_RESULTS = 10;

const validateApiKeyParameter = (key) => {
  if (key === undefined || key === '') {
    throw new Error('No API key specified');
  } else if (key === null) {
    throw new Error('API key must be type string. Got null.');
  } else if (typeof key !== 'string') {
    throw new Error(`API key must be type string. Got ${typeof key}.`);
  }
};

const hotbits = (key) => {
  try {
    validateApiKeyParameter(key);
  } catch (e) {
    return Promise.reject(e);
  }

  const encodedKey = encodeURIComponent(key);

  const params = {
    host: 'www.fourmilab.ch',
    path: `/cgi-bin/Hotbits.api?nbytes=${DEFAULT_NUMBER_OF_RESULTS}&fmt=json&apikey=${encodedKey}`,
  };

  return httpsRequest(params).then(({ headers, body }) => {
    const contentType = headers['content-type'];

    // The api server returns errors in html format
    if (contentType === 'text/html') {
      const error = extractError(body);
      if (error) {
        throw new Error(error);
      }
    }

    if (contentType !== 'application/json') {
      throw new Error(`${contentType} content-type received from server. expected application/json`);
    }

    // The json response from the server puts the random numbers in the 'data' property
    return JSON.parse(body).data;
  });
};

Object.defineProperty(hotbits, 'DEFAULT_NUMBER_OF_RESULTS', {
  value: DEFAULT_NUMBER_OF_RESULTS,
  writable: false,
});

export default hotbits;
