import {deferred, resolved, rejected, Adapter} from './adapter';

export const testFulfilled = function (value: any, cb: (promise: Adapter<any>, done: jest.DoneCallback) => void) {
  test('already-fulfilled', function (done) {
    cb(resolved(value), done);
  });

  test('immediately-fulfilled', function (done) {
    const promise = new Adapter(resolve => resolve(value));
    cb(promise, done);
  });

  test('eventually-fulfilled', function (done) {
    const promise = new Adapter(resolve => {
      setTimeout(function () {
        resolve(value);
      }, 50);
    });
    cb(promise, done);
  });
};

export const testRejected = function (reason: any, cb: (promise: Adapter<any>, done: jest.DoneCallback) => void) {
  test('already-rejected', function (done) {
    cb(rejected(reason), done);
  });

  test('immediately-rejected', function (done) {
    const promise = new Adapter((resolve, reject) => reject(reason));
    cb(promise, done);
  });

  test('eventually-rejected', function (done) {
    const promise = new Adapter((resolve, reject) => {
      setTimeout(function () {
        reject(reason);
      }, 50);
    });
    cb(promise, done);
  });
};
