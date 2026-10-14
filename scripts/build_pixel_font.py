"""Build an original 5x7 geometric display font; no external font dependency."""
from pathlib import Path
import struct, math
P={
'A':['01110','10001','10001','11111','10001','10001','10001'],
'B':['11110','10001','10001','11110','10001','10001','11110'],
'C':['01111','10000','10000','10000','10000','10000','01111'],
'D':['11110','10001','10001','10001','10001','10001','11110'],
'E':['11111','10000','10000','11110','10000','10000','11111'],
'F':['11111','10000','10000','11110','10000','10000','10000'],
'G':['01111','10000','10000','10111','10001','10001','01111'],
'H':['10001','10001','10001','11111','10001','10001','10001'],
'I':['11111','00100','00100','00100','00100','00100','11111'],
'J':['00111','00010','00010','00010','00010','10010','01100'],
'K':['10001','10010','10100','11000','10100','10010','10001'],
'L':['10000','10000','10000','10000','10000','10000','11111'],
'M':['10001','11011','10101','10101','10001','10001','10001'],
'N':['10001','11001','10101','10011','10001','10001','10001'],
'O':['01110','10001','10001','10001','10001','10001','01110'],
'P':['11110','10001','10001','11110','10000','10000','10000'],
'Q':['01110','10001','10001','10001','10101','10010','01101'],
'R':['11110','10001','10001','11110','10100','10010','10001'],
'S':['01111','10000','10000','01110','00001','00001','11110'],
'T':['11111','00100','00100','00100','00100','00100','00100'],
'U':['10001','10001','10001','10001','10001','10001','01110'],
'V':['10001','10001','10001','10001','10001','01010','00100'],
'W':['10001','10001','10001','10101','10101','11011','10001'],
'X':['10001','10001','01010','00100','01010','10001','10001'],
'Y':['10001','10001','01010','00100','00100','00100','00100'],
'Z':['11111','00001','00010','00100','01000','10000','11111'],
'0':['01110','10001','10011','10101','11001','10001','01110'],
'1':['00100','01100','00100','00100','00100','00100','01110'],
'2':['01110','10001','00001','00010','00100','01000','11111'],
'3':['11110','00001','00001','01110','00001','00001','11110'],
'4':['00010','00110','01010','10010','11111','00010','00010'],
'5':['11111','10000','10000','11110','00001','00001','11110'],
'6':['01110','10000','10000','11110','10001','10001','01110'],
'7':['11111','00001','00010','00100','01000','01000','01000'],
'8':['01110','10001','10001','01110','10001','10001','01110'],
'9':['01110','10001','10001','01111','00001','00001','01110'],
'!':['00100','00100','00100','00100','00100','00000','00100'],
'?':['01110','10001','00001','00010','00100','00000','00100'],
'.':['00000','00000','00000','00000','00000','00000','00100'],
',':['00000','00000','00000','00000','00000','00100','01000'],
':':['00000','00100','00000','00000','00100','00000','00000'],
'-':['00000','00000','00000','11111','00000','00000','00000'],
'+':['00000','00100','00100','11111','00100','00100','00000'],
'/':['00001','00001','00010','00100','01000','10000','10000'],
"'":['00100','00100','00000','00000','00000','00000','00000'],
'(':['00010','00100','01000','01000','01000','00100','00010'],
')':['01000','00100','00010','00010','00010','00100','01000'],
}
pack=struct.pack
pad=lambda b:b+b'\0'*((-len(b))%4)
def checksum(b):return sum(struct.unpack('>'+str(len(pad(b))//4)+'I',pad(b)))&0xffffffff
def glyph(pattern):
 points=[];ends=[]
 for row,line in enumerate(pattern):
  for col,v in enumerate(line):
   if v!='1':continue
   x=col*100;y=(6-row)*100
   points.extend([(x,y),(x,y+100),(x+100,y+100),(x+100,y)])
   ends.append(len(points)-1)
 if not points:return b''
 out=pack('>hhhhh',len(ends),0,0,500,700)+pack('>'+str(len(ends))+'H',*ends)+pack('>H',0)+bytes([1]*len(points))
 for axis in (0,1):
  previous=0
  for point in points:out+=pack('>h',point[axis]-previous);previous=point[axis]
 return pad(out)
glyphs=[glyph(P['?'])]+[glyph(P.get(chr(c).upper(),['00000']*7)) for c in range(32,127)]
loc=[0];glyf=b''
for g in glyphs:glyf+=g;loc.append(len(glyf))
head=pack('>IIIIHHqqhhhhHHhhh',0x10000,0x10000,0,0x5f0f3cf5,3,1000,0,0,0,0,500,700,0,8,2,1,0)
hhea=bytearray(36);struct.pack_into('>IhhhH',hhea,0,0x10000,850,-150,100,650);struct.pack_into('>h',hhea,16,500);struct.pack_into('>h',hhea,18,1);struct.pack_into('>H',hhea,34,len(glyphs))
maxp=bytearray(32);struct.pack_into('>IHHH',maxp,0,0x10000,len(glyphs),140,35);struct.pack_into('>H',maxp,14,2)
os2=bytearray(78);struct.pack_into('>HhHHH',os2,0,0,650,400,5,0);os2[58:62]=b'LVUP';struct.pack_into('>HHHhhhHH',os2,62,64,32,126,850,-150,100,850,150)
fmt4=pack('>HHHHHHH',4,32,0,4,4,1,0)+pack('>HHH',126,65535,0)+pack('>HH',32,65535)+pack('>hh',-31,1)+pack('>HH',0,0)
cmap=pack('>HHHHI',0,1,3,1,12)+fmt4
strings=b'';records=[]
for id,text in [(0,'Original geometric display font for Level Up'),(1,'LevelUp Pixel'),(2,'Regular'),(4,'LevelUp Pixel Regular'),(6,'LevelUpPixel-Regular')]:
 value=text.encode('utf-16-be');records.append(pack('>HHHHHH',3,1,0x409,id,len(value),len(strings)));strings+=value
name=pack('>HHH',0,len(records),6+len(records)*12)+b''.join(records)+strings
post=pack('>I',0x30000)+bytes(28)
tables={'head':head,'hhea':bytes(hhea),'maxp':bytes(maxp),'OS/2':bytes(os2),'hmtx':pack('>Hh',650,0)*len(glyphs),'cmap':cmap,'loca':pack('>'+str(len(loc))+'I',*loc),'glyf':glyf,'name':name,'post':post}
n=len(tables);power=2**int(math.log2(n));header=pack('>IHHHH',0x10000,n,power*16,int(math.log2(n)),n*16-power*16);offset=12+16*n;directory=b'';body=b'';head_offset=0
for tag,data in sorted(tables.items()):
 directory+=tag.encode()+pack('>III',checksum(data),offset,len(data))
 if tag=='head':head_offset=offset
 body+=pad(data);offset+=len(pad(data))
font=bytearray(header+directory+body);struct.pack_into('>I',font,head_offset+8,(0xB1B0AFBA-checksum(font))&0xffffffff)
assert checksum(font)==0xB1B0AFBA
out=Path(__file__).resolve().parents[1]/'public/fonts/level-up-pixel.ttf';out.write_bytes(font)
print('Built',out.name,len(font),'bytes; font checksum verified')
