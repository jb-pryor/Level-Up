"""Match supplied hair colors to the black reference canvas and alpha bounds."""
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parents[1]
ns={'__file__':str(ROOT/'output/imagegen/clean-bases/cleanup.py')}
exec((ROOT/'output/imagegen/clean-bases/cleanup.py').read_text().split('contours=json.loads')[0],ns)
read,write=ns['read_png'],ns['write_png'];source=ROOT/'public/avatars/hair/newHair';dest=source/'fitted';dest.mkdir(exist_ok=True)
shutil.copyfile(source/'hair-swoosh-black.png',dest/'black.png')
for color in ['Brown','Blonde','Gray']:
 w,h,data=read(source/f'hairSwoosh{color}.png');xs=[];ys=[]
 for y in range(h):
  for x in range(w):
   if data[(y*w+x)*4+3]>120:xs.append(x);ys.append(y)
 x0,y0,x1,y1=min(xs),min(ys),max(xs)+1,max(ys)+1
 out=bytearray(1024*1800*4)
 for y in range(294):
  sy=y0+(y+.5)*(y1-y0)/294-.5;iy=max(y0,min(y1-2,int(sy)));fy=max(0,min(1,sy-iy))
  for x in range(424):
   sx=x0+(x+.5)*(x1-x0)/424-.5;ix=max(x0,min(x1-2,int(sx)));fx=max(0,min(1,sx-ix));b=((y+78)*1024+x+308)*4
   samples=[((iy*w+ix)*4,(1-fx)*(1-fy)),((iy*w+ix+1)*4,fx*(1-fy)),(((iy+1)*w+ix)*4,(1-fx)*fy),(((iy+1)*w+ix+1)*4,fx*fy)]
   a=sum(data[i+3]*v for i,v in samples)
   if a<20:continue
   for k in range(3):out[b+k]=round(sum(data[i+k]*data[i+3]*v for i,v in samples)/a)
   out[b+3]=round(a)
 write(dest/f'{color.lower()}.png',1024,1800,out);print(color,flush=True)
