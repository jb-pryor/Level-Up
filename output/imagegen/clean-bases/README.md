# Clean white tank-top bases

## Manual refinement and bald girl update

The learner identified residual shape artifacts around the guy's face, hands, and feet. These cutouts are not final approved silhouettes. They intend to manually refine the guy PNG and return it, preserving the 1024×1536 canvas and character positioning. `girl-bald-white-tank.png` is a new bald base with a preliminary code-cleaned contour; its generated source is `../layer-test/girl-bald-white-tank-draft.png`. The new contour is in `girl-bald-contour.json`. Both remain available for manual refinement. The preview still displays the earlier long-haired girl until this replacement is reviewed.

The learner explicitly authorized code-based cleanup and matching white tank tops for both bases. Built-in image generation created the tank-top designs; a dependency-free Python script applies fixed silhouette mattes without changing foreground RGB.

`guy-white-tank.png` and `girl-white-tank.png` are 1024×1536 transparent PNGs. `background-check.png` shows them on white and dark backgrounds; `preview.html` offers a background toggle. `cleanup.py` and `contours.json` reproduce the cleanup. Original drafts remain in `../layer-test/`.

Verified zero alpha at corners and representative arm/leg gap points, and full opacity inside both torsos. Visually inspected the QA sheet. Handcrafted contours apply only to these poses, not arbitrary images.

The previous fitted shirt test still uses the older gray-shirt base. These updated tank-top images require newly fitted shirt overlays. The girl's long hair remains baked into her base and needs separating before hairstyle swaps work.
