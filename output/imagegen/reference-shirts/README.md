# Reference shirt collection

Seven garments were created with the built-in image generation tool from the photos in `public/avatars/clothing-references/shirts`, using the aligned male body as the pose/style reference. Exact generation prompts are in [prompts.json](prompts.json). The red AVIF reference was decoded locally through libheif before generation. Source photos are unchanged.

Generated originals and the final `male-*.png` / `female-*.png` transparent overlays are saved in `public/avatars/shirts/reference-collection/`. Each final overlay uses the canonical 1024×1536 avatar canvas. Separate body fits preserve the garment patterns, with sleeve length adjusted independently of the hip-length torso. Both fittings share one purchased item ID. These are initial play-test fits and can be tuned after in-app feedback.

Run `/usr/bin/python3 output/imagegen/reference-shirts/fit.py` with Pillow installed to rebuild the fitted overlays from the generated originals. `fit-preview.png` shows all seven garments on both bodies. Existing shop prices, coin deductions, ownership and save behavior apply; these seven items start at level 1 for testing.

Browser preview was unavailable in this session. Visual checking used composited avatar previews; automated checks cover purchasing, equipping and save round trips.
