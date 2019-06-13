import http from 'http';

const DEFAULT_NUMBER_OF_RESULTS = 10;

const hotbits = () => new Promise((resolve) => {
  const params = {
    host: 'www.fourmilab.ch',
    path: `/cgi-bin/Hotbits.api?nbytes=${DEFAULT_NUMBER_OF_RESULTS}&fmt=json&apikey=&pseudo=pseudo`,
  };

  http.get(params, (res) => {
    let body = '';

    res.on('data', (data) => {
      body += data;
    });

    res.on('end', () => {
      resolve(JSON.parse(body).data);
    });
  });
});

Object.defineProperty(hotbits, 'DEFAULT_NUMBER_OF_RESULTS', {
  value: DEFAULT_NUMBER_OF_RESULTS,
  writable: false,
});

export default hotbits;
