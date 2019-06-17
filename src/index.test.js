import nock from 'nock';
import hotbits from './index';

const API_KEY = '1234567890abcdef';

function randomBytes(quantity) {
  const length = (quantity === undefined) ? hotbits.DEFAULT_NUMBER_OF_RESULTS : quantity;
  return Array.from({ length }, () => Math.floor(Math.random() * 256));
}

function setupNock(statusCode, response) {
  nock('https://www.fourmilab.ch')
    .get(`/cgi-bin/Hotbits.api?nbytes=${hotbits.DEFAULT_NUMBER_OF_RESULTS}&fmt=json&apikey=${API_KEY}`)
    .reply(statusCode, response);
}

describe('hotbits', () => {
  afterAll(nock.restore);
  afterEach(nock.cleanAll);

  it('returns a promise', () => {
    setupNock(200, { data: randomBytes() });
    expect(hotbits(API_KEY) instanceof Promise).toBe(true);
  });

  it('resolves to an array', () => {
    setupNock(200, { data: randomBytes() });
    return hotbits(API_KEY).then((data) => {
      expect(Array.isArray(data)).toBe(true);
    });
  });

  it('array contains 10 results', () => {
    setupNock(200, { data: randomBytes() });
    return hotbits(API_KEY).then((data) => {
      expect(data.length).toBe(hotbits.DEFAULT_NUMBER_OF_RESULTS);
    });
  });

  it('each result is an 8 bit integer', () => {
    setupNock(200, { data: randomBytes() });
    return hotbits(API_KEY).then((data) => {
      data.forEach((number) => {
        expect(Number.isInteger(number)).toBe(true);
        expect(number).toBeGreaterThanOrEqual(0);
        expect(number).toBeLessThanOrEqual(255);
      });
    });
  });

  it('does not produce the same results', () => {
    setupNock(200, { data: randomBytes() });
    return hotbits(API_KEY).then((data1) => {
      setupNock(200, { data: randomBytes() });
      return hotbits(API_KEY).then((data2) => {
        expect(data1).not.toEqual(data2);
      });
    });
  });

  it('handles http error codes', () => {
    setupNock(404);
    return expect(hotbits(API_KEY)).rejects.toThrow('http status code 404 received. Expected 200');
  });

  it('handles network errors', () => {
    nock('https://www.fourmilab.ch')
      .get(`/cgi-bin/Hotbits.api?nbytes=${hotbits.DEFAULT_NUMBER_OF_RESULTS}&fmt=json&apikey=${API_KEY}`)
      .replyWithError('getaddrinfo ENOTFOUND www.fourmilab.ch');
    return expect(hotbits(API_KEY)).rejects.toThrow('getaddrinfo ENOTFOUND www.fourmilab.ch');
  });

  it('throws an error for a reply not in JSON format', () => {
    setupNock(200, '1, 2, 3, 4');
    return expect(hotbits(API_KEY)).rejects.toThrow('Reply received from server not in expected JSON format');
  });

  it('throws an error for missing api key', () =>
    expect(hotbits())
      .rejects.toThrow('No API key specified'));

  it('throws an error for number type api key', () =>
    expect(hotbits(123456789))
      .rejects.toThrow('API key must be type string. Got number'));

  it('throws an error for object type api key', () =>
    expect(hotbits({}))
      .rejects.toThrow('API key must be type string. Got object.'));

  it('throws an error for null type api key', () =>
    expect(hotbits(null))
      .rejects.toThrow('API key must be type string. Got null'));

  it('throws an error for bool type api key', () =>
    expect(hotbits(true))
      .rejects.toThrow('API key must be type string. Got boolean'));

  it('throws an error when server indicates invalid key', () => {
    const response = '<!DOCTYPE html><html><head><title>HotBits</title></head>'
      + '<body><b>HotBits API Key invalid.</b></body></html>';
    setupNock(200, response);
    return expect(hotbits(API_KEY)).rejects.toThrow('HotBits API Key invalid');
  });
});
