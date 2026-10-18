"""Adapt supplied taller-canvas shoes to the aligned male base; keep source intact."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ns={'__file__':str(ROOT/'output/imagegen/clean-bases/cleanup.py')};exec((ROOT/'output/imagegen/clean-bases/cleanup.py').read_text().split('contours=json.loads')[0],ns)
w,h,data=ns['read_png'](ROOT/'public/avatars/shoes/shoes.png');out=bytearray(1024*1536*4)
# Alpha bounds of the supplied pair, fitted over ankles and beyond the bare toes.
x0,y0,x1,y1=217,1705,810,1875
for y in range(166):
 sy=y0+(y+.5)*(y1-y0)/166-.5;iy=max(y0,min(y1-2,int(sy)));fy=max(0,min(1,sy-iy))
 for x in range(540):
  sx=x0+(x+.5)*(x1-x0)/540-.5;ix=max(x0,min(x1-2,int(sx)));fx=max(0,min(1,sx-ix));b=((y+1370)*1024+x+244)*4
  samples=[((iy*w+ix)*4,(1-fx)*(1-fy)),((iy*w+ix+1)*4,fx*(1-fy)),(((iy+1)*w+ix)*4,(1-fx)*fy),(((iy+1)*w+ix+1)*4,fx*fy)]
  a=sum(data[i+3]*v for i,v in samples)
  if a<20:continue
  for k in range(3):out[b+k]=round(sum(data[i+k]*data[i+3]*v for i,v in samples)/a)
  out[b+3]=round(a)
ns['write_png'](ROOT/'public/avatars/shoes/male-sneakers-fitted.png',1024,1536,out)
# A close-up for checking bare-toe and ankle coverage.
_,_,base=ns['read_png'](ROOT/'public/avatars/new-male-bases/Aligned-Avatars/Complexion-2-neutral.png');W,H=620,300;preview=bytearray([247,250,255,255]*(W*H))
for y in range(H):
 sy=1250+int(y*286/H)
 for x in range(W):
  sx=210+x;a=(sy*1024+sx)*4;b=(y*W+x)*4
  for d in [base,out]:
   alpha=d[a+3]/255
   for k in range(3):preview[b+k]=round(d[a+k]*alpha+preview[b+k]*(1-alpha))
ns['write_png'](Path('/private/tmp/levelup-shoes-fit.png'),W,H,preview)
