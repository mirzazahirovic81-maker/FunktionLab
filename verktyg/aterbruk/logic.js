(()=>{
const root=document.getElementById('aterbruk-view');
if(!root || root.dataset.abInit)return;
root.dataset.abInit='1';
const $=id=>root.querySelector('#'+id);
const specs=[
 {key:'repair',name:'Reparera befintligt',life:4,price:2200,production:18,transport:350,transportCo2:9,install:450,installCo2:2,energy:150,energyCo2:8,maintenance:250,maintenanceCo2:3,disposal:250,disposalCo2:12,residual:0},
 {key:'reuse',name:'Köpa återbrukat',life:6,price:4800,production:25,transport:650,transportCo2:24,install:400,installCo2:2,energy:120,energyCo2:7,maintenance:180,maintenanceCo2:3,disposal:300,disposalCo2:12,residual:300},
 {key:'new',name:'Köpa nytt',life:10,price:8500,production:190,transport:400,transportCo2:18,install:400,installCo2:2,energy:100,energyCo2:6,maintenance:120,maintenanceCo2:2,disposal:350,disposalCo2:15,residual:500}
];
const fields=[
 ['life','Förväntad livslängd','år',1],['price','Anskaffning / reparation','kr',0],
 ['production','Tillverkning / material','kg CO₂e',0],
 ['transport','Transport och hämtning','kr',0],['transportCo2','Transport och hämtning','kg CO₂e',0],
 ['install','Installation / arbete','kr',0],['installCo2','Installation / arbete','kg CO₂e',0],
 ['energy','Drift / energi / förbrukning','kr/år',0],['energyCo2','Drift / energi / förbrukning','kg CO₂e/år',0],
 ['maintenance','Underhåll / service','kr/år',0],['maintenanceCo2','Underhåll / service','kg CO₂e/år',0],
 ['disposal','Sluthantering / avfall','kr',0],['disposalCo2','Sluthantering / avfall','kg CO₂e',0],
 ['residual','Restvärde vid sluthantering','kr',0]
];
const colors=['#0d9488','#447db2','#8b76b9'];
let data=specs.map(s=>({...s}));let last=[];
const num=v=>{const n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:NaN};
const fmt=(n,d=0)=>Number.isFinite(n)?n.toLocaleString('sv-SE',{maximumFractionDigits:d,minimumFractionDigits:d}):'–';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderInputs(){
 $('ab-alternatives').innerHTML=data.map((a,i)=>`<fieldset class="ab-alt" style="--ab-accent:${colors[i]}"><legend><span class="ab-num">${i+1}</span> ${escape(a.name)}</legend><div class="ab-fields">${fields.map(([key,label,unit,min])=>`<label>${label} <small>(${unit})</small><input type="number" inputmode="decimal" min="${min}" step="${key==='life'?'1':'any'}" data-alt="${i}" data-field="${key}" value="${a[key]}"></label>`).join('')}</div><label class="ab-source">Källa / antagande för klimatdata<input type="text" maxlength="250" data-alt="${i}" data-field="source" value="${escape(a.source||'')}" placeholder="Ex. EPD, leverantörsdata eller egen uppskattning"></label></fieldset>`).join('');
}
function calculate(a,years,rate){
 const events=[];let total=0,carbon=0,cycles=0;
 const discount=(value,t)=>value/Math.pow(1+rate,t);
 for(let t=0;t<years;t+=a.life){
   cycles++;
   const start=a.price+a.transport+a.install;
   const impact=a.production+a.transportCo2+a.installCo2;
   total+=discount(start,t);carbon+=impact;
   events.push({t,type:'anskaffning',cost:start,carbon:impact});
   const end=Math.min(years,t+a.life);
   for(let y=t+1;y<=end;y++){
     const yearly=a.energy+a.maintenance;
     const yearlyCo2=a.energyCo2+a.maintenanceCo2;
     total+=discount(yearly,y);carbon+=yearlyCo2;
     events.push({t:y,type:'drift',cost:yearly,carbon:yearlyCo2});
   }
   total+=discount(a.disposal,end);carbon+=a.disposalCo2;
   events.push({t:end,type:'sluthantering',cost:a.disposal,carbon:a.disposalCo2});
   if(end===years){
     // Restvärde vid horisont, proportionerat efter återstående livslängd.
     const remaining=Math.max(0,(a.life-(years-t))/a.life);
     const credit=a.residual*remaining;
     total-=discount(credit,years);
     events.push({t:years,type:'restvärde',cost:-credit,carbon:0});
   }
 }
 return {name:a.name,total,carbon,cycles,events,perYear:total/years};
}
function chart(el,results,key,unit){
 const max=Math.max(1,...results.map(r=>r[key]));
 el.innerHTML=results.map((r,i)=>`<div class="ab-bar-row"><div class="ab-bar-head"><span>${escape(r.name)}</span><b>${fmt(r[key],key==='carbon'?1:0)} ${unit}</b></div><div class="ab-track"><div class="ab-bar" style="width:${Math.max(0,r[key]/max*100)}%;background:${colors[i]}"></div></div></div>`).join('');
}
function update(){
 const years=num($('ab-years').value),rate=num($('ab-rate').value);
 const all=[years,rate,...data.flatMap(a=>fields.map(([k])=>a[k]))];
 const bad=all.some(v=>!Number.isFinite(v))||years<1||years>50||!Number.isInteger(years)||rate<0||rate>30||data.some(a=>a.life<1||!Number.isInteger(a.life)||fields.some(([k,, ,min])=>a[k]<min));
 const warning=$('ab-warning');
 if(bad){warning.hidden=false;warning.textContent='Kontrollera inmatningen. Analysperiod och livslängd måste vara hela positiva år, kostnader och utsläpp får inte vara negativa.';return}
 warning.hidden=true;
 last=data.map(a=>calculate(a,years,rate/100));
 const lowCost=last.reduce((a,b)=>a.total<=b.total?a:b);
 const lowCarbon=last.reduce((a,b)=>a.carbon<=b.carbon?a:b);
 $('ab-best-cost').textContent=fmt(lowCost.total)+' kr';
 $('ab-best-cost-val').textContent=lowCost.name;
 $('ab-best-carbon').textContent=fmt(lowCarbon.carbon,1)+' kg CO₂e';
 $('ab-best-carbon-val').textContent=lowCarbon.name;
 chart($('ab-cost-chart'),last,'total','kr');
 chart($('ab-carbon-chart'),last,'carbon','kg');
 $('ab-table').innerHTML=last.map((r,i)=>`<tr><th>${escape(r.name)}</th><td>${fmt(r.total)}</td><td>${fmt(r.perYear)}</td><td>${fmt(r.carbon,1)}</td><td>${r.cycles-1}</td></tr>`).join('');
 $('ab-insight').textContent=lowCost.name===lowCarbon.name?`${lowCost.name} har både lägst beräknad livscykelkostnad och lägst klimatpåverkan utifrån angivna värden.`:`Ekonomiskt lägst: ${lowCost.name}. Klimatmässigt lägst: ${lowCarbon.name}. Valet beror på prioriteringar och kvaliteten i klimatunderlaget.`;
 $('ab-update').textContent='Beräknat för '+years+' år · '+fmt(rate,1)+' % kalkylränta';
}
root.addEventListener('input',e=>{
 const el=e.target;
 if(el.dataset.alt!==undefined){
   const i=Number(el.dataset.alt),field=el.dataset.field;
   if(field==='source')data[i].source=el.value;
   else data[i][field]=num(el.value);
 }
 update();
});
root.addEventListener('change',update);
function save(name,blob){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
const fileBase=()=>($('ab-product').value.trim()||'aterbruksval').replace(/[^a-zA-Z0-9åäöÅÄÖ_-]+/g,'_').slice(0,50);
$('ab-example').addEventListener('click',()=>{data=specs.map(s=>({...s}));$('ab-years').value=10;$('ab-rate').value=3;$('ab-product').value='Kontorsstol';renderInputs();update()});
$('ab-save').addEventListener('click',()=>save(fileBase()+'_indata.json',new Blob([JSON.stringify({version:1,product:$('ab-product').value,years:$('ab-years').value,rate:$('ab-rate').value,alternatives:data},null,2)],{type:'application/json'})));
$('ab-load').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const obj=JSON.parse(await f.text());if(!Array.isArray(obj.alternatives)||obj.alternatives.length!==3)throw Error('Felaktig fil');const parsed=obj.alternatives.map((a,i)=>{const r={...specs[i]};fields.forEach(([k])=>{if(a[k]===undefined)throw Error('Saknar fält '+k);r[k]=num(a[k])});r.source=String(a.source||'').slice(0,250);return r});data=parsed;$('ab-product').value=String(obj.product||'').slice(0,80);$('ab-years').value=obj.years;$('ab-rate').value=obj.rate;renderInputs();update()}catch(err){alert('Kunde inte läsa in filen: '+err.message)}finally{e.target.value=''}});
$('ab-csv').addEventListener('click',()=>{if(!last.length)return;const rows=[['Produkt',$('ab-product').value],['Analysperiod år',$('ab-years').value],['Kalkylränta %',$('ab-rate').value],[],['Alternativ','LCC kr','LCC kr per år','Klimat kg CO2e','Ersättningsköp','Källa klimatdata'],...last.map((r,i)=>[r.name,r.total.toFixed(2),r.perYear.toFixed(2),r.carbon.toFixed(2),r.cycles-1,data[i].source||'Ej angiven'])];const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');save(fileBase()+'_jamforelse.csv',new Blob([csv],{type:'text/csv;charset=utf-8'}))});
$('ab-print').addEventListener('click',()=>window.print());
renderInputs();update();
})();