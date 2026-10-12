
const tools=[{id:'report',name:'Skapa snygg rapport',category:'Produktivitet',description:'Förvandla Excel eller CSV till en professionell rapport med diagram, nyckeltal och tabell. Exportera som PDF eller PNG.',icon:'chart',keywords:'rapport excel csv diagram pdf bild png export sammanfattning data'}, {id:'savings',name:'Hitta besparingsmöjligheter',category:'Energi & fastighet',description:'Ladda upp energidata, ange energipris och hitta möjliga besparingar vid natt- och helgförbrukning samt höga förbrukningsnivåer.',icon:'activity',keywords:'besparing energianvändning natt helg baslast kostnad timdata excel csv kwh'},{id:'period',name:'Jämför energianvändning',category:'Energi & fastighet',description:'Jämför årets energianvändning med föregående år eller ett valfritt referensår. Ladda upp Excel/CSV och se diagram, månadsvisa differenser och helårsskillnad i kWh och procent.',icon:'chart',keywords:'jämför två dataperioder energianvändning referensår år månad excel csv stapeldiagram procent förändring pdf png'},{id:'anomaly',name:'Hitta avvikelser i min data',category:'Produktivitet',description:'Hitta ovanliga värden och se exakt rad, cell och orsak i Excel eller CSV.',icon:'activity',keywords:'avvikelse avvikande data excel rad cell statistik gränsvärde analys csv'},{id:'time',name:'Vad kostar min tid?',category:'Produktivitet',description:'Räkna ut tidsåtgång, möjlig tidsbesparing, frigjorda arbetsdagar och tidsvärde.',icon:'calculator',keywords:'tid tidsbesparing effektivisering produktivitet automatisering timkostnad arbetsdagar minuter procent'},{id:'chart',name:'Visualisera min data',category:'Produktivitet',description:'Gör din data begriplig med automatiska insikter, snygga diagram och presentationsklara bilder.',icon:'chart',keywords:'diagram graf visualisering excel xlsx csv statistik data stapeldiagram linjediagram cirkeldiagram presentation png svg'},{id:'peak',name:'Hitta toppeffekter',category:'Energi & fastighet',description:'Ladda upp tidsserier och hitta effekttoppar, tidpunkter och möjliga kostnader.',icon:'activity',keywords:'toppeffekt effekttopp maxeffekt effektuttag el energi kW kWh kvart timme mätdata csv excel lastprofil effekttariff'},{id:'invest',name:'Jämför investeringar',category:'Ekonomi',description:'Jämför flera investeringar med nettonuvärde, återbetalningstid, LCC och känslighetsanalys.',icon:'compare',keywords:'investering investeringsunderlag lönsamhet kalkyl ränta nuvärde NPV återbetalningstid livscykelkostnad LCC jämföra alternativ excel csv beslutsunderlag'},{id:'procent',name:'Procent- och förändringskalkylator',category:'Ekonomi',description:'Beräkna procentuell förändring, procent av ett tal och räkna baklänges.',icon:'percent',keywords:'procent procentuell ökning minskning förändring skillnad andel baklänges ekonomi'},{id:'kalkylator',name:'Driftkostnadskalkylator',category:'Energi & fastighet',description:'Beräkna energikostnad och möjlig besparing när drifttiden minskar.',icon:'calculator',keywords:'el drift kwh energi besparing kostnad effekt fastighet'}];
// Håll båda räknarna på startsidan synkroniserade med den faktiska verktygslistan.
for (const id of ['fl-published-hero', 'fl-published-stat']) {
  const counter = document.getElementById(id);
  if (counter) counter.textContent = String(tools.length).padStart(2, '0');
}
// Skapa meny och räknare direkt från det automatiskt genererade verktygsregistret.
function flBuildNavigation(){
  const sidebar=document.getElementById('sidebar');
  if(!sidebar)return;
  const nav=sidebar.querySelector('nav.tool-nav');
  if(nav){
    nav.replaceChildren();
    for(const t of tools){
      const a=document.createElement('a');
      a.className='nav-btn';
      a.dataset.go=t.id;
      a.href='#'+t.id;
      const icon=document.createElement('span');
      icon.className='nav-tool-icon';
      icon.setAttribute('aria-hidden','true');
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('class','fl-line-icon');
      const use=document.createElementNS('http://www.w3.org/2000/svg','use');
      use.setAttribute('href','#fl-icon-'+t.icon);
      svg.appendChild(use);icon.appendChild(svg);
      const label=document.createElement('span');
      label.className='nav-tool-text';
      label.textContent=t.name;
      const arrow=document.createElement('span');
      arrow.className='nav-tool-arrow';
      arrow.setAttribute('aria-hidden','true');
      arrow.textContent='›';
      a.append(icon,label,arrow);
      nav.appendChild(a);
    }
  }
  const all=sidebar.querySelector('[data-go="verktyg"] .count');
  if(all)all.textContent=String(tools.length);
  for(const cat of sidebar.querySelectorAll('[data-cat]')){
    const badge=cat.querySelector('.count');
    if(badge)badge.textContent=String(tools.filter(t=>(t.category===cat.dataset.cat||(cat.dataset.cat==='Ekonomi & beslut'&&t.category==='Ekonomi'))).length);
  }
  for(const id of ['fl-published-hero','fl-published-stat']){
    const el=document.getElementById(id);
    if(el)el.textContent=String(tools.length).padStart(2,'0');
  }
}
flBuildNavigation();
// P1: Navigation och sökning utan föråldrade kalkylatorer eller favoritlagring.
const flIcon=name=>`<svg class="fl-line-icon" aria-hidden="true"><use href="#fl-icon-${name}"/></svg>`;
const $=id=>document.getElementById(id);
let activeFilter='Alla';
const routes=new Set(['hem','verktyg','om','forslag','kategori',...tools.map(t=>t.id)]);
function render(){
  document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('selected',b.dataset.filter===activeFilter));
  const q=($('search')?.value||'').toLocaleLowerCase('sv-SE').trim();
  const found=tools.filter(t=>(activeFilter==='Alla'||t.category===activeFilter||(activeFilter==='Ekonomi & beslut'&&t.category==='Ekonomi'))&&[t.name,t.category,t.description,t.keywords].join(' ').toLocaleLowerCase('sv-SE').includes(q));
  $('catalog-results').innerHTML=found.map(t=>`<article class="tool-card"><div class="tool-icon">${flIcon(t.icon)}</div><h3>${t.name}</h3><p>${t.description}</p><div class="card-foot"><span class="tag">● Gratis</span><a class="open-tool" data-go="${t.id}" href="#${t.id}">Öppna ↗</a></div></article>`).join('')||'<div class="empty">Inga publicerade verktyg matchar urvalet ännu. Föreslå gärna en funktion som saknas.</div>';
}
function closeMenu(){
  $('sidebar')?.classList.remove('open');$('overlay')?.classList.remove('on');
  $('menu')?.setAttribute('aria-expanded','false');
  const toggle=$('mobile-nav-toggle');if(toggle)toggle.checked=false;
}
function show(view){
  if(!routes.has(view))view='hem';
  const home=['hem','forslag','om'].includes(view);
  $('home-view').style.display=home?'block':'none';
  $('catalog-view').classList.toggle('visible',['verktyg','kategori'].includes(view));
  tools.forEach(t=>$(t.id+'-view')?.classList.toggle('visible',view===t.id));
  if(view==='verktyg'){activeFilter='Alla';$('catalog-title').textContent='Alla funktioner';$('search').value='';render()}
  if(view==='kategori')render();
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.go===view||(view==='kategori'&&b.dataset.cat===activeFilter)));
  closeMenu();
  if(view==='forslag'||view==='om'){
    requestAnimationFrame(()=>$(view==='forslag'?'request-section':'about-section')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }else window.scrollTo(0,0);
}
function routeHash(){
  let route;try{route=decodeURIComponent(location.hash.slice(1))}catch(e){route='hem'}
  route=({'catalog-view':'verktyg','request-section':'forslag','about-section':'om'})[route]||route;
  show(routes.has(route)?route:'hem');
}
document.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]');
  if(go){e.preventDefault();const view=go.dataset.go;history.pushState(null,'','#'+view);show(view);return}
  const cat=e.target.closest('[data-cat]');
  if(cat){e.preventDefault();activeFilter=cat.dataset.cat;$('catalog-title').textContent=activeFilter;$('search').value='';history.pushState(null,'','#kategori');show('kategori');return}
  const filter=e.target.closest('[data-filter]');
  if(filter){activeFilter=filter.dataset.filter;render()}
});
$('search')?.addEventListener('input',render);
$('menu')?.addEventListener('click',()=>{
  const opened=$('sidebar').classList.toggle('open');$('overlay')?.classList.toggle('on',opened);
  $('menu').setAttribute('aria-expanded',String(opened));
});
$('overlay')?.addEventListener('click',closeMenu);
if($('year'))$('year').textContent=new Date().getFullYear();
window.addEventListener('hashchange',routeHash);
window.addEventListener('popstate',routeHash);
routeHash();
