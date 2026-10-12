// Die Kette, durch die jedes Bild läuft: Takt → Quelle → Belichtung → Entwickeln → Transport → Projektor.
// Hier liegen die Liste der Module, ihre Werte und ihr Ein/Aus, das Sammeln des Lichts und die Hauptschleife.
import { ctx, intern, out, hold, acc, actx, tmp, expC, ectx, hctx, einst } from './zustand.js?v=1.2.2';
import { REF_ANGLE } from './mechanik.js?v=1.2.2';
import liste from '../module/liste.js?v=1.2.2';
import { anstoss, holeStoss } from './anstoss.js?v=1.2.2';
import { kurbelTick } from './kurbel.js?v=1.2.2';
import { sampleInto, sourceReady, syncFile } from './quelle.js?v=1.2.2';
import { aufnahmeTick, projiziere, aufnahmeAnzeige, neuesBild } from './aufnahme.js?v=1.2.2';
import { renderPad } from './bedienung.js?v=1.2.2';

export const STATIONEN = ['takt', 'quelle', 'belichtung', 'entwickeln', 'transport', 'projektor'];

/* ---------- Module: Werte, Ein/Aus, Rechenzeit ---------- */
export const module = liste;
export const kernteile = [anstoss];     // Werte des Kerns, die das Labor zeigt (nicht schaltbar)
for (const m of [...module, ...kernteile]){
  m.grund = m.an === 'labor' ? ctx.labor : m.an !== false; m.an = m.grund;   // 'labor': neu, nur im Labor an, bis Maris es abnimmt
  m.p = {}; for (const [n, d] of Object.entries(m.params || {})) m.p[n] = d.def;
  m.ms = 0; m._ms = 0;
}
export const modul = id => module.find(m => m.id === id) || kernteile.find(m => m.id === id);
export function wert(id, name){ const m = modul(id); return m ? m.p[name] : undefined; }
export function setze(id, name, v){
  const m = modul(id); if (!m || !m.params || !m.params[name]) return;
  const d = m.params[name];
  m.p[name] = d.typ === 'schalter' ? !!v : Math.max(d.min, Math.min(d.max, +v));
}
let vergleich = null;                 // Labor: dieses Modul gilt gerade als aus
export function vergleiche(id){ vergleich = id || null; intern.dirty = true; }
const aktiv = m => m.an && m.id !== vergleich;
export const istAn = id => { const m = modul(id); return !!m && aktiv(m); };
export function schalte(id, an){
  const m = modul(id); if (!m || m.an === !!an) return;
  m.an = !!an;
  if (m.an && m.ein) m.ein(ctx);
  intern.dirty = true;
}
// alle aktiven Module einer Station bearbeiten `bild`, mit gemessener Rechenzeit
export function station(name, bild){
  for (const m of module){
    if (m.station !== name || !m.apply || !aktiv(m)) continue;
    const t = performance.now(); m.apply(ctx, bild); m._ms += performance.now() - t;
  }
  return bild;
}
// ein Modul übernimmt das Halten (Stehender Film): die Kurbel dreht beim Halten weiter
export const haltenUebernommen = () => module.some(m => m.uebernimmtHalten && aktiv(m));
export const hatStation = name => module.some(m => m.station === name && m.apply && aktiv(m));
export function hinweise(){
  const h = [];
  for (const m of module) if (m.hinweis && aktiv(m)){ const s = m.hinweis(ctx); if (s) h.push(s); }
  return h;
}
export const zeiten = { sammeln: 0, zeichnen: 0, gesamt: 0 };
const roh = { sammeln: 0, zeichnen: 0 };
function zeitenNachfuehren(gesamt){
  for (const m of module){ m.ms += (m._ms - m.ms) * 0.1; m._ms = 0; }
  for (const k of ['sammeln', 'zeichnen']){ zeiten[k] += (roh[k] - zeiten[k]) * 0.1; roh[k] = 0; }
  zeiten.gesamt += (gesamt - zeiten.gesamt) * 0.1;
}

/* ---------- Bildgrösse ---------- */
export function setSize(w, h){
  const s = Math.min(1, einst.resCap / Math.max(w, h));
  ctx.W = Math.max(2, Math.round(w * s / 2) * 2); ctx.H = Math.max(2, Math.round(h * s / 2) * 2);
  for (const c of [out, hold, acc, tmp, expC]){ c.width = ctx.W; c.height = ctx.H; }
  for (const m of module) if (m.reset) m.reset(ctx);       // auch ausgeschaltete, damit sie beim Einschalten passen
  intern.have = false;
}
export function setup(){ for (const m of module) if (m.setup) m.setup(ctx); }
export function abbrechen(){ intern.offen = false; zyklus = null; intern.nextAt = 0; }

/* ---------- Belichtung: Zeit sammeln ---------- */
// one camera cycle: the open windows of the disc decide when light reaches the film
let zyklus = null, accN = 0;
function startExposure(now, T){
  const z = { t0: now, T, winkel: REF_ANGLE, fenster: [[0, T * REF_ANGLE / 360]], stops: 0, deckung: 1 };
  station('belichtung', z);
  ctx.belichtung = { winkel: z.winkel, T };
  const last = z.fenster[z.fenster.length - 1];
  z.ende = now + (last ? last[1] : 0);
  z.E = z.fenster.reduce((s, f) => s + (f[1] - f[0]), 0) / 1000;
  z.naechstes = 0;                     // erstes Fenster, das noch kein Licht bekommen hat
  zyklus = z; intern.offen = true; accN = 0;
}
function sampleExposure(now){
  const z = zyklus, rel = now - z.t0;
  // every window gets at least one sample, and every frame while a window is open adds one
  let neu = false;
  while (z.naechstes < z.fenster.length && rel >= z.fenster[z.naechstes][0]){ z.naechstes++; neu = true; }
  if (neu || z.fenster.some(f => rel >= f[0] && rel <= f[1])){
    const t = performance.now(); accN++; sampleInto(actx, 1 / accN, now); roh.sammeln += performance.now() - t;
  }
  if (now >= z.ende) closeShutter(now);
}
function closeShutter(now){
  const z = zyklus, { W, H } = ctx;
  // entwickeln: das gesammelte Licht wird zum Bild, danach blendet die Blende ab
  ectx.globalCompositeOperation = 'source-over'; ectx.globalAlpha = 1;
  ectx.drawImage(acc, 0, 0);
  station('entwickeln', { g: ectx, roh: acc, E: z.E, zyklus: z });
  ectx.globalCompositeOperation = 'source-over';
  if (z.deckung < 1){ ectx.globalAlpha = 1 - z.deckung; ectx.fillStyle = '#000'; ectx.fillRect(0, 0, W, H); }
  ectx.globalAlpha = 1;
  // transport: ohne Greifer liegt jedes Bild genau im Bildfenster
  hctx.globalCompositeOperation = 'source-over'; hctx.globalAlpha = 1; hctx.drawImage(expC, 0, 0);
  station('transport', { belichtet: expC, g: hctx, zyklus: z });
  intern.offen = false; zyklus = null; intern.have = true; intern.dirty = true;
  ctx.bildNr++;
  neuesBild();
}
// wie weit die Blende gerade abblendet (für Doppel: das alte Bild weicht dem neuen nur so weit, wie Licht kommt)
export function deckungJetzt(){
  const z = { t0: 0, T: 1000, winkel: REF_ANGLE, fenster: [[0, 1000 * REF_ANGLE / 360]], stops: 0, deckung: 1 };
  for (const m of module) if (m.station === 'belichtung' && m.apply && aktiv(m)) m.apply(ctx, z);
  return z.deckung;
}
function belichtung(now){
  const ready = sourceReady();
  const f = ctx.kurbel.fps;
  if (ready && f > 0 && !intern.offen && (!intern.nextAt || now >= intern.nextAt)){
    const T = 1000 / f;
    startExposure(now, T);
    const takt = station('takt', { T, abstand: T });
    intern.nextAt = (!intern.nextAt || now - intern.nextAt > T) ? now + takt.abstand : intern.nextAt + takt.abstand;
  }
  if (intern.offen && ready && zyklus) sampleExposure(now);
}

/* ---------- Projektor: wie das Bildfenster im Ausgabebild sitzt ---------- */
export function drawWeaved(g, src){
  const { W, H } = ctx, b = station('projektor', { lage: { x: 0, y: 0, s: 1 }, quelle: src }), l = b.lage;
  g.save(); g.translate(W / 2 + l.x, H / 2 + l.y); g.scale(l.s, l.s);
  g.drawImage(b.quelle, -W / 2, -H / 2, W, H); g.restore();
}

/* ---------- Hauptschleife ---------- */
let lastNow = performance.now();
function loop(now){
  const t0 = performance.now();
  const dt = Math.min(0.1, (now - lastNow) / 1000); lastNow = now;
  ctx.jetzt = now; ctx.dt = dt;
  kurbelTick(dt);
  holeStoss();
  aufnahmeTick(now, dt);
  for (const m of module){
    if (!m.tick || !aktiv(m)) continue;
    const t = performance.now(); m.tick(ctx, dt); m._ms += performance.now() - t;
  }
  syncFile();
  if (ctx.aufnahme !== 'developing') belichtung(now);
  const t1 = performance.now(); projiziere(now); roh.zeichnen += performance.now() - t1;
  renderPad();
  aufnahmeAnzeige();
  zeitenNachfuehren(performance.now() - t0);
  requestAnimationFrame(loop);
}
export function starteSchleife(){ lastNow = performance.now(); requestAnimationFrame(loop); }
