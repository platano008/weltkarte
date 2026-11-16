#!/usr/bin/env python3
"""Zeichnet die Grafiken der Startseite im rauen Linienstil (weiss, ausgefranste Kanten).
Aufruf: python3 tools/grafiken.py   (braucht pillow, numpy, scipy)  ->  bild/g-*.png"""
import json, math
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter

S = 2  # Zeichnen in doppelter Grösse

class Blatt:
    def __init__(s, w, h): s.w, s.h = w, h; s.im = Image.new("L", (int(w*S), int(h*S)), 0); s.d = ImageDraw.Draw(s.im)
    def P(s, pts): return [(x*S, y*S) for x, y in pts]
    def linie(s, pts, b=6, zu=False):
        pts = list(pts) + ([pts[0]] if zu else []); b = b*1.4 + 0.6
        s.d.line(s.P(pts), fill=255, width=int(b*S), joint="curve")
        r = b*S/2
        if b <= 1: return
        for x, y in s.P(pts): s.d.ellipse((x-r, y-r, x+r, y+r), fill=255)
    def strich(s, pts, b=4, an=14, aus=10):
        """gestrichelte Linie"""
        acc = 0; on = True; cur = [pts[0]]
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            L = math.hypot(x1-x0, y1-y0); t = 0
            while t < L:
                step = min((an if on else aus) - acc, L - t); t += step; acc += step
                p = (x0 + (x1-x0)*t/L, y0 + (y1-y0)*t/L)
                if on: cur.append(p)
                if acc >= (an if on else aus) - 1e-6:
                    if on and len(cur) > 1: s.linie(cur, b)
                    on = not on; acc = 0; cur = [p]
        if on and len(cur) > 1: s.linie(cur, b)
    def kreis(s, cx, cy, r, b=6, fuell=False):
        if fuell: s.d.ellipse(((cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S), fill=255)
        else: s.linie([(cx + r*math.cos(a), cy + r*math.sin(a)) for a in np.linspace(0, 2*math.pi, max(24, int(r)))], b, zu=True)
    def bogen(s, cx, cy, r, a0, a1, b=6):
        s.linie([(cx + r*math.cos(math.radians(a)), cy + r*math.sin(math.radians(a))) for a in np.linspace(a0, a1, max(8, int(abs(a1-a0)/3)))], b)
    def flaeche(s, pts, f=255): s.d.polygon(s.P(pts), fill=f)
    def rau(s, name, seed=1, wack=0.30, loch=0.035):
        """Kanten ausfransen, Tinte stellenweise ausreissen lassen, als Weiss mit harter Deckkraft speichern."""
        rng = np.random.default_rng(seed)
        a = np.asarray(s.im, dtype=np.float32)/255
        def wolke(sig):
            n = gaussian_filter(rng.standard_normal(a.shape), sig); return n/(n.std()+1e-9)/2
        f = gaussian_filter(a, 1.5*S)
        t = 0.5 + wack*wolke(2.2*S) + 0.12*wolke(9*S) + 0.10*rng.standard_normal(a.shape)
        on = f > t
        on &= ~((wolke(1.3*S) > 1.05 - loch*8) & (rng.random(a.shape) < 0.8))      # abgeplatzte Stellen
        on |= (f > 0.04) & (rng.random(a.shape) < 0.005)                           # Farbspritzer am Rand
        al = Image.fromarray((on*255).astype(np.uint8)).resize((s.w, s.h), Image.LANCZOS).point(lambda v: 255 if v > 120 else 0)
        out = Image.new("LA", (s.w, s.h), 255); out.putalpha(al)
        out.save("bild/g-" + name + ".png", optimize=True)

def globus():
    W = 1240; b = Blatt(W, W); R = 560; c = W/2
    lon0, lat0 = math.radians(34), math.radians(36)
    def pr(lon, lat):
        lo, la = math.radians(lon) - lon0, math.radians(lat)
        cosc = math.sin(lat0)*math.sin(la) + math.cos(lat0)*math.cos(la)*math.cos(lo)
        x = math.cos(la)*math.sin(lo); y = math.cos(lat0)*math.sin(la) - math.sin(lat0)*math.cos(la)*math.cos(lo)
        return (c + R*x, c - R*y, cosc)
    def zug(ll, br):
        cur = []
        for lon, lat in ll:
            x, y, v = pr(lon, lat)
            if v > 0.02: cur.append((x, y))
            else:
                if len(cur) > 1: b.linie(cur, br)
                cur = []
        if len(cur) > 1: b.linie(cur, br)
    for lon in range(-180, 180, 20): zug([(lon, la) for la in range(-80, 81, 3)], 3)
    for lat in range(-60, 81, 20): zug([(lo, lat) for lo in range(-180, 181, 3)], 3)
    for ring in json.load(open("daten/land.json"))["ringe"]:
        if len(ring) > 10: zug(list(zip(ring[0::2], ring[1::2])) + [(ring[0], ring[1])], 5.2)
    b.kreis(c, c, R, 8)
    # Markierung Ukraine
    x, y, _ = pr(34.5, 48.6)
    b.kreis(x, y, 34, 6); b.kreis(x, y, 9, 0, fuell=True)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)): b.linie([(x+dx*46, y+dy*46), (x+dx*80, y+dy*80)], 6)
    b.rau("globus", 3)

def panzer():
    b = Blatt(1000, 460)
    # Laufwerk
    kette = [(120, 300), (860, 300), (912, 338), (858, 404), (150, 404), (84, 338)]
    b.linie(kette, 8, zu=True)
    for i in range(6): b.kreis(205 + i*118, 350, 36, 6); b.kreis(205 + i*118, 350, 9, 0, fuell=True)
    b.kreis(128, 338, 22, 6); b.kreis(872, 338, 22, 6)
    for x in range(150, 860, 34): b.linie([(x, 404), (x+10, 414)], 5)
    # Wanne
    b.linie([(96, 300), (150, 248), (840, 248), (930, 300)], 8)
    b.linie([(170, 274), (830, 274)], 4)
    for x in (300, 470, 640): b.linie([(x, 274), (x, 300)], 4)
    # Turm
    b.linie([(350, 248), (378, 178), (590, 166), (668, 196), (700, 248)], 8)
    b.linie([(452, 172), (458, 142), (528, 140), (536, 169)], 6)
    b.linie([(404, 176), (372, 60)], 4)                         # Antenne
    b.linie([(500, 140), (500, 118), (566, 112)], 5)            # MG
    b.linie([(560, 205), (640, 205), (640, 228), (560, 228)], 4, zu=True)
    # Rohr
    b.linie([(664, 192), (952, 176), (952, 196), (674, 214)], 7, zu=True)
    b.linie([(952, 168), (990, 166), (990, 204), (952, 204)], 7, zu=True)
    b.linie([(800, 184), (800, 207)], 5)
    b.strich([(30, 432), (980, 432)], 4, 26, 16)
    b.rau("panzer", 5)

def radar():
    W = 620; b = Blatt(W, W); c = W/2
    for r in (90, 180, 270): b.kreis(c, c, r, 5 if r < 270 else 7)
    b.linie([(c-292, c), (c+292, c)], 3.5); b.linie([(c, c-292), (c, c+292)], 3.5)
    for a in range(0, 360, 10):
        r0 = 270; r1 = 290 if a % 30 == 0 else 280
        b.linie([(c + r0*math.cos(math.radians(a)), c + r0*math.sin(math.radians(a))), (c + r1*math.cos(math.radians(a)), c + r1*math.sin(math.radians(a)))], 3.5)
    # Suchstrahl als Keil aus Strichen
    for i, a in enumerate(range(-62, -30, 4)):
        b.linie([(c, c), (c + 268*math.cos(math.radians(a)), c + 268*math.sin(math.radians(a)))], 2 + i*0.75)
    for x, y, r in ((c+120, c-60, 11), (c+60, c+130, 9), (c-150, c+50, 9), (c-70, c-170, 12), (c+190, c+70, 8)): b.kreis(x, y, r, 0, fuell=True)
    b.kreis(c-70, c-170, 26, 4)
    b.rau("radar", 7)

def satellit():
    b = Blatt(700, 470)
    b.linie([(300, 150), (400, 150), (400, 270), (300, 270)], 7, zu=True)
    for sx in (-1, 1):
        x0 = 350 + sx*50; x1 = 350 + sx*90; x2 = 350 + sx*320
        b.linie([(x0, 210), (x1, 210)], 6)
        b.linie([(x1, 150), (x2, 150), (x2, 270), (x1, 270)], 7, zu=True)
        for k in range(1, 4): xx = x1 + (x2-x1)*k/4; b.linie([(xx, 150), (xx, 270)], 4)
        b.linie([(x1, 210), (x2, 210)], 4)
    b.bogen(350, 318, 44, 200, 340, 7); b.linie([(350, 270), (350, 300)], 6); b.kreis(350, 322, 6, 0, fuell=True)
    for r in (40, 70, 100): b.bogen(350, 330, r, 55, 125, 4.5)
    b.linie([(350, 150), (350, 96)], 5); b.kreis(350, 86, 9, 0, fuell=True)
    b.rau("satellit", 9)

def fadenkreuz():
    W = 620; b = Blatt(W, W); c = W/2
    b.kreis(c, c, 270, 8); b.kreis(c, c, 60, 5)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        b.linie([(c+dx*34, c+dy*34), (c+dx*262, c+dy*262)], 4.5)
        for k in range(1, 6):
            r = 60 + k*36; t = 14 if k % 2 else 8
            b.linie([(c+dx*r - dy*t, c+dy*r - dx*t), (c+dx*r + dy*t, c+dy*r + dx*t)], 4)
    b.kreis(c, c, 5, 0, fuell=True)
    for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)): b.linie([(c+sx*150, c+sy*118), (c+sx*150, c+sy*150), (c+sx*118, c+sy*150)], 5)
    b.rau("fadenkreuz", 11)

def einheiten():
    b = Blatt(760, 420)
    # eigene Infanterie (Rechteck mit Kreuz) mit Grössenzeichen
    b.linie([(70, 150), (370, 150), (370, 340), (70, 340)], 8, zu=True)
    b.linie([(70, 150), (370, 340)], 6); b.linie([(370, 150), (70, 340)], 6)
    for x in (190, 220, 250): b.linie([(x, 92), (x, 128)], 7)
    # gegnerischer Verband (Raute) mit Panzerzeichen
    cx, cy, r = 570, 245, 150
    b.linie([(cx, cy-r), (cx+r, cy), (cx, cy+r), (cx-r, cy)], 8, zu=True)
    b.linie([(cx-52, cy-30), (cx+52, cy-30)], 6); b.linie([(cx-52, cy+30), (cx+52, cy+30)], 6)
    b.bogen(cx-52, cy, 30, 90, 270, 6); b.bogen(cx+52, cy, 30, -90, 90, 6)
    for x in (cx-14, cx+14): b.linie([(x-10, 50), (x+10, 78)], 6); b.linie([(x+10, 50), (x-10, 78)], 6)
    b.rau("einheiten", 13)

for f in (globus, panzer, radar, satellit, fadenkreuz, einheiten): f()

def fernglas():
    b = Blatt(640, 470)
    for m in (1, -1):
        X = lambda x: 320 + m*(x - 320)
        b.linie([(X(150), 96), (X(232), 96), (X(264), 205), (X(284), 410), (X(96), 410), (X(116), 205)], 8, zu=True)
        b.linie([(X(160), 96), (X(160), 58), (X(222), 58), (X(222), 96)], 7)
        b.linie([(X(104), 362), (X(280), 362)], 5); b.linie([(X(122), 205), (X(262), 205)], 5)
    b.linie([(262, 215), (378, 215)], 7); b.linie([(266, 268), (374, 268)], 7)
    b.kreis(320, 168, 26, 7); b.kreis(320, 168, 6, 0, fuell=True)
    b.rau("fernglas", 21)

def artillerie():
    b = Blatt(1000, 470); a = math.radians(-17)
    def R(x, y): return (300 + x*math.cos(a) - y*math.sin(a), 262 + x*math.sin(a) + y*math.cos(a))
    b.linie([R(-90, -15), R(560, -11), R(560, 11), R(-90, 15)], 7, zu=True)            # Rohr
    b.linie([R(560, -22), R(640, -22), R(640, 22), R(560, 22)], 7, zu=True)            # Mündungsbremse
    b.linie([R(600, -22), R(600, 22)], 5)
    b.linie([R(-150, -32), R(-70, -32), R(-70, 32), R(-150, 32)], 8, zu=True)          # Verschluss
    b.linie([R(40, -15), R(40, -44), R(250, -40), R(250, -13)], 6)                     # Rohrwiege
    b.linie([(330, 150), (392, 138), (410, 300), (350, 322)], 7, zu=True)              # Schild
    b.kreis(318, 348, 78, 8); b.kreis(318, 348, 16, 6)
    for k in range(8): t = k*math.pi/4; b.linie([(318 + 20*math.cos(t), 348 + 20*math.sin(t)), (318 + 72*math.cos(t), 348 + 72*math.sin(t))], 4.5)
    b.linie([(290, 330), (60, 404)], 9); b.linie([(60, 380), (34, 432), (92, 426)], 7)  # Holm und Sporn
    b.strich([(20, 440), (980, 440)], 4, 26, 16)
    for i, (x, y) in enumerate(((930, 40), (964, 62), (952, 20))): b.linie([(x, y), (x + 22, y - 8)], 4)
    b.rau("artillerie", 23)

def hubschrauber():
    b = Blatt(1000, 440)
    b.linie([(250, 170), (470, 150), (560, 190), (590, 250), (540, 300), (300, 305), (215, 262), (205, 215)], 8, zu=True)   # Rumpf
    b.linie([(232, 190), (300, 182), (318, 250), (224, 258)], 6, zu=True)                                                # Kanzel
    b.linie([(575, 215), (880, 196), (930, 120), (958, 120), (930, 228), (585, 262)], 8)                                 # Heckausleger
    b.kreis(942, 150, 44, 5); b.kreis(942, 150, 7, 0, fuell=True)
    b.linie([(400, 152), (400, 104)], 8); b.linie([(60, 96), (760, 110)], 7); b.kreis(400, 102, 10, 0, fuell=True)
    b.linie([(330, 305), (318, 362)], 6); b.linie([(500, 302), (512, 362)], 6); b.linie([(240, 352), (270, 366), (580, 366)], 7)
    b.linie([(360, 228), (520, 224)], 5); b.linie([(300, 318), (250, 330), (250, 346), (300, 338)], 5, zu=True)
    b.rau("hubschrauber", 25)

for f in (fernglas, artillerie, hubschrauber): f()

def gurt():
    """Munitionsgurt als Kachel (sechs Patronen), nahtlos wiederholbar; doppelte Auflösung."""
    import random
    K = 2; P = 46; N = 6; W = P*N; H = 196
    b = Blatt(W*K, H*K); rnd = random.Random(5)
    def bez(p0, p1, p2, n=10): return [((1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0], (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1]) for t in (i/n for i in range(n+1))]
    def poly(pts, f=255): b.flaeche([(x*K, y*K) for x, y in pts], f)
    for k in range(-1, N + 1):                      # eine Patrone links und rechts über den Rand, damit die Kachel nahtlos ist
        cx = P/2 + k*P; dy = [2, -3, 1, -1, 3, -2][k % N]; a = math.radians([-2.5, 1.5, -1, 2.5, -1.5, 1][k % N])
        def R(x, y): x -= cx; y -= 110; return (cx + x*math.cos(a) - y*math.sin(a), 110 + dy + x*math.sin(a) + y*math.cos(a))
        rechts = bez((0, 4), (5.5, 14), (6.6, 34)) + [(6.6, 50), (6.9, 56), (10.4, 66), (10.4, 136), (11.2, 138), (11.2, 146), (8.6, 148), (8.6, 152), (11.2, 154), (11.2, 162)]
        umriss = rechts + [(-x, y) for x, y in reversed(rechts)]
        poly([R(x + cx, y) for x, y in umriss])
        poly([R(x + cx, y) for x, y in [(-3.4, 12), (-2.0, 12), (-2.4, 46), (-3.6, 46)]], 0)       # Glanzlinie auf dem Geschoss
        poly([R(x + cx, y) for x, y in [(-11.5, 56), (11.5, 56), (11.5, 58.4), (-11.5, 58.4)]], 0)   # Rille am Hals
        poly([R(x + cx, y) for x, y in [(-6.4, 70), (-4.8, 70), (-4.8, 132), (-6.4, 132)]], 0)       # Glanz auf der Hülse
    # Gurtglieder: Band quer, Schlaufen um jede Patrone, schmale Lücken dazwischen
    for k in range(-1, N + 1):
        cx = P/2 + k*P
        poly([(cx-14, 92), (cx+14, 92), (cx+14, 126), (cx-14, 126)])                  # Schlaufe
        poly([(cx+13, 97), (cx+P-13, 97), (cx+P-13, 121), (cx+13, 121)])              # Verbinder
        poly([(cx+P/2-1.4, 99), (cx+P/2+1.4, 99), (cx+P/2+1.4, 119), (cx+P/2-1.4, 119)], 0)   # Lücke zwischen den Gliedern
        poly([(cx-14, 104), (cx+14, 104), (cx+14, 105.6), (cx-14, 105.6)], 0); poly([(cx-14, 113), (cx+14, 113), (cx+14, 114.6), (cx-14, 114.6)], 0)
    b.rau("gurt", 31, wack=0.16, loch=-0.25)

gurt()
