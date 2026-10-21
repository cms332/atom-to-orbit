"""Rebuild the licensed, renamed web subset after changing Korean copy.
Requires fonttools and brotli: python -m pip install fonttools brotli.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
text = ''.join(chr(i) for i in range(32, 127))
for path in (root / 'src').rglob('*'):
    if path.suffix in {'.svelte', '.ts'}:
        text += path.read_text(encoding='utf-8')
font = TTFont(root / 'scripts/fonts/SUIT-Variable.woff2')
options = subset.Options()
options.flavor = 'woff2'
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
# Respect the original SUIT Reserved Font Name for the modified font.
for record in font['name'].names:
    if record.nameID in (1, 2, 3, 4, 6, 16, 17):
        value = 'Regular' if record.nameID in (2, 17) else 'A2OSansSubset' if record.nameID == 6 else 'A2O Sans Subset'
        record.string = value.encode(record.getEncoding())
font.flavor = 'woff2'
font.save(root / 'static/fonts/A2OSans-Subset.woff2')
print('Web subset:', (root / 'static/fonts/A2OSans-Subset.woff2').stat().st_size, 'bytes')
