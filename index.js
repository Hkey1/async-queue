const Queue    = require('./src/Queue.js');
module.exports = Queue;

[
	'Queue', 'QueuePromise', 'AbortError', 
	'CommonStorage', 'ArrayStorage', 'BinHeapStorage', 	
].forEach(name=>{
	module.exports[name] = require('./src/'+name+'.js')
})