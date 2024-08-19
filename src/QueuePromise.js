const AbortError = require('./AbortError.js');
let lastId = 1;

class SimplePromise extends Promise{
	constructor(first){
		if(typeof(first)==='function'){
			super(first);
			this.isOverLoad = true;			
		} else {
			let __resolve, __reject;
			super((resolve, reject)=>{
				__resolve = resolve;
				__reject  = reject;
			})
			this.__resolve = __resolve;
			this.__reject  = __reject;
		}
	}	
}

class MyPromise extends SimplePromise{
	constructor(first){
		super(first);
		this.childs    = [];
	}	
	async _resolve(res){
		if(this.onFulfilled){
			res = await this.onFulfilled(res);
		}
		if(this.onFinally){
			await this.onFinally();
		}
		this.childs.forEach(child=>{
			if(child.onFulfilled){
				child._resolve(res);
			}
		});
		this.childs.forEach(child=>{
			if(child.onFinally){
				child.onFinally(res);
			}
		});
		this.__resolve(res);
	}
	async _reject(err){
		for(let i=0; i<this.childs.length; i++){
			const child = this.childs[i];
			if(child.onRejected){
				try{
					return await this._resolve(await child.onRejected(err));
				} catch(e){
					err = e;
				}
			}
		}
		if(this.onFinally){
			await this.onFinally();
		}
		this.__reject(err);
	}
	abort(msg=undefined){
		this.reject(new AbortError(msg||'abort'));
	}
	addChild(onFulfilled=undefined, onRejected=undefined, onFinally=undefined){
		const child = new QueueChildPromise(this, onFulfilled, onRejected, onFinally);
		this.childs.push(child);
		return child;
	}
    then(onFulfilled, onRejected=undefined){
		if(this.isOverLoad){
			return super.then(onFulfilled, onRejected);
		}
		return this.addChild(onFulfilled, onRejected);
    }
	catch(onRejected){
		if(this.isOverLoad){
			return super.catch(onRejected);
		}
		return this.addChild(undefined, onRejected);
	}
	finally(onFinally){
		if(this.isOverLoad){
			return super.finally(onFinally);
		}
		return this.addChild(undefined, undefined, onFinally);
	}
	remains(){   return this.remain(); }
	remaining(){ return this.remain(); }	
};

class QueueChildPromise extends MyPromise{
	constructor(parent, onFulfilled=undefined, onRejected=undefined, onFinally=undefined){
		super(parent);
		this.parent      = parent;
		this.onFulfilled = onFulfilled;
		this.onRejected  = onRejected;
		this.onFinally   = onFinally;
	}
	indexOf(){
		return this.parent.indexOf();
	}
	remain(){
		return this.parent.remain(this); 
	}
	resolve(res){
		this.parent.stop(); 
		return this._resolve(res); 
	}
	reject(err){
		this.parent.stop(); 
		return this._reject(err); 
	}
	stop(){
		return this.parent.stop(); 
	}
};

module.exports = class QueuePromise extends MyPromise{
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

module.exports.SimplePromise = SimplePromise;
