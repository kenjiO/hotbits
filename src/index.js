import http from 'http';

export default () => new Promise((resolve) => {
  const params = {
    host: 'www.fourmilab.ch',
    path: '/cgi-bin/Hotbits.api?nbytes=10&fmt=json&apikey=&pseudo=pseudo',
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
