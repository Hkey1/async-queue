const CommonStorage = require('./CommonStorage.js');
module.exports = class ArrayStorage extends CommonStorage{
	constructor(){
		super();
		this.hasPriority = false;
		this.arr    = [];
		this.allLen = 0;
		this.offLen = 0;
	}
	get length(){
		return this.arr.length;
	}
	_push(item){
		item.allNum = this.allLen;
		this.arr.push(item);
		this.allLen++;
	}
	_shift(){
		const res = this.arr.shift();
		if(res){
			this.offLen++;
		}
		return res;
	}
	indexOf(item){
		return (item.allNum >= this.offLen) ? item.allNum - this.offLen : -1; 
	}
};