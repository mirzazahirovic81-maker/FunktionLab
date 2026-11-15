
const tools=[{"id":"savings","name":"Hitta energibesparingar","category":"Energi & fastighet","description":"Upptäck onödig energianvändning, se när den uppstår och hitta möjligheter att spara energi.","icon":"activity","keywords":"energibesparing energi kwh baslast dygnsprofil veckoprofil drifttid natt helg avvikelser kostnad excel csv  äldreboende vårdboende skola förskola bostad kontor nattförbrukning helgförbrukning drifttider baslast energislöseri analysera mätvärden"},{"id":"period","name":"Jämför energianvändning","category":"Energi & fastighet","description":"Jämför energianvändningen mellan olika år och se trender, månadsskillnader och förändringar i tydliga diagram.","icon":"chart","keywords":"jämför två dataperioder energianvändning referensår år månad excel csv stapeldiagram procent förändring pdf png  jämföra år förbrukning förändring månadskostnad energistatistik trend"},{"id":"anomaly","name":"Hitta avvikelser i min data","category":"Produktivitet","description":"Upptäck ovanliga värden och avvikelser i dina data och se var de finns så att du snabbt kan undersöka dem.","icon":"activity","keywords":"avvikelse avvikande data excel rad cell statistik gränsvärde analys csv  hitta fel upptäcka orimliga värden extremvärde outlier datakvalitet kontrollera datamängd"},{"id":"chart","name":"Visualisera min data","category":"Produktivitet","description":"Förvandla dina data till tydliga diagram, upptäck mönster och skapa visuella underlag att dela.","icon":"chart","keywords":"diagram graf visualisering excel xlsx csv statistik data stapeldiagram linjediagram cirkeldiagram presentation png svg  presentera siffror skapa grafer datavisualisering beslutsunderlag statistik"},{"id":"peak","name":"Hitta toppeffekter","category":"Energi & fastighet","description":"Upptäck när effektuttaget är som högst och se vilka toppar som kan påverka dina kostnader.","icon":"activity","keywords":"toppeffekt effekttopp maxeffekt effektuttag el energi kW kWh kvart timme mätdata csv excel lastprofil  effekttaxa effektavgift elnätsavgift belastning högsta effekt dyra toppar"},{"id":"invest","name":"Jämför investeringar","category":"Ekonomi","description":"Jämför investeringar och se hur kostnader, lönsamhet och återbetalningstid påverkar ditt val.","icon":"compare","keywords":"investering investeringsunderlag lönsamhet kalkyl ränta nuvärde NPV återbetalningstid livscykelkostnad LCC jämföra alternativ excel csv beslutsunderlag  jämföra offerter köpa eller hyra lönsam investering återbetalning beslutsstöd"},{"id":"scenario","name":"Vad händer om…?","category":"Ekonomi & beslut","description":"Ändra förutsättningar och se direkt hur kostnader, resultat och olika beslut påverkas.","icon":"sliders-horizontal","keywords":"scenario inköp pris volym rabatt kapacitet arbetstid investering återbetalning känslighet beslut ingenjör inköpschef  vad händer om kalkyl simulera alternativ förändrad kostnad påverkan beslut"},{"id":"workflow","name":"Visualisera arbetsflöde","category":"Produktivitet","description":"Skapa tydliga flödesscheman och processkartor som uppdateras direkt när du ändrar steg, beslut eller ansvar.","icon":"git-branch","keywords":"arbetsflöde arbetsprocess processkarta flödesschema beslut ja nej roller png jpg svg export visualisera  processbeskrivning rutin kartlägga arbetsflöden ansvariga organisationsprocess"},{"id":"aterbruk","name":"Återbruksval","category":"Miljö & hållbarhet","description":"Jämför att reparera, återbruka eller köpa nytt och se hur kostnader och klimatpåverkan skiljer sig.","icon":"recycle","keywords":"laga reparera återanvända klimatpåverkan miljö utsläpp nyköp livscykel"},{"id":"forandringar","name":"Vad har förändrats?","category":"Produktivitet","description":"Jämför två textversioner och se direkt vad som har lagts till, tagits bort eller ändrats.","icon":"compare","keywords":"jämför text versioner dokument skillnader ändringar diff belopp datum krav granska"}];
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
    const groups=new Map();
    for(const t of tools){
      const category=t.category==='Ekonomi'?'Ekonomi & beslut':(t.category||'Övrigt');
      if(!groups.has(category))groups.set(category,[]);
      groups.get(category).push(t);
    }
    for(const [category,items] of groups){
      const group=document.createElement('div');
      group.className='fl-tool-group';
      const heading=document.createElement('div');
      heading.className='fl-tool-group-title';
      const name=document.createElement('span');name.textContent=category;
      const count=document.createElement('span');count.className='fl-tool-group-count';count.textContent=String(items.length);
      heading.append(name,count);
      const links=document.createElement('div');links.className='fl-tool-group-items';
      for(const t of items){
        const a=document.createElement('a');
        a.className='nav-btn';a.dataset.go=t.id;a.href='#'+t.id;
        const icon=document.createElement('span');icon.className='nav-tool-icon';icon.setAttribute('aria-hidden','true');
        const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','fl-line-icon');
        const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#fl-icon-'+t.icon);
        svg.appendChild(use);icon.appendChild(svg);
        const label=document.createElement('span');label.className='nav-tool-text';label.textContent=t.name;
        const arrow=document.createElement('span');arrow.className='nav-tool-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='›';
        a.append(icon,label,arrow);links.appendChild(a);
      }
      group.append(heading,links);nav.appendChild(group);
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
// Egna, enhetliga linjeikoner för Verktygslådans kort. Övriga ikoner påverkas inte.
const flCatalogIconPaths={
  savings:'<path d="M4 18h16M6 15V9m4 6V5m4 10v-4m4 4V7"/><path d="m5 7 4-3 5 4 5-5"/>',
  period:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 15l4-4 3 2 4-5M7 17h11"/>',
  anomaly:'<path d="M3 12h4l3-7 4 14 3-7h4"/><circle cx="18" cy="5" r="2"/>',
  chart:'<path d="M4 20V5m0 15h16"/><rect x="7" y="12" width="3" height="5" rx=".7"/><rect x="12" y="8" width="3" height="9" rx=".7"/><rect x="17" y="5" width="3" height="12" rx=".7"/>',
  peak:'<path d="M3 19h18M5 15l4-4 3 2 6-8"/><path d="M14 5h4v4"/><path d="M5 18v-3m5 3v-4m5 4v-7m5 7V8"/>',
  invest:'<rect x="3" y="5" width="8" height="14" rx="2"/><rect x="13" y="5" width="8" height="14" rx="2"/><path d="m6 13 2-3 1 2m7 1 2-3m-2 7h3"/>',
  scenario:'<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="11" cy="17" r="2" fill="white"/>',
  workflow:'<rect x="3" y="3" width="7" height="6" rx="1.5"/><rect x="14" y="15" width="7" height="6" rx="1.5"/><path d="M6.5 9v5h11v1M17.5 15V9M14 9h7"/>',
  aterbruk:'<path d="m8 4 2-2 3 5-2 2M8 4H5l-3 5 3 2M3 15l-1 3 6 3 2-3M13 21h5l4-6-3-2M20 10l2-2-4-5-3 2"/>',
  forandringar:'<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/><path d="M6 9h2m-2 4h2m8-4h2m-2 4h2m-2 4h2"/>'
};
const flCatalogIcon=id=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${flCatalogIconPaths[id]||flCatalogIconPaths.chart}</svg>`;

const $=id=>document.getElementById(id);
let activeFilter='Alla';
const routes=new Set(['hem','verktyg','om','forslag','kategori',...tools.map(t=>t.id)]);
function render(){
  document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('selected',b.dataset.filter===activeFilter));
  const q=($('search')?.value||'').toLocaleLowerCase('sv-SE').trim();
  const found=tools.filter(t=>(activeFilter==='Alla'||t.category===activeFilter||(activeFilter==='Ekonomi & beslut'&&t.category==='Ekonomi'))&&[t.name,t.category,t.description,t.keywords].join(' ').toLocaleLowerCase('sv-SE').includes(q));
  $('catalog-results').innerHTML=found.map(t=>`<article class="tool-card"><div class="tool-icon">${flCatalogIcon(t.id)}</div><h3>${t.name}</h3><p>${t.description}</p><div class="card-foot"><a class="open-tool" data-go="${t.id}" href="#${t.id}">Öppna ↗</a></div></article>`).join('')||'<div class="empty">Inga publicerade verktyg matchar urvalet ännu. Föreslå gärna en funktion som saknas.</div>';
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
  if(view==='verktyg'){activeFilter='Alla';$('catalog-title').textContent='Utforska verktygslådan';$('search').value='';render()}
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

/* FunktionLab: gemensam lokal Excel-export, utan logotyp eller reklam. */
(function(){
function xml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
function crc32(bytes){let c=-1;for(let b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^-1)>>>0}
function zipStore(files){const enc=new TextEncoder(),chunks=[],central=[];let pos=0;const u16=n=>[n&255,(n>>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];for(const [name,data] of files){const nm=enc.encode(name),bytes=enc.encode(data),crc=crc32(bytes),head=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(bytes.length),...u32(bytes.length),...u16(nm.length),...u16(0),...nm]);chunks.push(head,bytes);central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(bytes.length),...u32(bytes.length),...u16(nm.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(pos),...nm]));pos+=head.length+bytes.length}const cdSize=central.reduce((s,x)=>s+x.length,0),end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(cdSize),...u32(pos),...u16(0)]);return new Blob([...chunks,...central,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
function worksheet(rows){let out='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="16"/><cols><col min="1" max="1" width="31" customWidth="1"/><col min="2" max="2" width="34" customWidth="1"/><col min="3" max="6" width="40" customWidth="1"/></cols><sheetData>';for(let i=0;i<rows.length;i++){out+='<row r="'+(i+1)+'">';for(let j=0;j<rows[i].length;j++){const val=rows[i][j];if(val===null||val===undefined||val==='')continue;let n=j+1,col='';while(n){n--;col=String.fromCharCode(65+n%26)+col;n=Math.floor(n/26)}const ref=col+(i+1);if(typeof val==='number'&&Number.isFinite(val))out+='<c r="'+ref+'"><v>'+val+'</v></c>';else out+='<c r="'+ref+'" t="inlineStr"><is><t>'+xml(val)+'</t></is></c>'}out+='</row>'}return out+'</sheetData></worksheet>'}

window.flExportWorkbook=function(tabs,name){const files=[['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+tabs.map((_,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')+'</Types>'],['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+tabs.map((t,i)=>'<sheet name="'+xml(t[0])+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join('')+'</sheets></workbook>'],['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+tabs.map((_,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join('')+'</Relationships>'],...tabs.map((t,i)=>['xl/worksheets/sheet'+(i+1)+'.xml',worksheet(t[1])])];const blob=zipStore(files),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name+'.xlsx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500)};
})();

document.addEventListener('click',function(event){const b=event.target.closest('.fl-common-excel');if(!b)return;const scope=b.closest('.tool-view'),table=scope?.querySelector(b.dataset.exportTable);if(!table){alert('Gör analysen först så att det finns ett resultat att exportera.');return}const rows=[...table.querySelectorAll('tr')].map(tr=>[...tr.querySelectorAll('th,td')].map(td=>td.textContent.trim())).filter(r=>r.length);if(rows.length<2){alert('Gör analysen först så att det finns ett resultat att exportera.');return}window.flExportWorkbook([['Resultat',rows]],b.dataset.exportName||'analys')});
