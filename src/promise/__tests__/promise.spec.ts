import 'jest-extended';
import Adapter from '../adapter';

describe('Promise', () => {
  describe('should create the Promise', () => {
    test('Promise a function', () => {
      expect(Adapter).toBeFunction();
    });

    test('need a parameter', () => {
      expect(Adapter).toHaveLength(1);
    });

    test('returns a promise', () => {
      expect(new Adapter(() => {})).toBeInstanceOf(Adapter);
    });

    test('Promise executor is not a function', () => {
      for (const value of [1, null, undefined, true, false, {}, [], new Date(), '', Adapter.resolve(2), ,]) {
        expect(() => {
          new Adapter(value as any);
        }).toThrow(TypeError);
      }
    });
  });

  describe('should create the resolved', () => {
    test('synchronously resolved with a correct value #1', done => {
      const dummy = {
        dummy: 'dummy',
      };

      const p = new Adapter(resolve => {
        resolve(dummy);
      });

      p.then(
        value => {
          expect(value).toStrictEqual(dummy);
          done();
        },
        () => {
          expect(true).toBeFalsy();
        }
      );
    });

    test('asynchronously resolved with a correct value #2', done => {
      const dummy = {
        dummy: 'dummy',
      };

      const p = new Adapter(resolve => {
        setTimeout(() => {
          resolve(dummy);
        }, 50);
      });

      p.then(
        value => {
          expect(value).toStrictEqual(dummy);
          done();
        },
        () => {
          expect(true).toBeFalsy();
        }
      );
    });
  });

  describe('should create the rejected', () => {
    test('synchronously rejected as expected #1', done => {
      const dummy = {
        dummy: 'dummy',
      };

      const p = new Adapter((resolve, reject) => {
        reject(dummy);
      });

      p.then(
        () => {
          expect(true).toBeFalsy();
        },
        reason => {
          expect(reason).toStrictEqual(dummy);
          done();
        }
      );
    });

    test('synchronously rejected as expected #2', done => {
      const dummy = {
        dummy: 'dummy',
      };

      const p = new Adapter((resolve, reject) => {
        throw dummy;
      });

      p.then(
        () => {
          expect(true).toBeFalsy();
        },
        reason => {
          expect(reason).toStrictEqual(dummy);
          done();
        }
      );
    });

    test('synchronously rejected as expected #3', done => {
      const dummy = {
        dummy: 'dummy',
      };

      const obj = {};

      Object.defineProperty(obj, 'then', {
        get() {
          throw dummy;
        },
      });

      const p = new Adapter((resolve, reject) => {
        resolve(obj);
      });

      p.then(
        () => {
          expect(true).toBeFalsy();
        },
        reason => {
          expect(reason).toStrictEqual(dummy);
          done();
        }
      );
    });

    test('synchronously rejected as expected #4', done => {
      const dummy = {
        dummy: 'dummy',
      };

      const obj = {};

      Object.defineProperty(obj, 'then', {
        get() {
          return () => {
            throw dummy;
          };
        },
      });

      const p = new Adapter((resolve, reject) => {
        resolve(obj);
      });

      p.then(
        () => {
          expect(true).toBeFalsy();
        },
        reason => {
          expect(reason).toStrictEqual(dummy);
          done();
        }
      );
    });

    test('asynchronously rejected as expected #5', done => {
      const dummy = {
        dummy: 'dummy',
      };

      const p = new Adapter((resolve, reject) => {
        setTimeout(() => {
          reject(dummy);
        }, 50);
      });

      p.then(
        () => {
          expect(true).toBeFalsy();
        },
        reason => {
          expect(reason).toStrictEqual(dummy);
          done();
        }
      );
    });
  });

  describe('should toString the Promise', () => {
    test('Promise::@@toStringTag is `Promise`', () => {
      expect(Adapter.prototype[Symbol.toStringTag]).toBe('Promise');
    });

    test('correct stringification', () => {
      expect(String(new Adapter(() => {}))).toBe('[object Promise]');
    });
  });
});
