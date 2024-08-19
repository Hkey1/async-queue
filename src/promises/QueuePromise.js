const CommonQueuePromise = require('./CommonQueuePromise.js');

let lastId = 1;
module.exports = class QueuePromise extends CommonQueuePromise{
	constructor(queue, priority=undefined, cb=undefined){
		if(typeof(queue)==='function'){
			super(queue);
			this.isOverLoad = true;		
		} else {
			super();
			this.id          = lastId++;
			this.ts          = Date.now();
			this.queue       = queue;
			this.priority    = priority;
			this.cb          = cb;
			this.isInStorage = undefined; //прописывается стором
		}
		this.childs = [];		
	}
    then(onFulfilled, onRejected) {
		if(this.isOverLoad){
			return super.then(onFulfilled, onRejected);
		}
        const res = super.then(onFulfilled, onRejected);
        return res;
    }
	indexOf(){
		return this.queue.indexOf(this);
	}
	remain(){
		return this.queue.promiseRemain(this); 
	}
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