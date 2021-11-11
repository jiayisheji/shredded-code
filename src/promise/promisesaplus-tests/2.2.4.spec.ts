import {deferred, rejected, resolved} from './helpers/adapter';
import {testFulfilled, testRejected} from './helpers/testThreeCases';

var dummy = {dummy: 'dummy'}; // we fulfill or reject with this when we don't intend to test against it

describe('2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only ' + 'platform code.', function () {
  describe('`then` returns before the promise becomes fulfilled or rejected', function () {
    testFulfilled(dummy, function (promise, done) {
      var thenHasReturned = false;

      promise.then(function onFulfilled() {
        expect(thenHasReturned).toBeTruthy();
        done();
      });

      thenHasReturned = true;
    });
    testRejected(dummy, function (promise, done) {
      var thenHasReturned = false;

      promise.then(null, function onRejected() {
        expect(thenHasReturned).toBeTruthy();
        done();
      });

      thenHasReturned = true;
    });
  });

  describe('Clean-stack execution ordering tests (fulfillment case)', function () {
    test('when `onFulfilled` is added immediately before the promise is fulfilled', function () {
      var d = deferred();
      var onFulfilledCalled = false;

      d.promise.then(function onFulfilled() {
        onFulfilledCalled = true;
      });

      d.resolve(dummy);

      expect(onFulfilledCalled).toBeFalsy();
    });

    test('when `onFulfilled` is added immediately after the promise is fulfilled', function () {
      var d = deferred();
      var onFulfilledCalled = false;

      d.resolve(dummy);

      d.promise.then(function onFulfilled() {
        onFulfilledCalled = true;
      });

      expect(onFulfilledCalled).toBeFalsy();
    });

    test('when one `onFulfilled` is added inside another `onFulfilled`', function (done) {
      var promise = resolved(null);
      var firstOnFulfilledFinished = false;

      promise.then(function () {
        promise.then(function () {
          expect(firstOnFulfilledFinished).toBeTruthy();
          done();
        });
        firstOnFulfilledFinished = true;
      });
    });

    test('when `onFulfilled` is added inside an `onRejected`', function (done) {
      var promise = rejected(null);
      var promise2 = resolved(null);
      var firstOnRejectedFinished = false;

      promise.then(null, function () {
        promise2.then(function () {
          expect(firstOnRejectedFinished).toBeTruthy();
          done();
        });
        firstOnRejectedFinished = true;
      });
    });

    test('when the promise is fulfilled asynchronously', function (done) {
      var d = deferred();
      var firstStackFinished = false;

      setTimeout(function () {
        d.resolve(dummy);
        firstStackFinished = true;
      }, 0);

      d.promise.then(function () {
        expect(firstStackFinished).toBeTruthy();
        done();
      });
    });
  });

  describe('Clean-stack execution ordering tests (rejection case)', function () {
    test('when `onRejected` is added immediately before the promise is rejected', function () {
      var d = deferred();
      var onRejectedCalled = false;

      d.promise.then(null, function onRejected() {
        onRejectedCalled = true;
      });

      d.reject(dummy);

      expect(onRejectedCalled).toBeFalsy();
    });

    test('when `onRejected` is added immediately after the promise is rejected', function () {
      var d = deferred();
      var onRejectedCalled = false;

      d.reject(dummy);

      d.promise.then(null, function onRejected() {
        onRejectedCalled = true;
      });

      expect(onRejectedCalled).toBeFalsy();
    });

    test('when `onRejected` is added inside an `onFulfilled`', function (done) {
      var promise = resolved(null);
      var promise2 = rejected(null);
      var firstOnFulfilledFinished = false;

      promise.then(function () {
        promise2.then(null, function () {
          expect(firstOnFulfilledFinished).toBeTruthy();
          done();
        });
        firstOnFulfilledFinished = true;
      });
    });

    test('when one `onRejected` is added inside another `onRejected`', function (done) {
      var promise = rejected(null);
      var firstOnRejectedFinished = false;

      promise.then(null, function () {
        promise.then(null, function () {
          expect(firstOnRejectedFinished).toBeTruthy();
          done();
        });
        firstOnRejectedFinished = true;
      });
    });

    test('when the promise is rejected asynchronously', function (done) {
      var d = deferred();
      var firstStackFinished = false;

      setTimeout(function () {
        d.reject(dummy);
        firstStackFinished = true;
      }, 0);

      d.promise.then(null, function () {
        expect(firstStackFinished).toBeTruthy();
        done();
      });
    });
  });
});
