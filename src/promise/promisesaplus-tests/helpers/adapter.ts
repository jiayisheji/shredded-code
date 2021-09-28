import Adapter from '../../adapter';

export const resolved = (value: any) => new Adapter(resolve => resolve(value));
export const rejected = (reason: any) => new Adapter((_, reject) => reject(reason));

export const deferred = () => {
  let def: any = {};

  let p = new Adapter((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
    def.resolve = resolve;
    def.reject = reject;
  });

  def.promise = p;

  return def as {
    promise: Adapter<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  };
};

// fix jest bug https://github.com/facebook/jest/issues/5311#issuecomment-770035443
export function defuse(promise: Adapter<any>): Adapter<any> {
  if (typeof promise.catch === 'function') {
    promise.catch(() => {});
  }
  return promise;
}

export {Adapter};
