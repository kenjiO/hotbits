import https from 'https';

export default function httpsRequest(params) {
  return new Promise((resolve) => {
    https.get(params, (res) => {
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
