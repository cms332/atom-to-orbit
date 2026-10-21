"""Download licensed Solar System Scope maps; keep small, locally served WebP derivatives.

Source: https://www.solarsystemscope.com/textures/ — CC BY 4.0.
Run only when updating the checked-in assets, never during site builds.
"""
from pathlib import Path
from urllib.request import urlopen
from io import BytesIO
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'static' / 'orbit' / 'textures'
root.mkdir(parents=True, exist_ok=True)
maps = {
    'mercury': 'mercury', 'venus': 'venus_atmosphere', 'earth': 'earth_daymap',
    'mars': 'mars', 'jupiter': 'jupiter', 'saturn': 'saturn', 'uranus': 'uranus',
    'neptune': 'neptune', 'sun': 'sun', 'earth-clouds': 'earth_clouds',
}
for name, source in maps.items():
    url = f'https://www.solarsystemscope.com/textures/download/2k_{source}.jpg'
    with urlopen(url, timeout=45) as response:
        original = Image.open(BytesIO(response.read())).convert('RGB')
    original.resize((1024, 512), Image.Resampling.LANCZOS).save(root / f'{name}.webp', quality=83)
    print(name, (root / f'{name}.webp').stat().st_size)
