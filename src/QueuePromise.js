const {ExtendedPromise, PseudoAbortError} = require('hkey-extended-promise');//require('../../extended-promise/ExtendedPromise.js');
	
let lastId = 1;
module.exports = class QueuePromise extends ExtendedPromise{
	constructor(queue, priority=undefined, opts={}){
		if(typeof(queue)==='function'){
			super(queue);
		} else {
			super(opts);
			this.id          = lastId++;
			this.ts          = Date.now();
			this.queue       = queue;
			this.priority    = priority;
			this.isInStorage = undefined; //storage must set this.isInStorage=true
		}
	}
	onChild(child, method, args){
		child.queue = this.queue;
		return super.onChild(child, method, args);
	}
	indexOf(){
		return this.queue.indexOf(this);
	}
	remain(){
		return this.queue.promiseRemain(this); 
	}
	remains(){   return this.remain(); }
	remaining(){ return this.remain(); }	
	abort(msg=undefined){
		if(!this.isFinished){
			this.stop();
			super.abort(msg);
		}
	}
	resolve(res){
		if(!this.isFinished){
			this.stop();
			super.resolve(res);
		}
	}
	reject(err){
		if(!this.isFinished){
			this.stop();
			super.reject(err);
		}
	}
	stop(){
		if(this.isInStorage!==false){
			this.queue.removePromise(this);
			this.isInStorage = false;
		}
	}
};