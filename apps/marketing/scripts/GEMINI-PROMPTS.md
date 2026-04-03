# Hero 1B — Gemini Prompts for 7 AI Tutors Collage Banner

Copy-paste each prompt directly into Google Gemini (Imagen 3+).
Save each output as the corresponding clean-plate filename into `public/assets/og/`.

---

## Prompt 1: OG/Social Share (1200×630)

Save as: `tutors-collage-og-clean.png`

```
Generate a photorealistic editorial-style group portrait of 7 diverse young adult
educators standing together in a modern, bright studio setting — arranged in a natural,
confident "Avengers assemble" style composition. They should be arranged in a slight
V-formation with the center figure slightly forward.

From left to right:

1. ECHO (Speech): A young East Asian woman in her mid-20s with shoulder-length black
   hair with a coral-pink streak, wearing a coral-pink bomber jacket over a sky-blue
   t-shirt, modern white headphones around her neck, joyful singing expression.

2. CHRONO (History): A woman in her early 30s with deep brown skin, long braided black
   hair with gold hair cuffs, wearing a rose-burgundy velvet blazer over a white silk
   blouse, brass compass necklace, magnetic storyteller expression.

3. SAGE (ELA): A nonbinary person in their early 30s with light olive skin, shoulder-
   length wavy auburn hair, round tortoiseshell glasses, wearing a soft teal cardigan
   over a cream linen shirt, holding a leather-bound journal, gentle knowing smile.

4. NOVA (Math, center-front): A young woman in her late 20s with warm brown skin,
   natural black curly hair, wearing a navy blazer over a deep purple silk blouse, gold
   constellation pendant necklace, confident welcoming smile. She is half a step in
   front of the others, positioned center.

5. SPARK (Science): A young man in his late 20s with medium brown skin, short textured
   black hair, wearing a white lab coat over an amber-orange henley, safety goggles
   pushed up on forehead, infectious excited grin.

6. HARMONY (SEL): A woman in her early 30s with warm tan skin, long flowing dark brown
   hair, wearing a flowing lavender linen blouse with botanical embroidery, thin gold
   leaf bracelet, serene reassuring smile.

7. PIXEL (Coding): A young man in his early 20s with light skin and freckles, messy
   reddish-brown hair, wearing an emerald green hoodie with circuit-board embroidery,
   wireless earbud in one ear, friendly half-smile.

The lighting is clean, bright studio lighting with subtle colored rim lights behind each
person that hint at their signature color (purple for Nova, teal for Sage, amber for
Spark, rose for Chrono, emerald for Pixel, lavender for Harmony, coral for Echo) —
creating a subtle rainbow halo effect when viewed as a group. Background: gradient from
deep navy (#1a1a2e) to slightly lighter navy, with very subtle geometric shapes (hexagons,
circles) floating in the background at 5% opacity — hinting at technology/education.

The overall mood is: "This is the team that's going to help your child succeed" — warm,
confident, diverse, trustworthy, modern. Think "Apple product launch team photo meets
Marvel poster." Every person looks like a real educator you'd want your child to learn
from. The composition should leave space at the top (sky area) and bottom for text
overlay without covering faces.

Shot style: Phase One IQ4 medium format, 80mm f/2.8, studio strobe lighting with
colored gels. Aspect ratio: 1200x630. No text, logos, or watermarks. Photorealistic,
not illustrated.
```

---

## Prompt 2: Square Social (1080×1080)

Save as: `tutors-collage-square-clean.png`

```
Same scene and characters as above, but recomposed for a square 1:1 aspect ratio. The 7
educators are arranged in a tighter 2-3-2 formation:

Back row (3): Chrono (left), Nova (center, slightly elevated on a subtle platform),
Spark (right)
Front row (4): Echo (far left), Sage (center-left), Harmony (center-right), Pixel
(far right)

The tighter composition should keep all faces visible in the upper two-thirds of the
frame, leaving the bottom third open for text overlay. Same lighting setup with colored
rim lights per character. Background: deep navy gradient. Aspect ratio: 1:1, 1080x1080.
No text, logos, or watermarks. Photorealistic.
```

---

## Prompt 3: Wide Banner (1920×600)

Save as: `tutors-collage-banner-clean.png`

```
Same 7 educators arranged in a single horizontal line, evenly spaced, facing slightly
toward camera at different natural angles (not rigid lineup). Each person is shown from
approximately the waist up. They're closer together with slight overlaps — a cohesive
team, not isolated portraits. Nova is center. The colored rim lights behind each person
are slightly more prominent to create a visible rainbow gradient across the banner (purple
to teal to amber to rose to emerald to lavender to coral from the viewer's perspective,
though the actual arrangement follows the V-formation). Bottom 30% of the frame is a
gradient fade to deep navy (for text overlay area). Aspect ratio: 1920x600 (very wide).
No text, logos, or watermarks. Photorealistic.
```

---

## Post-Generation Workflow

1. Save all 3 clean-plate PNGs into `apps/marketing/public/assets/og/`
2. Run: `npx tsx apps/marketing/scripts/generate-og-banners.ts`
3. Verify output files and sizes
4. Commit and push

## Expected Output Files

```
public/assets/og/
  tutors-collage-og.webp           ← clean plate WebP
  tutors-collage-og.png            ← clean plate PNG (fallback)
  tutors-collage-og-text.webp      ← with text overlay
  tutors-collage-og-text.png       ← with text overlay (OG fallback)
  tutors-collage-banner.webp       ← clean plate WebP
  tutors-collage-banner-text.webp  ← with text overlay
  tutors-collage-square.webp       ← clean plate WebP
  tutors-collage-square-text.webp  ← with text overlay
```
