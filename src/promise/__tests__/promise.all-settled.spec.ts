import 'jest-extended';
import Adapter from '../adapter';

describe('Promise.any', () => {
  describe('should create the method', () => {
    test('any a function', () => {
      expect(Adapter.allSettled).toBeFunction();
    });

    test('need a parameter', () => {
      expect(Adapter.allSettled).toHaveLength(1);
    });

    test('returns a promise', () => {
      expect(Adapter.allSettled([1, 2, 3])).toBeInstanceOf(Adapter);
    });
  })

  describe('should create the resolved', () => {
    test('resolved with a correct value', (done) => {
      Adapter.allSettled([
        Adapter.resolve(1),
        Adapter.reject(2),
        Adapter.resolve(3),
      ]).then(values => {
        expect(values).toStrictEqual([
          { value: 1, status: 'fulfilled' },
          { reason: 2, status: 'rejected' },
          { value: 3, status: 'fulfilled' },
        ]);
        done();
      });
    });
  })

  describe('should create the rejected', () => {
    test('rejected as expected', (done) => {
      // @ts-ignore
      Adapter.allSettled().catch(() => {
        expect(true).toBe(true);
        done();
      });
    });
  })
})
