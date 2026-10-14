// Lith (ein Film, Rezept der Gedächtnis-Schicht), Runde 4b: harter Film mit steiler Kennlinie im Lith-Entwickler.
// Schwaches Licht geht verloren: Jede Teilbelichtung belichtet erst über einer Schwelle, darunter gar nichts, auch über
// lange Zeit nicht (Schwarzschild). Für Rot ist der Film fast blind: Rücklichter verschwinden, das Rot zählt nicht mit.
// Im Lith-Entwickler kommt die Entwicklung erst nach einer Anlaufzeit in Gang und steckt dann die Nachbarn an: Wo es schon
// schwarz ist, wird die Umgebung mitgerissen. Die Schwärzung wächst aus den Schatten in die Mitten, solange das Bild an
// dieser Stelle gleich bleibt (Haltezeit = Entwicklungszeit). Sie hebt dort die Schwelle an: Was vorher knapp darüber lag,
// fällt ins Schwarz, die dunkleren Stellen zuerst. So kommen die Klumpen und die harten, gewachsenen Kanten aus dem Bild
// selbst, nicht aus Rauschen. Ändert sich das Bild an einer Stelle (Bewegung, neues Licht), bildet sich die Schwärzung dort
// und rundherum weich zurück und der Anlauf beginnt von vorn: Bewegt bleibt kein Fleck im Bildfenster stehen.
// Die Lichter laufen weich in eine Schulter aus und werden nie flächig weiss.
// Die Maschine steht in kern/gedaechtnis.js, hier nur das Rezept.
import { sammeltNeu } from '../kern/sammeln.js?v=2.4.0';

const TEILER = 4;          // ein Zustand pro 4×4 Bildpunkte. Die Kanten kommen ohnehin aus dem Bild (Schwelle pro Bildpunkt)
const SELBST = 0.5;        // wie stark ein Schatten von selbst anfängt (die Nachbarn stecken mit 1 an). Nur was unter der Schwelle
                           // liegt, fängt von selbst an, die Mitten nur durch Ansteckung: So wachsen die Schatten als Fronten
const TRAEG = 0.3;         // s: so träge folgt das latente Bild dem Licht. Daran misst der Film, ob sich das Bild bewegt
const BEWEGT = [0.03, 0.1];// so weit weicht das Licht vom latenten Bild ab (Helligkeit 0–1, wie gesehen), bis es als neu gilt.
                           // Darunter: Rauschen, schwankendes Licht, Zittern der Hand in Flächen
const KLAR = 6;            // pro s: so schnell bildet neues Licht die Schwärzung zurück (etwa 0,2–0,5 s, weich, kein Sprung)
const KLAR_ANLAUF = 20;    // pro s: so schnell setzt neues Licht den Anlauf zurück. Schneller als die Schwärzung: Während sich das
                           // Bild bewegt, wächst nichts
const NACHHALL = 0.2;      // s: so lange gilt eine Stelle noch als bewegt. Bewegung steckt die Nachbarn an (Reichweite): Wo ein
                           // Schwenk über eine gleichmässige Wand zufällig gleich helle Stellen trifft, bleibt sonst die alte
                           // Schwärzung als Fleck im Bildfenster stehen
const WEISS = 0.85;        // Schulter: so hell wird das hellste Licht höchstens (linear, etwa 92 % auf dem Bildschirm)
const GEWINN = 1.6;        // was über der Schwelle liegt, kommt so viel heller an, bevor die Schulter es weich abfängt

export default {
  id: 'lith',
  titel: 'Lith',
  station: 'emulsion',
  an: false,
  params: {
    schwelle: { min: 0.02, max: 0.8, def: 0.2, schritt: 0.005, titel: 'Schwelle (Helligkeit, linear, ab der der Film belichtet; darunter bleibt es schwarz)' },
    haerte: { min: 1, max: 12, def: 4, schritt: 0.1, titel: 'Härte (wie steil es über der Schwelle hell wird: 1 weich, 12 fast ein Schalter)' },
    ansteckung: { min: 0, max: 3, def: 1, schritt: 0.05, titel: 'Ansteckung (wie schnell die Schwärzung wächst und die Nachbarn mitreisst)', einheit: ' /s' },
    anlauf: { min: 0, max: 10, def: 1, schritt: 0.1, titel: 'Anlauf (so lange muss das Bild an einer Stelle ruhig sein, bis die Entwicklung dort in Gang kommt)', einheit: ' s' },
    tiefe: { min: 0, max: 3, def: 1, schritt: 0.05, titel: 'Tiefe (wie weit die Schatten in die Mitten wachsen: ganz geschwärzt liegt die Schwelle so viel höher)' },
    reichweite: { min: 0.002, max: 0.1, def: 0.015, schritt: 0.001, titel: 'Reichweite (wie weit eine Stelle ihre Nachbarn ansteckt, Anteil der Bildbreite)' },
    rot: { min: 0, max: 1, def: 0.1, schritt: 0.01, titel: 'Rotempfindlichkeit (0 blind für Rot, 1 wie das Auge)' },
    ton: { min: 0, max: 1, def: 0, schritt: 0.01, titel: 'Ton (warme Lichter wie ein Lith-Abzug)' },
  },
  rezept: {
    reichweite: p => p.reichweite,
    teiler: TEILER,
    // Zustand: x = Schwärzung (0 frisch, 1 ganz entwickelt), y = Anlauf (0–1, wie lange das Bild hier schon ruhig ist),
    // z = latentes Bild (Helligkeit, wie der Film sie sieht, 0–1 wie gesehen), w = Bewegung (0–1, klingt in NACHHALL ab)
    start: [0, 0, 0, 0],
    zustand: `
float filmY(vec3 L){ vec3 e = vec3(0.2126 * p_rot, 0.7152, 0.0722); return dot(L, e) / (e.r + e.g + e.b); }
vec4 zustand(vec4 z, vec4 nb, vec3 L, float licht, float dt, float ruehren){
  float s = z.x, a = z.y, m = z.z, neu = 0.0;
  if (licht > 0.0){                                                   // nur was Licht bekam, zählt (bei zuer Blende steht das Bild)
    float g = pow(max(filmY(L), 0.0), 1.0 / 2.2);
    neu = smoothstep(${BEWEGT[0]}, ${BEWEGT[1]}, abs(g - m));             // hat sich das Bild hier geändert?
    m += (g - m) * (1.0 - exp(-dt / ${TRAEG.toFixed(2)}));
  }
  float w = max(neu, z.w * exp(-dt / ${NACHHALL.toFixed(2)}));
  float bewegt = max(neu, min(1.0, 2.0 * nb.w));                      // hier oder rundherum bewegt
  s *= exp(-${KLAR.toFixed(1)} * bewegt * dt);                                     // neues Licht bildet die Schwärzung zurück
  a *= exp(-${KLAR_ANLAUF.toFixed(1)} * bewegt * dt);                              // und der Anlauf beginnt von vorn
  a = min(1.0, a + dt / max(p_anlauf, 0.01));                         // die Zeit läuft: der Anlauf kommt voran
  float x = pow(m, 2.2) / p_schwelle;                                 // das latente Licht hier, gemessen an der Schwelle
  float bereit = 1.0 - smoothstep(0.6, 1.0 + p_tiefe, x);             // wie leicht es hier ins Schwarz gezogen wird: dunkel ganz, Lichter nie
  float los = smoothstep(0.5, 1.0, a);                                // nach dem Anlauf
  float dunkel = 1.0 - smoothstep(0.4, 1.0, x);                       // ein Schatten: liegt schon unter der Schwelle
  float quelle = ${SELBST.toFixed(2)} * dunkel + nb.x;                              // von selbst (Schatten) und angesteckt von den Nachbarn
  s = 1.0 - (1.0 - s) * exp(-p_ansteckung * los * bereit * quelle * dt);
  return vec4(clamp(s, 0.0, 1.0), a, m, w);
}`,
    // wie viel vom Licht der Film annimmt: erst über der Schwelle (die Schwärzung hebt sie an), steil, aber weich, dann eine
    // Schulter. Die Farbe bleibt (ein Faktor für alle drei), nur die Schwelle sieht das Licht ohne Rot.
    wirkung: `
vec3 wirkung(vec4 z, vec3 L){
  vec3 e = vec3(0.2126 * p_rot, 0.7152, 0.0722);
  float yf = dot(L, e) / (e.r + e.g + e.b), yl = dot(L, vec3(0.2126, 0.7152, 0.0722));
  float T = p_schwelle * (1.0 + p_tiefe * clamp(z.x, 0.0, 1.0));
  float tor = smoothstep(1.0, 1.0 + 2.0 / p_haerte, yf / T);
  float v = yl * tor * ${GEWINN.toFixed(2)};
  float aus = ${WEISS.toFixed(2)} * (1.0 - exp(-v / ${WEISS.toFixed(2)}));
  float f = tor * ${GEWINN.toFixed(2)} * (v > 1e-4 ? aus / v : 1.0);
  return vec3(f) * mix(vec3(1.0), vec3(1.08, 0.98, 0.84), p_ton * smoothstep(0.0, 0.5, aus));
}`,
  },
  hinweis(){ return sammeltNeu() ? null : 'Lith braucht das neue Sammeln'; },
};
