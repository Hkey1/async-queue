const assert  = require('node:assert');
const all     = require('./index.js');

const  {PseudoAbortError, isAbortError, ExtendedPromise, DontFinishError, TimeoutError, SleepPromise, sleep, ApplyTimeoutPromise, applyTimeout} = all;

const errors    = {DontFinishError, TimeoutError, PseudoAbortError};
const classes   = {ExtendedPromise, SleepPromise, ApplyTimeoutPromise};
const functions = {sleep, isAbortError, applyTimeout};

assert(ExtendedPromise);
assert(PseudoAbortError);
assert(isAbortError);
assert(DontFinishError);
assert(TimeoutError);
assert(SleepPromise);
assert(sleep);
assert(ApplyTimeoutPromise);
assert(applyTimeout);

Object.values(all).forEach(cur=>assert(typeof(cur)==='function'));
Object.values({...errors,...classes, ...functions}).forEach(cur=>assert(typeof(cur)==='function'));
Object.values(errors).forEach(cur=>assert((new cur()) instanceof Error));

assert.equal(ExtendedPromise, all);
assert(isAbortError(new PseudoAbortError()));

const innerPromise = new Promise(resolve=>{
	setTimeout(()=>{
		resolve()
	}, 10)
})

const at = applyTimeout(innerPromise, 100);
assert(at instanceof ApplyTimeoutPromise);


(async ()=>{
	const p1 = new ExtendedPromise();
	assert.equal(p1.timeout, Infinity);
	
	p1.timeout = 100;
	if(Math.abs(p1.timeout-100) > 10){
		assert.equal(p1.timeout, 100);
	}
	p1.timeout = false;
	assert.equal(p1.timeout, Infinity);

	p1.timeout = 100;
	await sleep(20);
	if(p1.timeout > 90 || p1.timeout < 50){
		assert.equal(p1.timeout, 80);
	}
	
	
	try{
		await p1;
		throw new Error('something wrong');
	} catch(e){
		if(!(e instanceof TimeoutError)){
			throw e;
		}
	}
	
	console.log('test is ok');
})();