const {Emitter}      = require('../../till-event/index.js');
const {sleep}        = require('hkey-extended-promise');
const ArrayStorage   = require('./storages/ArrayStorage.js');
const BinHeapStorage = require('./storages/BinHeapStorage.js');
const QueuePromise   = require('./QueuePromise.js');

class Queue extends Emitter{
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
	tillEnd(){
		return this.tillEvent('end');
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
	push(priority=undefined){
		if(this.hasPriority){
			priority ||= this.defaultPriority;
			if(typeof(priority)!=='number' || isNaN(priority)){
				throw new Error('Bad priority='+priority+' ('+typeof(priority)+')');
			}
		} else if(priority!==undefined){
			throw new Error('You set priority, but storage not supports Priority');
		}
		const promise = new QueuePromise(this, priority);	
		this.storage.push(promise);
		this.emit('add', promise);
		
		process.nextTick(() => {
			this.runCicle();
		});
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
				await sleep(remain);//new Promise(resolve=>setTimeout(resolve, remain)); //sleep
				if(this.isDestroyed === true) break;
			}
			const promise = this.storage.shift();
			let   isEmpty = !promise;	
			if(promise){
				this.lastRunTs = Date.now();
				promise.resolve();
				isEmpty = !!this.storage.isEmpty();
				this.finished++;
				this.emit('run', promise, isEmpty);
			}
			if(isEmpty){
				this.emit('end');
				break;
			}
		}
		this.inCicle  = false;
	}
	remain(){
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
	abortAll(){
		this.storage.shiftAll().forEach(promise=>promise.abort());
	}
};

module.exports = Queue;
module.exports.Queue          = Queue;
module.exports.ArrayStorage   = ArrayStorage;
module.exports.BinHeapStorage = BinHeapStorage;