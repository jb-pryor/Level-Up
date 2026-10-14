# Character layer experiment

Generated using the built-in image-generation tool. Open `preview.html` in a browser to toggle the hair and shirt over the base.

`fitted-preview.html` is the newer controlled test: it clips the character silhouette and recolors the original shirt within a fixed outline instead of using the generated shirt overlay. It now uses `base-clean-shaven.png`, with facial hair removed through the built-in image-generation tool at the learner's request. The original base is retained. Browser visual verification is pending; source syntax and image dimensions were checked.

## Result
All three PNGs are 1024 × 1536 and contain alpha transparency. However, generated overlays did not preserve the requested reference scale and position. There is also unwanted edge haze. These are exploratory assets, not approved production layers. The preview provides raw positioning and approximate CSS positioning for comparison; the latter is not an exact fit.

## Implication for technical planning
The visual style is approved, but layer compatibility remains unresolved. Do not claim that unrestricted hairstyle and wardrobe combinations are supported. A reliable pipeline needs a fixed template, accurately fitted masks/cutouts, and validation of each combination. Pre-rendered complete variants are another possibility but multiply with customization choices; they are not an agreed replacement.

The approved React, TypeScript, and Vite direction remains unchanged. This experiment does not approve a technical spec.
