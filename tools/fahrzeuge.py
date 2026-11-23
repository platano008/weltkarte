# Erzeugt daten/fahrzeuge.json – Quelle der Fahrzeugliste (fahrzeuge.html) und des Werkzeugs „Fahrzeug setzen“ (werkzeuge.js).
# Typen und Varianten nach den fotobelegten Oryx-Verlustlisten beider Seiten; Geberländer nach Oryx „Answering the Call“,
# der Wikipedia-Liste der Militärhilfe und der Lieferliste der Bundesregierung; ergänzt um Ausrüstungslisten (Wikipedia).
import json, pathlib

GRUPPEN = {
  "panzer": "Panzer",
  "inf": "Infanterie & Aufklärung",
  "art": "Artillerie & Raketen",
  "fla": "Luftverteidigung",
  "unt": "Unterstützung",
  "log": "Logistik & Fahrzeuge",
  "robo": "Roboter & Panzerzüge",
}
TYPEN = {  # Schlüssel: (Bezeichnung, Gruppe)
  "kpz-mod": ("Kampfpanzer · modern", "panzer"),
  "kpz-kk": ("Kampfpanzer · Kalter Krieg", "panzer"),
  "kpz-alt": ("Kampfpanzer · Altbestand", "panzer"),
  "lpz": ("Radkanonen- & leichter Panzer", "panzer"),
  "bmpt": ("Panzerunterstützungsfahrzeug", "panzer"),
  "spz": ("Schützenpanzer · Kette", "inf"),
  "radspz": ("Radschützenpanzer", "inf"),
  "llpz": ("Luftlandepanzer", "inf"),
  "tpz-k": ("Transportpanzer · Kette", "inf"),
  "tpz-r": ("Transportpanzer · Rad", "inf"),
  "spaeh": ("Spähpanzer & Aufklärung", "inf"),
  "mrap": ("MRAP · minengeschützt", "inf"),
  "imv": ("Geschützter Geländewagen", "inf"),
  "pzj": ("Panzerjäger · Lenkraketen", "inf"),
  "pzh": ("Panzerhaubitze · Kette", "art"),
  "radh": ("Radhaubitze", "art"),
  "moe": ("Selbstfahrender Mörser", "art"),
  "gez": ("Gezogene Artillerie", "art"),
  "mlrs": ("Raketenwerfer", "art"),
  "tos": ("Thermobarischer Werfer", "art"),
  "rak": ("Ballistische & Küstenraketen", "art"),
  "art-fue": ("Artillerie-Feuerleitung", "art"),
  "lader": ("Munitions- & Ladefahrzeuge", "art"),
  "flak": ("Flak · Rohrwaffen", "fla"),
  "fla-k": ("Flugabwehr · Kurzstrecke", "fla"),
  "fla-m": ("Flugabwehr · Mittelstrecke", "fla"),
  "fla-l": ("Flugabwehr · Langstrecke", "fla"),
  "fla-fue": ("Flugabwehr-Führung", "fla"),
  "radar": ("Radar & Ortung", "unt"),
  "eloka": ("Elektronische Kampfführung", "unt"),
  "fue": ("Führung & Fernmelde", "unt"),
  "pio": ("Pionier & Minenräumung", "unt"),
  "berge": ("Bergepanzer", "unt"),
  "bruecke": ("Brückenleger & Schwimmbrücken", "unt"),
  "abc": ("ABC-Abwehr & Nebel", "unt"),
  "sani": ("Sanitätsfahrzeuge", "unt"),
  "werk": ("Werkstatt, Kran & Feldversorgung", "unt"),
  "lkw": ("Lkw · Transport", "log"),
  "schwer": ("Schwerlast & Zugmaschinen", "log"),
  "kette-log": ("Ketten- & Geländetransporter", "log"),
  "gelaende": ("Geländewagen & Pick-ups", "log"),
  "bus": ("Transporter & Busse", "log"),
  "leicht": ("Motorräder, Quads & Buggys", "log"),
  "ugv": ("Bodenroboter (UGV)", "robo"),
  "pzzug": ("Panzerzug", "robo"),
}

L = []
def F(typ, n, s, km, rw, herst, land, nutzer, info="", geber=(), var=""):
  assert typ in TYPEN, typ
  e = {"n": n, "typ": typ, "seite": {"ua": ["ua"], "ru": ["ru"], "b": ["ua", "ru"]}[s], "km": km, "reichweite": rw,
       "hersteller": herst, "land": land, "nutzer": nutzer}
  if geber: e["geber"] = list(geber)
  if var: e["var"] = var
  if info: e["info"] = info
  L.append(e)

SU = "Sowjetunion"
UNB = "Unbewaffnet"

# ── Kampfpanzer · modern ─────────────────────────────────────────────
F("kpz-mod", "T-90M „Proryv“", "b", 5, "Kanone 125 mm: ca. 2–3 km · Lenkrakete 9M119M1 „Refleks-M“: bis 5 km",
  "Uralwagonsawod, Nischni Tagil", "Russland", "Russland; Ukraine (einzelne erbeutet)",
  "Modernster russischer Serienpanzer im Einsatz.", var="T-90M, T-90M mit Käfigaufbau")
F("kpz-mod", "T-90A / T-90S", "b", 5, "Kanone 125 mm: ca. 2–3 km · Lenkrakete: bis 5 km",
  "Uralwagonsawod, Nischni Tagil", "Russland", "Russland; T-90S: Indien, Algerien, Aserbaidschan, Turkmenistan, Uganda; Ukraine (erbeutet)",
  "T-90S sind ursprünglich für den Export gebaute Fahrzeuge, die Russland umgeleitet hat.", var="T-90A, T-90AK, T-90S")
F("kpz-mod", "T-80BVM", "b", 5, "Kanone 125 mm: ca. 2–3 km · Lenkrakete 9M119M „Refleks“: bis 5 km",
  "Omsktransmasch, Omsk", "Russland", "Russland; Ukraine (erbeutet)",
  "Kampfwertgesteigerter T-80BV mit neuer Optik und Reaktivpanzerung „Relikt“.", var="T-80BVM, T-80BVM Obr. 2022")
F("kpz-mod", "T-72B3 / B3M", "b", 4, "Kanone 125 mm: ca. 2–3 km · Lenkrakete 9M119M „Refleks“: bis 4–5 km",
  "Uralwagonsawod, Nischni Tagil", "Russland", "Russland; Ukraine (erbeutet)",
  "Häufigster moderner Panzer des Krieges.", var="T-72B3, T-72B3 Obr. 2014, Obr. 2016 (B3M), Obr. 2022, Obr. 2025, T-72B3A, mit Käfig- oder Hallenaufbau („Zar-Mangal“)")
F("kpz-mod", "T-64BM „Bulat“ / BM2", "ua", 5, "Kanone 125 mm: ca. 2–3 km · Lenkrakete „Kombat“: bis 5 km",
  "Malyschew-Werk, Charkiw", "Ukraine", "Ukraine",
  "Ukrainische Modernisierung des T-64 mit Reaktivpanzerung „Nosch“.", var="T-64BM, T-64BM2, T-64BV Zr. 2017")
F("kpz-mod", "T-72AMT", "ua", 5, "Kanone 125 mm: ca. 2–3 km · Lenkrakete „Kombat“: bis 5 km",
  "Panzerwerk Kiew", "Ukraine", "Ukraine",
  "Ukrainische Kampfwertsteigerung des T-72A.", var="T-72AMT, T-72AMT Zr. 2022")
F("kpz-mod", "PT-91 Twardy", "ua", 3, "Kanone 125 mm: ca. 2–3 km",
  "Bumar-Łabędy, Gliwice", "Polen", "Ukraine, Polen, Malaysia",
  "Polnische Weiterentwicklung des T-72M1.", geber=["Polen"])
F("kpz-mod", "Leopard 2A6", "ua", 4, "Kanone 120 mm L55: ca. 3–4 km",
  "Krauss-Maffei Wegmann, München", "Deutschland", "Ukraine, Deutschland, Niederlande, Portugal, Spanien (2A6E), Kanada, Finnland, Österreich u. a.",
  "Längere Kanone als der 2A4, stärkere Turmpanzerung.", geber=["Deutschland", "Portugal"])
F("kpz-mod", "Stridsvagn 122", "ua", 4, "Kanone 120 mm L44: ca. 3–4 km",
  "Krauss-Maffei Wegmann / Hägglunds", "Schweden", "Ukraine, Schweden",
  "Schwedische Version des Leopard 2A5 mit Zusatzpanzerung.", geber=["Schweden"])
F("kpz-mod", "M1A1 Abrams", "ua", 4, "Kanone 120 mm: ca. 3–4 km",
  "General Dynamics Land Systems, Lima (Ohio)", "USA", "Ukraine, USA, Australien, Ägypten, Saudi-Arabien, Irak, Kuwait, Marokko, Polen",
  "Gasturbinen-Panzer. Die Ukraine erhielt M1A1 SA aus den USA und ausgemusterte australische M1A1.", geber=["USA", "Australien"])
F("kpz-mod", "Challenger 2", "ua", 4, "Kanone 120 mm (gezogen): ca. 3–4 km",
  "Vickers / BAE Systems, Newcastle", "Großbritannien", "Ukraine, Großbritannien, Oman",
  "Nur eine Kompanie an die Ukraine abgegeben.", geber=["Großbritannien"])

# ── Kampfpanzer · Kalter Krieg ───────────────────────────────────────
F("kpz-kk", "T-72B / B1 / B Obr. 1989", "b", 4, "Kanone 125 mm: ca. 2–3 km · Lenkrakete 9M119 „Swir“: bis 4 km",
  "Uralwagonsawod, Nischni Tagil", SU, "Russland, Ukraine (erbeutet), Belarus, Syrien u. a.",
  "Aus Lagerbeständen in großer Zahl reaktiviert.", var="T-72B, T-72B1, T-72B Obr. 1989, T-72B Obr. 2022, T-72BA, T-72B1K")
F("kpz-kk", "T-72A / T-72AV", "b", 3, "Kanone 125 mm: ca. 2–3 km",
  "Uralwagonsawod, Nischni Tagil", SU, "Russland, Ukraine, viele frühere Ostblockstaaten",
  "Ältere T-72-Version ohne Lenkrakete.", geber=["Nordmazedonien"], var="T-72A, T-72AV, T-72 „Ural“")
F("kpz-kk", "T-72M / T-72M1", "ua", 3, "Kanone 125 mm: ca. 2–3 km",
  "ZTS Martin (ČSSR), Bumar-Łabędy (Polen)", "Tschechoslowakei / Polen", "Ukraine, Polen, Tschechien, Finnland, Indien u. v. m.",
  "Exportversion des T-72, in Lizenz in Polen und der Tschechoslowakei gebaut.", geber=["Polen", "Tschechien", "Deutschland (finanziert)"], var="T-72M, T-72M1, T-72M1(R), T-72M(R)")
F("kpz-kk", "T-72EA", "ua", 3, "Kanone 125 mm: ca. 2–3 km",
  "Excalibur Army, Šternberk", "Tschechien", "Ukraine",
  "In Tschechien modernisierte T-72 mit neuer Optik und Funk, von mehreren Staaten bezahlt.", geber=["Tschechien", "Niederlande", "USA", "Dänemark", "Großbritannien"])
F("kpz-kk", "T-64B / T-64BV", "b", 4, "Kanone 125 mm: ca. 2–3 km · Lenkrakete 9M112 „Kobra“: bis 4 km",
  "Malyschew-Werk, Charkiw", SU, "Ukraine (lange Hauptpanzer); Russland/Separatisten (erbeutet)",
  "Wird nur in der Ukraine in größerer Zahl genutzt.", var="T-64A, T-64B, T-64BV, T-64BVK, T-64B1M")
F("kpz-kk", "T-80BV", "b", 4, "Kanone 125 mm: ca. 2–3 km · Lenkrakete 9M112 „Kobra“: bis 4 km",
  "Kirow-Werk, Leningrad / Omsktransmasch", SU, "Russland, Ukraine (eigene und erbeutete), Kasachstan, Zypern, Südkorea",
  "Gasturbinen-Panzer, schnell, hoher Spritverbrauch.", var="T-80B, T-80BV, T-80BV Obr. 2022, T-80BVK")
F("kpz-kk", "T-80U / UE-1", "b", 5, "Kanone 125 mm: ca. 2–3 km · Lenkrakete 9M119 „Refleks“: bis 5 km",
  "Omsktransmasch, Omsk", SU, "Russland, Ukraine (erbeutet), Zypern, Südkorea",
  "Stärker gepanzerte T-80-Version.", var="T-80U, T-80UK, T-80UE-1, T-80UM2")
F("kpz-kk", "T-80UD", "ua", 5, "Kanone 125 mm: ca. 2–3 km · Lenkrakete 9M119 „Refleks“: bis 5 km",
  "Malyschew-Werk, Charkiw", SU, "Ukraine, Pakistan (T-80UD), Russland (wenige)",
  "Diesel-Version des T-80U, Vorläufer des ukrainischen T-84.", var="T-80UD, T-80UD „Bereza“")
F("kpz-kk", "Leopard 2A4", "ua", 4, "Kanone 120 mm L44: ca. 3–4 km",
  "Krauss-Maffei Wegmann, München", "Deutschland", "Ukraine, Polen, Spanien, Kanada, Norwegen, Türkei, Griechenland, Chile u. v. m.",
  "Von sieben Staaten an die Ukraine abgegeben.", geber=["Polen", "Kanada", "Norwegen", "Spanien", "Deutschland", "Niederlande", "Dänemark"])
F("kpz-kk", "Leopard 1A5", "ua", 2.5, "Kanone 105 mm: ca. 2–2,5 km",
  "Krauss-Maffei Wegmann, München", "Deutschland", "Ukraine, Brasilien, Chile, Griechenland, Türkei",
  "Aus Industriebeständen überholt, oft als Feuerunterstützung hinter der Front.", geber=["Deutschland", "Dänemark", "Niederlande"], var="Leopard 1A5, Leopard 1A5BE")
F("kpz-kk", "M-84", "ua", 3, "Kanone 125 mm: ca. 2–3 km",
  "Đuro Đaković, Slavonski Brod", "Jugoslawien / Kroatien", "Ukraine, Kroatien, Serbien, Kuwait",
  "Jugoslawische Version des T-72.", geber=["Kroatien", "Deutschland (finanziert)"], var="M-84A4 „Sniper“")

# ── Kampfpanzer · Altbestand ─────────────────────────────────────────
F("kpz-alt", "T-62M / MV", "b", 4, "Kanone 115 mm: ca. 1,5–2 km · Lenkrakete 9K116-2 „Scheksna“: bis 4 km",
  "Uralwagonsawod", SU, "Russland (aus Lagerbeständen), Ukraine (erbeutet), Nordkorea, Syrien",
  "Aus den 1960ern, im Krieg reaktiviert und teils nachgerüstet.", var="T-62 Obr. 1967/1972/1975, T-62M, T-62M Obr. 2022, T-62MV, T-62MV Obr. 2022")
F("kpz-alt", "T-54 / T-55", "ru", 1.5, "Kanone 100 mm: ca. 1–1,5 km",
  "Uralwagonsawod u. a.", SU, "Russland (aus Lagerbeständen), viele Staaten in Afrika und Asien",
  "Teils als mobile Artillerie genutzt.", var="T-54-3M, T-54B, T-55A, T-55A Obr. 1974/1981")
F("kpz-alt", "M-55S", "ua", 2.5, "Kanone 105 mm L7: ca. 2–2,5 km",
  "STO Ravne / Elbit", "Slowenien", "Ukraine, Slowenien",
  "Slowenischer Umbau des T-55 mit westlicher 105-mm-Kanone.", geber=["Slowenien", "Deutschland (finanziert)"])

# ── Leichte Panzer / Radkanone / BMPT ────────────────────────────────
F("lpz", "AMX-10 RC", "ua", 2, "Kanone 105 mm: ca. 2 km",
  "GIAT (heute KNDS France), Roanne", "Frankreich", "Ukraine, Frankreich, Marokko, Katar",
  "Radpanzer mit großer Kanone, für Aufklärung gebaut, nur leicht gepanzert.", geber=["Frankreich"], var="AMX-10 RC, AMX-10 RCR")
F("lpz", "Centauro B1", "ua", 2.5, "Kanone 105 mm: ca. 2–2,5 km",
  "Iveco-Oto Melara (CIO)", "Italien", "Ukraine, Italien, Spanien, Jordanien, Oman",
  "Achtrad-Panzer mit Kampfpanzerkanone.", geber=["Italien"])
F("bmpt", "BMPT „Terminator“", "ru", 6, "2 × 30 mm: ca. 2–4 km · Lenkrakete 9M120 „Ataka“: bis 6 km",
  "Uralwagonsawod, Nischni Tagil", "Russland", "Russland, Kasachstan, Algerien",
  "Panzerunterstützungsfahrzeug auf T-72/T-90-Fahrgestell, nur in kleiner Zahl.")
F("bmpt", "BMPT „Asowez“", "ua", 2, "Maschinenkanonen und Maschinengewehre: ca. 1,5–2 km",
  "Ukrainischer Feldumbau", "Ukraine", "Ukraine",
  "Improvisierter Umbau eines T-64 mit Waffenstation statt Kanonenturm.")

# ── Schützenpanzer · Kette ───────────────────────────────────────────
F("spz", "BMP-1", "b", 3, "Kanone 73 mm: ca. 1,3 km · Lenkrakete 9M14 „Maljutka“: bis 3 km",
  "Kurganmaschsawod, Kurgan", SU, "Russland, Ukraine und über 50 weitere Staaten",
  "Einer der meistgenutzten Schützenpanzer der Welt; viele Umbauten auf beiden Seiten.",
  geber=["Polen (BWP-1)", "Tschechien (BVP-1, Pbv 501)", "Slowakei (BVP-1)", "Griechenland (BMP-1A1 Ost)", "Deutschland (BMP-1A1 Ost)"],
  var="BMP-1(P), BMP-1AM, BMP-1U „Schkwal“, BMP-1 mit BPU-1-Turm, BMP-1 mit Reaktivpanzerung 675-sb3KDZ, BMP-1TS „Spys“, BMP-1TS „Sitsch“, BMP-1TS „Parus“, BMP-1LB, BWP-1, BVP-1, Pbv 501A, PRP-3 mit BMD-2- oder BMP-1-Turm (ukr. Umbau)")
F("spz", "BMP-2", "b", 4, "Maschinenkanone 30 mm: ca. 2–4 km · Lenkrakete 9M113 „Konkurs“: bis 4 km",
  "Kurganmaschsawod, Kurgan", SU, "Russland, Ukraine, Indien, Kasachstan, Iran u. v. m.",
  "Rückgrat der Infanterie beider Seiten.", geber=["Dänemark (finanziert)", "Tschechien (BVP-2)"], var="BMP-2, BMP-2K, BMP-2D, BMP-2 mit 675-sb3KDZ, BVP-2")
F("spz", "BMP-2M „Beresok“", "ru", 5.5, "30 mm + 30-mm-Granatwerfer · Lenkrakete „Kornet“: bis 5,5 km",
  "Kurganmaschsawod / Tulamaschsawod", "Russland", "Russland, Algerien",
  "Kampfwertsteigerung des BMP-2 mit Waffenmodul „Beresok“.")
F("spz", "BMP-3", "b", 5.5, "Kanone 100 mm, Lenkrakete 9M117: bis 5,5 km · Maschinenkanone 30 mm: ca. 2 km",
  "Kurganmaschsawod, Kurgan", "Russland", "Russland, VAE, Kuwait, Indonesien, Venezuela; Ukraine (erbeutet)",
  "Schwer bewaffnet, aber schwach gepanzert.", var="BMP-3, BMP-3 Obr. 2020, BMP-3 mit 688A-sb6-2KP, BMP-3 mit 4S24-NKDZ")
F("spz", "BVP M-80A", "ua", 3, "Maschinenkanone 20 mm: ca. 1,5 km · Lenkrakete „Maljutka“: bis 3 km",
  "FAMOS / Đuro Đaković", "Jugoslawien", "Ukraine, Slowenien, Kroatien, Serbien, Bosnien",
  "Jugoslawischer Schützenpanzer.", geber=["Slowenien", "Kroatien", "Deutschland (finanziert)"])
F("spz", "M2A2 Bradley ODS-SA", "ua", 3.75, "Maschinenkanone 25 mm: ca. 2,5 km · TOW-Lenkrakete: bis 3,75 km",
  "BAE Systems, York (Pennsylvania)", "USA", "Ukraine, USA, Saudi-Arabien, Kroatien, Griechenland, Libanon",
  "Gilt in der Ukraine als besonders überlebensfähig.", geber=["USA"], var="M2A2 ODS-SA, M7 BFIST (Artilleriebeobachter)")
F("spz", "Marder 1A3", "ua", 2, "Maschinenkanone 20 mm: ca. 2 km",
  "Rheinmetall, Kassel", "Deutschland", "Ukraine, Deutschland, Chile, Indonesien, Jordanien",
  "Aus Bundeswehr- und Industriebeständen.", geber=["Deutschland", "Dänemark (finanziert)"])
F("spz", "CV90", "ua", 3, "Maschinenkanone 40 mm (CV9040) / 35 mm (CV9035): ca. 2–3 km",
  "BAE Systems Hägglunds, Örnsköldsvik", "Schweden", "Ukraine, Schweden, Norwegen, Finnland, Dänemark, Niederlande, Estland, Tschechien, Slowakei",
  "Gut geschützter Schützenpanzer; ab 2025 auch neu für die Ukraine gebaut.", geber=["Schweden", "Dänemark", "Niederlande"], var="CV9040C, CV9035NL")
F("spz", "Lynx KF41", "ua", 3, "Maschinenkanone 30 mm: ca. 3 km",
  "Rheinmetall", "Deutschland", "Ukraine, Ungarn, Italien (bestellt)",
  "Neuester Schützenpanzer im Krieg: von Deutschland bezahlt, erste Fahrzeuge seit Anfang 2026 in der Ukraine.", geber=["Deutschland"])
F("spz", "MT-LBM 6MA / 6MB", "ru", 2, "Maschinenkanone 30 mm oder 14,5 mm: ca. 1,5–2 km",
  "Muromteplowos, Murom", "Russland", "Russland",
  "MT-LB mit dem Turm des BTR-80A/BMP-3.", var="MT-LBM 6MA, MT-LBM 6MB, MT-LBVM")

# ── Radschützenpanzer ────────────────────────────────────────────────
F("radspz", "BTR-82A / AM", "b", 2, "Maschinenkanone 30 mm: ca. 2 km",
  "Arsamas-Maschinenbauwerk, Arsamas", "Russland", "Russland, Belarus, Kasachstan, Syrien; Ukraine (erbeutet)",
  "Weiterentwicklung des BTR-80 mit 30-mm-Kanone.", var="BTR-82A, BTR-82AM, BTR-82AT")
F("radspz", "BTR-4 „Bucephalus“", "ua", 5, "Maschinenkanone 30 mm: ca. 2 km · Lenkrakete „Barjer“ (je nach Turm): bis 5 km",
  "Charkiwer Konstruktionsbüro für Maschinenbau (KMDB)", "Ukraine", "Ukraine, Irak, Indonesien",
  "Ukrainischer Radschützenpanzer.", var="BTR-4E, BTR-4MV1")
F("radspz", "BTR-3", "ua", 2, "Maschinenkanone 30 mm: ca. 2 km",
  "Kiewer Panzerwerk / KMDB", "Ukraine", "Ukraine, Thailand, Myanmar",
  "Ukrainischer Radpanzer auf BTR-80-Basis.", var="BTR-3DA, BTR-3E1, BTR-3E1K, BTR-3E-1U")
F("radspz", "KTO Rosomak", "ua", 2, "Maschinenkanone 30 mm: ca. 2 km",
  "Rosomak S.A., Siemianowice Śląskie (Lizenz Patria)", "Polen", "Ukraine, Polen",
  "Polnische Lizenzversion des Patria AMV.", geber=["Polen"])

# ── Luftlandepanzer ──────────────────────────────────────────────────
F("llpz", "BMD-2", "b", 4, "Maschinenkanone 30 mm: ca. 2 km · Lenkrakete „Konkurs“: bis 4 km",
  "Wolgograder Traktorenwerk", SU, "Russland (Luftlandetruppen), Ukraine (Luftsturmtruppen)",
  "Leichter, abwerfbarer Schützenpanzer.")
F("llpz", "BMD-4M", "ru", 5.5, "Kanone 100 mm, Lenkrakete 9M117: bis 5,5 km · 30 mm: ca. 2 km",
  "Kurganmaschsawod, Kurgan", "Russland", "Russland (Luftlandetruppen)",
  "Turm des BMP-3 auf leichtem Luftlande-Fahrgestell.", var="BMD-4M, BMD-4M Obr. 2024")
F("llpz", "BTR-D", "b", 1, "Maschinengewehre: ca. 1 km",
  "Wolgograder Traktorenwerk", SU, "Russland, Ukraine",
  "Transportpanzer der Luftlandetruppen.", var="BTR-D, BTR-D mit UR-67-Minenräumladung")
F("llpz", "BTR-MDM „Rakuschka“", "ru", 1.5, "Maschinengewehre: ca. 1–1,5 km",
  "Kurganmaschsawod, Kurgan", "Russland", "Russland (Luftlandetruppen)",
  "Moderner Nachfolger des BTR-D.")

# ── Transportpanzer · Kette ──────────────────────────────────────────
F("tpz-k", "MT-LB", "b", 1, "Maschinengewehr 7,62 mm: ca. 1 km (oft mit nachgerüsteten Waffen)",
  "Charkiwer Traktorenwerk; Lizenzbau Polen, Bulgarien", SU, "Russland, Ukraine, Polen, Bulgarien, Finnland, Schweden u. v. m.",
  "Meistverlorenes russisches Kettenfahrzeug, oft improvisiert mit Flak, Kanonen oder Raketen umgebaut.", geber=["Polen"],
  var="MT-LB, MT-LBVM, MT-LBVMK, MT-LB-12, MT-LB mit ZU-23, mit S-60, mit MT-12, mit 85-mm-D-44, mit 25-mm-2M-3, mit 14,5-mm-2M-7, mit BPU-1-Turm, mit 82-mm-2B9 Wasilek, mit Typ-75-Raketenwerfer, MT-LB-AT (ukr.), MT-LBu, MT-LBu mit BM-7 „Parus“, BTS-4 mit ZU-23")
F("tpz-k", "M113", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "FMC / BAE Systems", "USA", "Ukraine und über 40 weitere Staaten",
  "Aus mehr als zehn Staaten an die Ukraine abgegeben – in vielen Versionen.",
  geber=["USA", "Litauen", "Portugal", "Spanien", "Großbritannien", "Belgien", "Luxemburg", "Niederlande", "Kanada", "Australien", "Dänemark", "Deutschland"],
  var="M113, M113A1/A2/A3, M113AS4, M113G3DK/G4DK, MC-113, SIDAM 25 (zum Transporter umgebaut), mit Waffenstation")
F("tpz-k", "VCC-1 / VCC-2", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "OTO Melara", "Italien", "Ukraine, Italien",
  "Italienische Weiterentwicklung des M113 mit Seitenpanzerung.", geber=["Italien"])
F("tpz-k", "YPR-765", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km · Version 25 mm: ca. 2 km",
  "FMC / DAF", "Niederlande", "Ukraine, Niederlande, Belgien (AIFV-B), Ägypten u. a.",
  "Niederländische Weiterentwicklung des M113.", geber=["Niederlande"], var="YPR-765 PRI, YPR-765 PRGWT, AIFV-B-C25")
F("tpz-k", "FV432 Bulldog", "ua", 1, "Maschinengewehr: ca. 1 km",
  "GKN Sankey / BAE Systems", "Großbritannien", "Ukraine, Großbritannien",
  "Britischer Transportpanzer aus den 1960ern.", geber=["Großbritannien"])
F("tpz-k", "FV103 Spartan / CVR(T)", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Alvis, Coventry", "Großbritannien", "Ukraine, Großbritannien, Lettland, Belgien",
  "Leichter Kettentransporter der CVR(T)-Familie.", geber=["Großbritannien", "Lettland"], var="FV103 Spartan, FV104 Samaritan (Sanität), FV105 Sultan (Führung)")
F("tpz-k", "Pbv 302", "ua", 1.5, "Maschinenkanone 20 mm: ca. 1,5 km",
  "Hägglunds, Örnsköldsvik", "Schweden", "Ukraine, Schweden",
  "Schwedischer Transportpanzer der 1960er.", geber=["Schweden"])
F("tpz-k", "BvS 10 Viking / Bv 206", "ua", 1, "Maschinengewehr: ca. 1 km (Bv 206 unbewaffnet)",
  "BAE Systems Hägglunds, Örnsköldsvik", "Schweden", "Ukraine, Schweden, Großbritannien, Niederlande, Frankreich, Deutschland u. a.",
  "Geländegängiges Gelenkfahrzeug, schwimmfähig.", geber=["Großbritannien", "Niederlande", "Italien", "Belgien", "Deutschland"], var="BvS 10, Bv 206S")
F("tpz-k", "Warthog / ACSV", "ua", 1, "Maschinengewehr: ca. 1 km",
  "ST Engineering (Warthog) / FFG (ACSV)", "Singapur / Deutschland", "Ukraine, Großbritannien, Deutschland",
  "Geschützte Kettenträger für Transport und Versorgung.", geber=["Großbritannien", "Deutschland"], var="Warthog, ACSV G5")
F("tpz-k", "BTR-50", "b", 1, "Maschinengewehr: ca. 1 km",
  "Wolgograder Traktorenwerk", SU, "Russland (aus Lagerbeständen), Ukraine",
  "Uralter Schwimm-Transportpanzer der 1950er.", geber=["Bulgarien"], var="BTR-50, BTR-50 mit BPU-1-Turm")
F("tpz-k", "BMO-T", "ru", 1, "Maschinengewehr: ca. 1 km",
  "Omsktransmasch", "Russland", "Russland",
  "Schwer gepanzerter Träger für Flammenwerfer-Trupps auf T-72-Fahrgestell.")

# ── Transportpanzer · Rad ────────────────────────────────────────────
F("tpz-r", "BTR-80", "b", 2, "Maschinengewehr 14,5 mm: ca. 2 km",
  "Arsamas-Maschinenbauwerk", SU, "Russland, Ukraine und viele frühere Sowjetstaaten",
  "Achtrad-Transportpanzer.", var="BTR-80, BTR-80M, BTR-80A, BTR-80 mit Turm 32G01 „Bumerang-Burewestnik“, BTR-80 mit Raketenbehältern UB-32")
F("tpz-r", "BTR-70", "b", 2, "Maschinengewehr 14,5 mm: ca. 2 km",
  "Gorki-Automobilwerk", SU, "Russland, Ukraine u. a.",
  "Vorgänger des BTR-80 mit zwei Benzinmotoren.", var="BTR-70, BTR-70M, BTR-7")
F("tpz-r", "BTR-60PB", "b", 2, "Maschinengewehr 14,5 mm: ca. 2 km",
  "Gorki-Automobilwerk", SU, "Russland, Ukraine u. a.",
  "Erster sowjetischer Achtrad-Transportpanzer.", geber=["Bulgarien"], var="BTR-60PB, BTR-60D")
F("tpz-r", "TAB-71M", "ua", 2, "Maschinengewehr 14,5 mm: ca. 2 km",
  "Uzina Mecanică Moreni", "Rumänien", "Ukraine, Rumänien",
  "Rumänischer Nachbau des BTR-60.", geber=["Rumänien"])
F("tpz-r", "M1126 Stryker", "ua", 2, "Maschinengewehr 12,7 mm / Granatwerfer 40 mm: ca. 1,5–2 km",
  "General Dynamics Land Systems (USA/Kanada)", "USA", "Ukraine, USA, Thailand",
  "Achtrad-Transportpanzer, 2023 an die Ukraine geliefert.", geber=["USA"], var="M1126 ICV, M1132 Pionierversion")
F("tpz-r", "M1117 Guardian", "ua", 2, "Granatwerfer 40 mm / Maschinengewehr 12,7 mm: ca. 1,5–2 km",
  "Textron Marine & Land Systems", "USA", "Ukraine, USA, Irak, Afghanistan, Kolumbien",
  "Radpanzer der US-Militärpolizei.", geber=["USA"])
F("tpz-r", "VAB", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Renault Trucks Defense (heute Arquus)", "Frankreich", "Ukraine, Frankreich und über 15 weitere Staaten",
  "Französischer Standard-Radpanzer.", geber=["Frankreich"])
F("tpz-r", "Patria Pasi (Sisu XA-185)", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Sisu / Patria, Hämeenlinna", "Finnland", "Ukraine, Finnland, Estland, Niederlande, Schweden",
  "Finnischer Sechsrad-Transportpanzer.", geber=["Finnland"])
F("tpz-r", "Patria 6x6", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Patria, Hämeenlinna", "Finnland", "Ukraine, Finnland, Lettland",
  "Neuer finnischer Radpanzer, aus lettischem Bestand.", geber=["Lettland"])
F("tpz-r", "Puma 4x4 / 6x6", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Iveco / Oto Melara", "Italien", "Ukraine, Italien",
  "Leichte italienische Radpanzer.", geber=["Italien"])
F("tpz-r", "LAV 6.0 ACSV", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "General Dynamics Land Systems – Canada, London (Ontario)", "Kanada", "Ukraine, Kanada",
  "Gepanzerter Mannschaftstransporter.", geber=["Kanada"])
F("tpz-r", "Valuk (Pandur I)", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Sistemska Tehnika (Lizenz Steyr)", "Slowenien", "Ukraine, Slowenien",
  "Slowenische Version des Pandur.", geber=["Slowenien"])
F("tpz-r", "BOV", "ua", 1, "Maschinengewehr: ca. 1 km",
  "TAM, Maribor", "Jugoslawien / Slowenien", "Ukraine, Slowenien, Serbien",
  "Leichter jugoslawischer Radpanzer.", geber=["Slowenien"])
F("tpz-r", "AT105 Saxon", "ua", 1, "Maschinengewehr: ca. 1 km",
  "GKN Sankey", "Großbritannien", "Ukraine, Großbritannien",
  "Alter britischer Radpanzer der 1970er.", geber=["Großbritannien"])
F("tpz-r", "Ural-VV / Z-STS „Achmat“", "ru", 1, "Maschinengewehr: ca. 1 km",
  "Ural-Werk Miass / Remdiesel", "Russland", "Russland (Nationalgarde, Truppen)",
  "Gepanzerte Lkw-Transporter für Infanterie.", var="Ural-VV, Remdiesel Z-STS Achmat, Plastun-SN")

# ── Spähpanzer & Aufklärung ──────────────────────────────────────────
F("spaeh", "BRDM-2", "b", 2, "Maschinengewehr 14,5 mm: ca. 2 km",
  "Gorki-Automobilwerk", SU, "Russland, Ukraine und viele weitere Staaten",
  "Spähwagen, auf beiden Seiten verbreitet.", geber=["Polen", "Bulgarien"], var="BRDM-2, BRDM-2M/A, BRDM-2MS, BRDM-2L1, BRDM-2T(A) (ukr. Panzerjäger), BRDM-2 „Wepr“, BRDM-2 mit Modul „Amulet“, BRDM-2RChB (ABC-Aufklärung)")
F("spaeh", "BRM-1K", "b", 1.3, "Kanone 73 mm: ca. 1,3 km",
  "Kurganmaschsawod", SU, "Russland, Ukraine",
  "Aufklärungsversion des BMP-1 mit Radar.", var="BRM-1K, BRM-1KM, BRM-1 mit 675-sb3KDZ")
F("spaeh", "Fennek", "ua", 1.5, "Granatwerfer 40 mm / Maschinengewehr: ca. 1,5 km",
  "Krauss-Maffei Wegmann / Rheinmetall", "Deutschland / Niederlande", "Ukraine, Deutschland, Niederlande",
  "Leiser, flacher Spähwagen mit starker Optik.", geber=["Niederlande"])
F("spaeh", "FV107 Scimitar", "ua", 2, "Maschinenkanone 30 mm Rarden: ca. 2 km",
  "Alvis, Coventry", "Großbritannien", "Ukraine, Großbritannien, Lettland, Belgien",
  "Leichter Kettenaufklärer der CVR(T)-Familie.", geber=["Großbritannien"])
F("spaeh", "BPzV Svatava", "ua", 1.5, "Maschinenkanone 30 mm: ca. 1,5 km",
  "VOP 025, Nový Jičín", "Tschechien", "Ukraine, Tschechien",
  "Tschechischer Aufklärungspanzer auf BMP-1-Basis.", geber=["Tschechien"])
F("abc", "RChM-4 / RChM-6 / „Kaschalot“", "b", 1, "Maschinengewehr: ca. 1 km",
  "Arsamas-Maschinenbauwerk / Ukraine", SU, "Russland, Ukraine",
  "ABC-Spürpanzer.", var="RChM-4, RChM-6 „Powoska“, RChM „Kaschalot“ (ukr.), BRDM-2RChB, KDChR-1N")

# ── MRAP ─────────────────────────────────────────────────────────────
F("mrap", "International MaxxPro", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Navistar Defense", "USA", "Ukraine, USA, Pakistan, VAE u. a.",
  "Minengeschütztes Fahrzeug.", geber=["USA", "Albanien"])
F("mrap", "Oshkosh M-ATV", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Oshkosh Defense, Oshkosh (Wisconsin)", "USA", "Ukraine, USA, VAE, Afghanistan u. a.",
  "Geländegängiges MRAP.", geber=["USA"])
F("mrap", "Cougar", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Force Protection, Ladson (South Carolina)", "USA", "Ukraine, USA, Großbritannien (Mastiff), Kanada u. a.",
  "Vier- und Sechsrad-MRAP.", geber=["USA"], var="Cougar 4x4, Cougar 6x6, Cougar H")
F("mrap", "Mastiff / Wolfhound / Ridgeback", "ua", 1.8, "Maschinengewehr 12,7 mm / Granatwerfer: ca. 1,8 km",
  "Force Protection Europe / NP Aerospace", "Großbritannien", "Ukraine, Großbritannien",
  "Britische Versionen des Cougar.", geber=["Großbritannien"])
F("mrap", "Bushmaster", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Thales Australia, Bendigo", "Australien", "Ukraine, Australien, Niederlande, Japan, Indonesien, Großbritannien",
  "Minengeschütztes Fahrzeug.", geber=["Australien"])
F("mrap", "ATF Dingo 2", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Krauss-Maffei Wegmann, München", "Deutschland", "Ukraine, Deutschland, Norwegen, Belgien, Österreich, Tschechien u. a.",
  "Geschütztes Patrouillenfahrzeug.", geber=["Deutschland", "Norwegen"])
F("mrap", "BMC Kirpi / Kirpi II", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "BMC, Izmir", "Türkei", "Ukraine, Türkei u. a.",
  "Türkisches MRAP.", geber=["Türkei"])
F("mrap", "Alvis Mamba", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Alvis / Reumech", "Südafrika / Großbritannien", "Ukraine, Estland, Südafrika",
  "Kleines minengeschütztes Fahrzeug.", geber=["Estland"])
F("mrap", "KrAZ Shrek / Forpost", "ua", 1, "Maschinengewehr: ca. 1 km",
  "AutoKrAZ, Krementschuk", "Ukraine", "Ukraine",
  "Ukrainische MRAP-Entwicklungen.", var="KrAZ-MPV Shrek One, KrAZ-Forpost, Wepr")
F("mrap", "KamAZ Taifun", "ru", 1.8, "Maschinengewehr / Waffenstation: ca. 1–1,8 km",
  "KamAZ, Nabereschnyje Tschelny", "Russland", "Russland",
  "Russisches MRAP, auch als Sanitäts- und Kampfmittel-Version.", var="KamAZ-63968 Taifun, KamAZ-53949 Taifun-K, Taifun-K mit Störsender 5ET16U „Ochotnik“, Feniks, Ural Taifun")

# ── Geschützte Geländewagen ──────────────────────────────────────────
F("imv", "HMMWV „Humvee“", "ua", 1.8, "Maschinengewehr 12,7 mm / Granatwerfer: ca. 1,8 km",
  "AM General, South Bend (Indiana)", "USA", "Ukraine, USA und über 50 weitere Staaten",
  "Hunderte Fahrzeuge in vielen Versionen, auch mit TOW oder Flak.", geber=["USA", "Luxemburg", "Slowenien", "Deutschland"],
  var="M998, M1043, M1100, M1114, M1123, M1151, M1152, M1152 mit ZU-23-2, M1165, M1167 (TOW), Sanität, mit Bodenradar (Deutschland), mit Störsender (Deutschland)")
F("imv", "Roshel Senator", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Roshel, Brampton (Ontario)", "Kanada", "Ukraine, Kanada",
  "Gepanzerter Geländewagen, in großer Zahl geliefert.", geber=["Kanada", "USA", "Tschechien"], var="Senator IMV, Senator MRAP, Senator Medevac")
F("imv", "Husky TSV", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Navistar Defense", "USA / Großbritannien", "Ukraine, Großbritannien",
  "Geschütztes Unterstützungsfahrzeug.", geber=["Großbritannien"])
F("imv", "Iveco LMV „Lince“", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Iveco Defence Vehicles, Bozen", "Italien", "Ukraine, Italien, Belgien, Spanien, Österreich, Norwegen, Russland (Lizenz „Rys“) u. a.",
  "Leichter geschützter Geländewagen.", geber=["Italien", "Belgien", "Norwegen"], var="LMV, VTLM Lince, LMV Lynx, Iveco LAV III")
F("imv", "AMZ Dzik-2", "ua", 1, "Maschinengewehr: ca. 1 km",
  "AMZ-Kutno", "Polen", "Ukraine, Polen", "Polnischer gepanzerter Geländewagen.", geber=["Polen"])
F("imv", "Otokar Cobra II", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Otokar, Sakarya", "Türkei", "Ukraine, Türkei u. a.", "Türkischer Radpanzer.", geber=["Türkei"])
F("imv", "URO VAMTAC", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "UROVESA, Santiago de Compostela", "Spanien", "Ukraine, Spanien u. a.", "Spanisches Gegenstück zum Humvee, auch mit Mörser.", geber=["Spanien"])
F("imv", "Coyote TSV", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Supacat, Dunkeswell", "Großbritannien", "Ukraine, Großbritannien", "Schweres Patrouillenfahrzeug.", geber=["Großbritannien"])
F("imv", "Caracal", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Rheinmetall / Mercedes-Benz", "Deutschland", "Ukraine, Deutschland, Niederlande", "Luftlandefähiger Geländewagen.", geber=["Deutschland"])
F("imv", "Terradyne Gurkha", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Terradyne, Newmarket (Ontario)", "Kanada", "Ukraine, Kanada u. a.", "Gepanzerter Geländewagen.", geber=["Kanada"])
F("imv", "BATT UMG", "ua", 1, "Maschinengewehr: ca. 1 km",
  "The Armored Group, USA", "USA", "Ukraine", "Gepanzerter Transporter.", geber=["Deutschland"])
F("imv", "Kozak", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Praktika, Kiew", "Ukraine", "Ukraine", "Ukrainische geschützte Fahrzeuge.", var="Kozak-2, Kozak-2M1, Kozak-5, Kozak-5MED, Kozak-7")
F("imv", "Novator / Varta", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Ukrainian Armor / Bogdan", "Ukraine", "Ukraine", "Ukrainische geschützte Fahrzeuge.", var="Novator, Novator 2, Varta")
F("imv", "GAZ Tigr / Tigr-M", "ru", 1.7, "Maschinengewehr / Granatwerfer AGS-17: ca. 1–1,7 km",
  "Militär-Industrie-Gesellschaft, Arsamas", "Russland", "Russland, Belarus, Armenien, Uruguay u. a.",
  "Russischer gepanzerter Geländewagen, auch mit Waffenstation „Arbalet“.", var="GAZ-233014, SPM-2, Tigr-M, Tigr-M mit Arbalet-DM, Tigr-M SpN, SBM Tigr")
F("imv", "BPM-97 Wystrel", "ru", 1.8, "Maschinengewehr / Granatwerfer: ca. 1,8 km",
  "KamAZ", "Russland", "Russland", "Leichter Radpanzer, ursprünglich für den Grenzschutz.", var="BPM-97, KamAZ-43269 „Wystrel“")
F("imv", "GAZ-39371 Wodnik", "ru", 1.8, "Maschinengewehr: ca. 1,8 km",
  "GAZ, Nischni Nowgorod", "Russland", "Russland", "Geländewagen, Vorgänger des Tigr.")
F("imv", "Patrul / Typhoon-VDV / VPK Ural", "ru", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Asteis / KamAZ / Ural", "Russland", "Russland", "Neuere russische geschützte Fahrzeuge.",
  var="Asteis-7020 Patrul 4x4/6x6, KamAZ-4386 Typhoon-VDV, AMN-590951 VPK Ural „Spartak“, AMN-233121 Atlet, Iveco LMV Rys")

# ── Panzerjäger ──────────────────────────────────────────────────────
F("pzj", "9P148 Konkurs", "b", 4, "Lenkrakete 9M113 „Konkurs“: bis 4 km",
  "Kurganmaschsawod (auf BRDM-2)", SU, "Russland, Ukraine u. a.", "Panzerjäger auf BRDM-2.")
F("pzj", "9P149 Schturm-S", "b", 5, "Lenkrakete 9M114 „Schturm“: bis 5 km",
  "KBM, Kolomna (auf MT-LB)", SU, "Russland, Ukraine", "Panzerjäger auf MT-LB.")
F("pzj", "9K132 Schturm-SM", "ru", 6, "Lenkrakete 9M120 „Ataka“: bis 6 km",
  "KBM, Kolomna", "Russland", "Russland", "Modernisierter Schturm-S mit Wärmebild.")
F("pzj", "9P163M-1 Kornet-T", "ru", 5.5, "Lenkrakete 9M133 „Kornet“: bis 5,5 km (Kornet-M bis 8 km)",
  "KBP, Tula (auf Tigr)", "Russland", "Russland", "Kornet-Werfer auf Tigr-Geländewagen.")

# ── Panzerhaubitzen · Kette ──────────────────────────────────────────
F("pzh", "2S1 Gwosdika", "b", 21.9, "122 mm: 15,3 km · mit Raketenunterstützung: 21,9 km",
  "Charkiwer Traktorenwerk", SU, "Russland, Ukraine, Polen, Finnland, Bulgarien u. v. m.",
  "Leichte Panzerhaubitze.", geber=["Polen", "Tschechien", "Bulgarien", "Finnland (PSH 74)"])
F("pzh", "2S3 Akazija", "b", 24, "152 mm: 18,5 km · mit Raketenunterstützung: 24 km",
  "Uraltransmasch, Jekaterinburg", SU, "Russland, Ukraine, Syrien, Irak u. a.", "", var="2S3, 2S3M")
F("pzh", "2S19 Msta-S", "b", 29, "152 mm: 24,7 km · mit Raketenunterstützung: 29 km",
  "Uraltransmasch, Jekaterinburg", "Russland", "Russland, Ukraine (eigene und erbeutete), Belarus, Venezuela, Aserbaidschan, Äthiopien",
  "Wichtigste russische Panzerhaubitze.", var="2S19, 2S19M1, 2S19M2")
F("pzh", "2S5 Giazint-S", "b", 33.5, "152 mm: 28,4 km · mit Raketenunterstützung: 33,5 km",
  "Uraltransmasch, Jekaterinburg", SU, "Russland, Ukraine, Finnland, Eritrea")
F("pzh", "2S7 Pion / 2S7M Malka", "b", 47.5, "203 mm: 37,5 km · mit Raketenunterstützung: 47,5 km",
  "Kirow-Werk, Sankt Petersburg", SU, "Russland (2S7M), Ukraine (2S7)", "Größtes Kaliber im Krieg.")
F("pzh", "M-1989 Koksan", "ru", 60, "170 mm: ca. 40 km · mit Raketenunterstützung: ca. 60 km",
  "Nordkorea", "Nordkorea", "Nordkorea, Russland, Iran (früher)",
  "Nordkoreanische Langrohr-Kanone, seit 2024 von Russland eingesetzt.")
F("pzh", "PzH 2000", "ua", 56, "155 mm: 30 km · mit Spezialmunition: 40–56 km",
  "Krauss-Maffei Wegmann, München", "Deutschland", "Ukraine, Deutschland, Italien, Niederlande, Griechenland, Kroatien, Litauen, Ungarn",
  "Sehr präzise, hohe Feuerrate.", geber=["Deutschland", "Niederlande", "Italien"])
F("pzh", "AHS Krab", "ua", 40, "155 mm: 30 km · mit Spezialmunition: 40 km",
  "Huta Stalowa Wola", "Polen", "Ukraine, Polen", "In größerer Zahl an die Ukraine geliefert.", geber=["Polen"])
F("pzh", "AS-90", "ua", 30, "155 mm: 24,7 km · mit Spezialmunition: ca. 30 km",
  "Vickers / BAE Systems", "Großbritannien", "Ukraine, Großbritannien", "", geber=["Großbritannien"])
F("pzh", "M109", "ua", 30, "155 mm: 18–24 km · A6 mit Raketenunterstützung: 30 km",
  "BAE Systems (urspr. United Defense)", "USA", "Ukraine, USA, Norwegen, Belgien, Italien, Lettland u. v. m.",
  "Weltweit verbreitetste Panzerhaubitze – die Ukraine erhielt sie aus fünf Ländern.",
  geber=["USA", "Norwegen", "Großbritannien", "Lettland", "Italien", "Niederlande", "Deutschland"], var="M109A3GN, M109A4BE, M109A5Ö, M109L, M109A6")

# ── Radhaubitzen ─────────────────────────────────────────────────────
F("radh", "2S22 Bohdana", "ua", 60, "155 mm: 42 km · mit Raketenunterstützung: 60 km",
  "Kramatorsker Werk für Schwermaschinenbau", "Ukraine", "Ukraine",
  "Ukrainische Eigenentwicklung, in Serie seit 2023, teils von Dänemark bezahlt.", geber=["Dänemark (finanziert)", "Deutschland (finanziert)"], var="Bohdana 2.0, 3.0, 4.0, 5.0, gezogene 2P22")
F("radh", "CAESAR", "ua", 42, "155 mm: ca. 40–42 km",
  "KNDS France (Nexter), Roanne", "Frankreich", "Ukraine, Frankreich, Dänemark, Belgien, Litauen, Indonesien, Saudi-Arabien",
  "Radhaubitze, schnell in Stellung und wieder weg.", geber=["Frankreich", "Dänemark", "Belgien (finanziert)", "Luxemburg (finanziert)"], var="CAESAR 6x6, CAESAR 8x8")
F("radh", "Archer", "ua", 40, "155 mm: 40 km (mit Excalibur bis 50 km)",
  "BAE Systems Bofors, Karlskoga", "Schweden", "Ukraine, Schweden", "Vollautomatische Radhaubitze.", geber=["Schweden"])
F("radh", "Zuzana 2", "ua", 41, "155 mm: 41 km",
  "Konštrukta-Defence, Trenčín", "Slowakei", "Ukraine, Slowakei", "Radhaubitze.", geber=["Slowakei", "Deutschland", "Norwegen", "Dänemark"])
F("radh", "vz. 77 Dana", "ua", 18.7, "152 mm: 18,7 km",
  "ZTS Dubnica", "Tschechoslowakei", "Ukraine, Tschechien, Polen, Libyen", "Radhaubitze auf Tatra-Lkw.", geber=["Tschechien"], var="Dana vz. 77, Dana M2")
F("radh", "DITA", "ua", 40, "155 mm: ca. 40 km",
  "Excalibur Army, Šternberk", "Tschechien", "Ukraine, Tschechien", "Neue tschechische Radhaubitze.", geber=["Tschechien", "Niederlande (finanziert)"])
F("radh", "RCH 155", "ua", 40, "155 mm: über 40 km (mit Spezialmunition weiter)",
  "KNDS Deutschland, München", "Deutschland", "Ukraine, Deutschland, Großbritannien",
  "Radhaubitze auf Boxer-Fahrgestell, kann aus der Fahrt schießen. Deutschland hat 54 zugesagt.", geber=["Deutschland"])
F("radh", "2S43 Malwa", "ru", 30, "152 mm: ca. 25–30 km",
  "Uraltransmasch, Jekaterinburg", "Russland", "Russland", "Neue russische Radhaubitze auf BAZ-Fahrgestell.")
F("radh", "2S44 Giazint-K", "ru", 33, "152 mm: ca. 28–33 km",
  "Uraltransmasch, Jekaterinburg", "Russland", "Russland", "Rad-Version der Giazint-Kanone.")

# ── Mörser ───────────────────────────────────────────────────────────
F("moe", "2S9 Nona-S", "b", 12.8, "120 mm: 8,8 km · mit Raketenunterstützung: 12,8 km",
  "Wolgograder Traktorenwerk", SU, "Russland, Ukraine, Usbekistan u. a.", "Luftlandefähiger Mörser-Haubitzen-Panzer.")
F("moe", "2S23 Nona-SWK", "ru", 12.8, "120 mm: 8,8 km · mit Raketenunterstützung: 12,8 km",
  "Motowilicha-Werk, Perm", "Russland", "Russland", "Nona-Geschütz auf BTR-80-Fahrgestell.")
F("moe", "2S34 Chosta", "ru", 13, "120 mm: ca. 13 km",
  "Motowilicha-Werk, Perm", "Russland", "Russland", "Umbau der 2S1 mit 120-mm-Mörserkanone.")
F("moe", "2S4 Tjulpan", "ru", 20, "Mörser 240 mm: 9,6 km · mit Raketenunterstützung: ca. 20 km",
  "Uraltransmasch, Jekaterinburg", SU, "Russland", "Schwerster Mörser der Welt.")
F("moe", "M120 Rak", "ua", 12, "120 mm: ca. 10–12 km",
  "Huta Stalowa Wola", "Polen", "Ukraine, Polen", "Polnischer Mörserturm auf Rosomak oder Kettenfahrgestell.", geber=["Polen"])
F("moe", "M1064 / Panzermörser M113", "ua", 7, "120 mm: ca. 7 km",
  "BAE Systems / verschiedene", "USA", "Ukraine, USA, Litauen, Spanien u. a.", "Mörserträger auf M113-Basis.", geber=["USA", "Litauen", "Spanien"], var="M1064A3, M106, Panzermörser M113, M113-Mörserträger (Spanien)")
F("moe", "Alakrán", "ua", 7, "120 mm: ca. 7 km",
  "NTGS, Madrid", "Spanien", "Ukraine, Spanien", "Mörser auf Geländewagen, schnell auf- und abgebaut.", geber=["Spanien"])
F("moe", "Bars-8MMK", "ua", 7, "120 mm: ca. 7 km",
  "Bogdan / Ukrainian Armor", "Ukraine", "Ukraine", "Ukrainische Mörserfahrzeuge.", var="Bars-8MMK, BTR-3M2, BRM-1K mit Nona-Turm")

# ── Gezogene Artillerie ──────────────────────────────────────────────
F("gez", "D-30 (2A18)", "b", 21.9, "122 mm: 15,4 km · mit Raketenunterstützung: 21,9 km",
  "Werk Nr. 9, Jekaterinburg", SU, "Russland, Ukraine und über 60 weitere Staaten", "Häufigste Haubitze beider Seiten.", geber=["Estland", "Kroatien"])
F("gez", "D-20", "b", 24, "152 mm: 17,4 km · mit Raketenunterstützung: 24 km",
  "Werk Nr. 9, Jekaterinburg", SU, "Russland, Ukraine u. a.", "", geber=["Tschechien", "Bulgarien"])
F("gez", "2A65 Msta-B", "b", 29, "152 mm: 24,7 km · mit Raketenunterstützung: 29 km",
  "Werk Nr. 9, Jekaterinburg", SU, "Russland, Ukraine, Belarus u. a.")
F("gez", "2A36 Giazint-B", "b", 33.5, "152 mm: 28,5 km · mit Raketenunterstützung: 33,5 km",
  "Motowilicha-Werk, Perm", SU, "Russland, Ukraine, Finnland, Irak", geber=["Finnland (152 K89)"])
F("gez", "M-46", "b", 38, "130 mm: 27,5 km · mit Spezialmunition: ca. 38 km",
  "Motowilicha-Werk, Perm", SU, "Russland, Ukraine, Finnland (K54), Kroatien, Indien u. v. m.", "Weitreichende Feldkanone.", geber=["Kroatien", "Finnland"])
F("gez", "M777", "ua", 40, "155 mm: 24 km · mit Raketenunterstützung: 30 km · Excalibur: bis 40 km",
  "BAE Systems, Barrow-in-Furness / Hattiesburg", "Großbritannien / USA", "Ukraine, USA, Kanada, Australien, Indien, Saudi-Arabien",
  "Leichte Titan-Haubitze, wichtigste westliche Haubitze der Ukraine.", geber=["USA", "Kanada", "Australien"])
F("gez", "FH-70", "ua", 30, "155 mm: 24 km · mit Raketenunterstützung: 30 km",
  "Rheinmetall / Vickers / OTO Melara", "Deutschland / GB / Italien", "Ukraine, Italien, Estland, Japan u. a.", "", geber=["Italien", "Estland"])
F("gez", "TRF1", "ua", 30, "155 mm: 24 km · mit Raketenunterstützung: 30 km",
  "GIAT, Bourges", "Frankreich", "Ukraine, Frankreich, Saudi-Arabien", "", geber=["Frankreich"])
F("gez", "L119 / L118 Light Gun", "ua", 17.2, "105 mm: 17,2 km",
  "Royal Ordnance (heute BAE)", "Großbritannien", "Ukraine, Großbritannien, USA (M119), Australien u. a.", "Leichte Feldhaubitze.", geber=["Großbritannien", "USA (M119)"], var="L118, L119, M119A3")
F("gez", "M101", "ua", 11.3, "105 mm: 11,3 km",
  "Rock Island Arsenal", "USA", "Ukraine und über 60 weitere Staaten", "Haubitze aus dem Zweiten Weltkrieg.", geber=["Litauen", "Slowenien", "Portugal"], var="M101, M101A1, M2A1")
F("gez", "OTO Melara Mod 56", "ua", 10, "105 mm: ca. 10 km",
  "OTO Melara", "Italien", "Ukraine, Spanien, Italien u. a.", "Zerlegbare Gebirgshaubitze.", geber=["Spanien"])
F("gez", "2B16 Nona-K", "b", 12.8, "120 mm: 8,7 km · mit Raketenunterstützung: 12,8 km",
  "Motowilicha-Werk, Perm", SU, "Russland, Ukraine")
F("gez", "MT-12 Rapira", "b", 4, "Panzerabwehrkanone 100 mm: direkt ca. 3 km · Lenkrakete „Kastet“: bis 4 km",
  "Jurga-Maschinenbauwerk", SU, "Russland, Ukraine u. a.", "Panzerabwehrkanone, oft als Artillerie genutzt.")
F("gez", "2B9 Wasilek", "ru", 4.3, "82-mm-Schnellfeuermörser: 4,3 km",
  "Sowjetunion", SU, "Russland u. a.", "Automatischer Mörser.")
F("gez", "D-74 / M-30", "ru", 24, "D-74 (122 mm): 24 km · M-30 (122 mm): 11,8 km",
  "Sowjetunion", SU, "Russland (aus Lagerbeständen)", "Alte Geschütze aus Lagerbeständen.")

# ── Raketenwerfer ────────────────────────────────────────────────────
F("mlrs", "BM-21 Grad", "b", 40, "122 mm Raketen: 20 km · neuere Raketen: bis 40 km",
  "Motowilicha-Werk, Perm", SU, "Russland, Ukraine und über 50 weitere Staaten", "Meistgenutzter Raketenwerfer der Welt.",
  geber=["Tschechien", "Polen", "Bulgarien"], var="BM-21, 9P138 Grad-1, 9P139, 2B26 Grad-K, Bastion-1, Bastion-2, BM-21MT Striga (Tschechien), Grad auf MAN, auf KrAZ, auf Tatra")
F("mlrs", "Tornado-G", "ru", 40, "122 mm Raketen: bis 40 km",
  "NPO Splaw / Motowilicha-Werk", "Russland", "Russland", "Modernisierter Grad.")
F("mlrs", "RM-70", "ua", 20, "122 mm (Grad-Raketen): 20 km",
  "ZTS / Excalibur Army", "Tschechoslowakei", "Ukraine, Tschechien, Slowakei u. a.", "Tschechische Version des Grad mit Nachladesatz.", geber=["Tschechien"], var="RM-70, RM-70 Vampire")
F("mlrs", "APR-40", "ua", 20, "122 mm: ca. 20 km",
  "Aerostar", "Rumänien", "Ukraine, Rumänien", "Rumänische Version des Grad.", geber=["Rumänien"])
F("mlrs", "RAK-SA-12", "ua", 13, "128 mm: ca. 13 km",
  "Kroatien", "Kroatien", "Ukraine, Kroatien", "Leichter kroatischer Raketenwerfer.", geber=["Kroatien"], var="RAK-SA-12, RAK-12")
F("mlrs", "BM-27 Uragan", "b", 35, "220 mm Raketen: 35 km",
  "Motowilicha-Werk / NPO Splaw", SU, "Russland, Ukraine, Belarus, Kasachstan u. a.", "", var="BM-27, 9K57-1 Uragan-1, Bureviy (ukr. Modernisierung)")
F("mlrs", "BM-30 Smertsch", "b", 90, "300 mm Raketen: 70–90 km",
  "NPO Splaw, Tula / Motowilicha-Werk", SU, "Russland, Ukraine, Belarus, Indien, Algerien u. a.")
F("mlrs", "9K515 Tornado-S", "ru", 120, "300 mm gelenkte Raketen: bis 120 km",
  "NPO Splaw (Rostec), Tula", "Russland", "Russland", "Russisches Gegenstück zu HIMARS.", var="9A54 Werfer")
F("mlrs", "Vilkha / Vilkha-M", "ua", 130, "300 mm gelenkte Raketen: ca. 70 km · Vilkha-M: bis 110–130 km",
  "KB Luch, Kiew", "Ukraine", "Ukraine", "Ukrainischer Präzisions-Raketenwerfer.")
F("mlrs", "M142 HIMARS", "ua", 300, "GMLRS: 70–84 km · ATACMS: bis 300 km",
  "Lockheed Martin, Camden (Arkansas)", "USA", "Ukraine, USA, Polen, Rumänien, Estland, Lettland, Litauen, Australien, Singapur u. a.",
  "Präzise Langstrecken-Artillerie auf Lkw.", geber=["USA", "Deutschland (finanziert)"])
F("mlrs", "M270 MLRS", "ua", 84, "GMLRS: 70–84 km",
  "Lockheed Martin (USA); Varianten in GB, DE, FR, IT", "USA", "Ukraine, USA, Großbritannien, Deutschland, Frankreich, Italien, Finnland u. a.",
  "Kettenfahrzeug mit doppelt so vielen Raketen wie HIMARS.", geber=["Großbritannien", "Deutschland", "Italien", "Frankreich"], var="M270B1, MARS II, M270A1, LRU")
F("mlrs", "Typ 75 / M-1991 (Nordkorea)", "ru", 43, "107 mm Typ 75: ca. 8 km · 240 mm M-1991: ca. 43 km",
  "Nordkorea", "Nordkorea", "Nordkorea, Russland", "Nordkoreanische Raketenwerfer, seit 2024/25 von Russland eingesetzt.", var="Typ 75, Chuch'e M-1991, M-2024")

# ── Thermobarisch ────────────────────────────────────────────────────
F("tos", "TOS-1A „Solnzepjok“", "b", 6, "Thermobarische Raketen 220 mm: ca. 6 km",
  "Omsktransmasch / Uralwagonsawod", "Russland", "Russland, Aserbaidschan, Irak, Kasachstan, Saudi-Arabien; Ukraine (erbeutet)",
  "Auf T-72-Fahrgestell, sehr kurze Reichweite, enorme Flächenwirkung.")
F("tos", "TOS-2 „Tosotschka“", "ru", 15, "Thermobarische Raketen: bis ca. 15 km",
  "NPO Splaw, Tula", "Russland", "Russland", "Radfahrzeug mit eigenem Ladekran, seit 2021 im Dienst.")

# ── Ballistische & Küstenraketen ─────────────────────────────────────
F("rak", "9K720 Iskander-M", "ru", 500, "Ballistische Rakete 9M723: bis 500 km · Marschflugkörper 9M728: bis 500 km",
  "KBM, Kolomna / Titan-Barrikady", "Russland", "Russland, Armenien, Algerien, Belarus",
  "Schwer abzufangende Kurzstreckenrakete, Hauptwaffe gegen ukrainische Ziele im Hinterland.", var="9P78-1 Startfahrzeug")
F("rak", "OTR-21 Totschka-U", "b", 120, "Ballistische Rakete: bis 120 km",
  "KBM, Kolomna", SU, "Ukraine, Russland (ausgemustert), Syrien u. a.", "Ältere Kurzstreckenrakete, von der Ukraine bis 2023 eingesetzt.")
F("rak", "K-300P Bastion-P", "ru", 450, "Seezielrakete P-800 „Onyx“: ca. 300 km · gegen Landziele: bis ca. 450 km",
  "NPO Maschinostrojenija, Reutow", "Russland", "Russland, Syrien, Vietnam", "Küstenraketensystem, auch gegen Ziele an Land eingesetzt.")
F("rak", "RK-360MC Neptun", "ua", 280, "Seezielrakete: ca. 280 km · „Langer Neptun“ gegen Landziele: deutlich weiter",
  "KB Luch, Kiew", "Ukraine", "Ukraine", "Versenkte 2022 den Kreuzer „Moskwa“.")
F("rak", "Harpoon-Küstenbatterie", "ua", 124, "Seezielrakete Harpoon: ca. 124 km",
  "Boeing / Küstenstarter aus Dänemark", "USA", "Ukraine, Dänemark, USA, Großbritannien u. v. m.", "Küstenabwehr gegen Schiffe im Schwarzen Meer.",
  geber=["Dänemark", "USA", "Großbritannien", "Niederlande"])

# ── Flak (Rohrwaffen) ────────────────────────────────────────────────
F("flak", "Flakpanzer Gepard", "ua", 5.5, "Kanonen 35 mm: bis ca. 5,5 km",
  "Krauss-Maffei Wegmann, München", "Deutschland", "Ukraine, Rumänien, Brasilien, Katar", "Sehr erfolgreich gegen Shahed-Drohnen.", geber=["Deutschland", "USA (aus Jordanien gekauft)"])
F("flak", "Skynex / Skyranger", "ua", 4, "Kanone 35 mm mit Airburst-Munition: ca. 4 km",
  "Rheinmetall Air Defence, Zürich", "Deutschland / Schweiz", "Ukraine, Österreich, Deutschland, Dänemark u. a.", "Moderne Drohnenabwehr.", geber=["Deutschland"])
F("flak", "ZSU-23-4 Schilka", "b", 2.5, "Kanonen 23 mm: ca. 2,5 km",
  "Uljanowsker Mechanisches Werk", SU, "Russland, Ukraine, Polen u. v. m.", "Auch gegen Bodenziele eingesetzt.", geber=["Polen"])
F("flak", "2K22 Tunguska", "b", 10, "Kanonen 30 mm: 4 km · Raketen: bis 8–10 km",
  "Uljanowsker Mechanisches Werk / KBP Tula", SU, "Russland, Indien, Belarus, Ukraine (wenige)", "Kanonen und Raketen in einem Fahrzeug.", var="2K22M, 2K22M1")
F("flak", "BTR-ZD Skreschet", "b", 2.5, "Kanonen 23 mm: ca. 2,5 km",
  "Sowjetunion", SU, "Russland, Ukraine", "Luftlande-Flak auf BTR-D.")
F("flak", "ZU-23-2", "b", 2.5, "Kanonen 23 mm: ca. 2,5 km",
  "Sowjetunion; Lizenzbau Polen, Bulgarien, Finnland", SU, "Russland, Ukraine und fast alle früheren Ostblockstaaten",
  "Auf unzähligen Lkw, MT-LB und Pick-ups montiert.", geber=["Polen", "Finnland (ItK 61)"], var="ZU-23-2, ZU-23-2CP, ItK 61, auf Ural-4320/43206, KamAZ, GAZ-66, ZiL-130/131, Star-266, DAF YA-4442, HMMWV, MT-LB, 2S1-Fahrgestell")
F("flak", "AZP S-60", "b", 6, "Kanone 57 mm: ca. 6 km",
  "Sowjetunion", SU, "Russland, Ukraine u. a.", "Alte Flak, oft auf Lkw montiert.", geber=["Polen"], var="S-60, auf Ural-4320, auf KrAZ-6322, auf KamAZ, auf MT-LB, Siwalka VM-5 (ukr.)")
F("flak", "Bofors 40 mm", "ua", 4, "Kanone 40 mm: ca. 4 km",
  "Bofors, Karlskoga", "Schweden", "Ukraine, Litauen, Niederlande u. a.", "Alte Flak, heute gegen Drohnen eingesetzt.", geber=["Litauen", "Niederlande", "Schweden (Tridon Mk2)", "Dänemark"], var="40L70, Tridon Mk2")
F("flak", "MR-2 Viktor", "ua", 2, "Zwillings-MG 14,5 mm (ZPU-2): ca. 2 km",
  "Excalibur Army, Šternberk", "Tschechien", "Ukraine", "Mobile Drohnenabwehr auf Toyota-Pick-up.", geber=["Niederlande (finanziert)", "Tschechien"])
F("flak", "Typhoon-PVO", "ru", 2.5, "Kanonen 23 mm: ca. 2,5 km",
  "KamAZ", "Russland", "Russland", "Flak auf geschütztem KamAZ.")

# ── Flugabwehr · Kurzstrecke ─────────────────────────────────────────
F("fla-k", "Pantsir-S1 / S1M", "ru", 20, "Raketen: bis 20 km (S1M: bis 30 km) · Kanonen 30 mm: bis 4 km",
  "KBP Tula / Uljanowsker Werk", "Russland", "Russland, VAE, Syrien, Algerien, Serbien u. a.", "Schützt vor allem gegen Drohnen und Marschflugkörper.", var="Pantsir-S1, Pantsir-S1M, Pantsir-SM")
F("fla-k", "Tor-M1 / M2", "b", 16, "Raketen: bis 16 km (Tor-M1: 12 km)",
  "Kupol, Ischewsk", "Russland", "Russland, Belarus, Ukraine (Tor-M1), Armenien, China u. a.", "", var="9A330, Tor-M1 (9A331), Tor-M1-2U, Tor-M2 (9A331M), Tor-M2DT (Arktis), Tor-M2U")
F("fla-k", "9K33 Osa", "b", 10, "Raketen: bis 10 km",
  "Ischewsker Elektromechanisches Werk / Kupol", SU, "Russland, Ukraine, Polen, Griechenland u. a.", "Ältere Kurzstrecken-Flugabwehr.", geber=["Polen"])
F("fla-k", "9K35 Strela-10", "b", 5, "Raketen: bis 5 km",
  "Saratower Werk", SU, "Russland, Ukraine und viele weitere Staaten", "Auf MT-LB-Fahrgestell.", geber=["Tschechien"])
F("fla-k", "9K334 Gibka-S", "ru", 6, "Raketen „Igla-S“/„Werba“: bis 6 km",
  "KBM, Kolomna", "Russland", "Russland", "Fahrzeug für Fliegerfaust-Trupps auf Tigr.")
F("fla-k", "Stormer HVM", "ua", 7, "Raketen „Starstreak“: ca. 7 km",
  "Alvis / Thales", "Großbritannien", "Ukraine, Großbritannien", "Sehr schnelle Lenkraketen.", geber=["Großbritannien"])
F("fla-k", "AN/TWQ-1 Avenger", "ua", 8, "Stinger-Raketen: bis 8 km",
  "Boeing", "USA", "Ukraine, USA, Taiwan", "Kurzstrecken-Flugabwehr auf Humvee.", geber=["USA"])
F("fla-k", "Crotale NG", "ua", 11, "Raketen VT1: ca. 11 km",
  "Thales", "Frankreich", "Ukraine, Frankreich, Griechenland u. a.", "", geber=["Frankreich"])
F("fla-k", "Raven / Gravehawk", "ua", 10, "Luft-Luft-Raketen vom Boden: ca. 10 km und mehr",
  "MBDA / britische Werkstätten", "Großbritannien", "Ukraine", "Umgebaute Flugzeugraketen (ASRAAM, AIM-9, R-73) auf Lkw.", geber=["Großbritannien", "Dänemark"], var="Raven (ASRAAM auf Supacat HMT), Gravehawk")
F("fla-k", "Vampire C-UAS", "ua", 5, "Lasergelenkte Raketen APKWS: ca. 5 km",
  "L3Harris", "USA", "Ukraine", "Drohnenabwehr auf Pick-up oder Lkw.", geber=["USA", "Niederlande (DAF mit APKWS)"], var="Vampire, DAF-Lkw mit AGR-20 APKWS")
F("fla-k", "CA-95", "ua", 4, "Raketen „Strela-1“: ca. 4 km",
  "Rumänien", "Rumänien", "Ukraine, Rumänien", "", geber=["Rumänien"])

# ── Flugabwehr · Mittelstrecke ───────────────────────────────────────
F("fla-m", "Buk-M1", "b", 35, "Raketen: bis 35 km",
  "Almas-Antei (Uljanowsk, Jekaterinburg)", SU, "Ukraine, Russland, Belarus, Ägypten, Syrien u. a.", "Rückgrat der ukrainischen Mittelstrecke.", var="9A310M1 TELAR, 9A39M1 Lader, Buk-M1-2 (9A310M1-2, 9A39M1-2)")
F("fla-m", "Buk-M2 / M3", "ru", 70, "Buk-M2: bis 45 km · Buk-M3: bis 70 km",
  "Almas-Antei", "Russland", "Russland", "", var="9A317, 9A317M, 9A316")
F("fla-m", "S-350 Witjas", "ru", 120, "Raketen 9M96: bis 120 km",
  "Almas-Antei", "Russland", "Russland", "Neues Mittelstreckensystem.", var="50P6E Starter")
F("fla-m", "IRIS-T SLM / SLS", "ua", 40, "SLM: bis 40 km (Höhe 20 km) · SLS: ca. 12 km",
  "Diehl Defence, Überlingen", "Deutschland", "Ukraine, Deutschland, Ägypten, Estland, Lettland, Slowenien, Schweiz", "Sehr hohe Abschussquote in der Ukraine.", geber=["Deutschland", "Norwegen (finanziert)"])
F("fla-m", "NASAMS", "ua", 50, "AMRAAM: ca. 30 km · AMRAAM-ER: bis 50 km",
  "Kongsberg (Norwegen) / Raytheon (USA)", "Norwegen", "Ukraine, Norwegen, USA, Finnland, Spanien, Niederlande, Litauen u. a.", "", geber=["USA", "Norwegen", "Kanada", "Litauen"])
F("fla-m", "MIM-23 Hawk", "ua", 45, "Raketen: ca. 40–45 km",
  "Raytheon", "USA", "Ukraine, Spanien, Rumänien, Ägypten, Taiwan u. a.", "", geber=["Spanien", "USA", "Niederlande (I-Hawk)"])
F("fla-m", "2K12 Kub", "ua", 24, "Raketen: bis 24 km",
  "Sowjetunion", SU, "Ukraine, Tschechien, Slowakei u. a.", "", geber=["Tschechien", "Slowakei"], var="2K12M2 Kub-M2, Radar SURN 1S91")
F("fla-m", "Aspide / Spada", "ua", 25, "Raketen Aspide: ca. 25 km",
  "Selenia / MBDA Italia", "Italien", "Ukraine, Italien, Spanien u. a.", "", geber=["Italien", "Spanien"], var="SkyGuard Aspide, Spada 2000")
F("fla-m", "S-125 Newa-SC", "ua", 25, "Raketen: bis 25 km",
  "Sowjetunion / Polen", SU, "Ukraine, Polen u. a.", "", geber=["Polen"], var="S-125 Newa-SC (Polen), S-125-2D „Petschora-2D“ (ukr.), Starter 5P73")

# ── Flugabwehr · Langstrecke ─────────────────────────────────────────
F("fla-l", "S-300P", "b", 90, "je nach Version 75–90 km",
  "Almas-Antei, Moskau", SU, "Ukraine, Russland, Belarus, China, Iran, Griechenland u. a.", "Russland nutzt sie auch gegen Bodenziele.", geber=["Slowakei (S-300PMU)"], var="S-300PT, S-300PT-1A, S-300PS, S-300PMU(-1), Starter 5P85S/D/SD/SM, 5P851A")
F("fla-l", "S-300V / V4", "ru", 400, "S-300V: bis 100 km · S-300V4: bis ca. 400 km (Herstellerangabe)",
  "Almas-Antei / Konzern Antei", "Russland", "Russland, Ägypten, Venezuela", "Auf Kettenfahrgestell, auch gegen ballistische Raketen.", var="S-300V1, S-300V4, 9A83M2, 9A84-2")
F("fla-l", "S-400 Triumf", "ru", 380, "Raketen 48N6: bis 250 km · 40N6: bis 380 km",
  "Almas-Antei, Moskau", "Russland", "Russland, China, Indien, Türkei, Belarus", "Langstrecken-Flugabwehr.", var="5P85T2, 5P85SM2-01, 51P6")
F("fla-l", "Patriot", "ua", 160, "PAC-3: ca. 35–60 km · PAC-2 GEM-T: bis 160 km",
  "Raytheon / Lockheed Martin", "USA", "Ukraine, USA, Deutschland, Niederlande, Polen, Japan, Saudi-Arabien u. v. m.", "Kann auch ballistische Raketen abfangen.",
  geber=["Deutschland", "USA", "Niederlande", "Rumänien", "Norwegen (finanziert)"])
F("fla-l", "SAMP/T", "ua", 120, "Aster 30: bis 120 km",
  "Eurosam (MBDA / Thales)", "Frankreich / Italien", "Ukraine, Frankreich, Italien, Singapur", "Europäisches Gegenstück zu Patriot.", geber=["Frankreich", "Italien"])

# ── Radar & Ortung ───────────────────────────────────────────────────
F("radar", "AN/TPQ-36 / -37 Firefinder", "ua", 50, "Ortung von Geschützstellungen: TPQ-36 ca. 24 km · TPQ-37 ca. 50 km",
  "Hughes / Northrop Grumman", "USA", "Ukraine, USA, Niederlande u. v. m.", "Artillerieortungsradare.", geber=["USA", "Niederlande"], var="AN/TPQ-36, AN/TPQ-37, AN/TPQ-49 (leichtes Mörserortungsradar), AN/TPQ-50")
F("radar", "COBRA", "ua", 40, "Ortung von Geschützstellungen: ca. 40 km",
  "Euro-ART (Airbus, Thales, Lockheed)", "Deutschland / Frankreich / GB", "Ukraine, Deutschland, Frankreich, Großbritannien, Türkei", "", geber=["Deutschland"])
F("radar", "ARTHUR", "ua", 31, "Ortung von Geschützstellungen: ca. 31 km",
  "Saab, Göteborg", "Schweden", "Ukraine, Schweden, Norwegen, Großbritannien (Mamba), Dänemark u. a.", "", geber=["Norwegen", "Großbritannien"])
F("radar", "TRML-4D", "ua", 250, "Luftraumüberwachung: bis 250 km",
  "Hensoldt, Ulm", "Deutschland", "Ukraine, Deutschland", "Feuerleitradar für IRIS-T SLM.", geber=["Deutschland"])
F("radar", "AN/MPQ-64 Sentinel", "ua", 75, "Luftraumüberwachung: ca. 75 km",
  "Raytheon", "USA", "Ukraine, USA u. a.", "", geber=["USA"])
F("radar", "Ground Master 200", "ua", 250, "Luftraumüberwachung: bis 250 km",
  "Thales", "Frankreich", "Ukraine, Frankreich u. a.", "", geber=["Frankreich"])
F("radar", "Kolchuga-M", "ua", 600, "Passive Ortung von Funk- und Radarquellen: bis ca. 600 km",
  "Topas, Donezk", "Ukraine", "Ukraine, China, Äthiopien", "Sendet selbst nicht, schwer zu entdecken.")
F("radar", "P-18 / 36D6 / P-35", "b", 250, "Luftraumüberwachung: je nach Typ ca. 250–360 km",
  "Sowjetunion / Ukraine", SU, "Russland, Ukraine", "Rundsuch- und Höhenfinderradare der Luftverteidigung.", geber=["Slowakei (36D6)"], var="P-14, P-18, P-18 „Malachit“, P-18ML, P-18T, P-18-2 „Prima“, MR-18, P-19, P-19 „Dunai“, P-35/37, P-37 „Metsch“, 36D6 (ST-68U), 79K6 „Pelikan“, 80K6M, PRV-11, PRV-13, PRV-16(ML), 1L22 „Parol“, 5N84A „Oborona-14“, Begleitfahrzeug 1RL131")
F("radar", "Zoopark-1M", "ru", 40, "Ortung von Geschützstellungen: ca. 35–40 km",
  "Strela, Tula", "Russland", "Russland, Ukraine (Zoopark-3)", "Wichtigstes russisches Artillerieortungsradar.", var="1L259 Zoopark-1, 1L261 Zoopark-1M, 1L220UK Zoopark-3 (ukr.), 1RL239 Ark-1(M), Irbis, 1K148 „Jastreb-AW“")
F("radar", "Aistjonok / Sobolatnik", "ru", 15, "Ortung von Mörsern und Fahrzeugen: ca. 5–15 km",
  "Rosselektronika", "Russland", "Russland, Ukraine (SNAR-10)", "Tragbare und fahrzeuggestützte Gefechtsfeldradare.", var="1L271 Aistjonok, 1L277 Sobolatnik, SNAR-10, SNAR-10M1, Fara, Repeinik (Drohnenortung), Sarmat-3 mit Repeinik")
F("radar", "Podlet-K1 / Nebo-SVU / Kasta", "ru", 380, "Luftraumüberwachung: ca. 150–380 km",
  "Almas-Antei / NNIIRT", "Russland", "Russland", "Rundsuchradare der russischen Flugabwehr.", var="48Ja6-K1 Podlet-K1 (mit Gefechtsstand und Generator), 1L119 Nebo-SVU, 55Zh6U Nebo-U, 1L125 Niobium-SV, 35N6 Kasta, 51U6 Kasta-2E1, 39N6 Kasta-2E2, Predel (Küste)")

# ── Elektronische Kampfführung ───────────────────────────────────────
F("eloka", "1RL257 Krasucha-4", "ru", 300, "Störung von Flugzeug- und Satellitenradaren: ca. 150–300 km (Herstellerangabe)",
  "KRET, Brjansk", "Russland", "Russland", "Stört Bordradare und Aufklärungssatelliten.", var="1RL257 Krasucha-4 (Gefechtsstand), Krasucha-2, Moskwa-1")
F("eloka", "RB-341W Leer-3", "ru", 0, "Störung von Mobilfunk – Reichweite stark abhängig vom Einsatz",
  "Spezialny Technologitscheski Zentr, St. Petersburg", "Russland", "Russland", "Arbeitet mit Orlan-10-Drohnen zusammen.", var="RB-341W Leer-3, Leer-2")
F("eloka", "Borissoglebsk-2", "ru", 0, "Funkstörung auf Truppenebene – keine verlässliche Angabe",
  "Sozwesdije, Woronesch", "Russland", "Russland", "Auf MT-LB, stört Funkverkehr.", var="R-330BMV, R-378BMV")
F("eloka", "R-330Zh Schitel", "ru", 0, "Störung von GPS und Satellitentelefonen – keine verlässliche Angabe",
  "Protek, Woronesch", "Russland", "Russland", "", var="R-330Zh Schitel, R-330M1P Diabazol, R-325BMV")
F("eloka", "Pole-21 / Silok / Strisch", "ru", 0, "Drohnen- und GPS-Störung – keine verlässliche Angabe",
  "verschiedene", "Russland", "Russland", "", var="Pole-21, Silok-01, Strisch-3, Sapfir, RLK-MC-A, Störer für Wolna Kupol Garant")
F("eloka", "Bukovel-AD", "ua", 15, "Drohnenstörung: bis ca. 15 km (Herstellerangabe)",
  "Proximus, Kiew", "Ukraine", "Ukraine", "Ukrainische Drohnenabwehr.")
F("eloka", "Nota / Plastun", "ua", 0, "Funk- und Drohnenstörung – keine verlässliche Angabe",
  "Ukraine", "Ukraine", "Ukraine", "", var="Nota, Plastun-RP3000, FC.K, R-330 Mandat")

# ── Führung & Fernmelde ──────────────────────────────────────────────
F("fue", "BMP-1KSch / R-145BM", "b", 1, "Maschinengewehr: ca. 1 km",
  "Sowjetunion", SU, "Russland, Ukraine", "Gepanzerte Gefechtsstände und Funkpanzer.", var="BMP-1KSch, K1Sch1, BMD-1KSch-A, R-145BM, R-145BM1, R-145BMA, R-142N „Deimos-N“, R-142NSA, R-149MA1, R-149MA3, R-149AKSch-1, R-149BMRg, BTR-70DI-02 „Switjas“ (ukr.), MSch-PSch (ukr.)")
F("art-fue", "1W13 / 1W16 / 1W119", "b", 1, "Maschinengewehr: ca. 1 km",
  "Sowjetunion", SU, "Russland, Ukraine", "Feuerleit- und Beobachtungsfahrzeuge der Artillerie.", var="1W13(M), 1W14, 1W15(M), 1W16(M), 1W18 „Kljon-1“, 1W110 (Grad-Batterie), 1W119 „Reostat“, 1W12(M) „Maschina-S“, 1W1003")
F("fue", "M577", "ua", 0, UNB,
  "FMC", "USA", "Ukraine, viele M113-Nutzer", "Gefechtsstandpanzer auf M113-Basis.", geber=["Litauen", "Portugal", "USA"])
F("fue", "VTS „Ladoga“", "ru", 0, UNB,
  "Kirow-Werk", "Russland", "Russland", "Schwer gepanzertes Führungsfahrzeug auf T-80-Fahrgestell.")

# ── Pionier ──────────────────────────────────────────────────────────
F("pio", "IMR-2", "b", 0, UNB, "Uralwagonsawod", SU, "Russland, Ukraine", "Pionierpanzer auf T-72-Fahrgestell.", var="IMR-1, IMR-2, IMR-2M, IMR-3M")
F("pio", "UR-77 Meteorit", "b", 0.5, "Minenräumladung: ca. 500 m",
  "Sowjetunion", SU, "Russland, Ukraine", "Schießt Sprengschläuche in Minenfelder.", var="UR-77 Meteorit, UR-67 auf BTR-D")
F("pio", "BAT-2 / MDK-3", "b", 0, UNB, "Sowjetunion", SU, "Russland, Ukraine", "Schwere Räum- und Grabefahrzeuge.", var="BAT-2, MDK-3, PZM-2, BTM-3, IRM „Schuk“ (Pionieraufklärer), PBU-100 (Bohrgerät), BGM-1 (Bohrgerät, ukr.)")
F("pio", "GMZ-3 / ISDM Zemledelije", "ru", 15, "GMZ-3 verlegt Minen direkt · Zemledelije wirft Minen bis 15 km",
  "Sowjetunion / Russland", "Russland", "Russland", "Minenleger.", var="GMZ-3, ISDM Zemledelije, ZiL-131 UMZ, HMMWV mit UMZ (ukr.)")
F("pio", "Wisent 1 / Leopard 2R", "ua", 0, UNB,
  "FFG Flensburg / Patria", "Deutschland / Finnland", "Ukraine, Deutschland, Dänemark, Finnland", "Minenräumpanzer.", geber=["Deutschland", "Finnland", "Dänemark (Wisent-Berge)"], var="Wisent 1, Leopard 2R, Minenräumpflüge (Deutschland: 81)")
F("pio", "BMR-2 / T-64-Minenräumer", "ua", 0, UNB, "Sowjetunion / Ukraine", SU, "Ukraine", "Minenräumpanzer mit Walzen.", var="BMR-2, T-64-Räumer (ukr.)")
F("pio", "Pionierpanzer Dachs", "ua", 0, UNB, "Rheinmetall", "Deutschland", "Ukraine, Deutschland, Norwegen", "Pionierpanzer auf Leopard-1-Basis.", geber=["Deutschland", "Dänemark", "Norwegen (NM189)"], var="Dachs 2A1, NM189")
F("pio", "M1150 Assault Breacher", "ua", 0.1, "Minenräumladung MICLIC: ca. 100 m",
  "General Dynamics", "USA", "Ukraine, USA", "Minenräumer auf Abrams-Fahrgestell.", geber=["USA"], var="M1150 ABV, M58 MICLIC (Anhänger)")
F("pio", "Fernlenk-Minenräumer", "ua", 0, UNB, "DOK-ING / Božena / GCS", "Kroatien / Slowakei / Deutschland", "Ukraine",
  "Ferngesteuerte Minenräumer.", geber=["Kroatien", "Slowakei", "Deutschland", "Kanada", "Südkorea", "Irland", "Estland", "Niederlande", "Dänemark", "Schweden", "Schweiz", "Frankreich"], var="DOK-ING MV-4, Božena 4, Božena 5, GCS-200, Hydrema 910, ScanJack 3500, DIGGER D-250, Ahlmann (Deutschland), Armtrac 400, Djminröjm 1, SDZ-Roboter (Frankreich)")

# ── Bergepanzer ──────────────────────────────────────────────────────
F("berge", "BREM-1 / BTS-4", "b", 0, UNB, "Uralwagonsawod / Charkiw", SU, "Russland, Ukraine", "Bergepanzer auf Kampfpanzer- und BMP-Fahrgestell.", var="BREM-1(M), BREM-2, BREM-Tsch „BREM-4“, BREM-D, BREM-K, BREM-L „Beglanka“, REM-KL, BREM-84 „Atlet“ (ukr.), BREM-4K, BREM-4RM, BTS-4A, BTS-4A(M) Zr. 2020, BTS-4V, VT-72B (Tschechien), MT-T")
F("berge", "Bergepanzer 2 / 3 Büffel", "ua", 0, UNB, "Rheinmetall", "Deutschland", "Ukraine, Deutschland, Kanada u. a.", "Bergepanzer auf Leopard-1- bzw. Leopard-2-Basis.", geber=["Deutschland", "Kanada"], var="Bergepanzer 2, Bergepanzer 3 Büffel")
F("berge", "M88 Hercules", "ua", 0, UNB, "BAE Systems", "USA", "Ukraine, USA u. a.", "", geber=["USA"], var="M88A1, M88A2")
F("berge", "Challenger ARRV", "ua", 0, UNB, "Vickers", "Großbritannien", "Ukraine, Großbritannien", "Bergepanzer auf Challenger-1-Fahrgestell.", geber=["Großbritannien"], var="CRARRV")
F("berge", "Bgbv 90 / WZT-3 / NM217", "ua", 0, UNB, "verschiedene", "Schweden / Polen / Norwegen", "Ukraine",
  "Westliche Bergepanzer.", geber=["Schweden", "Polen", "Norwegen", "Niederlande (YPR-806)", "Großbritannien (FV106 Samson)"], var="Bärgningsbandvagn 90, WZT-3, NM217, YPR-806, FV106 Samson, FV434")

# ── Brückenleger ─────────────────────────────────────────────────────
F("bruecke", "Biber", "ua", 0, UNB, "Krauss-Maffei", "Deutschland", "Ukraine, Deutschland, Niederlande, Dänemark", "Brückenlegepanzer auf Leopard-1-Basis.", geber=["Deutschland", "Dänemark", "Niederlande"])
F("bruecke", "M60 AVLB", "ua", 0, UNB, "USA", "USA", "Ukraine, USA", "", geber=["USA"])
F("bruecke", "MTU-72 / TMM-3", "b", 0, UNB, "Sowjetunion", SU, "Russland, Ukraine", "Brückenlegepanzer und Lkw-Brückenleger.", var="MTU-20, MTU-55A (ukr.), MTU-72, MTU-90, TMM-3, TMM-3M1, TMM-3M2, TMM-6")
F("bruecke", "PMP / PP-2005 Pontons", "b", 0, UNB, "Sowjetunion / Russland", SU, "Russland, Ukraine", "Schwimmbrücken, transportiert auf KrAZ-, Ural- und KamAZ-Lkw.", geber=["Tschechien"], var="PMP, PMP-M, PP-91, PP-2005, MLZh-VF-VT (Eisenbahn), NZhM-56 (Eisenbahn), Fluss- und Uferglieder, Schleppboote BMK-130M, BMK-150, BMK-460, BMK-MT, BMK-MO")
F("bruecke", "M3 Amphibie / Leguan", "ua", 0, UNB, "GDELS / KMW", "Deutschland", "Ukraine", "Westliche Brücken- und Fährsysteme.", geber=["Niederlande", "Belgien", "Frankreich", "Deutschland"], var="M3 Amphibie, Leguan, EFA, Pont flottant motorisé, Bailey-Brücke, schwere und mittlere Brückensysteme (Deutschland: 19)")

# ═══ Ergänzung: alle weiteren Bodenfahrzeuge ═════════════════════════

# ── weitere Kampf- und Schützenpanzer ────────────────────────────────
F("kpz-mod", "T-84 „Oplot“", "ua", 5, "Kanone 125 mm: ca. 2–3 km · Lenkrakete „Kombat“: bis 5 km",
  "Malyschew-Werk, Charkiw", "Ukraine", "Ukraine, Thailand",
  "Modernster ukrainischer Kampfpanzer, nur in sehr kleiner Zahl vorhanden.", var="T-84, T-84U, T-84 Oplot-M")
F("kpz-mod", "T-14 „Armata“", "ru", 5, "Kanone 125 mm: ca. 3 km · Lenkrakete: bis 5 km (Herstellerangabe)",
  "Uralwagonsawod, Nischni Tagil", "Russland", "Russland (Vorserie)",
  "Einsatz in der Ukraine nur von russischer Seite behauptet, kein Fotobeleg von der Front.")
F("spaeh", "Ferret", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Daimler, Coventry", "Großbritannien", "Ukraine (privat beschafft)", "Einzelne Oldtimer-Spähwagen aus den 1950ern.")
F("radspz", "Mbombe 6", "ua", 2, "Waffenstation „Spys“: ca. 1,5–2 km",
  "Paramount Group", "Südafrika", "Ukraine, Jordanien, Kasachstan", "Einzelne Fahrzeuge mit ukrainischer Waffenstation.")
F("tpz-r", "OT-64 SKOT", "ua", 2, "Maschinengewehr 14,5 mm: ca. 2 km",
  "Tatra / FSC Lublin", "Tschechoslowakei / Polen", "Ukraine (über Spenden beschafft)", "Alter Achtrad-Transportpanzer aus dem Warschauer Pakt.")
F("tpz-k", "GT-MU", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Sowjetunion", SU, "Ukraine", "Leichter Kettenträger, zum Transporter umgebaut.")
F("tpz-r", "ACMAT Bastion", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Arquus (ACMAT), Saint-Nazaire", "Frankreich", "Ukraine, Frankreich und viele afrikanische Staaten",
  "Leichter geschützter Transporter.", geber=["Frankreich"])
F("tpz-r", "GTK Boxer", "ua", 1.8, "Maschinengewehr / Waffenstation: ca. 1,8 km",
  "ARTEC (KNDS / Rheinmetall)", "Deutschland / Niederlande", "Ukraine, Deutschland, Niederlande, Litauen, Australien, Großbritannien",
  "Laut Oryx-Lieferliste einzelne Fahrzeuge aus Deutschland.", geber=["Deutschland"])

# ── weitere geschützte Fahrzeuge ─────────────────────────────────────
F("mrap", "FFG-Schutzfahrzeuge", "ua", 1, "Maschinengewehr: ca. 1 km",
  "FFG, Flensburg", "Deutschland", "Ukraine", "Minengeschützte Fahrzeuge aus deutscher Fertigung.", geber=["Deutschland"], var="FFG MRAP, FFG-Mannschaftstransporter")
F("mrap", "Casspir", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Denel / Mechem", "Südafrika", "Ukraine, Südafrika, Indien u. a.", "Klassisches südafrikanisches MRAP.")
F("imv", "KrAZ Cobra / Cougar / Spartan", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "AutoKrAZ / Streit Group", "Ukraine", "Ukraine", "Geschützte Fahrzeuge nach Streit-Lizenz.", var="KrAZ Cobra, KrAZ Cougar, KrAZ Spartan")
F("imv", "Bogdan Bars-6 / Bars-8", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Bogdan Motors, Luzk", "Ukraine", "Ukraine", "Ukrainische Radpanzerwagen.", var="Bars-6, Bars-8")
F("imv", "Dozor-B / Oncilla", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Lwiwer Panzerwerk / Ukrainian Armor", "Ukraine / Polen", "Ukraine", "", var="Dozor-B, Oncilla, Oncilla-Schturm")
F("imv", "Inguar / Gjursa / TYSA / Dschura", "ua", 1, "Maschinengewehr: ca. 1 km",
  "verschiedene ukrainische Hersteller", "Ukraine", "Ukraine", "Kleinere ukrainische Panzerwagen.",
  var="Inguar-3, UAT-D Gjursa 01, Gjursa 02, UAT-TISA, Dschura, Triton-1, Ovid (GAZ-66-Basis)")
F("imv", "Iveco VM 90 / M 40.12 WM/P", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Iveco Defence Vehicles", "Italien", "Ukraine, Italien, Portugal", "", geber=["Portugal", "Italien"], var="Iveco VM 90, VM 90P, M 40.12 WM/P")
F("imv", "Snatch Land Rover", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Land Rover / NP Aerospace", "Großbritannien", "Ukraine, Großbritannien", "Leicht geschützter Patrouillenwagen.")
F("imv", "Mowag Eagle", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Mowag (GDELS), Kreuzlingen", "Schweiz", "Ukraine (privat beschafft), Schweiz, Deutschland, Dänemark", "", var="Eagle II")
F("imv", "Supacat HMT Extenda", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "Supacat, Dunkeswell", "Großbritannien", "Ukraine, Großbritannien, Australien", "Auch als Träger der Raven-Flugabwehr.", geber=["Australien"], var="HMT Extenda Mk2")
F("imv", "M1297 A-GMV", "ua", 1.8, "Maschinengewehr 12,7 mm: ca. 1,8 km",
  "General Dynamics", "USA", "Ukraine, USA", "Leichtes Fahrzeug der US-Spezialkräfte.", geber=["USA"])
F("imv", "Gewerbliche Panzerfahrzeuge", "ua", 1, "Maschinengewehr: ca. 1 km",
  "verschiedene (VAE, Israel, Kanada, Italien, USA)", "verschiedene", "Ukraine",
  "Zivile Sonderschutzfahrzeuge, oft von Stiftungen gekauft.", geber=["Italien (MLS Shield)", "Deutschland (Sonderschutz)"],
  var="INKAS Titan-S, MSPV Panthera T6, MLS Shield, GAIA Amir, LC-79 APC-SH Fighter 2, Tempest 4x4-MPV, Petra Hunter, Sondergeschützte Fahrzeuge (Deutschland: 40)")
F("imv", "Sarmat / Buran / Gusar", "ru", 1, "Maschinengewehr: ca. 1 km",
  "verschiedene russische Hersteller", "Russland", "Russland", "Leichte russische Gelände- und Spezialkräftefahrzeuge.",
  var="STS Sarmat-2, STS Sarmat-3, RIDA Buran ASV, RIDA Buran 10 SpN, TS-3132 Gusar, Ulan, Ulan-2")

# ── weitere Artillerie ───────────────────────────────────────────────
F("pzh", "M110A2", "ua", 30, "203 mm: ca. 25–30 km",
  "BAE Systems (urspr. FMC)", "USA", "Ukraine, Griechenland u. a.", "Von Griechenland über Tschechien geliefert (gemeldet).", geber=["Griechenland"])
F("pzh", "2S35 Koalizija-SW", "ru", 40, "152 mm: ca. 40 km (Herstellerangabe)",
  "Uraltransmasch, Jekaterinburg", "Russland", "Russland", "Einsatz nur von russischer Seite gemeldet, kein Fotobeleg.")
F("gez", "M114", "ua", 14.6, "155 mm: 14,6 km",
  "Rock Island Arsenal", "USA", "Ukraine, Portugal, Griechenland u. a.", "Haubitze aus dem Zweiten Weltkrieg.", geber=["Portugal", "Griechenland"], var="M114, M114A1")
F("gez", "D-44 / D-48", "ua", 15.6, "85 mm: indirekt ca. 15 km, direkt ca. 1,5 km",
  "Sowjetunion", SU, "Ukraine, Polen u. a.", "Alte Panzerabwehrkanonen.", geber=["Polen (D-44M)"], var="D-44, D-44M, D-48")
F("gez", "BS-3", "ua", 20, "100 mm: ca. 20 km",
  "Sowjetunion", SU, "Ukraine", "Feldkanone aus dem Zweiten Weltkrieg.")
F("gez", "M1981 (152 mm)", "ua", 17.4, "152 mm: ca. 17 km",
  "Arsenal Reșița", "Rumänien", "Ukraine, Rumänien", "Rumänische Kanonenhaubitze.", geber=["Rumänien"])
F("mlrs", "TRG-230 / TLRG-230", "ua", 70, "230 mm gelenkte Raketen: bis ca. 70 km",
  "Roketsan, Ankara", "Türkei", "Ukraine, Türkei", "Türkischer Präzisions-Raketenwerfer.", geber=["Türkei"])
F("mlrs", "Behelfs-Raketenwerfer (UA)", "ua", 8, "70-mm-Raketen: bis ca. 8 km · 80-mm-S-8: ca. 4 km",
  "Feldumbauten", "Ukraine", "Ukraine", "Flugzeug- und Hubschrauberraketen auf Pick-ups und Humvees.", geber=["Deutschland (70-mm-Werfer auf Pick-up)"],
  var="70-mm-Werfer auf Pick-up (Deutschland: 20), B-8-Behelfswerfer, HMMWV mit Raketenwerfer, Ford Raptor mit Raketenwerfer")
F("mlrs", "Behelfs-Raketenwerfer (RU)", "ru", 10, "je nach Rakete ca. 4–10 km",
  "Feldumbauten", "Russland", "Russland", "Marine- und Flugzeugraketen auf Kettenfahrzeugen und Lkw.",
  var="MT-LB mit 140-mm-Ogon-18, RBU-6000 (213 mm) auf T-72-Wanne, auf MT-LB und auf Ural-4320, BTR-80 mit UB-32")
F("art-fue", "PRP-3 / PRP-4 / PRP-4A", "b", 1, "Maschinengewehr: ca. 1 km",
  "Sowjetunion / Russland", SU, "Russland, Ukraine", "Gepanzerte Artillerie-Aufklärer mit Gefechtsfeldradar.",
  var="1Zh3 PRP-3 „Wal“, 1W125/145 PRP-4(M) „Nard“/„Deiterij“, PRP-4A „Argus“")
F("art-fue", "MP32M1 / 9S936", "ru", 0, UNB,
  "Russland", "Russland", "Russland", "Feuerleitfahrzeuge der Raketenartillerie.", var="MP32M1 (Feuerleitung 9S729M1 „Slepok-1“), 9S936 (Tornado-S), 1W1003 (System 1W198)")
F("art-fue", "WDSz / EPBV-3022", "ua", 1, "Maschinengewehr: ca. 1 km",
  "Huta Stalowa Wola / Hägglunds", "Polen / Schweden", "Ukraine, Polen, Schweden", "Westliche Artillerie-Führungs- und Beobachterfahrzeuge.", geber=["Polen", "Schweden"],
  var="WDSz (Feuermodul „Regina“), LPG WD, EPBV-3022")
F("lader", "Lader der Raketenwerfer", "b", 0, UNB,
  "Sowjetunion / Russland", SU, "Russland, Ukraine", "Nachladefahrzeuge mit Kran.", var="9T452 (Uragan), 9T234-2 (Smerch), TZM-T (TOS-1A)")
F("lader", "Lader der Flugabwehr", "b", 0, UNB,
  "Sowjetunion / Russland", SU, "Russland, Ukraine", "Transport- und Ladefahrzeuge für Flugabwehrraketen.",
  var="9T217 (Osa), 9T243M (Buk-M3), 9T244 (Tor), 2F77M (Tunguska), 9A85-2 (S-300V4), BAZ-69092 (S-400), Ural-532361-1012")
F("lader", "9T250 / 9T248 (Iskander)", "ru", 0, UNB,
  "Titan-Barrikady", "Russland", "Russland", "Lade- und Versorgungsfahrzeuge des Iskander.", var="9T250 Transportlader, 9T248 Versorgungsfahrzeug")
F("lader", "M992 FAASV", "ua", 0, UNB,
  "BAE Systems", "USA", "Ukraine, USA u. a.", "Gepanzertes Munitionsfahrzeug für die M109.", geber=["USA"])

# ── weitere Flugabwehr ───────────────────────────────────────────────
F("flak", "KS-19", "ua", 12, "Flak 100 mm: ca. 12 km Höhe",
  "Sowjetunion", SU, "Ukraine", "Schwere Flak aus den 1940ern, gegen Drohnen reaktiviert.")
F("flak", "Zastava M55 / M75", "ua", 1.5, "20 mm: ca. 1,5 km",
  "Zastava", "Jugoslawien", "Ukraine, Slowenien, Serbien u. a.", "Leichte Flak, auch auf DAF-Lkw.", geber=["Slowenien"], var="M55, M75, DAF YA-4442 mit M75")
F("flak", "Hibneryt", "ua", 2.5, "Kanonen 23 mm: ca. 2,5 km",
  "Polen (auf Star-266)", "Polen", "Ukraine, Polen", "ZU-23-2 auf polnischem Lkw.", geber=["Polen"])
F("flak", "Terrahawk Paladin", "ua", 2, "Maschinenkanone: ca. 2 km",
  "MSI-Defence Systems", "Großbritannien", "Ukraine", "Ferngesteuerter Drohnenabwehr-Turm.", geber=["Großbritannien"])
F("flak", "Slinger", "ua", 1, "Kanone 30 mm: ca. 0,8–1 km gegen Drohnen",
  "Electro Optic Systems (EOS), Canberra", "Australien", "Ukraine", "Drohnenabwehr-Waffenstation auf geländegängigen Fahrzeugen.", geber=["Australien"])
F("fla-k", "Kinetic Defence Vehicle", "ua", 0, "Drohnenabwehr – keine verlässliche Angabe",
  "Diehl Defence", "Deutschland", "Ukraine", "Deutschland lieferte 16 Fahrzeuge.", geber=["Deutschland"])
F("fla-k", "2S38 Deriwazija-PWO", "ru", 6, "Kanone 57 mm: ca. 6 km",
  "Uralwagonsawod", "Russland", "Russland", "Flakpanzer auf BMP-3-Basis, Einsatz nur gemeldet.")
F("fla-k", "9K337 Sosna", "ru", 10, "Raketen: bis ca. 10 km",
  "Konstruktionsbüro Totschmasch", "Russland", "Russland", "Nachfolger der Strela-10, Einsatz nur gemeldet.")
F("fla-m", "Pongae M-2020", "ru", 0, "keine verlässliche Angabe",
  "Nordkorea", "Nordkorea", "Nordkorea, Russland", "Nordkoreanisches Flugabwehrsystem, von Russland eingesetzt.")
F("fla-fue", "9S470M1 (Buk-Gefechtsstand)", "b", 0, UNB,
  "Almas-Antei", SU, "Ukraine, Russland", "Führungsfahrzeug einer Buk-Batterie.", var="9S470M1, 9S470M1-2")
F("fla-fue", "Barnaul-T", "ru", 0, UNB,
  "Russland", "Russland", "Russland (Ukraine: erbeutet)", "Automatisiertes Führungssystem der Heeres-Flugabwehr.", var="9S932-1, 9S932-2")
F("fla-fue", "Gefechtsstände S-300 / S-400", "b", 0, UNB,
  "Almas-Antei", SU, "Russland, Ukraine", "", var="F3-Kabine 70P6 (S-300PT, ukr.), 55K6A (S-400), Mast 40V6M")
F("fla-fue", "BTR-60PU-12 / PPRU-1", "b", 0, UNB,
  "Sowjetunion", SU, "Russland, Ukraine", "Führungs- und Aufklärungsfahrzeuge der Truppen-Flugabwehr.",
  var="BTR-60PU-12, PPRU-1(M) „Sborka“ (9S80)")

# ── weitere Radare & EloKa ───────────────────────────────────────────
F("radar", "Feuerleitradare S-300 / S-400", "b", 0, "Teil des jeweiligen Flugabwehrsystems",
  "Almas-Antei", SU, "Russland, Ukraine", "", geber=["Slowakei (5N63S, 5N66M)"],
  var="5N63S „Flap Lid B“, 5N63-1 „Flap Lid A“, 5N66M „Clam Shell“, 9S32-1, 9S32M1, 9S19M2, 91N6A, 92N6A, 96L6, 50N6A (S-350)")
F("radar", "Buk-Radare 9S18 / 9S36", "b", 0, "Teil des Buk-Systems",
  "Almas-Antei", SU, "Russland, Ukraine", "", var="9S18 „Kupol“, 9S18M1, 9S36, 9S36M")
F("radar", "Westliche Flugabwehrradare", "ua", 0, "Teil der jeweiligen Flugabwehrsysteme",
  "Raytheon, Saab, Thales, Leonardo", "verschiedene", "Ukraine",
  "", geber=["Niederlande", "Deutschland", "USA", "Spanien", "Italien", "Irland", "Schweden", "Litauen"],
  var="AN/MPQ-53/65 (Patriot), AN/MPQ-61/62 (Hawk), RAC 3D, SkyGuard II, PLUTO 2D, Arabel, Giraffe Mk IV, Giraffe 75, PS-90, Amber-1800, RADA ieMHR")
F("radar", "Squire / VERA-NG", "ua", 0, "Bodenüberwachung bzw. passive Ortung",
  "Thales / ERA", "Niederlande / Tschechien", "Ukraine", "", geber=["Niederlande"], var="Thales Squire, VERA-NG")
F("radar", "Wetter- und Landeradare", "b", 0, UNB,
  "Sowjetunion / Russland", SU, "Russland, Ukraine", "", var="1B44-1 (RPMK-1 „Ulybka“), RSP-28ME, DRL-27SE")
F("eloka", "1L262 Rtut-BM / R-934", "ru", 0, "keine verlässliche Angabe",
  "Russland", "Russland", "Russland", "Störer gegen Funkzünder (Rtut) und Flugfunk (R-934).", var="1L262E Rtut-BM, R-934UM, R-934B „Sinitsa“")
F("eloka", "Funkaufklärung (RU)", "ru", 0, "keine verlässliche Angabe",
  "Russland", "Russland", "Russland", "Fahrzeuge zum Orten und Abhören von Funk und Drohnensteuerung.",
  var="Torn(-MDM) (Gefechtsstand und Begleitfahrzeug), R-381T2M „Taran-M“, RB-636(AM2) „Swet-KU“, Palantin, RP-377LA „Lorandit“, RB-109A „Bylina“")
F("eloka", "Westliche EloKa-Fahrzeuge", "ua", 0, "keine verlässliche Angabe",
  "verschiedene", "verschiedene", "Ukraine", "", geber=["Tschechien", "Deutschland", "USA", "Großbritannien"],
  var="Moruš (Tschechien), HMMWV-Störträger (Deutschland), Störausrüstung (USA, Großbritannien)")

# ── Führung & Sonderfahrzeuge ────────────────────────────────────────
F("fue", "Fernmelde- & Richtfunk-Lkw", "b", 0, UNB,
  "Sowjetunion / Russland", SU, "Russland, Ukraine", "Funk-, Richtfunk- und Satellitenstationen auf Lkw.",
  var="R-161, R-166-0.5, P-240, P-260-U (Redut-2US), R-431AM, R-419L1, R-416GM, R-412A „Torf“, R-412AM „Resoner“, R-410-7.5, R-417(S) „Baget“, R-409A, R-405M, R-845, MP-1IM, MP-2IM, R-439-MD2, R-441 „Liwen“, Auriga-1.2W, APE-5, MSch-5350.1, P-230T, MPUS-K, AShT-4310, SA-14RM/SM, KShM auf ZiL-131")
F("fue", "Drohnen-Bodenstationen", "b", 0, UNB,
  "verschiedene", "verschiedene", "Russland, Ukraine", "Leit- und Startfahrzeuge für Drohnen.", geber=["Türkei"],
  var="Orlan-10-Leitstand, Lancet-Starter und Leitstand (RU), TB2-Leitstand und Relaisstation (UA, Türkei)")
F("fue", "ZS-82 / ZS-88", "ru", 0, UNB,
  "Russland", "Russland", "Russland", "Lautsprecherfahrzeuge für psychologische Kampfführung.", var="ZS-82 (auf BRDM-2), ZS-88 (auf BTR-80)")

# ── Unterstützung ────────────────────────────────────────────────────
F("abc", "Dekontaminations- & Nebelfahrzeuge", "b", 0, UNB,
  "Sowjetunion / Russland", SU, "Russland, Ukraine", "", geber=["Deutschland (HEP 70)"],
  var="ARS-14, TMS-65, UTM-80M, TDA-2K, TDA-M, TDA-3, TDM-2K, UAZ-469RCh, DDA-66 (Duschanlage, ukr.), HEP 70 (Deutschland: 6)")
F("sani", "Gepanzerte Sanitätsfahrzeuge (UA)", "ua", 0, UNB,
  "verschiedene", "verschiedene", "Ukraine", "Gepanzerte Fahrzeuge zur Verwundetenbergung.",
  geber=["USA", "Portugal", "Großbritannien", "Spanien", "Deutschland", "Israel"],
  var="M113 AMTV (USA: 300+), M113A2, M577A2 (Portugal), FV104 Samaritan, Warthog-Sanität, MT-LB-S, BMM-70, BMM-4C, Pegaso BMR (Spanien), RG-31 Nyala (Spanien), Roshel Senator Medevac, MEDIGUARD (Deutschland), Kozak-5MED, REFORM MedEvac B6, Alvis Tactica, HMMWV-Sanität")
F("sani", "Krankenwagen & Sanitäts-Lkw (UA)", "ua", 0, UNB,
  "verschiedene", "verschiedene", "Ukraine", "",
  geber=["Deutschland", "Niederlande", "Luxemburg", "Irland", "Großbritannien", "Neuseeland", "Tschechien"],
  var="Bogdan-2251, UAZ-3962, Mercedes Unimog U1300L, Steyr-Puch Pinzgauer, Puch 230GE (W461), Mercedes 290GD, Toyota Land Cruiser, Krankenkraftwagen (Deutschland: 49)")
F("sani", "Sanitätsfahrzeuge (RU)", "ru", 0, UNB,
  "Russland", "Russland", "Russland", "", var="BMM-80, KamAZ-53949 „Linsa“, ZSA-T, AS-4350, AS-4350.1, AP-2 (KamAZ), UAZ-452-Sanität")
F("werk", "Werkstattwagen", "b", 0, UNB,
  "Sowjetunion / Russland / Ukraine", SU, "Russland, Ukraine", "Fahrende Werkstätten.",
  var="MTO-AT, MTO-UB1, MTO-UB2, MTO-AG-3M, MRS-BT, PARM-1AM1, MZA-M.1, KrAZ-6322 „Master“ (ukr.)")
F("werk", "Kranwagen & Stapler", "b", 0, UNB,
  "verschiedene", "verschiedene", "Russland, Ukraine", "",
  geber=["Deutschland", "Norwegen", "Japan", "Belgien", "Litauen", "Südkorea"],
  var="KS-3574, KS-3575, KS-45719-7M, KS-4561, KS-4562, KS-55729-7M, 8T210, KMV-10V, ZiL-131 mit LZA, Liebherr LTM (Deutschland), HIAB X-CL 19, Scania P92 (Norwegen), Isuzu-Kran (Japan), Daewoo Novus (Südkorea), Volvo-Fassi N10 (Belgien), Magni-Teleskoplader (Litauen), Gabelstapler (Deutschland: 8)")
F("werk", "Feldküchen, Bäder & Wasser", "b", 0, UNB,
  "Sowjetunion / Russland", SU, "Russland, Ukraine", "",
  var="PAK-200(M) auf Ural/KamAZ, Feldbad PPB-32WU (Ural-53236), Feldbad auf MAZ-6317 (ukr.), MKKV-1000, SKO-10")
F("werk", "Feuerwehrfahrzeuge", "ua", 0, UNB, "verschiedene", "verschiedene", "Ukraine", "Lösch- und Rettungsfahrzeuge für Armee und Zivilschutz.", geber=["Irland"], var="Rosenbauer-Löschfahrzeug (Irland)")
F("werk", "Strom, Starter & Heizung", "b", 0, UNB,
  "Sowjetunion / Russland", SU, "Russland, Ukraine", "",
  var="ED2x30-T400, I-613M, 5I57(A), 63T6A, APA-5D, APA-80, UMP-350, AK-04-9A „Poroscha“")
F("pio", "Bagger & Räumgeräte", "b", 0, UNB,
  "verschiedene", "verschiedene", "Russland, Ukraine", "", geber=["Deutschland (HMEE)", "Japan (D85MS-15)"],
  var="EOV-3521, EOV-3523, EOV-4421, Caterpillar 434E und 938G (gepanzert, ukr.), HMEE (Deutschland: 6), Daewoo-Novus-Bagger, Komatsu D85MS-15 (Japan), KRVD-Straßenbausatz")
F("pio", "K600 / VAB Génie", "ua", 0, UNB,
  "Hyundai Rotem / Arquus", "Südkorea / Frankreich", "Ukraine", "Westliche Pionierpanzer.", geber=["Südkorea", "Frankreich"], var="K600, VAB Génie")
F("pio", "Shielder", "ua", 0, "Minenwurfsystem",
  "Alvis", "Großbritannien", "Ukraine", "Minenverlegesystem auf Lkw.")
F("berge", "Abschlepp- & Bergungs-Lkw", "b", 0, UNB,
  "verschiedene", "verschiedene", "Russland, Ukraine", "", geber=["USA", "Irland", "Belgien"],
  var="Ural-4320 KET-L, Ural-4320 KT-L, KrAZ-260 KT-L, MTP-A2, MTP-A2.1, M1089A1P2, M984A4 HEMTT (USA: 104), Iveco Astra M320 (Irland), Volvo N10 (Belgien), MAN mit Polycar KET-L, GMC TopKick")

# ── Logistik: Lkw ────────────────────────────────────────────────────
LKW_N = "Russland, Ukraine und fast alle früheren Sowjetstaaten"
F("lkw", "Ural-4320 / Ural-375D", "b", 0, UNB, "UralAZ, Miass", SU, LKW_N, "Wichtigster Militär-Lkw beider Seiten.",
  var="Ural-375D, Ural-4320, Tankwagen, mit Panzerkabine, Ural-43ATS20, Ural-4320-7810 „Motowos-M“")
F("lkw", "Ural-5323 / Federal / Tornado-U", "b", 0, UNB, "UralAZ, Miass", "Russland", "Russland; Ukraine (erbeutet)", "Neuere russische Ural-Generation.",
  var="Ural-43206, Ural-5323, Ural Federal, Ural-532301 (Panzerkabine), Ural-6370, Ural-63704, Ural-63706, Ural-64706 „Tornado-U“, Ural-63501-AT, Ural-55571 (Kipper), Ural-Avtozak, 2F510 (für Mörser 2S12 „Sani“)")
F("lkw", "KamAZ", "b", 0, UNB, "KamAZ, Nabereschnyje Tschelny", "Russland", "Russland, Ukraine u. v. m.", "Rückgrat der russischen Logistik.",
  var="KamAZ-4310, KamAZ-43114, KamAZ-43118, KamAZ-4350, KamAZ-5320, KamAZ-5350, KamAZ-43501, KamAZ-65115, KamAZ-65117, KamAZ-4385, KamAZ 4x4, KamAZ 6x4, KamAZ 6x6, KamAZ 8x8, Tankwagen, mit Panzerkabine, mit MM-501, KamAZ-Avtozak, KamAZ „Gorez“")
F("lkw", "GAZ-66 / GAZ-3308", "b", 0, UNB, "GAZ, Nischni Nowgorod", SU, LKW_N, "",
  var="GAZ-51, GAZ-53, GAZ-63, GAZ-66, GAZ-3307, GAZ-3308, GAZ-33081 „Jeger II“, GAZ-33097, GAZ Sadko Next, Tankwagen")
F("lkw", "ZiL-131 / ZiL-130", "b", 0, UNB, "ZiL, Moskau", SU, LKW_N, "",
  var="ZiL-130, ZiL-131, ZiL-131 „Wepr“ (ukr.), ZiL-157, ZiL-181, ZiL-4331, ZiL-4334, Tankwagen")
F("lkw", "KrAZ-255 / KrAZ-6322", "b", 0, UNB, "AutoKrAZ, Krementschuk", "Ukraine (Sowjetunion)", "Ukraine, Russland u. a.", "Schwere ukrainische Geländelastwagen.",
  var="KrAZ-214, KrAZ-255B, KrAZ-256B, KrAZ-257, KrAZ-260, KrAZ-5233, KrAZ-6322, KrAZ-6322 „Krepost“, KrAZ-65055, KrAZ-6510, ATs-10-260 Tankwagen")
F("lkw", "MAZ", "b", 0, UNB, "MAZ, Minsk", "Belarus (Sowjetunion)", "Russland, Ukraine, Belarus u. a.", "",
  var="MAZ-500, MAZ-4371, MAZ-5316, MAZ-5336, MAZ-5337, MAZ-531605, MAZ-6317, MAZ-63172, TZ-500 Tankwagen")
F("lkw", "Bogdan-Lkw", "ua", 0, UNB, "Bogdan Motors, Luzk", "Ukraine", "Ukraine", "In der Ukraine montierte Lkw auf MAZ-Basis.",
  var="Bogdan-3373, Bogdan-5316, Bogdan-63172, Bogdan-63172 „Kozak“")
F("lkw", "Tatra T815", "ua", 0, UNB, "Tatra, Kopřivnice", "Tschechien", "Ukraine, Tschechien, Slowakei, Indien u. a.", "", var="Tatra-815 8x8, T815-7")
F("lkw", "Jelcz / Star", "ua", 0, UNB, "Jelcz / FSC Star", "Polen", "Ukraine, Polen", "", geber=["Polen"], var="Jelcz P882 D53, Star 266, Star 266M2")
F("lkw", "Mercedes Zetros / Unimog", "ua", 0, UNB, "Daimler Truck, Wörth", "Deutschland", "Ukraine, Deutschland u. v. m.", "Deutschland lieferte 262 Zetros und 78 Zetros-Tankwagen.",
  geber=["Deutschland"], var="Zetros, Zetros-Tankwagen, Unimog, Mercedes-1017 Tankwagen")
F("lkw", "MAN / RMMV", "ua", 0, UNB, "Rheinmetall MAN Military Vehicles, München / Wien", "Deutschland", "Ukraine, Deutschland, Australien u. v. m.", "",
  geber=["Deutschland", "Estland", "Australien"],
  var="MAN KAT1 4x4/6x6, RMMV HX 4x4, HX 40M, MAN TGS (Deutschland: 25), MAN TG MIL 6x6, MAN TG 4x4/6x6, MAN Multi A4 FSA (15t mil gl), Wechselladesysteme (Deutschland: 80)")
F("lkw", "Iveco / Astra", "ua", 0, UNB, "Iveco Defence Vehicles, Bozen", "Italien", "Ukraine, Italien u. a.", "", geber=["Italien", "Deutschland"],
  var="Iveco Magirus 90-16 AW, Iveco VM 90, Iveco ACM 90, Iveco Trakker, Iveco Astra SM 66.40")
F("lkw", "Renault Trucks", "ua", 0, UNB, "Renault Trucks Defense (Arquus)", "Frankreich", "Ukraine, Frankreich u. a.", "", geber=["Frankreich", "Litauen", "Deutschland"],
  var="Renault TRM 2000, TRM 10000, GBC 180, Midlum, Renault D")
F("lkw", "DAF", "ua", 0, UNB, "DAF, Eindhoven", "Niederlande", "Ukraine, Niederlande", "", geber=["Niederlande"], var="DAF YA-4442, DAF YAZ-2300, DAF YA-328, Leyland DAF 45.150")
F("lkw", "Oshkosh FMTV / MTV", "ua", 0, UNB, "Oshkosh Defense", "USA", "Ukraine, USA u. a.", "", geber=["USA"], var="FMTV M1083A1P2, Oshkosh M1078 MTV")
F("lkw", "Volvo / Scania / Steyr / Saurer", "ua", 0, UNB, "verschiedene", "Schweden / Österreich / Schweiz", "Ukraine", "", geber=["Belgien", "Norwegen", "Irland"],
  var="Volvo N10, Scania P113 (Hakenlift, Norwegen), Scania DROPS (Irland), Steyr 1291, Saurer 2DM")
F("lkw", "Weitere gespendete Lkw", "ua", 0, UNB, "verschiedene", "verschiedene", "Ukraine", "Von Stiftungen und Freiwilligen beschafft.",
  var="Daewoo Novus, Kia KM-450, Ashok Leyland Stallion, Foden 8x6, Polycar Bus Truck, Flyer 72-LD, Lkw und Kleinbusse aus Bundeswehrbeständen (Deutschland: 473)")

# ── Schwerlast & Zugmaschinen ────────────────────────────────────────
F("schwer", "MAZ-537", "b", 0, UNB, "MAZ / KZKT", SU, "Russland, Ukraine", "Schwere Zugmaschine für Panzertransporte.")
F("schwer", "Russische Panzertransporter", "b", 0, UNB, "MAZ / BAZ / KamAZ / UralAZ", "Russland / Belarus", "Russland; Ukraine (erbeutet)", "",
  var="MAZ-74101 „Oplot-T“, BAZ-6403, BAZ-69531, KamAZ-65225, Ural-63704, Ural-542301, KamAZ-Tieflader")
F("schwer", "KrAZ-6446 / KrAZ-6510TE", "ua", 0, UNB, "AutoKrAZ, Krementschuk", "Ukraine", "Ukraine", "Ukrainische Sattelzugmaschinen.")
F("schwer", "HX81 Panzertransporter", "ua", 0, UNB, "RMMV", "Deutschland / Österreich", "Ukraine, Deutschland u. a.", "Deutschland lieferte 90 Zugmaschinen mit Aufliegern.", geber=["Deutschland"], var="MAN HX81, Auflieger")
F("schwer", "Oshkosh M1070 HET", "ua", 0, UNB, "Oshkosh Defense", "USA", "Ukraine, USA u. a.", "Schwerlast-Sattelzug für Kampfpanzer.", geber=["Deutschland"])
F("schwer", "ATS-59G / KamAZ-6350", "b", 0, UNB, "Sowjetunion / KamAZ", SU, "Russland, Ukraine", "Zugmaschinen für schwere Geschütze.", var="ATS-59G, KamAZ-6350 Artilleriezugmaschine")

# ── Ketten- & Geländetransporter ─────────────────────────────────────
F("kette-log", "MT-T / PTS-2", "b", 0, UNB, "Charkiwer Traktorenwerk", SU, "Russland, Ukraine", "Schwerer Kettenschlepper und Schwimm-Transporter.", var="MT-T, PTS-2, PTS(-M)")
F("kette-log", "DT-10 / DT-30 „Witjas“", "ru", 0, UNB, "Ischimbai", "Russland", "Russland", "Zweigliedrige Kettenfahrzeuge für Schnee und Sumpf.", var="DT-10PM, DT-30")
F("kette-log", "GAZ-3344 / GAZ-3351", "ru", 0, UNB, "GAZ", "Russland", "Russland", "Leichte zweigliedrige Kettenfahrzeuge.", var="GAZ-3344-20 „Aleut“, GAZ-3351 „Los“")
F("kette-log", "M548 / NM199", "ua", 0, UNB, "FMC", "USA", "Ukraine, Norwegen u. a.", "Kettenlastwagen auf M113-Basis.", geber=["Norwegen"])
F("kette-log", "Morooka & Sumpffahrzeuge", "ua", 0, UNB, "verschiedene", "Japan / Lettland / Ukraine", "Ukraine", "", geber=["Japan", "Lettland"],
  var="Morooka PC-065B (Japan), TAHA (ukr.), LV-Teh (Lettland), Bandvagn 202 (Lettland)")

# ── Geländewagen & Pick-ups ──────────────────────────────────────────
F("gelaende", "UAZ-469 / UAZ Patriot / Lada Niva", "b", 0, UNB, "UAZ, Uljanowsk / AwtoWAS", SU, "Russland, Ukraine", "",
  var="UAZ-469, UAZ-3151, UAZ Patriot, UAZ-3132, LuAZ-969, Lada 4x4 (Niva), Lada-4x4-Pick-up (Lettland)")
F("gelaende", "Toyota Land Cruiser / Hilux", "ua", 0, UNB, "Toyota", "Japan", "Ukraine und weltweit", "Die meistgenutzten Geländewagen der ukrainischen Armee.",
  geber=["Dänemark", "Litauen", "USA", "Großbritannien", "Japan", "Niederlande", "Kanada", "Spanien"],
  var="Land Cruiser 70/76/79, Land Cruiser 200 (gepanzert, Litauen), Babcock-Land-Cruiser (GB), Hilux, Mega Cruiser, Toyota HMV (Japan)")
F("gelaende", "Pick-ups", "ua", 0, UNB, "verschiedene", "verschiedene", "Ukraine", "Deutschland lieferte 181 Pick-ups.",
  geber=["Deutschland", "Litauen", "Irland", "Niederlande", "Italien"],
  var="Mitsubishi L200, Nissan Navara, Isuzu D-Max, Ford Ranger, Ford Raptor, VW Amarok, Fiat Fullback, Bogdan-2351 (Great Wall Wingle)")
F("gelaende", "Militär-Geländewagen", "ua", 0, UNB, "verschiedene", "verschiedene", "Ukraine", "",
  geber=["Litauen", "Spanien", "Frankreich", "Luxemburg", "Japan", "Polen", "Lettland"],
  var="Land Rover Defender, Santana Aníbal, Peugeot P4, Mercedes 290GD, Jeep Wrangler, Tarpan Honker, Mitsubishi Typ 73, Hummer, Renault Duster, Lincoln Navigator, Grenzschutzfahrzeuge (Deutschland: 290)")
F("gelaende", "Haval H9 / zivile SUV", "ru", 0, UNB, "Great Wall Motor u. a.", "China", "Russland", "Chinesische Geländewagen in russischen Einheiten.", var="Haval H9")

# ── Transporter & Busse ──────────────────────────────────────────────
F("bus", "UAZ-452 „Buchanka“", "b", 0, UNB, "UAZ, Uljanowsk", SU, "Russland, Ukraine", "Kleinbus seit 1965.", var="UAZ-452, UAZ-3303, UAZ-39094 „Fermer“")
F("bus", "Westliche Transporter", "ua", 0, UNB, "verschiedene", "verschiedene", "Ukraine", "", geber=["Deutschland", "Irland", "Luxemburg", "Albanien", "Estland"],
  var="Ford Transit, Mercedes Sprinter, Mercedes L 508D")
F("bus", "Busse (RU)", "ru", 0, UNB, "PAZ, Pawlowo", "Russland", "Russland", "", var="PAZ-32053, Schulbusse")

# ── Motorräder, Quads & Buggys ───────────────────────────────────────
F("leicht", "Motorräder (RU)", "ru", 0, UNB, "verschiedene (v. a. China)", "China / Belarus", "Russland",
  "Seit 2024 massenhaft bei Sturmangriffen, um Drohnen auszuweichen.", var="Chinesische Geländemotorräder, Motorräder aus Belarus, E-Scooter")
F("leicht", "Quads, Buggys & Golfwagen (RU)", "ru", 0, UNB, "verschiedene (v. a. China)", "China / Russland", "Russland",
  "Schnelle, ungeschützte Fahrzeuge für Sturmtrupps.", var="Desertcross 1000-3, AM-1 „Medowucha“, chinesische Golfwagen, Quads")
F("leicht", "Motorräder & Buggys (UA)", "ua", 0, UNB, "verschiedene", "Ukraine / Österreich / Lettland", "Ukraine",
  "Für Drohnentrupps, Panzerabwehr und Evakuierung.", geber=["Lettland (Quads)"], var="Atom Military (Elektro), KTM 450 EXC, VARAN-Buggy, Quads und Hexacycles, Mosphera-E-Scooter, Motorräder mit Beiwagen")

# ── Bodenroboter ─────────────────────────────────────────────────────
F("ugv", "THeMIS", "ua", 0, "je nach Ausstattung",
  "Milrem Robotics, Tallinn", "Estland", "Ukraine, Estland, Niederlande, Deutschland u. a.", "Kettenroboter, in der Ukraine v. a. zur Verwundetenbergung.", geber=["Deutschland"])
F("ugv", "Gereon RCS / TerMIT", "ua", 0, UNB,
  "ARX Robotics / Tencore", "Deutschland / Ukraine", "Ukraine", "Deutschland lieferte 30 Gereon RCS.", geber=["Deutschland"], var="ARX Gereon RCS, TerMIT")
F("ugv", "Kampfroboter (UA)", "ua", 1.8, "Maschinengewehr bis 12,7 mm oder Granatwerfer: ca. 1–1,8 km",
  "verschiedene ukrainische Hersteller", "Ukraine", "Ukraine", "Halten Stellungen und unterstützen Angriffe ohne Besatzung.",
  var="Ljut (7,62 mm), DevDroid TW 12.7, Protector (12,7 mm), D-21-11 mit Turm „Schablja“, Ironclad, Burja (Mk 19), Rys Pro, Moros")
F("ugv", "Logistik- & Bergungsroboter (UA)", "ua", 0, UNB,
  "verschiedene ukrainische Hersteller", "Ukraine", "Ukraine", "Versorgen Stellungen und bergen Verwundete.",
  var="Termit, Wolja-E, Ratel H, Ratel M, Murakha, Murakha-Mini, Karakurt / Wepryk, Sirko-S1, KNLR-E, Mangust-1, Alter Ego, Ljaschko")
F("ugv", "Kamikaze- & Minenroboter (UA)", "ua", 0, UNB,
  "verschiedene ukrainische Hersteller", "Ukraine", "Ukraine", "Fahren mit Sprengladung an Ziele heran oder legen Minen.",
  var="Ratel S, ARK-1, Mangust, Smileyk, Zmij (Minenräumung), Grunt (Minenleger)")
F("ugv", "Westliche Roboter", "ua", 0, UNB,
  "verschiedene", "Niederlande / Frankreich", "Ukraine", "", geber=["Niederlande", "Frankreich"], var="Ermine (Niederlande), Colossus (Frankreich, Brandbekämpfung)")
F("ugv", "Uran-6 / Prochod-1", "ru", 0, UNB,
  "Rostec / 766. UPTK", "Russland", "Russland", "Ferngesteuerte Minenräumfahrzeuge.", var="Uran-6, Prochod-1")
F("ugv", "Russische Kampf- & Logistikroboter", "ru", 0, "je nach Ausstattung",
  "verschiedene russische Hersteller", "Russland", "Russland", "Teils nur von russischer Seite gemeldet.",
  var="Kurjer, Depescha, Impuls-M, Skorpion-M, Kapitan, Krot, Ljaguschka")

# ── Panzerzug ────────────────────────────────────────────────────────
F("pzzug", "Russische Panzerzüge", "ru", 2.5, "Kanonen 23 mm u. a.: ca. 2,5 km",
  "Russische Eisenbahntruppen", "Russland", "Russland", "Sichern Bahnlinien in den besetzten Gebieten.", var="Wolga, Jenissei, Amur, Baikal")

# Englische Schreibweisen, damit die Suche auch sie findet (Feld „a“, wird nicht angezeigt)
ALIAS = {
  "2S1 Gwosdika": "Gvozdika", "2S3 Akazija": "Akatsiya", "2S5 Giazint-S": "Giatsint Hyacinth", "2A36 Giazint-B": "Giatsint Hyacinth",
  "2S44 Giazint-K": "Giatsint Hyacinth", "2S4 Tjulpan": "Tyulpan Tulip", "2S34 Chosta": "Khosta", "2S23 Nona-SWK": "Nona-SVK",
  "BM-30 Smertsch": "Smerch", "TOS-1A „Solnzepjok“": "Solntsepyok", "TOS-2 „Tosotschka“": "Tosochka", "9P149 Schturm-S": "Shturm",
  "9K132 Schturm-SM": "Shturm Ataka", "KamAZ Taifun": "Typhoon", "BPM-97 Wystrel": "Vystrel", "GAZ-39371 Wodnik": "Vodnik",
  "BMP-2M „Beresok“": "Berezhok", "BTR-MDM „Rakuschka“": "Rakushka", "BTR-ZD Skreschet": "Skrezhet", "ZSU-23-4 Schilka": "Shilka",
  "OTR-21 Totschka-U": "Tochka", "RK-360MC Neptun": "Neptune", "S-350 Witjas": "Vityaz", "2S38 Deriwazija-PWO": "Derivatsiya PVO",
  "2S35 Koalizija-SW": "Koalitsiya", "1RL257 Krasucha-4": "Krasukha", "R-330Zh Schitel": "Zhitel Diabazol", "Borissoglebsk-2": "Borisoglebsk",
  "2B9 Wasilek": "Vasilek", "BMPT „Asowez“": "Azovets", "DT-10 / DT-30 „Witjas“": "Vityaz", "UAZ-452 „Buchanka“": "Bukhanka",
  "Aistjonok / Sobolatnik": "Aistyonok Sobolyatnik", "Uran-6 / Prochod-1": "Prokhod", "Russische Kampf- & Logistikroboter": "Kuryer Depesha Impulse",
  "Kampfroboter (UA)": "Lyut", "Russische Panzerzüge": "Volga Yenisei armoured train", "T-72B3 / B3M": "Tsar Mangal turtle tank",
  "Gewerbliche Panzerfahrzeuge": "Titan Panthera Shield Amir", "1L262 Rtut-BM / R-934": "Rtut Sinitsa", "Funkaufklärung (RU)": "Svet-KU Taran Bylina",
  "Inguar / Gjursa / TYSA / Dschura": "Gyurza Dzhura", "Zoopark-1M": "Zoopark Yastreb", "M-1989 Koksan": "Koksan Juche",
}
for e in L:
  if e["n"] in ALIAS: e["a"] = ALIAS.pop(e["n"])
assert not ALIAS, ALIAS

namen = [e["n"] for e in L]
assert len(namen) == len(set(namen)), [n for n in namen if namen.count(n) > 1]
out = {
  "stand": "2026-11",
  "quellen": [
    "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html",
    "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-ukrainian.html",
    "https://www.oryxspioenkop.com/2022/04/answering-call-heavy-weaponry-supplied.html",
  ],
  "gruppen": GRUPPEN,
  "typen": {k: {"l": v[0], "g": v[1]} for k, v in TYPEN.items()},
  "fahrzeuge": L,
}
p = pathlib.Path(__file__).resolve().parent.parent / "daten" / "fahrzeuge.json"
p.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(len(L), "Einträge →", p)
