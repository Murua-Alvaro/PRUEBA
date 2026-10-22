"""Package the agricultural host; water platform assets are versioned in dist/agua."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
for name in ['index.html','styles.css','app.js','data/analysis-pack.b64','data/agua-v9.json']:
 dst=root/'dist'/name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/name,dst)
print('Agricultural host and water integration packaged.')
