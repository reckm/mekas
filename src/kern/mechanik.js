// Feste Masse der Kamera und kleine Helfer, ohne Abhängigkeiten.

export const REF_ANGLE = 135;     // Umlaufblende der Bolex; ohne Blende-Modul belichtet die Kette damit
export const ZOOM_MAX = 3;
export const TRANSPORT = 120;     // degrees of each cycle in which the claw pulls the film

export const clamp01 = v => Math.max(0, Math.min(1, v));
export const comma = s => String(s).replace('.', ',');
export const mmss = s => { s = Math.max(0, s); const m = Math.floor(s / 60); return m + ':' + comma((s - m * 60).toFixed(1)).padStart(4, '0'); };
export const mmssShort = s => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
export const fmtFps = f => f < 10 ? comma(f.toFixed(1)) : String(Math.round(f));

// how much of the open sector falls into the transport (both on a 360° circle)
export function transportOverlap(angle, phase){
  if (angle <= 0) return 0;
  const c = 240 + phase, a0 = c - angle / 2, a1 = c + angle / 2;
  let ov = 0;
  for (let k = -2; k <= 2; k++){ const t0 = 360 * k, t1 = t0 + TRANSPORT; ov += Math.max(0, Math.min(a1, t1) - Math.max(a0, t0)); }
  return Math.min(TRANSPORT, ov);
}
