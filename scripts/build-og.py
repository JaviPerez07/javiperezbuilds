#!/usr/bin/env python3
"""Compose 1200x630 OG card: dark bg + coral radial glow + portrait + tagline."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path
import math
import os

ROOT = Path("/Users/javiperezz7/Documents/javiperezguides-landing")
PORTRAIT = ROOT / "assets" / "javi-portrait.jpg"
OUT = ROOT / "assets" / "og-image.jpg"

W, H = 1200, 630

BG = (10, 10, 11)
TEXT_PRIMARY = (250, 249, 245)
TEXT_SECONDARY = (156, 162, 157)
TEXT_DIM = (107, 110, 107)
ACCENT = (217, 119, 87)

img = Image.new("RGB", (W, H), BG)

# Coral radial glow on right side
glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow_layer)
center = (W * 0.78, H * 0.5)
max_r = 520
for r in range(max_r, 0, -8):
    alpha = int(85 * (1 - r / max_r) ** 1.8)
    gd.ellipse(
        (center[0] - r, center[1] - r, center[0] + r, center[1] + r),
        fill=(ACCENT[0], ACCENT[1], ACCENT[2], alpha),
    )
glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(40))
img = Image.alpha_composite(img.convert("RGBA"), glow_layer).convert("RGB")

# Grid backdrop
gd = ImageDraw.Draw(img, "RGBA")
step = 80
for x in range(0, W, step):
    gd.line([(x, 0), (x, H)], fill=(255, 255, 255, 8), width=1)
for y in range(0, H, step):
    gd.line([(0, y), (W, y)], fill=(255, 255, 255, 8), width=1)

# Portrait — circular, coral ring
portrait_size = 360
p = Image.open(PORTRAIT).convert("RGB").resize((portrait_size, portrait_size), Image.LANCZOS)
mask = Image.new("L", (portrait_size, portrait_size), 0)
mdraw = ImageDraw.Draw(mask)
mdraw.ellipse((0, 0, portrait_size, portrait_size), fill=255)

# Outer glow around portrait
px, py = int(W * 0.74 - portrait_size / 2), int(H * 0.5 - portrait_size / 2)
glow_pad = 60
glow = Image.new("RGBA", (portrait_size + glow_pad * 2, portrait_size + glow_pad * 2), (0, 0, 0, 0))
gdr = ImageDraw.Draw(glow)
gdr.ellipse(
    (glow_pad - 4, glow_pad - 4, portrait_size + glow_pad + 4, portrait_size + glow_pad + 4),
    fill=(ACCENT[0], ACCENT[1], ACCENT[2], 110),
)
glow = glow.filter(ImageFilter.GaussianBlur(28))
img.paste(glow, (px - glow_pad, py - glow_pad), glow)

# Coral ring
ring_layer = Image.new("RGBA", (portrait_size + 8, portrait_size + 8), (0, 0, 0, 0))
rd = ImageDraw.Draw(ring_layer)
rd.ellipse((0, 0, portrait_size + 8, portrait_size + 8), fill=ACCENT + (255,))
ring_mask = Image.new("L", (portrait_size + 8, portrait_size + 8), 0)
rmd = ImageDraw.Draw(ring_mask)
rmd.ellipse((0, 0, portrait_size + 8, portrait_size + 8), fill=255)
img.paste(ring_layer, (px - 4, py - 4), ring_mask)

# Portrait on top
img.paste(p, (px, py), mask)

# Text — try multiple font paths
def load_font(paths, size):
    for pth in paths:
        try:
            return ImageFont.truetype(pth, size)
        except Exception:
            continue
    return ImageFont.load_default()

font_dirs = [
    "/Library/Fonts/", "/System/Library/Fonts/", "/System/Library/Fonts/Supplemental/",
]
sans_paths = [
    "/System/Library/Fonts/SFNS.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/Library/Fonts/Arial.ttf",
]
italic_paths = [
    "/System/Library/Fonts/Supplemental/Georgia Italic.ttf",
    "/Library/Fonts/Georgia Italic.ttf",
] + sans_paths
mono_paths = [
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/Monaco.ttf",
] + sans_paths

f_eyebrow = load_font(mono_paths, 22)
f_h1 = load_font(sans_paths, 64)
f_h1_italic = load_font(italic_paths, 64)
f_sub = load_font(sans_paths, 24)
f_url = load_font(mono_paths, 20)

draw = ImageDraw.Draw(img)
left = 70
top = 180

# Eyebrow
eyebrow = "STOP BLEEDING ON BUSYWORK · BUILT IN 48-72H"
draw.text((left, top), eyebrow, font=f_eyebrow, fill=ACCENT)

# Headline (2 lines, italic for "burning")
y = top + 50
# Line 1: "You're "  +  italic "burning"  +  " money"
prefix = "You're "
draw.text((left, y), prefix, font=f_h1, fill=TEXT_PRIMARY)
prefix_w = draw.textlength(prefix, font=f_h1)
italic_word = "burning"
draw.text((left + prefix_w, y), italic_word, font=f_h1_italic, fill=ACCENT)
italic_w = draw.textlength(italic_word, font=f_h1_italic)
after = " money"
draw.text((left + prefix_w + italic_w, y), after, font=f_h1, fill=TEXT_PRIMARY)

# Line 2: "on busywork."
y2 = y + 78
draw.text((left, y2), "on busywork.", font=f_h1, fill=TEXT_PRIMARY)

# Sub
y3 = y2 + 100
draw.text((left, y3), "Javi Pérez — Production AI, shipped in days · Almería", font=f_sub, fill=TEXT_SECONDARY)

# Wordmark top-left
f_wordmark = load_font(sans_paths, 28)
draw.text((left, 60), "Javi Pérez", font=f_wordmark, fill=TEXT_PRIMARY)

# URL bottom-left
draw.text((left, H - 50), "javiperezbuilds.com", font=f_url, fill=TEXT_DIM)

# Output
img.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
print(f"Wrote {OUT} ({os.path.getsize(OUT)} bytes)")
