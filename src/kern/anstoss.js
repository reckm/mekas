// Anstossen: Stösse an die Kamera, vom Greifer-Pad (Tippen) und vom Gyroskop (ein Ruck mit dem Telefon).
// Jedes Animationsbild steht die Summe der Stösse in ctx.stoss { x, y } (Bilder pro Sekunde, y nach oben).
// Welche Module darauf reagieren und wie stark, entscheiden sie selbst.
import { ctx } from './zustand.js?v=1.1.1';
import { frage, hoere, drehung } from './bewegung.js?v=1.1.1';

export const anstoss = {
  id: 'anstossen',
  titel: 'Anstossen',
  params: {
    pad: { min: 0, max: 40, def: 20, schritt: 0.5, titel: 'Stärke Pad', einheit: ' Bilder/s' },
    gyro: { min: 0, max: 0.2, def: 0.05, schritt: 0.005, titel: 'Empfindlichkeit Gyroskop' },
    schwelle: { min: 50, max: 800, def: 220, schritt: 10, titel: 'Schwelle Gyroskop (darunter zählt nichts)', einheit: '°/s' },
    nurMitFinger: { typ: 'schalter', def: false, titel: 'Gyroskop nur mit Finger auf dem Pad' },
  },
  anzeige: { gyro: 0, letzter: 0 },     // fürs Labor: Ruck jetzt (°/s) und Stärke des letzten Stosses
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
let lpU = 0, lpR = 0, spitze = null, sperre = 0;
function onMotion(e){
  const d = drehung(e); if (!d) return;
  const dt = Math.min(0.05, (e.interval > 1 ? e.interval / 1000 : e.interval) || 0.016);
  const k = 1 - Math.exp(-dt / 0.2);
  lpU += (d.up - lpU) * k; lpR += (d.right - lpR) * k;
  const hu = d.up - lpU, hr = d.right - lpR, mag = Math.hypot(hu, hr);
  anstoss.anzeige.gyro = Math.max(mag, anstoss.anzeige.gyro * 0.97);
  const p = anstoss.p, jetzt = performance.now();
  if (jetzt < sperre || p.gyro <= 0) return;
  if (mag > p.schwelle && (!spitze || mag >= spitze.mag)){ spitze = { mag, hu, hr }; return; }   // steigt noch: auf die Spitze warten
  if (!spitze) return;
  // Spitze vorbei: ein Stoss, so stark wie der Ruck über der Schwelle
  const f = (spitze.mag - p.schwelle) * p.gyro / spitze.mag;
  if (!p.nurMitFinger || ctx.eingabe.padFinger){
    offen.x += spitze.hu * f; offen.y -= spitze.hr * f;
    anstoss.anzeige.letzter = (spitze.mag - p.schwelle) * p.gyro;
  }
  spitze = null; sperre = jetzt + 250;
}

export function initAnstoss(){
  hoere(onMotion);
  // den Sensor beim ersten Tipp ins Spiel freigeben (nicht auf der Startkarte und in Blättern, dort fragen schon Kamera und Mikrofon)
  ['touchend', 'click'].forEach(ev => document.addEventListener(ev, e => {
    if (anstoss.p.gyro <= 0 || (e.target && e.target.closest && e.target.closest('#startcard, .sheet'))) return;
    frage();
  }, true));
}
