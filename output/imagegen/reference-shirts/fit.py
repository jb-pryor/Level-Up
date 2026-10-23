"""Rebuild body-specific shirt overlays from generated sources; requires Pillow. Run with /usr/bin/python3 on this Mac."""
from PIL import Image, ImageDraw
from pathlib import Path
import json,math
root=Path(__file__).resolve().parents[3]; assets=json.loads((Path(__file__).parent/'prompts.json').read_text()); assets=[{**a,'path':str(root/f'public/avatars/shirts/reference-collection/{a["id"]}.png')} for a in assets]
# Fixed canonical overlays for both avatar bodies. Separate sleeve depth preserves a hip-length torso.
for a in assets:
 im=Image.open(a['path']).convert('RGBA');box=im.getchannel('A').point(lambda a:255 if a>90 else 0).getbbox();im=im.crop(box)
 long=a['id'] not in ['tie-dye-tee','neon-trip-tee']
 for gender in ['male','female']:
  female=gender=='female';tw=(454 if female else 552) if not long else (570 if female else 690);th=(415 if female else 435);top=425 if female else 442
  # Long-sleeve sprites need extra length only along the arms, not at the shirt hem.
  if long:th=415 if female else 435
  iw,ih=im.size;mesh=[]
  if long:th+=18
  def depth(u):return th+(90 if female else 105)*min(1,max(0,(abs(u-.5)-.29)/.12)) if long else th
  def inverse(x,y):
   v=(y-top)/th;u=.5+(x-512)/tw
   for _ in range(8):
    width=1+((0.20 if female else 0.16)*math.sin(math.pi*max(0,min(1,v)))-.07*max(0,min(1,v))) if long else 1
    u=.5+(x-512)/(tw*width);v=(y-top)/depth(u)
   return u*iw,v*ih
  for y in range(0,1536,16):
   for x in range(0,1024,16):
    mesh.append(((x,y,x+16,y+16),(*inverse(x,y),*inverse(x,y+16),*inverse(x+16,y+16),*inverse(x+16,y))))
  result=im.transform((1024,1536),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
  target=root/f'public/avatars/shirts/reference-collection/{gender}-{a["id"]}.png';result.save(target)
