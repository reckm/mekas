# Mekas: Arbeitsgrundlage für Claude Code

Diese Datei liest Claude Code bei jedem Start. Sie beschreibt, **was Mekas ist, wie es gebaut ist und wie wir arbeiten**. Was gerade gebaut wird, steht in `MODULE.md`. Was entschieden ist, steht in `ENTSCHEIDE.md`. Was später kommen könnte, steht in `IDEEN.md`.

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
Quelle → Belichtung → Entwickeln → Transport → Projektor → Aufnahme
(Kamera,   (Blende,     (Helligkeit) (Greifer,   (Bildstand,   (MediaRecorder,
 Video,     Linse,                    Filmstreifen) Überblenden) IndexedDB)
 Demo)      Zeit sammeln)
```

Taktgeber ist die **Kurbel** (4–24 Kurbelbilder pro Sekunde). Kamerabilder kommen mit etwa 30 pro Sekunde. Ausgabe mit 24, 25 oder 30 pro Sekunde.

### Module

Jede Funktion ist ein **Modul**: eine eigene Datei unter `src/module/`, die an genau einer Station der Kette ansetzt. Die genaue Schnittstelle legt Runde 0 fest und dokumentiert sie hier. Die Richtung ist diese:

```js
// src/module/beispiel.js
export default {
  id: 'beispiel',
  titel: 'Beispiel',            // so heisst es im Labor
  station: 'belichtung',        // quelle | belichtung | entwickeln | transport | projektor
  params: {                     // erscheinen im Labor automatisch als Regler
    staerke: { min: 0, max: 1, def: 0.5, titel: 'Stärke' },
  },
  anstoss: ['y'],               // optional: reagiert auf Anstossen (Achsen x/y)
  setup(ctx) {},                // einmal
  tick(ctx, dt) {},             // Physik, jedes Animationsbild
  apply(ctx, bild) {},          // Bildverarbeitung an seiner Station
  reset(ctx) {},
};
```

Regeln für Module:
- **Jedes Modul lässt sich einzeln ein- und ausschalten**, und Mekas läuft auch ohne es.
- **Module lesen den gemeinsamen Zustand** (Zeit, Kurbel, Blende, Quelle, Schwinger), **schreiben aber nicht in andere Module.** Kopplungen zwischen Modulen kommen bewusst erst in Schritt 2, siehe `ENTSCHEIDE.md`.
- **Alles mit allem.** Jedes Modul wirkt auf Live-Kamera, geladenes Video und Demo gleich. Einzige Ausnahme: Schwenken mit dem Telefon gibt es nur bei Video und Demo.
- Ein Modul, das pro Pixel rechnet (zum Beispiel die Linse), darf einen **WebGL-Durchgang** benutzen, wenn Canvas 2D auf dem iPhone zu langsam ist.
- **Zeitbudget:** Vorschau flüssig bei 720p auf dem iPhone. Das Labor zeigt pro Modul die Rechenzeit in ms.

### Dateien

```
index.html          Mekas für Maris (aufgeräumte Bedienung)
src/kern/           Kette, Kurbel, Aufnahme, Speicher, Bedienung
src/module/         ein Modul pro Datei
src/labor/          Labor-Oberfläche (nur mit ?labor geladen)
tests/              Playwright: Rauchtest und Kontaktbögen
referenz/           Maris’ Referenzmaterial (NICHT im Repository, siehe .gitignore)
docs/               Konzept, Recherche, Archiv
```

Keine Build-Stufe: reine ES-Module, direkt von GitHub Pages ausgeliefert. Lokal mit `python3 -m http.server`. Eine Einzeldatei zum Mitnehmen kann später ein Skript erzeugen.

### Version und Cache

- `src/kern/version.js` enthält die Version, zum Beispiel `0.1.3` (Runde.Modul.Stand). **Bei jeder Veröffentlichung erhöhen.**
- Die Version steht klein in den Einstellungen und im Labor. So sieht Maris auf dem iPhone, ob sie die neueste hat.
- GitHub Pages lässt Dateien einige Minuten im Cache. Deshalb lädt `index.html` die Skripte mit `?v=<version>`.
- Gespeicherte Filme (IndexedDB `kurbel`) und Einstellungen (localStorage `kurbel.v3`) behalten ihre alten Namen, damit nichts verloren geht.

## Das Labor

Erreichbar über `?labor`. Maris’ normale Bedienung bleibt davon unberührt.

- Liste aller Module mit Ein/Aus und allen `params` als rohe Regler.
- **Vergleich:** Gedrückt halten zeigt das Bild ohne das gewählte Modul. Oder eine geteilte Ansicht, wenn das auf dem iPhone flüssig genug läuft.
- **Quellen:** Kamera, Demo, Video laden. Die Referenzvideos lädt Maris dort selbst.
- **Schnappschuss:** speichert das Bild als PNG und alle Werte als JSON. Maris schickt beides, wenn ihr etwas gefällt oder missfällt.
- Rechenzeit pro Modul.

Ein Modul kommt erst in die normale Bedienung, wenn Maris es abgenommen hat (Status in `MODULE.md`).

## Testen

1. **Rauchtest** (`tests/rauch`): Demo → Aufnehmen → Pause → Doppel → Fertig, ohne Konsolenfehler. Nach jeder Änderung.
2. **Kontaktbogen** (`tests/bogen`): Spielt eine Referenz als falsche Kamera ein (Chromium `--use-file-for-fake-video-capture`, dafür das Video mit ffmpeg nach `.y4m` wandeln), schaltet das Modul mit mehreren Werten durch und schreibt eine HTML-Seite mit Standbildern und einen kurzen Clip nach `tests/out/` (nicht ins Repository). Wenn es eine Referenz gibt, steht das Referenzbild daneben.
3. **Selbst hinschauen:** Bevor Maris etwas sieht, die Standbilder selbst ansehen und an den Erfolgskriterien der Modulkarte messen.
4. **iPhone:** Nur Maris. Dafür veröffentlichen und ihr sagen, was sie prüfen soll (höchstens fünf Punkte).

## Ablauf einer Runde

1. Modulkarte in `MODULE.md` lesen. Wenn etwas unklar ist: fragen, bevor gebaut wird.
2. Bauen, Rauchtest, Kontaktbogen, selbst prüfen.
3. Maris den Kontaktbogen zeigen. Bei „passt“: Version erhöhen, committen, pushen, warten bis die Seite online ist.
4. Maris nennen, was sie auf dem iPhone prüfen soll.
5. Sein Feedback auf der Modulkarte eintragen. Entscheide mit Datum in `ENTSCHEIDE.md`, neue Ideen in `IDEEN.md`. Committen.

**Höchstens ein bis zwei Module pro Runde.** Nichts nebenbei „mit verbessern“, was nicht auf der Karte steht. Fällt etwas auf, kommt es in `IDEEN.md`.

## Mit Maris

- Antworten auf Deutsch (Schweiz), kurz und direkt.
- Erklärungen in der Reihenfolge: was passiert mechanisch, wie sieht es aus, was macht der Code.
- Sie beurteilt nach Gefühl („zu digital“, „Kopfweh“, „sinnlicher“). Das ist das wichtigste Kriterium.
- Konzept und Recherche macht Maris auch mit Claude im Chat. Weil das Repository öffentlich ist, kann Claude dort den Stand direkt lesen.
- Referenzmaterial unter `referenz/` ist privat (Personen, Wohnung) und kommt nie ins Repository.
