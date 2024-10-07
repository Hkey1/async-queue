class PseudoAbortError extends Error{
	constructor(msg){
		super(msg||'PseudoAbortError');
		this.code    = 'ABORT_ERR';
		this.name    = 'AbortError';
		this.isAbortError = true;
	}
};
function isAbortError(error){
	return (error && (false
 		|| error.code         === 'ABORT_ERR'
		|| error.name         === 'AbortError'
		|| error.isAbortError === true
	));
}

class DontFinishError extends Error{
	constructor(msg){
		super(msg||'DontFinishError');
		this.code  = 'DONT_FINISH_ERR';
		this.name  = 'DontFinishError';
	}
};
class TimeoutError extends Error{
	constructor(msg){
		super(msg||'TimeoutError');
		this.code  = 'TIMEOUT_ERR';
		this.name  = 'TimeoutError';
	}
};

module.exports = {
	PseudoAbortError,
	isAbortError,
	DontFinishError,
	TimeoutError
};

