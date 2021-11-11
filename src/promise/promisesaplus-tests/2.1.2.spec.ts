import {Adapter} from './helpers/adapter';
import {testFulfilled} from './helpers/testThreeCases';

var dummy = {dummy: 'dummy'}; // we fulfill or reject with this when we don't intend to test against it

describe('2.1.2.1: When fulfilled, a promise: must not transition to any other state.', () => {
  testFulfilled(dummy, function (promise, done) {
    var onFulfilledCalled = false;

    promise.then(
      function onFulfilled() {
        onFulfilledCalled = true;
      },
      function onRejected() {
        expect(onFulfilledCalled).toBeFalsy();
        done();
      }
    );

    setTimeout(done, 100);
  });

  test('trying to fulfill then immediately reject', done => {
    let p = new Adapter((resolve, reject) => {
      resolve(true);
      reject(false);
    });

    p.then(
      value => {
        expect(value).toBe(true);
        done();
      },
      () => {
        done(new Error('not immediately reject'));
      }
    );
  });

  test('trying to fulfill then immediately reject', done => {
    let p = new Adapter((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
        reject(false);
      }, 50);
    });

    p.then(
      value => {
        expect(value).toBe(true);
        done();
      },
      () => {
        done(new Error('not immediately reject'));
      }
    );
  });

  test('trying to fulfill then immediately reject', done => {
    let p = new Adapter((resolve, reject) => {
      resolve(true);
      setTimeout(() => {
        reject(false);
      }, 50);
    });

    p.then(
      value => {
        expect(value).toBe(true);
        done();
      },
      () => {
        done(new Error('not immediately reject'));
      }
    );
  });
});
