import json
from pathlib import Path
d = json.loads(Path('graphify-out/.graphify_ast.json').read_text(encoding='utf-8'))
print(f'nodes: {len(d["nodes"])}, edges: {len(d["edges"])}')
