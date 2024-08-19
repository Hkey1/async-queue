const ArrayStorage = require('./ArrayStorage.js');

class BinHeapStorage extends ArrayStorage{
	constructor(){
        super(); //this.arr   = [];
        this.poses = {};
		this.hasPriority = true;
	}
    _push(item){
		const pos = this.arr.length;
        this.poses[item.id] = pos;
        this.arr.push(item);		
        this._siftdown(0, pos);
    }
    _shift() {
        const last = this.arr.pop();
        this._removeOldIndex(last, this.arr.length);
		if (this.arr.length === 0){
			return last;
		} else {
			const res = this.arr[0];
			this._aSet(0, last);//array[0] = last;
			this._siftup(0);
			return res;
		}
    }	
    indexOf(item){
        return this.poses[item.id] ?? -1;
    }
    _siftdown(start, pos) {
		const newItem = this.arr[pos];
        while (pos > start) {
            const parentPos = (pos - 1) >> 1;
            const parent = this.arr[parentPos];
            if(this.cmp(newItem, parent) >= 0){
                break;
			}
            this._aSet(pos, parent);
            pos = parentPos;
        }
        this._aSet(pos, newItem);
    }
    _aSet(index, item){
        this._removeOldIndex(this.arr[index], index);
        this.poses[item.id]  = index;
        this.arr[index]      = item;
    }
    _removeOldIndex(item, ifIndex){
        if(this.poses[item.id]===ifIndex){
            delete this.poses[item.id];
		}
    }
    _siftup(pos) {
        const len     = this.arr.length;
        const start   = pos;
        const newItem = this.arr[pos];
        let childPos = 2 * pos + 1;
        while (childPos < len) {
            var rightPos = childPos + 1;
            if (rightPos < len && this.cmp(this.arr[childPos], this.arr[rightPos]) >= 0)
                childPos = rightPos;
            this._aSet(pos,this.arr[childPos]);
            pos = childPos;
            childPos = 2 * pos + 1;
        }
        this._aSet(pos,newItem);
        this._siftdown(start, pos);
    }
};
module.exports = BinHeapStorage;

/*
const storage = new BinHeapStorage();
for(let i=0; i<100; i++){
	storage.push({
		id: i,
		priority: Math.round(Math.random()*10),
	});
}
const table = [];
for(let i=0; i<100; i++){
	const item = storage.shift();
	table.push({priority:item.priority, id: item.id});
}
console.table(table);
*/
