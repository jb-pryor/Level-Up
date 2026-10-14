"""Fit image-generated clothing and hair to fixed-pose avatar canvases.

Code-based cutout processing is explicitly authorized. Originals remain intact.
"""
from pathlib import Path
import math
ROOT=Path(__file__).resolve().parents[3]
ns={'__file__':str(ROOT/'output/imagegen/clean-bases/cleanup.py')}
exec((ROOT/'output/imagegen/clean-bases/cleanup.py').read_text().split('contours=json.loads')[0],ns)
read,write,matte=ns['read_png'],ns['write_png'],ns['matte']

def layer(source,target,polygons,feather=None):
    w,h,data=read(ROOT/source); alpha=bytearray(w*h)
    for polygon in polygons:
        m=matte(w,h,polygon)
        alpha=bytearray(max(a,b) for a,b in zip(alpha,m))
    if feather:
        cx,cy,rx,ry=feather
        for y in range(max(0,int(cy-ry)),min(h,int(cy+ry+1))):
            for x in range(max(0,int(cx-rx)),min(w,int(cx+rx+1))):
                d=math.sqrt(((x-cx)/rx)**2+((y-cy)/ry)**2)
                alpha[y*w+x]=round(255*max(0,min(1,(1-d)*5)))
    for i,a in enumerate(alpha):
        data[i*4+3]=a
        if not a:data[i*4:i*4+3]=b'\0\0\0'
    target=ROOT/target;target.parent.mkdir(parents=True,exist_ok=True);write(target,w,h,data)
    print(target.relative_to(ROOT))

guyShirt=[(449,437),(419,444),(375,460),(335,482),(304,529),(284,576),(264,619),(276,634),(313,654),(349,664),(366,647),(365,717),(359,790),(356,857),(367,874),(435,886),(512,889),(589,886),(654,875),(671,855),(660,790),(660,717),(657,647),(674,664),(711,654),(748,634),(761,619),(740,576),(720,529),(689,482),(649,460),(605,444),(576,437),(568,459),(549,479),(512,489),(475,479),(456,459)]
girlShirt=[(445,455),(415,462),(378,477),(347,500),(329,541),(309,594),(312,606),(341,620),(375,631),(387,617),(403,677),(405,714),(391,764),(363,808),(367,821),(427,835),(512,840),(597,835),(660,821),(662,808),(634,764),(620,714),(622,677),(637,617),(649,631),(683,620),(712,606),(715,594),(695,541),(677,500),(646,477),(609,462),(579,455),(565,483),(540,502),(512,511),(484,502),(459,483)]
for base,shirt in [('base-a',guyShirt),('base-b',girlShirt)]:
    source=f'output/imagegen/build-assets/{base}-outfit-source.png'
    layer(source,f'public/avatars/{base}-shirt.png',[shirt])
    # Neutral mouth includes surrounding matching skin with a soft falloff.
    mouth=(512,333,98,61) if base=='base-a' else (512,351,83,49)
    layer(source,f'public/avatars/{base}-mouth.png',[],feather=mouth)
    cap=[(341,207),(340,153),(350,100),(369,64),(415,31),(468,16),(512,12),(556,16),(609,31),(653,64),(674,100),(684,153),(684,207),(672,212),(665,175),(640,158),(593,141),(548,132),(512,129),(476,132),(431,141),(385,158),(359,175),(353,212)] if base=='base-a' else [(355,233),(355,183),(368,124),(385,86),(429,56),(475,40),(512,36),(551,40),(595,56),(639,86),(656,124),(669,183),(669,233),(655,237),(650,209),(627,187),(589,169),(546,150),(512,145),(478,150),(435,169),(397,187),(374,209),(369,237)]
    layer(source,f'public/avatars/{base}-hat.png',[cap])
    shoe=[(368,1365),(391,1364),(418,1372),(440,1381),(449,1409),(455,1451),(453,1491),(439,1510),(398,1517),(348,1514),(301,1509),(278,1500),(278,1477),(288,1448),(310,1423),(332,1401),(343,1378)] if base=='base-a' else [(369,1390),(401,1394),(428,1405),(441,1427),(446,1468),(439,1500),(411,1512),(365,1516),(316,1511),(289,1500),(289,1478),(302,1456),(327,1432),(345,1407)]
    mirror=[(1024-x,y) for x,y in shoe]
    layer(source,f'public/avatars/{base}-shoes.png',[shoe,mirror])

short=[(244,433),(229,386),(226,343),(229,305),(241,247),(283,174),(353,112),(416,81),(483,65),(535,59),(598,44),(638,25),(645,68),(642,99),(675,68),(693,29),(712,74),(709,133),(745,169),(772,215),(797,215),(782,245),(794,303),(779,369),(758,439),(743,427),(728,348),(704,307),(656,279),(595,269),(512,265),(439,263),(382,271),(337,277),(309,309),(282,360),(263,436)]
layer('output/imagegen/layer-test/hair.png','public/avatars/hair/short.png',[short])
frontLeft=[(512,39),(478,33),(430,42),(393,63),(361,97),(332,143),(313,188),(299,236),(294,276),(300,322),(314,363),(334,385),(344,351),(354,306),(373,250),(389,207),(415,174),(448,150),(482,126),(512,121)]
front=frontLeft+[(1024-x,y) for x,y in reversed(frontLeft[1:-1])]
backLeft=[(299,292),(303,351),(299,393),(279,427),(264,459),(261,499),(273,535),(281,566),(275,592),(272,629),(282,650),(301,669),(322,665),(348,682),(376,706),(401,721),(409,705),(402,668),(396,625),(399,565),(411,508),(425,468),(413,431),(393,409),(374,370),(367,327),(353,293)]
backRight=[(1024-x,y) for x,y in backLeft]
source='output/imagegen/clean-bases/girl-white-tank.png'
layer(source,'public/avatars/hair/long-front.png',[front])
layer(source,'public/avatars/hair/long-back.png',[backLeft,backRight])
