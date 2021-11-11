import {Adapter} from './helpers/adapter';
import {testRejected} from './helpers/testThreeCases';

var dummy = {dummy: 'dummy'}; // we fulfill or reject with this when we don't intend to test against it

describe('2.1.3.1: When rejected, a promise: must not transition to any other state.', () => {
  testRejected(dummy, function (promise, done) {
    var onRejectedCalled = false;

    promise.then(
      function onFulfilled() {
        expect(onRejectedCalled).toBeFalsy();
        done();
      },
      function onRejected() {
        onRejectedCalled = true;
      }
    );

    setTimeout(done, 100);
  });

  test('trying to reject then immediately fulfill', done => {
    let p = new Adapter((resolve, reject) => {
      reject(false);
      resolve(true);
    });

    p.then(
      () => {
        done(new Error('not immediately fulfill'));
      },
      reason => {
        expect(reason).toBe(false);
        done();
      }
    );
  });

  test('trying to reject then fulfill, delayed', done => {
    let p = new Adapter((resolve, reject) => {
      setTimeout(() => {
        reject(false);
        resolve(true);
      }, 50);
    });

    p.then(
      () => {
        done(new Error('not immediately fulfill'));
      },
      reason => {
        expect(reason).toBe(false);
        done();
      }
    );
  });

  test('trying to reject immediately then fulfill delayed', done => {
    let p = new Adapter((resolve, reject) => {
      reject(false);
      setTimeout(() => {
        resolve(true);
      }, 50);
    });

    p.then(
      () => {
        done(new Error('not immediately fulfill'));
      },
      reason => {
        expect(reason).toBe(false);
        done();
      }
    );
  });
});
