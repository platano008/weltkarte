#!/usr/bin/env python3
"""Plyus Grotesk: Textschrift passend zur Titelschrift. Jeder Buchstabe ist ein Gerüst aus Strichen fester Stärke;
außen werden die Ecken oben links und unten rechts rund, oben rechts und unten links bleiben spitz (wie im Schriftzug).
Aufruf: python3 grotesk.py <Strichstärke> <Ausgabe ohne Endung> <Familie> <Stil> [kursiv]"""
import math, sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

T = float(sys.argv[1]); OUT = sys.argv[2]; FAM = sys.argv[3]; STIL = sys.argv[4]; KURSIV = len(sys.argv) > 5
h = T/2
CAP, XH, ASC, DSC = 700, 520, 740, -210
B, C, X, A, D = h, CAP - h, XH - h, ASC - h, DSC + h
M, mx = (B + C)/2, (B + X)/2
WU, WL, WD = 500, 400, 460          # Breite der Mittellinien: groß, klein, Ziffern
R  = T*1.05                          # runde Ecke außen
RI = T*0.16                          # innen
SB = 40 + T*0.08                  # Vor- und Nachbreite
SCHRAEG = math.tan(math.radians(10))
RUND = {"TL", "BR"}                  # welche Ecken rund werden

# ---------- Striche ----------
def seite(pts, zu, s):
    n = len(pts); out = []
    for i in range(n):
        p = pts[i]
        a = pts[i-1] if (i > 0 or zu) else None
        b = pts[(i+1) % n] if (i < n-1 or zu) else None
        def nrm(u, v):
            dx, dy = v[0]-u[0], v[1]-u[1]; l = math.hypot(dx, dy); return (-dy/l*s, dx/l*s), (dx/l, dy/l)
        if a is None or b is None:
            (nx, ny), (dx, dy) = nrm(p, b) if a is None else nrm(a, p)
            aus = (-dx, -dy) if a is None else (dx, dy)
            q = (p[0] + nx*h, p[1] + ny*h)
            if abs(aus[0]) > 1e-6 and abs(aus[1]) > 1e-6:          # schräger Strich: waagrecht abschneiden
                k = (p[1] + math.copysign(h, aus[1]) - q[1])/aus[1]
            else: k = h                                             # gerader Strich: eckig verlängern
            out.append((q[0] + aus[0]*k, q[1] + aus[1]*k)); continue
        (n1, d1), (n2, d2) = nrm(a, p), nrm(p, b)
        mxx, myy = n1[0] + n2[0], n1[1] + n2[1]; ml = math.hypot(mxx, myy); c = ml/2
        if c < 0.38:
            out.append((p[0] + n1[0]*h + d1[0]*h*0.7, p[1] + n1[1]*h + d1[1]*h*0.7)); out.append((p[0] + n2[0]*h - d2[0]*h*0.7, p[1] + n2[1]*h - d2[1]*h*0.7))
        else:
            k = h/c/ml; out.append((p[0] + mxx*k, p[1] + myy*k))
    return out
def flaeche(r): return sum(r[i][0]*r[(i+1) % len(r)][1] - r[(i+1) % len(r)][0]*r[i][1] for i in range(len(r)))/2
def ccw(r): return r if flaeche(r) > 0 else r[::-1]
def cw(r): return r if flaeche(r) < 0 else r[::-1]
def kontur(st):
    """Strich -> Konturen, Füllung immer links (außen gegen den Uhrzeigersinn, Loch im Uhrzeigersinn)."""
    zu = st[0] == "zu"; pts = st[1:] if zu else st
    if zu:
        a, b = seite(pts, True, 1), seite(pts, True, -1)
        au, inn = (a, b) if abs(flaeche(a)) > abs(flaeche(b)) else (b, a)
        return [ccw(au), cw(inn)]
    return [ccw(seite(pts, False, 1) + seite(pts, False, -1)[::-1])]

def ecken(r, rund):
    """Pro Ecke: Kurve oder spitz. Rückgabe: Liste von Befehlen für den Stift."""
    n = len(r); cmds = []
    for i in range(n):
        p, a, b = r[i], r[i-1], r[(i+1) % n]
        ax, ay = p[0]-a[0], p[1]-a[1]; bx, by = b[0]-p[0], b[1]-p[1]
        la, lb = math.hypot(ax, ay), math.hypot(bx, by)
        if la < 1e-6 or lb < 1e-6: cmds.append(("L", p)); continue
        ux, uy, vx, vy = ax/la, ay/la, bx/lb, by/lb
        kreuz = ux*vy - uy*vx; ox, oy = ux - vx, uy - vy
        q = ("T" if oy > 0.25 else "B" if oy < -0.25 else "") + ("L" if ox < -0.25 else "R" if ox > 0.25 else "")
        if abs(kreuz) < 0.05: cmds.append(("L", p)); continue
        if kreuz > 0: rad = R if q in rund else 0
        else: rad = max(RI, R - T) if q in rund else RI
        rad = min(rad, la*0.5, lb*0.5)
        if rad < 1: cmds.append(("L", p)); continue
        cmds.append(("Q", (p[0] - ux*rad, p[1] - uy*rad), p, (p[0] + vx*rad, p[1] + vy*rad)))
    return cmds

# ---------- Bausteine ----------
def P(*pts): return list(pts)
def Z(*pts): return ["zu"] + list(pts)
def H_(x0, x1, y): return [(x0, y), (x1, y)]
def V_(x, y0, y1): return [(x, y0), (x, y1)]
def PT(x, y, s=1.0):                    # Punkt: Quadrat in Strichstärke
    return [(x, y - h*s + h), (x, y + h*s - h + 0.01)] if s == 1 else [(x, y - (s-1)*h), (x, y + (s-1)*h)]
def dot(x, y): return [(x, y - 0.5), (x, y + 0.5)]

G = {}
def g(ch, w, *st, rund=None): G[ch] = (w, [s for s in st if s], rund or RUND)
W, w = WU, WL
UMH = CAP + T*0.95; uml = XH + T*1.25
# Großbuchstaben
g("A", W, P((0,B),(0,C),(W,C),(W,B)), H_(0,W,M*0.95))
g("B", W, P((0,B),(0,C),(W*0.86,C),(W*0.86,M),(0,M)), P((0,M),(W,M),(W,B),(0,B)))
g("C", W, P((W,C),(0,C),(0,B),(W,B)))
g("D", W, Z((0,B),(0,C),(W,C),(W,B)), rund={"TR","BR"})
g("E", W*0.92, P((W*0.92,C),(0,C),(0,B),(W*0.92,B)), H_(0,W*0.78,M))
g("F", W*0.9, P((W*0.9,C),(0,C),(0,B)), H_(0,W*0.76,M))
g("G", W, P((W,C),(0,C),(0,B),(W,B),(W,M),(W*0.5,M)))
g("H", W, V_(0,B,C), V_(W,B,C), H_(0,W,M))
g("I", 0, V_(0,B,C))
g("J", W*0.8, P((W*0.8,C),(W*0.8,B),(0,B),(0,M*0.75)))
g("K", W*0.95, V_(0,B,C), H_(0,W*0.32,M), P((W*0.32,M),(W*0.95,C)), P((W*0.32,M),(W*0.95,B)))
g("L", W*0.86, P((0,C),(0,B),(W*0.86,B)))
g("M", W*1.28, P((0,B),(0,C),(W*1.28,C),(W*1.28,B)), V_(W*0.64,B,C))
g("N", W, V_(0,B,C), P((0,C),(W,B)), V_(W,B,C), rund={"TL","BR"})
g("O", W, Z((0,B),(0,C),(W,C),(W,B)))
g("P", W, P((0,B),(0,C),(W,C),(W,M*0.95),(0,M*0.95)))
g("Q", W, Z((0,B),(0,C),(W,C),(W,B)), P((W*0.62,B+T*0.9),(W+T*0.55,B-T*1.25)))
g("R", W, P((0,B),(0,C),(W,C),(W,M*0.95),(0,M*0.95)), P((W*0.45,M*0.95),(W,B)))
g("S", W, P((W,C),(0,C),(0,M),(W,M),(W,B),(0,B)))
g("T", W, H_(0,W,C), V_(W/2,B,C))
g("U", W, P((0,C),(0,B),(W,B),(W,C)))
g("V", W, P((0,C),(W*0.42,B),(W*0.58,B),(W,C)))
g("W", W*1.28, P((0,C),(0,B),(W*1.28,B),(W*1.28,C)), V_(W*0.64,B,C*0.82))
g("X", W, P((0,C),(W,B)), P((0,B),(W,C)))
g("Y", W, P((0,C),(0,M),(W,M),(W,C)), V_(W/2,M,B))
g("Z", W, H_(0,W,C), P((W,C),(0,B)), H_(0,W,B))
for u, base in (("Ä","A"),("Ö","O"),("Ü","U")):
    bw, st, rd = G[base]; G[u] = (bw, st + [dot(bw*0.28, UMH), dot(bw*0.72, UMH)], rd)
g("ẞ", W, P((0,B),(0,C),(W*0.78,C),(W*0.78,M+T*0.9),(W*0.38,M+T*0.9),(W*0.38,M-T*0.2),(W,M-T*0.2),(W,B),(W*0.3,B)))
# Kleinbuchstaben
g("a", w, H_(0,w,X), V_(w,X,B), P((w,mx),(0,mx),(0,B),(w,B)))
g("b", w, V_(0,B,A), P((0,X),(w,X),(w,B),(0,B)))
g("c", w*0.92, P((w*0.92,X),(0,X),(0,B),(w*0.92,B)))
g("d", w, V_(w,B,A), P((w,X),(0,X),(0,B),(w,B)))
g("e", w, P((0,mx),(w,mx),(w,X),(0,X),(0,B),(w,B)))
g("f", w*0.72, P((w*0.72,A),(w*0.22,A),(w*0.22,B)), H_(0,w*0.66,X))
g("g", w, P((w,B),(0,B),(0,X),(w,X),(w,D),(0,D)))
g("h", w, V_(0,B,A), P((0,X),(w,X),(w,B)))
g("i", 0, V_(0,B,X), dot(0, uml))
g("j", w*0.42, P((w*0.42,X),(w*0.42,D),(0,D)), dot(w*0.42, uml))
g("k", w*0.92, V_(0,B,A), H_(0,w*0.3,mx), P((w*0.3,mx),(w*0.92,X)), P((w*0.3,mx),(w*0.92,B)))
g("l", T*0.95, P((0,A),(0,B),(T*0.95,B)))
g("m", w*1.42, P((0,B),(0,X),(w*1.42,X),(w*1.42,B)), V_(w*0.71,B,X))
g("n", w, P((0,B),(0,X),(w,X),(w,B)))
g("o", w, Z((0,B),(0,X),(w,X),(w,B)))
g("p", w, V_(0,D,X), P((0,X),(w,X),(w,B),(0,B)))
g("q", w, V_(w,D,X), P((w,X),(0,X),(0,B),(w,B)))
g("r", w*0.7, P((0,B),(0,X),(w*0.7,X)))
g("s", w, P((w,X),(0,X),(0,mx),(w,mx),(w,B),(0,B)))
g("t", w*0.74, P((w*0.22,A*0.86),(w*0.22,B),(w*0.74,B)), H_(0,w*0.7,X))
g("u", w, P((0,X),(0,B),(w,B),(w,X)))
g("v", w, P((0,X),(w*0.41,B),(w*0.59,B),(w,X)))
g("w", w*1.42, P((0,X),(0,B),(w*1.42,B),(w*1.42,X)), V_(w*0.71,B,X*0.78))
g("x", w, P((0,X),(w,B)), P((0,B),(w,X)))
g("y", w, P((0,X),(0,B),(w,B)), P((w,X),(w,D),(0,D)))
g("z", w, H_(0,w,X), P((w,X),(0,B)), H_(0,w,B))
for u, base in (("ä","a"),("ö","o"),("ü","u")):
    bw, st, rd = G[base]; G[u] = (bw, st + [dot(bw*0.25, uml), dot(bw*0.75, uml)], rd)
g("ß", w, P((0,B),(0,A),(w*0.74,A),(w*0.74,X*0.86),(w*0.34,X*0.86),(w*0.34,X*0.64),(w,X*0.64),(w,B),(w*0.3,B)))
# Ziffern (gleich breit)
Wd = WD
g("0", Wd, Z((0,B),(0,C),(Wd,C),(Wd,B)), dot(Wd/2, M))
g("1", Wd, P((Wd*0.18,C),(Wd*0.62,C),(Wd*0.62,B)), rund={"TL","BR"})
g("2", Wd, P((0,C),(Wd,C),(Wd,M),(0,M),(0,B),(Wd,B)))
g("3", Wd, P((0,C),(Wd,C),(Wd,B),(0,B)), H_(Wd*0.28,Wd,M))
g("4", Wd, P((0,C),(0,M*0.9),(Wd,M*0.9)), V_(Wd*0.74,C,B))
g("5", Wd, P((Wd,C),(0,C),(0,M),(Wd,M),(Wd,B),(0,B)), rund={"BR"})
g("6", Wd, P((Wd,C),(0,C),(0,B),(Wd,B),(Wd,M),(0,M)))
g("7", Wd, H_(0,Wd,C), P((Wd,C),(Wd*0.3,B)))
g("8", Wd, Z((Wd*0.17,M),(Wd*0.17,C),(Wd*0.83,C),(Wd*0.83,M)), Z((0,B),(0,M),(Wd,M),(Wd,B)))
g("9", Wd, P((Wd,M),(0,M),(0,C),(Wd,C),(Wd,B),(0,B)))
# Satzzeichen
g(".", 0, dot(0,B)); g(",", 0, P((0,B+T*0.3),(-T*0.45,B-T*1.25)))
g(":", 0, dot(0,B), dot(0,X)); g(";", 0, dot(0,X), P((0,B+T*0.3),(-T*0.45,B-T*1.25)))
g("!", 0, V_(0,C,B+T*1.9), dot(0,B)); g("?", W*0.82, P((0,C),(W*0.82,C),(W*0.82,M),(W*0.4,M),(W*0.4,B+T*1.9)), dot(W*0.4,B))
g("-", W*0.46, H_(0,W*0.46,XH*0.48)); g("–", W*0.82, H_(0,W*0.82,XH*0.48)); g("—", W*1.5, H_(0,W*1.5,XH*0.48)); g("_", W, H_(0,W,D))
g("'", 0, V_(0,C,C-T*1.4)); g('"', T*1.6, V_(0,C,C-T*1.4), V_(T*1.6,C,C-T*1.4))
g("‘", 0, P((0,C-T*1.3),(T*0.4,C))); g("’", 0, P((T*0.4,C),(0,C-T*1.3))); g("‚", 0, P((0,B+T*0.3),(-T*0.45,B-T*1.25)))
g("“", T*1.6, P((0,C-T*1.3),(T*0.4,C)), P((T*1.6,C-T*1.3),(T*2.0,C))); g("”", T*1.6, P((T*0.4,C),(0,C-T*1.3)), P((T*2.0,C),(T*1.6,C-T*1.3)))
g("„", T*1.6, P((0,B+T*0.3),(-T*0.45,B-T*1.25)), P((T*1.6,B+T*0.3),(T*1.15,B-T*1.25)))
g("(", W*0.32, P((W*0.32,C+40),(0,C+40),(0,D+20),(W*0.32,D+20)), rund={"TL","BL"})
g(")", W*0.32, P((0,C+40),(W*0.32,C+40),(W*0.32,D+20),(0,D+20)), rund={"TR","BR"})
g("[", W*0.32, P((W*0.32,C+40),(0,C+40),(0,D+20),(W*0.32,D+20)), rund=set())
g("]", W*0.32, P((0,C+40),(W*0.32,C+40),(W*0.32,D+20),(0,D+20)), rund=set())
g("/", W*0.6, P((0,D+20),(W*0.6,C+40)))
g("+", W*0.66, H_(0,W*0.66,M*0.92), V_(W*0.33,M*0.92-W*0.33,M*0.92+W*0.33))
g("=", W*0.66, H_(0,W*0.66,M*0.92+T*0.95), H_(0,W*0.66,M*0.92-T*0.95))
g("%", W*1.05, P((0,B),(W*1.05,C)), Z((0,C-T*1.7),(0,C),(W*0.3,C),(W*0.3,C-T*1.7)), Z((W*0.75,B),(W*0.75,B+T*1.7),(W*1.05,B+T*1.7),(W*1.05,B)))
g("·", 0, dot(0,XH*0.5)); g("…", T*4.4, dot(0,B), dot(T*2.2,B), dot(T*4.4,B))
g("€", W, P((W,C),(W*0.2,C),(W*0.2,B),(W,B)), H_(0,W*0.72,M+T*0.75), H_(0,W*0.72,M-T*0.75))
g("°", W*0.36, Z((0,C-W*0.36),(0,C),(W*0.36,C),(W*0.36,C-W*0.36)))
g("²", W*0.42, P((0,C),(W*0.42,C),(W*0.42,C-T*1.8),(0,C-T*1.8),(0,C-T*3.6),(W*0.42,C-T*3.6)))
g("&", W*1.0, P((W*1.0,B),(0,M*1.05),(0,C),(W*0.55,C),(W*0.55,M*1.2),(0,B+T*0.3)), P((0,B+T*0.3),(0,B),(W*0.7,B),(W*0.95,M)), rund={"TL","BR"})
g("@", W*1.1, Z((0,D+60),(0,C),(W*1.1,C),(W*1.1,B+T)), P((W*1.1,B+T),(W*1.1,D+60),(W*0.3,D+60)), Z((W*0.3,B+T),(W*0.3,M+T*0.4),(W*0.8,M+T*0.4),(W*0.8,B+T)))
g("#", W*0.9, V_(W*0.28,B,C), V_(W*0.62,B,C), H_(0,W*0.9,M+T*0.9), H_(0,W*0.9,M-T*0.9), rund=set())
g("*", W*0.5, V_(W*0.25,C,C-W*0.5), P((0,C-T*0.6),(W*0.5,C-W*0.5+T*0.6)), P((0,C-W*0.5+T*0.6),(W*0.5,C-T*0.6)), rund=set())
g("<", W*0.6, P((W*0.6,M*0.92+W*0.32),(0,M*0.92),(W*0.6,M*0.92-W*0.32))); g(">", W*0.6, P((0,M*0.92+W*0.32),(W*0.6,M*0.92),(0,M*0.92-W*0.32)))
g("|", 0, V_(0,D+20,C+40))

# ---------- Schrift bauen ----------
NAMEN = {}
def gname(ch): return "space" if ch == " " else "uni%04X" % ord(ch)
order = [".notdef", "space"]; cmap = {32:"space", 160:"space"}; glyphs = {}; hmtx = {".notdef":(600,0), "space":(round(W*0.5 + T*0.2),0)}
pen = TTGlyphPen(None); glyphs[".notdef"] = pen.glyph(); glyphs["space"] = TTGlyphPen(None).glyph()
for ch, (bw, striche, rund) in G.items():
    pen = TTGlyphPen(None); xs = []
    for st in striche:
        for r in kontur(st):
            cmds = ecken(r, rund)
            def tf(p): x, y = p[0] + h + SB, p[1]; return (round(x + (y*SCHRAEG if KURSIV else 0)), round(y))
            first = True
            for c in cmds:
                if c[0] == "L":
                    q = tf(c[1]); xs.append(q[0])
                    (pen.moveTo if first else pen.lineTo)(q); first = False
                else:
                    a, k, b = tf(c[1]), tf(c[2]), tf(c[3]); xs += [a[0], b[0]]
                    (pen.moveTo if first else pen.lineTo)(a); first = False; pen.qCurveTo(k, b)
            pen.closePath()
    gn = gname(ch); gl = pen.glyph()
    if hasattr(gl, "flags") and len(gl.flags): gl.flags[0] |= 0x40          # Überlappungen erlaubt
    glyphs[gn] = gl; order.append(gn); cmap[ord(ch)] = gn
    hmtx[gn] = (round(bw + T + 2*SB), min(xs) if xs else 0)
cmap[0x2212] = gname("-"); cmap[0xDF] = gname("ß"); cmap[0x2019] = gname("’")
fb = FontBuilder(1000, isTTF=True)
fb.setupGlyphOrder(order); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(hmtx)
fb.setupHorizontalHeader(ascent=900, descent=-260)
fb.setupOS2(sTypoAscender=900, sTypoDescender=-260, sTypoLineGap=0, usWinAscent=960, usWinDescent=300, sCapHeight=CAP, sxHeight=XH,
            usWeightClass=700 if STIL.startswith("Bold") else 400, fsSelection=(0x20 if STIL.startswith("Bold") else 0) | (0x01 if KURSIV else 0) | (0x40 if STIL == "Regular" else 0))
fb.setupNameTable({"familyName": FAM, "styleName": STIL, "uniqueFontIdentifier": FAM.replace(" ","") + "-" + STIL.replace(" ",""), "fullName": FAM + " " + STIL, "psName": FAM.replace(" ","") + "-" + STIL.replace(" ","")})
fb.setupPost(italicAngle=-10 if KURSIV else 0)
fb.font["head"].macStyle = (1 if STIL.startswith("Bold") else 0) | (2 if KURSIV else 0)
fb.save(OUT + ".ttf"); fb.font.flavor = "woff"; fb.save(OUT + ".woff")
print(OUT, len(order))
