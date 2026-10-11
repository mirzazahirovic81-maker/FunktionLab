
(function(){
const el=id=>document.getElementById(id), ids=['time-minutes','time-frequency','time-weeks','time-hourly','time-save'];
const fmt=(n,d=1)=>new Intl.NumberFormat('sv-SE',{maximumFractionDigits:d}).format(n);
let last='';
function calculate(){
 const values=ids.map(id=>el(id).value.trim()===''?NaN:Number(el(id).value));
 const [minutes,frequency,weeks,hourly,saving]=values;
 const mode=el('time-mode').value;
 const invalid=values.some(v=>!Number.isFinite(v)||v<0)||weeks>52||(mode==='minutes'&&saving>minutes)||(mode==='percent'&&saving>100);
 el('time-error').textContent=invalid?'Ange giltiga värden. Besparingen kan inte överstiga den ursprungliga tiden och antalet veckor får vara högst 52.':'';
 ['time-current','time-saved','time-days','time-money','time-after','time-weekly'].forEach(id=>{if(invalid)el(id).textContent='–'});
 if(invalid){el('time-equivalent').textContent='';el('time-summary').textContent='–';el('time-bar').style.width='0%';last='';return}
 const savedPer=mode==='minutes'?saving:minutes*saving/100;
 const pct=minutes?100*savedPer/minutes:0;
 const current=minutes*frequency*weeks/60,saved=savedPer*frequency*weeks/60,after=current-saved;
 el('time-current').textContent=fmt(current)+' tim';el('time-saved').textContent=fmt(saved)+' tim';
 el('time-days').textContent=fmt(saved/8)+' dagar';el('time-money').textContent=fmt(saved*hourly,0)+' kr';
 el('time-after').textContent=fmt(after)+' tim';el('time-weekly').textContent=fmt(savedPer*frequency/60)+' tim';
 el('time-equivalent').textContent=mode==='minutes'?'Motsvarar '+fmt(pct)+' % av tiden per tillfälle.':'Motsvarar '+fmt(savedPer)+' minuter per tillfälle.';
 el('time-summary').textContent=fmt(pct)+' % av den nuvarande tiden kan frigöras.';
 el('time-bar').style.width=pct+'%';
 const task=el('time-task').value.trim()||'Återkommande uppgift';
 last=task+'\nNuvarande tid: '+fmt(current)+' timmar/år\nMöjlig besparing: '+fmt(saved)+' timmar/år ('+fmt(pct)+' %)\nFrigjorda arbetsdagar: '+fmt(saved/8)+'\nTid efter förbättring: '+fmt(after)+' timmar/år\nUppskattat tidsvärde: '+fmt(saved*hourly,0)+' kr/år (vid '+fmt(hourly,0)+' kr/tim).';
}
ids.forEach(id=>el(id).addEventListener('input',calculate));el('time-task').addEventListener('input',calculate);
el('time-mode').addEventListener('change',()=>{const mode=el('time-mode').value;el('time-save-label').textContent=mode==='minutes'?'Minuter som sparas per tillfälle':'Tidsbesparing (%)';el('time-save').value=mode==='minutes'?'10':'66.7';calculate()});
el('time-reset').addEventListener('click',()=>{el('time-task').value='';['15','5','46','350','10'].forEach((v,i)=>el(ids[i]).value=v);el('time-mode').value='minutes';el('time-save-label').textContent='Minuter som sparas per tillfälle';calculate()});
el('time-copy').addEventListener('click',async()=>{if(!last)return;try{await navigator.clipboard.writeText(last);el('time-copy-status').textContent='Resultatet har kopierats.'}catch(e){el('time-copy-status').textContent='Kunde inte kopiera automatiskt i den här webbläsaren.'}});
window.timeFavoriteLabel=function(){el('time-favorite').textContent=favorites.has('time')?'♥ Sparad favorit':'♡ Spara favorit'};
el('time-favorite').addEventListener('click',()=>{favorites.has('time')?favorites.delete('time'):favorites.add('time');try{localStorage.setItem('fl-favorites',JSON.stringify([...favorites]))}catch(e){}timeFavoriteLabel()});
calculate();
})();
