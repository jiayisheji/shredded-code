import {deferred, defuse, rejected, resolved} from './helpers/adapter';
import {testFulfilled, testRejected} from './helpers/testThreeCases';

var dummy = {dummy: 'dummy'}; // we fulfill or reject with this when we don't intend to test against it
var sentinel = {sentinel: 'sentinel'}; // a sentinel fulfillment value to test for with strict equality
var other = {other: 'other'}; // a value we don't want to be strict equal to

describe('2.2.7: `then` must return a promise: `promise2 = promise1.then(onFulfilled, onRejected)`', function () {
  test('is a promise', function () {
    var promise1 = deferred().promise;
    var promise2 = promise1.then();

    expect(typeof promise2 === 'object' || typeof promise2 === 'function').toBeTruthy();
    expect(promise2).not.toBeNull();
    expect(typeof promise2.then).toBe('function');
  });

  describe(
    '2.2.7.1: If either `onFulfilled` or `onRejected` returns a value `x`, run the Promise Resolution ' + 'Procedure `[[Resolve]](promise2, x)`',
    function () {
      test('see separate 3.3 tests', function () {});
    }
  );

  describe(
    '2.2.7.2: If either `onFulfilled` or `onRejected` throws an exception `e`, `promise2` must be rejected ' + 'with `e` as the reason.',
    function () {
      function testReason(expectedReason: any, stringRepresentation: string) {
        describe('The reason is ' + stringRepresentation, function () {
          testFulfilled(dummy, function (promise1, done) {
            const promise2 = promise1.then(function onFulfilled() {
              throw expectedReason;
            });

            promise2.then(null, function onPromise2Rejected(actualReason) {
              expect(actualReason).toStrictEqual(expectedReason);
              done();
            });
          });

          testRejected(dummy, function (promise1, done) {
            const promise2 = promise1.then(null, function onRejected() {
              throw expectedReason;
            });

            promise2.then(null, function onPromise2Rejected(actualReason) {
              expect(actualReason).toStrictEqual(expectedReason);
              done();
            });
          });
        });
      }

      testReason(undefined, '`undefined`');
      testReason(null, '`null`');
      testReason(false, '`false`');
      testReason(0, '`0`');
      testReason(new Error(), 'an error');
      testReason(
        (function () {
          var error = new Error();
          delete error.stack;
          return error;
        })(),
        'an error without a stack'
      );
      testReason(new Date(), 'a date');
      testReason({}, 'an object');
      testReason({then: function () {}}, 'an always-pending thenable');
      testReason(resolved(dummy), 'a fulfilled promise');
      testReason(defuse(rejected(dummy)), 'a rejected promise');
    }
  );

  describe(
    '2.2.7.3: If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled ' + 'with the same value.',
    function () {
      function testNonFunction(nonFunction: any, stringRepresentation: string) {
        describe('`onFulfilled` is ' + stringRepresentation, function () {
          testFulfilled(sentinel, function (promise1, done) {
            var promise2 = promise1.then(nonFunction);

            promise2.then(function onPromise2Fulfilled(value) {
              expect(value).toStrictEqual(sentinel);
              done();
            });
          });
        });
      }

      testNonFunction(undefined, '`undefined`');
      testNonFunction(null, '`null`');
      testNonFunction(false, '`false`');
      testNonFunction(5, '`5`');
      testNonFunction({}, 'an object');
      testNonFunction(
        [
          function () {
            return other;
          },
        ],
        'an array containing a function'
      );
    }
  );

  describe(
    '2.2.7.4: If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected ' + 'with the same reason.',
    function () {
      function testNonFunction(nonFunction: any, stringRepresentation: string) {
        describe('`onRejected` is ' + stringRepresentation, function () {
          testRejected(sentinel, function (promise1, done) {
            var promise2 = promise1.then(null, nonFunction);

            promise2.then(null, function onPromise2Rejected(reason) {
              expect(reason).toStrictEqual(sentinel);
              done();
            });
          });
        });
      }

      testNonFunction(undefined, '`undefined`');
      testNonFunction(null, '`null`');
      testNonFunction(false, '`false`');
      testNonFunction(5, '`5`');
      testNonFunction({}, 'an object');
      testNonFunction(
        [
          function () {
            return other;
          },
        ],
        'an array containing a function'
      );
    }
  );
});
