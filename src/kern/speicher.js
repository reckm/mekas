// Speicher: Einstellungen (localStorage `kurbel.v3`, im Labor `mekas.labor`) und IndexedDB `kurbel` (Filme, Einzelbilder).
// Die alten Namen bleiben, damit gespeicherte Filme und Einstellungen erhalten bleiben.
import { ctx, einst, $ } from './zustand.js?v=1.1.1';
import { module, kernteile, modul, wert } from './kette.js?v=1.1.1';

/* ---------- remembered settings ---------- */
// Das Labor schreibt nie in die Einstellungen der normalen Bedienung. Beim ersten Öffnen beginnt es dort, wo sie stehen.
const KEY = ctx.labor ? 'mekas.labor' : 'kurbel.v3';
export const KEY_VER = 4;
export let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) || (ctx.labor && localStorage.getItem('kurbel.v3')) || '{}') || {}; } catch (e) { saved = {}; }
export function persist(){
  const sw = modul('schwenken');
  const s = {
    outFps: ctx.ausgabeFps, expo: (wert('blende', 'winkel') ?? 135) / 360, jitter: wert('handkurbel', 'unruhe') ?? 0.75,
    startFlash: wert('entwickeln', 'anlaufblitz') ?? true, weave: Math.round((wert('bildstand', 'staerke') ?? 0.35) * 100),
    ton: $('#ton').checked, lastMode: ctx.quelle, facing: ctx.facing, res: einst.resCap, mirrorView: einst.mirrorView, mirrorRec: einst.mirrorRec,
    avDelay: einst.avDelayMs, x: ctx.kurbel.zielX, y: ctx.kurbel.zielY, swivel: sw ? sw.an : true, timeMode: ctx.zeitModus, v: KEY_VER,
  };
  if (ctx.labor) s.module = Object.fromEntries([...module, ...kernteile].map(m => [m.id, { an: m.an, werte: { ...m.p } }]));
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
}

/* ---------- IndexedDB ---------- */
let dbP = null;
function idb(){
  if (!dbP) dbP = new Promise((res, rej) => {
    try {
      const r = indexedDB.open('kurbel', 2);
      r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('films')) d.createObjectStore('films', { keyPath: 'id' }); if (!d.objectStoreNames.contains('frames')) d.createObjectStore('frames'); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  return dbP;
}
export async function idbReq(store, rw, fn){
  const d = await idb();
  return new Promise((res, rej) => {
    const tx = d.transaction(store, rw ? 'readwrite' : 'readonly'); const req = fn(tx.objectStore(store)); let outv;
    req.onsuccess = () => { outv = req.result; };
    tx.oncomplete = () => res(outv); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
  });
}
// frame store for "unterdreht": every exposed frame kept once
export const FS = {
  mem: new Map(), dbOk: true, pending: new Set(),
  put(key, blob){
    if (!blob) return;
    if (!this.dbOk){ this.mem.set(key, blob); return; }
    const p = idbReq('frames', true, s => s.put(blob, key)).catch(() => { this.dbOk = false; this.mem.set(key, blob); });
    this.pending.add(p); p.finally(() => this.pending.delete(p));
  },
  async get(key){
    if (this.mem.has(key)) return this.mem.get(key);
    if (!this.dbOk) return null;
    try { return await idbReq('frames', false, s => s.get(key)); } catch (e) { return null; }
  },
  flush(){ return Promise.all([...this.pending]); },
  async clear(){ this.mem.clear(); try { await idbReq('frames', true, s => s.clear()); } catch (e) {} }
};
