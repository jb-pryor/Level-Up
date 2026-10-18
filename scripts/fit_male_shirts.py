"""Fit supplied shirt PNGs to aligned male bases; never modify source artwork."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ns={'__file__':str(ROOT/'output/imagegen/clean-bases/cleanup.py')}
exec((ROOT/'output/imagegen/clean-bases/cleanup.py').read_text().split('contours=json.loads')[0],ns)
read,write=ns['read_png'],ns['write_png']
DEST=ROOT/'public/avatars/shirts/fitted';DEST.mkdir(exist_ok=True)
W,H=1024,1536
# Three percent tighter than the original 570x465 envelope; collar stays anchored.
SHIRT_W,SHIRT_H=553,451
LEFT,TOP=237,438
for source in sorted((ROOT/'public/avatars/shirts').glob('*.png')):
 w,h,data=read(source)
 xs=[];ys=[]
 for y in range(h):
  for x in range(w):
   if data[(y*w+x)*4+3]>100:xs.append(x);ys.append(y)
 x0,y0,x1,y1=min(xs),min(ys),max(xs)+1,max(ys)+1
 out=bytearray(W*H*4)
 for y in range(SHIRT_H):
  sy=y0+(y+.5)*(y1-y0)/SHIRT_H-.5;iy=max(y0,min(y1-2,int(sy)));fy=max(0,min(1,sy-iy))
  for x in range(SHIRT_W):
   sx=x0+(x+.5)*(x1-x0)/SHIRT_W-.5;ix=max(x0,min(x1-2,int(sx)));fx=max(0,min(1,sx-ix));dst=((y+TOP)*W+x+LEFT)*4
   # Premultiplied bilinear resampling avoids dark fringes around transparent edges.
   weights=[((iy*w+ix)*4,(1-fx)*(1-fy)),((iy*w+ix+1)*4,fx*(1-fy)),(((iy+1)*w+ix)*4,(1-fx)*fy),(((iy+1)*w+ix+1)*4,fx*fy)]
   alpha=sum(data[i+3]*weight for i,weight in weights)
   if alpha<20:continue
   for k in range(3):out[dst+k]=round(sum(data[i+k]*data[i+3]*weight for i,weight in weights)/alpha)
   out[dst+3]=round(alpha)
 name=source.stem.lower().replace('shirt','')
 write(DEST/f'{name}.png',W,H,out)
 print(name,flush=True)
