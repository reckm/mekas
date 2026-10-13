// Müder Entwickler (ein Film, Rezept der Gedächtnis-Schicht): Wo viel Licht auf den Film fällt, verbraucht sich der Entwickler.
// Frischer fliesst langsam aus der Umgebung und aus dem Tank nach, Anstossen rührt (sofort frisch). Ruhig halten ist
// Standentwicklung. Grosse helle Flächen dämpfen sich selbst, kleine Lichter bleiben hell, hinter Bewegtem bleibt eine
// dunkle Spur, die sich in Sekunden erholt. Die Maschine steht in kern/gedaechtnis.js, hier nur das Rezept.
import { sammeltNeu } from '../kern/sammeln.js?v=1.2.6';

const BODEN = 0.35;       // so viel nimmt der Film auch mit ganz erschöpftem Entwickler noch an: nichts wird schwarz
const RUEHREN = 6;        // wie schnell ein Stoss frischen Entwickler bringt (pro s und Rührstärke)
const AUSGLEICH = 4;      // wie schnell sich eine Stelle mit ihren Nachbarn ausgleicht (pro s)

export default {
  id: 'muederentwickler',
  titel: 'Müder Entwickler',
  station: 'emulsion',
  an: 'labor',
  params: {
    verbrauch: { min: 0, max: 8, def: 3, schritt: 0.1, titel: 'Verbrauch (wie schnell helles Licht den Entwickler aufbraucht)' },
    erholung: { min: 0.3, max: 10, def: 2, schritt: 0.1, titel: 'Erholung (frischer aus dem Tank)', einheit: ' s' },
    reichweite: { min: 0, max: 0.15, def: 0.04, schritt: 0.005, titel: 'Reichweite (wie weit frischer Entwickler nachfliesst, Anteil der Bildbreite)' },
  },
  rezept: {
    reichweite: p => p.reichweite,
    // Zustand: x = Entwickler an dieser Stelle, 1 = frisch
    zustand: `
vec4 zustand(vec4 z, vec4 nb, vec3 L, float licht, float dt, float ruehren){
  float d = z.x;
  float y = dot(L, vec3(0.2126, 0.7152, 0.0722));
  d -= p_verbrauch * y * y * licht * d;                                  // Licht verbraucht Entwickler, vor allem helles (Mitteltöne kaum)
  d = mix(d, nb.x, 1.0 - exp(-${AUSGLEICH.toFixed(1)} * dt));                     // er gleicht sich mit den Nachbarn aus
  d += (1.0 - d) * (1.0 - exp(-dt / p_erholung));                        // frischer aus dem Tank
  d += (1.0 - d) * (1.0 - exp(-${RUEHREN.toFixed(1)} * ruehren * dt));          // Rühren
  return vec4(clamp(d, 0.0, 1.0), 0.0, 0.0, 1.0);
}`,
    // wie viel vom Licht der Film annimmt: mit frischem Entwickler alles, erschöpft noch den Boden
    wirkung: `
vec3 wirkung(vec4 z, vec3 L){ return vec3(${BODEN.toFixed(2)} + ${(1 - BODEN).toFixed(2)} * z.x); }`,
  },
  hinweis(){ return sammeltNeu() ? null : 'Müder Entwickler braucht das neue Sammeln'; },
};
