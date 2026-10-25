# Shoe fit edits — 2026-10-25

Used the built-in image generation tool in edit mode. Original authored PNGs are retained. Selected outputs are saved in `public/avatars/shoes/fitted/`:

- `shoes-double-strap-sandals-open-heel.png`
- `shoes-blue-five-toe-shoes-open-heel.png`
- `shoes-suede-clogs-open-heel.png`

Final prompt, separately for each asset (substitute its filename style for `{style}`):

> Use case: precise-object-edit. Edit target: this transparent 1024x1536 avatar shoe overlay. Remove ONLY the visible rear heel rim/cup and inner heel opening behind the foot on BOTH shoes, including rear pull tabs if present. Make those rear sections transparent so an avatar ankle can occupy that space. Keep all front straps, buckles, laces, toes, soles, colors and textures identical. Do not add feet or legs. Preserve exact shoe sizes and positions at bottom of original 1024x1536 transparent canvas. No background. This is {style}. Return the full original canvas with edited shoes.

Styles: `double-strap-sandals`, `blue-five-toe-shoes`, `suede-clogs`.

Generated outputs included faint low-alpha haze; `FittedShoes` removes it with an SVG alpha transfer. Each of the nine new pairs scales independently around left/right sole anchors, preserving stance and the existing female base transform. Per-style enlargement ranges from 6–12% in width and 6–15% in height. Existing shoe fits are unchanged. All 18 new male/female fits were reviewed in lower-body composites. Shop and wardrobe use the same renderer and include the bunny ears in preview framing.
