(()=>{
 const root=document.getElementById('workflow-view');if(!root)return;
 const $=id=>root.querySelector('#'+id),NS='http://www.w3.org/2000/svg';
 const presets={
  purchase:{title:'Inköpsprocess',subtitle:'Från behov till genomfört inköp',steps:[['task','Identifiera behov','Beställare'],['task','Begär in offerter','Inköp'],['decision','Är offerten godkänd?','Beslutsfattare'],['task','Lägg beställning','Inköp'],['task','Ta emot leverans','Mottagare']]},
  incident:{title:'Hantera felanmälan',subtitle:'Från anmälan till avslutat ärende',steps:[['task','Registrera felanmälan','Kundtjänst'],['task','Bedöm prioritet','Drift'],['decision','Akut åtgärd?','Driftledare'],['task','Planera och åtgärda','Tekniker'],['task','Följ upp och avsluta','Drift']]},
  project:{title:'Projektbeslut',subtitle:'Från förslag till genomförande',steps:[['task','Beskriv behov','Projektledare'],['task','Ta fram beslutsunderlag','Projektgrupp'],['decision','Beslut om genomförande?','Styrgrupp'],['task','Planera genomförande','Projektledare'],['task','Följ upp resultat','Beställare']]}
 };
 let steps=[],sequence=0;
 const safe=(v,n=110)=>String(v||'').slice(0,n);
 const newStep=(type='task',label='',role='')=>({uid:++sequence,type,label,role});
 const el=(tag,attrs={},content)=>{const node=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));if(content!==undefined)node.textContent=content;return node};
 const txt=(g,x,y,value,opts={})=>{const t=el('text',{x,y,'text-anchor':opts.anchor||'middle','font-family':'Arial, Helvetica, sans-serif','font-size':opts.size||15,'font-weight':opts.weight||600,fill:opts.fill||'#143a50'});t.textContent=value;g.appendChild(t);return t};
 const lines=(str,max=24)=>{const words=safe(str,130).split(/\s+/).filter(Boolean);const result=[];let line='';for(const word of words){if((line+' '+word).trim().length>max&&line){result.push(line);line=word}else line=(line+' '+word).trim()}if(line)result.push(line);return result.slice(0,4)};
 const svgText=(g,cx,cy,label,role,pal,showRoles,max=24)=>{const ls=lines(label||'Nytt steg',max);const offset=showRoles&&role?13:0;const first=cy-((ls.length-1)*18)/2-offset/2;ls.forEach((s,i)=>txt(g,cx,first+i*18,s,{size:14,fill:pal.ink}));if(showRoles&&role)txt(g,cx,first+ls.length*18+3,safe(role,32),{size:11,weight:400,fill:pal.muted})};
 const palette=()=>{const t=$('wf-theme').value;return t==='technical'?{bg:'#f3f8fc',ink:'#153951',muted:'#56718a',task:'#e1f1ff',stroke:'#4380aa',decision:'#fff0c8',accent:'#2471a1',finish:'#173b56',line:'#6a8ba3'}:t==='minimal'?{bg:'#ffffff',ink:'#243747',muted:'#667b8a',task:'#fff',stroke:'#889eae',decision:'#fff',accent:'#34495e',finish:'#34495e',line:'#899daa'}:{bg:'#f6fafb',ink:'#073d51',muted:'#56798a',task:'#dcf8f2',stroke:'#11a7a5',decision:'#fff0d2',accent:'#00a8a7',finish:'#073d51',line:'#8aa5b1'}};
 const path=(g,d,pal,dash)=>g.appendChild(el('path',{d,fill:'none',stroke:pal.line,'stroke-width':2.3,'stroke-linejoin':'round','stroke-linecap':'round','stroke-dasharray':dash||'','marker-end':'url(#wf-arrow)'}));
 const draw=()=>{
  const svg=$('wf-diagram');svg.replaceChildren();const pal=palette(),vertical=$('wf-direction').value==='vertical',showRoles=$('wf-show-roles').checked;
  const n=steps.length,stepSpace=vertical?125:235,axisStart=vertical?175:190;
  const w=vertical?850:Math.max(850,340+n*stepSpace),h=vertical?Math.max(430,260+n*stepSpace):530;
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);
  svg.appendChild(el('rect',{width:w,height:h,fill:pal.bg}));
  const defs=el('defs');const marker=el('marker',{id:'wf-arrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});marker.appendChild(el('path',{d:'M 1 1 L 9 5 L 1 9 z',fill:pal.line}));defs.appendChild(marker);svg.appendChild(defs);
  const title=safe($('wf-title').value,90)||'Mitt arbetsflöde';txt(svg,36,47,title,{anchor:'start',size:26,weight:700,fill:pal.ink});
  const sub=safe($('wf-subtitle').value,130);if(sub)txt(svg,36,73,sub,{anchor:'start',size:13,weight:400,fill:pal.muted});
  const cx=vertical?w/2:0,cy=vertical?0:h/2;
  // Draw connectors first so the nodes remain on top.
  steps.forEach((s,i)=>{
   const a=axisStart+i*stepSpace,b=axisStart+(i+1)*stepSpace;
   if(i<n-1){if(vertical){path(svg,`M ${cx} ${a+43} V ${b-43}`,pal)}else{path(svg,`M ${a+86} ${cy} H ${b-86}`,pal)}}
   if(s.type==='decision'){
    if(vertical){const by=a+77;path(svg,`M ${cx+86} ${a} H ${cx+164} V ${by} H ${cx+164}`,pal);txt(svg,cx+116,a-8,'Nej',{size:12,fill:pal.muted});txt(svg,cx-20,a+68,'Ja',{size:12,fill:pal.muted});const r=el('rect',{x:cx+166,y:by-21,width:150,height:44,rx:12,fill:'#fff',stroke:pal.stroke});svg.appendChild(r);txt(svg,cx+241,by+4,'Återgå / ändra',{size:12,fill:pal.ink});path(svg,`M ${cx+241} ${by+23} V ${a+108} H ${cx+12}`,pal,'5 5')}
    else{const by=cy+112;path(svg,`M ${a} ${cy+46} V ${by-24}`,pal);txt(svg,a+16,cy+76,'Nej',{size:12,fill:pal.muted});svg.appendChild(el('rect',{x:a-80,y:by-20,width:160,height:42,rx:11,fill:'#fff',stroke:pal.stroke}));txt(svg,a,by+5,'Återgå / ändra',{size:12,fill:pal.ink});if(i<n-1)path(svg,`M ${a+80} ${by} H ${a+112} V ${cy+22} H ${a+120}`,pal,'5 5');txt(svg,a+112,cy-15,'Ja',{size:12,fill:pal.muted})}
   }
  });
  steps.forEach((s,i)=>{
   const a=axisStart+i*stepSpace,x=vertical?cx:a,y=vertical?a:cy;
   if(s.type==='decision'){
    svg.appendChild(el('path',{d:`M ${x} ${y-49} L ${x+94} ${y} L ${x} ${y+49} L ${x-94} ${y} Z`,fill:pal.decision,stroke:'#d2a24d','stroke-width':2}));svgText(svg,x,y,s.label,s.role,pal,showRoles,17);
   }else{
    svg.appendChild(el('rect',{x:x-88,y:y-43,width:176,height:86,rx:16,fill:pal.task,stroke:pal.stroke,'stroke-width':2}));svgText(svg,x,y,s.label,s.role,pal,showRoles,22);
   }
   svg.appendChild(el('circle',{cx:x-76,cy:y-32,r:12,fill:pal.accent}));txt(svg,x-76,y-28,String(i+1),{size:10,fill:'#fff'});
  });
  if(!steps.length)txt(svg,w/2,h/2,'Lägg till ett arbetssteg för att börja',{size:18,fill:pal.muted});
  txt(svg,w-24,h-21,'Skapad med FunktionLab',{anchor:'end',size:11,weight:400,fill:pal.muted});
  $('wf-step-count').textContent=n+' '+(n===1?'steg':'steg');$('wf-status').textContent='Uppdaterad direkt';
 };
 const renderSteps=()=>{const host=$('wf-steps');host.replaceChildren();steps.forEach((s,i)=>{
  const card=document.createElement('div');card.className='wf-step';const top=document.createElement('div');top.className='wf-step-top';
  const index=document.createElement('span');index.className='wf-step-index';index.textContent='STEG '+(i+1);top.appendChild(index);
  const control=(symbol,title,action,disabled=false)=>{const b=document.createElement('button');b.type='button';b.textContent=symbol;b.title=title;b.setAttribute('aria-label',title+' steg '+(i+1));b.disabled=disabled;b.addEventListener('click',action);return b};
  top.append(control('↑','Flytta upp',()=>{[steps[i-1],steps[i]]=[steps[i],steps[i-1]];renderSteps();draw()},i===0),control('↓','Flytta ned',()=>{[steps[i+1],steps[i]]=[steps[i],steps[i+1]];renderSteps();draw()},i===steps.length-1));
  const del=control('×','Ta bort',()=>{steps.splice(i,1);renderSteps();draw()});del.classList.add('wf-delete');top.appendChild(del);card.appendChild(top);
  const grid=document.createElement('div');grid.className='wf-step-grid';
  const type=document.createElement('select');[['task','Arbetssteg'],['decision','Beslut Ja/Nej']].forEach(([v,label])=>{const o=document.createElement('option');o.value=v;o.textContent=label;type.appendChild(o)});type.value=s.type;type.setAttribute('aria-label','Typ av steg '+(i+1));type.addEventListener('change',()=>{s.type=type.value;draw()});grid.appendChild(type);
  const label=document.createElement('input');label.type='text';label.maxLength=100;label.placeholder='Beskriv steget';label.value=s.label;label.setAttribute('aria-label','Beskrivning steg '+(i+1));label.addEventListener('input',()=>{s.label=label.value;draw()});grid.appendChild(label);
  const role=document.createElement('input');role.className='wf-full';role.type='text';role.maxLength=50;role.placeholder='Ansvarig roll (valfritt)';role.value=s.role;role.setAttribute('aria-label','Ansvarig roll steg '+(i+1));role.addEventListener('input',()=>{s.role=role.value;draw()});grid.appendChild(role);
  card.appendChild(grid);host.appendChild(card);
 })};
 const preset=k=>{const p=presets[k];$('wf-title').value=p.title;$('wf-subtitle').value=p.subtitle;steps=p.steps.map(([type,label,role])=>newStep(type,label,role));renderSteps();draw()};
 const filename=()=>{const base=safe($('wf-title').value,70).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/g,'-').replace(/^-|-$/g,'');return base||'arbetsflode'};
 const serialize=()=>{const svg=$('wf-diagram').cloneNode(true);svg.setAttribute('xmlns',NS);svg.setAttribute('width',$('wf-diagram').getAttribute('width'));svg.setAttribute('height',$('wf-diagram').getAttribute('height'));return new XMLSerializer().serializeToString(svg)};
 const download=(blob,extension)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename()+'.'+extension;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)};
 const raster=async(mime,ext)=>{try{const source=serialize(),url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml;charset=utf-8'}));const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});const scale=2,w=Number($('wf-diagram').getAttribute('width')),h=Number($('wf-diagram').getAttribute('height'));const canvas=document.createElement('canvas');canvas.width=w*scale;canvas.height=h*scale;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);canvas.toBlob(blob=>{if(blob)download(blob,ext);else alert('Kunde inte skapa bildfilen.')},mime,.94)}catch(e){console.error(e);alert('Bilden kunde inte exporteras. Prova SVG-formatet.')}};
 $('wf-png').addEventListener('click',()=>raster('image/png','png'));
 $('wf-jpg').addEventListener('click',()=>raster('image/jpeg','jpg'));
 $('wf-svg').addEventListener('click',()=>download(new Blob([serialize()],{type:'image/svg+xml;charset=utf-8'}),'svg'));
 $('wf-add-task').addEventListener('click',()=>{steps.push(newStep('task','Nytt arbetssteg',''));renderSteps();draw()});
 $('wf-add-decision').addEventListener('click',()=>{steps.push(newStep('decision','Är villkoret uppfyllt?',''));renderSteps();draw()});
 ['wf-title','wf-subtitle','wf-direction','wf-theme','wf-show-roles'].forEach(id=>$(id).addEventListener(id==='wf-title'||id==='wf-subtitle'?'input':'change',draw));
 root.querySelectorAll('[data-wf-preset]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.wfPreset)));
 preset('purchase');
})();
