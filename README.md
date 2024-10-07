# async-queue
Async Queue (Throttler). For rate limiting.
For example, you use an external API and the number of requests per second is limited there.

* Fast: Uses very fast algorithms for storage (BinHeap). The complexity of the any operation is no more log(n);
* Simple to use
* Can calculate remains time and limits usage
* Can use priority
* Can abort items in Queue

## Usage
```js
	const Queue = require('hkey-async-queue');
	const queue = new Queue({delay: 30}); // OR new Queue(30);
	//There will be a 30ms delay between element calls.
	
	await queue.push();
	
	const promise = queue.push();
	await promise2;
	console.log();		
```
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