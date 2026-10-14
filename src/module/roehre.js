// Röhre (ein Film, Rezept der Gedächtnis-Schicht), Runde 4a: Nachleuchten, Schweife und Blooming einer Röhrenkamera.
// In einer Röhrenkamera (Vidicon, Plumbicon) fällt das Bild auf eine Schicht, die Ladung speichert. Der Elektronenstrahl liest
// sie Bild für Bild aus und löscht sie dabei nicht ganz: Ein Rest von dem, was eben noch da war, erscheint im nächsten Bild noch
// einmal und klingt in einer Zehntelsekunde aus, wo es dunkel ist länger. Zu helles Licht überlädt die Schicht. Der Strahl
// liest pro Bild nur so viel, wie er Platz hat: Wo jetzt helles Licht liegt, hat er keinen, dort bleibt die Überladung liegen
// (ruhig gehalten ändert sich nichts). Wird es dort dunkel, liest er sie über viele Bilder aus: bewegte Lichter ziehen leuchtende
// Schweife, lange gehaltene brennen ein und leuchten nach dem Wegschwenken weiss nach. Die Überladung läuft in die Nachbarschaft
// (Blooming): helle Lichter werden grösser und weicher.
// Die Maschine steht in kern/gedaechtnis.js, hier nur das Rezept. Der Film nimmt jedes Licht ganz an (Wirkung 1) und gibt mit dem
// Zuschlag das Nachleuchten dazu. Ein ruhendes Bild bleibt so hell wie ohne Film, nur um die Lichter herum leuchtet die Überladung.
import { sammeltNeu } from '../kern/sammeln.js?v=2.4.0';

const POTENZ = 4;           // helle Punkte zählen mehr (Potenzmittel über den Block): auch kleine Lichter überladen
const TEILER = 4;           // ein Zustand pro 4×4 Bildpunkte
const LADEN = 8;            // so schnell lädt Licht über der Schwelle die Überladung (pro s Licht bei voller Überladung)
const AUSGLEICH = 4;        // so schnell läuft die Überladung in die Nachbarschaft (pro s): Blooming und weiche Schweife
const DUNKEL_BIS = 0.05;    // unter dieser Helligkeit (linear) gilt eine Stelle als dunkel: dort leuchtet es länger nach
const LEER = 0.03;          // der Strahl nimmt in jedem Bild auch einen festen kleinen Rest mit (pro s, wo er Platz hat): Schweife und
                            // Blooming enden nach endlicher Zeit, statt als schwacher Schleier lange stehen zu bleiben
const NACH_LEER = 0.3;      // dasselbe für das kurze Nachleuchten (pro s): auch Mitten sind nach etwa 0,2 s weg
const Y = 'vec3(0.2126, 0.7152, 0.0722)';

// in beiden GLSL-Stücken gleich: die Schwelle der Überladung (linear), wie lange es an dieser Stelle nachleuchtet (dunkel
// länger) und wie viel Platz der Strahl hat: Er liest höchstens bis zur Schwelle aus, wo jetzt helleres Licht liegt, nichts.
// So ist ein Schweif oder ein Hof nie heller als das Licht, aus dem er kommt.
const GEMEINSAM = `
float roehreS(){ return pow(max(p_ab, 0.05), 2.2); }
float roehreDunkel(float c){ return mix(p_dunkel, 1.0, smoothstep(0.0, ${DUNKEL_BIS.toFixed(3)}, c)); }
float roehrePlatz(float y){ return max(0.0, roehreS() - y); }`;

export default {
  id: 'roehre',
  titel: 'Röhre',
  station: 'emulsion',
  an: false,
  params: {
    nachleuchten: { min: 0, max: 0.5, def: 0.04, schritt: 0.01, titel: 'Nachleuchten (so lange bleibt ein Rest von allem, was eben noch da war)', einheit: ' s' },
    dunkel: { min: 1, max: 6, def: 2, schritt: 0.1, titel: 'Im Dunkeln länger (so viel länger leuchtet es nach, wo es dunkel ist)', einheit: ' ×' },
    ab: { min: 0.3, max: 1, def: 0.8, schritt: 0.01, titel: 'Überladung ab (so hell muss ein Licht sein, damit es die Schicht überlädt, 1 = nie)' },
    schweif: { min: 0.05, max: 3, def: 0.25, schritt: 0.01, titel: 'Schweif (so lange klingt der Schweif eines Lichts aus)', einheit: ' s' },
    einbrennen: { min: 0, max: 6, def: 1, schritt: 0.1, titel: 'Einbrennen (so lange leuchtet ein lange gehaltenes Licht nach dem Wegschwenken hell nach)', einheit: ' s' },
    blooming: { min: 0, max: 0.1, def: 0.012, schritt: 0.002, titel: 'Blooming (so weit läuft die Überladung in die Nachbarschaft, Anteil der Bildbreite)' },
  },
  rezept: {
    reichweite: p => p.blooming,
    teiler: TEILER,
    potenz: POTENZ,
    start: [0, 0, 0, 0],
    // Zustand: x = N, Ladung für das kurze Nachleuchten (springt sofort auf das Licht, fällt mit Nachleuchten),
    //          y = C, das Licht dieser Stelle beim letzten Kamerabild mit offener Blende. Ruhig ist N = C: kein Nachleuchten.
    //          z = Q, die Überladung (Licht × s, höchstens Einbrennen × Schwelle), w = ihre Farbe (warm +, kalt −).
    zustand: `${GEMEINSAM}
vec4 zustand(vec4 z, vec4 nb, vec3 L, float licht, float dt, float ruehren){
  float N = z.x, C = z.y, Q = z.z, w = z.w;
  if (licht > 0.0) C = dot(L, ${Y});
  float dunkel = roehreDunkel(C);
  // kurzes Nachleuchten: der Rest klingt aus, neues Licht lädt sofort
  N = max(0.0, N * exp(-dt / max(0.001, p_nachleuchten * dunkel)) - ${NACH_LEER.toFixed(2)} * dt);
  if (licht > 0.0) N = max(N, C);
  // die Überladung läuft in die Nachbarschaft
  float a = 1.0 - exp(-${AUSGLEICH.toFixed(1)} * dt);
  Q = mix(Q, nb.z, a); w = mix(w, nb.w, a);
  // der Strahl liest sie aus, so weit er hier Platz hat (wo helles Licht liegt, keinen)
  float S = roehreS(), platz = roehrePlatz(C);
  Q = max(0.0, Q - min(Q * (1.0 - exp(-dt / (p_schweif * dunkel))), platz * dt) - ${LEER.toFixed(3)} * platz / S * dt);
  // Licht über der Schwelle überlädt, in seiner Farbe
  if (licht > 0.0){
    float dq = ${LADEN.toFixed(1)} * clamp((C - S) / max(0.001, 1.0 - S), 0.0, 1.0) * licht;
    w = mix(w, (L.r - L.b) / (L.r + L.b + 0.01), dq / (Q + dq + 0.0001));
    Q = min(p_einbrennen * S, Q + dq);
  }
  return vec4(N, C, Q, w);
}`,
    wirkung: `
vec3 wirkung(vec4 z, vec3 L){ return vec3(1.0); }`,
    // das Licht, das die Schicht selbst dazugibt: der Rest von eben (grau) und die ausgelesene Überladung (in ihrer Farbe),
    // so viel der Strahl hier Platz hat
    zuschlag: `${GEMEINSAM}
vec3 zuschlag(vec4 z, vec3 L){
  float nach = max(0.0, z.x - z.y);
  float q = max(0.0, z.z) / (p_schweif * roehreDunkel(z.y));
  float r = min(q, roehrePlatz(dot(L, ${Y})));
  float w = clamp(z.w, -0.8, 0.8);
  return vec3(nach) + r * vec3(1.0 + w, 1.0, 1.0 - w) / (1.0 + 0.1404 * w);
}`,
  },
  hinweis(){ return sammeltNeu() ? null : 'Röhre braucht das neue Sammeln'; },
};
