import json
from pathlib import Path

analysis = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))
communities = analysis['communities']

# Show top 25 communities with their first few node IDs
for cid in sorted(communities.keys(), key=lambda x: len(communities[x]), reverse=True)[:25]:
    nodes = communities[cid]
    print(f'Community {cid} ({len(nodes)} nodes): {nodes[:5]}')
