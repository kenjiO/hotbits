import httpsRequest from './https-request';

const DEFAULT_NUMBER_OF_RESULTS = 10;

const hotbits = () => {
  const params = {
    host: 'www.fourmilab.ch',
    path: `/cgi-bin/Hotbits.api?nbytes=${DEFAULT_NUMBER_OF_RESULTS}&fmt=json&apikey=&pseudo=pseudo`,
  };
  return httpsRequest(params).then(res => JSON.parse(res).data);
};

Object.defineProperty(hotbits, 'DEFAULT_NUMBER_OF_RESULTS', {
  value: DEFAULT_NUMBER_OF_RESULTS,
  writable: false,
});

export default hotbits;
