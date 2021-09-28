import {Adapter, deferred, defuse, rejected, resolved} from './helpers/adapter';
import {reasons} from './helpers/reasons';
import {fulfilledThen, rejectedThen} from './helpers/thenables';

var dummy = {dummy: 'dummy'}; // we fulfill or reject with this when we don't intend to test against it
var sentinel = {sentinel: 'sentinel'}; // a sentinel fulfillment value to test for with strict equality
var other = {other: 'other'}; // a value we don't want to be strict equal to
var sentinelArray = [sentinel]; // a sentinel fulfillment value to test when we need an array

function testPromiseResolution(xFactory: () => {then: (...args: any) => void}, cb: (promise: Adapter<any>, done: jest.DoneCallback) => void) {
  test('via return from a fulfilled promise', function (done) {
    var promise = resolved(dummy).then(function onBasePromiseFulfilled() {
      return xFactory();
    });

    cb(promise, done);
  });

  test('via return from a rejected promise', function (done) {
    var promise = rejected(dummy).then(null, function onBasePromiseRejected() {
      return xFactory();
    });

    cb(promise, done);
  });
}

function testCallingResolvePromise(
  yFactory: () => {then: (...args: any) => void},
  stringRepresentation: string,
  cb: (promise: Adapter<any>, done: jest.DoneCallback) => void
) {
  describe('`y` is ' + stringRepresentation, function () {
    describe('`then` calls `resolvePromise` synchronously', function () {
      function xFactory() {
        return {
          then: function (resolvePromise: (value: any) => void) {
            resolvePromise(yFactory());
          },
        };
      }

      testPromiseResolution(xFactory, cb);
    });

    describe('`then` calls `resolvePromise` asynchronously', function () {
      function xFactory() {
        return {
          then: function (resolvePromise: (value: any) => void) {
            setTimeout(function () {
              resolvePromise(yFactory());
            }, 0);
          },
        };
      }

      testPromiseResolution(xFactory, cb);
    });
  });
}

function testCallingRejectPromise(r: any, stringRepresentation: string, cb: (promise: Adapter<any>, done: jest.DoneCallback) => void) {
  describe('`r` is ' + stringRepresentation, function () {
    describe('`then` calls `rejectPromise` synchronously', function () {
      function xFactory() {
        return {
          then: function (_: undefined, rejectPromise: (value: any) => void) {
            rejectPromise(r);
          },
        };
      }

      testPromiseResolution(xFactory, cb);
    });

    describe('`then` calls `rejectPromise` asynchronously', function () {
      function xFactory() {
        return {
          then: function (_: undefined, rejectPromise: (value: any) => void) {
            setTimeout(function () {
              rejectPromise(r);
            }, 0);
          },
        };
      }

      testPromiseResolution(xFactory, cb);
    });
  });
}

function testCallingResolvePromiseFulfillsWith(yFactory: () => {then: (...args: any) => any}, stringRepresentation: string, fulfillmentValue: any) {
  testCallingResolvePromise(yFactory, stringRepresentation, function (promise, done) {
    promise.then(function onPromiseFulfilled(value) {
      expect(value).toStrictEqual(fulfillmentValue);
      done();
    });
  });
}

function testCallingResolvePromiseRejectsWith(yFactory: () => {then: (...args: any) => any}, stringRepresentation: string, rejectionReason: any) {
  testCallingResolvePromise(yFactory, stringRepresentation, function (promise, done) {
    promise.then(null, function onPromiseRejected(reason) {
      expect(reason).toStrictEqual(rejectionReason);
      done();
    });
  });
}

function testCallingRejectPromiseRejectsWith(reason: any, stringRepresentation: string) {
  testCallingRejectPromise(reason, stringRepresentation, function (promise, done) {
    promise.then(null, function onPromiseRejected(rejectionReason) {
      expect(reason).toStrictEqual(rejectionReason);
      done();
    });
  });
}

describe('2.3.3: Otherwise, if `x` is an object or function,', function () {
  describe('2.3.3.1: Let `then` be `x.then`', function () {
    describe('`x` is an object with null prototype', function () {
      var numberOfTimesThenWasRetrieved: number;

      beforeEach(function () {
        numberOfTimesThenWasRetrieved = 0;
      });

      function xFactory() {
        return Object.create(null, {
          then: {
            get: function () {
              ++numberOfTimesThenWasRetrieved;
              return function thenMethodForX(onFulfilled: () => void) {
                onFulfilled();
              };
            },
          },
        });
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(function () {
          expect(numberOfTimesThenWasRetrieved).toBe(1);
          done();
        });
      });
    });

    describe('`x` is an object with normal Object.prototype', function () {
      var numberOfTimesThenWasRetrieved: number;

      beforeEach(function () {
        numberOfTimesThenWasRetrieved = 0;
      });

      function xFactory() {
        return Object.create(Object.prototype, {
          then: {
            get: function () {
              ++numberOfTimesThenWasRetrieved;
              return function thenMethodForX(onFulfilled: () => void) {
                onFulfilled();
              };
            },
          },
        });
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(function () {
          expect(numberOfTimesThenWasRetrieved).toBe(1);
          done();
        });
      });
    });

    describe('`x` is a function', function () {
      var numberOfTimesThenWasRetrieved: number;

      beforeEach(function () {
        numberOfTimesThenWasRetrieved = 0;
      });

      function xFactory() {
        function x() {}

        Object.defineProperty(x, 'then', {
          get: function () {
            ++numberOfTimesThenWasRetrieved;
            return function thenMethodForX(onFulfilled: () => void) {
              onFulfilled();
            };
          },
        });

        return x as unknown as {then: (...args: any) => any};
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(function () {
          expect(numberOfTimesThenWasRetrieved).toBe(1);
          done();
        });
      });
    });
  });

  describe(
    '2.3.3.2: If retrieving the property `x.then` results in a thrown exception `e`, reject `promise` with ' + '`e` as the reason.',
    function () {
      function testRejectionViaThrowingGetter(e: any, stringRepresentation: string) {
        function xFactory() {
          return Object.create(Object.prototype, {
            then: {
              get: function () {
                throw e;
              },
            },
          });
        }

        describe('`e` is ' + stringRepresentation, function () {
          testPromiseResolution(xFactory, function (promise, done) {
            promise.then(null, function (reason) {
              expect(reason).toStrictEqual(e);
              done();
            });
          });
        });
      }

      Object.keys(reasons).forEach(function (stringRepresentation) {
        // @ts-ignore
        testRejectionViaThrowingGetter(reasons[stringRepresentation], stringRepresentation);
      });
    }
  );

  describe(
    '2.3.3.3: If `then` is a function, call it with `x` as `this`, first argument `resolvePromise`, and ' + 'second argument `rejectPromise`',
    function () {
      describe('Calls with `x` as `this` and two function arguments', function () {
        function xFactory() {
          var x = {
            then: function (onFulfilled: () => void, onRejected: () => void) {
              expect(this).toStrictEqual(x);
              expect(typeof onFulfilled).toBe('function');
              expect(typeof onRejected).toBe('function');
              onFulfilled();
            },
          };
          return x;
        }

        testPromiseResolution(xFactory, function (promise: Adapter<any>, done: jest.DoneCallback) {
          promise.then(function () {
            done();
          });
        });
      });

      describe('Uses the original value of `then`', function () {
        var numberOfTimesThenWasRetrieved: number;

        beforeEach(function () {
          numberOfTimesThenWasRetrieved = 0;
        });

        function xFactory() {
          return Object.create(Object.prototype, {
            then: {
              get: function () {
                if (numberOfTimesThenWasRetrieved === 0) {
                  return function (onFulfilled: () => void) {
                    onFulfilled();
                  };
                }
                return null;
              },
            },
          });
        }

        testPromiseResolution(xFactory, function (promise: Adapter<any>, done: jest.DoneCallback) {
          promise.then(function () {
            done();
          });
        });
      });

      describe('2.3.3.3.1: If/when `resolvePromise` is called with value `y`, run `[[Resolve]](promise, y)`', function () {
        describe('`y` is not a thenable', function () {
          testCallingResolvePromiseFulfillsWith(
            function () {
              return undefined;
            } as any,
            '`undefined`',
            undefined
          );
          testCallingResolvePromiseFulfillsWith(
            function () {
              return null;
            } as any,
            '`null`',
            null
          );
          testCallingResolvePromiseFulfillsWith(
            function () {
              return false;
            } as any,
            '`false`',
            false
          );
          testCallingResolvePromiseFulfillsWith(
            function () {
              return 5;
            } as any,
            '`5`',
            5
          );
          testCallingResolvePromiseFulfillsWith(
            function () {
              return sentinel;
            } as any,
            'an object',
            sentinel
          );
          testCallingResolvePromiseFulfillsWith(
            function () {
              return sentinelArray;
            } as any,
            'an array',
            sentinelArray
          );
        });

        describe('`y` is a thenable', function () {
          Object.keys(fulfilledThen).forEach(function (stringRepresentation) {
            function yFactory() {
              // @ts-ignore
              return fulfilledThen[stringRepresentation](sentinel);
            }

            testCallingResolvePromiseFulfillsWith(yFactory, stringRepresentation, sentinel);
          });

          Object.keys(rejectedThen).forEach(function (stringRepresentation) {
            function yFactory() {
              // @ts-ignore
              return rejectedThen[stringRepresentation](sentinel);
            }

            testCallingResolvePromiseRejectsWith(yFactory, stringRepresentation, sentinel);
          });
        });

        describe('`y` is a thenable for a thenable', function () {
          Object.keys(fulfilledThen).forEach(function (outerStringRepresentation) {
            // @ts-ignore
            const outerThenableFactory = fulfilledThen[outerStringRepresentation];

            Object.keys(fulfilledThen).forEach(function (innerStringRepresentation) {
              // @ts-ignore
              const innerThenableFactory = fulfilledThen[innerStringRepresentation];

              const stringRepresentation = outerStringRepresentation + ' for ' + innerStringRepresentation;

              function yFactory() {
                return outerThenableFactory(innerThenableFactory(sentinel));
              }

              testCallingResolvePromiseFulfillsWith(yFactory, stringRepresentation, sentinel);
            });

            Object.keys(rejectedThen).forEach(function (innerStringRepresentation) {
              // @ts-ignore
              const innerThenableFactory = rejectedThen[innerStringRepresentation];

              const stringRepresentation = outerStringRepresentation + ' for ' + innerStringRepresentation;

              function yFactory() {
                return outerThenableFactory(innerThenableFactory(sentinel));
              }

              testCallingResolvePromiseRejectsWith(yFactory, stringRepresentation, sentinel);
            });
          });
        });
      });

      describe('2.3.3.3.2: If/when `rejectPromise` is called with reason `r`, reject `promise` with `r`', function () {
        testCallingRejectPromiseRejectsWith(undefined, '`undefined`');
        testCallingRejectPromiseRejectsWith(null, '`null`');
        testCallingRejectPromiseRejectsWith(false, '`false`');
        testCallingRejectPromiseRejectsWith(0, '`0`');
        testCallingRejectPromiseRejectsWith(new Error(), 'an error');
        testCallingRejectPromiseRejectsWith(
          (function () {
            var error = new Error();
            delete error.stack;
            return error;
          })(),
          'an error without a stack'
        );
        testCallingRejectPromiseRejectsWith(new Date(), 'a date');
        testCallingRejectPromiseRejectsWith({}, 'an object');
        testCallingRejectPromiseRejectsWith({then: function () {}}, 'an always-pending thenable');
        testCallingRejectPromiseRejectsWith(resolved(dummy), 'a fulfilled promise');
        testCallingRejectPromiseRejectsWith(
          rejected(dummy).catch(() => {}),
          'a rejected promise'
        );
      });

      describe(
        '2.3.3.3.3: If both `resolvePromise` and `rejectPromise` are called, or multiple calls to the same ' +
          'argument are made, the first call takes precedence, and any further calls are ignored.',
        function () {
          describe('calling `resolvePromise` then `rejectPromise`, both synchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  resolvePromise(sentinel);
                  rejectPromise(other);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(function (value) {
                expect(value).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('calling `resolvePromise` synchronously then `rejectPromise` asynchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  resolvePromise(sentinel);

                  setTimeout(function () {
                    rejectPromise(other);
                  }, 0);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(function (value) {
                expect(value).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('calling `resolvePromise` then `rejectPromise`, both asynchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  setTimeout(function () {
                    resolvePromise(sentinel);
                  }, 0);

                  setTimeout(function () {
                    rejectPromise(other);
                  }, 0);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(function (value) {
                expect(value).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe(
            'calling `resolvePromise` with an asynchronously-fulfilled promise, then calling ' + '`rejectPromise`, both synchronously',
            function () {
              function xFactory() {
                var d = deferred();
                setTimeout(function () {
                  d.resolve(sentinel);
                }, 50);

                return {
                  then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                    resolvePromise(d.promise);
                    rejectPromise(other);
                  },
                };
              }

              testPromiseResolution(xFactory, function (promise, done) {
                promise.then(function (value) {
                  expect(value).toStrictEqual(sentinel);
                  done();
                });
              });
            }
          );

          describe(
            'calling `resolvePromise` with an asynchronously-rejected promise, then calling ' + '`rejectPromise`, both synchronously',
            function () {
              function xFactory() {
                var d = deferred();
                setTimeout(function () {
                  d.reject(sentinel);
                }, 50);

                return {
                  then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                    resolvePromise(d.promise);
                    rejectPromise(other);
                  },
                };
              }

              testPromiseResolution(xFactory, function (promise, done) {
                promise.then(null, function (reason) {
                  expect(reason).toStrictEqual(sentinel);
                  done();
                });
              });
            }
          );

          describe('calling `rejectPromise` then `resolvePromise`, both synchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  rejectPromise(sentinel);
                  resolvePromise(other);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('calling `rejectPromise` synchronously then `resolvePromise` asynchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  rejectPromise(sentinel);

                  setTimeout(function () {
                    resolvePromise(other);
                  }, 0);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('calling `rejectPromise` then `resolvePromise`, both asynchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  setTimeout(function () {
                    rejectPromise(sentinel);
                  }, 0);

                  setTimeout(function () {
                    resolvePromise(other);
                  }, 0);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('calling `resolvePromise` twice synchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void) {
                  resolvePromise(sentinel);
                  resolvePromise(other);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(function (value) {
                expect(value).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('calling `resolvePromise` twice, first synchronously then asynchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void) {
                  resolvePromise(sentinel);

                  setTimeout(function () {
                    resolvePromise(other);
                  }, 0);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(function (value) {
                expect(value).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('calling `resolvePromise` twice, both times asynchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void) {
                  setTimeout(function () {
                    resolvePromise(sentinel);
                  }, 0);

                  setTimeout(function () {
                    resolvePromise(other);
                  }, 0);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(function (value) {
                expect(value).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe(
            'calling `resolvePromise` with an asynchronously-fulfilled promise, then calling it again, both ' + 'times synchronously',
            function () {
              function xFactory() {
                var d = deferred();
                setTimeout(function () {
                  d.resolve(sentinel);
                }, 50);

                return {
                  then: function (resolvePromise: (value: any) => void) {
                    resolvePromise(d.promise);
                    resolvePromise(other);
                  },
                };
              }

              testPromiseResolution(xFactory, function (promise, done) {
                promise.then(function (value) {
                  expect(value).toStrictEqual(sentinel);
                  done();
                });
              });
            }
          );

          describe(
            'calling `resolvePromise` with an asynchronously-rejected promise, then calling it again, both ' + 'times synchronously',
            function () {
              function xFactory() {
                var d = deferred();
                setTimeout(function () {
                  d.reject(sentinel);
                }, 50);

                return {
                  then: function (resolvePromise: (value: any) => void) {
                    resolvePromise(d.promise);
                    resolvePromise(other);
                  },
                };
              }

              testPromiseResolution(xFactory, function (promise, done) {
                promise.then(null, function (reason) {
                  expect(reason).toStrictEqual(sentinel);
                  done();
                });
              });
            }
          );

          describe('calling `rejectPromise` twice synchronously', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  rejectPromise(sentinel);
                  rejectPromise(other);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('calling `rejectPromise` twice, first synchronously then asynchronously', function () {
            function xFactory() {
              return {
                then: function (_: undefined, rejectPromise: (reason: any) => void) {
                  rejectPromise(sentinel);

                  setTimeout(function () {
                    rejectPromise(other);
                  }, 0);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('calling `rejectPromise` twice, both times asynchronously', function () {
            function xFactory() {
              return {
                then: function (_: undefined, rejectPromise: (reason: any) => void) {
                  setTimeout(function () {
                    rejectPromise(sentinel);
                  }, 0);

                  setTimeout(function () {
                    rejectPromise(other);
                  }, 0);
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('saving and abusing `resolvePromise` and `rejectPromise`', function () {
            var savedResolvePromise: (value: any) => void | null, savedRejectPromise: (reason: any) => void | null;

            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  savedResolvePromise = resolvePromise;
                  savedRejectPromise = rejectPromise;
                },
              };
            }

            beforeEach(function () {
              // @ts-ignore
              savedResolvePromise = null;
              // @ts-ignore
              savedRejectPromise = null;
            });

            testPromiseResolution(xFactory, function (promise, done) {
              var timesFulfilled = 0;
              var timesRejected = 0;

              promise.then(
                function () {
                  ++timesFulfilled;
                },
                function () {
                  ++timesRejected;
                }
              );

              // @ts-ignore
              if (savedResolvePromise && savedRejectPromise) {
                savedResolvePromise(dummy);
                savedResolvePromise(dummy);
                savedRejectPromise(dummy);
                savedRejectPromise(dummy);
              }

              setTimeout(function () {
                savedResolvePromise(dummy);
                savedResolvePromise(dummy);
                savedRejectPromise(dummy);
                savedRejectPromise(dummy);
              }, 50);

              setTimeout(function () {
                expect(timesFulfilled).toBe(1);
                expect(timesRejected).toBe(0);
                done();
              }, 100);
            });
          });
        }
      );

      describe('2.3.3.3.4: If calling `then` throws an exception `e`,', function () {
        describe('2.3.3.3.4.1: If `resolvePromise` or `rejectPromise` have been called, ignore it.', function () {
          describe('`resolvePromise` was called with a non-thenable', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void) {
                  resolvePromise(sentinel);
                  throw other;
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(function (value) {
                expect(value).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('`resolvePromise` was called with an asynchronously-fulfilled promise', function () {
            function xFactory() {
              var d = deferred();
              setTimeout(function () {
                d.resolve(sentinel);
              }, 50);

              return {
                then: function (resolvePromise: (value: any) => void) {
                  resolvePromise(d.promise);
                  throw other;
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(function (value) {
                expect(value).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('`resolvePromise` was called with an asynchronously-rejected promise', function () {
            function xFactory() {
              var d = deferred();
              setTimeout(function () {
                d.reject(sentinel);
              }, 50);

              return {
                then: function (resolvePromise: (value: any) => void) {
                  resolvePromise(d.promise);
                  throw other;
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('`rejectPromise` was called', function () {
            function xFactory() {
              return {
                then: function (_: undefined, rejectPromise: (reason: any) => void) {
                  rejectPromise(sentinel);
                  throw other;
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('`resolvePromise` then `rejectPromise` were called', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  resolvePromise(sentinel);
                  rejectPromise(other);
                  throw other;
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(function (value) {
                expect(value).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('`rejectPromise` then `resolvePromise` were called', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void, rejectPromise: (reason: any) => void) {
                  rejectPromise(sentinel);
                  resolvePromise(other);
                  throw other;
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });
        });

        describe('2.3.3.3.4.2: Otherwise, reject `promise` with `e` as the reason.', function () {
          describe('straightforward case', function () {
            function xFactory() {
              return {
                then: function () {
                  throw sentinel;
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('`resolvePromise` is called asynchronously before the `throw`', function () {
            function xFactory() {
              return {
                then: function (resolvePromise: (value: any) => void) {
                  setTimeout(function () {
                    resolvePromise(other);
                  }, 0);
                  throw sentinel;
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });

          describe('`rejectPromise` is called asynchronously before the `throw`', function () {
            function xFactory() {
              return {
                then: function (_: undefined, rejectPromise: (reason: any) => void) {
                  setTimeout(function () {
                    rejectPromise(other);
                  }, 0);
                  throw sentinel;
                },
              };
            }

            testPromiseResolution(xFactory, function (promise, done) {
              promise.then(null, function (reason) {
                expect(reason).toStrictEqual(sentinel);
                done();
              });
            });
          });
        });
      });
    }
  );

  describe('2.3.3.4: If `then` is not a function, fulfill promise with `x`', function () {
    function testFulfillViaNonFunction(then: any, stringRepresentation: string) {
      var x: {then: any};

      beforeEach(function () {
        x = {then: then};
      });

      function xFactory() {
        return x;
      }

      describe('`then` is ' + stringRepresentation, function () {
        testPromiseResolution(xFactory, function (promise, done) {
          promise.then(function (value) {
            expect(value).toStrictEqual(x);
            done();
          });
        });
      });
    }

    testFulfillViaNonFunction(5, '`5`');
    testFulfillViaNonFunction({}, 'an object');
    testFulfillViaNonFunction([function () {}], 'an array containing a function');
    testFulfillViaNonFunction(/a-b/i, 'a regular expression');
    testFulfillViaNonFunction(Object.create(Function.prototype), 'an object inheriting from `Function.prototype`');
  });
});
