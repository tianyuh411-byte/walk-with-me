"""Verify shipped bytes, archive integrity, platform executable and SHA-256 manifest."""
import hashlib
import json
from pathlib import Path
import struct
import zipfile

root = Path(__file__).resolve().parent.parent
release = root / 'release'
runtime = [root / 'index.html']
for folder in ('js', 'css', 'assets'):
    runtime.extend(p for p in (root / folder).rglob('*') if p.is_file())

results = []
for name in ('Walk-With-Me-Windows-x64.zip', 'Walk-With-Me-Browser.zip', 'Walk-With-Me-Source.zip'):
    with zipfile.ZipFile(release / name) as z:
        assert z.testzip() is None, name
        entries = {i.filename.replace('\\', '/'): i for i in z.infolist() if not i.is_dir()}
        assert not any(any(part in p.split('/') for part in ('node_modules', 'vendor', 'artifacts', '.local-browser', '.git')) for p in entries)
        prefix = 'Walk-With-Me-Windows-x64/game/' if 'Windows' in name else ''
        for source in runtime:
            relative = source.relative_to(root).as_posix()
            assert z.read(entries[prefix + relative]) == source.read_bytes(), (name, relative)
        if 'Windows' in name:
            base = 'Walk-With-Me-Windows-x64/'
            for required in ('Microsoft.Web.WebView2.Core.dll', 'Microsoft.Web.WebView2.WinForms.dll', 'WebView2Loader.dll', 'WEBVIEW2-LICENSE.txt', 'WEBVIEW2-NOTICE.txt', 'README-WINDOWS.txt', 'CREDITS.md'):
                assert len(z.read(entries[base + required])) > 0, required
            exe = z.read(entries[base + 'Walk With Me.exe'])
            assert exe[:2] == b'MZ'
            pe = struct.unpack_from('<I', exe, 0x3c)[0]
            assert exe[pe:pe + 4] == b'PE\0\0'
            assert struct.unpack_from('<H', exe, pe + 4)[0] == 0x8664, 'x64 executable'
            assert exe == (release / 'Walk-With-Me-Windows-x64' / 'Walk With Me.exe').read_bytes()
        if 'Source' in name:
            for required in ('README.md', 'package.json', 'tools/DesktopHost.cs', 'tools/build.ps1', 'docs/JAM.md', 'docs/VERIFICATION.md', 'docs/SUBMISSION.md', 'tests/engine.test.cjs'):
                assert z.read(entries[required]) == (root / required).read_bytes(), required
        results.append({'file': name, 'files': len(entries), 'bytes': (release / name).stat().st_size})

for line in (release / 'SHA256SUMS.txt').read_text().splitlines():
    digest, name = line.split(None, 1)
    assert hashlib.sha256((release / name.strip()).read_bytes()).hexdigest().lower() == digest.lower(), name

(release / 'VALIDATION.json').write_text(json.dumps({'status': 'passed', 'archives': results, 'checks': ['ZIP CRC integrity', 'all shipped runtime bytes equal source', 'Windows PE x64 executable', 'WebView2 dependencies and notices', 'source and documentation included', 'SHA-256 manifest']}, indent=2), encoding='utf-8')
print('PASS release integrity: 3 ZIPs, complete EN/ZH game files, actual Windows x64 EXE, dependencies/licenses, full source, SHA-256.')
