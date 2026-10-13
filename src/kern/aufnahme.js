// Aufnahme: Auslöser, Pause, Doppel, Fertig, die beiden Zeit-Modi, Entwickeln des Films und das Ausgabebild (Projektor-Takt).
import { ctx, intern, $, mkVideo, out, octx, hold } from './zustand.js?v=2.2.1';
import { mmss, mmssShort } from './mechanik.js?v=2.2.1';
import { drawWeaved, deckungJetzt } from './kette.js?v=2.2.1';
import { FS } from './speicher.js?v=2.2.1';
import { drawCover, vidFile, startFile, fileStarted, filePriming } from './quelle.js?v=2.2.1';
import { audioCtx, audioDest, ensureCtx, ensureFileAudio, decodePass, connectMic, disconnectMic, startAudioRec, tonbandLaeuft, pauseAudio, resumeAudio, stopAudioRec, verwerfeTonband, toWav } from './ton.js?v=2.2.1';
import { makeRecorder, finishRecorder } from './rekorder.js?v=2.2.1';
import { addFilm, dbPut, saveFile, filmN } from './filme.js?v=2.2.1';
import { say, hideHint, hideCard } from './bedienung.js?v=2.2.1';

const SPOOL = 4000;
let passes = [], cur = null, sid = '', passNo = 0, totalCaptured = 0, burstLeft = 0;
export let scrubPos = 0;
let env = 1, fadingOut = false;
const ul = { want: -1, img: null };
export const filmGoing = () => !!cur || passes.length > 0;

/* ---------- frame store for "unterdreht": every exposed frame kept once (IndexedDB) ---------- */
const fkey = (pass, k) => sid + '/' + pass + '/' + k;
function keyAt(idx){
  for (let i = passes.length - 1; i >= 0; i--){ const p = passes[i]; if (p.kind === 'frames' && idx >= p.start && idx < p.start + p.count) return fkey(p.pass, idx - p.start); }
  return null;
}
async function frameImage(idx){
  const k = keyAt(idx); if (!k) return null;
  const b = await FS.get(k); if (!b) return null;
  try { return await createImageBitmap(b); }
  catch (e) { return await new Promise(res => { const img = new Image(); img.onload = () => res(img); img.onerror = () => res(null); img.src = URL.createObjectURL(b); }); }
}
const closeImg = i => { if (i && i.close) try { i.close(); } catch (e) {} };
function wantUnderlay(idx){
  ul.want = idx;
  frameImage(idx).then(img => {
    if (ul.want !== idx){ closeImg(img); return; }
    closeImg(ul.img); ul.img = img; intern.dirty = true;
  });
}
function clearUnderlay(){ ul.want = -1; closeImg(ul.img); ul.img = null; }
function captureFrame(){
  if (!cur || cur.kind !== 'frames') return;
  const key = fkey(cur.pass, cur.count);
  cur.count++; totalCaptured++;
  try { out.toBlob(b => FS.put(key, b), 'image/jpeg', 0.84); } catch (e) {}
  if (cur.doppel) wantUnderlay(cur.start + cur.count);
  if (burstLeft > 0 && --burstLeft === 0 && ctx.aufnahme === 'rec'){
    if (cur.doppel) endDoppelPass(); else { pausePass(); renderControls(); }
    return;
  }
  if (totalCaptured >= SPOOL){
    say('Die Spule ist voll: 100 Fuss, 4000 Bilder. Mit dem Haken entwickeln.');
    if (cur.doppel) endDoppelPass(); else { pausePass(); renderControls(); }
  }
}
// die Kette meldet jedes neu entwickelte Kurbelbild
export function neuesBild(){ if (ctx.aufnahme === 'rec' && cur && cur.kind === 'frames') intern.captureNext = true; }

/* ---------- the roll for "Bild steht nach": recorded passes on one timeline, the latest wins ---------- */
function filmEnd(){
  let e = 0;
  for (const p of passes) e = Math.max(e, p.kind === 'frames' ? p.start + p.count : p.pos + p.dur);
  if (cur) e = Math.max(e, cur.kind === 'frames' ? cur.start + cur.count : cur.pos + cur.dur);
  return e;
}
const filmSeconds = () => ctx.zeitModus === 'under' ? filmEnd() / ctx.ausgabeFps : filmEnd();
function segments(){
  let segs = [];
  for (const p of passes){
    const a = p.pos, b = p.pos + p.dur, next = [];
    for (const s of segs){
      if (s.b <= a || s.a >= b) next.push(s);
      else { if (s.a < a) next.push({ a: s.a, b: a, p: s.p }); if (s.b > b) next.push({ a: b, b: s.b, p: s.p }); }
    }
    next.push({ a, b, p }); segs = next.sort((x, y) => x.a - y.a);
  }
  return segs.filter(s => s.b - s.a > 0.01);
}
// a recorded pass as a silent video; played once briefly, because Safari shows nothing of a video that never ran
function passVideo(url){
  const el = mkVideo(true); el.src = url;
  el.play().then(() => { if (el !== roll.el || !roll.playing) el.pause(); }).catch(() => {});
  return el;
}
const vidReady = v => !!v && !!(v.videoWidth || v.width) && !v.seeking && (v.readyState === undefined || v.readyState >= 2);
const roll = {
  segs: [], idx: -1, el: null, playing: false, start: 0, t0: 0, t: 0, onEnd: null, sources: [],
  find(t){ const i = this.segs.findIndex(s => t >= s.a && t < s.b); return i >= 0 ? i : (this.segs.length && t >= this.segs[this.segs.length - 1].b ? -1 : 0); },
  preview(t){
    this.stop(); this.segs = segments();
    let i = this.find(Math.min(t, filmEnd() - 0.05)); if (i < 0) i = this.segs.length - 1;
    const s = this.segs[i]; if (!s){ this.el = null; return; }
    const el = this.el = s.p.el, target = Math.max(0, t - s.p.pos);
    const seek = () => { try { el.currentTime = target; } catch (e) {} };
    if (el.readyState >= 1) seek(); else el.addEventListener('loadedmetadata', seek, { once: true });
  },
  play(from, onEnd){
    this.segs = segments(); this.onEnd = onEnd || null;
    const i = this.find(from);
    if (i < 0 || !this.segs.length){ this.playing = false; this.el = null; if (onEnd) onEnd(); return; }
    this.start = from; this.t0 = performance.now(); this.t = from; this.playing = true;
    this.scheduleSound(from); this.activate(i, from);
  },
  scheduleSound(from){
    this.silence(); if (!audioCtx) return;
    const base = audioCtx.currentTime;
    for (const s of this.segs){
      if (s.b <= from || !s.p.buf) continue;
      const a = Math.max(s.a, from), off = a - s.p.pos, dur = s.b - a;
      if (off >= s.p.buf.duration) continue;
      const src = audioCtx.createBufferSource(); src.buffer = s.p.buf;
      src.connect(audioCtx.destination); src.connect(audioDest);
      try { src.start(base + (a - from), Math.max(0, off), Math.max(0.01, dur)); this.sources.push(src); } catch (e) {}
    }
  },
  silence(){ this.sources.forEach(s => { try { s.stop(); } catch (e) {} try { s.disconnect(); } catch (e) {} }); this.sources = []; },
  activate(i, t){
    const s = this.segs[i], off = Math.max(0, t - s.p.pos);
    if (this.el && this.el !== s.p.el) this.el.pause();
    // iPhone Safari often fails to seek its own recordings backwards and stays black: start from a fresh copy instead
    if (off < 0.05 && s.p.el.currentTime > 0.1) s.p.el = passVideo(s.p.url);
    this.idx = i; this.el = s.p.el;
    if (Math.abs(this.el.currentTime - off) > 0.04) try { this.el.currentTime = off; } catch (e) {}
    this.el.play().catch(() => {});
  },
  tick(now){
    if (!this.playing) return;
    this.t = this.start + (now - this.t0) / 1000;
    const s = this.segs[this.idx];
    if (this.t >= s.b){
      if (this.idx + 1 < this.segs.length) this.activate(this.idx + 1, this.segs[this.idx + 1].a);
      else { this.stop(); this.el = null; if (this.onEnd){ const f = this.onEnd; this.onEnd = null; f(); } }
    }
  },
  stop(){ this.playing = false; this.silence(); if (this.el) this.el.pause(); }
};

/* ---------- Projektor: das Ausgabebild ---------- */
function underlay(){
  if (ctx.zeitModus === 'under'){
    if (ctx.aufnahme === 'scrub' || (ctx.aufnahme === 'rec' && cur && cur.doppel)) return ul.img;
    return null;
  }
  if (ctx.aufnahme === 'scrub') return roll.el;
  if (ctx.aufnahme === 'rec' && cur && cur.doppel && roll.playing) return roll.el;
  return null;
}
let lastUnder = null;            // last good frame of the old film, shown while Safari is still seeking
function composeBase(){
  const { W, H } = ctx, state = ctx.aufnahme;
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1;
  if (state === 'developing' && dev){
    const src = dev.kind === 'frames' ? dev.img : roll.el;
    if (vidReady(src)){ octx.fillStyle = '#000'; octx.fillRect(0, 0, W, H); drawCover(octx, src, 1); }
    return;                                       // not ready (seeking): keep the last picture rather than black
  }
  const doppelNow = cur && cur.doppel && (state === 'rec');
  const e = doppelNow ? env : 1;
  const u0 = underlay(), u = vidReady(u0) ? u0 : (u0 && lastUnder) || null;
  if (u0 && u === u0 && u0.tagName === 'VIDEO'){ lastUnder = lastUnder || document.createElement('canvas'); if (lastUnder.width !== W || lastUnder.height !== H){ lastUnder.width = W; lastUnder.height = H; } lastUnder.getContext('2d').drawImage(u0, 0, 0, W, H); }
  if (!u || !(u.videoWidth || u.width)){
    if (!intern.have) return;
    if (e < 1){ octx.fillStyle = '#000'; octx.fillRect(0, 0, W, H); octx.globalAlpha = e; }
    drawWeaved(octx, hold); octx.globalAlpha = 1;
    return;
  }
  // old film underneath, the new exposure added on top like light; when the new one is faded out, the old one stays untouched
  const G = (state === 'scrub' ? 0.6 : deckungJetzt() * e);
  octx.fillStyle = '#000'; octx.fillRect(0, 0, W, H);
  drawCover(octx, u, 1);
  const wo = 1 - 0.4 * G;
  if (wo < 1){ octx.globalAlpha = 1 - wo; octx.fillRect(0, 0, W, H); }
  if (intern.have && state !== 'scrub'){ octx.globalCompositeOperation = 'lighter'; octx.globalAlpha = 0.6 * e; drawWeaved(octx, hold); }
  else if (intern.have && state === 'scrub'){ octx.globalCompositeOperation = 'lighter'; octx.globalAlpha = 0.6; drawWeaved(octx, hold); }
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1;
}
export function compose(){
  const { W, H } = ctx;
  if (intern.stand && ctx.aufnahme !== 'developing'){ octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.drawImage(intern.stand, 0, 0, W, H); }
  else composeBase();
  if (intern.clapFrames > 0){
    octx.fillStyle = '#ffffff'; octx.fillRect(0, 0, W, H);
    octx.fillStyle = '#0d0c10'; octx.font = '700 ' + Math.round(H * 0.12) + 'px "Courier Prime", "Courier New", monospace';
    octx.textAlign = 'center'; octx.textBaseline = 'middle';
    octx.fillText('KLAPPE ' + (filmN + 1), W / 2, H / 2);
    octx.textAlign = 'start'; octx.textBaseline = 'alphabetic';
  }
}
// jedes Animationsbild: im Takt der Ausgabe ein Bild zeigen und an die Aufnahme geben
export function projiziere(now){
  const step = 1000 / ctx.ausgabeFps, tick = now >= intern.projNext;
  if (tick) intern.projNext = (now - intern.projNext > 200) ? now + step : intern.projNext + step;
  if (ctx.aufnahme === 'developing' && dev){
    if (tick){
      let advanced = true;
      if (dev.kind === 'frames') advanced = devFramesTick();
      compose();
      if (advanced && dev && dev.vtrack) dev.vtrack.requestFrame();
      if (dev && dev.kind === 'frames' && dev.i >= dev.total && !dev.finishing) finishDevelopFrames();
    }
  } else if (tick || intern.dirty || ctx.aufnahme === 'scrub'){
    compose(); intern.dirty = false;
    if (intern.captureNext){ intern.captureNext = false; captureFrame(); }
    if (tick){
      if (intern.clapFrames > 0) intern.clapFrames--;
      if (ctx.aufnahme === 'rec' && cur && cur.vtrack) cur.vtrack.requestFrame();
    }
  }
}
export function aufnahmeTick(now, dt){
  if (ctx.aufnahme === 'rec' && cur && cur.kind !== 'frames') cur.dur += dt;
  roll.tick(now);
}
let uiTick = 0;
export function aufnahmeAnzeige(){
  if (++uiTick % 5 === 0) renderTime();
  if (ctx.aufnahme === 'developing' && dev) renderDev();
}

/* ---------- film flow ---------- */
function newFilmIfNeeded(){
  if (filmGoing()) return;
  sid = 'f' + Date.now(); passNo = 0; totalCaptured = 0;
}
function anlaufen(doppel){ ctx.anlauf.nr++; ctx.anlauf.doppel = !!doppel; }   // Anlaufblitz, Mitte fürs Schwenken
async function startPass(pos, doppel){
  newFilmIfNeeded();
  const withTon = $('#ton').checked;
  if (withTon){ ensureCtx(); if (ctx.quelle === 'file') ensureFileAudio(); await connectMic(); }
  if (ctx.zeitModus === 'under'){
    if (totalCaptured >= SPOOL){ say('Die Spule ist voll. Mit dem Haken entwickeln.'); return false; }
    cur = { kind: 'frames', pass: ++passNo, start: Math.round(pos), count: 0, doppel: !!doppel };
    if (withTon){ if (tonbandLaeuft()) resumeAudio(); else startAudioRec(); }
    if (doppel) wantUnderlay(cur.start);
  } else {
    if (doppel && withTon) await Promise.all(passes.map(decodePass));
    const r = makeRecorder(withTon);
    if (!r){ say('Aufnehmen klappt in diesem Browser nicht. Versuch es mit Safari oder Chrome.', true); disconnectMic(); return false; }
    cur = Object.assign(r, { kind: 'video', pos, dur: 0, doppel: !!doppel });
    if (doppel) roll.play(pos, () => {});
    cur.rec.start(1000);
  }
  anlaufen(doppel);
  intern.nextAt = 0; env = 1; fadingOut = false;
  intern.projNext = 0; ctx.aufnahme = 'rec';
  return true;
}
async function finalizePass(){
  if (!cur) return;
  const c = cur; cur = null;
  if (c.kind === 'frames'){ if (c.count > 0) passes.push(c); clearUnderlay(); return; }
  ctx.aufnahme = 'busy'; renderControls();
  if (c.doppel) roll.stop();
  const blob = await finishRecorder(c);
  if (blob.size && c.dur > 0.05){
    const url = URL.createObjectURL(blob), el = passVideo(url);
    const p = { kind: 'video', blob, url, pos: c.pos, dur: c.dur, el, buf: null, bufP: null, mime: c.mime };
    passes.push(p); if (audioCtx) decodePass(p);
  } else if (c.dur > 0.05) say('Der letzte Abschnitt liess sich nicht sichern.', true);
}
function pausePass(){
  pauseAudio();
  if (cur && cur.kind === 'video' && typeof cur.rec.pause === 'function'){ cur.rec.pause(); ctx.aufnahme = 'paused'; return; }
  ctx.aufnahme = 'paused';
}
async function endDoppelPass(){
  await finalizePass(); pauseAudio();
  ctx.aufnahme = 'paused'; renderControls();
  say('Doppelbelichtung beendet. Weiter filmst du am Ende des Films.');
}

export async function onRec(){
  try { await recStep(); } finally { fileStarted(); }
}
async function recStep(){
  hideHint(); hideCard();
  const state = ctx.aufnahme;
  if (state === 'busy' || state === 'developing' || fadingOut) return;
  if (state === 'idle' || state === 'paused' || state === 'scrub') startFile();
  if (state === 'idle'){ await startPass(0, false); }
  else if (state === 'rec'){
    if (cur && cur.doppel){ await endDoppelPass(); return; }
    pausePass();
  }
  else if (state === 'paused'){
    if (cur && !cur.doppel){
      if (ctx.zeitModus === 'under' && totalCaptured >= SPOOL){ say('Die Spule ist voll. Mit dem Haken entwickeln.'); return; }
      anlaufen(false);
      intern.nextAt = 0; resumeAudio();
      if (cur.kind === 'video') cur.rec.resume();
      ctx.aufnahme = 'rec';
    } else { await startPass(filmEnd(), false); }
  }
  else if (state === 'scrub'){ $('#scrub').hidden = true; roll.stop(); await startPass(scrubPos, true); }
  renderControls();
}

async function onDoppel(){
  if (ctx.aufnahme === 'scrub'){ roll.stop(); roll.el = null; clearUnderlay(); $('#scrub').hidden = true; ctx.aufnahme = 'paused'; renderControls(); return; }
  if (ctx.aufnahme === 'rec' && cur){
    if (cur.doppel){ await endDoppelPass(); return; }
    pausePass();                                   // straight from filming into rewinding
  }
  if (ctx.aufnahme !== 'paused') return;
  if (cur) await finalizePass();
  const end = filmEnd();
  if (!end){ ctx.aufnahme = 'paused'; renderControls(); return; }
  ctx.aufnahme = 'scrub';
  if (ctx.zeitModus === 'under'){
    scrubPos = Math.max(0, end - ctx.ausgabeFps * 5);
    $('#scrubber').value = String(Math.round(scrubPos / Math.max(1, end - 1) * 1000));
    wantUnderlay(scrubPos);
  } else {
    scrubPos = Math.max(0, end - Math.min(5, end));
    $('#scrubber').value = String(Math.round(scrubPos / end * 1000));
    roll.preview(scrubPos);
  }
  renderScrub(); $('#scrub').hidden = false;
  renderControls();
}
function renderScrub(){
  const s = ctx.zeitModus === 'under' ? scrubPos / ctx.ausgabeFps : scrubPos;
  $('#scrubVal').textContent = mmss(s) + ' von ' + mmss(filmSeconds());
}

export async function onDone(){
  if (ctx.aufnahme === 'busy' || ctx.aufnahme === 'developing' || fadingOut) return;
  $('#scrub').hidden = true; roll.stop(); roll.el = null; clearUnderlay();
  if (cur) await finalizePass();
  disconnectMic();
  if (!passes.length){ await stopAudioRec(); ctx.aufnahme = 'idle'; renderControls(); return; }
  if (ctx.zeitModus === 'under'){ startDevelopFrames(); return; }
  if (passes.length === 1){ const p = passes[0]; finishFilm(p.blob, p.mime, p.dur, null); return; }
  startDevelopRoll();
}

/* ---------- developing ---------- */
let dev = null;
function showDevelop(label){ $('#devBar').style.width = '0%'; $('#devVal').textContent = label; $('#develop').hidden = false; }
async function startDevelopRoll(){
  ensureCtx(); vidFile.pause();
  ctx.aufnahme = 'developing'; renderControls(); showDevelop('bereitet vor …');
  if ($('#ton').checked) await Promise.all(passes.map(decodePass));
  const r = makeRecorder($('#ton').checked);
  if (!r){ say('Entwickeln klappt in diesem Browser nicht.', true); $('#develop').hidden = true; ctx.aufnahme = 'paused'; renderControls(); return; }
  dev = Object.assign(r, { kind: 'roll', total: filmEnd() });
  dev.rec.start(1000); intern.projNext = 0;
  roll.play(0, async () => {
    const d = dev; if (!d) return;
    const blob = await finishRecorder(d);
    dev = null; $('#develop').hidden = true;
    finishFilm(blob, d.mime, d.total, null);
  });
}
async function startDevelopFrames(){
  vidFile.pause();
  ctx.aufnahme = 'developing'; renderControls(); showDevelop('bereitet vor …');
  const audio = await stopAudioRec();
  await FS.flush();
  const r = makeRecorder(false);
  if (!r){ say('Entwickeln klappt in diesem Browser nicht.', true); $('#develop').hidden = true; ctx.aufnahme = 'paused'; renderControls(); return; }
  dev = Object.assign(r, { kind: 'frames', total: filmEnd(), i: 0, cache: new Map(), img: null, audio, finishing: false });
  dev.rec.start(1000); intern.projNext = 0;
}
function devFramesTick(){
  const d = dev;
  for (let j = d.i; j < Math.min(d.total, d.i + 24); j++){
    if (d.cache.has(j)) continue;
    d.cache.set(j, null);
    frameImage(j).then(img => { if (dev !== d){ closeImg(img); return; } d.cache.set(j, img || 'none'); });
  }
  if (d.i >= d.total) return false;
  const c = d.cache.get(d.i);
  if (c === null || c === undefined) return false;
  if (c !== 'none'){ closeImg(d.img); d.img = c; }
  d.cache.delete(d.i); d.i++;
  return true;
}
async function finishDevelopFrames(){
  const d = dev; d.finishing = true;
  $('#devVal').textContent = 'Tonspur wird gewandelt …';
  const blob = await finishRecorder(d);
  let audio = null;
  if (d.audio){ audio = await toWav(d.audio); if (!audio) audio = d.audio; }
  closeImg(d.img); d.cache.forEach(closeImg);
  dev = null; $('#develop').hidden = true;
  finishFilm(blob, d.mime, d.total / ctx.ausgabeFps, audio);
}
function renderDev(){
  if (dev.finishing) return;
  const done = dev.kind === 'frames' ? dev.i / Math.max(1, dev.total) : Math.min(1, (roll.t || 0) / Math.max(0.01, dev.total));
  $('#devBar').style.width = (done * 100).toFixed(1) + '%';
  $('#devVal').textContent = dev.kind === 'frames' ? 'Bild ' + dev.i + ' von ' + dev.total : mmss(done * dev.total) + ' von ' + mmss(dev.total);
}

function snapshot(){
  try {
    const c = document.createElement('canvas'), s = 200 / Math.max(ctx.W, ctx.H);
    c.width = Math.round(ctx.W * s); c.height = Math.round(ctx.H * s);
    c.getContext('2d').drawImage(hold, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.7);
  } catch (e) { return ''; }
}
function stamp(){
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
}
let resFilm = null;
function finishFilm(blob, mime, dur, audio){
  const ext = /mp4/.test(mime) ? 'mp4' : 'webm', base = 'mekas-' + stamp();
  const aext = audio ? (/wav/.test(audio.type) ? 'wav' : /mp4/.test(audio.type) ? 'm4a' : 'webm') : '';
  const film = { id: Date.now() + '-' + Math.random().toString(36).slice(2, 6), name: base + '.' + ext, blob, dur, thumb: snapshot(), created: Date.now(), type: mime, audio: audio || null, audioName: audio ? base + '-ton.' + aext : '' };
  passes.forEach(p => { if (p.kind === 'video'){ try { p.el.pause(); } catch (e) {} URL.revokeObjectURL(p.url); } });
  passes = []; cur = null; ctx.aufnahme = 'idle'; renderControls();
  FS.clear();
  addFilm(film);
  dbPut(film).catch(() => {});
  resFilm = film;
  const v = $('#resVideo'); if (v.dataset.url) URL.revokeObjectURL(v.dataset.url);
  v.dataset.url = URL.createObjectURL(blob); v.src = v.dataset.url;
  $('#resTitle').textContent = 'Film ' + filmN + ' fertig · ' + mmss(dur);
  $('#resSaveTon').hidden = !film.audio;
  $('#result').hidden = false;
}

/* ---------- controls state ---------- */
export function renderControls(){
  const rb = $('#btnRec'), state = ctx.aufnahme;
  rb.classList.toggle('live', state === 'rec' && !fadingOut);
  rb.classList.toggle('fading', fadingOut);
  rb.classList.toggle('paused', state === 'paused' || state === 'scrub');
  rb.setAttribute('aria-label', state === 'rec' ? 'Pause' : state === 'paused' ? 'Weiter aufnehmen' : state === 'scrub' ? 'Doppel aufnehmen' : 'Aufnehmen');
  const under = ctx.zeitModus === 'under';
  $('#recLabel').textContent = fadingOut ? 'blendet ab …' : state === 'rec' ? (under ? 'läuft' : 'Pause') : (under && (state === 'idle' || state === 'paused')) ? 'halten · tippen' : state === 'paused' ? 'weiter' : state === 'scrub' ? 'Doppel starten' : state === 'busy' ? '…' : state === 'developing' ? 'entwickelt …' : 'Aufnehmen';
  const canDoppel = state === 'paused' || state === 'scrub' || (state === 'rec' && !!cur);
  $('#btnDoppel').disabled = !canDoppel || fadingOut;
  $('#btnDoppel').setAttribute('aria-pressed', String(state === 'scrub'));
  $('#btnDone').disabled = !(state === 'rec' || state === 'paused' || state === 'scrub') || fadingOut;
  $('#chipDoppel').hidden = !(state === 'scrub' || (state === 'rec' && cur && cur.doppel));
  renderTime();
}
function renderTime(){
  const c = $('#chipTime'), state = ctx.aufnahme;
  const filming = state === 'rec' || state === 'paused' || state === 'scrub' || state === 'busy';
  c.hidden = !filming;
  if (!filming) return;
  let t;
  if (ctx.zeitModus === 'under') t = (state === 'rec' && cur && cur.doppel ? cur.start + cur.count : filmEnd()) / ctx.ausgabeFps;
  else t = state === 'rec' && cur && cur.doppel ? cur.pos + cur.dur : filmEnd();
  c.textContent = (state === 'rec' ? '● ' : '❚❚ ') + mmssShort(t);
  c.className = 'chip ' + (state === 'rec' ? 'rec' : 'paused');
}

// Klappe: weisses Bild mit Piepton, zum Synchronisieren in Final Cut
function klappe(){
  ensureCtx();
  intern.clapFrames = 2; compose();
  if (ctx.aufnahme === 'rec' && cur){ if (cur.vtrack) cur.vtrack.requestFrame(); if (cur.kind === 'frames') captureFrame(); }
  const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t0 = audioCtx.currentTime;
  o.frequency.value = 1000; g.gain.setValueAtTime(0.5, t0); g.gain.setValueAtTime(0, t0 + 0.08);
  o.connect(g); g.connect(audioCtx.destination); g.connect(audioDest);
  o.start(t0); o.stop(t0 + 0.1);
  say(ctx.aufnahme === 'rec' ? 'Klappe gesetzt.' : 'Die Klappe landet nur in einer laufenden Aufnahme.');
}

export function initAufnahme(){
  $('#scrubber').addEventListener('input', e => {
    const v = +e.target.value / 1000, end = filmEnd();
    if (ctx.zeitModus === 'under'){ scrubPos = Math.round(v * Math.max(0, end - 1)); wantUnderlay(scrubPos); }
    else { scrubPos = v * end; roll.preview(scrubPos); }
    renderScrub();
  });
  $('#devCancel').addEventListener('click', async () => {
    if (!dev) return;
    const d = dev; dev = null; roll.onEnd = null; roll.stop(); roll.el = null;
    await finishRecorder(d);
    if (d.kind === 'frames'){ closeImg(d.img); d.cache.forEach(closeImg); if (d.audio){ verwerfeTonband(); } }
    $('#develop').hidden = true; ctx.aufnahme = 'paused'; renderControls();
    say('Entwickeln abgebrochen. Der Film ist noch da.');
  });
  $('#resSave').addEventListener('click', () => { if (resFilm) saveFile(resFilm.blob, resFilm.name, resFilm.type); });
  $('#resSaveTon').addEventListener('click', () => { if (resFilm && resFilm.audio) saveFile(resFilm.audio, resFilm.audioName, resFilm.audio.type); });
  $('#resClose').addEventListener('click', () => { $('#result').hidden = true; $('#resVideo').pause(); });

  // Auslöser: im Modus Unterdreht läuft die Kamera, solange er gehalten wird; kurz tippen gibt einen Stoss von vier Bildern
  const rbtn = $('#btnRec');
  let pressT = 0, pressing = null;
  rbtn.addEventListener('pointerdown', e => {
    if (ctx.zeitModus !== 'under') return;
    e.preventDefault(); try { rbtn.setPointerCapture(e.pointerId); } catch (_) {}
    pressT = performance.now(); burstLeft = 0;
    pressing = (ctx.aufnahme === 'idle' || ctx.aufnahme === 'paused' || ctx.aufnahme === 'scrub') ? onRec() : Promise.resolve();
  });
  rbtn.addEventListener('pointerup', async () => {
    if (ctx.quelle === 'file' && vidFile.muted && !filePriming) vidFile.muted = false;
    if (ctx.zeitModus !== 'under' || !pressing) return;
    const p = pressing; pressing = null; await p;
    if (ctx.aufnahme !== 'rec') return;
    if (performance.now() - pressT > 280) await onRec();
    else burstLeft = 4;
  });
  rbtn.addEventListener('click', e => { if (ctx.zeitModus === 'under' && e.detail !== 0) return; onRec(); });
  $('#btnDoppel').addEventListener('click', onDoppel);
  $('#btnDone').addEventListener('click', onDone);
  $('#btnClap').addEventListener('click', klappe);
}
