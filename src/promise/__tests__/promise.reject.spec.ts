import 'jest-extended';
import Adapter from '../adapter';

describe('Promise.reject', () => {
  describe('should create the method', () => {
    test('reject a function', () => {
      expect(Adapter.reject).toBeFunction();
    });

    test('need a parameter', () => {
      expect(Adapter.reject).toHaveLength(1);
    });

    test('returns a promise', () => {
      expect(Adapter.reject(1)).toBeInstanceOf(Adapter);
    });
  });

  describe('should create the rejected', () => {
    test('rejected as expected', done => {
      Adapter.reject().catch((value: void) => {
        expect(value).toBeUndefined();
        done();
      });
    });

    test('rejected as expected #1', done => {
      Adapter.reject(1).catch(value => {
        expect(value).toBe(1);
        done();
      });
    });

    test('rejected as expected #2', done => {
      Adapter.reject(null).catch((value: null) => {
        expect(value).toBeNull();
        done();
      });
    });

    test('rejected as expected #3', done => {
      Adapter.reject(undefined).catch((value: undefined) => {
        expect(value).toBeUndefined();
        done();
      });
    });

    test('rejected as expected #4', done => {
      Adapter.reject(new Error('error')).catch((value: Error) => {
        expect(value).toBeInstanceOf(Error);
        expect(value.message).toBe('error');
        done();
      });
    });

    test('rejected as expected #5', done => {
      Adapter.reject(Adapter.resolve(1))
        .then(() => {
          expect(true).toBeFalsy();
          done();
        })
        .catch(error => {
          expect(error).toBeInstanceOf(Adapter);
          expect(error).resolves.toBe(1);
          done();
        });
    });
  });
});
