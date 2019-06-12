import hotbits from './index';

describe('hotbits', () => {
  it('returns a promise', () => {
    expect(hotbits() instanceof Promise).toBe(true);
  });

  it('resolves to an array', () =>
    hotbits().then((data) => {
      expect(Array.isArray(data)).toBe(true);
    }));

  it('array contains 10 results', () =>
    hotbits().then((data) => {
      expect(data.length).toBe(10);
    }));

  it('each result is an 8 bit integer', () =>
    hotbits().then((data) => {
      data.forEach((number) => {
        expect(Number.isInteger(number)).toBe(true);
        expect(number).toBeGreaterThanOrEqual(0);
        expect(number).toBeLessThanOrEqual(255);
      });
    }));

  it('does not produce the same results', () =>
    hotbits().then(data1 => hotbits().then((data2) => {
      expect(data1).not.toEqual(data2);
    })));
});
