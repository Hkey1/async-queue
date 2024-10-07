const assert          = require('node:assert');
const ExtendedPromise = require('./ExtendedPromise.js');

class SleepPromise extends ExtendedPromise{
	constructor(opts={}, opts2={}){
		if(typeof(opts)==='function'){
			super(opts);
		} else {
			let timeout;
			if(typeof(opts)==='number'){
				timeout = opts;
				opts    = opts2;
			} else if(opts.ms){
				timeout = opts.ms;
				delete opts.ms;
			} else if(opts.timeout){
				timeout  = opts.timeout;
				delete opts.timeout;
			}
			assert.equal(typeof(timeout), 'number');
			assert(timeout>=0 && !isNaN(timeout) && isFinite(timeout));
			assert(opts.timeout===undefined || opts.timeout===false || !isFinite(opts.timeout));
			super(({ timeout, ...opts}));
		}
	}	
	_onTimeout(){
		this.resolve(true);
	}
}

function sleep(opts={}, opts2={}){
	return new SleepPromise(opts, opts2);
}

module.exports = { SleepPromise, sleep }

