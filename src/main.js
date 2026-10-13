// Mekas startet: Module einrichten, gespeicherte Einstellungen zurückholen, Bedienung anschliessen, Schleife starten.
import { ctx, einst, intern, $ } from './kern/zustand.js?v=1.2.6';
import { clamp01 } from './kern/mechanik.js?v=1.2.6';
import { setup, setSize, setze, modul, starteSchleife } from './kern/kette.js?v=1.2.6';
import { saved, KEY_VER, FS } from './kern/speicher.js?v=1.2.6';
import { initQuelle, renderSrc, startCam } from './kern/quelle.js?v=1.2.6';
import { initAufnahme, renderControls } from './kern/aufnahme.js?v=1.2.6';
import { initFilme, renderFilmCount, ladeFilme } from './kern/filme.js?v=1.2.6';
import { initAnstoss } from './kern/anstoss.js?v=1.2.6';
import { initBedienung, renderExpo, renderGrip, renderPad, renderTimeNote, renderMenuWerte } from './kern/bedienung.js?v=1.2.6';

setup();

/* ---------- restore ---------- */
if ([24, 25, 30].includes(saved.outFps)) ctx.ausgabeFps = saved.outFps;
if (saved.res === 1280 || saved.res === 1920) einst.resCap = saved.res;
if (saved.timeMode === 'under' || saved.timeMode === 'hold') ctx.zeitModus = saved.timeMode;
if (typeof saved.expo === 'number') setze('blende', 'winkel', clamp01(saved.v === KEY_VER ? saved.expo : saved.expo / 2) * 360);
if (saved.swivel === false) modul('schwenken').an = false;
if (typeof saved.ruck === 'boolean') setze('anstossen', 'gekoppelt', saved.ruck);
if (typeof saved.jitter === 'number') setze('handkurbel', 'unruhe', clamp01(saved.jitter)); else if (saved.jitter === false) setze('handkurbel', 'unruhe', 0);
if (typeof saved.weave === 'number') setze('bildstand', 'staerke', Math.max(0, Math.min(100, saved.weave)) / 100);
if (typeof saved.ton === 'boolean') $('#ton').checked = saved.ton;
if (saved.facing === 'user' || saved.facing === 'environment') ctx.facing = saved.facing;
if (saved.mirrorView && typeof saved.mirrorView === 'object') einst.mirrorView = { user: !!saved.mirrorView.user, environment: !!saved.mirrorView.environment };
if (typeof saved.mirrorRec === 'boolean') einst.mirrorRec = saved.mirrorRec;
if (typeof saved.avDelay === 'number') einst.avDelayMs = Math.max(0, Math.min(300, saved.avDelay));
if (typeof saved.x === 'number') ctx.kurbel.zielX = ctx.kurbel.x = clamp01(saved.x);
if (typeof saved.y === 'number') ctx.kurbel.zielY = ctx.kurbel.y = clamp01(saved.y);
// nur im Labor: Ein/Aus und alle Werte der Module
if (ctx.labor && saved.module) for (const [id, s] of Object.entries(saved.module)){
  const m = modul(id); if (!m || !s) continue;
  if (saved.nurGeaendert) for (const [n, v] of Object.entries(s.werte || {})) setze(id, n, v);   // ältere Labor-Stände speicherten alle Werte: die gelten nicht mehr
  if (typeof s.an === 'boolean') m.an = s.an;
}

/* ---------- start ---------- */
initBedienung(); initAnstoss(); initQuelle(); initAufnahme(); initFilme();
setSize(1280, 720);
renderSrc(); renderExpo(); renderGrip(); renderControls(); renderFilmCount(); renderPad(); renderTimeNote(); renderMenuWerte();
starteSchleife();

FS.clear();
ladeFilme();

if (!intern.inViewer && saved.lastMode === 'cam' && navigator.mediaDevices){
  const go = () => startCam(true);
  if (navigator.permissions && navigator.permissions.query){
    navigator.permissions.query({ name: 'camera' }).then(p => { if (p.state !== 'denied') go(); }).catch(go);
  } else go();
}

if (ctx.labor) import('./labor/labor.js?v=1.2.6').then(l => l.starteLabor());
