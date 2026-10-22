"""Static preview for the complete portal; supervisor flags are intentionally ignored."""
import os
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
root=Path(__file__).resolve().parents[1]/'dist'
ThreadingHTTPServer(('0.0.0.0',int(os.environ.get('PORT','4173'))),partial(SimpleHTTPRequestHandler,directory=str(root))).serve_forever()
