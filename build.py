from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parent
entries=[]
for d in sorted((root/'verktyg').iterdir()):
 if not d.is_dir() or not (d/'meta.json').exists():continue
 m=json.loads((d/'meta.json').read_text())
 if not all(m.get(k) for k in ('id','name','category','description','icon')):raise ValueError(f'Ofullständig metadata: {d}')
 if m['id']!=d.name:raise ValueError(f'ID och mappnamn skiljer sig: {d}')
 if not (d/'view.html').exists():raise ValueError(f'view.html saknas: {d}')
 entries.append((m,d))
if len({m['id'] for m,d in entries})!=len(entries):raise ValueError('Dubblett-ID')
# Optional order: preserve curated initial order; new tools append.
order=['savings','period','anomaly','time','chart','peak','invest','procent','kalkylator']
entries.sort(key=lambda pair:(order.index(pair[0]['id']) if pair[0]['id'] in order else len(order),pair[0]['name']))
html=(root/'template.html').read_text();core=(root/'core.js').read_text()
core=re.sub(r'const tools=\[.*?\];', lambda match:'const tools='+json.dumps([m for m,d in entries],ensure_ascii=False,separators=(',',':'))+';',core,count=1,flags=re.S)
if 'const tools=' not in core:raise ValueError('Verktygsregistret saknas')
views='\n'.join((d/'view.html').read_text() for m,d in entries)
styles='\n'.join('<style>\n'+(d/'style.css').read_text()+'\n</style>' for m,d in entries if (d/'style.css').exists())
scripts='\n'.join('<script>\n'+(d/'logic.js').read_text().replace('</script','<\\/script')+'\n</script>' for m,d in entries if (d/'logic.js').exists())
for marker,value in [('<!-- TOOL_VIEWS -->',views),('<!-- TOOL_STYLES -->',styles),('<!-- CORE_SCRIPT -->','<script>\n'+core+'\n</script>'),('<!-- TOOL_SCRIPTS -->',scripts)]:
 if html.count(marker)!=1:raise ValueError(f'Markör saknas eller är duplicerad: {marker}, antal {html.count(marker)}')
 html=html.replace(marker,value)
# Static counters must be derived from metadata too, not hand maintained.
html=re.sub(r'(<[^>]*id="(?:tool-count|fl-tool-count|hero-tool-count)"[^>]*>)(?:\d+)(</)',lambda x:x.group(1)+str(len(entries)).zfill(2)+x.group(2),html)
(root/'index.html').write_text(html)
print(f'Byggde index.html med {len(entries)} funktioner ({len(html):,} tecken)')
