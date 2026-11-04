"""Create a portable ZIP with explicit POSIX directory records for TapTap's parser."""
from pathlib import Path
import hashlib
import json
import zipfile
root = Path(__file__).resolve().parent.parent
out = root / 'release' / 'taptap'
files = [root / 'index.html', root / 'assets' / 'icon.svg']
for folder in ('css','js'):
    files.extend(p for p in (root/folder).rglob('*') if p.is_file())
target = out / 'walk-with-me-h5-1.0.0-portable.zip'
with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    for directory in ('game/', 'game/assets/', 'game/css/', 'game/js/'):
        record = zipfile.ZipInfo(directory, date_time=(2026,11,4,0,0,0))
        record.create_system = 3
        record.external_attr = (0o40755 << 16) | 0x10
        archive.writestr(record, b'')
    for source in sorted(files):
        record = zipfile.ZipInfo('game/' + source.relative_to(root).as_posix(), date_time=(2026,11,4,0,0,0))
        record.create_system = 3
        record.external_attr = 0o100644 << 16
        record.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(record,source.read_bytes())
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    for source in files:
        assert archive.read('game/'+source.relative_to(root).as_posix()) == source.read_bytes()
manifest={'file':target.name,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'runtime_files':len(files),'layout':'single explicit game/ directory; POSIX separators and file attributes','reason':'initial CLI preflight passed but remote parser rejected archive; do not retry failed artifact'}
(out/'h5-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(manifest,indent=2))
