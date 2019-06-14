import nock from 'nock';
import hotbits from './index';

function randomBytes(quantity) {
  const length = (quantity === undefined) ? hotbits.DEFAULT_NUMBER_OF_RESULTS : quantity;
  return Array.from({ length }, () => Math.floor(Math.random() * 256));
}

function setupNock(statusCode, response) {
  nock('https://www.fourmilab.ch')
    .get(`/cgi-bin/Hotbits.api?nbytes=${hotbits.DEFAULT_NUMBER_OF_RESULTS}&fmt=json&apikey=&pseudo=pseudo`)
    .reply(statusCode, response);
}

describe('hotbits', () => {
  afterAll(nock.restore);
  afterEach(nock.cleanAll);

  it('returns a promise', () => {
    setupNock(200, { data: randomBytes() });
    expect(hotbits() instanceof Promise).toBe(true);
  });

  it('resolves to an array', () => {
    setupNock(200, { data: randomBytes() });
    return hotbits().then((data) => {
      expect(Array.isArray(data)).toBe(true);
    });
  });

  it('array contains 10 results', () => {
    setupNock(200, { data: randomBytes() });
    return hotbits().then((data) => {
      expect(data.length).toBe(hotbits.DEFAULT_NUMBER_OF_RESULTS);
    });
  });

  it('each result is an 8 bit integer', () => {
    setupNock(200, { data: randomBytes() });
    return hotbits().then((data) => {
      data.forEach((number) => {
        expect(Number.isInteger(number)).toBe(true);
        expect(number).toBeGreaterThanOrEqual(0);
        expect(number).toBeLessThanOrEqual(255);
      });
    });
  });

  it('does not produce the same results', () => {
    setupNock(200, { data: randomBytes() });
    return hotbits().then((data1) => {
      setupNock(200, { data: randomBytes() });
      return hotbits().then((data2) => {
        expect(data1).not.toEqual(data2);
      });
    });
  });

  it('handles http error codes', () => {
    setupNock(404);
    return expect(hotbits()).rejects.toThrow('http status code 404 received. Expected 200');
  });

  it('handles network errors', () => {
    nock('https://www.fourmilab.ch')
      .get(`/cgi-bin/Hotbits.api?nbytes=${hotbits.DEFAULT_NUMBER_OF_RESULTS}&fmt=json&apikey=&pseudo=pseudo`)
      .replyWithError('getaddrinfo ENOTFOUND www.fourmilab.ch');
    return expect(hotbits()).rejects.toThrow('getaddrinfo ENOTFOUND www.fourmilab.ch');
  });

  it('throws errors for replies not in JSON format', () => {
    setupNock(200, '1, 2, 3, 4');
    return expect(hotbits()).rejects.toThrow('Reply received from server not in expected JSON format');
  });
});
