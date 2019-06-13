import nock from 'nock';
import hotbits from './index';

function setupNock() {
  const randomBytes = Array.from(
    { length: hotbits.DEFAULT_NUMBER_OF_RESULTS },
    () => Math.floor(Math.random() * 256),
  );
  nock('http://www.fourmilab.ch')
    .get(`/cgi-bin/Hotbits.api?nbytes=${hotbits.DEFAULT_NUMBER_OF_RESULTS}&fmt=json&apikey=&pseudo=pseudo`)
    .reply(200, { data: randomBytes });
}

describe('hotbits', () => {
  afterAll(nock.restore);
  afterEach(nock.cleanAll);

  it('returns a promise', () => {
    setupNock();
    expect(hotbits() instanceof Promise).toBe(true);
  });

  it('resolves to an array', () => {
    setupNock();
    return hotbits().then((data) => {
      expect(Array.isArray(data)).toBe(true);
    });
  });

  it('array contains 10 results', () => {
    setupNock();
    return hotbits().then((data) => {
      expect(data.length).toBe(hotbits.DEFAULT_NUMBER_OF_RESULTS);
    });
  });

  it('each result is an 8 bit integer', () => {
    setupNock();
    return hotbits().then((data) => {
      data.forEach((number) => {
        expect(Number.isInteger(number)).toBe(true);
        expect(number).toBeGreaterThanOrEqual(0);
        expect(number).toBeLessThanOrEqual(255);
      });
    });
  });

  it('does not produce the same results', () => {
    setupNock();
    return hotbits().then((data1) => {
      setupNock();
      return hotbits().then((data2) => {
        expect(data1).not.toEqual(data2);
      });
    });
  });
});
