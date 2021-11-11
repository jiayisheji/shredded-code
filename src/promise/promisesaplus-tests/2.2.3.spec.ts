import {deferred, rejected} from './helpers/adapter';
import {testRejected} from './helpers/testThreeCases';

var dummy = {dummy: 'dummy'}; // we fulfill or reject with this when we don't intend to test against it
var sentinel = {sentinel: 'sentinel'}; // a sentinel fulfillment value to test for with strict equality

describe('2.2.3: If `onRejected` is a function,', function () {
  describe('2.2.3.1: it must be called after `promise` is rejected, with `promise`’s rejection reason as its ' + 'first argument.', function () {
    testRejected(sentinel, function (promise, done) {
      promise.then(null, function onRejected(reason) {
        expect(reason).toStrictEqual(sentinel);
        done();
      });
    });
  });

  describe('2.2.3.2: it must not be called before `promise` is rejected', function () {
    test('rejected after a delay', function (done) {
      var d = deferred();
      var isRejected = false;

      d.promise.then(null, function onRejected() {
        expect(isRejected).toBeTruthy();
        done();
      });

      setTimeout(function () {
        d.reject(dummy);
        isRejected = true;
      }, 50);
    });

    test('never rejected', function (done) {
      var d = deferred();
      var onRejectedCalled = false;

      d.promise.then(null, function onRejected() {
        onRejectedCalled = true;
        done();
      });

      setTimeout(function () {
        expect(onRejectedCalled).toBeFalsy();

        done();
      }, 150);
    });
  });

  describe('2.2.3.3: it must not be called more than once.', function () {
    test('already-rejected', function (done) {
      var timesCalled = 0;

      rejected(dummy).then(null, function onRejected() {
        expect(++timesCalled).toBe(1);

        done();
      });
    });

    test('trying to reject a pending promise more than once, immediately', function (done) {
      var d = deferred();
      var timesCalled = 0;

      d.promise.then(null, function onRejected() {
        expect(++timesCalled).toBe(1);

        done();
      });

      d.reject(dummy);
      d.reject(dummy);
    });

    test('trying to reject a pending promise more than once, delayed', function (done) {
      var d = deferred();
      var timesCalled = 0;

      d.promise.then(null, function onRejected() {
        expect(++timesCalled).toBe(1);

        done();
      });

      setTimeout(function () {
        d.reject(dummy);
        d.reject(dummy);
      }, 50);
    });

    test('trying to reject a pending promise more than once, immediately then delayed', function (done) {
      var d = deferred();
      var timesCalled = 0;

      d.promise.then(null, function onRejected() {
        expect(++timesCalled).toBe(1);
        done();
      });

      d.reject(dummy);
      setTimeout(function () {
        d.reject(dummy);
      }, 50);
    });

    test('when multiple `then` calls are made, spaced apart in time', function (done) {
      var d = deferred();
      var timesCalled = [0, 0, 0];

      d.promise.then(null, function onRejected() {
        expect(++timesCalled[0]).toBe(1);
      });

      setTimeout(function () {
        d.promise.then(null, function onRejected() {
          expect(++timesCalled[1]).toBe(1);
        });
      }, 50);

      setTimeout(function () {
        d.promise.then(null, function onRejected() {
          expect(++timesCalled[2]).toBe(1);
          done();
        });
      }, 100);

      setTimeout(function () {
        d.reject(dummy);
      }, 150);
    });

    test('when `then` is interleaved with rejection', function (done) {
      var d = deferred();
      var timesCalled = [0, 0];

      d.promise.then(null, function onRejected() {
        expect(++timesCalled[0]).toBe(1);
      });

      d.reject(dummy);

      d.promise.then(null, function onRejected() {
        expect(++timesCalled[1]).toBe(1);
        done();
      });
    });
  });
});
