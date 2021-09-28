# Promises/A+

一个开源且通用的 [JavaScript Promise](https://promisesaplus.com/) 标准,由开发者制定，供开发者参考。

`promise` 相当于异步操作的最终结果. 与之进行交互的方式主要是 `then` 方法，该方法注册了一个回调函数，接收 `promise` 成功的返回值或当前 `promise` 失败的原因。

本规范详细列出了 `then` 方法的执行过程, 因为此规范是十分稳定的，所以所有遵循 `Promises/A+` 规范实现的 `promise` 均可以依照本标准作为参照。尽管 `Promise/A+` 组织有可能会修订本规范，但主要是为了处理一些新发现的极端问题，且这些改动都是微小且向下兼容的。如果我们要进行大规模不兼容的更新，我们一定会在事先进行谨慎考虑、探讨和测试。

历来，此规范实际上是把之前 `Promise/A` 规范中的建议明确成为了行为标准：我们一方面扩展了原有规范约定俗成的行为，一方面删减了原规范的一些特例情况和有问题的部分。

最后，核心的 `Promises/A+` 规范不设计如何创建、解决和拒绝 `promise`，而是专注于提供一个通用的 `then` 方法。上述对于 `promises` 的操作方法将来在其他规范中可能会提及。

## 1. 专业术语

- 1.1 `"promise"` 是具有 `then` 方法的对象或函数，其行为符合此规范。
- 1.2 `"thenable"` 是定义 `then` 方法的对象或函数。
- 1.3 `"value"` 是任意合法的 `Javascript` 值，（包括：`undefined`, `thenable`, `promise`）。
- 1.4 `"exception"` 是使用 `throw` 语句抛出的一个值。
- 1.5 `"reason"` 是一个值，用来表明 `promise` 被拒绝的原因。

## 2. 要求

### 2.1 Promise 状态

一个 `promise` 必须处于三种状态（state）之一： 等待（pending）， 成功（fulfilled），拒绝（rejected）

- 2.1.1 当 `promise` 处于 `pending` 时：
  - 2.1.1.1 `promise` 可以转为 `fulfilled` 或 `rejected` 状态
  - 2.1.1.2 当 `promise` 处于成功时：
    - 2.1.1.1.1 `promise` 不能切换成别的状态
    - 2.1.1.1.2 必须拥有一个不可变的返回值
  - 2.1.1.3 当 `promise` 处于拒绝时：
    - 2.1.1.3.1 `promise` 不能切换成别的状态
    - 2.1.1.3.2 必须拥有一个不可变的返回原因

这里的不可变指的是恒等（即可用 === 判断相等），而不是意味着更深层次的不可变（意思是说内存地址不可变，里面的属性可变）。

### 2.2 必须有⼀个 `then` ⽅法

`promise` 必须提供一个 `then` 方法去访问当前或者最终成功的结果或者失败的原因

`Promise` 的 `then` 方法接收两个参数：

```js
promise.then(onFulfilled, onRejected);
```

- 2.2.1 `onFulfilled` 和 `onRejected` 都为可选的参数时:
  - 2.2.1.1 如果 `onFulfilled` 如果不是函数，它将会被忽略。
  - 2.2.1.2 如果 `onRejected` 如果不是函数，它将会被忽略。
- 2.2.2 如果 `onFulfilled` 是一个函数时:
  - 2.2.2.1 此函数在 `promise` 成功后（fulfilled）被调用,并把 `promise` 的成功值（value）作为它的第一个参数
  - 2.2.2.2 在 `promise` 成功（fulfilled）之前一定不能提前被调用
  - 2.2.2.3 该函数只执行一次
- 2.2.3 如果 onRejected 是一个函数时,
  - 2.2.3.1 此函数在 `promise` 失败（rejected）时被调用, 并且把 `promise` 的失败原因（reason）当成第一个参数
  - 2.2.3.2 在 `promise` 失败（rejected）之前一定不能提前被调用
  - 2.2.3.3 该函数只执行一次
- 2.2.4 `onFulfilled` 和 `onRejected` 只有在[执行上下文](https://es5.github.io/#x10.3)堆栈(execution context stack)仅包含平台代码时才可被调用 [3.1]
- 2.2.5 `onFulfilled` 和 `onRejected` 必须被作为函数调用 (尽管没有 `this` 值). [3.2]
- 2.2.6 then 方法可以被同一个 `promise` 多次调用
  - 2.2.6.1 当 `promise` 成功时, 所有 `onFulfilled` 回调函数需按照最原始的 `then` 顺序来调用
  - 2.2.6.2 当 `promise` 失败时，所有各自的 `onRejected` 回调都必须按照其对 `then` 的原始调用顺序执行
- 2.2.7 then 必须返回一个 `promise` [3.3]. `promise2 = promise1.then(onFulfilled, onRejected);`
  - 2.2.7.1 如果 `onFulfilled` 或者 `onRejected` 返回一个值 `x` , 则运行下面的 `Promise` 解决过程：`[[Resolve]](promise2, x)`.
  - 2.2.7.2 如果 `onFulfilled` 或 `onRejected` 抛出一个异常 `e`, `promise2` 必须被拒绝（rejected）并把 `e` 当作失败的原因（reason）
  - 2.2.7.3 如果 `onFulfilled` 不是一个函数且 `promise1` 成功执行（fulfilled）,则 `promise2` 将会接收 `promise1` 传递下来的成功（fulfilled）的值
  - 2.2.7.4 如果 `onRejected` 不是一个函数，并且 `promise1` 已经失败了（rejected）,则必须以同 `promise1` 相同的失败（rejected）的原因（reason）传递到 `promise2`

### 2.3 Promise 的解决过程

`Promise` 处理过程是一个抽象的操作, 其需输入一个 `promise` 和一个值 `x`, 我们表示为 `[[Resolve]](promise, x)`. 如果 x 是一个 `thenable` 对象, 处理程序将以这个 `promise` 对象的 `then` 返回值继续传递下去,如果 `x` 是一个普通值, 则以成功的回调传递给下去。

这种 `thenable` 的特性使得 `Promise` 的实现更具有通用性：只要其暴露出一个遵循 `Promise/A+` 协议的 `then` 方法即可；这同时也使遵循 `Promise/A+` 规范的代码可以与那些不太规范但可用的实现能良好兼容。

运行 `[[Resolve]](promise, x)`, 需要遵循以下几个步骤:

- 2.3.1 如果 `promise` 和 `x` 是相同的, 则以 `promise` 的 `TypeError` 报错.
- 2.3.2 如果 `x` 是一个 `promise` 对象, 则使 `promise` 接受 `x` 的状态 `[3.4]`:
  - 2.3.2.1 如果 `x` 处于等待状态， `promise` 需保持为等待态直至 `x` 被执行或拒绝
  - 2.3.2.2 如果 `x` 处于执行态，用相同的值执行 `promise`
  - 2.3.2.3 如果 `x` 处于拒绝态，用相同的据因拒绝 `promise`
- 2.3.3 `x` 是 `object` 或 `function`

  - 2.3.3.1 把 `x.then` 赋值给 `then` 方法 `[3.5]`
  - 2.3.3.2 如果在获取属性 `x.then` 的过程中导致抛出异常 `e`，则以 `e` 作为拒绝原因拒绝 `promise`
  - 2.3.3.3 如果 `then` 是函数，则将 `x` 作为函数的作用域的 `this` 被绑定并调用。传递两个回调函数作为参数，第一个参数叫做 `resolvePromise`，第二个参数叫做 `rejectPromise`:
    - 2.3.3.3.1 如果 `resolvePromise` 以值 `y` 为参数被调用，则运行 `[[Resolve]](promise, y)`
    - 2.3.3.3.2 如果 `rejectPromise` 以据因 `r` 为参数被调用，则以据因 `r` 拒绝 `promise`
    - 2.3.3.3.3 如果 `resolvePromise` 和 `rejectPromise` 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
    - 2.3.3.3.4 如果调用 `then` 方法抛出了异常 `e`：
      - 2.3.3.3.4.1 如果 `resolvePromise` 或 `rejectPromise` 已经被调用，则忽略它
      - 2.3.3.3.4.2 否则以 `e` 为拒绝 `promise` 的原因

- 2.3.4 如果 `x` 不是对象或者函数，以 `x` 为参数将 `promise` 变成已完成状态

## 3. 注意事项

- 3.1 这里的“平台代码”是指引擎、环境和 promise 实现代码。在实践中，这一要求确保 `onFulfilled` 和 `onRejected` 在事件循环调用之后异步执行，在调用 `then` 的事件循环之后，并使用新的堆栈。这可以通过“宏任务”机制（例如 `setTimeout` 或 `setImmediate`）或“微任务”机制（例如 `MutationObserver` 或 `process.nextTick`）来实现。 由于 `promise` 实现被认为是平台代码，它本身可能包含一个任务调度队列或`"trampoline"`，在其中调用处理程序。
- 3.2 在严格模式下，`this` 在它们内部是 `undefined`； 在非严格模式下，`this` 将是全局对象。
- 3.3 实现可能允许 `promise2 === promise1`，前提是实现满足所有要求。每个实现都应该记录它是否可以产生 `promise2 === promise1` 以及在什么条件下生成 `promise2`。
- 3.4 一般来说，只有当 `x` 来自当前实现时，才会知道它是一个真正的 `promise`。该子句允许使用特定于实现的方法来采用已知符合 `promise` 的状态。
- 3.5 这个过程首先存储对 `x.then` 的引用，然后测试该引用，然后调用该引用，避免了对 `x.then` 属性的多次访问。这些预防措施对于确保访问器属性的一致性非常重要，因为访问器属性的值可能在检索之间发生变化。
- 3.6 实现不应对 `thenable` 链的深度设置任意限制，并假设超出该任意限制递归将是无限的。 只有死的循环才会导致 `TypeError`；如果遇到无限的不同 `thenable` 链，则永远递归是正确的行为。
