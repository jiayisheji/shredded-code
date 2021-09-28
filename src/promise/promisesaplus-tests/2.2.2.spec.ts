import {
  Adapter,
  deferred,
  resolved
} from './helpers/adapter';
import { testFulfilled } from './helpers/testThreeCases';

const dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
const sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality

describe("2.2.2: If `onFulfilled` is a function,", function () {
  describe("2.2.2.1: it must be called after `promise` is fulfilled, with `promise`’s fulfillment value as its " +
    "first argument.", function () {
      testFulfilled(sentinel, function (promise, done) {
        promise.then(function onFulfilled(value) {
          expect(value).toStrictEqual(sentinel);
          done();
        });
      });
    });

  describe("2.2.2.2: it must not be called before `promise` is fulfilled", function () {
    test("fulfilled after a delay", function (done) {
      let isFulfilled = false;

      let p = new Adapter((resolve) => {
        setTimeout(function () {
          resolve(dummy);
          isFulfilled = true;
        }, 50);
      });

      p.then(() => {
        expect(isFulfilled).toBeTruthy();
        done();
      });
    });

    test("never fulfilled", function (done) {
      let d = deferred();
      let onFulfilledCalled = false;

      d.promise.then(function onFulfilled() {
        onFulfilledCalled = true;
        done();
      });

      setTimeout(function () {
        expect(onFulfilledCalled).toBeFalsy();
        done();
      }, 150);
    });
  });

  describe("2.2.2.3: it must not be called more than once.", function () {
    test("already-fulfilled", function (done) {
      var timesCalled = 0;

      resolved(dummy).then(function onFulfilled() {
        expect(++timesCalled).toBe(1);
        done();
      });
    });

    test("trying to fulfill a pending promise more than once, immediately", function (done) {
      var timesCalled = 0;

      let p = new Adapter((resolve) => {
        resolve(dummy);
        resolve(dummy);
      });

      p.then(function onFulfilled() {
        expect(++timesCalled).toBe(1);
        done();
      });
    });

    test("trying to fulfill a pending promise more than once, delayed", function (done) {
      var timesCalled = 0;

      let p = new Adapter((resolve) => {
        setTimeout(function () {
          resolve(dummy);
          resolve(dummy);
        })
      });

      p.then(function onFulfilled() {
        expect(++timesCalled).toBe(1);
        done();
      });
    });

    test("trying to fulfill a pending promise more than once, immediately then delayed", function (done) {
      var timesCalled = 0;

      let p = new Adapter((resolve) => {
        resolve(dummy);
        setTimeout(function () {
          resolve(dummy);
        })
      });

      p.then(function onFulfilled() {
        expect(++timesCalled).toBe(1);
        done();
      });
    });

    test("when multiple `then` calls are made, spaced apart in time", function (done) {
      let timesCalled = [0, 0, 0];
      let p = new Adapter((resolve) => {
        resolve(dummy);
      });

      p.then(function onFulfilled() {
        expect(++timesCalled[0]).toBe(1);
      });

      setTimeout(function () {
        p.then(function onFulfilled() {
          expect(++timesCalled[1]).toBe(1);
        });
      }, 50);
      setTimeout(function () {
        p.then(function onFulfilled() {
          expect(++timesCalled[2]).toBe(1);
          done();
        });
      }, 100);
    });

    test("when `then` is interleaved with fulfillment", function (done) {
      var d = deferred();
      var timesCalled = [0, 0];

      d.promise.then(function onFulfilled() {
        expect(++timesCalled[0]).toBe(1);
      });

      d.resolve(dummy);

      d.promise.then(function onFulfilled() {
        expect(++timesCalled[1]).toBe(1);
        done();
      });
    });
  });
});

