import {rejected, resolved} from './adapter';

const dummy = {dummy: 'dummy'};

export const reasons = {
  ['`undefined`'](): undefined {
    return undefined;
  },
  ['`null`'](): null {
    return null;
  },
  ['`false`'](): boolean {
    return false;
  },
  ['`0`'](): number {
    return 0;
  },
  ['an error'](): Error {
    return new Error();
  },
  ['an error without a stack'](): Error {
    const error = new Error();
    delete error.stack;

    return error;
  },
  ['a date'](): Date {
    return new Date();
  },
  ['an object']() {
    return {};
  },
  ['an always-pending thenable']() {
    return {then() {}};
  },
  ['a fulfilled promise']() {
    return resolved(dummy);
  },
  ['a rejected promise']() {
    return rejected(dummy);
  },
};
