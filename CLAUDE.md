# Mekas: Arbeitsgrundlage für Claude Code

Diese Datei liest Claude Code bei jedem Start. Sie beschreibt, **was Mekas ist, wie es gebaut ist und wie wir arbeiten**. Wohin es in Phasen geht, steht in `FAHRPLAN.md`. Was gerade gebaut wird, steht in `MODULE.md`. Was entschieden ist, steht in `ENTSCHEIDE.md`. Was später kommen könnte, steht in `IDEEN.md`.

## Was Mekas ist

Eine Kamera im Browser, die das iPhone mechanisch filmen lässt wie eine Bolex H16. Gebaut mit Maris (Musikerin, „electronic chamber pop“, macOS, filmt mit dem iPhone; Pronomen sie/ihr).

Nicht Filter, sondern **Mechanik und Zeit** machen den Look. Farbe, Schärfe und Sensor bleiben iPhone. Nachgebaut wird, *wann* und *wie lange* belichtet wird, *wie der Film transportiert* wird und neu auch *wie sich die Linse bewegt*. Ziel ist ein Instrument zum Improvisieren, kein Effektgerät.

- Live: https://reckm.github.io/mekas/
- Labor: https://reckm.github.io/mekas/?labor
- Repository: https://github.com/reckm/mekas (öffentlich, GitHub Pages aus `main` /)
- Hintergrund und Begründungen: `docs/KONZEPT.md` und `docs/zwischen-den-frames.md` (Recherche mit den nummerierten Ideen 1–18)
- Alter Gesamt-Handover (Detailwissen zum bestehenden Code): `docs/archiv/HANDOVER-mekas-2026-10-05.md`

## Designregeln (nicht verhandelbar)

1. **Physikalische Kopplung.** Parameter hängen voneinander ab wie in einer echten Mechanik. Lieber eine Sache richtig koppeln als drei neue Regler.
2. **Instrument statt Bedienoberfläche.** Das Bild ist das Spielfeld. Wenige, grosse, spielbare Regler, alles andere im Menü oder im Labor.
3. **Ruhig und sinnlich vor spektakulär.** Maris reagiert empfindlich auf Flackern. Keine harten, grossflächigen Helligkeitssprünge mit 3–30 Wechseln pro Sekunde. Mehr Reglerweg für die ruhigen Werte.
4. **Keine Texturen, keine Overlays.** Kein Grain-Bild, kein Staub, keine Kratzer. Alles entsteht aus Zeit, Lage und Dauer der Belichtung und aus Bewegung.
5. **Digital wirkende Effekte fliegen raus.** Wenn etwas nach Plug-in aussieht, ist es falsch.
6. **Begriffe aus der alten Technik, beschreibend.** Kein Jargon ohne Erklärung. Deutsch (Schweiz), also „ss“ statt „ß“.
7. **Kein Ton aus der Mechanik.** Mekas nimmt nur das Mikrofon auf.

## Aufbau

### Die Kette, durch die jedes Bild läuft

```
Takt → Quelle → Belichtung → Emulsion → Entwickeln → Transport → Projektor → Aufnahme
(Kurbel, (Kamera,  (Blende,     (jede Teil- (Helligkeit) (Greifer,   (Bildstand,   (MediaRecorder,
 Hand-    Video,    Linse,       belichtung)              Filmstreifen) Überblenden) IndexedDB)
 kurbel)  Demo)     Zeit sammeln)
```

Taktgeber ist die **Kurbel** (4–24 Kurbelbilder pro Sekunde). Kamerabilder kommen mit etwa 30 pro Sekunde, jedes ist eine **Teilbelichtung**: Es fällt so lange auf den Film, wie es während offener Blende zu sehen ist, und zählt genau einmal (`kern/sammeln.js`, WebGL2, lineares Licht, Gleitkomma; die Demo mit festem 30-Hz-Takt; ohne WebGL2 das alte Sammeln). Ausgabe mit 24, 25 oder 30 pro Sekunde.

### Kern und Module

**Kern** (`src/kern/`, immer da): Kurbel mit fps-Skala, Zoom, Halten (zwei Finger oder Leertaste: die Kurbel steht, mit Stehendem Film dreht sie weiter und es heisst „accum.“; drei Finger oder Taste H: „hält“, friert genau das sichtbare Bild ein), Quellen, Doppel, Zeit-Modi, Klappe, Aufnahme, Speicher, Bedienung, dazu **Anstossen** (Stösse vom Greifer-Pad und vom Gyroskop, `kern/anstoss.js`), der **Schwinger** (`kern/schwinger.js`, gedämpfte Feder für Module), der geteilte **Bewegungssensor** (`kern/bewegung.js`, iPhone fragt nur einmal) und **Sammeln** (`kern/sammeln.js`, Teilbelichtungen). **Module** (`src/module/`): Handkurbel, Schwenken, Blende, Entwickeln mit Anlaufblitz, Greifer (mit Feder, Werte fest in `GREIFER`), Stehender Film und Überblendender Projektor (beide Grundstellung „nur im Labor an“), Bildstand. Die Reihenfolge der Kette steht in `src/module/liste.js`.

**Vorerst wird nur im Labor gebaut** (Entscheid 2026-10-12): Neues bekommt die Grundstellung `an: 'labor'`, die normale Bedienung bleibt beim abgenommenen Stand, bis die Kamera fertig ist.

Jedes Modul ist eine eigene Datei, die an genau einer Station ansetzt (Schnittstelle seit Runde 0):

```js
// src/module/beispiel.js
export default {
  id: 'beispiel',
  titel: 'Beispiel',            // so heisst es im Labor
  station: 'belichtung',        // takt | quelle | belichtung | emulsion | entwickeln | transport | projektor
  an: true,                     // Grundstellung: true, false (nur im Labor einschaltbar) oder 'labor' (neu: im Labor an, in der Bedienung aus, bis Maris es abnimmt)
  params: {                     // erscheinen im Labor automatisch als Regler; aktuelle Werte in this.p
    staerke: { min: 0, max: 1, def: 0.5, schritt: 0.01, titel: 'Stärke', einheit: '' },
    blitz: { typ: 'schalter', def: true, titel: 'Blitz' },
    art: { typ: 'wahl', werte: ['eins', 'zwei'], def: 'eins', titel: 'Art' },   // Fader mit Raststellen, Wert ist der Name
  },
  anstoss: ['y'],               // ab Runde 1: reagiert auf Anstossen (Achsen x/y)
  uebernimmtHalten: true,       // optional: beim Halten dreht die Kurbel weiter (Stehender Film)
  setup(ctx) {},                // einmal beim Start
  reset(ctx) {},                // neue Bildgrösse (auch wenn das Modul aus ist)
  ein(ctx) {},                  // optional: beim Einschalten
  tick(ctx, dt) {},             // Physik, jedes Animationsbild, nur wenn an
  apply(ctx, bild) {},          // an seiner Station, nur wenn an
  hinweis(ctx) {},              // optional: kurzer Text im Kurbel-Label, z. B. „schwenkt“
};
```

Was `bild` an jeder Station ist (das Modul verändert es, der Kern macht weiter):

| Station | wann | `bild` | ohne Modul |
|---|---|---|---|
| takt | Anfang jedes Kurbelbilds | `{ T, abstand }` in ms bis zum nächsten | gleichmässig |
| quelle | jedes Abtasten der Quelle | `{ dw, dh, dx, dy }`, Lage der Quelle | Mitte |
| belichtung | Anfang jedes Kurbelbilds | `{ t0, T, winkel, fenster: [[a, b], …] ms, stops, deckung }` | feste 135° |
| emulsion | jede Teilbelichtung (Kamerabild, etwa 30 pro Sekunde), solange Licht kommt | `{ t, licht, filter: [r, g, b] }`: `licht` in ms, wie lange dieses Kamerabild bei offener Blende zu sehen war; `filter` die Farbempfindlichkeit | jedes Kamerabild voll, gewichtet mit seiner Zeit |
| entwickeln | Blende schliesst | `{ g, roh, E, zyklus }`: in `g` liegt schon das Rohbild, `roh` ist das gesammelte Licht, `E` die Belichtung in s | Rohbild; danach legt der Kern `deckung` (Abblenden) darüber |
| transport | nach dem Entwickeln | `{ belichtet, g, zyklus }`: `g` ist das Bildfenster | Bild liegt genau im Fenster |
| projektor | jedes Ausgabebild | `{ lage: { x, y, s }, quelle }`: `quelle` ist das Bildfenster, ein Modul darf ein eigenes Canvas einsetzen (Überblenden) | Bild sitzt fest, springt hart |

Gemeinsamer Zustand `ctx` (nur lesen): `jetzt, dt, W, H, kurbel {x, y, fps}, zoom, halten, standbild` (drei Finger), `ausgabeFps, quelle, zeitModus, aufnahme, anlauf {nr, doppel}, bildNr, belichtung {winkel, T}` (Blendenwinkel und Dauer des letzten Kurbelbilds), `stoss {x, y}` (Summe der Stösse in diesem Animationsbild, Bilder pro Sekunde, y nach oben; ein Modul mit `anstoss: ['y']` teilt sie durch seine Masse und gibt sie seinem Schwinger), `eingabe {finger, padFinger, greiferHaelt, greiferX, greiferY}` (Finger auf dem Bild, Greifer-Pad), `bildfenster`. Erlaubt sind dazu `ctx.sag(text)` (Meldung) und `ctx.zeichne()` (neues Ausgabebild). Regler der Bedienung und des Labors schreiben dieselben Modulwerte über `kette.setze(id, name, wert)`, Gesten stehen in `ctx.eingabe`. Ein Modul schreibt nur seine eigenen Werte.

Regeln für Module:
- **Jedes Modul lässt sich einzeln ein- und ausschalten**, und Mekas läuft auch ohne es.
- **Module lesen den gemeinsamen Zustand** (Zeit, Kurbel, Blende, Quelle, Schwinger), **schreiben aber nicht in andere Module.** Kopplungen zwischen Modulen kommen bewusst erst in Schritt 2, siehe `ENTSCHEIDE.md`.
- **Alles mit allem.** Jedes Modul wirkt auf Live-Kamera, geladenes Video und Demo gleich. Einzige Ausnahme: Schwenken mit dem Telefon gibt es nur bei Video und Demo.
- Ein Modul, das pro Pixel rechnet (zum Beispiel die Linse), darf einen **WebGL-Durchgang** benutzen, wenn Canvas 2D auf dem iPhone zu langsam ist.
- **Zeitbudget:** Vorschau flüssig bei 720p auf dem iPhone. Das Labor zeigt pro Modul die Rechenzeit in ms.

### Dateien

```
index.html          Mekas für Maris (nur Markup), lädt src/stil.css und src/main.js
src/main.js         Start: Module einrichten, Einstellungen zurückholen, Schleife starten
src/kern/           zustand (ctx), kette, sammeln, kurbel, quelle, ton, aufnahme, rekorder, filme, speicher, bedienung, mechanik, version
src/module/         ein Modul pro Datei, Reihenfolge in liste.js
src/labor/          Labor-Oberfläche und Bauplan (nur mit ?labor geladen)
tests/              Python-Playwright: rauch.py, bogen.py
tools/version.py    Version erhöhen
referenz/           Maris’ Referenzmaterial (NICHT im Repository, siehe .gitignore)
docs/               Konzept, Recherche, Archiv (dort auch die alte mekas.html zum Vergleich)
```

Keine Build-Stufe: reine ES-Module, direkt von GitHub Pages ausgeliefert. Lokal mit `python3 -m http.server 8765` (`.claude/launch.json` „bolex“). Von der Festplatte geöffnet laufen ES-Module nicht. Eine Einzeldatei zum Mitnehmen kann später ein Skript erzeugen.

### Version und Cache

- `src/kern/version.js` enthält die Version, zum Beispiel `0.1.3` (Runde.Modul.Stand). **Bei jeder Veröffentlichung erhöhen**, immer mit `python3 tools/version.py <neu>`.
- Die Version steht klein in den Einstellungen und im Labor. So sieht Maris auf dem iPhone, ob sie die neueste hat.
- GitHub Pages lässt Dateien einige Minuten im Cache. ES-Module geben die Abfrage `?v=` nicht an ihre eigenen Importe weiter, deshalb trägt **jeder relative Import** `?v=<version>` (auch dynamische Importe und `new URL(…)`). `tools/version.py` ersetzt alle auf einmal, der Rauchtest prüft, dass keiner fehlt.
- Gespeicherte Filme (IndexedDB `kurbel`) und Einstellungen (localStorage `kurbel.v3`) behalten ihre alten Namen, damit nichts verloren geht. Das Labor speichert nur in `mekas.labor`.

## Das Labor

Erreichbar über `?labor`. Maris’ normale Bedienung bleibt davon unberührt.

- Module mit Ein/Aus und ihren `params` als rohe Regler (`typ: 'wahl'` als Fader mit Raststellen, darunter die Namen zum Antippen). **Nur, was noch eingestellt wird** (Maris 2026-10-13): Abgenommenes und was auf dem Bildschirm oder im Menü schon einen Griff hat, steht in `AUS_DEM_LABOR` (`src/labor/labor.js`) und erscheint nur im Bauplan. Ein neues Modul erscheint von selbst mit allen Reglern.
- **Bauplan** (Knopf neben LABOR, ganzer Bildschirm, `src/labor/bauplan.js`): Hände (was Maris spielt), die Kette Station für Station und die Maschinen im Kern, jedes Teil mit Stand (Bedienung, Labor, geplant), Griff und woran es hängt. Antippen zeigt, was davon abhängt (blau) und woran es hängt (weiss umrandet), oben in Worten. Dazu der Fahrplan. Ein Modul ohne Eintrag erscheint mit „noch nicht im Bauplan beschrieben“.
- **Quellen:** Kamera, Demo, Video laden, darunter **Zurücksetzen** (alles auf die Grundeinstellung). Mehr Knöpfe gibt es oben nicht (Maris 2026-10-13). Die Referenzvideos lädt Maris dort selbst.
- Rechenzeit pro Modul in ms pro Animationsbild, dazu Licht sammeln, Projektor und gesamt.
- Unter „Kern“ die Werte von Anstossen (Stärke Pad, Gyroskop, gekoppelt) und Sammeln (Schalter „Teilbelichtungen (neu)“, aus = altes Sammeln zum Vergleich) und eine graue Zeile mit Kurbel, Bildgrösse, Kamerabildern pro Sekunde, Teilbelichtungen pro Kurbelbild, Rechenzeit, erkannten Fingern (accum./hält), Sensorstatus, Ruck jetzt und höchster der letzten 3 s (°/s) und dem letzten Stoss.
- Speichert nur in `mekas.labor` (beim ersten Öffnen aus `kurbel.v3` vorbelegt), und nur Werte, die von der Grundeinstellung abweichen. So kommen neue Grundwerte auch im Labor an. Für Tests gibt es dort `window.mekas` (`setze`, `schalte`, `vergleiche` (Bild ohne ein Modul), `module`, `werte`, `stoss(x, y)`, `halte(y)` und `lass()` fürs Greifer-Pad, `halteBild(an)` wie zwei Finger, `standBild(an)` wie drei Finger).

Ein Modul kommt erst in die normale Bedienung, wenn Maris es abgenommen hat (Status in `MODULE.md`).

## Testen

Einmal einrichten: `python3 -m venv .venv && .venv/bin/pip install -r tests/requirements.txt`. Die Tests nehmen das installierte Google Chrome (sonst `.venv/bin/playwright install chromium`).

1. **Rauchtest** (`.venv/bin/python tests/rauch.py`): Demo → Aufnehmen → Pause → Doppel → Doppel starten → Fertig, ohne Konsolenfehler, normal und mit `?labor`. Prüft auch, dass jeder Import `?v=<version>` trägt, das Labor Abgenommenes nicht mehr zeigt und der Bauplan jedes Modul beschreibt. Nach jeder Änderung.
2. **Kontaktbogen** (`.venv/bin/python tests/bogen.py --modul blende --param winkel --werte 30,135,240,360`): schaltet das Modul ein, stellt die Werte nacheinander ein und schreibt eine HTML-Seite mit Standbildern und kurzen Clips nach `tests/out/` (nicht ins Repository). `--quelle <video>` spielt ein Video als falsche Kamera ein (ffmpeg wandelt es nach `.y4m`, Chrome `--use-file-for-fake-video-capture`). `--referenz <bild>` stellt ein Referenzbild daneben. `--aktion stoss|halten` löst einen Stoss oder Halten aus (Wert = Stärke bzw. Höhe auf dem Pad), mit `--abstand` ms zwischen den Bildern; `--setze modul.param=wert` stellt vorher weitere Werte. `--aktion accum --zeiten 2,5,15` hält das Bild wie mit zwei Fingern und macht Standbilder zu diesen Sekunden, danach loslassen. `--fps` stellt die Kurbel, `--ohne` legt eine Reihe ohne das Modul daneben, `--param blende.winkel` schaltet einen Wert eines anderen Moduls durch. `--alt` legt die alte `mekas.html` daneben, für Werte, die sie schon kannte (vorher/nachher). `--vergleich modul.param=wert` legt eine Reihe mit diesem Wert daneben (z. B. `sammeln.neu=false`). Jede Reihe zeigt die mittlere Helligkeit ihrer Standbilder. Der Zufall ist in beiden gleich gesät. `--werte` nimmt Zahlen oder Namen (Raststellen), der Ordner heisst nach Modul, Quelle und fps.
3. **Selbst hinschauen:** Bevor Maris etwas sieht, die Standbilder selbst ansehen und an den Erfolgskriterien der Modulkarte messen.
4. **iPhone:** Nur Maris. Dafür veröffentlichen und ihr sagen, was sie prüfen soll (höchstens fünf Punkte).

## Ablauf einer Runde

1. Modulkarte in `MODULE.md` lesen. Wenn etwas unklar ist: fragen, bevor gebaut wird.
2. Bauen, Rauchtest, Kontaktbogen, selbst prüfen.
3. Maris den Kontaktbogen zeigen. Bei „passt“: Version erhöhen, committen, pushen, warten bis die Seite online ist.
4. Maris nennen, was sie auf dem iPhone prüfen soll.
5. Ihr Feedback auf der Modulkarte eintragen. Entscheide mit Datum in `ENTSCHEIDE.md`, neue Ideen in `IDEEN.md`. Den Bauplan (`src/labor/bauplan.js`) nachführen, wenn ein Teil, ein Stand oder eine Abhängigkeit sich ändert, dazu `AUS_DEM_LABOR`, wenn etwas abgenommen ist. Committen.

**Höchstens ein bis zwei Module pro Runde.** Nichts nebenbei „mit verbessern“, was nicht auf der Karte steht. Fällt etwas auf, kommt es in `IDEEN.md`.

## Mit Maris

- Antworten auf Deutsch (Schweiz), kurz und direkt.
- Erklärungen in der Reihenfolge: was passiert mechanisch, wie sieht es aus, was macht der Code.
- Sie beurteilt nach Gefühl („zu digital“, „Kopfweh“, „sinnlicher“). Das ist das wichtigste Kriterium.
- Konzept und Recherche macht Maris auch mit Claude im Chat. Weil das Repository öffentlich ist, kann Claude dort den Stand direkt lesen.
- Referenzmaterial unter `referenz/` ist privat (Personen, Wohnung) und kommt nie ins Repository.
