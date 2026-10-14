// Müder Entwickler (ein Film, Rezept der Gedächtnis-Schicht), Runde 2c: das Nachbild.
// Helles Licht verbraucht den Entwickler an seiner Stelle im Bildfenster, schnell und fast ganz. Was danach an diese Stelle
// fällt, wird kaum noch entwickelt: Schwenkt man von einem hellen Fenster weg, bleibt es als dunkles, weiches Nachbild fest
// im Bildfenster stehen, über allem, was danach kommt, und verblasst über Sekunden, weil frischer Entwickler aus dem Tank
// nachkommt. Helles, das sich bewegt, zieht dunkle Spuren. Anstossen rührt: die Nachbilder hellen weich auf.
// Die Maschine steht in kern/gedaechtnis.js, hier nur das Rezept.
import { sammeltNeu } from '../kern/sammeln.js?v=2.4.0';

const AUSGLEICH = 0.3;      // wie schnell sich eine Stelle mit ihren Nachbarn (Reichweite) ausgleicht, pro s. Langsam: Das Nachbild steht
                            // zuerst klar und wird beim Verblassen weich, kleine Nachbilder verlaufen schneller als grosse
const RUEHREN = 7;          // wie stark Rühren die Erschöpfung wegnimmt (pro s und Rührstärke): ein voller Stoss holt etwa 85 % zurück
const RUEHR_ANLAUF = 0.3;   // s, zweimal hintereinander: Rühren kommt weich in Gang, das Nachbild hellt in etwa 0,5–1 s auf, ohne Sprung
const POTENZ = 4;           // helle Punkte zählen mehr (Potenzmittel über den Block): auch kleine Lampen brennen ein
const TEILER = 4;           // ein Zustand pro 4×4 Bildpunkte. Mit 8×8 hatten tief eingebrannte Flächen einen hellen Rand wie ein Filter
const STEIL = 2;            // erschöpfter Entwickler arbeitet überproportional schwach: die Wirkung geht mit dem Quadrat des Entwicklers.
                            // So wird das Nachbild fast schwarz und bleibt einige Sekunden tief, bevor es verblasst

export default {
  id: 'muederentwickler',
  titel: 'Müder Entwickler',
  station: 'emulsion',
  an: 'labor',
  params: {
    verbrauch: { min: 0, max: 25, def: 9, schritt: 0.1, titel: 'Verbrauch (wie schnell helles Licht den Entwickler aufbraucht)' },
    erholung: { min: 0.3, max: 30, def: 9.6, schritt: 0.1, titel: 'Erholung (frischer aus dem Tank: so lange verblasst das Nachbild)', einheit: ' s' },
    reichweite: { min: 0, max: 0.25, def: 0.15, schritt: 0.002, titel: 'Reichweite (wie weit frischer Entwickler nachfliesst, Anteil der Bildbreite: das Nachbild wird weich)' },
    boden: { min: 0, max: 0.5, def: 0.09, schritt: 0.01, titel: 'Boden (so viel nimmt ganz erschöpfter Film noch an)' },
    kurve: { min: 1, max: 4, def: 3, schritt: 0.1, titel: 'Kurve (welches Licht einbrennt: 1 auch die Mitten, 4 nur die Lichter)' },
  },
  rezept: {
    reichweite: p => p.reichweite,
    teiler: TEILER,
    potenz: POTENZ,
    // Zustand: x = Erschöpfung an dieser Stelle (0 = frischer Entwickler, 1 = ganz verbraucht), y und z = Rühren, wie es in Gang kommt.
    // Gespeichert wird die Erschöpfung, nicht der Entwickler: Sie erholt sich gegen 0, dort sind 16 Bit fein genug.
    // Gegen 1 blieben die kleinen Schritte stecken (gemessen: bei Erholung 8 s bleibt der Entwickler bei 88 %, bei 30 s bei 56 %
    // stehen, ein Geist, der nie verschwindet).
    start: [0, 0, 0, 1],
    zustand: `
vec4 zustand(vec4 z, vec4 nb, vec3 L, float licht, float dt, float ruehren){
  float e = z.x, r1 = z.y, r2 = z.z, k = 1.0 - exp(-dt / ${RUEHR_ANLAUF.toFixed(2)});
  float y = dot(L, vec3(0.2126, 0.7152, 0.0722));
  e = 1.0 - (1.0 - e) * exp(-p_verbrauch * pow(y, p_kurve) * licht);     // Licht verbraucht Entwickler, je nach Kurve vor allem helles
  e = mix(e, nb.x, 1.0 - exp(-${AUSGLEICH.toFixed(1)} * dt));                        // er gleicht sich mit den Nachbarn aus
  e *= exp(-dt / p_erholung);                                               // frischer aus dem Tank
  r1 += (ruehren - r1) * k; r2 += (r1 - r2) * k;                            // Rühren kommt weich in Gang
  e *= exp(-${RUEHREN.toFixed(1)} * r2 * dt);                                           // und bringt frischen Entwickler
  return vec4(clamp(e, 0.0, 1.0), r1, r2, 1.0);
}`,
    // wie viel vom Licht der Film annimmt: mit frischem Entwickler alles, erschöpft noch den Boden
    wirkung: `
vec3 wirkung(vec4 z, vec3 L){ return vec3(p_boden + (1.0 - p_boden) * pow(1.0 - z.x, ${STEIL.toFixed(1)})); }`,
  },
  hinweis(){ return sammeltNeu() ? null : 'Müder Entwickler braucht das neue Sammeln'; },
};
