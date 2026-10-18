"""Normalize new shoe variants to the existing fitted male sneaker bounds.
The original green/white fitted pair is the reference and is never overwritten.
"""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ns={'__file__':str(ROOT/'output/imagegen/clean-bases/cleanup.py')};exec((ROOT/'output/imagegen/clean-bases/cleanup.py').read_text().split('contours=json.loads')[0],ns)
read,write=ns['read_png'],ns['write_png'];folder=ROOT/'public/avatars/shoes';dest=folder/'fitted';dest.mkdir(exist_ok=True)
for source in sorted(folder.glob('*-shoes.png')):
 w,h,data=read(source);xs=[];ys=[]
 for y in range(h):
  for x in range(w):
   if data[(y*w+x)*4+3]>100:xs.append(x);ys.append(y)
 x0,y0,x1,y1=min(xs),min(ys),max(xs)+1,max(ys)+1;out=bytearray(1024*1536*4)
 for y in range(166):
  sy=y0+(y+.5)*(y1-y0)/166-.5;iy=max(y0,min(y1-2,int(sy)));fy=max(0,min(1,sy-iy))
  for x in range(540):
   sx=x0+(x+.5)*(x1-x0)/540-.5;ix=max(x0,min(x1-2,int(sx)));fx=max(0,min(1,sx-ix));b=((y+1370)*1024+x+244)*4
   samples=[((iy*w+ix)*4,(1-fx)*(1-fy)),((iy*w+ix+1)*4,fx*(1-fy)),(((iy+1)*w+ix)*4,(1-fx)*fy),(((iy+1)*w+ix+1)*4,fx*fy)]
   a=sum(data[i+3]*v for i,v in samples)
   if a<20:continue
   for k in range(3):out[b+k]=round(sum(data[i+k]*data[i+3]*v for i,v in samples)/a)
   out[b+3]=round(a)
 write(dest/source.name,1024,1536,out);print(source.name,flush=True)
