# Ideen

Was später kommen könnte. Nummern in Klammern verweisen auf `docs/zwischen-den-frames.md`. Eine Idee wird erst zur Modulkarte in `MODULE.md`, wenn Maris sie für eine Runde auswählt.

## Bildbewegung (nutzen den Schwinger)

- **Pendel beim Halten (7):** Zwei Finger halten das Bild nicht starr an, sondern zwischen den letzten zwei Bildern. Neigen oder Anstossen schaukelt vom einen zum anderen.
- **Linse auf Federn (14):** Ohne Defekt, die gesunde Linse schwingt nach einem Ruck leicht nach. Eventuell Teil von Runde 2 als „Grundunruhe 0“.
- **Fokus sucht (15):** Bild atmet unscharf und wieder scharf, mit minimaler Grössenänderung. Teilweise schon in Runde 2.
- **Zweiter Projektor (10):** Zwei Schichten derselben Szene, leicht verschieden schnell. Laufen auseinander und finden zurück wie Steve Reichs Phasenverschiebung. Braucht ein Bildgedächtnis von 1–2 s.

## Belichtung und Zeit

- **Stehender Film (Mehrfachbelichtung), zusammen mit der Mehrumlauf-Blende (1).** Ausgangspunkt: das Stapeln im Greifer („Film steht“), Maris 2026-10-12: das Glühen und Ausbreiten beim Aufsummieren ist spannend. Neu als eigenes Modul ohne Greiferbewegung. **Material und Auslösen sind Runde 1d (Karte in `MODULE.md`).** Hier bleibt der Rest, vor allem Achse B.
  - *Mechanik:* Der Film steht, die Blende dreht weiter. Jedes Kurbelbild belichtet dasselbe Stück Film noch einmal. Kurbel = Durchgänge pro Sekunde, Blende = Licht pro Durchgang. Kein eigener Tempo-Regler.
  - *Auslösen:* über das bestehende **Halten** (zwei Finger). Halten bei geschlossener Blende = Standbild wie heute, Halten bei offener Blende = Mehrfachbelichtung. Loslassen: Der Greifer zieht ein frisches Bild ins Fenster, weich übergeblendet (siehe Runde 1c). Dafür muss die Kurbel beim Halten weiterdrehen (heute fps = 0), das ist eine Änderung im Kern.
  - *Achse A, Material (wie reagiert der Film auf viel Licht):* Sandwich/Bipack (dunkler, Schatten bleiben stehen, gut bei Schnee) ← Graufilter (gleich hell, Stehendes satt, Bewegtes wird Nebel) → Umkehrfilm mit Schulter (heller, Lichter glühen und breiten sich aus, ohne hart ins Weiss zu laufen) → hinter einem Strich: Solarisation (Überbelichtetes kippt ins Dunkle, höchstes Digital-Risiko). Variante: nur Veränderung belichtet (Bewegungsbelichtung, 4).
  - *Achse B, Gedächtnis (wer bleibt):* das Erste brennt sich ein (Film erschöpft) – alle gleich – das Neueste (Altes verblasst). Das Neueste ist die Mehrumlauf-Blende: Blende über 360° hinaus, Akkumulation klingt über mehrere Bilder nach, ab 360° werden die Schlieren schwächer, Strich auf dem Fader bei 360°.
  - *Offen:* Welche Materialien am besten sind, zeigt erst der Kontaktbogen. Ob das Stapeln im Greifer (Runde 1b) später dasselbe Material benutzt: Kopplung, Schritt 2.
  - *Technik:* Lange Stapel brauchen höhere Genauigkeit (WebGL mit Half-Float), sonst Farbstufen und eingefrorene Geister. Solarisation kann bei schwankendem Licht pulsieren.
- **Nachtverarbeitung (18):** Dasselbe Nachklingen wie beim Stehenden Film (Gedächtnis „das Neueste“), aber automatisch nach Licht: je dunkler, desto länger. Der „digitale Antrieb“ derselben Mechanik wie 1.
- **Zeitkamm (3):** Bild in breite Streifen, jeder Streifen zeigt einen etwas anderen Moment.
- **Bewegungsbelichtung (4):** Neues Licht nur dort, wo sich etwas bewegt.
- **Bildstrich als Zeitnaht (8):** Oberhalb des rollenden Bildstrichs ein etwas früherer Moment.
- **Unterdreht überarbeiten:** wirkt noch wie „TikTok-Vorspulen“. Ideen: lange Belichtung plus Kamerabewegung (Marie Menken), Stösse (Mekas), Pixilation (McLaren). Maris klärt später, was genau nicht überzeugt.

## Kopierwerk (für geladenes Material, aber nicht darauf beschränkt)

- **Kopierdurchgänge (9):** Echos in festem Abstand wie McLarens Tanzfilm. Funktioniert vor dunklem Grund.
- **Schwelle „nur Lichter kopieren“:** wie harter Lith-Kopierfilm. Macht 9 auch bei mittlerem Licht brauchbar.

## Röhre (Video, 1970)

- **Röhre atmen (12, neu gefasst):** Bei hellen Szenen wird das Bild etwas grösser und zieht sich langsam zurück, weil die Hochspannung nachgibt. Maris: „Genau so Bildeffekte suchen wir.“ Kandidat für eine frühe Runde.
- Nachleuchten der Röhre, sichtbare Zeilen: noch offen, ob das zu sehr nach Overlay aussieht.

## Licht

- **Blitz und Strobo:** Die Taschenlampe des iPhones brennt nur, solange die Blende offen ist, getaktet auf die aktuellen fps. Jedes Kurbelbild friert die Bewegung ein, wie Edgertons Stroboskop. Der Film flackert nicht, der Raum schon. **Vorsicht:** 4–12 Hz liegt genau im Bereich, der für Kopfweh und lichtempfindliche Menschen heikel ist, deshalb weich an- und ausblenden statt hart blitzen und einen deutlichen Hinweis zeigen. **Zuerst klären:** Lässt Safari auf dem iPhone die Taschenlampe überhaupt ansteuern (`torch` als Kamera-Einstellung), und wie schnell schaltet sie?

## Gehäuse und Kopplungen (Schritt 2)

- **Kameramodelle als Gehäuse:** Bolex, Telefon, Kopierwerk, Röhre. Jedes mit eigener Belegung rechts und eigenen Grundwerten. Siehe `docs/KONZEPT.md`, Teil 4.
- **Kopplungen zwischen Modulen und Doppelfunktionen:** Welche Module bedingen sich gegenseitig? Erst angehen, wenn die Module einzeln abgenommen sind.
- **Ein Instrument mit allen Funktionen** als langfristiges Ziel.

## Sonstiges

- **Objektiv-Charakter:** Mitte scharf, Ränder weich.
- **Einzeldatei zum Mitnehmen:** Skript, das alles in eine HTML-Datei packt.
- **Automatisch in einen Ordner „Mekas“ sichern:** aus dem Browser nicht möglich. Weg über einen iOS-Kurzbefehl.
- **Gangart des Greifers (6):** unregelmässiger Rhythmus als Metrum, eventuell im Tempo eines Stücks.
- **Linsenwechsel (16):** Beim Zoomen springt das Bild leicht, weil eine andere Kamera übernimmt.

## Aufgefallen in Runde 0 (2026-10-09, nicht auf der Karte, deshalb nicht angefasst)

- **Labor: geteilte Ansicht** (links mit, rechts ohne Modul). Braucht die Kette zweimal pro Bild. Erst, wenn klar ist, wie viel Rechenzeit das iPhone übrig hat.
- **Greifer-Pad und Blendenfader liegen über dem Einstellungsblatt** (auf dem Handy rechts unten). War in der alten `mekas.html` schon so.
- **Veraltete Meldungen:** „Öffne die Datei direkt im Browser“ (Kamera gesperrt, Sichern) stammt aus der Zeit vor GitHub Pages. Die Texte im Menü sind schon angepasst.
- **Seitliches Spiel im Filmkanal** (Runde 1b, Labor-Schalter): war kaum zu sehen und ist wieder raus. Falls es fehlt: grösserer Weg, nur bei kräftigem seitlichem Stoss.
