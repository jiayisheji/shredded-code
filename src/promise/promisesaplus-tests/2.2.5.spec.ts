import { rejected, resolved } from "./helpers/adapter";

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.2.5 `onFulfilled` and `onRejected` must be called as functions (i.e. with no `this` value).", function () {
  describe("strict mode", function () {
    test("fulfilled", function (done) {
      resolved(dummy).then(function onFulfilled(this: undefined) {
        "use strict";

        expect(this).toBeUndefined();
        done();
      });
    });

    test("rejected", function (done) {
      rejected(dummy).then(null, function onRejected(this: undefined) {
        "use strict";

        expect(this).toBeUndefined();
        done();
      });
    });
  });

  describe("sloppy mode", function () {
    test("fulfilled", function (done) {
      resolved(dummy).then(function onFulfilled(this: typeof globalThis) {
        expect(this).toBeUndefined();
        done();
      });
    });

    test("rejected", function (done) {
      rejected(dummy).then(null, function onRejected(this: typeof globalThis) {
        expect(this).toBeUndefined();
        done();
      });
    });
  });
});
