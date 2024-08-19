module.exports = class SimplePromise extends Promise{
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