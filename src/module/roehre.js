// Röhre (ein Film, Rezept der Gedächtnis-Schicht): Nachleuchten und Blooming einer Röhrenkamera.
// Platzhalter, gebaut in Runde 4 (Karte in MODULE.md).
// ZWISCHENSTAND (Entwurf, noch nicht gebaut):
//   Zustand (4 Kanäle, Teiler 4, Potenz 4, Start 0):
//     x = N: Ladung, Leuchtdichte, springt sofort hoch auf das Licht, fällt mit Nachleuchten (s), im Dunkeln länger
//     y = C: Leuchtdichte des Blocks beim letzten Schritt mit Licht. Bei geschlossener Blende (licht = 0) bleibt C, nur N fällt
//     z = E: Überladung (Leuchtdichte), lädt sättigend aus dem Licht über der Schwelle (× licht), fällt mit Schweif (s),
//            gleicht sich mit den Nachbarn aus (Blooming, Reichweite)
//     w = E_r − E_b der Überladung (warm/kalt), damit Schweife die Farbe der Lampe tragen; Grün aus (R + B) / 2
//   zuschlag = (N − C)₊ grau (kurzes Nachleuchten, ruhig genau 0, weil N = C) + Farbe(E, w) (Schweife, Blooming, Einbrennen)
//   wirkung = 1. Kein Rühren.
export default {
  id: 'roehre',
  titel: 'Röhre',
  station: 'emulsion',
  an: false,
  params: {},
};
