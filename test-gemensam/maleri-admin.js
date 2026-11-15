
(()=>{
'use strict';
const url='https://txkiuefjxzhhlkpvenlv.supabase.co';
const key='sb_publishable_UaKyDk59piS0HTTkir5BQA_wBM22m1b';
const customerId=window.FL_CUSTOMER.id;
let token=null;
const request=async(path,options={})=>{
 const response=await fetch(url+path,{...options,headers:{apikey:key,...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json',...(options.headers||{})}});
 if(!response.ok){const detail=await response.text();throw Error('HTTP '+response.status+': '+detail.slice(0,250))}
 return response.status===204?null:response.json();
};
const fields=[
['walls.laborPerM2','Väggar, arbete (kr/m²)'],['walls.materialPerM2','Väggar, material (kr/m²)'],
['ceiling.laborPerM2','Tak, arbete (kr/m²)'],['ceiling.materialPerM2','Tak, material (kr/m²)'],
['facade.laborPerM2','Fasad, arbete (kr/m²)'],['facade.materialPerM2','Fasad, material (kr/m²)'],
['preparationMultiplier.good','Bra underlag (faktor)'],['preparationMultiplier.medium','Normalt underlag (faktor)'],['preparationMultiplier.poor','Dåligt underlag (faktor)'],
['coatsMultiplier.1','1 strykning (faktor)'],['coatsMultiplier.2','2 strykningar (faktor)'],['coatsMultiplier.3','3 strykningar (faktor)'],
['difficultAccessMultiplier','Svår åtkomst (faktor)'],['coverFixed','Skyddstäckning (kr)'],['minPriceExVat','Minimipris exkl. moms (kr)'],
['vatRate','Moms (andel, t.ex. 0,25)'],['rotIllustrationRate','ROT, illustrativ andel (t.ex. 0,30)']
];
const rules=COMPANY.priceRules;
const get=(path)=>path.split('.').reduce((obj,key)=>obj[key],rules);
const set=(path,value)=>{const keys=path.split('.');let obj=rules;for(let i=0;i<keys.length-1;i++)obj=obj[keys[i]];obj[keys[keys.length-1]]=value};
const defaults=Object.fromEntries(fields.map(([key])=>[key,get(key)]));
const apply=(values)=>{for(const [key] of fields){const v=values[key];if(typeof v==='number'&&Number.isFinite(v)&&v>=0)set(key,v)}};
const load=async()=>{
 const rows=await request('/rest/v1/fl_price_settings?customer_id=eq.'+encodeURIComponent(customerId)+'&select=settings');
 if(rows.length&&rows[0].settings){apply(rows[0].settings);calculate()}
};
const overlay=document.getElementById('flAdminOverlay'),grid=document.getElementById('flAdminGrid'),status=document.getElementById('flAdminStatus');
for(const [key,label] of fields){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type='number';input.step='any';input.min='0';input.required=true;input.dataset.priceKey=key;l.appendChild(input);grid.appendChild(l)}
const populate=()=>{for(const input of grid.querySelectorAll('input'))input.value=get(input.dataset.priceKey)};
const login=document.getElementById('flAdminLogin'),form=document.getElementById('flAdminForm'),logout=document.getElementById('flAdminLogout');
const open=()=>{populate();status.textContent='';overlay.hidden=false};
const close=()=>{overlay.hidden=true};
const authUI=()=>{login.hidden=!!token;login.style.display=token?'none':'grid';form.hidden=!token;logout.hidden=!token};
authUI();
document.getElementById('flAdminLink').addEventListener('click',open);
document.getElementById('flAdminClose').addEventListener('click',close);
overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close()});
login.addEventListener('submit',async e=>{
 e.preventDefault();status.textContent='Loggar in…';
 try{
  const auth=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:document.getElementById('flAdminEmail').value,password:document.getElementById('flAdminPassword').value})});
  token=auth.access_token;
  const access=await request('/rest/v1/fl_admin_access?select=role,customer_id');
  if(!access.some(a=>a.role==='owner'||(a.role==='customer_admin'&&a.customer_id===customerId)))throw Error('Kontot saknar behörighet till denna kund.');
  document.getElementById('flAdminPassword').value='';authUI();status.textContent='Inloggad.';
 }catch(err){token=null;authUI();status.textContent='Inloggningen misslyckades: '+err.message}
});
logout.addEventListener('click',()=>{token=null;authUI();status.textContent='Utloggad.'});
form.addEventListener('submit',async e=>{
 e.preventDefault();const values={};for(const input of grid.querySelectorAll('input')){const v=Number(input.value);if(!Number.isFinite(v)||v<0){status.textContent='Kontrollera värdena.';return}values[input.dataset.priceKey]=v}
 status.textContent='Sparar…';
 try{
  const updated=await request('/rest/v1/fl_price_settings?customer_id=eq.'+encodeURIComponent(customerId),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({settings:values,updated_at:new Date().toISOString()})});
  if(!Array.isArray(updated)||updated.length!==1)throw Error('Ingen rad uppdaterades. Kontrollera RLS-behörigheten.');
  apply(values);calculate();status.textContent='Priserna har sparats i Supabase.';
 }catch(err){status.textContent='Kunde inte spara: '+err.message}
});
document.getElementById('flAdminReset').addEventListener('click',()=>{apply(defaults);populate();calculate();status.textContent='Grundpriserna visas. Klicka Spara priser för att lagra dem.'});
load().catch(err=>{console.warn('Kunde inte hämta priser',err);status.textContent='Kunde inte hämta priser från Supabase. Kontrollera läsbehörighet.'});
calculate();
})();
