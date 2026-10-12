// Anstossen: Stösse an die Kamera, vom Greifer-Pad (Tippen) und vom Gyroskop (ein Ruck mit dem Telefon).
// Jedes Animationsbild steht die Summe der Stösse in ctx.stoss { x, y } (Bilder pro Sekunde, y nach oben).
// Welche Module darauf reagieren und wie stark, entscheiden sie selbst.
import { ctx } from './zustand.js?v=1.2.3';
import { frage, hoere, drehung, bewegungStatus } from './bewegung.js?v=1.2.3';
export { bewegungStatus };

export const anstoss = {
  id: 'anstossen',
  titel: 'Anstossen',
  params: {
    pad: { min: 0, max: 40, def: 14, schritt: 0.5, titel: 'Stärke Pad', einheit: ' Bilder/s' },
    gyro: { min: 0, max: 0.4, def: 0.1, schritt: 0.005, titel: 'Empfindlichkeit Gyroskop (Stärke eines harten Rucks)' },
    schwelle: { min: 10, max: 800, def: 30, schritt: 10, titel: 'Schwelle Gyroskop (darunter zählt nichts)', einheit: '°/s' },
    nurMitFinger: { typ: 'schalter', def: false, titel: 'Gyroskop nur mit Finger auf dem Pad' },
  },
  anzeige: { gyro: 0, spitze: 0, spitzeT: 0, letzter: 0, daten: 0 },   // fürs Labor: Ruck jetzt und höchster der letzten 3 s (°/s), letzter Stoss, Anzahl Sensordaten
};

let offen = { x: 0, y: 0 };
// Tippen aufs Pad: Richtung und Stärke vom Mittelpunkt zum Finger, beide Achsen -1..1
export function padStoss(nx, ny){
  const s = anstoss.p.pad;
  offen.x += nx * s; offen.y += ny * s;
  anstoss.anzeige.letzter = Math.hypot(nx, ny) * s;
}
// die Kette holt die Stösse einmal pro Animationsbild ab
export function holeStoss(){ ctx.stoss = offen; offen = { x: 0, y: 0 }; }

/* ---------- Gyroskop: ein Ruck, nicht die Neigung ---------- */
// hochpassgefiltert: ruhiges Halten und langsames Schwenken bleiben unter der Schwelle, ein Schlag geht drüber
// weich: kleine Rucke wirken schon, grosse sättigen (ein harter Ruck reicht knapp ins nächste Bild)
const wucht = (mag, p) => mag <= p.schwelle ? 0 : p.gyro * 120 * (1 - Math.exp(-(mag - p.schwelle) / 200));
let lp = { u: 0, r: 0, a: 0 }, spitze = null, sperre = 0, zuletzt = 0;
function onMotion(e){
  const d = drehung(e); if (!d) return;
  const an = anstoss.anzeige; an.daten++;
  const dt = Math.min(0.05, (e.interval > 1 ? e.interval / 1000 : e.interval) || 0.016);
  const k = 1 - Math.exp(-dt / 0.2);
  lp.u += (d.up - lp.u) * k; lp.r += (d.right - lp.r) * k; lp.a += (d.um - lp.a) * k;
  const hu = d.up - lp.u, hr = d.right - lp.r, ha = d.um - lp.a, mag = Math.hypot(hu, hr, ha);
  const jetzt = performance.now();
  an.gyro = Math.max(mag, an.gyro * 0.97);
  if (mag > an.spitze || jetzt - an.spitzeT > 3000){ an.spitze = mag; an.spitzeT = jetzt; }
  const p = anstoss.p;
  if (p.gyro <= 0) return;
  // innerhalb der Sperre zählt nur, was stärker ist als der letzte Stoss (eine kleine Bewegung vor dem Ruck verschluckt ihn nicht)
  const boden = jetzt < sperre ? Math.max(p.schwelle, zuletzt) : p.schwelle;
  if (mag > boden && (!spitze || mag >= spitze.mag)){ spitze = { mag, hu, hr, ha, boden }; return; }   // steigt noch: auf die Spitze warten
  if (!spitze) return;
  // Spitze vorbei: ein Stoss, so stark wie der Ruck über der Schwelle (bzw. über dem letzten Stoss).
  // Jeder Ruck wirft den Film im Kanal, die Richtung kommt von der stärksten Achse.
  const staerke = wucht(spitze.mag, p) - wucht(spitze.boden, p);
  const achsen = [[Math.abs(spitze.hr), -Math.sign(spitze.hr)], [Math.abs(spitze.hu), Math.sign(spitze.hu)], [Math.abs(spitze.ha), Math.sign(spitze.ha)]];
  const richtung = achsen.sort((x, y) => y[0] - x[0])[0][1] || 1;
  if (!p.nurMitFinger || ctx.eingabe.padFinger){
    offen.y += richtung * staerke; offen.x += spitze.hu / spitze.mag * staerke;
    an.letzter = staerke;
  }
  zuletzt = spitze.mag; spitze = null; sperre = jetzt + 250;
}

let gemeldet = false;
export function initAnstoss(){
  hoere(onMotion);
  // den Sensor beim ersten Tipp ins Spiel freigeben (nicht auf der Startkarte und in Blättern, dort fragen schon Kamera und Mikrofon)
  ['touchend', 'click'].forEach(ev => document.addEventListener(ev, e => {
    if (anstoss.p.gyro <= 0 || (e.target && e.target.closest && e.target.closest('#startcard, .sheet'))) return;
    frage().then(s => {
      if (s === 'gesperrt' && !gemeldet){ gemeldet = true; ctx.sag('Der Bewegungssensor ist gesperrt, Anstossen geht nur übers Pad. Safari fragt erst wieder nach dem Löschen der Website-Daten (Einstellungen › Apps › Safari › Erweitert › Website-Daten).', true); }
    });
  }, true));
}
