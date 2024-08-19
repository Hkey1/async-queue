const AbortError = require('./AbortError.js');
let lastId = 1;
module.exports = class QueuePromise extends Promise{
	constructor(queue, priority, cb){
		let _resolve, _reject;
		super((resolve, reject)=>{
			_resolve = resolve;
			_reject  = reject;
		})
		this.id          = lastId++;
		this.ts          = Date.now();
		this._resolve    = _resolve;
		this._reject     = _reject;
		this.queue       = queue;
		this.priority    = priority;
		this.cb          = cb;
		this.isInStorage = undefined; //прописывается стором
	}
	indexOf(){
		return this.queue.indexOf(this);
	}
	remain(){
		return this.queue.promiseRemain(this); 
	}
	remains(){   return this.remain(); }
	remaining(){ return this.remain(); }
	resolve(res){
		if(!this.isEnded){
			this.isEnded = true;
			this.stop();
			this._resolve(res);
		}
	}
	reject(err){
		if(!this.isEnded){
			this.isEnded = true;
			this.stop();
			this._reject(err);
		}
	}
	abort(msg=undefined){
		this.reject(new AbortError(msg||'aborted'));
	}
	stop(){
		if(this.isInStorage){
			this.queue.removePromise(this);
			this.isInStorage = false;
		}
	}
	async run(){
		if(!this.isEnded){
			this.stop();
			if(this.cb){
				try{
					const res = await this.cb();
					this.resolve(res);
					return res;
				} catch(e){
					this.reject(e);
				}
			} else {
				this.resolve(undefined);
			} 
		}
	}
};	