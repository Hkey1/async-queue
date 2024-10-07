const {
	PseudoAbortError,
	isAbortError,
	DontFinishError,
	TimeoutError
} = require('./src/Errors.js');

const ExtendedPromise         = require('./src/ExtendedPromise.js');
const { SleepPromise, sleep } = require('./src/sleep.js');
const { ApplyTimeoutPromise, applyTimeout } = require('./src/applyTimeout.js');

module.exports = ExtendedPromise;

Object.entries({
	PseudoAbortError, isAbortError, DontFinishError, TimeoutError,
	ExtendedPromise,
	SleepPromise, sleep,
	ApplyTimeoutPromise, applyTimeout,
}).forEach(([key, val])=>{
	module.exports[key] = val;	
});