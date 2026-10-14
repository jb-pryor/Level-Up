"""Dependency-free PNG cutout cleanup; explicitly authorized by the learner."""
import json, math, struct, zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def read_png(path):
    blob = path.read_bytes(); pos = 8; packed = bytearray()
    while pos < len(blob):
        size = struct.unpack('>I', blob[pos:pos+4])[0]
        kind = blob[pos+4:pos+8]; value = blob[pos+8:pos+8+size]; pos += size+12
        if kind == b'IHDR':
            w,h,depth,color,_,_,interlace = struct.unpack('>IIBBBBB',value)
            assert (depth,color,interlace)==(8,6,0)
        if kind == b'IDAT': packed.extend(value)
    raw=zlib.decompress(packed); stride=w*4; previous=bytearray(stride); pos=0; result=bytearray()
    for _ in range(h):
        f=raw[pos]; pos+=1; row=bytearray(raw[pos:pos+stride]); pos+=stride
        for x in range(stride):
            a=row[x-4] if x>=4 else 0; b=previous[x]; c=previous[x-4] if x>=4 else 0
            if f==1: predictor=a
            elif f==2: predictor=b
            elif f==3: predictor=(a+b)//2
            elif f==4:
                p=a+b-c; da,db,dc=abs(p-a),abs(p-b),abs(p-c)
                predictor=a if da<=db and da<=dc else b if db<=dc else c
            else: predictor=0
            row[x]=(row[x]+predictor)&255
        result.extend(row); previous=row
    return w,h,result

def write_png(path,w,h,pixels):
    def chunk(kind,value):
        return struct.pack('>I',len(value))+kind+value+struct.pack('>I',zlib.crc32(kind+value)&0xffffffff)
    scan=b''.join(b'\0'+pixels[y*w*4:(y+1)*w*4] for y in range(h))
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(scan,6))+chunk(b'IEND',b''))

def smooth(points):
    result=[]; n=len(points)
    for i in range(n):
        a,b,c,d=points[(i-1)%n],points[i],points[(i+1)%n],points[(i+2)%n]
        c1=[b[k]+(c[k]-a[k])*.12 for k in (0,1)]; c2=[c[k]-(d[k]-b[k])*.12 for k in (0,1)]
        for j in range(8):
            t=j/8; u=1-t
            result.append([u*u*u*b[k]+3*u*u*t*c1[k]+3*u*t*t*c2[k]+t*t*t*c[k] for k in (0,1)])
    return result

def matte(w,h,points):
    # Four subpixel scanlines per row, with fractional horizontal coverage.
    polygon=smooth(points); rows=[[] for _ in range(h*4)]
    for a,b in zip(polygon,polygon[1:]+polygon[:1]):
        if a[1]==b[1]: continue
        if a[1]>b[1]: a,b=b,a
        start=max(0,math.ceil(a[1]*4-.5)); end=min(h*4,math.ceil(b[1]*4-.5))
        for sy in range(start,end):
            y=(sy+.5)/4; rows[sy].append(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]))
    output=bytearray(w*h)
    for y in range(h):
        values=[0.]*w
        for sy in range(y*4,y*4+4):
            xs=sorted(rows[sy])
            for left,right in zip(xs[::2],xs[1::2]):
                for x in range(max(0,math.floor(left)),min(w,math.ceil(right))):
                    values[x]+=max(0,min(right,x+1)-max(left,x))*.25
        output[y*w:(y+1)*w]=bytes(min(255,round(v*255)) for v in values)
    return output

def clean(source,target,left):
    w,h,pixels=read_png(source)
    contour=left+[[1024-x,y] for x,y in reversed(left[1:-1])]
    alpha=matte(w,h,contour)
    for i,a in enumerate(alpha):
        pixels[i*4+3]=a
        if a==0: pixels[i*4:i*4+3]=b'\0\0\0'
    write_png(target,w,h,pixels)
    print(target.name,'transparent pixels:',alpha.count(0),'opaque pixels:',alpha.count(255))
    return w,h,pixels

contours=json.loads((ROOT/'contours.json').read_text())
male=clean(ROOT.parent/'layer-test/base-white-tank-draft.png',ROOT/'guy-white-tank.png',contours['maleLeft'])
female=clean(ROOT.parent/'layer-test/girl-white-tank-draft.png',ROOT/'girl-white-tank.png',contours['femaleLeft'])
w,h=1200,480; sheet=bytearray(w*h*4)
for panel in range(4):
    iw,ih,image=male if panel<2 else female; bg=255 if panel%2==0 else 30
    for y in range(h):
        for x in range(300):
            dest=(y*w+panel*300+x)*4
            sy=min(ih-1,int(y*ih/h)); sx=min(iw-1,int(x*iw/300)); src=(sy*iw+sx)*4
            a=image[src+3]/255
            sheet[dest:dest+4]=bytes([round(image[src+k]*a+bg*(1-a)) for k in (0,1,2)]+[255])
write_png(ROOT/'background-check.png',w,h,sheet)
