const EventEmitter   = require('node:events');
const ArrayStorage   = require('./storages/ArrayStorage.js');
const BinHeapStorage = require('./storages/BinHeapStorage.js');
const QueuePromise   = require('./promises/QueuePromise.js');
const SimplePromise  = require('./promises/SimplePromise.js');
const AbortError     = require('./AbortError.js');

class Queue extends EventEmitter{
	constructor(opts={}, defPrior=undefined){
		opts = (typeof(opts)=='number') ? {delay: opts} : opts;
		super();

		this.delay           = opts.delay;
		this.defaultPriority = opts.defaultPriority ?? defPrior;
		this.storage         = opts.storage || (this.defaultPriority===undefined ? new ArrayStorage(): new BinHeapStorage());
		this.inCicle         = false;
		this.isDestroyed     = false;
		this.lastRunTs       = 0; 
		this.finished        = 0;
		this.startedAt       = Date.now();
		this._tillEnd        = null;
		
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
		return Math.min(1, this.finished/(Math.floor((Date.now() - this.startedAt)/this.delay)));
	}
	get length(){
		return this.storage.length;
	}
	destroy(){
		this.isDestroyed = true;
		this.storage.clear();
	}
	push(priority=undefined, cb=undefined){
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
		
		process.nextTick(() => {
			this.runCicle();
		});
		return promise;
	}
	tillEnd(){
		if(this.storage.isEmpty()){
			return null;
		}
		return (this._tillEnd ||= new SimplePromise());
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
				if(this._tillEnd){
					this._tillEnd.__resolve(null);
				} 
				this._tillEnd = null;
				this.emit('end');
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

module.exports = Queue;

Object.entries({ArrayStorage, BinHeapStorage, QueuePromise, SimplePromise, AbortError}).forEach(([name, Class])=>{
	module.exports[name] = Class;		
})

