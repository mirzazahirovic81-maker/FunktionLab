
(function(){
'use strict';
const get=id=>document.getElementById(id), graphic=get('flchart-graphic'),preview=get('flpres-preview');
if(!graphic||!preview)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{let x=String(v??'').trim().replace(/\s/g,'');if(x.includes(',')&&x.includes('.'))x=x.replace(/\./g,'').replace(',','.');else x=x.replace(',','.');return Number(x)};
const fmt=n=>Number(n).toLocaleString('sv-SE',{maximumFractionDigits:1});
let slide='';
function insight(){
 const text=get('flchart-insights')?.innerText||'';
 const cards=get('flchart-insights')?.querySelectorAll('.flchart-insight-card')||[];
 const name=get('flchart-series')?.selectedOptions?.[0]?.textContent?.trim()||'Den valda serien';
 const lines=[...get('flchart-insights')?.querySelectorAll('li')||[]].map(n=>n.textContent);
 return {name,text,lines,highest:cards[0]?.querySelector('strong')?.textContent||'',highAt:cards[0]?.querySelector('span')?.textContent||'',lowest:cards[1]?.querySelector('strong')?.textContent||'',lowAt:cards[1]?.querySelector('span')?.textContent||''};
}
function suggest(){
 const i=insight(),x=get('flchart-x'),s=get('flchart-series');
 const headline=get('flpres-headline'),conclusion=get('flpres-conclusion');
 let message=`${i.name}: sammanfattning av inlästa värden`;
 let detail=i.lines[0]||'Välj en numerisk serie för att visa resultatet.';
 const chart=get('flchart-graphic')?.querySelector('svg');
 if(chart){
  const series= s?.selectedOptions?.[0]?.textContent?.trim()||i.name;
  const raw=get('flchart-paste')?.value||'';
  const changeLine=i.lines.find(t=>t.includes('Förändring från första'))||'';
  const match=changeLine.match(/Förändring från första till sista mätpunkten:\s*([+−\-]?[0-9\s,.]+)(?:\s*\(([+\-−]?[0-9\s,.]+)\s*%\))?/);
  if(match){
   const delta=num(match[1].replace('−','-'));
   if(Number.isFinite(delta)){
    message=delta>0?`${series} ökar under den valda perioden`:delta<0?`${series} minskar under den valda perioden`:`${series} är oförändrad mellan första och sista mätpunkten`;
    detail=`Förändringen mellan första och sista mätpunkten är ${delta>0?'+':''}${fmt(delta)}${match[2]?` (${match[2].trim()} %)`:''}. ${i.lines[0]||''}`;
   }
  }
 }
 headline.value=message;conclusion.value=detail;render();
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function render(){
 const source=get('flpres-source').value.trim()||'Ej angiven';
 const title=get('flpres-headline').value.trim()||get('flchart-title').value.trim()||'Din data i fokus';
 const conclusion=get('flpres-conclusion').value.trim()||'Välj Föreslå budskap eller skriv din egen slutsats.';
 const style=get('flpres-style').value;
 const schemes={dark:{bg:'#0e2239',fg:'#ffffff',sub:'#bdd1e0',panel:'#19354e',accent:'#5fe1c0'},light:{bg:'#ffffff',fg:'#132943',sub:'#5c6d81',panel:'#edf4f8',accent:'#118e9a'},mint:{bg:'#e9f9f5',fg:'#113a3a',sub:'#416966',panel:'#d3eee7',accent:'#0a8079'}};
 const c=schemes[style]||schemes.dark;
 const chart=graphic.querySelector('svg');
 const serial=new XMLSerializer();
 let chartMarkup='';
 if(chart){
   const copy=chart.cloneNode(true);
   copy.removeAttribute('width');copy.removeAttribute('height');
   copy.setAttribute('x','54');copy.setAttribute('y','190');copy.setAttribute('width','1170');copy.setAttribute('height','380');
   copy.setAttribute('preserveAspectRatio','xMidYMid meet');
   // Reuse existing chart without regenerating its data or altering its calculation.
   chartMarkup=serial.serializeToString(copy).replace(/<svg(?=\s)/,'<svg');
 }
 const line=(str,max=78)=>{const words=String(str).split(/\s+/);let out=[],cur='';for(const word of words){if((cur+' '+word).trim().length>max&&cur){out.push(cur);cur=word}else cur=(cur+' '+word).trim()}if(cur)out.push(cur);return out.slice(0,3)};
 const titleLines=line(title,55),noteLines=line(conclusion,115);
 const t=titleLines.slice(0,2).map((v,i)=>`<text x="54" y="${95+i*38}" font-size="30" font-weight="700" fill="${c.fg}">${esc(v)}</text>`).join('');
 const note=noteLines.slice(0,2).map((v,i)=>`<text x="78" y="${638+i*22}" font-size="16" fill="${c.fg}">${esc(v)}</text>`).join('');
 const i=insight(),highlight=get('flpres-highlight').value;
 const flag=highlight==='max'?`Högsta: ${i.highest} (${i.highAt})`:highlight==='min'?`Lägsta: ${i.lowest} (${i.lowAt})`:'';
 slide=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
 <rect width="1280" height="720" fill="${c.bg}"/>
 <text x="54" y="39" fill="${c.accent}" font-size="16" font-family="Arial,sans-serif" font-weight="700" letter-spacing="2">FUNKTIONLAB · DATAINSIKT</text>
 <g font-family="Arial,sans-serif">${t}</g>
 <rect x="40" y="178" width="1200" height="413" rx="15" fill="#fff"/>
 ${chartMarkup}
 ${flag?`<rect x="868" y="179" width="345" height="38" rx="9" fill="${c.accent}"/><text x="881" y="204" font-family="Arial,sans-serif" font-size="17" fill="#102238">${esc(flag.slice(0,42))}</text>`:''}
 <rect x="54" y="605" width="1172" height="80" rx="12" fill="${c.panel}"/>
 <g font-family="Arial,sans-serif">${note}</g>
 <text x="54" y="707" fill="${c.sub}" font-family="Arial,sans-serif" font-size="13">${esc(('Källa: '+source).slice(0,115))}</text>
 </svg>`;
 preview.innerHTML=slide;
 get('flpres-status').textContent=chart?'Förhandsgranskningen är uppdaterad. Kontrollera rubrik, slutsats och källa före export.':'Börja med att läsa in data och skapa ett diagram. Du kan sedan exportera presentationsbilden.';
}
get('flpres-suggest').addEventListener('click',suggest);
get('flpres-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText([get('flpres-headline').value,get('flpres-conclusion').value,'Källa: '+get('flpres-source').value].join('\n'));get('flpres-status').textContent='Budskapet kopierat.'}catch(e){get('flpres-status').textContent='Kunde inte kopiera. Markera texten manuellt.'}});
['flpres-headline','flpres-conclusion','flpres-source','flpres-style','flpres-highlight'].forEach(id=>get(id).addEventListener('input',render));
get('flpres-svg').addEventListener('click',()=>{if(!graphic.querySelector('svg')){get('flpres-status').textContent='Skapa först ett diagram.';return;}render();download(new Blob([slide],{type:'image/svg+xml;charset=utf-8'}),'funktionlab_presentation.svg')});
get('flpres-png').addEventListener('click',()=>{if(!graphic.querySelector('svg')){get('flpres-status').textContent='Skapa först ett diagram.';return;}render();const img=new Image(),url=URL.createObjectURL(new Blob([slide],{type:'image/svg+xml;charset=utf-8'}));img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=2560;canvas.height=1440;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,2560,1440);canvas.toBlob(b=>{if(b)download(b,'funktionlab_presentation.png');URL.revokeObjectURL(url)},'image/png')};img.onerror=()=>{URL.revokeObjectURL(url);get('flpres-status').textContent='PNG-export misslyckades. Prova SVG.'};img.src=url});
new MutationObserver(render).observe(graphic,{childList:true});
setTimeout(()=>{suggest();render()},50);
})();
