const Queue = require('./index.js');

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

	await new Promise(resolve=>setTimeout(resolve, 1000));
	

	queue.push();queue.push();queue.push();
	const p0 = queue.push(30).then(()=>log('cb1')).then(()=>log('cb2'));
	log('remain1', p0.remain());

	await new Promise(resolve=>setTimeout(resolve, 10));
	log('remain2', p0.remain());
	
	queue.push(10,  ()=>log('prior10'));
	queue.push(100, ()=>log('prior100'));
	
	log('remain3', p0.remain());
	
	await queue.tillEnd();
	log('remain4', p0.remain());
	log('end');	
	log(Math.round(queue.usage() * 100), '%');	
})()	