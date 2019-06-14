import https from 'https';

export default function httpsRequest(params) {
  return new Promise((resolve, reject) => {
    https.get(params, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`http status code ${res.statusCode} received. Expected 200`));
      } else {
        let body = '';

        res.on('data', (data) => {
          body += data;
        });

        res.on('end', () => {
          resolve(body);
        });
      }
    }).on('error', (e) => {
      reject(e);
    });
  });
}
