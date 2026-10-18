"""Fit the supplied pants to aligned male bases without changing the source."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ns={'__file__':str(ROOT/'output/imagegen/clean-bases/cleanup.py')};exec((ROOT/'output/imagegen/clean-bases/cleanup.py').read_text().split('contours=json.loads')[0],ns)
w,h,data=ns['read_png'](ROOT/'public/avatars/pants/pants-default.png');out=bytearray(1024*1536*4)
# Widen hips 6.5%, taper gently toward the original cuff positions.
for y in range(520):
 sy=1190+(y+.5)*535/520-.5;iy=int(sy);fy=sy-iy
 scale=1.065-(1.065-.95)*min(1,y/(520*.8))
 for x in range(290,740):
  sx=(x-515)/scale+512;ix=int(sx);fx=sx-ix;b=((y+875)*1024+x)*4
  samples=[((iy*w+ix)*4,(1-fx)*(1-fy)),((iy*w+ix+1)*4,fx*(1-fy)),(((iy+1)*w+ix)*4,(1-fx)*fy),(((iy+1)*w+ix+1)*4,fx*fy)]
  a=sum(data[i+3]*v for i,v in samples)
  if a<20:continue
  for k in range(3):out[b+k]=round(sum(data[i+k]*data[i+3]*v for i,v in samples)/a)
  out[b+3]=round(a)
ns['write_png'](ROOT/'public/avatars/pants/male-default-fitted.png',1024,1536,out)
W,H=260,330;sheet=bytearray([247,250,255,255]*(W*3*H))
for c in range(3):
 _,_,base=ns['read_png'](ROOT/f'public/avatars/new-male-bases/Aligned-Avatars/Complexion-{c+1}-neutral.png')
 for y in range(H):
  sy=820+int(y*650/H)
  for x in range(W):
   sx=270+int(x*490/W);a=(sy*1024+sx)*4;b=(y*W*3+c*W+x)*4
   for d in [base,out]:
    alpha=d[a+3]/255
    for k in range(3):sheet[b+k]=round(d[a+k]*alpha+sheet[b+k]*(1-alpha))
ns['write_png'](Path('/private/tmp/levelup-pants-fit.png'),W*3,H,sheet)
