import {
  resolved,
  rejected
} from './helpers/adapter';

const dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.2.1: Both `onFulfilled` and `onRejected` are optional arguments.", () => {
  describe("2.2.1.1: If `onFulfilled` is not a function, it must be ignored.", () => {
    describe("applied to a directly-rejected promise", () => {
      function testNonFunction(nonFunction: any, stringRepresentation: string) {
        test("`onFulfilled` is " + stringRepresentation, function (done) {
          resolved(dummy).then(nonFunction).then(() => {
            done();
          });
        });
      }

      testNonFunction(undefined, "`undefined`");
      testNonFunction(null, "`null`");
      testNonFunction(false, "`false`");
      testNonFunction(5, "`5`");
      testNonFunction({}, "an object");
    });

    describe("applied to a promise rejected and then chained off of", () => {
      function testNonFunction(nonFunction: any, stringRepresentation: string) {
        test("`onFulfilled` is " + stringRepresentation, function (done) {
          rejected(dummy).then(() => { }, undefined).then(nonFunction, () => {
            done();
          });
        });
      }

      testNonFunction(undefined, "`undefined`");
      testNonFunction(null, "`null`");
      testNonFunction(false, "`false`");
      testNonFunction(5, "`5`");
      testNonFunction({}, "an object");
    });
  });

  describe("2.2.1.2: If `onRejected` is not a function, it must be ignored.", () => {
    describe("applied to a directly-fulfilled promise", () => {
      function testNonFunction(nonFunction: any, stringRepresentation: string) {
        test("`onRejected` is " + stringRepresentation, function (done) {
          resolved(dummy).then(() => {
            done();
          }, nonFunction);
        });
      }

      testNonFunction(undefined, "`undefined`");
      testNonFunction(null, "`null`");
      testNonFunction(false, "`false`");
      testNonFunction(5, "`5`");
      testNonFunction({}, "an object");
    });

    describe("applied to a promise fulfilled and then chained off of", () => {
      function testNonFunction(nonFunction: any, stringRepresentation: string) {
        test("`onRejected` is " + stringRepresentation, function (done) {
          resolved(dummy).then(undefined, () => { }).then(() => {
            done();
          }, nonFunction);
        });
      }

      testNonFunction(undefined, "`undefined`");
      testNonFunction(null, "`null`");
      testNonFunction(false, "`false`");
      testNonFunction(5, "`5`");
      testNonFunction({}, "an object");
    });
  });
})