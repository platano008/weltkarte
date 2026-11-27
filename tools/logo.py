#!/usr/bin/env python3
"""Plyus-Logo: das Plus aus dem P des Schriftzugs, groß und weiß, mit derselben Neigung.
   Schreibt bild/logo.svg sowie die Symbole bild/favicon.png (64), bild/icon-180.png und bild/icon-512.png (weiß auf schwarz)."""
from PIL import Image, ImageDraw
SX, KS = 1.22, 0.244                     # Neigung wie im Schriftzug: matrix(1.22 0 -0.244 1 …)
A, D = 28.0, 10.5                        # Plus 28 × 28, Arme 7 breit (wie im P: 45…73 / 18.2…46.2)
PLUS = [(D,0),(A-D,0),(A-D,D),(A,D),(A,A-D),(A-D,A-D),(A-D,A),(D,A),(D,A-D),(0,A-D),(0,D),(D,D)]
schraeg = lambda x, y: (SX*x - KS*y, y)
P = [schraeg(x, y) for x, y in PLUS]
x0 = min(p[0] for p in P); W = max(p[0] for p in P) - x0
pts = [(x - x0, y) for x, y in P]
d = "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + "Z"
open("bild/logo.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {A:g}" fill="#fff"><path d="{d}"/></svg>\n')
def symbol(n, rand=0.2):
    s = 8*n; im = Image.new("RGB", (s, s), "#000"); g = ImageDraw.Draw(im)
    k = s*(1 - 2*rand)/max(W, A); ox = (s - W*k)/2; oy = (s - A*k)/2
    g.polygon([(ox + x*k, oy + y*k) for x, y in pts], fill="#fff")
    return im.resize((n, n), Image.LANCZOS)
symbol(64, .12).save("bild/favicon.png"); symbol(180, .16).save("bild/icon-180.png"); symbol(512, .16).save("bild/icon-512.png")
print(f"logo.svg {W:.1f} × {A:g}")
