const EventEmitter   = require('node:events');
const QueuePromise   = require('./QueuePromise.js');
const ArrayStorage   = require('./ArrayStorage.js');
const BinHeapStorage = require('./BinHeapStorage.js');


module.exports = class Queue extends EventEmitter{
	constructor(opts={}, defPrior=undefined){
		opts = (typeof(opts)=='number') ? {delay: opts} : opts;

		this.delay           = opts.delay;
		this.defaultPriority = opts.defaultPriority ?? defPrior;
		this.storage         = opts.storage || (this.defaultPriority===undefined ? new ArrayStorage(): new BinHeapStorage());
		this.inCicle         = false;
		this.isDestroyed     = false;
		this.lastRunTs       = 0; 
		this.finished        = 0;
		this.startedAt       = Date.now();
		
		if(typeof(this.delay)!=='number' || isNaN(this.delay) || this.delay<=0){
			throw new Error('Bad delay='+this.delay+' ('+typeof(this.delay)+')');
		}

		this.hasPriority = this.storage.hasPriority;
		if(this.hasPriority){
			this.defaultPriority ??= 50;
			if(typeof(this.defaultPriority)!=='number' || isNaN(this.defaultPriority)){
				throw new Error('Bad defaultPriority='+this.defaultPriority+' ('+typeof(this.defaultPriority)+')');
			}
		} else if(this.defaultPriority !== undefined){
			throw new Error('You set defaultPriority, but storage not supports Priority')
		}
	}
	usage(){
		this.finished/(Math.floor((Date.now() - this.startedAt)/this.delay) + 1);
	}
	get length(){
		return this.storage.length;
	}
	destroy(){
		this.isDestroyed = true;
		this.storage.clear();
	}
	async push(priority=undefined, cb=undefined){
		if(typeof(priority)==='function'){
			cb       = priority;
			priority = undefined;
		}
		if(typeof(cb)!=='function' && cb!==undefined){
			throw new Error('Bad cb='+cb+' ('+typeof(cb)+')');
		}
		if(this.hasPriority){
			priority ||= this.defaultPriority;
			if(typeof(priority)!=='number' || isNaN(priority)){
				throw new Error('Bad priority='+priority+' ('+typeof(priority)+')');
			}
		} else if(priority!==undefined){
			throw new Error('You set priority, but storage not supports Priority');
		}
		const promise = new QueuePromise(this, priority, cb);	
		this.storage.push(promise);
		this.emit('add', promise);
		this.runCicle();
		return promise;
	}
	calcNextRemain(){
		return Math.max(0, this.delay - (Date.now() - this.lastRunTs));
	}
	async runCicle(){
		if(this.inCicle) return;
		this.inCicle = true;
		while(this.isDestroyed !== true){
			const remain = this.calcNextRemain();
			if(remain){
				await new Promise(resolve=>setTimeout(resolve, remain));
				if(this.isDestroyed === true) break;
			}
			const promise = this.storage.shift();
			let   isEmpty = !promise;	
			if(promise){
				this.lastRunTs = Date.now();
				promise.run();
				isEmpty = !!this.storage.isEmpty();
				this.finished++;
				this.emit('run', promise, isEmpty);
			}
			if(isEmpty){
				this.emit('empty');
				break;
			}
		}
		this.inCicle  = false;
	}
	remain(){
		if(this.isEmpty){
			return 0;
		}
		const len = this.storage.length;
		if(len===0){
			return 0;
		}
		if(len===undefined){
			return undefined; 
		}
		return (len - 1)*this.delay + this.calcNextRemain();
	}
	remains(){   return this.remain(); }
	remaining(){ return this.remain(); }	
	promiseRemain(promise){
		const index = this.storage.indexOf(promise);
		if(index===-1){
			return 0;
		}
		if(index===undefined){
			return undefined;
		}
		return index*this.delay + this.calcNextRemain();
	}
	removePromise(promise){
		this.storage.remove(promise);
	}
	indexOf(promise){
		return this.storage.indexOf(promise);
	}
};