# Promises/ECMA6+

[Promise](https://tc39.es/ecma262/#sec-promise-objects) 是一个对象，用作延迟（可能是异步）计算的最终结果的占位符。

任何 `Promise` 都处于以下三种互斥状态之一：完成、拒绝和等待：

- 如果 `Promise` p 已完成状态，那么它会调用 `p.then(f, r)` 的 `f` 函数
- 如果 `Promise` p 已拒绝状态，那么它会调用 `p.then(f, r)` 的 `r` 函数
- 如果 `Promise` 既未完成也未拒绝，则它处于待定状态。

一个 `Promise` 如果不是待定的，即被完成或被拒绝，则被称为已解决。

如果一个 `Promise` 已经被解决或者已经被锁定以匹配另一个 `Promise` 的状态，那么这个 `Promise` 就被解决了。试图解决或拒绝已解决的 `Promise` 没有任何效果。如果一个 `Promise` 没有得到解决，那它就没有得到解决。未解决的 `Promise` 总是处于等待的状态。已解决的 `Promise` 可能正在等待、完成或被拒绝。

## Promise 抽象操作

### NewPromiseCapability(C)

抽象操作 `NewPromiseCapability` 接受参数 `C`。它试图以内置 `Promise` 构造函数的方式使用 `C` 作为构造函数来创建一个 `promise` 并提取其解析和拒绝函数。 `promise` 加上 `resolve` 和 `reject` 函数用于初始化新的 `PromiseCapability Record`。 它在调用时执行以下步骤：

1. 如果 `isConstructor(C)` 为 `false`，则抛出 `TypeError` 异常
2. 假定 `C` 是一个构造函数，它支持 `Promise` 构造函数的参数约定
3. 让 `promiseCapability` 成为 `PromiseCapability Record { [[Promise]]: undefined, [[Resolve]]: undefined, [[Reject]]: undefined }`
4. 让 executorClosure 成为一个带有参数（resolve、reject）的新抽象闭包，它捕获 promiseCapability 并在调用时执行以下步骤：
   - 如果 `promiseCapability.[[Resolve]]` 不是 `undefined`，则抛出 `TypeError` 异常
   - 如果 `promiseCapability.[[Reject]]` 不是 `undefined`，则抛出 `TypeError` 异常
   - 设置 `promiseCapability.[[Resolve]]` 为 `resolve`
   - 设置 `promiseCapability.[[Reject]]` 为 `reject`
   - 返回 `undefined`
5. 让 `executor` 由 `CreateBuiltinFunction(executorClosure, 2, "", « »)` 创建
6. 让 `promise` 由 `Construct(C, «executor»)` 构建
7. 如果 `IsCallable(promiseCapability.[[Resolve]])` 为 `false`，则抛出 `TypeError` 异常。
8. 如果 `IsCallable(promiseCapability.[[Reject]])` 为 `false`，则抛出 `TypeError` 异常。
9. 将 `promiseCapability.[[Promise]]` 设置为 `promise`
10. 返回 `promiseCapability`

### PromiseCapability Records

`PromiseCapability Record` 是一个 `Record` 值，用于封装 `Promise` 或类似 `promise` 的对象以及能够完成或拒绝该 `promise` 的函数。 `PromiseCapability Record` 由 `NewPromiseCapability` 抽象操作产生。

| 字段名        | 字段值       | 描述                            |
| ------------- | ------------ | ------------------------------- |
| `[[Promise]]` | 一个对象     | 可作为 `Promise` 使用的对象     |
| `[[Resolve]]` | 一个对象方法 | 用来完成给定 `Promise` 的函数。 |
| `[[Reject]]`  | 一个对象方法 | 用来拒绝给定 `Promise` 的函数。 |

#### IfAbruptRejectPromise(value, capability)

`IfAbruptRejectPromise` 是使用 `PromiseCapability Record` 的一系列算法步骤的简写。 形式的算法步骤：

1. 如果 value 是一个异常结束，那么调用 `capability.[[Reject]].call(undefined, value)`，并返回 `capability.[[Promise]]`
2. 否则，如果 `value` 是完成 `Record`，则将 `value` 设置为 `value` 的值。

### PromiseReaction Records

`PromiseReaction` 是一个 `Record` 值，用于存储关于一个承诺在被给定值完成或拒绝时应该如何反应的信息。`promise` 记录由 `PerformPromiseThen` 抽象操作创建，并由 `NewPromiseReactionJob` 返回的抽象闭包使用。

### CreateResolvingFunctions(promise)

抽象操作 `CreateResolvingFunctions` 接受参数 `promise`。它在被调用时执行以下步骤：

1. 让 `alreadyResolved` 为 `Record{[[Value]]: false }`
2. 让 `stepsResolve` 是 `Promise Resolve Functions` 中定义的算法步骤
3. 让 `lengthResolve` 是 `Promise Resolve Functions` 中函数定义的非可选参数的数量
4. 让 `resolve` 由 `CreateBuiltinFunction(stepsResolve, lengthResolve, "", «[[Promise]], [[AlreadyResolved]]»)` 创建
5. 设置 `resolve.[[Promise]]` 为 `promise`
6. 设置 `resolve.[[AlreadyResolved]]` 为 `AlreadyResolved`
7. 让 `stepsReject` 是 `Promise Reject Functions` 中定义的算法步骤
8. 让 `lengthReject` 是 `Promise Reject Functions` 中函数定义的非可选参数的数量
9. 让 `reject` 由 `CreateBuiltinFunction(stepsReject, lengthReject, "", «[[Promise]], [[AlreadyResolved]]»)` 创建
10. 设置 `reject.[[Promise]]` 为 `promise`
11. 设置 `reject.[[AlreadyResolved]]` 为 `AlreadyResolved`
12. 返回 `Record{[[Resolve]]: Resolve，[[Reject]]: Reject}`

#### Promise Reject Functions

拒绝 `Promise` 函数是一个匿名的内置函数，它有 `[[promise]]` 和 `[[AlreadyResolved]]` 内部变量。

当使用参数 `reason` 调用 `promise` 拒绝函数时，将执行以下步骤：

1. 创建 `F` 为一个[活动函数对象](https://tc39.es/ecma262/#active-function-object)
2. 断言: `F` 有一个 `[[Promise]]` 内部槽，它的值是一个 `Object`
3. 让 `promise` 为 `F.[[Promise]]`
4. 让 `alreadyResolved` 为 `F.[[alreadyResolved]]`
5. 如果 `alreadyResolved` 的值是 `true`，返回 `undefined`
6. 设置 `alreadyResolved` 的值为 `true`
7. 返回 `RejectPromise(promise, reason)`

`Reject Function` 参数长度为 1。

#### Promise Resolve Functions

完成 `Promise` 函数是一个匿名的内置函数，它有 `[[promise]]` 和 `[[AlreadyResolved]]` 内部变量。

当使用参数 `resolution` 调用 `promise` 完成函数时，将执行以下步骤：

1. 创建 `F` 为一个[活动函数对象](https://tc39.es/ecma262/#active-function-object)
2. 断言: `F` 有一个 `[[Promise]]` 内部槽，它的值是一个 `Object`
3. 让 `promise` 为 `F.[[Promise]]`
4. 让 `alreadyResolved` 为 `F.[[alreadyResolved]]`
5. 如果 `alreadyResolved` 的值是 `true`，返回 `undefined`
6. 设置 `alreadyResolved` 的值为 `true`
7. 如果 `resolution` 和 `promise` 相等，创建新的 `TypeError` 对象为 `selfResolutionError`，返回 `RejectPromise(promise, selfResolutionError)`
8. 如果 `resolution` 不是一个对象，返回 `FulfillPromise(promise, resolution)`
9. 尝试 `resolution.then`, 赋值给 `then`
10. 如果获取 `then` 异常结束，返回 `RejectPromise(promise, then.[[Value]])`
11. 创建变量 `thenAction`, 并赋值 `then.[[Value]]`
12. 如果 `isCallable(thenAction)` 是 `false`, 返回 `FulfillPromise(promise, resolution)`
13. 返回 `undefined`

`Resolve Function` 参数长度为 1。

### FulfillPromise(promise, value)

抽象操作 `FulfillPromise` 接受参数 `promise` 和 `value`。 它在调用时执行以下步骤：

1. 判断 `promise.[[PromiseState]]` 的值是 `pending`。
2. 创建变量 `reactions` 并赋值 `promise.[[PromiseFulfillReactions]]`
3. 设置 `promise.[[PromiseResult]]` 值为 `value`。
4. 设置 `promise.[[PromiseFulfillReactions]]` 值为 `undefined`
5. 设置 `promise.[[PromiseRejectReactions]]` 值为 `undefined`
6. 设置 `promise.[[PromiseState]]` 值为 `rejected`
7. 返回 `TriggerPromiseReactions(reactions, value)`

### RejectPromise(promise, reason)

抽象操作 `RejectPromise` 接受参数 `promise` 和 `reason`。 它在调用时执行以下步骤：

1. 判断 `promise.[[PromiseState]]` 的值是 `pending`。
2. 创建变量 `reactions` 并赋值 `promise.[[PromiseRejectReactions]]`
3. 设置 `promise.[[PromiseResult]]` 值为 `reason`。
4. 设置 `promise.[[PromiseFulfillReactions]]` 值为 `undefined`
5. 设置 `promise.[[PromiseRejectReactions]]` 值为 `undefined`
6. 设置 `promise.[[PromiseState]]` 值为 `rejected`
7. 如果 `promise.[[PromiseIsHandled]]` 为 `false`, 执行 `HostPromiseRejectionTracker(promise, "reject")`
8. 返回 `TriggerPromiseReactions(reactions, reason)`

### TriggerPromiseReactions(reactions, argument)

抽象操作 `TriggerPromiseReactions` 接受参数反应（PromiseReaction Records）和参数。它为`reactions`中的每条记录排入一个新任务。每个这样的任务处理 `PromiseReaction Record` 的 `[[Type]]` 和 `[[Handler]]`，如果 `[[Handler]]` 不为 `null`，则通过给定的参数调用它。 如果 `[[Handler]]` 为 `null`，则行为由 `[[Type]]` 决定。

### HostPromiseRejectionTracker(promise, operation)

抽象操作 `HostPromiseRejectionTracker` 接受参数 promise（Promise）和 operation（“reject”或“handle”）。它允许宿主环境跟踪 `promise rejection`。

`HostPromiseRejectionTracker` 的实现必须符合以下要求：

- 它必须正常完成（即不返回异常结束）

`HostPromiseRejectionTracker` 的默认实现是返回 `NormalCompletion(empty)`

> 注意 1：`HostPromiseRejectionTracker` 在两种情况下被调用：
>
> - 当 `promise` 在没有任何处理程序的情况下被拒绝时，调用它时将其操作参数设置为“reject”。
> - 当一个处理程序第一次被添加到一个被拒绝的 `promise` 时，它会被调用，其操作参数设置为“handle”。
>   `HostPromiseRejectionTracker` 的典型实现可能会尝试通知开发人员未处理的拒绝，同时如果这些先前的通知后来被附加的新处理程序无效，也会小心地通知他们。

> 注意 2：如果 `operation` 为"handle"，则实现不应以干扰垃圾收集的方式持有 `promise` 的引用。如果操作是“reject”，则实现可能会持有 `promise` 的引用，因为预计拒绝将很少，而且不会发生在热代码路径上。

### isPromise(x)

抽象操作 `isPromise` 接受参数 `x`。 它检查对象上的 `Promise` 类型。它在调用时执行以下步骤：

1. 如果 `x` 不是一个对象，返回 `false`
2. 如果 `x` 没有 `[[PromiseState]]` 内部私有属性，则返回 `false`
3. 其他返回 `true`

## Promise Jobs

### NewPromiseReactionJob(reaction, argument)

抽象操作 `NewPromiseReactionJob` 接受参数 reaction(一个 PromiseReaction Record)和 argument。它返回一个新的 `Job Abstract Closure`，该 `Closure` 将适当的处理程序应用到传入的值，并使用处理程序的返回值来解析或拒绝与该处理程序关联的派生`Promise`。它在被调用时执行以下步骤：

1. 1
   1. 让 `promiseCapability` 成为 `reaction.[[Capability]]`
   2. 让 `type` 成为 `reaction.[[Type]]`
   3. 让 `handler` 成为 `reaction.[[Type]]`
   4. 如果 `handler` 为空，则
      1. 如果 `type` 为 `Fulfill`，让 `handlerResult` 为 `NormalCompletion(argument)`
      2. 否则
         1. 断言: `type` 为 `Reject`
         2. 让 `handlerResult` 为 `ThrowCompletion(argument)`
   5. 否则，让 `handlerResult` 为 `HostCallJobCallback(handler, undefined, «argument»)`
   6. 如果 promiseCapability 是 `undefined`，则
      1. 断言：`handlerResult` 不是异常结束
      2. 返回 `NormalCompletion(empty)`
   7. 断言：`promiseCapability` 是一个 `PromiseCapability Record`
   8. 如果 `handlerResult` 是一个异常结束，那么让 `status` 为 `resolvingFunctions.[[Reject]].call(undefined, handlerResult.[[Value]])`
   9. 否则，让 `status` 为 `resolvingFunctions.[[Resolve]].call(undefined, handlerResult.[[Value]])`
   10. 返回 `Completion(status)`
2. 让 `handlerRealm` 为 `null`
3. 如果 `reaction.[[Handler]]` 不为空，则
   1. 让 `getHandlerRealmResult` 为 `GetFunctionRealm (reaction.[[Handler]].[[Callback]])`
   2. 让 `thenCallResult` 为 `HostCallJobCallback(then, thenable, «resolutionFunctions.[[Resolve]], resolutionFunctions.[[Reject]]»)`
   3. 否则，将 `handlerRealm` 设置为当前 `Realm Record`
   4. 注意: `handlerRealm` 永远不会为 `null`，除非 `handler` 是 `undefined`。当 `handler` 是一个被撤销的代理且没有运行 `ECMAScript` 代码时，`handlerRealm` 将用于创建错误对象。
4. 返回 `Record { [[Job]]: job, [[Realm]]: handlerRealm }`

### NewPromiseResolveThenableJob(promiseToResolve, thenable, then)

抽象操作 `NewPromiseResolveThenableJob` 接受参数 `promiseToResolve`、`thenable` 和 `then`。它在调用时执行以下步骤：

1. 让 `job` 成为一个新的没有参数的 `Job` 抽象闭包，捕获 `promiseToResolve`，`thenable`，然后在被调用时执行以下步骤：
   1. 让 `resolveFunctions` 为 `CreateResolvingFunctions(promiseToResolve)`
   2. 让 `thenCallResult` 为 `HostCallJobCallback(then, thenable, «resolutionFunctions.[[Resolve]],resolutionFunctions.[[Reject]]»)`
   3. 如果 `thenCallResult` 是一个异常结束，那么
      1. 让 `status` 为 `resolvingFunctions.[[Reject]].call(undefined, thenCallResult.[[Value]])`
      2. 返回 `Completion(status)`
   4. 返回 `Completion(thenCallResult)`
2. 让 `getThenRealmResult` 为 `GetFunctionRealm(then.[[Callback]])`
3. 如果 `getThenRealmResult` 是正常完成，则让 `thenRealm` 为 `getThenRealmResult.[[Value]]`
4. 否则，让 `thenRealm` 成为当前的 `Realm Record`
5. 注意：`thenRealm` 永远不会为空。当 `then.[[Callback]]` 是一个被撤销的代理并且没有代码运行时，则使用 `thenRealm` 创建错误对象。
6. 返回 `Record { [[Job]]: job, [[Realm]]: thenRealm }`

> 注意： 这个 `Job` 使用提供的 `thenable` 和它的 `then` 方法来解析给定的 `Promise`。这个过程必须以 `Job` 的形式进行，以确保 `then` 方法的求值发生在周围任何代码的求值完成之后。

## Promise 构造函数

Promise 构造函数：

- 构造函数是 `Promise`
- 是全局对象的 `Promise` 属性的初始值
- 当作为构造函数调用时，创建并初始化一个新的 `Promise`。
- 不打算作为函数调用，并将在以这种方式调用时抛出异常。
- 可以用作类定义的 `extends` 子句中的值。 打算继承指定 `Promise` 行为的子类构造函数必须包含对 `Promise` 构造函数的超级调用，以使用支持 `Promise` 和 `Promise.prototype` 内置方法所需的内部状态来创建和初始化子类实例。

### Promise(executor)

当 `Promise` 函数与参数 `executor` 一起被调用时，将执行以下步骤：

1. 如果 `NewTarget` 是 `undefined`，则抛出 `TypeError` 异常。
2. 如果 `isCallable(executor)` 为 `false`，则抛出 `TypeError` 异常。
3. 创建 `Constructor`, 构建 `Promise.prototype`, 初始化 `[[PromiseState]], [[PromiseResult]], [[PromiseFulfillReactions]], [[PromiseRejectReactions]], [[PromiseIsHandled]]`
4. 将 `promise.[[PromiseState]]` 设置为 `pending`。
5. 将 `promise.[[PromiseFulfillReactions]]` 设置为空数组。
6. 将 `promise.[[PromiseRejectReactions]]` 设置为空数组。
7. 将 `promise.[[PromiseIsHandled]]` 设置为 `false`。
8. 让 `resolvingFunctions` 为 `CreateResolvingFunctions(promise)`。
9. 完成调用 `executor.call(undefined, resolvingFunctions.[[Resolve]], resolvingFunctions.[[Reject]])`
10. 异常结束调用 `resolvingFunctions.[[Reject]].call(undefined, Value)`
11. 返回 `promise`

> 注意：`executor` 参数必须是一个函数对象。它用于发起和报告本 `Promise` 所代表的可能延迟的行动的完成。调用执行器时带有两个参数: `resolve` 和 `reject`。执行器函数可以使用这些函数来报告延迟计算的最终完成或失败。从执行器函数返回并不意味着延迟操作已经完成，而只是意味着最终执行延迟操作的请求已经被接受。
> 传递给执行器函数的 `resolve` 函数只接受一个参数。执行程序代码最终可能调用 `resolve` 函数，以表明它希望完成相关的 `Promise`。传递给 `resolve` 函数的参数表示延迟操作的最终值，可以是实际的实现值，也可以是在实现后提供该值的另一个 `Promise`。
> 传递给执行函数的 `reject` 函数只接受一个参数。执行器代码最终可能调用 `reject` 函数，以表明相关的 `Promise` 被拒绝，并且永远不会被实现。传递给 `reject` 函数的参数被用作 `promise` 的拒绝值。通常它是一个 `Error` 对象。
> 由 `Promise` 构造函数传递给执行器函数的 `resolve` 和 `reject` 函数能够实际完成和拒绝关联的 `Promise`。子类可能具有不同的构造函数行为，它们传递自定义值以进行完成和拒绝。

## Promise 构造函数的属性

Promise 构造函数：

- 有一个 `[[Prototype]]` 内部插槽，其值为 `Function.prototype`。
- 具有以下属性:

### Promise.all(iterable)

`all` 函数返回一个新的 `promise` ，该 `promise` 由已传递的 `promise` 的完成值数组来表示已完成，或者根据第一个传递的 `promise` 被拒绝的原因来表示已拒绝。在运行该算法时，它会解析传递的可迭代对象的所有元素到 `promise` 。

1. 让 `C` 为 `this` 值
2. 让 `promiseCapability` 是 `NewPromiseCapability(C)`
3. 让 `promiseResolve` 成为 `GetPromiseResolve(C)`
4. `IfAbruptRejectPromise(promiseResolve, promiseCapability)`
5. 让 `iteratorRecord` 为 `GetIterator(iterable)`
6. `IfAbruptRejectPromise(iteratorRecord promiseCapability)`
7. 让 `result` 为 `PerformPromiseAll(iteratorRecord, C, promiseCapability, promiseResolve)`
8. 如果 `result` 是异常结束，然后
   1. 如果 `iteratorRecord.[[Done]]` 为 `false`，将 `result` 设置为 `IteratorClose(iteratorRecord, result)`
   2. `IfAbruptRejectPromise(result, promiseCapability)`
9. 返回 `Completion(result)`

`Promise.all` 参数长度为 1。

#### GetPromiseResolve(promiseConstructor)

抽象操作 `GetPromiseResolve` 接受参数 `promiseConstructor`（构造函数）。 它在调用时执行以下步骤：

1. 让 `promiseResolve` 为 `Get(promiseConstructor, "resolve")`
2. 如果 `IsCallable(promiseResolve)` 为 `false`，则抛出 `TypeError` 异常
3. 返回 `promiseResolve`

#### PerformPromiseAll(iteratorRecord, constructor, resultCapability, promiseResolve)

1. 让 `values` 成为一个新的空数组
2. 让 `remainingElementsCount` 为 `Record { [[Value]]: 1 }`
3. 设 `index` 为 0
4. 重复：
   1. 让 `next` 为 `IteratorStep(iteratorRecord)`
   2. 如果 `next` 是异常结束，则设置 `iteratorRecord.[[Done]]` 为 `true`
   3. 如果 `next` 为 `false`，则
   4. `ReturnIfAbrupt(next)`
      1. 设置 `iteratorRecord.[[Done]]` 为 `true`
      2. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] - 1`
      3. 如果 `remainingElementsCount.[[Value]]` 为 0
         1. 让 `valuesArray` 为 `CreateArrayFromList(values)`
         2. 执行 `resultCapability.[[Resolve]].call(undefined, valuesArray)`
      4. 返回 `resultCapability.[[Promise]]`
   5. 让 `nextValue` 为 `IteratorValue(next)`
   6. 如果 `nextValue` 是异常结束，则设置 `iteratorRecord.[[Done]]` 为 `true`
   7. `ReturnIfAbrupt(nextValue)`
   8. `values` 添加 `undefined`
   9. 让 `nextPromise` 为 `promiseResolve.call(constructor, nextValue)`
   10. 让 `stepsFulfilled` 为 `Promise` 中定义的算法步骤 `Promise.all Resolve Element Functions`
   11. 让 `lengthFulfilled` 为 `Promise` 中函数定义的非可选参数的个数 `Promise.all Resolve Element Functions`
   12. 让 `onFulfilled` 为 `CreateBuiltinFunction(stepsFulfilled, lengthFulfilled, "", «[[AlreadyCalled]], [[Index]], [[Values]], [[Capability]], [[RemainingElements]]»)`
   13. 设置 `onFulfilled.[[AlreadyCalled]]` 为 `false`
   14. 设置 `onFulfilled.[[Index]]` 为 `index`
   15. 设置 `onFulfilled.[[Values]]` 为 `values`
   16. 设置 `onFulfilled.[[Capability]]` 为 `resultCapability`
   17. 设置 `onFulfilled.[[RemainingElements]]` 为 `remainingElementsCount`
   18. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] + 1`
   19. 执行 `nextPromise.prototype.then(onFulfilled, resultCapability.[[Reject]])`
   20. 设置 `index` 为 `index + 1`

#### Promise.all Resolve Element Functions

`Promise.all Resolve Element Functions` 是一个匿名内置函数，用于解析特定的 `Promise.allSettled` 元素。 每个 `Promise.all Resolve Element Functions` 都有 `[[Index]]`、`[[Values]]`、`[[Capability]]`、`[[RemainingElements]]` 和 `[[AlreadyCalled]]` 内部变量。

当使用参数 `x` 调用 `Promise.all Resolve Element Functions` 时，执行以下步骤：

1. 创建 `F` 为一个[活动函数对象](https://tc39.es/ecma262/#active-function-object)
2. 如果 `F.[[AlreadyCalled]]` 为 `true`，则返回 `undefined`
3. 设置 `F.[[AlreadyCalled]]` 的值为 `true`
4. 设置 `index` 的值为 `F.[[Index]]`
5. 设置 `values` 的值为 `F.[[Values]]`
6. 设置 `promiseCapability` 的值为 `F.[[Capability]]`
7. 设置 `remainingElementsCount` 的值为 `F.[[RemainingElements]]`
8. 设置 `Values[index]` 的值为 `x`
9. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] - 1`
10. 如果 `remainingElementsCount.[[Value]]` 为 0
    1. 让 `valuesArray` 为 `CreateArrayFromList(values)`
    2. 执行 `resultCapability.[[Resolve]].call(undefined, valuesArray)`
11. 返回 `undefined`

`Promise.all Resolve Element Functions` 参数长度为 1。

### Promise.allSettled(iterable)

`allSettled` 函数返回一个使用 `promise` 状态快照数组完成的 `promise`，但只有在所有原始 `promise` 都已解决后，即变为已完成或被拒绝。 它在运行此算法时将传递的可迭代对象的所有元素解析为 `promise`。

1. 让 `C` 为 `this` 值
2. 让 `promiseCapability` 是 `NewPromiseCapability(C)`
3. 让 `promiseResolve` 成为 `GetPromiseResolve(C)`
4. `IfAbruptRejectPromise(promiseResolve, promiseCapability)`
5. 让 `iteratorRecord` 为 `GetIterator(iterable)`
6. `IfAbruptRejectPromise(iteratorRecord promiseCapability)`
7. 让 `result` 为 `PerformPromiseRace(iteratorRecord, C, promiseCapability, promiseResolve)`
8. 如果 `result` 是异常结束，然后
   1. 如果 `iteratorRecord.[[Done]]` 为 `false`，将 `result` 设置为 `IteratorClose(iteratorRecord, result)`
   2. `IfAbruptRejectPromise(result, promiseCapability)`
9. 返回 `Completion(result)`

`Promise.allSettled` 参数长度为 1。

#### PerformPromiseAllSettled(iteratorRecord, constructor, resultCapability, promiseResolve)

抽象操作 `PerformPromiseAllSettled` 接受参数 `iteratorRecord`、`constructor`（构造函数）、`resultCapability`（PromiseCapability Record）和 `promiseResolve`（函数对象）。 它在调用时执行以下步骤：

1. 让 `values` 成为一个新的空数组
2. 让 `remainingElementsCount` 为 `Record { [[Value]]: 1 }`
3. 设 `index` 为 0
4. 重复：
   1. 让 `next` 为 `IteratorStep(iteratorRecord)`
   2. 如果 `next` 是异常结束，则设置 `iteratorRecord.[[Done]]` 为 `true`
   3. `ReturnIfAbrupt(next)`
   4. 如果 `next` 为 `false`，则
      1. 设置 `iteratorRecord.[[Done]]` 为 `true`
      2. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] - 1`
      3. 如果 `remainingElementsCount.[[Value]]` 为 0
         1. 让 `valuesArray` 为 `CreateArrayFromList(values)`
         2. 执行 `resultCapability.[[Resolve]].call(undefined, valuesArray)`
      4. 返回 `resultCapability.[[Promise]]`
   5. 让 `nextValue` 为 `IteratorValue(next)`
   6. 如果 `nextValue` 是异常结束，则设置 `iteratorRecord.[[Done]]` 为 `true`
   7. `ReturnIfAbrupt(nextValue)`
   8. `values` 添加 `undefined`
   9. 让 `nextPromise` 为 `promiseResolve.call(constructor, nextValue)`
   10. 让 `stepsFulfilled` 为 `Promise` 中定义的算法步骤 `Promise.allSettled Resolve Element Functions`
   11. 让 `lengthFulfilled` 为 `Promise` 中函数定义的非可选参数的个数 `Promise.allSettled Resolve Element Functions`
   12. 让 `onFulfilled` 为 `CreateBuiltinFunction(stepsFulfilled, lengthFulfilled, "", «[[AlreadyCalled]], [[Index]], [[Values]], [[Capability]], [[RemainingElements]]»)`
   13. 设置 `onFulfilled.[[AlreadyCalled]]` 为 `false`
   14. 设置 `onFulfilled.[[Index]]` 为 `index`
   15. 设置 `onFulfilled.[[Values]]` 为 `values`
   16. 设置 `onFulfilled.[[Capability]]` 为 `resultCapability`
   17. 设置 `onFulfilled.[[RemainingElements]]` 为 `remainingElementsCount`
   18. 让 `stepsRejected` 为 `Promise` 中定义的算法步骤 `Promise.allSettled Reject Element Functions`
   19. 让 `lengthReject` 为 `Promise` 中函数定义的非可选参数的个数 `Promise.allSettled Reject Element Functions`
   20. 让 `onRejected` 为 `CreateBuiltinFunction(stepsRejected, lengthRejected, "", «[[AlreadyCalled]], [[Index]], [[Values]], [[Capability]], [[RemainingElements]]»)`
   21. 设置 `onRejected.[[AlreadyCalled]]` 为 `false`
   22. 设置 `onRejected.[[Index]]` 为 `index`
   23. 设置 `onRejected.[[Values]]` 为 `values`
   24. 设置 `onRejected.[[Capability]]` 为 `resultCapability`
   25. 设置 `onRejected.[[RemainingElements]]` 为 `remainingElementsCount`
   26. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] + 1`
   27. 执行 `nextPromise.prototype.then(onFulfilled, onRejected)`
   28. 设置 `index` 为 `index + 1`

#### Promise.allSettled Resolve Element Functions

`Promise.allSettled Resolve Element Functions` 是一个匿名内置函数，用于解析特定的 `Promise.allSettled` 元素。 每个 `Promise.allSettled Resolve Element Functions` 都有 `[[Index]]`、`[[Values]]`、`[[Capability]]`、`[[RemainingElements]]` 和 `[[AlreadyCalled]]` 内部变量。

当使用参数 `x` 调用 `Promise.allSettled Resolve Element Functions` 时，执行以下步骤：

1. 创建 `F` 为一个[活动函数对象](https://tc39.es/ecma262/#active-function-object)
2. 让 `alreadyResolved` 为 `F.[[alreadyResolved]]`
3. 如果 `F.[[AlreadyCalled]]` 为 `true`，则返回 `undefined`
4. 设置 `F.[[AlreadyCalled]]` 的值为 `true`
5. 设置 `index` 的值为 `F.[[Index]]`
6. 设置 `values` 的值为 `F.[[Values]]`
7. 设置 `promiseCapability` 的值为 `F.[[Capability]]`
8. 设置 `remainingElementsCount` 的值为 `F.[[RemainingElements]]`
9. 让 obj 成为一个普通对象（Object.create(Object.prototype) | {}）
10. 执行 `CreateDataPropertyOrThrow(obj, "status", "fulfilled")`
11. 执行 `CreateDataPropertyOrThrow(obj, "value", x)`
12. 设置 `Values[index]` 的值为 `obj`
13. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] - 1`
14. 如果 `remainingElementsCount.[[Value]]` 为 0
    1. 让 `valuesArray` 为 `CreateArrayFromList(values)`
    2. 执行 `resultCapability.[[Resolve]].call(undefined, valuesArray)`
15. 返回 `undefined`

`Promise.allSettled Resolve Element Functions` 参数长度为 1。

#### Promise.allSettled Reject Element Functions

`Promise.allSettled Reject Element Functions` 是一个匿名内置函数，用于解析特定的 `Promise.allSettled` 元素。 每个 `Promise.allSettled Reject Element Functions` 都有 `[[Index]]`、`[[Values]]`、`[[Capability]]`、`[[RemainingElements]]` 和 `[[AlreadyCalled]]` 内部变量。

当使用参数 `x` 调用 `Promise.allSettled Reject Element Functions` 时，执行以下步骤：

1. 创建 `F` 为一个[活动函数对象](https://tc39.es/ecma262/#active-function-object)
2. 让 `alreadyResolved` 为 `F.[[alreadyResolved]]`
3. 如果 `F.[[AlreadyCalled]]` 为 `true`，则返回 `undefined`
4. 设置 `F.[[AlreadyCalled]]` 的值为 `true`
5. 设置 `index` 的值为 `F.[[Index]]`
6. 设置 `values` 的值为 `F.[[Values]]`
7. 设置 `promiseCapability` 的值为 `F.[[Capability]]`
8. 设置 `remainingElementsCount` 的值为 `F.[[RemainingElements]]`
9. 让 obj 成为一个普通对象（Object.create(Object.prototype) | {}）
10. 执行 `CreateDataPropertyOrThrow(obj, "status", "rejected")`
11. 执行 `CreateDataPropertyOrThrow(obj, "reason", x)`
12. 设置 `Values[index]` 的值为 `obj`
13. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] - 1`
14. 如果 `remainingElementsCount.[[Value]]` 为 0
    1. 让 `valuesArray` 为 `CreateArrayFromList(values)`
    2. 执行 `resultCapability.[[Resolve]].call(undefined, valuesArray)`
15. 返回 `undefined`

`Promise.allSettled Resolve Element Functions` 参数长度为 1。

### Promise.any(iterable)

`any` 函数返回一个 `promise`，该 `promise` 由第一个给定的 `promise` 来表示已完成，或者如果所有给定的 `promise` 都被拒绝，则使用 `AggregateError` 保存拒绝原因来拒绝该 `promise`。在运行该算法时，它会解析传递的可迭代对象的所有元素到 `promise`。

1. 让 `C` 为 `this` 值
2. 让 `promiseCapability` 是 `NewPromiseCapability(C)`
3. 让 `promiseResolve` 成为 `GetPromiseResolve(C)`
4. `IfAbruptRejectPromise(promiseResolve, promiseCapability)`
5. 让 `iteratorRecord` 为 `GetIterator(iterable)`
6. `IfAbruptRejectPromise(iteratorRecord promiseCapability)`
7. 让 `result` 为 `PerformPromiseRace(iteratorRecord, C, promiseCapability, promiseResolve)`
8. 如果 `result` 是异常结束，然后
   1. 如果 `iteratorRecord.[[Done]]` 为 `false`，将 `result` 设置为 `IteratorClose(iteratorRecord, result)`
   2. `IfAbruptRejectPromise(result, promiseCapability)`
9. 返回 `Completion(result)`

`Promise.any` 参数长度为 1。

#### PerformPromiseAny(iteratorRecord, constructor, resultCapability, promiseResolve)

抽象操作 `PerformPromiseAny` 接受参数 `iteratorRecord`、`constructor`（构造函数）、`resultCapability`（PromiseCapability Record）和 `promiseResolve`（函数对象）。 它在调用时执行以下步骤：

1. 让 `errors` 成为一个新的空数组
2. 让 `remainingElementsCount` 为 `Record { [[Value]]: 1 }`
3. 设 `index` 为 0
4. 重复：
   1. 让 `next` 为 `IteratorStep(iteratorRecord)`
   2. 如果 `next` 是异常结束，则设置 `iteratorRecord.[[Done]]` 为 `true`
   3. `ReturnIfAbrupt(next)`
   4. 如果 `next` 为 `false`，则
      1. 设置 `iteratorRecord.[[Done]]` 为 `true`
      2. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] - 1`
      3. 如果 `remainingElementsCount.[[Value]]` 为 0
         1. 让 `error` 是一个新创建的 `AggregateError` 对象
         2. 执行 `DefinePropertyOrThrow(error, "errors", PropertyDescriptor { [[Configurable]]: true, [[Enumerable]]: false, [[Writable]]: true, [[Value]]: CreateArrayFromList(errors) })`
         3. 返回 `ThrowCompletion(error)`
      4. 返回 `resultCapability.[[Promise]]`
   5. 让 `nextValue` 为 `IteratorValue(next)`
   6. 如果 `nextValue` 是异常结束，则设置 `iteratorRecord.[[Done]]` 为 `true`
   7. `ReturnIfAbrupt(nextValue)`
   8. `errors` 添加 `undefined`
   9. 让 `nextPromise` 为 `promiseResolve.call(constructor, nextValue)`
   10. 让 `stepsRejected` 为 `Promise` 中定义的算法步骤 `Promise.any Reject Element Functions`
   11. 让 `lengthReject` 为 `Promise` 中函数定义的非可选参数的个数 `Promise.any Reject Element Functions`
   12. 让 `onRejected` 为 `CreateBuiltinFunction(stepsRejected, lengthRejected, "", «[[AlreadyCalled]], [[Index]], [[Errors]], [[Capability]], [[RemainingElements]]»)`
   13. 设置 `onRejected.[[AlreadyCalled]]` 为 `false`
   14. 设置 `onRejected.[[Index]]` 为 `index`
   15. 设置 `onRejected.[[Errors]]` 为 `errors`
   16. 设置 `onRejected.[[Capability]]` 为 `resultCapability`
   17. 设置 `onRejected.[[RemainingElements]]` 为 `remainingElementsCount`
   18. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] + 1`
   19. 执行 `nextPromise.prototype.then(resultCapability.[[Resolve]], resultCapability.[[Reject]])`
   20. 设置 `index` 为 `index + 1`

#### Promise.any Reject Element Functions

`Promise.any reject element function` 是一个匿名内置函数，用于拒绝特定的 `Promise`。任何元素。每一个承诺。每个 `Promise.any reject element function` 都有 `[[Index]]`、`[[Errors]]`、`[[Capability]]`、`[[RemainingElements]]` 和 `[[AlreadyCalled]]` 内部变量

当使用参数 `x` 调用 `Promise.any reject element function` 时，将执行以下步骤：

1. 创建 `F` 为一个[活动函数对象](https://tc39.es/ecma262/#active-function-object)
2. 如果 `F.[[AlreadyCalled]]` 为 `true`，则返回 `undefined`
3. 设置 `F.[[AlreadyCalled]]` 的值为 `true`
4. 设置 `index` 的值为 `F.[[Index]]`
5. 设置 `errors` 的值为 `F.[[Errors]]`
6. 设置 `promiseCapability` 的值为 `F.[[Capability]]`
7. 设置 `remainingElementsCount` 的值为 `F.[[RemainingElements]]`
8. 设置 `errors[index]` 的值为 `x`
9. 设置 `remainingElementsCount.[[Value]]` 为 `remainingElementsCount.[[Value]] - 1`
10. 如果 `remainingElementsCount.[[Value]]` 为 0
    1. 让 `error` 是一个新创建的 `AggregateError` 对象
    2. 执行 `DefinePropertyOrThrow(error, "errors", PropertyDescriptor { [[Configurable]]: true, [[Enumerable]]: false, [[Writable]]: true, [[Value]]: CreateArrayFromList(errors) })`
    3. 返回 `promiseCapability.[[Reject]].call(undefined, error)`
11. 返回 `undefined`

### Promise.race(iterable)

`race` 函数返回一个新的 `promise`，它的结算方式与第一个通过的 `promise` 的结算方式相同。 它在运行此算法时将传递的可迭代对象的所有元素解析为 `promise`。

1. 让 `C` 为 `this` 值
2. 让 `promiseCapability` 是 `NewPromiseCapability(C)`
3. 让 `promiseResolve` 成为 `GetPromiseResolve(C)`
4. `IfAbruptRejectPromise(promiseResolve promiseCapability)`
5. 让 `iteratorRecord` 为 `GetIterator(iterable)`
6. `IfAbruptRejectPromise(iteratorRecord promiseCapability)`
7. 让 `result` 为 `PerformPromiseRace(iteratorRecord, C, promiseCapability, promiseResolve)`
8. 如果 `result` 是异常结束，然后
   1. 如果 `iteratorRecord.[[Done]]` 为 `false`，将 `result` 设置为 `IteratorClose(iteratorRecord, result)`
   2. `IfAbruptRejectPromise(result, promiseCapability)`
9. 返回 `Completion(result)`

`Promise.race` 参数长度为 1。

#### PerformPromiseRace(iteratorRecord, constructor, resultCapability, promiseResolve)

抽象操作 `PerformPromiseRace` 接受参数 `iteratorRecord`、`constructor`(构造函数)、`resultCapability`(PromiseCapability Record)`和`promiseResolve`(函数对象)。它在被调用时执行以下步骤：

1. 重复：
   1. 让 `next` 为 `IteratorStep(iteratorRecord)`
   2. 如果 `next` 是异常结束，则设置 `iteratorRecord.[[Done]]` 为 `true`
   3. `ReturnIfAbrupt(next)`
   4. 如果 `next` 为 `false`，则
      1. 设置 `iteratorRecord.[[Done]]` 为 `true`
      2. 返回 `resultCapability.[[Promise]]`
   5. 让 `nextValue` 为 `IteratorValue(next)`
   6. 如果 `nextValue` 是异常结束，则设置 `iteratorRecord.[[Done]]` 为 `true`
   7. `ReturnIfAbrupt(nextValue)`
   8. 让 `nextPromise` 为 `promiseResolve.call(constructor, nextValue)`
   9. 执行 `nextPromise.prototype.then(resultCapability.[[Resolve]], resultCapability.[[Reject]])`

### Promise.reject(r)

`reject` 函数返回一个被拒绝的新 `Promise` 和传入的参数。

1. `NewPromiseCapability(Promise)` 创建 `promiseCapability`
2. `promiseCapability.Reject.call(undefined, x)`
3. 返回 `promiseCapability.[[Promise]]`

> 注意：`reject` 函数期望它的 `this` 值是一个支持 `Promise` 构造函数的参数约定的构造函数。

### Promise.resolve(x)

`resolve` 函数要么返回一个用传递的参数解析的新 `Promise`，要么返回参数本身，如果参数是由此构造函数生成的 `Promise`。

它返回一个用 `x` 解析的新 `Promise`。 它在调用时执行以下步骤：

1. `isPromise(x)` 如果为 `true`, 获取 `x` 的 `constructor`, 如果和 `Promise.constructor` 一样，直接返回 `x`
2. `NewPromiseCapability(Promise)` 创建 `promiseCapability`
3. `promiseCapability.Resolve.call(undefined, x)`
4. 返回 `promiseCapability.[[Promise]]`

> 注意：`resolve` 函数期望它的 `this` 值是一个支持 `Promise` 构造函数的参数约定的构造函数。

## Promise.prototype 对象的属性

### Promise.prototype.constructor

`Promise.prototype.constructor` 的初始值为 `Promise`。

### Promise.prototype.catch(onRejected)

当以 `onRejected` 参数调用 `catch` 方法时，将执行以下步骤：

1. 让 `promise` 成为 `this` 值
2. 返回调用 `Promise.prototype.then(undefined, onRejected)`

### Promise.prototype.finally(onFinally)

当以 `onFinally` 参数调用 `finally` 方法时，将采取以下步骤：

1. 让 `promise` 成为 `this` 值
2. 如果 `promise` 不是 `Object`，则抛出 `TypeError` 异常
3. 让 `C` 为 `SpeciesConstructor(promise, Promise)`
4. 断言：`isConstructor(C)` 为 `true`
5. 如果 `isCallable(onFinally)` 为 `false`，则
   - 让 `thenFinally` 为 `onFinally`
   - 让 `catchFinally` 为 `onFinally`
6. 否则
   1. 让 `thenFinallyClosure` 成为一个带有参数（value）的新抽象闭包，它捕获 `onFinally` 和 `C` 并在调用时执行以下步骤：
      1. 让 `result` 为 `onFinally.call(undefined)`
      2. 让 `promise` 为 `PromiseResolve(C, result)`
      3. 让 `returnValue` 成为一个新的抽象闭包，不带参数，它捕获值并在被调用时执行以返回 `value`。
      4. 让 `valueThunk` 成为 `CreateBuiltinFunction(returnValue, 0, "", «»)`
      5. 返回 `Promise.prototype.then(valueThunk)`
   2. 让 `thenFinally` 为 `CreateBuiltinFunction(thenFinallyClosure, 1, "", «»)`
   3. 让 `catchFinallyClosure` 成为一个带有参数（reason）的新抽象闭包，它捕获 `onFinally` 和 `C` 并在调用时执行以下步骤：
      1. 让 `result` 为 `onFinally.call(undefined)`
      2. 让 `promise` 为 `PromiseResolve(C, result)`
      3. 让 `throwReason` 成为一个新的抽象闭包，不带参数，它捕获 `reason` 并在被调用时执行以返回 `ThrowCompletion(reason)`
      4. 让 `thrower` 为 `CreateBuiltinFunction(throwReason, 0, "", « »)`
      5. 返回 `Promise.prototype.then(thrower)`
   4. 让 `catchFinally` 为 `CreateBuiltinFunction(catchFinallyClosure, 1, "", «»)`
7. 返回 `Promise.prototype.then(thenFinally, catchFinally)`

### Promise.prototype.then(onFulfilled, onRejected)

当使用参数 `onFulfilled` 和 `onRejected` 调用 `then` 方法时，将执行以下步骤：

1. 让 `promise` 成为 `this` 值
2. 如果 `isPromise(promise)` 为 `false`，则抛出 `TypeError` 异常
3. 让 `C` 为 `SpeciesConstructor(promise, Promise)`
4. 让 `resultCapability` 为 `NewPromiseCapability(C)`
5. 返回 `PerformPromiseThen(promise, onFulfilled, onRejected, resultCapability)`

#### PerformPromiseThen

抽象操作 `PerformPromiseThen` 接受参数 `promise`、`onFulfilled` 和 `onRejected` 和可选参数 `resultCapability`（一个 `PromiseCapability Record`）。 它使用 `onFulfilled` 和 `onRejected` 作为其结算动作对 `promise` 执行 `"then"` 操作。 如果通过了 `resultCapability`，则通过更新 `resultCapability` 的承诺来存储结果。 如果未通过，则 `PerformPromiseThen` 将被规范内部操作调用，其中结果无关紧要。 它在调用时执行以下步骤：

1. 断言：`IsPromise(promise)` 是 `true`
2. 如果 `resultCapability` 不存在，则设置 `resultCapability` 为 `undefined`
3. 如果 `IsCallable(onFulfilled)` 为 `false`，让 `onFulfilledJobCallback` 为空
4. 否则，让 `onFulfilledJobCallback` 为 `HostMakeJobCallback(onFulfilled)`
5. 如果 `IsCallable(onRejected)` 为 `false`，让 `onRejectedJobCallback` 为空
6. 否则，让 `onRejectedJobCallback` 为 `HostMakeJobCallback(onRejected)`
7. 让 `fulfillReaction` 成为 `PromiseReaction { [[Capability]]: resultCapability, [[Type]]: Fulfill, [[Handler]]: onFulfilledJobCallback }`
8. 让 `rejectReaction` 成为 `PromiseReaction { [[Capability]]: resultCapability, [[Type]]: Reject, [[Handler]]: onRejectedJobCallback }`
9. 如果 `promise.[[PromiseState]]` 是 `pending`，那么
   - 在 `promise.[[PromiseFulfillReactions]]` 尾部添加 `fulfillReaction`
   - 在 `promise.[[PromiseRejectReactions]]` 尾部添加 `rejectReaction`
10. 否则，如果 `promise.[[PromiseState]]` 是 `fulfilled`，则
    1. 让 `value` 为 `promise.[[PromiseResult]]`
    2. 让 `fulfillJob` 成为 `NewPromiseReactionJob(fulfillReaction, value)`
    3. 执行 `HostEnqueuePromiseJob(fulfillJob.[[Job]],fulfillJob.[[Realm]])`
11. 其他的
    1. 断言：`promise.[[PromiseState]]` 的值是 `rejected`
    2. 让 `reason` 为 `promise.[[PromiseResult]]`
    3. 让 `rejectJob` 成为 `NewPromiseReactionJob(rejectReaction, value)`
    4. 执行 `HostEnqueuePromiseJob(rejectJob.[[Job]],rejectJob.[[Realm]])`
12. 将 `promise.[[PromiseIsHandled]]` 设置为 `true`
13. 如果 `resultCapability` 是 `undefined`，则返回 `undefined`
14. 返回 `resultCapability.[[Promise]]`

### Promise.prototype[@@toStringTag]

`@@toStringTag` 属性的初始值是字符串值 `"Promise"`。

这个属性:

```js
{
  [[Writable]]: false,
  [[Enumerable]]: false,
  [[Configurable]]:true
}
```

## Promise 实例属性

`Promise` 实例是继承 `Promise` 原型对象属性的普通对象(Promise.prototype)。`Promise` 实例属性：

| 属性名                        | 描述                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `[[PromiseState]]`            | 待定（pending）、已完成（fulfilled）或已拒绝（rejected）之一。 控制 `Promise` 如何对其 `then` 方法的传入调用做出反应。 |
| `[[PromiseResult]]`           | 承诺被完成或被拒绝的值。只有当`[[PromiseState]]`不是待定时才有效。---                                                  |
| `[[PromiseFulfillReactions]]` | 当 `promise` 从 `pending` 状态转移到 `fulfilled` 状态时，需要处理的 `promise` 记录列表。 ---                           |
| `[[PromiseRejectReactions]]`  | 当 `promise` 从 `pending` 状态转移到 `rejected` 状态时，需要处理的 `promise` 记录列表。---                             |
| `[[PromiseIsHandled]]`        | 指示 `Promise` 是否曾经有过完成或拒绝的处理程序; 用于跟踪未处理的拒绝。---                                             |
