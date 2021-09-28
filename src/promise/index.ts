import {AggregateError} from './aggregate-error';

interface PromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): PromiseLike<TResult1 | TResult2>;
}

/**
 * 状态
 */
const enum PromiseState {
  /** 等待 */
  PENDING = 'pending',
  /** 成功 */
  FULFILLED = 'fulfilled',
  /** 失败 */
  REJECTED = 'rejected',
}

function isObject(it: unknown): boolean {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
}

function isThenable(it: unknown) {
  let then;
  return isObject(it) && typeof (then = (it as {then: unknown}).then) == 'function' ? then : false;
}

function isFunction(obj: unknown): boolean {
  return typeof obj === 'function';
}

interface PromiseFulfilledResult<T> {
  status: 'fulfilled';
  value: T;
}

interface PromiseRejectedResult {
  status: 'rejected';
  reason: unknown;
}

type PromiseSettledResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult;

type PromiseResult<T> = T | PromiseLike<T>;

function isCallable<T>(fn?: T | null, emptyFunction: unknown = function () {}): T {
  if (isFunction(fn)) {
    return fn as T;
  }
  return emptyFunction as T;
}

/**
 *
 */
export class Promise<T> implements PromiseLike<T> {
  /**
   * 控制 Promise 如何对其 then 方法的传入调用做出反应。
   */
  private state: PromiseState = PromiseState.PENDING;
  /** Promise 的状态是 fulfilled 或 rejected 的值 */
  private result: T | PromiseLike<T> | never | undefined = undefined;
  /** 当 Promise 从 pending 状态转换到 fulfilled 状态时要处理的 PromiseReaction 记录列表。 */
  private fulfillReactions: Array<() => void> = [];
  /** 当 Promise 从 pending 状态转换到 rejected 状态时要处理的 PromiseReaction 记录列表。 */
  private rejectReactions: Array<() => void> = [];

  static reject<T = never>(reason?: unknown): Promise<T> {
    return new Promise<T>((_, reject) => {
      reject(reason);
    });
  }

  static resolve(): Promise<undefined>;
  static resolve<T>(value: T | PromiseLike<T>): Promise<T>;
  static resolve<T>(value?: T | PromiseLike<T>): Promise<T> {
    if (isObject(value) && (value as Promise<T>).constructor === Promise) return value as Promise<T>;
    return new Promise<T>(resolve => {
      resolve(value as T | PromiseLike<T>);
    });
  }

  static all<T>(iterable: PromiseResult<T>[]): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      try {
        const values: any[] = [];
        let counter = 0;
        let remaining = 1;
        const $promiseResolve = Promise.resolve;
        for (const promise of iterable) {
          const index = counter++;
          let alreadyCalled = false;
          values.push(undefined as any);
          remaining++;
          $promiseResolve.call(Promise, promise).then(value => {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[index] = value as T;
            --remaining || resolve(values);
          }, reject);
        }
        --remaining || resolve(values);
      } catch (error) {
        reject(error);
      }
    });
  }

  static race<T>(iterable: readonly T[]): Promise<T extends PromiseLike<infer U> ? U : T> {
    return new Promise<any>((resolve, reject) => {
      try {
        const $promiseResolve = Promise.resolve;
        for (const promise of iterable) {
          $promiseResolve.call(Promise, promise).then(resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  static any<T>(iterable: (T | PromiseLike<T>)[] | Iterable<T | PromiseLike<T>>): Promise<T> {
    return new Promise<any>((resolve, reject) => {
      try {
        const errors: T[] = [];
        let counter = 0;
        let remaining = 1;
        const $promiseResolve = Promise.resolve;
        for (const promise of iterable) {
          const index = counter++;
          let alreadyCalled = false;
          errors.push(undefined as unknown as T);
          remaining++;
          $promiseResolve.call(Promise, promise).then(resolve, reason => {
            if (alreadyCalled) return;
            alreadyCalled = true;
            errors[index] = reason;
            --remaining || reject(new AggregateError(errors, 'All promises were rejected'));
          });
        }
        --remaining || reject(new AggregateError(errors, 'All promises were rejected'));
      } catch (error) {
        reject(error);
      }
    });
  }

  static allSettled<T>(iterable: Iterable<T>): Promise<PromiseSettledResult<T extends PromiseLike<infer U> ? U : T>[]> {
    return new Promise((resolve, reject) => {
      try {
        const values: PromiseSettledResult<T extends PromiseLike<infer U> ? U : T>[] = [];
        let counter = 0;
        let remaining = 1;
        const $promiseResolve = Promise.resolve;
        for (const promise of iterable) {
          const index = counter++;
          let alreadyCalled = false;
          values.push(undefined as any);
          remaining++;
          $promiseResolve.call(Promise, promise).then(
            (value: any) => {
              if (alreadyCalled) return;
              alreadyCalled = true;
              values[index] = {
                status: 'fulfilled',
                value,
              };
              --remaining || resolve(values);
            },
            reason => {
              if (alreadyCalled) return;
              alreadyCalled = true;
              values[index] = {
                status: 'rejected',
                reason,
              };
              --remaining || resolve(values);
            }
          );
        }
        --remaining || resolve(values);
      } catch (error) {
        reject(error);
      }
    });
  }

  constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    if (!isFunction(executor)) {
      throw new TypeError(`Promise resolver ${executor} is not a function`);
    }

    try {
      // 修正 executor 内部 this 指向
      // 在严格模式下，`this` 在它们内部是 `undefined`
      // 在非严格模式下，`this` 将是全局对象
      executor.call(undefined, this.triggerResolve, this.triggerReject);
    } catch (error) {
      this.triggerReject(error);
    }
  }

  get [Symbol.toStringTag](): string {
    return 'Promise';
  }

  private triggerResolve = (value: T | PromiseLike<T>) => {
    try {
      const then = isThenable(value);
      if (then) {
        try {
          then.call(value, this.triggerResolve, this.triggerReject);
        } catch (error) {
          this.triggerReject(error);
        }
      } else {
        if (this.state === PromiseState.PENDING) {
          this.state = PromiseState.FULFILLED;
          this.result = value;
          this.fulfillReactions.forEach(fn => fn());
          this.fulfillReactions = [];
        }
      }
    } catch (error) {
      this.triggerReject(error);
    }
  };

  private triggerReject = (reason?: any) => {
    if (this.state === PromiseState.PENDING) {
      this.state = PromiseState.REJECTED;
      this.result = reason;
      this.rejectReactions.forEach(fn => fn());
      this.rejectReactions = [];
    }
  };

  private resolvePromise<T>(
    promise: Promise<T>,
    x: T | PromiseLike<T>,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) {
    if (promise === x) {
      return reject(new TypeError('Chaining cycle detected for promise #<Promise>'));
    }
    const type = typeof x;
    if ((!!x && type === 'object') || type === 'function') {
      let called = false;
      try {
        const then = (x as PromiseLike<T>).then;
        // then 必须是一个函数
        if (isFunction(then)) {
          then.call(
            x,
            value => {
              if (called) return;
              called = true;
              // 递归 value 防止用户多次调用 promise
              this.resolvePromise(promise, value, resolve, reject);
            },
            reason => {
              if (called) return;
              called = true;
              reject(reason);
            }
          );
        } else {
          if (called) return;
          called = true;
          resolve(x);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      resolve(x);
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    const onfulfilledFn = isCallable<(value: T) => TResult1 | PromiseLike<TResult1>>(onfulfilled, (value: T) => value);
    const onrejectedFn = isCallable<(reason: any) => TResult2 | PromiseLike<TResult2>>(onrejected, (reason: any) => {
      throw reason;
    });

    const promise2 = new Promise<TResult1 | TResult2>((resolve, reject) => {
      const resolutionProcedure = (
        resolution: ((value: T) => TResult1 | PromiseLike<TResult1>) | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      ) => {
        setTimeout(() => {
          try {
            const x = resolution(this.result as unknown as T);
            this.resolvePromise<TResult1 | TResult2>(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      };

      switch (this.state) {
        case PromiseState.PENDING:
          this.fulfillReactions.push(() => {
            resolutionProcedure(onfulfilledFn);
          });
          this.rejectReactions.push(() => {
            resolutionProcedure(onrejectedFn);
          });
          break;
        case PromiseState.FULFILLED:
          resolutionProcedure(onfulfilledFn);
          break;
        case PromiseState.REJECTED:
          resolutionProcedure(onrejectedFn);
          break;
      }
    });
    return promise2;
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
    return this.then<T, TResult>(undefined, onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    const onfinallyFn = isCallable<() => void>(onfinally);
    return this.then<T, never>(
      value => Promise.resolve<void>(onfinallyFn()).then(() => value),
      reason =>
        Promise.resolve<void>(onfinallyFn()).then(() => {
          throw reason;
        })
    );
  }
}
