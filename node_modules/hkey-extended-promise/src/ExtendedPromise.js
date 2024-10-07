const assert = require('node:assert');
const {
	TimeoutError, 
	PseudoAbortError,
	DontFinishError,
	isAbortError,
} = require('./Errors.js');

class ExtendedPromise extends Promise{
	constructor(opts={}){
		assert(typeof(opts)==='object' || typeof(opts)==='function');
		opts = (typeof(opts)==='function') ? {callback : opts} : opts
		
		const {onFinish, onReject, onResolve, afterReject, afterResolve, timeout, abort, ref, callback, onInit, parent} = opts;	
		assert(abort    === undefined || abort    === false || abort === true  || abort instanceof AbortController || abort instanceof AbortSignal);
		assert(timeout  === undefined || timeout  === false || (typeof(timeout)==='number' && timeout>=0 && !isNaN(timeout)));
		assert(ref      === undefined || ref      === false || ref === true);

		assert(onFinish     === undefined  || onFinish     === false || typeof(onFinish)==='function');
		assert(onReject     === undefined  || onReject     === false || typeof(onReject)==='function');
		assert(onResolve    === undefined  || onResolve    === false || typeof(onResolve)==='function');
		assert(afterReject  === undefined  || afterReject  === false || typeof(afterReject)==='function');
		assert(afterResolve === undefined  || afterResolve === false || typeof(afterResolve)==='function');

		let _resolve, _reject;
		super(function(__resolve, __reject){
			if(callback){
				callback(__resolve, __reject);
			}
			_resolve = __resolve;
			_reject  = __reject;
		});
		
		this._resolve       = _resolve;
		this._reject        = _reject;
		this._onFinish      = onFinish;
		this._onReject      = onReject;
		this._onResolve     = onResolve;
		this._afterReject   = afterReject;
		this._afterResolve  = afterResolve;
		this._isRef         = ref!==false;
		
		this.firstParent    = this;
		
		this.isFinished     = false;
		this.result         = undefined;
		this.error          = undefined;
		this._timeoutId     = undefined;
		this.timeoutEnd     = Infinity;
		this._refIntervalId = undefined;
		this.parent         = parent;
		
		if(timeout && isFinite(timeout)){
			this.setTimeout(timeout);
		}
		if(this._isRef){
			this.ref();
		}
		if(abort){
			if(abort===true){
				this.abortController = new AbortController(); 
				this.abortSignal     = this.abortController.signal;
			} else if(abort instanceof AbortController){
				this.abortController = abort; 
				this.abortSignal     = this.abortController.signal;
			} else if(abort instanceof AbortSignal){
				this.abortSignal     = abort;
			} else throw new Error('something wrong');

			const onAbort         = this._onAbort.bind(this);
			this._onAbortBinded   = onAbort;
			this.abortSignal.addEventListener('abort', onAbort);
		}
		if(onInit){
			onInit(this);
		}
	}
	onAbort(){
		if(this.abortSignal && typeof(this.abortSignal.throwIfAborted)==='function'){
			try {
				this.abortSignal.throwIfAborted();
			} catch(err) {
				err.isAbortError = true;
				this.reject(err);
				return;
			} 
		}
		this.reject(new PseudoAbortError());
	}
	get timeout(){
		return Math.max(1, this.firstParent.timeoutEnd - Date.now());
	}
	set timeout(val){
		if((!val && val!==0) || (val>0 && !isFinite(val) && typeof(val)==='number')){
			this.clearTimeout();
		} else {
			this.setTimeout(val);
		}
	}
	clearTimeout(){
		const self = this.firstParent;
		if(self._timeoutId !== undefined && !self.isFinished){
			clearTimeout(self._timeoutId);
			self._timeoutId = undefined;
			self.timeoutEnd = Infinity;
		}
	}
	setTimeout(ms){
		const self = this.firstParent;
		if(!self.isFinished){
			self.clearTimeout();
			self._timeoutId = setTimeout(()=>self._onTimeout(), ms);
			self.timeoutEnd = Date.now() + ms;
			if(!self._isRef){
				try{
					self._timeoutId.unref();
				} catch(e) {}
			}
		}
	}
	get isRef(){
		return this._isRef;
	} 
	set isRef(val){
		if(val){
			this.ref();
		} else {
			this.unref();
		}
	}
	unref(){
		this._isRef = false;
		if(!this.isFinished){
			if(this._refIntervalId){
				clearInterval(this._refIntervalId);
				this._refIntervalId = false;
			}
			if(this._timeoutId){
				try{
					this._timeoutId.unref();
				} catch(e){}
			}
		}
	}
	ref(){
		this._isRef = true;
		if(!this.isFinished && !this._refIntervalId){
			let isRefSet = false;
			if(this._timeoutId){
				try{
					this._timeoutId.unref();
					isRefSet = true;
				} catch(e){}
			}
			if(!isRefSet){
				this._refIntervalId = setInterval(()=>{}, 100500);
			}
		}
	}
	_onTimeout(){
		const self = this.firstParent;
		if(!self.isFinished){
			self.reject(new TimeoutError());
			if(self.abortController){
				self.abortController.abort();
			}
		}
	}
	reject(error){
		this.finish(undefined, typeof(error)!=='object' ? new Error(error+'') : error);
	}
	resolve(result){ 
		this.finish(result, undefined);
	}
	abort(){
		if(this.abortController){
			this.abortController.abort();
		} else if(this.abortSignal && typeof(this.abortSignal.abort)==='function'){
			this.abortSignal.abort();
		} else {
			this.reject(new PseudoAbortError());
		}
	}
	_finishExecOn(method, args){
		if(this[method]){
			try{
				this[method](this, ...args);
			} catch(error2){
				if(error2 instanceof DontFinishError){
					this.result = undefined;
					this.error  = undefined;
					return true;
				} else {
					error2.cause   ||= this.error; 
					this.result     = undefined;
					this.error      = error2;
				}
			}
		}
	}
	finish(result, error){
		if(!this.isFinished){
			this.result = result;
			this.error  = error;
			
			if(this._finishExecOn('_onFinish', [result, error])) return;
			if(this.error){
				if(this._finishExecOn('_onReject', [error])) return;
				if(!this.error){
					if(this._finishExecOn('_onResolve', [result])) return;
					assert(!this.error);
				}
			} else {
				if(this._finishExecOn('_onResolve', [result])) return;
				if(this.error){
					if(this._finishExecOn('_onReject', [error])) return;
					assert(this.error);
				}
			}
			if(this.abortSignal){
				if(this.abortSignal.removeEventListener){
					this.abortSignal.removeEventListener('abort', this._onAbortBinded);
				} else {
					this.abortSignal.removeListener('abort', this._onAbortBinded);
				}
			}
			this.clearTimeout();
			this.unref();
			this.isFinished = true; // Atention: unref and clearTimeout need to exec before this.isFinished=true;
			if(this.error){
				this._reject(this.error);
				if(this._afterReject){
					this._afterReject(this, this.error);
				}
			} else {
				this._resolve(this.result);
				if(this._afterResolve){
					this._afterResolve(this, this.result);
				}
			}
		}
	}
	onChild(child, methodName, args){
		child.firstParent = this;
		if(!this._isRef){
			child.unref();
		}
		return child;
	}
	then(...args){
		return this.onChild(super.then(...args), 'then', args);
	}
	catch(...args){
		return this.onChild(super.catch(...args), 'catch', args);
	}
	finally(...args){
		return this.onChild(super.finally(...args), 'finally', args);
	}
};
module.exports  = ExtendedPromise;