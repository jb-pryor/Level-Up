# Build asset preparation

The built-in image-generation tool produced one outfit-source image for each base: neutral mouth, gray short-sleeved shirt, white/green sneakers, green cap, preserving the fixed pose as closely as possible. The prompt is recorded alongside this file.

`prepare.py` uses explicitly authorized raster cutout processing with handcrafted polygons and soft mouth masks. Each runtime layer keeps a 1024×1536 canvas. Source images are retained. Short hair derives from the earlier generated hair asset; long hair is split into front/back pieces from the approved long-haired girl source.

`check_composites.py` creates a QA contact sheet for both bodies, both hairstyles, and neutral/outfit combinations. This sheet checks asset fitting and does not replace browser interaction tests. The first sheet revealed hair poking through caps; the app clips front hair under the cap. The raw composite script predates that cap correction.

Known body outline imperfections remain deferred. These assets are not a general arbitrary-character pipeline. Visual feedback is required before the first build slice is complete.
