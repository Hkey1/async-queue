# async-queue

Extended Promise with resolve(), reject(), abort() methods, timeout, and much more

* Simple to use
* resolve(), reject() methods
* abort() method with suport AbortSignal and AbortController
* isFinished, error and result Properties
* timeout property, setTimeout(), clearTimeout() methods
* ref(), unref() methods, isRef property
* onFinish Callback
* sleep(ms), applyTimeout(promise, ms)

## Usage

```js
	const ExtendedPromise = require('hkey-extended-promise'); // or const {ExtendedPromise} = require(....)
	const promise = new ExtendedPromise();
	setTimeout(()=>promise.resolve(), 100);
	await promise;
```
Or just:
```js
	const {sleep} = require('hkey-extended-promise'); 
	await sleep(100);
```

### applyTimeout(promise, ms, opts={})

If the embedded promise does not complete within the specified time, it will throw TimeoutError
```js
	const {applyTimeout, TimeoutError} = require('hkey-extended-promise'); 
	try{
		await applyTimeout(somePromise, 100);
	} catch(e){
		if(e instance of TimeoutError){
			...
		}
	}
```

### abort()

	Extended promises have abort() Method
	```js
		const {isAbortError, ExtendedPromise} = require('hkey-extended-promise');
	
		const promise = new ExtendedPromise();
		setTimeout(()=>promise.abort(), 100); // or promise.reject(new PseudoAbortError())
		
		try{
			await promise;	
		} catch(e){
			if(isAbortError(e)){
				...
			}
		}
	```
### timeout

	```js
		const promise = new ExtendedPromise({timeout: 100});
	```
	OR
	```js
		const promise = new ExtendedPromise();
		promise.timeout = 100; // OR promise.setTimeout(100);
	```
	clearTimeout
	```js
		const promise = new ExtendedPromise({timeout: 100});
		promise.timeout = false; // OR promise.clearTimeout(); OR promise.timeout = Infinity;
	```

#### get ms till timeout fires

    Just use promise.timeout
	```js
		const promise = new ExtendedPromise({timeout: 100});
		console.log(promise.timeout); // 100;
	```

	```js
		const promise = new ExtendedPromise({timeout: 100});
		await sleep(10);
		console.log(promise.timeout); // 90;
	```
	
	if no timeout promise.timeout will be Infinity
	```js
		const promise = new ExtendedPromise();
		console.log(promise.timeout); // Infinity;
	```
	
#### timeout in sleep() and applyTimeout()
You can use timeout on sleep() and applyTimeout() just as in ExtendedPromise 

	```js
		const promise = sleep(100); //or new SleepPromise(100)
		promise.timeout = 1000; // OR promise.setTimeout(1000);
	```

### promise.isFinished, promise.result, promise.error

if promise.isFinished=true then promise is finised and promise.result or promise.error filled.
	```js
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

### onFinish(promise, result, error)

	```js
		new Promise({onFinish: function(promise, result, error){
			...
		}})
	```

## Advances usage

### abort option

	you can use abortSignal or abortController or true or false
	
#### abort=false (defaut)

	```js
		const promise = new ExtendedPromise({abort: false}) //or new ExtendedPromise();
		try{
			await promise;
		} catch(e){
			if(isAbortError(e)){
				...
			} else {
				...
			}
		}
	```	
	promise.abort() do promise.reject(new PseudoAbortError())
	
#### abort=true 

	Generate promise.abortController and promise.abortSingnal properties;
	promise.abort() do promise.abortController.abort();
	On timeout or on abort abortController and abortSingnal will be aborted
	
	```js
		const promise = new ExtendedPromise({abort: true});
	```
	
#### abort=abortSignal

 	promise.abort() do promise.reject(new PseudoAbortError())
	but if abortSignal will be aborted then promise will be rejected  

	```js
		const abortController = new AbortController();
		const promise = new ExtendedPromise({abort: abortController.signal});
	```
#### abort=abortController

 	promise.abort() do promise.reject(new PseudoAbortError())
	but if abortController will be aborted then promise will be rejected
	on promise.abort() or timeout abortController will be aborted	

	```js
		const abortController = new AbortController();
		const promise = new ExtendedPromise({abort: abortController});
		...
	```
	
### promise.ref(), promise.unref() and promise.isRef

	As Net.Socket, ExtendedPromise has ref() and unref() methods;

	'promise.ref()' or 'promise.isRef = true' or 'new ExtendedPromise({ref: true})' 
	will not let the program exit before promise is finished
	
	
	'promise.unref()' or 'promise.isRef = false' or 'new ExtendedPromise({ref: false})' or by defaut 'new ExtendedPromise()' 
	will let the program exit before promise is finished
	
	
### How to change promise result

```js
	new ExtendedPromise({
		onFinish: function(promise, result, error){
			if(...){
				//resolve 
				promise.result = 123;
				promise.error  = undefined;
			} 
			if(...){
				//reject
				promise.result = undefined;
				promise.error  = new Error(...);
				//OR just throw new Error(...);
			} 
			if(...){
				//promise will be continue pending (will not be resolved or rejected)
				//const {DontFinishError} = require('hkey-extended-promise'); 
				throw new DontFinishError();
			}
		}
	});
	```

#### example 

```js
	new ExtendedPromise({
		timeout: 100,
		onFinish: function(promise, result, error){
			if(error instanceof TimeoutError){
				promise.result = true;
				promise.error  = undefined;
			} 
		}
	});
```
	
	this code do same as 'sleep(100)' 





	

















	
			if(this._finishExecOn('_onFinish', [result, error])) return;
			if(this.error){
				if(this._finishExecOn('_onReject', [error])) return;
				if(!this.error){
					if(this._finishExecOn('_onResolve', [result])) return;
					assert(!this.error);
				}
				
	
	




	
	
 
 







	
	

	
	
	
	
	



	
	
	
	
	









	
	
	


		//OR 
		//const {PseudoAbortError} = require('hkey-extended-promise');
		// setTimeout(()=>);


	
	
	


	
### abort=true

	```js
		const promise = new ExtendedPromise({abort: true});
		setTimeout(()=>promise.abortController.abort(), 100);
		promise.abortSignal.on('abort', ()=>{});
		
		try{
			await promise;	
		} catch(e){
			if(isAbortError(e)){
				...
			}
		}
	```

### abort=abortController	
	on timeout or on abort abortController, abortSingnal will be aborted
	
	```js
		let abortController = new AbortController();
		const promise = new ExtendedPromise({abort: true});
		
		//assert(abortController        === promise.abortController);
		//assert(abortController.signal === promise.abortController.signal);
		//assert(abortController.signal === promise.abortSignal);
		
		setTimeout(()=>promise.abort(), 100);//abortController will be aborded
	```

### abort=abortSignal	
	on timeout or on abort abortSingnal will NOT be aborted


## timeout
	```js
		const promise = new ExtendedPromise({timeout: 100});
	```	
	OR
	```js
		const promise = new ExtendedPromise();
		promise.timeout = 100;
	```	
	OR
	```js
		const promise = new ExtendedPromise();
		promise.setTimeout(100);
	```	
	
## clear timeout
	To clear timeout set promise.timeout = false; Or promise.clearTimeout();
	
## get ms till timeout fires
	```js
		console.log(promise.timeout)
	```	
	if timeout is not set will be Infinity
	


	
	


	
	
	
	










## queue
```js
	const queue = new Queue({delay: 30}); // OR new Queue(30);
```

### queue.length (Remains items in query)
```js
	console.log(queue.length);
```
### queue.usage() (Share of usage of limits)
```js
	console.log(queue.usage() * 100 + '%');
```

### queue.remains() (Remains time (ms) till query is end)
```js
	console.log(queue.remains()); //remains waiiting time in queue;
```

### queue.tillEnd() return promise. It will be resolved when query ends
```js
	await queue.tillEnd();
```

## promise
```js
	const promise = queue.push();
```

### promise.remains() (Remains time (ms) till promise is called)
```js
	console.log(promise.remains()); //remains waiting time in queue for this promise
```

### promise.indexOf() count items before promise
```js
	console.log(promise.indexOf()); //count items before promise
```

### promise.resolve(res)
```js
	promise.resolve('hello');
```

### promise.reject(err)
```js
	promise.reject(new Error('reject'));
```

### promise.abort(errMsg)
Promise throws AbortError
```js
	promise.abort();
```


## priority
```js
	const queue = new Queue({ 
		delay           : 30, 
		defaultPriority : 50, 		
	}); //OR new Queue(30, 50)

	queue.push(101).then(()=>console.log(101));
	queue.push(10).then(()=>console.log(10));
	queue.push(100).then(()=>console.log(100));

	//101, 100, 10
```