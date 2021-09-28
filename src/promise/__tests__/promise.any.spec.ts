import 'jest-extended';
import Adapter from '../adapter';
import { AggregateError } from "../aggregate-error";

describe('Promise.any', () => {
  describe('should create the method', () => {
    test('any a function', () => {
      // @ts-ignore
      expect(Adapter.any).toBeFunction();
    });

    test('need a parameter', () => {
      // @ts-ignore
      expect(Adapter.any).toHaveLength(1);
    });

    test('returns a promise', () => {
      // @ts-ignore
      expect(Adapter.any([1, 2, 3])).toBeInstanceOf(Adapter);
    });
  })

  describe('should create the resolved', () => {
    test('resolved with a correct value', (done) => {
      // @ts-ignore
      Adapter.any([
        Adapter.resolve(1),
        Adapter.reject(2),
        Adapter.resolve(3),
      ]).then((value) => {
        expect(value).toBe(1);
        done();
      });
    });

    test('resolved with a correct value #1', (done) => {
      // @ts-ignore
      Adapter.any([
        1,
        Adapter.reject(2),
        Adapter.resolve(3),
      ]).then((value) => {
        expect(value).toBe(1);
        done();
      });
    });

    test('resolved with a correct value #2', (done) => {
      // @ts-ignore
      Adapter.any([
        Adapter.reject(2),
        1,
        Adapter.resolve(3),
      ]).then((value) => {
        expect(value).toBe(1);
        done();
      });
    });

    test('resolved with a correct value #3', (done) => {
      // @ts-ignore
      Adapter.any([
        Adapter.reject(2),
        Adapter.resolve(1),
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
      Adapter.any().catch(() => {
        expect(true).toBe(true);
        done();
      })
    });

    test('rejected as expected #1', (done) => {
      // @ts-ignore
      Adapter.any([]).catch((error: AggregateError) => {
        expect(error).toBeInstanceOf(AggregateError);
        expect(error.errors).toStrictEqual([]);
        done();
      });
    });

    test('rejected as expected #2', (done) => {
      // @ts-ignore
      Adapter.any([
        Adapter.reject(1),
        Adapter.reject(2),
        Adapter.reject(3),
      ]).catch((error: AggregateError) => {
        expect(error).toBeInstanceOf(AggregateError);
        expect(error.errors).toStrictEqual([1, 2, 3]);
        done();
      });
    });
  })
})
