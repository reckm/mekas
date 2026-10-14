// Röhre atmen: Bei hellen Szenen wird das Bild grösser und zieht sich langsam zurück (die Hochspannung gibt nach).
// Platzhalter, gebaut in Runde 4 (Karte in MODULE.md).
// ZWISCHENSTAND (Entwurf, noch nicht gebaut): pro neuem Kurbelbild (höchstens alle 60 ms) bild.quelle auf 64×36 verkleinern,
// Mittel des linearen Lichts zum Quadrat (grosse helle Flächen zählen), zwei asymmetrische Tiefpässe hintereinander
// (Wachsen / Zurück, kein Nachschwingen), lage.s *= 1 + Stärke × Helligkeit. Regler: Stärke (%), Wachsen (s), Zurück (s).
export default {
  id: 'roehreatmen',
  titel: 'Röhre atmen',
  station: 'projektor',
  an: false,
  params: {},
};
