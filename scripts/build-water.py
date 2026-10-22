"""Synchronize the embedded, offline-compatible water application and published assets."""
from pathlib import Path
import re, shutil
root=Path(__file__).resolve().parents[1]
p=root/'index.html';s=p.read_text()
for id,path in [('growa-agua-portal-v22','agua/portal-v22.css'),('growa-agua-core-v22','agua/portal-v22.js')]:
 tag='style' if path.endswith('.css') else 'script'
 pattern=rf'(<{tag} id="{id}">)[\s\S]*?(</{tag}>)'
 s,n=re.subn(pattern,lambda m:m[1]+'\n'+(root/path).read_text()+'\n'+m[2],s)
 assert n==1,(id,n)
s=re.sub(r'<style id="growa-water-observatory-v23">[\s\S]*?</style>','',s)
s=s.replace('</head>','<style id="growa-water-observatory-v23">\n'+(root/'agua/observatory-v23.css').read_text()+'\n</style>\n</head>')
s=s.replace('class="section-panel w17-root"','class="section-panel w17-root w22-detail-collapsed"')
s=s.replace('Sitios resumidos en la base integrada; no número de muestras','Observaciones individuales de calidad; sin fecha de muestreo')
p.write_text(s)
for f in ['index.html','agua/portal-v22.css','agua/portal-v22.js','agua/observatory-v23.css','data/agua-v9.json']:
 dst=root/'dist'/f;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/f,dst)
print('Water application and published assets synchronized.')
