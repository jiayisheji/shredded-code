import {defuse} from './helpers/adapter';
import {testFulfilled, testRejected} from './helpers/testThreeCases';

var dummy = {dummy: 'dummy'}; // we fulfill or reject with this when we don't intend to test against it
var other = {other: 'other'}; // a value we don't want to be strict equal to
var sentinel = {sentinel: 'sentinel'}; // a sentinel fulfillment value to test for with strict equality
var sentinel2 = {sentinel2: 'sentinel2'};
var sentinel3 = {sentinel3: 'sentinel3'};

function callbackAggregator(times: number, ultimateCallback: () => void) {
  var soFar = 0;
  return function () {
    if (++soFar === times) {
      ultimateCallback();
    }
  };
}

describe('2.2.6: `then` may be called multiple times on the same promise.', function () {
  describe(
    '2.2.6.1: If/when `promise` is fulfilled, all respective `onFulfilled` callbacks must execute in the ' +
      'order of their originating calls to `then`.',
    function () {
      describe('multiple boring fulfillment handlers', function () {
        testFulfilled(sentinel, function (promise, done) {
          var handler1 = jest.fn().mockResolvedValue(other);
          var handler2 = jest.fn().mockResolvedValue(other);
          var handler3 = jest.fn().mockResolvedValue(other);

          var spy = jest.fn();
          promise.then(handler1, spy);
          promise.then(handler2, spy);
          promise.then(handler3, spy);

          promise.then(function (value) {
            expect(value).toStrictEqual(sentinel);

            expect(handler1).toHaveBeenCalledWith(sentinel);
            expect(handler2).toHaveBeenCalledWith(sentinel);
            expect(handler3).toHaveBeenCalledWith(sentinel);

            expect(spy).not.toHaveBeenCalled();

            done();
          });
        });
      });

      describe('multiple fulfillment handlers, one of which throws', function () {
        testFulfilled(sentinel, function (promise, done) {
          var handler1 = jest.fn().mockResolvedValue(other);
          var handler2 = jest.fn().mockRejectedValue(other);
          var handler3 = jest.fn().mockResolvedValue(other);

          var spy = jest.fn();
          promise.then(handler1, spy);
          defuse(promise.then(handler2, spy));
          promise.then(handler3, spy);

          promise.then(function (value) {
            expect(value).toStrictEqual(sentinel);

            expect(handler1).toHaveBeenCalledWith(sentinel);
            expect(handler2).toHaveBeenCalledWith(sentinel);
            expect(handler3).toHaveBeenCalledWith(sentinel);
            expect(spy).not.toHaveBeenCalled();

            done();
          });
        });
      });

      describe('results in multiple branching chains with their own fulfillment values', function () {
        testFulfilled(dummy, function (promise, done) {
          var semiDone = callbackAggregator(3, done);

          promise
            .then(function () {
              return sentinel;
            })
            .then(function (value) {
              expect(value).toStrictEqual(sentinel);
              semiDone();
            });

          promise
            .then(function () {
              throw sentinel2;
            })
            .then(null, function (reason) {
              expect(reason).toStrictEqual(sentinel2);
              semiDone();
            });

          promise
            .then(function () {
              return sentinel3;
            })
            .then(function (value) {
              expect(value).toStrictEqual(sentinel3);
              semiDone();
            });
        });
      });

      describe('`onFulfilled` handlers are called in the original order', function () {
        testFulfilled(dummy, function (promise, done) {
          const callOrder: string[] = [];

          var handler1 = jest.fn().mockImplementation(() => callOrder.push('handler1'));
          var handler2 = jest.fn().mockImplementation(() => callOrder.push('handler2'));
          var handler3 = jest.fn().mockImplementation(() => callOrder.push('handler3'));

          promise.then(handler1);
          promise.then(handler2);
          promise.then(handler3);

          promise.then(function () {
            expect(['handler1', 'handler2', 'handler3']).toStrictEqual(callOrder);
            done();
          });
        });

        describe('even when one handler is added inside another handler', function () {
          testFulfilled(dummy, function (promise, done) {
            const callOrder: string[] = [];
            var handler1 = jest.fn().mockImplementation(() => callOrder.push('handler1'));
            var handler2 = jest.fn().mockImplementation(() => callOrder.push('handler2'));
            var handler3 = jest.fn().mockImplementation(() => callOrder.push('handler3'));

            promise.then(function () {
              handler1();
              promise.then(handler3);
            });
            promise.then(handler2);

            promise.then(function () {
              // Give implementations a bit of extra time to flush their internal queue, if necessary.
              setTimeout(function () {
                expect(['handler1', 'handler2', 'handler3']).toStrictEqual(callOrder);
                done();
              }, 15);
            });
          });
        });
      });
    }
  );

  describe(
    '2.2.6.2: If/when `promise` is rejected, all respective `onRejected` callbacks must execute in the ' +
      'order of their originating calls to `then`.',
    function () {
      describe('multiple boring rejection handlers', function () {
        testRejected(sentinel, function (promise, done) {
          var handler1 = jest.fn().mockResolvedValue(other);
          var handler2 = jest.fn().mockResolvedValue(other);
          var handler3 = jest.fn().mockResolvedValue(other);

          var spy = jest.fn();
          promise.then(spy, handler1);
          promise.then(spy, handler2);
          promise.then(spy, handler3);

          promise.then(null, function (reason) {
            expect(reason).toStrictEqual(sentinel);

            expect(handler1).toHaveBeenCalledWith(sentinel);
            expect(handler2).toHaveBeenCalledWith(sentinel);
            expect(handler3).toHaveBeenCalledWith(sentinel);
            expect(spy).not.toHaveBeenCalled();

            done();
          });
        });
      });

      describe('multiple rejection handlers, one of which throws', function () {
        testRejected(sentinel, function (promise, done) {
          var handler1 = jest.fn().mockResolvedValue(other);
          var handler2 = jest.fn().mockRejectedValue(other);
          var handler3 = jest.fn().mockResolvedValue(other);

          var spy = jest.fn();
          promise.then(spy, handler1);
          defuse(promise.then(spy, handler2));
          promise.then(spy, handler3);

          promise.then(null, function (reason) {
            expect(reason).toStrictEqual(sentinel);

            expect(handler1).toHaveBeenCalledWith(sentinel);
            expect(handler2).toHaveBeenCalledWith(sentinel);
            expect(handler3).toHaveBeenCalledWith(sentinel);

            expect(spy).not.toHaveBeenCalled();

            done();
          });
        });
      });

      describe('results in multiple branching chains with their own fulfillment values', function () {
        testRejected(sentinel, function (promise, done) {
          var semiDone = callbackAggregator(3, done);

          promise
            .then(null, function () {
              return sentinel;
            })
            .then(function (value) {
              expect(value).toStrictEqual(sentinel);
              semiDone();
            });

          promise
            .then(null, function () {
              throw sentinel2;
            })
            .then(null, function (reason) {
              expect(reason).toStrictEqual(sentinel2);
              semiDone();
            });

          promise
            .then(null, function () {
              return sentinel3;
            })
            .then(function (value) {
              expect(value).toStrictEqual(sentinel3);
              semiDone();
            });
        });
      });

      describe('`onRejected` handlers are called in the original order', function () {
        testRejected(dummy, function (promise, done) {
          const callOrder: string[] = [];
          var handler1 = jest.fn().mockImplementation(() => callOrder.push('handler1'));
          var handler2 = jest.fn().mockImplementation(() => callOrder.push('handler2'));
          var handler3 = jest.fn().mockImplementation(() => callOrder.push('handler3'));

          promise.then(null, handler1);
          promise.then(null, handler2);
          promise.then(null, handler3);

          promise.then(null, function () {
            expect(['handler1', 'handler2', 'handler3']).toStrictEqual(callOrder);
            done();
          });
        });

        describe('even when one handler is added inside another handler', function () {
          testRejected(dummy, function (promise, done) {
            const callOrder: string[] = [];
            var handler1 = jest.fn().mockImplementation(() => callOrder.push('handler1'));
            var handler2 = jest.fn().mockImplementation(() => callOrder.push('handler2'));
            var handler3 = jest.fn().mockImplementation(() => callOrder.push('handler3'));

            promise.then(null, function () {
              handler1();
              promise.then(null, handler3);
            });
            promise.then(null, handler2);

            promise.then(null, function () {
              // Give implementations a bit of extra time to flush their internal queue, if necessary.
              setTimeout(function () {
                expect(['handler1', 'handler2', 'handler3']).toStrictEqual(callOrder);
                done();
              }, 15);
            });
          });
        });
      });
    }
  );
});
