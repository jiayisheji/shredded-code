import Adapter from '../../adapter';
import {defuse} from './adapter';

const other = {other: 'other'}; // a value we don't want to be strict equal to

export const fulfilledThen = {
  'a synchronously-fulfilled custom thenable'(value: unknown) {
    return {
      then: (onFulfilled: (value: unknown) => void) => {
        onFulfilled(value);
      },
    };
  },

  'an asynchronously-fulfilled custom thenable'(value: unknown) {
    return {
      then(onFulfilled: (value: unknown) => void) {
        setTimeout(function () {
          onFulfilled(value);
        }, 0);
      },
    };
  },

  'a synchronously-fulfilled one-time thenable'(value: unknown) {
    var numberOfTimesThenRetrieved = 0;
    return Object.create(null, {
      then: {
        get() {
          if (numberOfTimesThenRetrieved === 0) {
            ++numberOfTimesThenRetrieved;
            return (onFulfilled: (value: unknown) => void) => {
              onFulfilled(value);
            };
          }
          return null;
        },
      },
    });
  },

  'a thenable that tries to fulfill twice'(value: unknown) {
    return {
      then(onFulfilled: (value: unknown) => void) {
        onFulfilled(value);
        onFulfilled(other);
      },
    };
  },

  'a thenable that fulfills but then throws'(value: unknown) {
    return {
      then(onFulfilled: (value: unknown) => void) {
        onFulfilled(value);
        throw other;
      },
    };
  },

  'an already-fulfilled promise'(value: unknown) {
    return Adapter.resolve(value);
  },

  'an eventually-fulfilled promise'(value: unknown) {
    return new Adapter(resolve => {
      setTimeout(function () {
        resolve(value);
      }, 50);
    });
  },
};

export const rejectedThen = {
  'a synchronously-rejected custom thenable'(reason: unknown) {
    return {
      then(_: undefined, onRejected: (value: unknown) => void) {
        onRejected(reason);
      },
    };
  },

  'an asynchronously-rejected custom thenable'(reason: unknown) {
    return {
      then(_: undefined, onRejected: (value: unknown) => void) {
        setTimeout(function () {
          onRejected(reason);
        }, 0);
      },
    };
  },

  'a synchronously-rejected one-time thenable'(reason: unknown): Record<string, unknown> {
    let numberOfTimesThenRetrieved = 0;
    return Object.create(null, {
      then: {
        get: function () {
          if (numberOfTimesThenRetrieved === 0) {
            ++numberOfTimesThenRetrieved;
            return function (_: undefined, onRejected: (value: unknown) => void) {
              onRejected(reason);
            };
          }
          return null;
        },
      },
    });
  },

  'a thenable that immediately throws in `then`'(reason: unknown) {
    return {
      then() {
        throw reason;
      },
    };
  },

  'an object with a throwing `then` accessor'(reason: unknown) {
    return Object.create(null, {
      then: {
        get: function () {
          throw reason;
        },
      },
    });
  },

  'an already-rejected promise'(reason: unknown) {
    return defuse(Adapter.reject(reason));
  },

  'an eventually-rejected promise'(reason: unknown) {
    return defuse(
      new Adapter((_, reject) => {
        setTimeout(function () {
          reject(reason);
        }, 50);
      })
    );
  },
};
