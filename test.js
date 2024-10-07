const Queue   = require('./index.js');
const {sleep} = require('hkey-extended-promise');

let lastTs = Date.now(); 
function log(...args){
	const dt  = (Date.now()-lastTs);
	const len = (''+dt).length;
	let affix = '';
	while(affix.length+len<7){
		affix = ' '+affix;
	}	
	console.log(affix, dt, ...args);
	lastTs = Date.now();
}

(async ()=>{
	const queue = new Queue(30, 50); // OR new Queue(30);
	await sleep(1000);
	
	queue.push();
	queue.push();
	queue.push();
	
	const p0 = queue.push(30).then(()=>log('cb1')).then(()=>log('cb2'));
	log('remain1', p0.remain());

	await sleep(10);
	log('remain2', p0.remain());
	
	queue.push(10).then(()=>log('prior10'));
	queue.push(100).then(()=>log('prior100'));
	
	log('remain3', p0.remain());
	
	const promise2 = queue.push().then(async ()=>{ // OR queue.push().then(someCb);
		await sleep(10);
		log('promise2');
	});
	
	await queue.tillEnd();
	log('remain4', p0.remain());
	log('end');	
	log(Math.round(queue.usage() * 100), '%');	
})();
	