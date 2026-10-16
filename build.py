from pathlib import Path
import json, re

root=Path(__file__).resolve().parent
template=(root/'template.html').read_text(encoding='utf-8')
entries=[]
for folder in (root/'verktyg').iterdir():
    if not folder.is_dir() or not (folder/'meta.json').is_file():
        continue
    meta=json.loads((folder/'meta.json').read_text(encoding='utf-8'))
    if meta.get('id')!=folder.name or not all(meta.get(k) for k in ('name','category','description','icon')):
        raise ValueError(f'Felaktig meta.json: {folder}')
    if not (folder/'view.html').is_file():
        raise ValueError(f'Saknar view.html: {folder}')
    entries.append((meta,folder))
if len({m['id'] for m,d in entries})!=len(entries):
    raise ValueError('Dubbletter i verktygs-ID')
# Existing tool order is stable; new tools are appended alphabetically.
order=['savings','period','anomaly','chart','peak','invest','scenario','workflow','aterbruk','forandringar']
entries.sort(key=lambda x:(order.index(x[0]['id']) if x[0]['id'] in order else len(order), x[0]['id']))

core=(root/'core.js').read_text(encoding='utf-8')
new_registry='const tools='+json.dumps([m for m,d in entries],ensure_ascii=False,separators=(',',':'))+';'
core,n=re.subn(r'const tools=\[.*?\];',lambda m:new_registry,core,count=1,flags=re.S)
if n!=1:raise ValueError('Kan inte hitta verktygsregistret i core.js')
if template.count('<!-- FL_CORE -->')!=1:raise ValueError('Saknar kärnmarkör')
html=template.replace('<!-- FL_CORE -->','<script>\n'+core.replace('</script','<\\/script')+'\n</script>')
for kind,filename in [('VIEW','view.html'),('STYLE','style.css'),('SCRIPT','logic.js')]:
    for meta,folder in entries:
        marker=f'<!-- FL_{kind}_{meta["id"]} -->'
        f=folder/filename
        if not f.exists():
            if marker in html:html=html.replace(marker,'')
            continue
        value=f.read_text(encoding='utf-8')
        if kind=='STYLE':value='<style>\n'+value+'\n</style>'
        if kind=='SCRIPT':value='<script>\n'+value.replace('</script','<\\/script')+'\n</script>'
        if marker in html:
            if html.count(marker)!=1:raise ValueError(f'Dubblettmarkör: {marker}')
            if kind=='VIEW' and html.find(marker)>html.find('</main>'):
                # Repair legacy templates with view markers misplaced after </main>.
                html=html.replace(marker,'')
                home_marker='<div id="home-view"'
                if html.count(home_marker)!=1:
                    raise ValueError('Kan inte hitta unik plats före startsidan')
                html=html.replace(home_marker,value+'\n'+home_marker,1)
            else:
                html=html.replace(marker,value)
        else:
            # Newly added tools are inserted alongside existing tool views/styles/scripts.
            anchor=f'<!-- FL_NEW_{kind} -->'
            if html.count(anchor)!=1:raise ValueError(f'Saknar plats för nytt verktyg: {anchor}')
            if kind=='VIEW':
                # New tool views must live inside <main class="content">,
                # alongside the existing tool views, not at the end of <body>.
                home_marker='<div id="home-view"'
                if html.count(home_marker)!=1:
                    raise ValueError('Kan inte hitta unik plats före startsidan')
                html=html.replace(home_marker,value+'\n'+home_marker,1)
            else:
                html=html.replace(anchor,value+'\n'+anchor)
for kind in ('VIEW','STYLE','SCRIPT'):
    html=html.replace(f'<!-- FL_NEW_{kind} -->','')
# Counters in the homepage and sidebar are also updated at runtime by core.js.
for id in ('fl-published-hero','fl-published-stat'):
    html=re.sub(r'(<[^>]+id="'+id+r'"[^>]*>)\s*\d+\s*(</)',lambda m:m.group(1)+str(len(entries)).zfill(2)+m.group(2),html)
(root/'index.html').write_text(html,encoding='utf-8')
print(f'Byggde index.html: {len(entries)} funktioner')
