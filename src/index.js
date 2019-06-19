import extractError from './extractError';
import httpsRequest from './https-request';

const DEFAULT_NUMBER_OF_RESULTS = 10;
const MAX_NUMBER_OF_RESULTS = 2048;

const validateParameters = (key, options) => {
  if (key === undefined || key === '') {
    throw new Error('No API key specified');
  } else if (key === null) {
    throw new Error('API key must be type string. Got null.');
  } else if (typeof key !== 'string') {
    throw new Error(`API key must be type string. Got ${typeof key}.`);
  } else if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('options parameter must be an object');
  } else if ((options.number !== undefined)
      && (!Number.isInteger(options.number) || options.number < 1)) {
    throw new Error('number option must be a positive integer');
  } else if (options.number > MAX_NUMBER_OF_RESULTS) {
    throw new Error(`number option maximum allowed is ${MAX_NUMBER_OF_RESULTS}`);
  }
};

const hotbits = (key, options = {}) => {
  try {
    validateParameters(key, options);
  } catch (e) {
    return Promise.reject(e);
  }

  const encodedKey = encodeURIComponent(key);
  const nbytes = options.number || DEFAULT_NUMBER_OF_RESULTS;

  const params = {
    host: 'www.fourmilab.ch',
    path: `/cgi-bin/Hotbits.api?nbytes=${nbytes}&fmt=json&apikey=${encodedKey}`,
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

Object.defineProperty(hotbits, 'MAX_NUMBER_OF_RESULTS', {
  value: MAX_NUMBER_OF_RESULTS,
  writable: false,
});

export default hotbits;
