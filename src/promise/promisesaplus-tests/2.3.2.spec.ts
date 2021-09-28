import { Adapter, deferred, rejected, resolved } from "./helpers/adapter";

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality

function testPromiseResolution(xFactory: () => Adapter<any>, cb: (promise: Adapter<any>, done: jest.DoneCallback) => void) {
  test("via return from a fulfilled promise", function (done) {
    var promise = resolved(dummy).then(function onBasePromiseFulfilled() {
      return xFactory();
    });

    cb(promise, done);
  });

  test("via return from a rejected promise", function (done) {
    var promise = rejected(dummy).then(null, function onBasePromiseRejected() {
      return xFactory();
    });

    cb(promise, done);
  });
}

describe("2.3.2: If `x` is a promise, adopt its state", function () {
  describe("2.3.2.1: If `x` is pending, `promise` must remain pending until `x` is fulfilled or rejected.",
    function () {
      function xFactory() {
        return deferred().promise;
      }

      testPromiseResolution(xFactory, function (promise, done) {
        var wasFulfilled = false;
        var wasRejected = false;

        promise.then(
          function onPromiseFulfilled() {
            wasFulfilled = true;
          },
          function onPromiseRejected() {
            wasRejected = true;
          }
        );

        setTimeout(function () {
          expect(wasFulfilled).toBeFalsy();
          expect(wasRejected).toBeFalsy();
          done();
        }, 100);
      });
    });

  describe("2.3.2.2: If/when `x` is fulfilled, fulfill `promise` with the same value.", function () {
    describe("`x` is already-fulfilled", function () {
      function xFactory() {
        return resolved(sentinel);
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(function onPromiseFulfilled(value) {
          expect(value).toStrictEqual(sentinel);
          done();
        });
      });
    });

    describe("`x` is eventually-fulfilled", function () {
      function xFactory() {
        let d = deferred();
        setTimeout(function () {
          d.resolve(sentinel);
        }, 50);
        return d.promise;
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(function onPromiseFulfilled(value) {
          expect(value).toStrictEqual(sentinel);
          done();
        });
      });
    });
  });

  describe("2.3.2.3: If/when `x` is rejected, reject `promise` with the same reason.", function () {
    describe("`x` is already-rejected", function () {
      function xFactory() {
        return rejected(sentinel);
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(null, function onPromiseRejected(reason) {
          expect(reason).toStrictEqual(sentinel);
          done();
        });
      });
    });

    describe("`x` is eventually-rejected", function () {
      function xFactory() {
        let d = deferred();
        setTimeout(function () {
          d.reject(sentinel);
        }, 50);
        return d.promise;
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(null, function onPromiseRejected(reason) {
          expect(reason).toStrictEqual(sentinel);
          done();
        });
      });
    });
  });
});