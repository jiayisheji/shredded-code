import 'jest-extended';
import Adapter from '../adapter';

describe('Promise.resolve', () => {
  describe('should create the method', () => {
    test('resolve a function', () => {
      expect(Adapter.resolve).toBeFunction();
    });

    test('need a parameter', () => {
      expect(Adapter.resolve).toHaveLength(1);
    });

    test('returns a promise', () => {
      expect(Adapter.resolve(1)).toBeInstanceOf(Adapter);
    });
  })

  describe('should create the resolved', () => {
    test('resolved with a correct value', (done) => {
      Adapter.resolve().then((value) => {
        expect(value).toBeUndefined();
        done();
      });
    });

    test('resolved with a correct value #1', (done) => {
      Adapter.resolve(1).then((value) => {
        expect(value).toBe(1);
        done();
      });
    });

    test('resolved with a correct value #2', (done) => {
      Adapter.resolve(null).then((value) => {
        expect(value).toBeNull();
        done();
      });
    });

    test('resolved with a correct value #3', (done) => {
      Adapter.resolve(undefined).then((value) => {
        expect(value).toBeUndefined();
        done();
      });
    });

    test('resolved with a correct value #4', (done) => {
      Adapter.resolve(new Error('error')).then((value) => {
        expect(value).toBeInstanceOf(Error);
        expect(value.message).toBe('error');
        done();
      });
    });

    test('resolved with a correct value #5', (done) => {
      Adapter.resolve(Adapter.reject(1)).then(() => {
        expect(true).toBeFalsy();
        done();
      }).catch((error) => {
        expect(error).toBe(1);
        done();
      });
    });
  })
})
