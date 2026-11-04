from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
im = Image.new('RGBA', (256, 256), '#142329')
d = ImageDraw.Draw(im)
d.rounded_rectangle((1, 1, 254, 254), 55, fill='#142329')
d.line([(70, 64), (120, 122), (70, 180), (20, 122), (70, 64)], fill='#baafe2', width=7)
d.ellipse((130, 80, 218, 168), fill='#f0ddb0')
d.ellipse((146, 94, 168, 116), fill='#fff6d7')
im.save(root / 'assets' / 'icon.ico', sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
