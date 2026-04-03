# Hero 1A — Photorealistic Image Generation Prompts: Individual Children & Families Using AIVO

## Sprint Goal

Generate high-quality, photorealistic images of individual children and parent-child pairs — each from a different racial/ethnic background — actively using the AIVO Learning platform. These replace the current `/hero/slide-1.png` and `/hero/slide-2.png` backgrounds and provide fresh visuals for all 5 hero slides plus mobile variants.

## Target Service

**Google Gemini** (Imagen 3 or later) — paste each prompt directly into Gemini

## Design Direction

- PHOTOREALISTIC — not illustrated, not AI-art-looking, not stock-photo-generic
- **ONE child or ONE parent-child pair per image** — no group shots
- **Every image features a different racial/ethnic background** — no two slides repeat
- Warm, aspirational, editorial-quality photography feel
- Devices showing the AIVO UI (purple/teal brand colors glowing on screens)
- Emotional tone: joy, confidence, connection, empowerment
- Age range of children: 5–17 (K-12)
- COPPA-safe: no personally identifiable information, school names, or real locations

## Diversity Map (One Background Per Slide)

| Slide      | Child                     | Background                             | Age             | Setting                          |
| ---------- | ------------------------- | -------------------------------------- | --------------- | -------------------------------- |
| 1          | Girl                      | Black / African American               | ~10             | Home — kitchen table             |
| 1 mobile   | Boy                       | Latino / Hispanic                      | ~9              | Home — desk close-up             |
| 2 primary  | Mother + Son              | White (son has Down syndrome)          | ~10             | Living room sofa                 |
| 2 variant  | Father + Daughter         | Black / African American               | ~7              | Dining table, morning            |
| 3          | Boy                       | Middle Eastern / Arab                  | ~12             | School resource room             |
| 4          | Girl                      | East Asian / Asian American            | ~14             | Bedroom desk                     |
| 5          | Mother + Teacher          | South Asian mother, East Asian teacher | late 30s / early 40s | School classroom            |

---

## Slide 1 — Hero: "AI-Powered Learning That Adapts to Every Child"

### Primary Image (Full-Width Background) — Black Girl, Age 10

```
Generate a photorealistic editorial photograph of a single Black girl, approximately
10 years old, with natural coily hair styled in two puff balls with a purple satin
ribbon, sitting at a bright modern kitchen table in a warm, sunlit home. She has big
expressive brown eyes and a wide, confident smile — the look of a child who just got
an answer right. She is using a tablet propped up on the table showing a colorful
educational interface with purple and teal accent colors — an AI chat bubble is visible
on screen with encouraging text. Her chin is resting on one hand while the other hand
taps the screen. She is wearing a casual lavender t-shirt. The kitchen is modern but
lived-in — a fruit bowl on the counter, a backpack hanging on a chair, warm wood
cabinets. The lighting is warm natural daylight streaming from a large window to the
left, with soft fill light that wraps around her face. The overall mood is joyful,
authentic, and empowered — a child thriving in her learning. Shot style: Canon EOS R5,
50mm f/1.8, shallow depth of field with the background softly blurred. Color grading:
warm highlights, slightly lifted shadows, natural rich skin tones. Aspect ratio 16:9,
high resolution suitable for a website hero banner at 1920x1080. No other people in
the frame. No text, logos, or watermarks.
```

**Output filename:** `public/hero/raw/slide-1-black-girl-tablet.png`

### Mobile Variant (Portrait) — Latino Boy, Age 9

```
Generate a photorealistic close-up photograph of a single Latino boy, approximately
9 years old, with short wavy dark brown hair and warm olive skin, looking down at an
iPad he is holding with both hands. He has a focused, slightly delighted expression —
one corner of his mouth turned up in a half-smile as if he's figuring something out.
The iPad screen displays a friendly AI chat conversation with a purple chat bubble
from a tutor named "Nova" and the child's response in a teal bubble. The interface
is clean and modern with rounded corners and warm white background. He is wearing a
green crew-neck t-shirt. The tablet is resting on a wooden desk with a few scattered
colored pencils and an open notebook nearby. Warm natural side lighting from a window
creates soft shadows. Shot from above at a 45-degree angle, framing only the boy and
his immediate desk area. Shot style: Canon EOS R5, 50mm f/2.8, shallow depth of field.
Color grading: warm, natural skin tones, slightly golden cast. Aspect ratio 9:16
(portrait). No other people in the frame. No text overlays, logos, or watermarks.
Photorealistic, not illustrated.
```

**Output filename:** `public/hero/raw/slide-1-mobile-latino-boy-ipad.png`

---

## Slide 2 — "See How It Works"

### Primary Image — White Mother & Son (Son Has Down Syndrome), Age 10

```
Generate a photorealistic editorial photograph of a white mother and her 10-year-old son
sitting together on a comfortable modern gray sofa in a bright living room. Just the two
of them — no other people. The mother is in her mid-30s with shoulder-length brown hair,
wearing a casual cream chunky-knit sweater, looking at the laptop screen with a proud,
warm smile. The son has Down syndrome, light brown hair, and is wearing a blue t-shirt.
He has a big open grin and is pointing excitedly at the laptop screen with one finger.
The screen shows a colorful educational dashboard with progress bars, achievement badges,
and a friendly AI tutor avatar — the purple and teal brand colors are visible as a warm
glow on both of their faces. The living room is modern and cozy — soft gray sofa, a few
green plants on a shelf, warm wood floors, natural light from a window behind them
creating a bright backlit halo effect. A pair of kid-sized headphones rests on the sofa
arm. The emotional tone is connection, pride, and joy — a parent watching her child
succeed. Shot style: Sony A7R V, 70mm f/2.8, natural window light with subtle warm fill
bounce. Color grading: warm, natural, slightly desaturated background so the subjects
pop. Aspect ratio 16:9, 1920x1080. No text, logos, or watermarks.
```

**Output filename:** `public/hero/raw/slide-2-mother-son-sofa.png`

### Variant — Black Father & Daughter, Age 7

```
Generate a photorealistic editorial photograph of a Black father in his early 40s and
his 7-year-old daughter — just the two of them, no one else in the frame. The father
has a short neat beard and warm dark skin, wearing a casual navy henley, sitting at a
wooden dining table. His daughter is sitting in his lap, leaning forward toward the
table. She has braided hair with a few colorful beads, wearing a bright yellow sundress,
and is giggling while pointing at a tablet propped up on the table. The tablet shows an
educational app with a friendly AI tutor chat interface — purple and teal UI colors
glowing softly. The father has one arm around her and is looking at the screen with a
warm, proud expression — a quiet moment of "my kid is amazing." The dining room is bright
and modern with soft morning light streaming in from the left. A glass of orange juice
and a half-eaten breakfast plate are on the table. Shot style: Nikon Z8, 85mm f/1.4,
shallow depth of field focused on father and daughter, background softly blurred. Color
grading: warm golden morning tones, natural deep skin tones, lifted shadows. Aspect
ratio 16:9, 1920x1080. No text, logos, or watermarks.
```

**Output filename:** `public/hero/raw/slide-2-father-daughter-breakfast.png`

---

## Slide 3 — Brain Clone / IEP Adaptive Learning

### Primary Image — Arab/Middle Eastern Boy, Age 12

```
Generate a photorealistic editorial photograph of a single 12-year-old Middle Eastern /
Arab boy sitting at a desk in a school resource room. He has olive-brown skin, short dark
wavy hair, and brown eyes with a calm, focused expression — the quiet confidence of a
child who has the right support. He is wearing a navy blue polo shirt and has noise-
canceling headphones resting around his neck. He is looking at a Chromebook screen that
shows a clean educational interface with an IEP progress dashboard — colorful progress
bars in purple, teal, and amber with small checkmark icons. One hand is on the keyboard,
the other resting beside a fidget cube on the desk. The resource room has a calm,
organized feel — soft overhead lighting supplemented by natural window light from the
right, a visual schedule on the wall (blurred in background), a small desk lamp, and a
shelf with books and sensory tools (all slightly out of focus). He is the only person in
the frame. The emotional tone is calm, supported, and empowered — a child whose learning
environment understands him. Shot style: Canon EOS R5, 50mm f/2, soft mixed lighting.
Color grading: neutral/cool ambient with warm accent on his face from the window. Aspect
ratio 16:9, 1920x1080. No text, logos, or watermarks.
```

**Output filename:** `public/hero/raw/slide-3-arab-boy-chromebook.png`

---

## Slide 4 — Meet Your AI Tutors

### Primary Image — East Asian / Asian American Girl, Age 14

```
Generate a photorealistic editorial photograph of a single 14-year-old Asian American
girl sitting at a modern white desk in her bedroom. She has long straight black hair
pulled back in a low ponytail, light skin, and is wearing wireless earbuds. She is
looking at a desktop monitor showing a split-screen educational interface: on the left,
a chat conversation with an AI tutor (purple and teal UI colors), and on the right, a
science simulation with a colorful molecular structure. She has one hand on the keyboard
and is leaning slightly forward with a curious, excited expression — the look of someone
who just had an "aha!" moment. Her other hand is touching her chin thoughtfully. She is
wearing a casual gray crewneck sweatshirt. Her bedroom is modern and personal — a few
books stacked on the desk, a small succulent plant in a white pot, warm LED string lights
on the wall behind her (slightly blurred), and a corkboard with a few photos and sticky
notes (all blurred). The monitor casts a warm purple/teal glow on the left side of her
face. She is the only person in the frame. Shot style: Fujifilm X-T5, 56mm f/1.2,
shallow depth of field with background very soft. Color grading: slightly cool overall
with warm purple/teal accent tones from the screen glow. Aspect ratio 16:9, 1920x1080.
No text, logos, or watermarks.
```

**Output filename:** `public/hero/raw/slide-4-asian-girl-desk.png`

---

## Slide 5 — Dashboard / Results

### Primary Image — South Asian Mother & East Asian Teacher

```
Generate a photorealistic editorial photograph of two women in a parent-teacher
conference setting — just the two of them at a desk, no other people. The mother is
a South Asian woman in her late 30s with long dark hair, wearing a professional olive
green blazer, sitting across the desk from the teacher. She is holding up her phone
showing an educational dashboard with progress charts and grade indicators in purple
and teal — the screen glow reflecting faintly in her glasses. She has a warm, confident
expression — the look of a parent who has data on her side. The teacher is an East Asian
woman in her early 40s with a chin-length bob, wearing stylish rectangular glasses and
a professional charcoal blazer over a white blouse. She is leaning forward looking at
the phone screen with an impressed, appreciative nod — one hand gesturing as if saying
"this is great progress." The setting is a modern elementary school classroom — clean,
bright, with colorful but organized student artwork on the walls (blurred in background),
a potted plant on the desk, and soft fluorescent lighting supplemented by window light
from the right. The emotional tone is pride, collaboration, and mutual respect — a
parent and teacher aligned on a child's success. Shot style: Sony A7 IV, 85mm f/1.8,
shallow depth of field focused on both women's faces. Color grading: bright, neutral,
professional with warm natural skin tones. Aspect ratio 16:9, 1920x1080. No text,
logos, or watermarks.
```

**Output filename:** `public/hero/raw/slide-5-parent-teacher-conference.png`

---

## Supplemental Images — Additional Individual Children (For Rotation / A-B Testing)

### Supplemental A — Indigenous / Native American Boy, Age 11

```
Generate a photorealistic editorial photograph of a single 11-year-old Indigenous /
Native American boy sitting cross-legged on a beanbag chair in a bright school library.
He has warm brown skin, long straight dark hair pulled back in a low ponytail, and dark
thoughtful eyes with a gentle, focused smile. He is holding a tablet at a slight angle,
the screen showing a history lesson interface with a timeline graphic and an AI tutor
chat bubble in warm rose and gold tones. He is wearing a dark red hoodie and jeans. The
school library behind him is colorful but softly blurred — shelves of books, a globe, a
reading nook with cushions. Warm natural light comes from a skylight above, casting a
soft even glow. He is the only person in the frame. The emotional tone is curious,
grounded, and comfortable — a child engaged at his own pace. Shot style: Nikon Z8,
85mm f/1.4, very shallow depth of field. Color grading: warm, slightly golden, natural
skin tones. Aspect ratio 16:9, 1920x1080. No text, logos, or watermarks.
```

**Output filename:** `public/hero/raw/supplemental-a-native-boy-library.png`

### Supplemental B — Biracial (Black/White) Girl, Age 8

```
Generate a photorealistic editorial photograph of a single 8-year-old biracial girl
(Black and white) with big curly light brown hair and hazel eyes, sitting at a child-
sized desk in a bright, cheerful home study nook. She has a missing-front-tooth grin —
pure joy. She is wearing a coral pink t-shirt and is holding a stylus, drawing on a
tablet that shows a creative writing interface with colorful text and an AI tutor named
"Sage" in a teal chat bubble offering encouraging feedback. The study nook is small and
cozy — a white desk against a wall, a shelf above with a few children's books and a
small stuffed animal, a cup of crayons, and a child's drawing pinned to a small
corkboard. Warm afternoon sunlight streams in from a window to her right, creating a
golden rim light in her curls. She is the only person in the frame. The emotional tone
is playful, creative, and proud. Shot style: Sony A7 IV, 50mm f/1.8, shallow depth of
field. Color grading: warm golden afternoon light, natural skin tones, vibrant but not
oversaturated. Aspect ratio 16:9, 1920x1080. No text, logos, or watermarks.
```

**Output filename:** `public/hero/raw/supplemental-b-biracial-girl-nook.png`

### Supplemental C — Southeast Asian Boy, Age 13

```
Generate a photorealistic editorial photograph of a single 13-year-old Southeast Asian
boy (Filipino or Vietnamese features) sitting at a kitchen counter on a high stool. He
has short black hair with a slight wave, medium brown skin, and is wearing a forest
green polo shirt and over-ear headphones (black with green accents). He is looking at a
laptop screen showing a coding interface — a dark code editor on the left with colorful
syntax highlighting, and an AI tutor chat on the right with an emerald-green UI theme.
His fingers are on the keyboard mid-type and his expression is one of focused
determination — tongue slightly out, one eyebrow raised — the universal face of
debugging. The kitchen counter is granite, with a glass of water and a bag of chips
nearby. The kitchen is modern with warm pendant lighting above. He is the only person in
the frame. The emotional tone is focused, capable, and independent. Shot style: Fujifilm
X-T5, 35mm f/1.4, shallow depth of field with warm background bokeh from the pendant
lights. Color grading: warm, slightly contrasty, natural skin tones. Aspect ratio 16:9,
1920x1080. No text, logos, or watermarks.
```

**Output filename:** `public/hero/raw/supplemental-c-southeast-asian-boy.png`

---

## Asset Naming Convention

Raw generated images land in:

```
public/hero/raw/
  slide-1-black-girl-tablet.png
  slide-1-mobile-latino-boy-ipad.png
  slide-2-mother-son-sofa.png
  slide-2-father-daughter-breakfast.png
  slide-3-arab-boy-chromebook.png
  slide-4-asian-girl-desk.png
  slide-5-parent-teacher-conference.png
  supplemental-a-native-boy-library.png
  supplemental-b-biracial-girl-nook.png
  supplemental-c-southeast-asian-boy.png
```

After optimization (Sprint Hero 2B), responsive multi-format files land in:

```
public/hero/optimized/
  slide-1-black-girl-tablet-{width}w.webp
  slide-1-black-girl-tablet-{width}w.avif
  slide-1-black-girl-tablet-{width}w.jpg
  ... (all sizes × all formats × all images)
```

---

## Post-Generation Steps

1. Review each image for authenticity — reject anything that looks "AI-generated" (uncanny hands, merged fingers, garbled text on screens)
2. If device screens look wrong, composite real AIVO UI screenshots onto the device screens in Figma or programmatically with Sharp
3. Upscale to at least 2560×1440 for retina displays
4. Run through the optimization pipeline (Sprint Hero 2B): responsive sizes (640w–2560w), WebP/AVIF/JPEG, blur placeholders
5. Target file sizes: < 250KB per image at 1920w WebP, < 100KB for mobile variants at 640w
6. Generate `public/hero/manifest.json` with all srcSet data and blurDataURLs

---

## Important Notes

- **Screen compositing**: AI image generators often produce garbled/unreadable UI on device screens. Plan to use clean-plate images and composite real AIVO screenshots onto device screens in Figma or programmatically with Sharp. The prompts describe screen content for art direction only — final screen content should come from real UI screenshots.
- **Hand/finger review**: Carefully review generated images for hand artifacts — a common AI generation issue. Re-generate any image with abnormal hands.
- **Supplemental images**: The 3 supplemental images provide additional diversity for A/B testing hero slide rotation and for use on other marketing pages (about, case studies, blog headers).
