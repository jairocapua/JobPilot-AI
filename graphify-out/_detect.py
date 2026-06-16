import json
from graphify.detect import detect
from pathlib import Path
result = detect(Path('.'))
Path('graphify-out/.graphify_detect.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
summary = {
    'total_files': result.get('total_files'),
    'total_words': result.get('total_words'),
    'files': {k: len(v) for k, v in result.get('files', {}).items()},
    'skipped_sensitive': result.get('skipped_sensitive', []),
    'scan_root': result.get('scan_root', ''),
}
print(json.dumps(summary, ensure_ascii=False, indent=2))
