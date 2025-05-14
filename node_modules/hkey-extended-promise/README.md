# hkey-extended-promise

Node.js module. Extended default Promise class with resolve(result), reject(error), abort() methods, timeout, and much more

* Simple to use
* resolve(), reject() methods
* sleep(ms), applyTimeout(promise, ms)
* abort() method with suport AbortSignal and AbortController
* isFinished, error and result Properties
* timeout property, setTimeout(), clearTimeout() methods
* ref(), unref() methods, isRef property
* onFinish Callback


## Install
```
npm i hkey-extended-promise
```
then

```js
const ExtendedPromise = require('hkey-extended-promise'); 
```
OR
```js
const {ExtendedPromise} = require('hkey-extended-promise'); 
```

OR
```js
const { 
    ExtendedPromise, 
    sleep, SleepPromise,
    applyTimeout, ApplyTimeoutPromise,    
    TimeoutError, DontFinishError,
    PseudoAbortError, isAbortError, 
} = require('hkey-extended-promise'); 
```

## Usage
```js
const promise = new ExtendedPromise();
setTimeout(()=>promise.resolve(true), 100);
await promise;
```

### sleep(ms, opts={})
the code above is equivalent to `await sleep(100);` or `await (new SleepPromise(100))`

```
const {..., sleep, ... } = require('hkey-extended-promise');   
...
await sleep(100);
...
```


### applyTimeout(innerPromise, ms, opts={})
If the embedded promise (innerPromise) does not complete within the specified time, ApplyTimeoutPromise will throw TimeoutError
```js
const {..., applyTimeout, ... } = require('hkey-extended-promise');   
...
const innerPromise = ... // new Promise(...)
...
await applyTimeout(innerPromise, 100);
```

### timeout option
If promise does not complete within the specified time will throw TimeoutError

```js
const promise = new ExtendedPromise({timeout: 100});
```

OR

```js
const promise = new ExtendedPromise();
...
promise.timeout = 100; 
// OR promise.setTimeout(100);
```

#### TimeoutError
```js
const {..., TimeoutError, ... } = require('hkey-extended-promise');   
try{
    await new ExtendedPromise({timeout: 100});
} catch(err){
    if(err instance of TimeoutError){
        ...
    }
}
```

#### clearTimeout
```js
promise.timeout = false; 
```

OR
```js
promise.clearTimeout();
```

#### Get ms till timeout fires
Just use `promise.timeout`

```js
const promise = new ExtendedPromise({timeout: 100});
console.log(promise.timeout); // 100

await sleep(20);
console.log(promise.timeout); // 80

promise.timeout = false;
console.log(promise.timeout); // Infinity

```
    
#### timeout in sleep() and applyTimeout()
You can use promise.timeout on SleepPromise(`sleep()`) and ApplyTimeoutPromise(`applyTimeout()`) just as in ExtendedPromise 

```js
const promise = sleep(100); 
console.log(promise.timeout); // 100;

promise.timeout = 1000; // OR promise.setTimeout(1000);
console.log(promise.timeout); // 1000;
```

In SleepPromise(`sleep()`) timeout cases promise resolve. On other cases on timeout promise will be rejected (throw TimeoutError);

### promise.isFinished, promise.result, promise.error

if `promise.isFinished==true` then promise is finised and promise.result or promise.error filled.
```js
...
const promise = new ExtendedPromise(...);
...
if(promise.isFinished){
    if(promise.error){
        console.log('promise finised with error', promise.error);
    } else {
        console.log('promise resolved', promise.result);
    }
} else {
    console.log('promise is pending');
}
```

### afterFinish(promise, result, error)
```js
new ExtendedPromise({afterFinish: function(promise, result, error){
    ...
}})
```

## Advances Usage

### abort()
* Extended promises have `promise.abort()` method. 
* By defaut it equal to  `promise.reject(new PseudoAbortError())`
* Better check using `isAbortError(error)` and not use `error instanceof PseudoAbortError`;

```js
const {..., isAbortError, ...} = require('hkey-extended-promise');
...
const promise = new ExtendedPromise(...);
setTimeout(()=>promise.abort(), 100); 
        
try{
    await promise;    
} catch(error){
    if(isAbortError(error)){
        ...
    }
}
```
You can use abortSignal or abortController or true or false as abort option `new ExtendedPromise({abort: ...});`

#### abort=false (defaut)
* `new ExtendedPromise({abort: false})` 
    - or `new ExtendedPromise({})` 
    - or `new ExtendedPromise()`
* default    
* `promise.abort()` equal to `promise.reject(new PseudoAbortError())`
    
#### abort=true 
* `new ExtendedPromise({abort: true});`
* Properties promise.abortController and promise.abortSignal will be generated
* On `promise.abort()` or on timeout promise.abortController will be aborted    
* `promise.abort()` equal to `promise.abortController.abort()`
*  On `promise.abortController.abort()` promise will throw AbortError (check with isAbortError())

#### abort=abortController
```js
const abortController = new AbortController();
const promise = new ExtendedPromise({abort: abortController});
```

* On `promise.abort()` or on timeout abortController will be aborted    
* `promise.abort()` equal to `abortController.abort()`
*  On `abortController.abort()` promise will throw AbortError (check with isAbortError())
 
#### abort=abortSignal
```js
const abortController = new AbortController();
const abortSignal = abortController.signal;
const promise = new ExtendedPromise({abort: abortSignal});
```

* On `promise.abort()` or on timeout promise just throw error but abortController will NOT be aborted    
* If abortSignal will be aborted (`abortController.abort()`) promise will be rejected
* `promise.abort()` equal to `promise.reject(new PseudoAbortError())`

### promise.ref(), promise.unref() and promise.isRef
* As Net.Socket, ExtendedPromise has ref() and unref() methods;
* to DONT let the program exit before promise is finished
    - `promise.ref()`
    - or `promise.isRef = true`
    - or `new ExtendedPromise({ref: true})`
* to let the program exit before promise is finished
    - `promise.unref()`
    - or `promise.isRef = false`
    - or `new ExtendedPromise({ref: false})`
    - or by default `new ExtendedPromise()`
    
### How to change promise result
* You can change result in onFinish, in onResolve, or in onReject callbacks;
* But NOT in afterFinish, in afterResolve, or in afterReject
* You need to change promise.result and promise.error.
* To reject you can throw error in this callback
* To cancel finishing (resolving, rejecting) throw DontFinishError

```js
const {..., DontFinishError, ...} = require('hkey-extended-promise'); 

new ExtendedPromise({
    onFinish: function(promise, result, error){
        if(...){ //resolve 
            promise.result = 123;
            promise.error  = undefined;
        } 
        if(...){ //reject
            promise.result = undefined;
            promise.error  = new Error(...);
            //OR just throw new Error(...);
        } 
        if(...){ //dont finish (continue pending)
            throw new DontFinishError();
        }
    }
});
```

#### example 
code below equal to `await sleep(100)`

```js
await new ExtendedPromise({
    timeout: 100,
    onFinish: function(promise, result, error){
        if(error instanceof TimeoutError){
            promise.result = true;
            promise.error  = undefined;
        } 
    }
});
```

## Callbacks
In opts you can specify callbacks

### callback(resolve, reject)
* `new ExtendedPromise({callback: (resolve, reject)=>{...}})` 
* `new ExtendedPromise((resolve, reject)=>{...})`
* Equal to defaut Promise callback. `new Promise((resolve, reject)=>{...})`

### onInit(promise)
* `new ExtendedPromise({onInit: promise=>{...}})` 
*  fires after promise creating

### onFinish(promise, result, error), onResolve(promise, result), onReject(promise, error)
* `new ExtendedPromise({onFinish: promise=>{...}})` 
* fires before promise rejected or resolving
* You can change result or cancel finishing (resolving/rejecting)
* If you change result this callbacks can fires twice or more times

### afterFinish(promise, result, error), afterResolve(promise, result), afterReject(promise, error)
* `new ExtendedPromise({afterFinish: promise=>{...}})` 
* You can NOT change result or cancel finishing 
* This callbacks only fires once
* If you dont want to change results please use after... callbacks

