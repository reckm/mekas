# Module

Status: **Idee** → **in Arbeit** → **im Labor** (Maris testet) → **abgenommen** (in der normalen Bedienung) oder **verworfen**.

Jede Karte hat: Mechanik, Bild, Parameter, Erfolgskriterien, Fragen an Maris, Notizen aus den Tests. Bei jeder Änderung des Status das Datum dazuschreiben.

---

## Bestand (seit Runde 0 als Kern und Module, siehe `CLAUDE.md`)

| Modul | Station | Status | Bemerkung |
|---|---|---|---|
| Kurbel | Takt (Kern) | abgenommen | 4–24 fps, 4–12 auf 0–80 % des Wegs |
| Handkurbel | Takt | abgenommen | eigenes Modul seit Runde 0: Unregelmässigkeit in der Mikrozeit |
| Blende | Belichtung | abgenommen | 0–360°, unter 36° gegen Schwarz. **Seitwärts-Achse (Schlitze) entfällt** |
| Kammblende | Belichtung | verworfen als Bedienung | Code bleibt als Modul, im Labor schaltbar, nicht in der Bedienung |
| Entwickeln | Entwickeln | abgenommen | Belichtung → Helligkeit, Anlaufblitz |
| Greifer | Transport | wird umgebaut (Runde 1) | **Takt-Achse entfällt.** Zug bleibt als Schlupf beim Halten, automatische Rückkehr wird zur Feder |
| Bildstand | Projektor | abgenommen | neue Lage nur bei neuem Bild |
| Doppel | Aufnahme | abgenommen | auf dem iPhone bestätigt (2026-10-12) |
| Zeit-Modi | Aufnahme | Bild steht nach: abgenommen. Unterdreht: offen | Unterdreht überzeugt noch nicht, später |
| Halten | Projektor | abgenommen | zwei Finger, Leertaste |
| Schwenken mit dem Telefon | Quelle | abgenommen (2026-10-12) | nur Video und Demo, Richtung und Stärke auf dem iPhone bestätigt |

---

## Runde 0: Fundament

**Status:** abgenommen (2026-10-12, iPhone: alle fünf Punkte ok)

**Ziel:** Mekas sieht danach aus und verhält sich wie heute, nur aufgeräumt, aus Modulen gebaut, online über https und mit Labor und Tests. **Keine neuen Bildeffekte in dieser Runde.**

**Aufgaben:**
1. **Repository und GitHub Pages:** öffentliches Repository `mekas`, Pages aus `main` /. `.gitignore` aus dem Startpaket übernehmen (`referenz/`, `tests/out/`, `.DS_Store`). Adresse oben in `CLAUDE.md` eintragen.
2. **Aufteilen** von `mekas.html` in `index.html`, `src/kern/` und `src/module/` nach der Richtung in `CLAUDE.md`. Die endgültige Schnittstelle in `CLAUDE.md` dokumentieren.
3. **Aufräumen in der Bedienung:**
   - Blende wird ein einfacher senkrechter Fader (Seitwärts-Achse „Schlitze“ weg, Blende immer „verwaschen“).
   - Greifer-Pad: Seitwärts-Achse „Takt“ weg (Takt fest auf dem bisherigen Mittelwert). Hoch/runter bleibt vorerst, bis Runde 1 das Pad ersetzt.
   - Erklärtexte im Menü und Aria-Labels anpassen.
4. **Version und Cache** wie in `CLAUDE.md`.
5. **Labor** (`?labor`) mit Modul-Liste, rohen Reglern, Vergleich, Schnappschuss und Rechenzeit.
6. **Tests:** Rauchtest und Kontaktbogen. Als Probe einen Kontaktbogen für die Blende bei 30°, 135°, 240° und 360° mit der Demo-Quelle.

**Erfolgskriterien:**
- Maris merkt auf dem iPhone keinen Unterschied zu vorher, ausser den weggefallenen Achsen.
- Live-Kamera, Video laden, Doppel und Fertig funktionieren über die https-Adresse.
- Das Labor zeigt alle Module und ihre Regler.

**Maris prüft auf dem iPhone (Checkliste aus dem alten Handover):**
1. Kamera-Erlaubnis bleibt beim nächsten Öffnen erhalten (Safari › Kamera › Erlauben).
2. Doppel nicht ab dem Anfang: Bild bleibt nicht schwarz.
3. Video laden: steht nach dem Laden, läuft mit der Aufnahme, Ende beendet den Film.
4. Fertig in Pause: Film wird gespeichert.
5. Schwenken mit dem Telefon: Richtung und Stärke stimmen.

**Notizen:**
- 2026-10-09: Gebaut und von Maris abgenommen („passt“). Kontaktbogen Blende 30°/135°/240°/360° mit der Demo: neu und alte `mekas.html` sehen gleich aus, mittlere Helligkeit gleich (Abweichung ≤ 0,05 von 255). Kammblende ebenso. Rauchtest grün, „Unterdreht“ einmal durchgespielt.
- Nicht auf der Karte, deshalb in `IDEEN.md`: geteilte Ansicht im Labor, Pad und Fader über dem Einstellungsblatt (war schon so), veraltete Meldungen „Datei direkt öffnen“.
- 2026-10-12, iPhone mit 0.0.1: alle fünf Punkte ok (Kamera-Erlaubnis bleibt, Doppel nicht schwarz, Video laden, Fertig in Pause, Schwenken).

---

## Runde 1a: Schwinger und Anstossen (gemeinsamer Kern)

**Status:** Idee

**Mechanik:** Ein gedämpfter Schwinger wie eine Masse an einer Feder. Ein Stoss gibt ihm Energie, er schwingt aus und kommt zur Ruhe. Dieser Kern wird von mehreren Modulen benutzt (Greifer, später Linse, Pendel, Zweiter Projektor). Jedes Modul sagt, auf welche Achsen es reagiert und welche Ruhelagen es hat.

**Bedienung:**
- Das **XY-Pad „Greifer“** (bisheriges Greifer-Pad, rechts über der Blende) hat zwei Gesten:
  - **Tippen = Stoss.** **Richtung** = vom Mittelpunkt zum Finger, **Stärke** = Abstand vom Mittelpunkt.
  - **Halten = Schlupf** (siehe 1b). Solange der Finger liegt, läuft der Film unsynchron zum Greifer.
- Das **Gyroskop ist immer gekoppelt:** Ein Ruck mit dem Telefon (Drehrate, hochpassgefiltert) ist ebenfalls ein Stoss. Ruhiges Halten gibt keinen.
- Ohne Gyroskop (Rechner, keine Erlaubnis) funktioniert das Pad allein.

**Parameter (Labor):** Eigenfrequenz, Dämpfung, Empfindlichkeit Gyroskop, Schwelle Gyroskop (unterhalb zählt nichts), Stärke Pad.

**Erfolgskriterien:**
- Normales Filmen aus der Hand löst nicht ständig Stösse aus.
- Ein bewusster Ruck ist sofort spürbar, wie ein Schlag an die Kamera.
- Das Ausschwingen wirkt physikalisch, nicht animiert.

**Frage an Maris nach dem Test:** Gyroskop immer gekoppelt, oder nur solange ein Finger auf dem Pad liegt? Im Labor beides als Schalter anbieten.

**Notizen:**

---

## Runde 1b: Greifer mit Feder

**Status:** Idee

**Mechanik:** Der Filmstreifen sitzt normalerweise genau im Bildfenster. Ein Stoss lässt ihn senkrecht rutschen. Danach zieht ihn eine **Rastung** zur **nächsten stabilen Lage** (ganze Bildhöhe), auf dem **kürzesten Weg**, wie eine Feder mit **Einschwingen** (leichtes Überschwingen, dann Ruhe). Idee zur Umsetzung: ein periodisches Rastpotential, Kraft ∝ −sin(2π·Versatz/P). Damit ergibt sich die nächste Ruhelage von selbst.

**Bild:** Der Bildstrich wandert kurz durchs Bild, federt nach und sitzt wieder. Ist die Blende offen, während der Film rutscht, entstehen Schlieren aus den Lichtern. **Kopplung:** Die Schlierenlänge ist der Weg, den der Film während der offenen Blende tatsächlich zurücklegt (aus der Geschwindigkeit des Schwingers, nicht mehr aus dem festen Transportsektor).

**Schlupf (Halten), Maris 2026-10-09: „hat Potential“:** Solange der Finger auf dem Pad liegt, zieht der Greifer den Film nicht sauber. Der Film läuft gegen den Greifer, der Bildstrich rollt durchs Bild. Das ist der bisherige Zug ≠ 1, nur jetzt an den Finger gebunden.
- Die senkrechte Fingerposition gibt Richtung und Tempo: oben mehr als ein Bild pro Zug (Lücken), unten weniger, ganz unten steht der Film (Stapeln).
- Reglerweg wie früher verteilt: viel Raum für langsamen, ruhigen Schlupf nahe der Mitte, das Extreme nur am Rand (Totzone in der Mitte).
- **Loslassen:** Die Rastung übernimmt. Der Film rastet auf dem kürzesten Weg im nächsten Bild ein, mit Einschwingen. Es gibt keine eigene Rückkehr-Animation.
- Ein Gyroskop-Ruck während des Haltens gibt zusätzlich einen Stoss.

**Entfällt:** Dauerzug ohne Finger, automatische Rückkehr (`relaxGrip`, `gRelaxV`), Doppeltippen zum Einrichten.

**Achsen:** reagiert auf y. Ob x ein kleines seitliches Spiel im Filmkanal ergeben soll, als Labor-Schalter.

**Parameter (Labor):** Rastkraft, Dämpfung (Einschwingen), Masse, Kurve und Totzone des Schlupfs, maximaler Schlupf oben und unten, Schwelle Tippen gegenüber Halten (ms), seitliches Spiel an/aus.

**Erfolgskriterien:**
- Ohne Finger nie Durchlaufen, nie Zurückkriechen. Stoss: Rutschen, Einrasten, Ruhe.
- Halten nahe der Mitte ergibt einen langsamen, ruhigen Bildstrich. Das Extreme gibt es nur am Rand.
- Ein kleiner Stoss rastet zurück in dieselbe Lage, ein grosser in die nächste.
- Tippen und Halten verwechselt man nicht.
- Kein Flackern beim Einschwingen.

**Notizen:**

---

## Runde 1c: Überblendender Projektor (Idee 5, klein)

**Status:** Idee

**Mechanik:** Im Modus „Bild steht nach“ springt das Bild nicht hart zum nächsten Kurbelbild, sondern geht weich hinein, wie zwei Projektoren mit Überblendung. **Kopplung an die Blende:** offen = weicher Übergang, fast zu = hart.

**Erfolgskriterien:** Ruhiger bei 4–8 fps, das Stocken bleibt als Rhythmus erkennbar, wirkt nicht wie Zwischenbilder.

**Notizen:**

---

## Runde 1d: Stehender Film (Mehrfachbelichtung)

**Status:** Idee (für Runde 1d gewählt 2026-10-12)

**Herkunft:** Das Stapeln im Greifer („Film steht“). Maris 2026-10-12: „das Aufsummieren zu Glühen und Ausbreiten ist spannend“. Hier ohne Greiferbewegung, als eigenes Modul. Hintergrund in `IDEEN.md` (Stehender Film, Mehrumlauf-Blende).

**Mechanik:** Der Film steht im Bildfenster, die Blende dreht weiter. Jedes Kurbelbild belichtet dasselbe Stück Film noch einmal. Wie der Film auf das viele Licht reagiert, hängt vom **Material** ab (Kennlinie).
- **Kurbel** = Durchgänge pro Sekunde. Bei 4 fps baut sich das Bild langsam auf, bei 24 fps schnell. Kein eigener Tempo-Regler.
- **Blende** = wie stark jeder Durchgang einwirkt. Geschlossene Blende = Anteil 0 = Standbild, in jedem Material.

**Bedienung:** über das bestehende **Halten** (zwei Finger, Leertaste), keine neue Geste.
- Modul aus: Halten wie heute (Standbild).
- Modul an: Beim Halten steht der Film, die Kurbel dreht weiter. **Änderung im Kern:** Heute setzt Halten die Kurbel auf 0 fps (`src/kern/kurbel.js`). Mit dem Modul muss sie weiterlaufen, der Projektor zeigt das gestapelte Bild.
- **Loslassen:** Der Greifer zieht ein frisches Bild ins Fenster, weich übergeblendet, nie ein harter Sprung. Benutzt die Überblendung aus 1c, deshalb nach 1c.
- Kurbel-Label beim Halten mit offener Blende: „belichtet mehrfach“ statt „hält“ (Wortlaut mit Maris klären).

**Material (ein Regler, in dieser Runde nur im Labor):**
- **Sandwich** (dunkler): wie zwei Dias übereinander oder Bipack im Kopierwerk. Licht muss durch alle Schichten, Schatten bleiben stehen. Für helle Szenen (Schnee, Himmel).
- **Graufilter** (gleich hell): jeder Durchgang bekommt nur seinen Anteil. Stehendes wird satt und scharf, Bewegtes wird Nebel. Mitte des Reglers, viel Weg.
- **Umkehrfilm mit Schulter** (heller): Lichter glühen und breiten sich aus, laufen aber weich und nicht hart ins Weiss. Das heutige Stapeln ohne Abschneiden.
- **Solarisation**, hinter einem Strich am Ende: Überbelichtetes kippt langsam ins Dunkle. Höchstes Digital-Risiko, fliegt raus, wenn es nach Filter aussieht.
- **Lichthof** (Labor-Schalter, Grundstellung aus): Licht streut in der Schicht. Der Hof um helle Stellen wächst nur mit dem gesammelten Licht, keine feste Färbung. Prüft, ob das „Ausbreiten“ so stärker wird.

**Nicht in dieser Runde:** Gedächtnis (wer bleibt, Altes verblasst = Mehrumlauf-Blende) bleibt fest auf „alle Durchgänge gleich“. Bewegungsbelichtung (4) ebenfalls später. Kopplung an das Stapeln im Greifer: Schritt 2.

**Umsetzung:** Station Transport, nach dem Greifer. Gesammelt wird in linearem Licht, die Kennlinie des Materials kommt erst beim Zeigen. Lange Stapel brauchen höhere Genauigkeit (WebGL mit Half-Float), sonst Farbstufen und eingefrorene Geister. Der Kontaktbogen braucht eine Möglichkeit, Halten für eine bestimmte Dauer auszulösen.

**Parameter (Labor):** Material, Schulter (wie weich die Lichter auslaufen), Anteil pro Durchgang bei offener Blende, Lichthof an/aus und Stärke, Dauer der Überblendung beim Loslassen.

**Kontaktbogen:** Material Sandwich, Graufilter, Umkehrfilm, Solarisation. Je ein Standbild nach 2 s, 5 s und 15 s Halten, bei 6 und 18 fps, Blende 180°. Quellen: Demo und ein Video mit Lichtern in der Nacht.

**Erfolgskriterien:**
- Halten mit offener Blende: Das Bild baut sich über Sekunden auf, Lichter glühen und breiten sich aus. Auch nach 15 s nicht flächig reines Weiss (Umkehrfilm).
- Halten mit geschlossener Blende verhält sich wie heute.
- Die Kurbel ist spürbar: bei 4 fps langsames, bei 24 fps schnelles Aufbauen.
- Loslassen ohne harten Sprung.
- Nach 30 s Halten keine Farbstufen und keine eingefrorenen Geister.
- Kein Pulsieren, auch nicht bei Solarisation und schwankendem Licht.
- Vorschau flüssig bei 720p auf dem iPhone.

**Fragen an Maris nach dem Test:** Welche Materialien bleiben, und welches ist die Grundstellung? Solarisation behalten? Lichthof ja oder nein? Kommt das Material als Regler in die normale Bedienung, und wenn ja, wohin?

**Notizen:**

---

## Runde 2: Linse (das kaputte iPhone)

**Status:** Idee

**Mechanik (gemessen, siehe `docs/KONZEPT.md`, Teil 1):**
- Die Linse schwingt entlang **einer Achse**: der Längsachse des Sensors. Im Hochformat ist das im Bild senkrecht.
- Der Sensor liest **Zeile für Zeile**. Im Hochformat sind das senkrechte Spalten, gelesen von einer Bildseite zur anderen, in etwa 30 ms. Jede Spalte sieht die Linse an einer anderen Stelle.
- Zwei Anteile: **schnell** (etwa 860 Hz, sehr kleine Auslenkung, nur ein bis zwei Pixel im Foto) und **langsam** (einige zehn Hz, etwa 1–1,5 % der Bildhöhe, das sind die Sprünge im Video).
- Dazu der **Fokus**, der mitschwingt: Schärfe wandert in grossen Wellen durchs Bild. Bei starkem Ausschlag ganz unscharf und etwas heller.
- Die **Belichtungszeit** entscheidet, wie es aussieht: kurz = feine senkrechte Haarstriche und grosse Wellen (Foto), lang = weiches senkrechtes Verwischen (Video).

**Umsetzung:** Pro Spalte (oder Band von wenigen Pixeln): Zeitpunkt = Bildzeit + Spalte/Breite · Auslesezeit. Innerhalb der Belichtungszeit K Teilmomente abtasten, Versatz und Unschärfe aus der Linsenlage. Die Zeit ist simuliert und kontinuierlich, nicht an die 30 Kamerabilder gebunden. Wahrscheinlich ein WebGL-Durchgang. Im Querformat drehen die Achsen mit.

**Anstossen:** Die Linse wird entlang ihrer Achse angestossen und schwingt aus (Schwinger aus 1a). Ein starker Stoss lässt kurz den Fokus ausfallen.

**Parameter (Labor):** Belichtungszeit, Auslesezeit, Amplitude schnell, Frequenz schnell, Amplitude langsam, Frequenz langsam, Fokus-Anteil, Grundunruhe (wie kaputt das Gerät auch ohne Stoss ist).

**Erfolgskriterien:** gegen `referenz/` prüfen.
- Kurze Belichtung: **filigran**, feine Striche nur senkrecht, dazu grosse Fokuswellen durchs Bild, wie `referenz/linse-foto-schnee.jpg`. **Nicht** grobe Zacken wie in `referenz/linse-vergleich.png` (Panel 2). Das war zu stark gerechnet.
- Lange Belichtung: wie Bild 98 in `referenz/linse-video-normal-dann-defekt.mov` (Panel 3 und 4 in `linse-vergleich.png` passen).
- Kontaktbogen mit Referenzbild daneben. Als Quelle die normale erste Hälfte des Videos.

**Notizen:**
