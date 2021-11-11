import 'jest-extended';
import Adapter from '../adapter';

const dummy = {dummy: 'dummy'}; // we fulfill or reject with this when we don't intend to test against it
const other = {other: 'other'};

describe('Promise#finally', () => {
  describe('should create the method', () => {
    test('finally a function', () => {
      expect(Adapter.prototype.finally).toBeFunction();
    });

    test('need a parameter', () => {
      expect(Adapter.prototype.finally).toHaveLength(1);
    });

    test('returns a promise', done => {
      expect(
        Adapter.resolve(dummy).finally(() => {
          done();
        })
      ).toBeInstanceOf(Adapter);
    });
  });

  describe('should create the resolved', () => {
    test('resolved with a correct value', done => {
      Adapter.resolve(dummy)
        .finally(() => {})
        .then(value => {
          expect(value).toStrictEqual(dummy);
          done();
        });
    });

    test('onFinally function called one time', done => {
      let called = 0;
      Adapter.resolve(dummy)
        .finally(() => {
          called++;
        })
        .then(() => {
          expect(called).toBe(1);
          done();
        });
    });

    test('onFinally function called with a correct argument', done => {
      let argument: null | undefined = null;
      // @ts-ignore
      Adapter.resolve(dummy)
        .finally((value: undefined) => {
          argument = value;
        })
        .then(() => {
          expect(argument).toBeUndefined();
          done();
        });
    });

    test('onFinally returns resolved with ignore the return value', done => {
      Adapter.resolve(dummy)
        .finally(() => {
          return Adapter.resolve(other);
        })
        .then(value => {
          expect(value).toStrictEqual(dummy);
          done();
        });
    });

    test('onFinally returns rejected with receive a error value', done => {
      Adapter.resolve(dummy)
        .finally(() => {
          return Adapter.reject(other);
        })
        .catch(value => {
          expect(value).toStrictEqual(other);
          done();
        });
    });
  });

  describe('should create the rejected', () => {
    test('rejected with a error value', done => {
      Adapter.reject(dummy)
        .finally(() => {})
        .catch(value => {
          expect(value).toStrictEqual(dummy);
          done();
        });
    });

    test('onFinally function called one time', done => {
      let called = 0;
      Adapter.reject(dummy)
        .finally(() => {
          called++;
        })
        .catch(() => {
          expect(called).toBe(1);
          done();
        });
    });

    test('onFinally function called with a correct argument', done => {
      let argument: null | undefined = null;
      // @ts-ignore
      Adapter.reject(dummy)
        .finally((value: undefined) => {
          argument = value;
        })
        .catch(() => {
          expect(argument).toBeUndefined();
          done();
        });
    });

    test('onFinally returns resolved with ignore the return value', done => {
      Adapter.reject(dummy)
        .finally(() => {
          return Adapter.resolve(other);
        })
        .catch(value => {
          expect(value).toStrictEqual(dummy);
          done();
        });
    });

    test('onFinally returns rejected with receive a error value', done => {
      Adapter.reject(dummy)
        .finally(() => {
          return Adapter.reject(other);
        })
        .catch(value => {
          expect(value).toStrictEqual(other);
          done();
        });
    });
  });
});
