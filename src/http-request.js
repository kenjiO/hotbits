import http from 'http';

export default function httpRequest(params) {
  return new Promise((resolve) => {
    http.get(params, (res) => {
      let body = '';

      res.on('data', (data) => {
        body += data;
      });

      res.on('end', () => {
        resolve(body);
      });
    });
  });
}
