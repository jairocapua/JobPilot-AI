import sys, json
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from pathlib import Path

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

labels = {
    0: "AI Agent Architecture",
    1: "Project Config & Guidelines",
    2: "Landing Page Design System",
    3: "Profile Page UI Design",
    4: "Build Plan & Progress Tracking",
    5: "Auth & App Shell",
    6: "Homepage & Profile Components",
    7: "Dashboard UI Design",
    8: "Job Listings UI",
    9: "InsForge Client & Auth Config",
    10: "Feature Band 1 Design",
    11: "Dashboard Demo Screenshot",
    12: "AI Action Log Design",
    13: "Job Match Table Design",
    14: "Footer & CTA Design",
    15: "Navbar & Hero Design",
    16: "Find Jobs Page Design",
    17: "Job Details Page Design",
    18: "Database Schema & Migrations",
    19: "Agent Log UI Asset",
    20: "Testimonial & Confidence Design",
    21: "Analytics (PostHog)",
    22: "Project Config Files",
    23: "Brand Logo",
    24: "User Avatar Asset",
    25: "Singleton Node",
    26: "Singleton Node",
    27: "Singleton Node",
    28: "Singleton Node",
    29: "Singleton Node",
    30: "Singleton Node",
    31: "Singleton Node",
    32: "Singleton Node",
    33: "Singleton Node",
    34: "Singleton Node",
    35: "Singleton Node",
    36: "Singleton Node",
    37: "Singleton Node",
    38: "Singleton Node",
    39: "Singleton Node",
    40: "Singleton Node",
    41: "Singleton Node",
    42: "Singleton Node",
    43: "Singleton Node",
}

questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding='utf-8')
print('Report updated with community labels')
