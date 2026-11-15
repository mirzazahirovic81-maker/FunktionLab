
'use strict';
/* FÖRETAGSKONFIGURATION: ändra enbart dessa värden för varje kund.
   logoUrl kan anges till en publicerad bild-URL; tom sträng visar initialen.
   Samma kunduppgifter används i kalkylatorn och PDF-underlaget. */
const COMPANY = Object.freeze(window.FL_CUSTOMER.company);
const $=id=>document.getElementById(id), money=n=>Math.round(n).toLocaleString('sv-SE')+' kr';
let job='walls', latest=null;
const roomIds=['roomLength','roomWidth','roomHeight','doors','windows'];
const initialRoom={roomLength:'5',roomWidth:'4',roomHeight:'2.5',doors:'1',windows:'2',includeCeiling:false};
let roomStates=[{...initialRoom}],activeRoomIndex=0,loadingRoom=false;
function storeActiveRoom(){
 if(loadingRoom)return;
 const room=roomStates[activeRoomIndex];
 roomIds.forEach(id=>room[id]=$(id).value);
 room.includeCeiling=$('includeCeiling').checked;
}
function loadActiveRoom(){
 loadingRoom=true;
 const room=roomStates[activeRoomIndex];
 roomIds.forEach(id=>$(id).value=room[id]);
 $('includeCeiling').checked=room.includeCeiling;
 $('activeRoom').value=String(activeRoomIndex);
 loadingRoom=false;
 calculate();
}
function roomGeometry(room){
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number(v)||a));
 const length=clamp(room.roomLength,.5,100),width=clamp(room.roomWidth,.5,100),height=clamp(room.roomHeight,1,15);
 const doors=Math.round(clamp(room.doors,0,30)),windows=Math.round(clamp(room.windows,0,30));
 const gross=2*(length+width)*height;
 return {length,width,height,doors,windows,walls:Math.max(0,gross-Math.min(gross,doors*1.8+windows*1.5)),ceiling:length*width,includeCeiling:room.includeCeiling};
}

document.documentElement.style.setProperty('--brand',COMPANY.primaryColor);
$('brandName').textContent=COMPANY.name;$('footerBrand').textContent=COMPANY.name;
$('year').textContent=new Date().getFullYear();$('logoIcon').textContent=COMPANY.initial;
if(COMPANY.logoUrl){const img=document.createElement('img');img.src=COMPANY.logoUrl;img.alt=COMPANY.name;img.style.cssText='max-width:160px;max-height:50px;object-fit:contain';$('logoIcon').replaceWith(img);}
function getGeometry(){
 const valid=(id,min,max)=>Math.min(max,Math.max(min,Number($(id).value)||min));
 const length=valid('roomLength',0.5,100),width=valid('roomWidth',0.5,100),height=valid('roomHeight',1,15);
 const doors=Math.round(valid('doors',0,30)),windows=Math.round(valid('windows',0,30));
 ['roomLength','roomWidth','roomHeight'].forEach(id=>{const sl=$(id+'Slider');if(sl){sl.value=Math.min(Number(sl.max),Math.max(Number(sl.min),Number($(id).value)||Number(sl.min)));}});
 const gross=2*(length+width)*height,deduction=Math.min(gross,doors*1.8+windows*1.5);
 const walls=Math.max(0,gross-deduction),ceiling=length*width;
 return {length,width,height,doors,windows,walls,ceiling};
}

function svgEl(tag,attrs={},text){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
function addSvg(group,tag,attrs,text){const n=svgEl(tag,attrs,text);group.appendChild(n);return n;}
function renderInterior(g){
 const el=$('interiorScene'),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const depth=clamp(g.length/5,.35,2.5),width=clamp(g.width/4,.35,2.5),height=clamp(g.height/2.5,.55,1.8);
 const bw=clamp(190*width/(.7+.3*depth),105,286),bh=clamp(137*height/(.78+.22*depth),90,172);
 const x=220-bw/2,X=220+bw/2,y=126-bh/2,Y=126+bh/2;
 const pts=a=>a.map(p=>p.join(',')).join(' ');
 const wall=(points,fill)=>`<polygon points="${pts(points)}" fill="${fill}" stroke="#9aaba7" stroke-width=".7"/>`;
 const left=[[12,12],[x,y],[x,Y],[12,230]],right=[[X,y],[428,12],[428,230],[X,Y]];
 const w=Math.min(5,g.windows),d=Math.min(5,g.doors);
 const windowWidth=clamp(bw*.23,22,59),windowHeight=clamp(bh*.39,30,65);
  // Fönstret placeras på högra sidoväggen och projiceras efter rummets geometri.
  // Fönstrets relativa bredd styrs av rummets längd, höjden av takhöjden.
  const rightPoint=(u,v)=>[X+(428-X)*u, y+(12-y)*u+((Y-y)+(230-12-(Y-y))*u)*v];
  const rw=clamp(1.2/g.length,.09,.43),rh=clamp(1.2/g.height,.18,.55);
  const ru=clamp(.47-rw/2,.12,.78-rw),rv=clamp(.36-rh/2,.12,.8-rh);
  const rightPoly=(u,v,w,h)=>[rightPoint(u,v),rightPoint(u+w,v),rightPoint(u+w,v+h),rightPoint(u,v+h)].map(p=>p.join(',')).join(' ');
 const doorWidth=clamp(bw*.16,18,40),doorHeight=clamp(bh*.72,50,112);
 let openings='';
  if(w>0){
   const outer=rightPoly(ru-.012,rv-.016,rw+.024,rh+.032);
   const glass=rightPoly(ru,rv,rw,rh);
   const a=rightPoint(ru+rw/2,rv),b=rightPoint(ru+rw/2,rv+rh);
   const c=rightPoint(ru,rv+rh/2),e=rightPoint(ru+rw,rv+rh/2);
   openings+=`<g filter="url(#mmShadow)"><polygon points="${outer}" fill="#f7f4ec" stroke="#b3afa5" stroke-width="1.5"/><polygon points="${glass}" fill="url(#mmSky)" stroke="#c3d0cb" stroke-width="1"/><path d="M${a.join(' ')}L${b.join(' ')} M${c.join(' ')}L${e.join(' ')}" stroke="#f9f7f0" stroke-width="3"/></g>`;
  }
 if(d>0){
  const dx=x+bw*.08,dy=Y-doorHeight;
  openings+=`<g><rect x="${dx}" y="${dy}" width="${doorWidth}" height="${doorHeight}" fill="#b3a89a" stroke="#f6f3ec" stroke-width="4"/><rect x="${dx+4}" y="${dy+5}" width="${doorWidth-8}" height="${doorHeight-10}" fill="url(#mmDoor)"/><path d="M${dx+6} ${dy+8}h${doorWidth-12}v${doorHeight*.36}h${-doorWidth+12}z M${dx+6} ${dy+doorHeight*.49}h${doorWidth-12}v${doorHeight*.37}h${-doorWidth+12}z" fill="none" stroke="#b6aa98" stroke-width="1"/><circle cx="${dx+doorWidth-6}" cy="${dy+doorHeight*.53}" r="2" fill="#a18b63"/></g>`;
 }
 el.innerHTML=`<defs>
 <linearGradient id="mmLeft" x1="0" x2="1"><stop stop-color="#c2d1cc"/><stop offset="1" stop-color="#e3e8e1"/></linearGradient>
 <linearGradient id="mmRight" x1="0" x2="1"><stop stop-color="#e8eae3"/><stop offset="1" stop-color="#c6d5cf"/></linearGradient>
 <linearGradient id="mmBack" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#f4f3ed"/><stop offset="1" stop-color="#e6e7de"/></linearGradient>
 <linearGradient id="mmFloor" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#e0d2bb"/><stop offset="1" stop-color="#bfa98d"/></linearGradient>
 <linearGradient id="mmSky" x1="0" x2=".7" y1="0" y2="1"><stop stop-color="#c4e1ed"/><stop offset="1" stop-color="#edf4ed"/></linearGradient>
 <linearGradient id="mmDoor" x1="0" x2="1"><stop stop-color="#e6ded1"/><stop offset="1" stop-color="#c9c1b5"/></linearGradient>
 <linearGradient id="mmUpholstery" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#f1ece2"/><stop offset="1" stop-color="#bcb5a9"/></linearGradient>
 <filter id="mmShadow" x="-25%" y="-40%" width="150%" height="190%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#344640" flood-opacity=".22"/></filter>
 <pattern id="mmTexture" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".5" fill="#879c90" opacity=".16"/></pattern>
 </defs>
 <rect width="440" height="270" rx="9" fill="#e6eee9"/>
 ${wall(left,'#e5e8e1')}${wall(right,'#e5e8e1')}
 ${wall([[x,y],[X,y],[X,Y],[x,Y]],'#e5e8e1')}
 ${wall([[12,230],[x,Y],[X,Y],[428,230]],'url(#mmFloor)')}
 <polygon points="${pts([[12,12],[x,y],[X,y],[428,12]])}" fill="${$('includeCeiling').checked?'#e7f0e9':'#f8f8f3'}"/>
 <path d="M12 12 L${x} ${y} H${X} L428 12 M12 230 L${x} ${Y} H${X} L428 230" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>
 <path d="M${x} ${y}V${Y} M${X} ${y}V${Y}" stroke="#d4d7cf" stroke-width="1.5"/>
 ${openings}

 <rect x="0" y="239" width="440" height="31" fill="#f2f7f4"/>
 <text x="220" y="259" text-anchor="middle" fill="#176c70" font-size="13" font-weight="700">${g.length.toLocaleString('sv-SE')} × ${g.width.toLocaleString('sv-SE')} × ${g.height.toLocaleString('sv-SE')} m</text>
 `;
}
function renderFacade(length,width,height,doors,windows,area,roofType){
 const el=$('facadeScene'),gable=roofType==='gable';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 // Två separata geometriska modeller: sadeltak med gavel, respektive plant tak.
 // Samma projektionsvektor används för samtliga parallella kanter.
 const frontW=clamp(92+width*4.2,100,162);
 const sideW=clamp(94+length*4.5,100,190);
 const wallH=clamp(76+height*7,90,140);
 const dx=sideW,dy=clamp(sideW*.13,14,26);
 const roofRise=gable?clamp(frontW*.38,35,58):0;
 const x0=(440-frontW-dx)/2,x1=x0+frontW,xm=(x0+x1)/2;
 const eaveY=clamp(91+roofRise*.45,105,128),baseY=eaveY+wallH;
 const P=(x,y)=>`${x.toFixed(2)},${y.toFixed(2)}`;
 const poly=(pts,fill,stroke='none',sw=1)=>`<polygon points="${pts.map(q=>P(...q)).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
 const front=gable?[[x0,eaveY],[xm,eaveY-roofRise],[x1,eaveY],[x1,baseY],[x0,baseY]]:[[x0,eaveY],[x1,eaveY],[x1,baseY],[x0,baseY]];
 const side=[[x1,eaveY],[x1+dx,eaveY-dy],[x1+dx,baseY-dy],[x1,baseY]];
 function opening(face,u,v,w,h,kind){
  const point=(a,b)=>face==='front'?[x0+a*frontW,eaveY+b*wallH]:[x1+a*dx,eaveY-a*dy+b*wallH];
  const q=[point(u,v),point(u+w,v),point(u+w,v+h),point(u,v+h)];
  let out=poly(q,kind==='door'?'#536269':'#c9d9df','#9cacae',1.4);
  const t=.09;
  out+=poly([point(u+w*t,v+h*t),point(u+w*(1-t),v+h*t),point(u+w*(1-t),v+h*(1-t)),point(u+w*t,v+h*(1-t))],kind==='door'?'#343f44':'url(#facGlass)','#b6c7c8',.7);
  if(kind==='window'){
   const a=point(u+w*.5,v+h*t),b=point(u+w*.5,v+h*(1-t));
   out+=`<path d="M${a.join(' ')}L${b.join(' ')}" stroke="#e8f0ed" stroke-width="2"/>`;
  }else{
   const hnd=point(u+w*.78,v+h*.57);
   out+=`<circle cx="${hnd[0]}" cy="${hnd[1]}" r="1.5" fill="#e2e6e3"/>`;
  }
  return out;
 }
 const doorH=clamp(2.05/height,.22,.84),frontDoorW=clamp(1/width,.07,.2),sideDoorW=clamp(1/length,.06,.18);
 let frontOpen='',sideOpen='';
 if(doors>0)frontOpen+=opening('front',.12,1-doorH,frontDoorW,doorH,'door');
 if(doors>1)sideOpen+=opening('side',.70,1-doorH,sideDoorW,doorH,'door');
 const levels=height>=4.3?[.13,.57]:[.26];
 const fw=clamp(1.2/width,.075,.17),sw=clamp(1.2/length,.06,.16),wh=clamp(1.2/height,.13,.32);
 const frontSlots=[],sideSlots=[];
 for(const v of levels){
  for(const u of [.29,.53,.76]){
   if(u+fw>.96||v+wh>.95)continue;
   if(doors>0&&v+wh>1-doorH-.03&&u<.12+frontDoorW+.03&&u+fw>.10)continue;
   frontSlots.push({u,v});
  }
  for(const u of [.08,.27,.47,.67,.85]){
   if(u+sw>.98||v+wh>.95)continue;
   if(doors>1&&v+wh>1-doorH-.03&&u<.70+sideDoorW+.03&&u+sw>.68)continue;
   sideSlots.push({u,v});
  }
 }
 const frontN=Math.min(frontSlots.length,Math.ceil(windows*.38));
 const sideN=Math.min(sideSlots.length,windows-frontN);
 const spread=(slots,n)=>n?Array.from({length:n},(_,i)=>slots[Math.min(slots.length-1,Math.floor((i+.5)*slots.length/n))]):[];
 spread(frontSlots,frontN).forEach(q=>frontOpen+=opening('front',q.u,q.v,fw,wh,'window'));
 spread(sideSlots,sideN).forEach(q=>sideOpen+=opening('side',q.u,q.v,sw,wh,'window'));
 const roof=gable?
  // Endast synligt takfall: från nock till takfot, konsekvent parallellprojektion.
  `${poly([[xm,eaveY-roofRise],[xm+dx,eaveY-roofRise-dy],[x1+dx,eaveY-dy],[x1,eaveY]],'url(#facRoof)','#3d5056',1.7)}
   <path d="M${P(xm,eaveY-roofRise)}L${P(xm+dx,eaveY-roofRise-dy)}" fill="none" stroke="#c6cfd0" stroke-width="2"/>`:
  // Platt tak har inga nockar, takfall eller triangulära gavlar.
  `${poly([[x0,eaveY],[x0+dx,eaveY-dy],[x1+dx,eaveY-dy],[x1,eaveY]],'#687a7e','#45565b',1.5)}
   <path d="M${P(x0,eaveY)}L${P(x1,eaveY)}L${P(x1+dx,eaveY-dy)}" stroke="#aebec0" stroke-width="2" fill="none"/>`;
 el.innerHTML=`<defs>
 <linearGradient id="facSky" x2="0" y2="1"><stop stop-color="#dcecf0"/><stop offset="1" stop-color="#f5f8f6"/></linearGradient>
 <linearGradient id="facGlass" x2=".8" y2="1"><stop stop-color="#668998"/><stop offset=".48" stop-color="#c0d9de"/><stop offset="1" stop-color="#698b96"/></linearGradient>
 <linearGradient id="facRoof" x2="0" y2="1"><stop stop-color="#84959a"/><stop offset="1" stop-color="#4d5e65"/></linearGradient>
 <filter id="facShadow"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#182a2a" flood-opacity=".18"/></filter>
 </defs>
 <rect width="440" height="290" rx="9" fill="url(#facSky)"/>
 <g filter="url(#facShadow)">
 ${poly(side,'#252f34','#19252a',1.2)}
 ${poly(front,'#343e43','#19252a',1.2)}
 ${roof}
 ${sideOpen}${frontOpen}
 <path d="M${P(x0,baseY)}L${P(x1,baseY)}L${P(x1+dx,baseY-dy)}" fill="none" stroke="#52685d" stroke-width="2"/>
 </g>
 <rect y="258" width="440" height="32" fill="#f1f7f4"/>
 <text x="220" y="278" text-anchor="middle" fill="#176c70" font-size="12" font-weight="700">${length.toLocaleString('sv-SE')} × ${width.toLocaleString('sv-SE')} × ${height.toLocaleString('sv-SE')} m (L × B × H)</text>`;
}
function calculate(){
  const r=COMPANY.priceRules,g=getGeometry(),isFacade=job==='facade';
  const fl=Math.min(40,Math.max(2,Number($('facadeLength').value)||2)),fw=Math.min(30,Math.max(2,Number($('facadeWidth').value)||2)),fh=Math.min(12,Math.max(2,Number($('facadeHeight').value)||2));
  const fd=Math.min(2,Math.max(0,Math.round(Number($('facadeDoors').value)||0))),fn=Math.min(24,Math.max(0,Math.round(Number($('facadeWindows').value)||0)));
  const roofType=$('roofType').value;
   const gableRise=roofType==='gable'?fw*0.28:0;
   const facadeArea=Math.max(0,2*(fl+fw)*fh+(roofType==='gable'?fw*gableRise:0)-fd*1.8-fn*1.5);
   $('facadeDoors').value=fd;
   ['facadeLength','facadeWidth','facadeHeight','facadeDoors','facadeWindows'].forEach(id=>{const slider=$(id+'Slider');if(slider)slider.value=$(id).value;});
  const rooms=roomStates.map(roomGeometry);
  const wallSum=rooms.reduce((sum,room)=>sum+room.walls,0);
  const ceilingSum=rooms.reduce((sum,room)=>sum+(room.includeCeiling?room.ceiling:0),0);
  const area=isFacade?facadeArea:wallSum;
  const extraCeiling=isFacade?0:ceilingSum;
  $('roomFields').hidden=isFacade;$('facadeFields').hidden=!isFacade;
  $('openingsFields').hidden=isFacade;$('ceilingOption').hidden=isFacade;
  $('liveWallArea').textContent=g.walls.toLocaleString('sv-SE',{maximumFractionDigits:1})+' m² väggyta';
 $('liveFloorArea').textContent='Golvyta: '+g.ceiling.toLocaleString('sv-SE',{maximumFractionDigits:1})+' m²';
 renderInterior(g);renderFacade(fl,fw,fh,fd,fn,facadeArea,roofType);
 $('liveFacadeArea').textContent=facadeArea.toLocaleString('sv-SE',{maximumFractionDigits:1})+' m² fasadyta';
 $('measureTitle').textContent=isFacade?'Fasadens mått':(rooms.length>1?'Rummens mått':'Rummets mått');$('measureDescription').textContent=isFacade?'Ange husets mått för alla fyra ytterväggar.':'Fyll i rummets mått så räknar vi ut målningsytan.';
 $('areaPreview').textContent=isFacade?`Beräknad fasadyta: ${area.toLocaleString('sv-SE',{maximumFractionDigits:1})} m²`:`Rum ${activeRoomIndex+1}: ${g.walls.toLocaleString('sv-SE',{maximumFractionDigits:1})} m² vägg. Totalt ${wallSum.toLocaleString('sv-SE',{maximumFractionDigits:1})} m² vägg${extraCeiling?' + '+extraCeiling.toLocaleString('sv-SE',{maximumFractionDigits:1})+' m² tak':''} för ${rooms.length} rum.`;
  const condition=$('condition').value,coats=Number($('coats').value),access=$('access').value;
  const laborBase=area*r[job].laborPerM2*r.preparationMultiplier[condition]*r.coatsMultiplier[coats]*(access==='difficult'?r.difficultAccessMultiplier:1);
  const extraLabor=extraCeiling*r.ceiling.laborPerM2*r.preparationMultiplier[condition]*r.coatsMultiplier[coats];
  const material=$('paintIncluded').checked?(area*r[job].materialPerM2+extraCeiling*r.ceiling.materialPerM2)*r.coatsMultiplier[coats]:0;
  const cover=$('cover').checked?r.coverFixed:0;
  const labor=Math.max(laborBase+extraLabor,r.minPriceExVat-material-cover),net=labor+material+cover;
  const vat=net*r.vatRate,total=net+vat;
  // ROT: endast en illustrativ schablon på arbetskostnad inkl moms, inte skatterådgivning.
  const rot=$('rot').checked?labor*(1+r.vatRate)*r.rotIllustrationRate:0;
  latest={company:COMPANY.name,job:r[job].name+(extraCeiling?' + takmålning':''),area:area+extraCeiling,dimensions:isFacade?{facadeLength:fl,facadeWidth:fw,facadeHeight:fh,roofType,doors:fd,windows:fn}:g,rooms:isFacade?null:rooms,condition,coats,access,cover:$('cover').checked,paintIncluded:$('paintIncluded').checked,labor,material,coverCost:cover,vat,total,rot,final:total-rot,createdAt:new Date().toISOString()};
  $('price').textContent=money(total-rot);$('priceNote').textContent=$('rot').checked?'Inklusive moms, efter illustrativt ROT-avdrag':'Inklusive moms, före eventuellt ROT-avdrag';$('jobName').textContent=r[job].name+(isFacade?'':` (${rooms.length} ${rooms.length===1?'rum':'rum'})`)+(extraCeiling?' + takmålning':'');$('areaText').textContent=(area+extraCeiling).toLocaleString('sv-SE',{maximumFractionDigits:1})+' m²';$('laborText').textContent=money(labor);$('extraText').textContent=money(material+cover);$('vatText').textContent=money(vat);$('rotLine').hidden=!$('rot').checked;$('rotText').textContent='−'+money(rot);$('finalText').textContent=money(total-rot);$('totalLabel').textContent=rot?'Efter illustrativt ROT':'Uppskattat totalpris';
}
$('roomCount').addEventListener('change',()=>{
 storeActiveRoom();
 const count=Number($('roomCount').value);
 while(roomStates.length<count)roomStates.push({...initialRoom});
 roomStates.length=count;
 if(activeRoomIndex>=count)activeRoomIndex=count-1;
 $('roomPickerField').hidden=count===1;
 $('activeRoom').innerHTML=roomStates.map((_,i)=>`<option value="${i}">Rum ${i+1}</option>`).join('');
 loadActiveRoom();
});
$('activeRoom').addEventListener('change',()=>{storeActiveRoom();activeRoomIndex=Number($('activeRoom').value);loadActiveRoom();});
roomIds.concat(['includeCeiling']).forEach(id=>$(id).addEventListener('input',storeActiveRoom));
document.querySelectorAll('[data-job]').forEach(b=>b.addEventListener('click',()=>{job=b.dataset.job;document.querySelectorAll('[data-job]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});calculate()}));
['facadeLength','facadeWidth','facadeHeight','facadeDoors','facadeWindows','roofType','roomLength','roomWidth','roomHeight','doors','windows','includeCeiling','condition','coats','access','cover','paintIncluded','rot'].forEach(id=>$(id).addEventListener('input',calculate));
['roomLength','roomWidth','roomHeight','facadeLength','facadeWidth','facadeHeight','facadeDoors','facadeWindows'].forEach(id=>{const slider=$(id+'Slider');if(slider)slider.addEventListener('input',()=>{$(id).value=slider.value;calculate();});});
function updatePrintSheet(){
 if(!latest)return;
 const v=latest,cond={good:'Bra, normalt förarbete',medium:'Visst spacklingsbehov',poor:'Omfattande förarbete'};
 const fields={pdfBrand:COMPANY.name,pdfMark:COMPANY.initial,pdfFooterBrand:COMPANY.name,pdfDate:new Date().toLocaleDateString('sv-SE',{year:'numeric',month:'long',day:'numeric'}),pdfPrice:money(v.final),pdfPriceNote:v.rot>0?'Inklusive moms, efter illustrativt ROT-avdrag':'Inklusive moms, före eventuellt ROT-avdrag',pdfJob:v.job+(v.dimensions?.roofType?` (${v.dimensions.roofType==='gable'?'sadeltak':'platt tak'})`: ''),pdfArea:v.area.toLocaleString('sv-SE',{maximumFractionDigits:1})+' m²',pdfDimensions:v.rooms?`${v.rooms.length} rum`:v.dimensions?(v.dimensions.facadeWidth?`${v.dimensions.facadeLength} × ${v.dimensions.facadeWidth} × ${v.dimensions.facadeHeight} m (hus)`:`${v.dimensions.length} × ${v.dimensions.width} × ${v.dimensions.height} m`):'Ej angivet',pdfOpenings:v.rooms?`${v.rooms.reduce((n,r)=>n+r.doors,0)} dörrar, ${v.rooms.reduce((n,r)=>n+r.windows,0)} fönster`:v.dimensions?`${v.dimensions.doors} dörrar, ${v.dimensions.windows} fönster`:'Ej angivet',pdfCondition:cond[v.condition],pdfCoats:String(v.coats),pdfAccess:v.access==='normal'?'Normal':'Svåråtkomligt / hög höjd',pdfCover:v.cover?'Ingår':'Ingår inte',pdfMaterial:v.paintIncluded?'Ingår':'Ingår inte',pdfLabor:money(v.labor),pdfExtras:money(v.material+v.coverCost),pdfVat:money(v.vat),pdfRot:'−'+money(v.rot),pdfFinal:money(v.final)};
 Object.entries(fields).forEach(([id,val])=>$(id).textContent=val);
 $('pdfRotRow').hidden=!$('rot').checked;$('pdfDimensionsRow').hidden=!v.dimensions;$('pdfOpeningsRow').hidden=!v.dimensions||v.job.startsWith('Tak');
}
// Självständig PDF-generering utan externa bibliotek eller nätverksanrop.
// PDF använder inbyggda Helvetica och WinAnsiEncoding (svenska tecken stöds).
async function makePricePdf(v){
 const esc=t=>String(t).replace(/[^\x20-\x7e\xa0-\xff]/g,c=>({'\u2013':'-','\u2014':'-','\u2019':"'",'\u2212':'-','\u00d7':'x','\u00b2':'2'}[c]||'?')).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
 const cmds=[];
 const color=(r,g,b)=>`${(r/255).toFixed(3)} ${(g/255).toFixed(3)} ${(b/255).toFixed(3)}`;
 const rect=(x,y,w,h,rgb)=>cmds.push(`${color(...rgb)} rg ${x} ${842-y-h} ${w} ${h} re f`);
 const line=(x1,y1,x2,y2,rgb=[222,233,230])=>cmds.push(`${color(...rgb)} RG 0.65 w ${x1} ${842-y1} m ${x2} ${842-y2} l S`);
 const txt=(t,x,y,size=10,bold=false,rgb=[21,51,64])=>cmds.push(`BT /${bold?'F2':'F1'} ${size} Tf ${color(...rgb)} rg 1 0 0 1 ${x} ${842-y} Tm (${esc(t)}) Tj ET`);
 // A4, koordinater i punkter från övre vänstra hörnet.
 rect(45,45,505,61,[23,108,112]);txt(COMPANY.name,61,83,20,true,[255,255,255]);
 txt(COMPANY.phone+'  |  '+COMPANY.contactEmail,47,124,9,false,[79,106,111]);
 txt('PRELIMINÄRT PRISUNDERLAG',47,153,10,true,[23,108,112]);
 txt('Din prisuppskattning',47,185,22,true);
 txt(new Date().toLocaleDateString('sv-SE'),430,154,9,false,[79,106,111]);
 rect(45,207,505,75,[239,247,245]);
 txt('UPPSKATTAT PRIS INKLUSIVE MOMS',61,232,10,true,[23,108,112]);
 txt(money(v.final),61,264,23,true);
 txt(v.rot>0?'Efter illustrativt ROT-avdrag':'Före eventuellt ROT-avdrag',305,262,9,false,[79,106,111]);
 txt('Sammanställning',47,313,15,true);
 const cond={good:'Bra, normalt förarbete',medium:'Visst spacklingsbehov',poor:'Omfattande förarbete'};
 const d=v.dimensions;
 const dims=v.rooms?`${v.rooms.length} rum, totalt ${v.area.toLocaleString('sv-SE',{maximumFractionDigits:1})} m²`:d?(d.facadeWidth?`${d.facadeLength} x ${d.facadeWidth} x ${d.facadeHeight} m (hus)`:`${d.length} x ${d.width} x ${d.height} m (rum)`):'Ej angivet';
 const openings=v.rooms?`${v.rooms.reduce((n,r)=>n+r.doors,0)} dörrar, ${v.rooms.reduce((n,r)=>n+r.windows,0)} fönster`:d?`${d.doors} dörrar, ${d.windows} fönster`:'Ej angivet';
 const rows=[['Arbete',v.job+(d?.roofType?` (${d.roofType==='gable'?'sadeltak':'platt tak'})`:'')],['Mått',dims],['Öppningar',openings],['Målningsyta',v.area.toLocaleString('sv-SE',{maximumFractionDigits:1})+' m²'],['Underlag',cond[v.condition]],['Strykningar',String(v.coats)],['Åtkomlighet',v.access==='normal'?'Normal':'Svåråtkomligt / hög höjd'],['Skyddstäckning',v.cover?'Ingår':'Ingår inte'],['Färg och förbrukningsmaterial',v.paintIncluded?'Ingår':'Ingår inte'],['Arbete och förarbete, exkl. moms',money(v.labor)],['Material och tillägg, exkl. moms',money(v.material+v.coverCost)],['Moms 25 %',money(v.vat)]];
  if(v.rooms&&v.rooms.length>1){
    // En rad per rum i PDF-underlaget, så att målerifirman ser uppdelningen.
    const insertAt=rows.findIndex(row=>row[0]==='Underlag');
    rows.splice(insertAt,0,...v.rooms.map((room,i)=>[`Rum ${i+1}: ${room.length} x ${room.width} x ${room.height} m`,`${(room.walls+(room.includeCeiling?room.ceiling:0)).toLocaleString('sv-SE',{maximumFractionDigits:1})} m²`]));
  }
 if(v.rot>0)rows.push(['Illustrativt ROT-avdrag','-'+money(v.rot)]);
 rows.push(['Uppskattat belopp att betala',money(v.final)]);
 let y=337;const rowHeight=v.rooms&&v.rooms.length>1?Math.max(21,Math.floor(377/rows.length)):(v.rot>0?27:29);
 rows.forEach(([label,value],i)=>{
   const isTotal=i===rows.length-1;
   if(isTotal)rect(45,y-17,505,rowHeight,[239,247,245]);
   txt(label,49,y,isTotal?11:9.5,isTotal);
   // Högerkolumn med konservativ position, utan textöverlappning.
   txt(value,367,y,isTotal?12:10,isTotal);
   if(!isTotal)line(47,y+8,548,y+8);
   y+=rowHeight;
 });
 const noteY=Math.min(760,y+12);
 rect(45,noteY-15,505,48,[239,247,245]);
 txt('Detta är en preliminär prisindikation, inte en bindande offert.',57,noteY+2,9);
 txt('Slutpriset fastställs av målerifirman. ROT-avdrag kräver uppfyllda villkor.',57,noteY+17,9);
 line(45,805,550,805);
 txt(COMPANY.website.replace(/^https?:\/\//,''),47,822,8,false,[90,110,115]);
 txt('Skapad med FunktionLab',418,822,8,false,[90,110,115]);
 const streams=[cmds.join('\n')+'\n'];
 // Kunduppgifter läggs på en separat A4-sida, utan att prisuppställningen ändras.
 const info=[['Namn',$('requestName').value.trim()],['E-post',$('requestEmail').value.trim()],['Postnummer',$('requestZip').value.trim()],['Övriga uppgifter',$('requestMessage').value.trim()]];
 const extra=[];
 const extraTxt=(value,x,y,size=11,bold=false)=>extra.push(`BT /${bold?'F2':'F1'} ${size} Tf 0.09 0.20 0.25 rg 1 0 0 1 ${x} ${842-y} Tm (${esc(value)}) Tj ET`);
 extra.push(`${color(23,108,112)} rg 45 ${842-106} 505 61 re f`);
 extra.push(`BT /F2 20 Tf 1 1 1 rg 1 0 0 1 61 ${842-83} Tm (${esc(COMPANY.name)}) Tj ET`);
 extraTxt('FÖRBEREDD FÖRFRÅGAN',47,152,15,true);
 let iy=195;
 const splitText=(value,max=78)=>{
   const lines=[];for(const paragraph of String(value||'Ej angivet').split(/\r?\n/)){
     let line='';for(const word of paragraph.split(/\s+/)){
       if((line+' '+word).trim().length>max&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();
     }lines.push(line||' ');
   }return lines;
 };
 for(const [label,value] of info){
   extraTxt(label,49,iy,11,true);iy+=20;
   for(const line of splitText(value,77).slice(0,12)){extraTxt(line,49,iy,10);iy+=16;}
   iy+=17;
 }
 extraTxt('Uppgifterna är endast avsedda som underlag för en förfrågan.',49,765,9);
 extraTxt('Demoversion från FunktionLab. Ingen information har skickats.',49,786,9);
 streams.push(extra.join('\n')+'\n');
 const encoder=new TextEncoder();
 const bytesLatin1=str=>Uint8Array.from(Array.from(str,c=>c.charCodeAt(0)&255));
 const pages=streams.map(x=>({type:'text',bytes:bytesLatin1(x)}));
 const imageFiles=Array.from($('requestPhotos').files||[]).filter(f=>f.type.startsWith('image/'));
 for(const file of imageFiles){
   const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=reader.result;};reader.readAsDataURL(file);});
   const cv=document.createElement('canvas');cv.width=1000;cv.height=1414;
   const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,1000,1414);
   cx.fillStyle='#176c70';cx.fillRect(0,0,1000,140);cx.fillStyle='#fff';cx.font='bold 30px Arial';cx.fillText('DemoMåleri | Fotobilaga',65,85);
   const scale=Math.min(870/image.naturalWidth,1110/image.naturalHeight);
   const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
   cx.drawImage(image,(1000-w)/2,185+(1110-h)/2,w,h);
   const data=cv.toDataURL('image/jpeg',.82).split(',')[1];const raw=atob(data);const jpg=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)jpg[i]=raw.charCodeAt(i);
   pages.push({type:'image',bytes:jpg,width:1000,height:1414});
 }
 const objects=[null,null]; // katalog och sidträd
 const add=body=>{objects.push(body);return objects.length;};
 const pageIds=[];
 const font1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 const font2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 for(const p of pages){
   if(p.type==='text'){
     const streamId=add({dict:`<< /Length ${p.bytes.length} >>`,bytes:p.bytes});
     pageIds.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${streamId} 0 R >>`));
   }else{
     const imgId=add({dict:`<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>`,bytes:p.bytes});
     const data=bytesLatin1('q 595 0 0 842 0 0 cm /Im0 Do Q');
     const contentId=add({dict:`<< /Length ${data.length} >>`,bytes:data});
     pageIds.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>`));
   }
 }
 objects[0]='<< /Type /Catalog /Pages 2 0 R >>';
 objects[1]=`<< /Type /Pages /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] /Count ${pageIds.length} >>`;
 const chunks=[],offsets=[0];let length=0;
 const append=bytes=>{chunks.push(bytes);length+=bytes.length;};
 append(bytesLatin1('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
 for(let i=0;i<objects.length;i++){
   offsets.push(length);append(bytesLatin1(`${i+1} 0 obj\n`));
   const o=objects[i];if(typeof o==='string')append(bytesLatin1(o+'\n'));
   else{append(bytesLatin1(o.dict+'\nstream\n'));append(o.bytes);append(bytesLatin1('\nendstream\n'));}
   append(bytesLatin1('endobj\n'));
 }
 const xref=length;append(bytesLatin1(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`));
 for(let i=1;i<offsets.length;i++)append(bytesLatin1(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`));
 append(bytesLatin1(`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
 return new Blob(chunks,{type:'application/pdf'});
}
$('printBtn').addEventListener('click',async()=>{
 const btn=$('printBtn');btn.disabled=true;
 try{
  if(!latest)calculate();
  const blob=await makePricePdf(latest),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='DemoMaleri_prisunderlag.pdf';a.style.display='none';document.body.appendChild(a);
  a.click();a.remove();
  // Behåll objekt-URL tillräckligt länge för att mobilens delnings-/filvy ska hinna läsa den.
  setTimeout(()=>URL.revokeObjectURL(url),300000);
 }catch(e){console.error('PDF-fel:',e);alert('Det gick inte att skapa PDF-filen. Försök igen.');}
 finally{btn.disabled=false;}
});

window.addEventListener('beforeprint',updatePrintSheet);

calculate();
