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

  return httpsRequest(params).then((res) => {
    try {
      return JSON.parse(res).data;
    } catch (e) {
      if (res.includes('HotBits API Key invalid')) {
        throw new Error('HotBits API Key invalid');
      }
      throw new Error('Reply received from server not in expected JSON format');
    }
  });
};

Object.defineProperty(hotbits, 'DEFAULT_NUMBER_OF_RESULTS', {
  value: DEFAULT_NUMBER_OF_RESULTS,
  writable: false,
});

export default hotbits;
