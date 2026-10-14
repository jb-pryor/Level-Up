from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
ns={'__file__':str(ROOT/'output/imagegen/clean-bases/cleanup.py')}
exec((ROOT/'output/imagegen/clean-bases/cleanup.py').read_text().split('contours=json.loads')[0],ns)
read,write=ns['read_png'],ns['write_png'];cache={}
def image(name):
    if name not in cache:cache[name]=read(ROOT/'public/avatars'/name)
    return cache[name]
W,H=240,390; sheet=bytearray(W*6*H*4)
def add(canvas,name,transform=(0,0,1),color=None):
    sw,sh,data=image(name);tx,ty,scale=transform
    for y in range(H):
        py=y*1626/H-90;sy=int((py-ty)/scale)
        if not 0<=sy<sh:continue
        for x in range(W):
            sx=int((x*1024/W-tx)/scale)
            if not 0<=sx<sw:continue
            src=(sy*sw+sx)*4;a=data[src+3]/255
            if not a:continue
            dst=(y*W+x)*4;rgb=list(data[src:src+3])
            if color:rgb=[min(255,round(sum(rgb)*c)) for c in color]
            for k in range(3):canvas[dst+k]=round(rgb[k]*a+canvas[dst+k]*(1-a))
for panel in range(6):
    base='base-a' if panel<3 else 'base-b';style='long' if panel%3==1 else 'short';dressed=panel%3==2
    transform=((180,-35,.65) if base=='base-a' else (222,4,.565)) if style=='short' else ((-43,-35,1.085) if base=='base-a' else (0,0,1))
    canvas=bytearray([246,247,244,255]*(W*H))
    if style=='long':add(canvas,'hair/long-back.png',transform)
    add(canvas,base+'.png')
    if dressed:
        add(canvas,base+'-mouth.png');add(canvas,base+'-shirt.png',color=(.09,.31,.18));add(canvas,base+'-shoes.png')
    add(canvas,'hair/'+('long-front' if style=='long' else 'short')+'.png',transform)
    if dressed:add(canvas,base+'-hat.png')
    for y in range(H):sheet[(y*W*6+panel*W)*4:(y*W*6+(panel+1)*W)*4]=canvas[y*W*4:(y+1)*W*4]
write(ROOT/'output/imagegen/build-assets/combination-check.png',W*6,H,sheet)
