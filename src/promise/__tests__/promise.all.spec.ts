import 'jest-extended';
import Adapter from '../adapter';

describe('Promise.all', () => {
  describe('should create the method', () => {
    test('all a function', () => {
      expect(Adapter.all).toBeFunction();
    });

    test('need a parameter', () => {
      expect(Adapter.all).toHaveLength(1);
    });

    test('returns a promise', () => {
      expect(Adapter.all([1, 2, 3])).toBeInstanceOf(Adapter);
    });
  })

  describe('should create the resolved', () => {
    test('resolved with a correct value', (done) => {
      Adapter.all([]).then(value => {
        expect(value).toStrictEqual([]);
        done();
      });
    });

    test('resolved with a correct value #1', (done) => {
      Adapter.all([
        Adapter.resolve(1),
        Adapter.resolve(2),
        Adapter.resolve(3),
      ]).then(value => {
        expect(value).toStrictEqual([1, 2, 3]);
        done();
      });
    });

    test('resolved with a correct value #1', (done) => {
      const date = new Date;
      Adapter.all([
        1, null, undefined, true, false, {}, [], date, '', Promise.resolve(2)
      ]).then(value => {
        expect(value).toStrictEqual([1, null, undefined, true, false, {}, [], date, '', 2]);
        done();
      });
    });
  })

  describe('should create the rejected', () => {
    test('rejected as expected', (done) => {
      // @ts-ignore
      Adapter.all().catch(() => {
        expect(true).toBe(true);
        done();
      })
    });

    test('rejected as expected #1', (done) => {
      Adapter.all([
        Adapter.resolve(1),
        Adapter.resolve(2),
        Adapter.reject(3),
      ]).catch(error => {
        expect(error).toBe(3);
        done();
      });
    });
  })
})
