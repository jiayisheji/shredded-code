import 'jest-extended';
import Adapter from '../adapter';

const dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
const other = { other: "other" };

describe('Promise#catch', () => {
  describe('should create the method', () => {
    test('catch a function', () => {
      expect(Adapter.prototype.catch).toBeFunction();
    });

    test('need a parameter', () => {
      expect(Adapter.prototype.catch).toHaveLength(1);
    });

    test('returns a promise', (done) => {
      expect(Adapter.reject(dummy).catch(() => { done() })).toBeInstanceOf(Adapter);
    });
  })

  describe('should create the resolved', () => {
    test('resolved with a correct value', (done) => {
      Adapter.resolve(dummy)
        .then(() => {
          done();
        })
        .catch(() => {
          expect(true).toBeFalsy();
        })
    });
  })

  describe('should create the rejected', () => {
    test('rejected as expected', (done) => {
      Adapter.reject(dummy)
        .catch(value => {
          expect(value).toStrictEqual(dummy);
          done();
        })
    });

    test('rejected as expected #1', (done) => {
      Adapter.reject(dummy)
        .catch(() => {
          return Adapter.resolve(other);
        })
        .then((value) => {
          expect(value).toStrictEqual(other);
          done();
        })
    });

    test('rejected as expected #2', (done) => {
      Adapter.reject(dummy)
        .catch(() => {
          return Adapter.reject(other);
        })
        .then(() => {
          expect(true).toBeFalsy();
          done();
        }, (error) => {
          expect(error).toStrictEqual(other);
          done();
        })
    });


    test('rejected as expected #3', (done) => {
      Adapter.reject(dummy)
        .catch(() => {
          throw other;
        })
        .then(() => {
          expect(true).toBeFalsy();
          done();
        }, (error) => {
          expect(error).toStrictEqual(other);
          done();
        })
    });
  })
})
