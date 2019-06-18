import nock from 'nock';
import hotbits from './index';

const API_KEY = '1234567890abcdef';

function randomBytes(quantity) {
  const length = (quantity === undefined) ? hotbits.DEFAULT_NUMBER_OF_RESULTS : quantity;
  return Array.from({ length }, () => Math.floor(Math.random() * 256));
}

function setupNock(statusCode, response, headers) {
  const number = (typeof response === 'object' && Array.isArray(response.data))
    ? response.data.length
    : hotbits.DEFAULT_NUMBER_OF_RESULTS;
  nock('https://www.fourmilab.ch')
    .get(`/cgi-bin/Hotbits.api?nbytes=${number}&fmt=json&apikey=${API_KEY}`)
    .reply(statusCode, response, headers);
}

describe('hotbits', () => {
  afterAll(nock.restore);
  afterEach(nock.cleanAll);

  it('returns a promise', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    expect(hotbits(API_KEY) instanceof Promise).toBe(true);
  });

  it('resolves to an array', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return hotbits(API_KEY).then((data) => {
      expect(Array.isArray(data)).toBe(true);
    });
  });

  it('array contains default number of results when options are not given', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return hotbits(API_KEY).then((data) => {
      expect(data.length).toBe(hotbits.DEFAULT_NUMBER_OF_RESULTS);
    });
  });

  it('array contains 1 result when {number: 1} option passed ', () => {
    setupNock(200, { data: randomBytes(1) }, { 'content-type': 'application/json' });
    return hotbits(API_KEY, { number: 1 }).then((data) => {
      expect(data.length).toBe(1);
    });
  });

  it('array contains 11 results {number: 11} option passed ', () => {
    setupNock(200, { data: randomBytes(11) }, { 'content-type': 'application/json' });
    return hotbits(API_KEY, { number: 11 }).then((data) => {
      expect(data.length).toBe(11);
    });
  });

  it('array contains 1000 results {number: 1000} option passed ', () => {
    setupNock(200, { data: randomBytes(1000) }, { 'content-type': 'application/json' });
    return hotbits(API_KEY, { number: 1000 }).then((data) => {
      expect(data.length).toBe(1000);
    });
  });

  it('each result is an 8 bit integer', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return hotbits(API_KEY).then((data) => {
      data.forEach((number) => {
        expect(Number.isInteger(number)).toBe(true);
        expect(number).toBeGreaterThanOrEqual(0);
        expect(number).toBeLessThanOrEqual(255);
      });
    });
  });

  it('does not produce the same results', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
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

  it('throws an error for a reply in text/plain format', () => {
    setupNock(200, '1, 2, 3, 4', { 'content-type': 'text/plain' });
    return expect(hotbits(API_KEY))
      .rejects.toThrow('text/plain content-type received from server. expected application/json');
  });

  it('throws an error for a reply in text/html format', () => {
    const response = '<html><head><title>Results</title></head><body>'
      + 'The following hexadecimal data are thebytes you requested. <pre> 8C7559E7D8C9E81862DE</pre></body></html>';
    setupNock(200, response, { 'content-type': 'text/html' });
    return expect(hotbits(API_KEY))
      .rejects.toThrow('text/html content-type received from server. expected application/json');
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
    const response = '<!DOCTYPE html><html><head><title>HotBits Error</title></head>'
      + '<body><blockquote><p><b>HotBits API Key invalid. See the <a href="/apikey.html">'
      + 'API Key</a> documentation</b></p></blockquote></body></html>';
    setupNock(200, response, { 'content-type': 'text/html' });
    return expect(hotbits(API_KEY)).rejects.toThrow('HotBits API Key invalid');
  });

  it('throws an error when server indicates an error', () => {
    const response = '<!DOCTYPE html><html><head><title>HotBits Error</title></head>'
      + '<body><blockquote><p><b>There was a problem with your request. See the <a href="/apikey.html">'
      + 'API Key</a> documentation</b></p></blockquote></body></html>';
    setupNock(200, response, { 'content-type': 'text/html' });
    return expect(hotbits(API_KEY)).rejects.toThrow('There was a problem with your request');
  });

  it('errors when options paramater is a string', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return expect(hotbits(API_KEY, 'abc'))
      .rejects.toThrow('options parameter must be an object');
  });

  it('errors when options paramater is null', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return expect(hotbits(API_KEY, null))
      .rejects.toThrow('options parameter must be an object');
  });

  it('errors when options paramater is an array', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return expect(hotbits(API_KEY, []))
      .rejects.toThrow('options parameter must be an object');
  });

  it('errors when wrong type of option.number parameter', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return expect(hotbits(API_KEY, { number: '1' }))
      .rejects.toThrow('number option must be a positive integer');
  });

  it('errors when option.number parameter is a float', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return expect(hotbits(API_KEY, { number: 1.5 }))
      .rejects.toThrow('number option must be a positive integer');
  });

  it('errors when option.number parameter is 0', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return expect(hotbits(API_KEY, { number: 0 }))
      .rejects.toThrow('number option must be a positive integer');
  });

  it('errors when option.number parameter is negative', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return expect(hotbits(API_KEY, { number: -5 }))
      .rejects.toThrow('number option must be a positive integer');
  });

  it('errors when option.number parameter is negative', () => {
    setupNock(200, { data: randomBytes() }, { 'content-type': 'application/json' });
    return expect(hotbits(API_KEY, { number: -5 }))
      .rejects.toThrow('number option must be a positive integer');
  });
});
