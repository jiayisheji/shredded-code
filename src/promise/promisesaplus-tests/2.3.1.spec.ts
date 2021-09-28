import { rejected, resolved } from "./helpers/adapter";

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

const error = new TypeError('Chaining cycle detected for promise #<Promise>');

describe("2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason.",
  function () {
    test("via return from a fulfilled promise", function (done) {
      // @ts-ignore
      var promise = resolved(dummy).then(function () {
        return promise;
      });

      promise.then(null, function (reason: any) {
        expect(reason instanceof TypeError).toBeTruthy();
        expect(reason.message).toBe(error.message);
        done();
      });
    });

    test("via return from a rejected promise", function (done) {
      // @ts-ignore
      var promise = rejected(dummy).then(null, function () {
        return promise;
      });

      promise.then(null, function (reason: any) {
        expect(reason instanceof TypeError).toBeTruthy();
        expect(reason.message).toBe(error.message);
        done();
      });
    });
  });