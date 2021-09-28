import 'jest-extended';
import Adapter from '../adapter';

describe('Promise.race', () => {
  describe('should create the method', () => {
    test('race a function', () => {
      expect(Adapter.race).toBeFunction();
    });

    test('need a parameter', () => {
      expect(Adapter.race).toHaveLength(1);
    });

    test('returns a promise', () => {
      expect(Adapter.race([1, 2, 3])).toBeInstanceOf(Adapter);
    });
  })

  describe('should create the resolved', () => {
    test('resolved with a correct value', (done) => {
      Adapter.race([
        Adapter.resolve(1),
        Adapter.reject(2),
        Adapter.resolve(3),
      ]).then((value) => {
        expect(value).toBe(1);
        done();
      });
    });

    test('resolved with a correct value #1', (done) => {
      Adapter.race([
        1,
        Adapter.reject(2),
        Adapter.resolve(3),
      ]).then((value) => {
        expect(value).toBe(1);
        done();
      });
    });
  })

  describe('should create the rejected', () => {
    test('rejected as expected', (done) => {
      // @ts-ignore
      Adapter.race().catch(() => {
        expect(true).toBe(true);
        done();
      })
    });

    test('rejected as expected #1', (done) => {
      Adapter.race([]).then(() => {
        expect(true).toBeFalsy();
        done();
      }).catch(() => {
        expect(true).toBeFalsy();
        done();
      });
      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    test('rejected as expected #2', (done) => {
      Adapter.race([
        Adapter.reject(1),
        Adapter.resolve(2),
      ]).catch(error => {
        expect(error).toBe(1);
        done();
      });
    });
  })
})
