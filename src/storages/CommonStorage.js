module.exports = class CommonStorage{
	push(item){
		this._push(item);
		item.isInStorage = true;
	}
	cmp(a,b){
		return (b.priority!==a.priority) ? (b.priority - a.priority) : (a.id - b.id); 
	}
	shift(){
		while(true){
			const item = this._shift();
			if(!item){
				return item;
			} else if(item.isInStorage){
				item.isInStorage = false;
				return item;
			}
		}
	}
	remove(item){
		item.isInStorage = false;
	}
	isEmpty(){
		return this.length===0;
	}
	clear(){
		while(true){
			const item = this.shift()
			if(!item){
				break;
			}
		}
	}
};