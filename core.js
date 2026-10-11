
const tools=[{id:'report',name:'Skapa snygg rapport',category:'Produktivitet',description:'Förvandla Excel eller CSV till en professionell rapport med diagram, nyckeltal och tabell. Exportera som PDF eller PNG.',icon:'chart',keywords:'rapport excel csv diagram pdf bild png export sammanfattning data'}, {id:'savings',name:'Hitta besparingsmöjligheter',category:'Energi & fastighet',description:'Ladda upp energidata, ange energipris och hitta möjliga besparingar vid natt- och helgförbrukning samt höga förbrukningsnivåer.',icon:'activity',keywords:'besparing energianvändning natt helg baslast kostnad timdata excel csv kwh'},{id:'period',name:'Jämför energianvändning',category:'Energi & fastighet',description:'Jämför årets energianvändning med föregående år eller ett valfritt referensår. Ladda upp Excel/CSV och se diagram, månadsvisa differenser och helårsskillnad i kWh och procent.',icon:'chart',keywords:'jämför två dataperioder energianvändning referensår år månad excel csv stapeldiagram procent förändring pdf png'},{id:'anomaly',name:'Hitta avvikelser i min data',category:'Produktivitet',description:'Hitta ovanliga värden och se exakt rad, cell och orsak i Excel eller CSV.',icon:'activity',keywords:'avvikelse avvikande data excel rad cell statistik gränsvärde analys csv'},{id:'time',name:'Vad kostar min tid?',category:'Produktivitet',description:'Räkna ut tidsåtgång, möjlig tidsbesparing, frigjorda arbetsdagar och tidsvärde.',icon:'calculator',keywords:'tid tidsbesparing effektivisering produktivitet automatisering timkostnad arbetsdagar minuter procent'},{id:'chart',name:'Visualisera min data',category:'Produktivitet',description:'Gör din data begriplig med automatiska insikter, snygga diagram och presentationsklara bilder.',icon:'chart',keywords:'diagram graf visualisering excel xlsx csv statistik data stapeldiagram linjediagram cirkeldiagram presentation png svg'},{id:'peak',name:'Hitta toppeffekter',category:'Energi & fastighet',description:'Ladda upp tidsserier och hitta effekttoppar, tidpunkter och möjliga kostnader.',icon:'activity',keywords:'toppeffekt effekttopp maxeffekt effektuttag el energi kW kWh kvart timme mätdata csv excel lastprofil effekttariff'},{id:'invest',name:'Jämför investeringar',category:'Ekonomi',description:'Jämför flera investeringar med nettonuvärde, återbetalningstid, LCC och känslighetsanalys.',icon:'compare',keywords:'investering investeringsunderlag lönsamhet kalkyl ränta nuvärde NPV återbetalningstid livscykelkostnad LCC jämföra alternativ excel csv beslutsunderlag'},{id:'procent',name:'Procent- och förändringskalkylator',category:'Ekonomi',description:'Beräkna procentuell förändring, procent av ett tal och räkna baklänges.',icon:'percent',keywords:'procent procentuell ökning minskning förändring skillnad andel baklänges ekonomi'},{id:'kalkylator',name:'Driftkostnadskalkylator',category:'Energi & fastighet',description:'Beräkna energikostnad och möjlig besparing när drifttiden minskar.',icon:'calculator',keywords:'el drift kwh energi besparing kostnad effekt fastighet'}];
// Håll båda räknarna på startsidan synkroniserade med den faktiska verktygslistan.
for (const id of ['fl-published-hero', 'fl-published-stat']) {
  const counter = document.getElementById(id);
  if (counter) counter.textContent = String(tools.length).padStart(2, '0');
}
const flIcon=name=>`<svg class="fl-line-icon" aria-hidden="true"><use href="#fl-icon-${name}"/></svg>`;const $=id=>document.getElementById(id);let activeFilter='Alla',favorites=new Set();try{favorites=new Set(JSON.parse(localStorage.getItem('fl-favorites')||'[]'))}catch(e){}function show(view){
const home=['hem','forslag','om'].includes(view);
$('home-view').style.display=home?'block':'none';
$('catalog-view').classList.toggle('visible',['verktyg','favoriter','kategori'].includes(view));
$('report-view').classList.toggle('visible',view==='report');$('savings-view').classList.toggle('visible',view==='savings');$('period-view').classList.toggle('visible',view==='period');$('anomaly-view').classList.toggle('visible',view==='anomaly');$('calc-view').classList.toggle('visible',view==='kalkylator');$('procent-view').classList.toggle('visible',view==='procent');$('invest-view').classList.toggle('visible',view==='invest');$('peak-view').classList.toggle('visible',view==='peak');if($('sync-view'))$('sync-view').classList.toggle('visible',view==='sync');$('chart-view').classList.toggle('visible',view==='chart');$('time-view').classList.toggle('visible',view==='time');
if(view==='verktyg'){activeFilter='Alla';$('catalog-title').textContent='Alla funktioner';$('search').value='';render()}
if(view==='favoriter'){$('catalog-title').textContent='Alla funktioner';activeFilter='Alla';$('search').value='';render()}
if(view==='kategori')render();
document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.go===view||(view==='kategori'&&b.dataset.cat===activeFilter)));
$('sidebar').classList.remove('open');$('overlay').classList.remove('on');if($('mobile-nav-toggle'))$('mobile-nav-toggle').checked=false;$('menu').setAttribute('aria-expanded','false');
if(view==='time')timeFavoriteLabel();if(view==='kalkylator')updateFavorite();if(view==='procent')updatePercentFavorite();if(view==='invest')invFavoriteLabel();if(view==='peak')peakFavoriteLabel();
if(view==='forslag'||view==='om'){requestAnimationFrame(()=>$(view==='forslag'?'request-section':'about-section').scrollIntoView({behavior:'smooth',block:'start'}))}else window.scrollTo(0,0);
}
function render(onlyFav=false){document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('selected',b.dataset.filter===activeFilter));const q=$('search').value.toLocaleLowerCase('sv-SE').trim();const found=tools.filter(t=>(activeFilter==='Alla'||t.category===activeFilter)&&(!onlyFav||favorites.has(t.id))&&[t.name,t.category,t.description,t.keywords].join(' ').toLocaleLowerCase('sv-SE').includes(q));$('catalog-results').innerHTML=found.map(t=>`<article class="tool-card"><div class="tool-icon">${flIcon(t.icon)}</div><h3>${t.name}</h3><p>${t.description}</p><div class="card-foot"><span class="tag">● Gratis</span><a class="open-tool" type="button" data-go="${t.id}" href="#${t.id}">Öppna ↗</a></div></article>`).join('')||'<div class="empty">Inga publicerade verktyg matchar urvalet ännu. Föreslå gärna en funktion som saknas.</div>'}
document.addEventListener('click',e=>{const go=e.target.closest('[data-go]');if(go){if($('mobile-nav-toggle'))$('mobile-nav-toggle').checked=false;e.preventDefault();history.pushState(null,'','#'+go.dataset.go);show(go.dataset.go);return}const cat=e.target.closest('[data-cat]');if(cat){e.preventDefault();if($('mobile-nav-toggle'))$('mobile-nav-toggle').checked=false;activeFilter=cat.dataset.cat;$('catalog-title').textContent=activeFilter;$('search').value='';history.pushState(null,'','#kategori');show('kategori');return}const filter=e.target.closest('[data-filter]');if(filter){activeFilter=filter.dataset.filter;render()}});$('search').addEventListener('input',()=>render($('catalog-title').textContent==='Mina favoriter'));$('menu').addEventListener('click',()=>{$('sidebar').classList.toggle('open');$('overlay').classList.toggle('on');$('menu').setAttribute('aria-expanded',$('sidebar').classList.contains('open'))});$('overlay').addEventListener('click',()=>{$('sidebar').classList.remove('open');$('overlay').classList.remove('on');$('menu').setAttribute('aria-expanded','false');if($('mobile-nav-toggle'))$('mobile-nav-toggle').checked=false});$('year').textContent=new Date().getFullYear();function updateFavorite(){$('favorite-btn').textContent=favorites.has('kalkylator')?'♥ Sparad favorit':'♡ Spara favorit'}$('favorite-btn').addEventListener('click',()=>{favorites.has('kalkylator')?favorites.delete('kalkylator'):favorites.add('kalkylator');try{localStorage.setItem('fl-favorites',JSON.stringify([...favorites]))}catch(e){}updateFavorite()});
const ids=['power','hours','days','price','reduce'];const fmt=n=>new Intl.NumberFormat('sv-SE',{maximumFractionDigits:1}).format(n);function calc(){const v=ids.map(id=>Number($(id).value));const [p,h,d,price,r]=v;const invalid=ids.some(id=>$(id).value.trim()==='')||v.some(n=>!Number.isFinite(n)||n<0)||h>24||d>365||r>h;$('calc-error').textContent=invalid?'Kontrollera värdena. Minskad drifttid får inte överstiga nuvarande drifttid.':'';if(invalid){['savings','energy','cost','savedenergy','after','percent'].forEach(id=>$(id).textContent='–');return}const energy=p*h*d,saved=p*r*d;$('savings').textContent=fmt(saved*price)+' kr';$('energy').textContent=fmt(energy)+' kWh';$('cost').textContent=fmt(energy*price)+' kr';$('savedenergy').textContent=fmt(saved)+' kWh';$('after').textContent=fmt((energy-saved)*price)+' kr';$('percent').textContent=fmt(h?100*r/h:0)+' %'}ids.forEach(id=>$(id).addEventListener('input',calc));$('reset').addEventListener('click',()=>{[5,12,250,1.5,3].forEach((v,i)=>$(ids[i]).value=v);calc()});calc();

const percentModes={
change:{title:'Procentuell förändring',help:'Hur mycket har ett värde ökat eller minskat i procent?',a:'Ursprungligt värde',b:'Nytt värde',values:['1200','1500'],result:'Procentuell förändring',detail:'Skillnad i värde'},
part:{title:'Procent av ett tal',help:'Vad är exempelvis 25 % av 800?',a:'Procent (%)',b:'Tal',values:['25','800'],result:'Resultat',detail:'Andel av talet'},
share:{title:'Hur många procent?',help:'Hur stor procentandel utgör en del av helheten?',a:'Del',b:'Helhet',values:['30','120'],result:'Andel i procent',detail:'Återstående del'},
reverse:{title:'Räkna baklänges',help:'Vad var ursprungsvärdet före en procentuell ökning eller minskning?',a:'Nytt värde',b:'Förändring (%) – använd minus vid minskning',values:['1250','25'],result:'Ursprungligt värde',detail:'Förändring i värde'}
};
let percentMode='change',percentLastResult='';
const percentFormat=n=>new Intl.NumberFormat('sv-SE',{maximumFractionDigits:4}).format(n);
function updatePercentFavorite(){$('percent-favorite-btn').textContent=favorites.has('procent')?'♥ Sparad favorit':'♡ Spara favorit'}
$('percent-favorite-btn').addEventListener('click',()=>{favorites.has('procent')?favorites.delete('procent'):favorites.add('procent');try{localStorage.setItem('fl-favorites',JSON.stringify([...favorites]))}catch(e){}updatePercentFavorite()});
function percentCalc(){
 const mode=percentModes[percentMode],av=$('percent-a').value,bv=$('percent-b').value;
 const a=Number(av),b=Number(bv),valid=av.trim()!==''&&bv.trim()!==''&&Number.isFinite(a)&&Number.isFinite(b);
 let result,detail,explain='',error='';
 if(!valid){error='Fyll i båda fälten med giltiga tal.'}
 else if(percentMode==='change'){
  if(a===0)error='Ursprungsvärdet måste vara skilt från noll.';
  else{result=(b-a)/Math.abs(a)*100;detail=b-a;explain='Förändringen beräknas som (nytt värde − ursprungligt värde) / |ursprungligt värde| × 100.'}
 }else if(percentMode==='part'){result=a/100*b;detail=result;explain='Procentvärdet multipliceras med talet och divideras med 100.'}
 else if(percentMode==='share'){
  if(b===0)error='Helheten måste vara skild från noll.';
  else{result=a/b*100;detail=b-a;explain='Delen divideras med helheten och multipliceras med 100.'}
 }else{
  if(b===-100)error='En minskning med 100 % kan inte räknas baklänges till ett entydigt ursprungsvärde.';
  else{result=a/(1+b/100);detail=a-result;explain='Ursprungsvärdet beräknas som nytt värde / (1 + förändring / 100).'}
 }
 $('percent-error').textContent=error;
 $('percent-result').textContent=error?'–':(percentMode==='change'&&result>0?'+':'')+percentFormat(result)+(percentMode==='change'||percentMode==='share'?' %':'');
 $('percent-detail').textContent=error?'–':percentFormat(detail);
 $('percent-explanation').textContent=error?'Ange giltiga värden för att se resultatet.':explain;
 percentLastResult=error?'':$('percent-result').textContent;
 $('percent-copy-status').textContent='';
}
function setPercentMode(mode){
 percentMode=mode;const d=percentModes[mode];
 $('percent-mode-title').textContent=d.title;$('percent-mode-help').textContent=d.help;
 $('percent-label-a').textContent=d.a;$('percent-label-b').textContent=d.b;
 $('percent-result-label').textContent=d.result;$('percent-detail-label').textContent=d.detail;
 $('percent-a').value=d.values[0];$('percent-b').value=d.values[1];
 document.querySelectorAll('[data-percent-mode]').forEach(el=>{const on=el.dataset.percentMode===mode;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on))});
 percentCalc();
}
document.querySelectorAll('[data-percent-mode]').forEach(el=>el.addEventListener('click',()=>setPercentMode(el.dataset.percentMode)));
['percent-a','percent-b'].forEach(id=>$(id).addEventListener('input',percentCalc));
$('percent-reset').addEventListener('click',()=>setPercentMode(percentMode));
$('percent-copy').addEventListener('click',async()=>{if(!percentLastResult)return;try{await navigator.clipboard.writeText(percentLastResult);$('percent-copy-status').textContent='Kopierat!'}catch(e){$('percent-copy-status').textContent='Kunde inte kopiera automatiskt.'}});
setPercentMode('change');

function routeHash(){let route=decodeURIComponent(location.hash.slice(1));route=({'catalog-view':'verktyg','calc-view':'kalkylator','request-section':'forslag','about-section':'om'})[route]||route;if(['hem','verktyg','kalkylator','procent','invest','peak','chart','period','anomaly','report','time','om','forslag','favoriter','kategori'].includes(route))show(route)}
window.addEventListener('hashchange',routeHash);window.addEventListener('popstate',routeHash);if(location.hash)routeHash();else show('hem');
