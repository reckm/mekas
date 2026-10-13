# Entscheide

Neueste oben. Jeder Eintrag: Datum, Entscheid, kurze Begründung. Nicht wieder aufmachen ohne neuen Anlass.

## 2026-10-13

- **Filmmaterial: Charakter über die ganze Zeit, nicht nur bei accum.** Ein Film wirkt auf jede Teilbelichtung (ein Kamerabild, etwa 30 pro Sekunde), das Zeitfenster (Kurbelbild, accum., Foto-Modus) entscheidet, wie viel davon sichtbar wird. Zwei Maschinen: **Sammeln** im Kern (wann, wie viel, durch welches Filter, dazu gehören auch die Farbsektoren in der Blende) und eine **Gedächtnis-Schicht** mit Rezepten (müder Entwickler, Lith, Röhre, eventuell Photochrom und Netzhaut). Eine Maschine, viele Rezepte statt eines Moduls pro Film. „Rolle altert“ fällt raus, vielleicht später als Alter-Fader. Korn vorerst nicht. Fahrplan in `IDEEN.md` (Filmmaterial).

- **Der jetzige Film: Stehender Film fest mit Sandwich und Lichthof 0,4.** Die Materialwahl (Accum. Material) gehört ins Filmmaterial: Ein anderer Film verhält sich überall anders (jedes Bild, accum., Doppel), nicht nur beim Halten. Lith passt nur als ganzer Filmlook. Aufsummieren und Farbschichten werden dort eins (Farbschichten wirkt natürlicher). Ersetzt den Entscheid „Accum. Material“ vom 2026-10-12.

- **Überblendung beim Loslassen mit weicher Kurve**, Dauer 0,6 s. Linear wirkte das Ende immer hart, egal wie lang.

## 2026-10-12

- **Accum. Material** (Strategie-Chat): Die Materialwahl beim Stehenden Film heisst „Accum. Material“ und wirkt nur auf accum., nicht auf das normale Entwickeln (Kippen von Bild zu Bild würde flackern). Im Labor ein Fader mit Raststellen und Namen statt Zahlen. Graufilter fällt weg (wie Sandwich, leuchtet weniger). Neu ausprobieren: Lith und Farbschichten. Umkehrfilm und Solarisation werden zu „Aufsummieren“, die Solarisation kommt mit der Haltezeit (nach dem Test bestätigen). Doppel mit demselben Material: später, Schritt 2.

- **„Hält“ (drei Finger, Taste H) friert genau das sichtbare Bild ein**, mit allem Gesammelten. Das Labor zeigt die erkannten Finger.

- **Grundwerte nach iPhone-Test 1.2.2:** Stehender Film mit Material Sandwich und Lichthof 0,4 (an, für alle Materialien), Solarisation wieder gleich schnell wie der Umkehrfilm. Überblendender Projektor: Länge 2 × Blendenzeit (weniger ruckelig, weniger Kopfweh bei tiefen fps).

- **Stehender Film nach dem ersten iPhone-Test:** zwei Finger = accum. (auch bei geschlossener Blende), drei Finger = hält (Standbild). Solarisation 3,5-mal schneller. Anteil pro Durchgang und Schulter fest statt Regler. Lichthof bleibt (nicht dasselbe wie Bewegung) und ist jetzt sichtbar, Labor-Schalter. Sandwich und Graufilter vorerst drin, die Modi denkt Maris im Strategie-Chat neu.

- **Vorerst nur im Labor bauen**, bis alle Teile da und eingestellt sind und die Kamera fertig ist. Neue Module haben die Grundstellung „nur im Labor an“, die normale Bedienung bleibt beim abgenommenen Stand.
- **Runde 1c abgenommen** (Überblendung im Labor). Blendzeit = so lange die Blende offen ist.
- **Wortlaut beim Stehenden Film:** Halten mit offener Blende zeigt „accum.“ (Kurbel-Label) bzw. „ACCUM.“ (Schild), mit geschlossener Blende weiter „hält“.

- **Schlieren über 240° bleiben wie sie sind**, auch wenn helle Stellen bis ins nächste Bild ziehen. Mechanisch richtig, gesteuert mit der Blende.
- **Greifer-Werte fest**, nicht im Labor. Die Grundeinstellung fühlt sich gut an. Änderungen nur nach Bildbeobachtung, gezielt ein Wert. Seitliches Spiel und Takt zur Blende entfernt.

- **Runde 1a und 1b zusammen gebaut** (Schwinger allein hat nichts Sichtbares).
- **Schlieren:** Die vom Filmzug bei Blende über 240° bleiben. Rutscht der Film nach einem Stoss, kommen Schlieren aus dieser Bewegung dazu.
- **Schlupf: Es zählt, wo der Finger auf dem Pad liegt** (wie beim Tippen), nicht der Weg ab dem Aufsetzen. Mitte (gestrichelte Linie) = kein Schlupf.
- **Beim Rutschen wird das Bild nicht dunkler**, nur die Lichter ziehen. Abdunkeln hätte geflackert.

- **Stehender Film (Mehrfachbelichtung) wird Runde 1d**, nach 1c, vor der Linse. Ausgelöst über das bestehende **Halten**: geschlossene Blende = Standbild, offene Blende = Mehrfachbelichtung. Braucht die Überblendung aus 1c beim Loslassen. In der Runde zuerst nur das Material (wie der Film auf viel Licht reagiert). Gedächtnis und Mehrumlauf-Blende kommen später.

## 2026-10-09

- **Kern und Module (Runde 0):** Kern sind Kurbel (fps-Skala), Zoom, Halten, Quellen, Doppel, Zeit-Modi, Klappe. Module sind Handkurbel, Schwenken, Blende, Kammblende (aus), Entwickeln mit Anlaufblitz, Greifer, Bildstand. **Handkurbel und Bildstand sind eigene Module**, weil beide analoge Unregelmässigkeit simulieren, in Mikrozeit und Mikroraum. Dafür hat die Kette vorne die Station **Takt**. Schnittstelle in `CLAUDE.md`.
- **Labor speichert getrennt** (`mekas.labor`). Die normale Bedienung liest das nie.
- **Name Maris, Pronomen sie/ihr.** Commits im öffentlichen Repository mit der anonymen GitHub-Adresse und dem Namen Maris Reck.
- **Die alte `mekas.html`** bleibt als `docs/archiv/mekas-2026-10-05.html` online, zum Vergleich.

- **Der unsynchrone Film (Zug ≠ 1, rollender Bildstrich) bleibt spielbar.** Er war nicht das Problem. Gestört haben das Durchlaufen ohne Finger und die automatische Rückkehr. Neu auf dem Greifer-Pad: **Tippen = Stoss, Halten = Schlupf** (der Film läuft unsynchron, solange der Finger liegt), **Loslassen = Feder rastet ein.**

## 2026-10-08

- **Hosting über GitHub Pages, Repository öffentlich.** Https für Kamera, Gyroskop und gemerkte Erlaubnis. Claude im Chat kann den Stand direkt lesen. Referenzmaterial bleibt lokal (`referenz/` in `.gitignore`).
- **Arbeitsweise:** Mekas wird ein Baukasten aus Modulen mit einem Labor (`?labor`). Ein bis zwei Module pro Runde, jede Runde mit Kontaktbogen und iPhone-Test. Statt eines langen Handovers gibt es `CLAUDE.md`, `MODULE.md`, `IDEEN.md` und `ENTSCHEIDE.md`.

## 2026-10-06

- **Bauweise B:** Module sauber einzeln entwickeln und testen. Langfristiges Ziel ist ein einziges Instrument mit allen Funktionen. Kopplungen zwischen den Modulen, Doppelfunktionen und Gehäuse (Kameramodelle) kommen in einem zweiten Schritt.
- **Alles für alles:** Vorerst ist jedes Modul mit jeder Quelle möglich. Video laden funktioniert genau wie Live, abgesehen vom Schwenken mit dem Telefon.
- **Takt (Greifer seitwärts) und Schlitze (Blende seitwärts) fliegen aus der Bedienung.** Kaum wahrnehmbar, rechtfertigen keine Achse.
- **Greifer:** kein Dauerzug, kein Durchlaufen, keine automatische Rückkehr. Stattdessen Anstossen. Danach **rastet er wieder ein, zum nächsten stabilen Ort, auf dem kürzesten Weg, wie eine Feder mit Einschwingen.**
- **Anstossen ist ein Stoss, keine Neigung.** XY-Pad für Richtung und Stärke, **immer mit Gyroskop gekoppelt.**
- **Kein Ton aus der Mechanik** (kein Singen der Linse, kein Rattern).
- **Fliessendes Standbild (11) gestrichen:** im Kern Datamosh, digital.
- **LED-Streifen (17) gestrichen.** Das Prinzip der zeilenweisen Zeit lebt in der Linse weiter.
- **Röhre atmen kommt auf die Ideenliste**, ebenso **Blitz und Strobo**.
- **Unterdreht:** später.
- **Linse:** Die erste Rechnung (grobe Zacken) sah nicht aus wie Maris’ Foto. Dort ist alles filigraner: feine Striche nur senkrecht, dazu grosse Fokuswellen. Daran wird die Linse gemessen.

## 2026-10-05

- **Name Mekas** (vorher Kurbel). IndexedDB `kurbel` und localStorage `kurbel.v3` behalten ihre Namen.

## Früher verworfen (aus dem alten Handover)

- Kurbel unter 4 fps.
- Schwarzer Steg zwischen den Bildern (variierte, wirkte digital).
- Federwerk mit 28-s-Grenze und Aufziehen: nervt.
- Einzelbild- und Ton-Auslöser bei 0 fps: kein Ausdruck.
- Automatische Auf- und Abblende bei Doppel: Maris blendet selbst.
- Automatische Doppelblende.
- Lartigue-Slit-Scan: sah digital aus.
- Kurbel-Geste (Kreise auf dem Bildschirm).
- Begriff „Raffen“, stattdessen „Unterdreht“.
- Farbfilter, Grain-Overlays, Texturen.
- Takt-Streifen als sichtbare Streifen: zu digital, jetzt nur Schlieren aus Lichtern.
