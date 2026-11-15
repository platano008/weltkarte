#!/usr/bin/env python3
"""Erzeugt "Plyus Korn": Plyus Bold, in Körner aufgelöst, mit ausgefransten Rändern.
Aufruf: python3 tools/kornschrift.py [Körner je Geviert] [Ausgabename] [Familienname] [nur diese Zeichen]
  python3 tools/kornschrift.py 140
  python3 tools/kornschrift.py 280 fonts/Plyus-Korn-Gross "Plyus Korn Gross" Plyus   (feiner Schnitt für die grosse Titelzeile)
(braucht fonttools, pillow, numpy, scipy)"""
import sys, zlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import gaussian_filter
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen

SRC = "fonts/Plyus-Bold.ttf"
OUT = sys.argv[2] if len(sys.argv) > 2 else "fonts/Plyus-Korn"
FAM = sys.argv[3] if len(sys.argv) > 3 else "Plyus Korn"
NUR = sys.argv[4] if len(sys.argv) > 4 else None
G   = int(sys.argv[1]) if len(sys.argv) > 1 else 100   # Körner je Geviert
SS  = 4            # Überabtastung beim Rastern
SIG = 0.024*G     # Weichzeichnung in Körnern: Breite des Fransenrands
SPR = 0.25         # Streuung der Schwelle: wie weit Körner nach aussen fliegen
HOLE = 0.07        # Anteil dunkler Sprenkel im Inneren
PAD = int(0.12*G)  # Rand in Körnern um jedes Zeichen

def raster(pil, ch, asc, desc):
    w = int(pil.getlength(ch)) + 2*PAD*SS
    h = (asc + desc)*G*SS//1000 + 2*PAD*SS
    im = Image.new("L", (max(w, 4*SS), h), 0)
    base = PAD*SS + asc*G*SS//1000
    ImageDraw.Draw(im).text((PAD*SS, base), ch, font=pil, fill=255, anchor="ls")
    a = np.asarray(im, dtype=np.float32)/255
    H, W = (a.shape[0]//SS)*SS, (a.shape[1]//SS)*SS
    a = a[:H, :W].reshape(H//SS, SS, W//SS, SS).mean(axis=(1, 3))
    return a, PAD + asc*G//1000          # Feld je Korn, Zeile der Grundlinie

def korn(a, rng):
    f = gaussian_filter(a, SIG)
    t = np.clip(0.5 + SPR*rng.standard_normal(a.shape), 0.04, 0.985)
    on = f > t
    on &= ~((f > 0.8) & (rng.random(a.shape) < HOLE))
    return on

def umrisse(on):
    """Zellraster -> geschlossene Umrisse (Punkte im Zellgitter, y nach unten)."""
    H, W = on.shape
    p = np.pad(on, 1)
    nxt = {}
    def add(a, b): nxt.setdefault(a, []).append(b)
    ys, xs = np.nonzero(on)
    for y, x in zip(ys.tolist(), xs.tolist()):
        py, px = y+1, x+1
        if not p[py-1, px]: add((x, y), (x+1, y))        # oben: nach rechts
        if not p[py, px+1]: add((x+1, y), (x+1, y+1))    # rechts: nach unten
        if not p[py+1, px]: add((x+1, y+1), (x, y+1))    # unten: nach links
        if not p[py, px-1]: add((x, y+1), (x, y))        # links: nach oben
    loops = []
    while nxt:
        s = next(iter(nxt)); cur = s; loop = []; prev = None
        while True:
            outs = nxt[cur]
            if len(outs) > 1 and prev is not None:
                # an Berührungsecken rechts abbiegen, damit Körner getrennt bleiben
                dx, dy = cur[0]-prev[0], cur[1]-prev[1]
                want = (cur[0]-dy, cur[1]+dx)
                b = want if want in outs else outs[0]
                outs.remove(b)
            else: b = outs.pop()
            if not outs: del nxt[cur]
            loop.append(cur); prev, cur = cur, b
            if cur == s and (s not in nxt or True):
                break
        # gerade Stücke zusammenfassen
        n = len(loop); keep = []
        for i in range(n):
            a, b, c = loop[i-1], loop[i], loop[(i+1) % n]
            if (b[0]-a[0])*(c[1]-b[1]) != (b[1]-a[1])*(c[0]-b[0]): keep.append(b)
        if len(keep) >= 4: loops.append(keep)
    return loops

def main():
    font = TTFont(SRC)
    asc, desc = font["hhea"].ascent, -font["hhea"].descent
    U = 1000/G
    pil = ImageFont.truetype(SRC, G*SS)
    cmap = font.getBestCmap(); glyf = font["glyf"]; hmtx = font["hmtx"]
    pts = 0
    for code, name in sorted(cmap.items()):
        ch = chr(code)
        if not ch.strip() or (NUR and ch not in NUR): continue
        rng = np.random.default_rng(1000 + code)
        a, base = raster(pil, ch, asc, desc)
        loops = umrisse(korn(a, rng))
        pen = TTGlyphPen(None)
        for lp in loops:
            q = [(round((x-PAD)*U), round((base-y)*U)) for x, y in lp]
            pen.moveTo(q[0])
            for pt in q[1:]: pen.lineTo(pt)
            pen.closePath(); pts += len(q)
        g = pen.glyph(); glyf[name] = g
        g.recalcBounds(glyf)
        hmtx[name] = (hmtx[name][0], getattr(g, "xMin", 0) if loops else 0)
    for rec in font["name"].names:
        s = rec.toUnicode()
        if rec.nameID in (1, 16): rec.string = FAM
        elif rec.nameID in (2, 17): rec.string = "Regular"
        elif rec.nameID == 4: rec.string = FAM
        elif rec.nameID == 6: rec.string = FAM.replace(" ", "") + "-Regular"
        elif rec.nameID == 3: rec.string = FAM.replace(" ", "") + "-Regular-1.0"
    font["OS/2"].usWeightClass = 400; font["OS/2"].fsSelection = 0x40; font["head"].macStyle = 0
    font.save(OUT + ".ttf")
    font.flavor = "woff"; font.save(OUT + ".woff")
    print("Körner/Geviert", G, "Punkte", pts)

main()
