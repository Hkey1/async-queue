# async-queue
Async Queue (Throttler). For rate limiting.
For example, you use an external API and the number of requests per second is limited there.

* Uses very fast algorithms for storage. The complexity of the any operations is no more log(n);
* Can calculate remains time and limits usage
* Can use priority
* Simple
* Can abort items in Queue


## Usage
```js
	const Queue = require('async-queue');
	const queue = new Queue({delay: 30}); // OR new Queue(30);
	//There will be a 30ms delay between element calls.
	
	await queue.push();
	
	const promise2 = queue.push(async ()=>{ // OR queue.push().then(someCb);
		return 'promise2';
	});
	console.log(await promise2);		
```
## queue
```js
	const queue = new Queue({delay: 30}); // OR new Queue(30);
```

### queue.length (Remains items in query)
```js
	console.log(queue.length);
```
### queue.usage() (Ыhare of usage of limits)
```js
	console.log(queue.usage() * 100 + '%');
```

### queue.remains() (Remains time (ms) till query is end)
```js
	console.log(queue.remains()); //remains waiiting time in queue;
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
Promise throws Queue.AbortError
```js
	promise.abort('abort'); // OR promise.reject(new Queue.AbortError('abort'));
```

##priority
```js
	const queue = new Queue({ 
		delay           : 30, 
		defaultPriority : 50, 		
	}); //OR new Queue(30, 50)

	queue.push(10,  ()=>console.log(10));
	queue.push(100, ()=>console.log(100));

	//100, 10
```