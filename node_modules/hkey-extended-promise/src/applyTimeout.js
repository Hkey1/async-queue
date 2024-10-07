const assert                          = require('node:assert');
const ExtendedPromise                 = require('./ExtendedPromise.js');
const { TimeoutError, isAbortError }  = require('./Errors.js');

class ApplyTimeoutPromise extends ExtendedPromise{
	constructor(innerPromise, opts={}, opts2={}){
		if(typeof(innerPromise)==='function'){
			super(innerPromise);
		} else {
			if(typeof(opts)==='number'){
				opts = {timeout: opts, ...opts2};
			}
			assert(innerPromise instanceof Promise);
			assert.equal(typeof(opts.timeout),'number');
			assert(opts.timeout>=0 && !isNaN(opts.timeout));

			super(opts);

			this._innerPromise = innerPromise;

			innerPromise.then(result=>{
				this.resolve(result);
			});
			innerPromise.catch(error=>{
				this.reject(error);
			});
		}
	}
	finish(result, error){
		super.finish(result, error);
		if(this.isFinished && this._innerPromise && this.error && (isAbortError(this.error) || this.error instanceof TimeoutError)){
			if(typeof(this._innerPromise.abort)==='function' && !this._innerPromise.isFinished){
				process.nextTick(()=>{
					if(!this._innerPromise.isFinished){
						this._innerPromise.abort();
					}
				})
			}
		}
	}
};
function applyTimeout(innerPromise, opts={}, opts2={}){
	return new ApplyTimeoutPromise(innerPromise, opts, opts2);
}

module.exports = {ApplyTimeoutPromise, applyTimeout};
