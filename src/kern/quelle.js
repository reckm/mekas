// Was vor dem Objektiv ist: Demo, Kamera oder ein geladenes Video (der Film im Projektor).
import { ctx, intern, einst, $, mkVideo, tctx, tmp, out } from './zustand.js?v=2.2.1';
import { setSize, station, abbrechen } from './kette.js?v=2.2.1';
import { persist } from './speicher.js?v=2.2.1';
import { say, hideCard, closeSheets } from './bedienung.js?v=2.2.1';
import { filmGoing, scrubPos, onDone } from './aufnahme.js?v=2.2.1';
import { micLive, audioConstraints, uebernimmMikrofon, ensureFileAudio } from './ton.js?v=2.2.1';

export const vidCam = mkVideo(true), vidFile = mkVideo(false);
let camStream = null, srcW = 0, srcH = 0;
export let fileURL = null;

/* ---------- sources ---------- */
function drawDemo(c, t){
  const { W, H } = ctx;
  c.fillStyle = '#0d0c10'; c.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.3;
  c.strokeStyle = 'rgba(169,203,232,.22)'; c.lineWidth = 2;
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  const a = t / 3000 * Math.PI * 2;
  c.fillStyle = '#a9cbe8';
  c.beginPath(); c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.16, 0, Math.PI * 2); c.fill();
  const b = t / 1500 * Math.PI * 2;
  c.strokeStyle = '#efecf3'; c.lineWidth = Math.max(2, W / 320); c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(b) * r * 0.78, cy + Math.sin(b) * r * 0.78); c.stroke();
  c.fillStyle = '#efecf3'; c.font = '700 ' + Math.round(H * 0.06) + 'px "Courier Prime", "Courier New", monospace';
  c.fillText((t / 1000).toFixed(2) + ' s', W * 0.06, H * 0.2);
}
const srcVideo = () => ctx.quelle === 'cam' ? vidCam : vidFile;
export function sourceReady(){
  if (ctx.quelle === 'demo') return true;
  const v = srcVideo();
  if (v.readyState < 2 || !v.videoWidth) return false;
  if ((v.videoWidth !== srcW || v.videoHeight !== srcH) && !filmGoing() && !intern.offen){
    srcW = v.videoWidth; srcH = v.videoHeight; setSize(srcW, srcH);
  }
  return true;
}
export function vergissGroesse(){ srcW = srcH = 0; }   // neue Auflösung: beim nächsten Bild der Quelle neu messen
export function drawCover(g, v, zoom){
  const { W, H } = ctx, vw = v.videoWidth || v.width, vh = v.videoHeight || v.height; if (!vw) return;
  const s = Math.max(W / vw, H / vh) * (zoom || 1), dw = vw * s, dh = vh * s;
  g.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh);
}
// the source as the lens sees it: zoomed, and moved by the modules at the station "quelle" (Schwenken)
function zeichneQuelle(g, v, zoom){
  const { W, H } = ctx, vw = v.videoWidth || v.width, vh = v.videoHeight || v.height; if (!vw) return;
  const s = Math.max(W / vw, H / vh) * (zoom || 1), dw = vw * s, dh = vh * s;
  const b = station('quelle', { dw, dh, dx: 0, dy: 0 });
  g.drawImage(v, (W - dw) / 2 + b.dx, (H - dh) / 2 + b.dy, dw, dh);
}
function sampleRaw(g, t){
  const z = ctx.zoom;
  if (ctx.quelle === 'demo'){ drawDemo(tctx, t); zeichneQuelle(g, tmp, z); }
  else if (ctx.quelle === 'file'){ zeichneQuelle(g, vidFile, z); }
  else if (ctx.quelle === 'cam' && einst.mirrorRec){ g.save(); g.translate(ctx.W, 0); g.scale(-1, 1); zeichneQuelle(g, vidCam, z); g.restore(); }
  else zeichneQuelle(g, srcVideo(), z);
}
export function sampleInto(g, alpha, t){
  g.globalAlpha = alpha;
  sampleRaw(g, t);
  g.globalAlpha = 1;
}

export function renderSrc(){
  const cam = ctx.quelle === 'cam', facing = ctx.facing;
  $('#srcLabel').textContent = cam ? (facing === 'user' ? 'VORNE' : 'HINTEN') : ctx.quelle === 'demo' ? 'DEMO' : 'VIDEO';
  $('#btnSrc').setAttribute('aria-label', cam ? (facing === 'user' && fileURL ? 'Zurück zum Video' : 'Kamera wechseln, jetzt ' + (facing === 'user' ? 'vorne' : 'hinten')) : 'Kamera an');
  $('#rowMirror').hidden = $('#rowMirrorRec').hidden = !cam;
  $('#rowFile').hidden = ctx.quelle !== 'file';
  $('#rowSwivel').hidden = cam;
  $('#btnCam').textContent = cam ? 'Kamera neu starten' : 'Kamera an';
  $('#mirrorView').checked = !!einst.mirrorView[facing];
  $('#mirrorRec').checked = einst.mirrorRec;
  out.classList.toggle('mirror', cam && !!einst.mirrorView[facing] !== einst.mirrorRec);
}
export function setMode(m){
  if (m !== 'file') vidFile.pause();
  if (m !== 'cam') stopCam();
  ctx.quelle = m; srcW = srcH = 0; abbrechen();
  if (!filmGoing()){ intern.have = false; if (m === 'demo') setSize(1280, 720); }
  if (m !== 'demo') hideCard();
  renderSrc(); persist();
}
function stopCam(){ if (camStream){ camStream.getTracks().forEach(t => t.stop()); camStream = null; } vidCam.srcObject = null; }

export async function startCam(quiet){
  if (ctx.aufnahme === 'developing') return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    if (!quiet) say('Hier gibt der Browser keine Kamera frei. Öffne die Datei direkt in Safari oder Chrome.', true);
    return;
  }
  const big = einst.resCap > 1280;
  const video = { facingMode: ctx.facing, width: { ideal: big ? 1920 : 1280 }, height: { ideal: big ? 1080 : 720 }, frameRate: { ideal: 30 } };
  const needMic = !micLive();
  try {
    stopCam();
    let s;
    try { s = await navigator.mediaDevices.getUserMedia({ video, audio: needMic ? audioConstraints : false }); }
    catch (e1) { if (!needMic) throw e1; s = await navigator.mediaDevices.getUserMedia({ video, audio: false }); }
    const at = s.getAudioTracks();
    if (at.length) uebernimmMikrofon(at);
    camStream = new MediaStream(s.getVideoTracks());
    vidCam.srcObject = camStream; await vidCam.play();
    if (ctx.quelle !== 'cam') setMode('cam'); else { renderSrc(); persist(); }
    if (!quiet) say('Kamera läuft. Spiel los.');
  } catch (err) {
    renderSrc();
    if (quiet) return;
    const n = err && err.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') say('Die Kamera ist hier gesperrt (in der Claude-Vorschau immer). Öffne die Datei direkt im Browser. Videos laden geht hier trotzdem.', true);
    else if (n === 'NotFoundError' || n === 'OverconstrainedError') say('Keine passende Kamera gefunden.', true);
    else say('Die Kamera konnte nicht starten (' + (n || 'unbekannter Fehler') + ').', true);
  }
}

/* ---------- loading a video ---------- */
export function loadFile(f){
  if (!f || ctx.aufnahme === 'developing') return;
  if (fileURL) URL.revokeObjectURL(fileURL);
  fileURL = URL.createObjectURL(f);
  vidFile.src = fileURL; vidFile.load(); ensureFileAudio(); setMode('file');
  primeFile();
  say('Video geladen. Es läuft, solange du aufnimmst, und endet den Film mit seinem Ende.');
}
// the video is the film being projected: it only runs while the camera records
export let filePriming = false;
let fileStarting = false;
export function fileStarted(){ fileStarting = false; }
function primeFile(){            // Safari decodes nothing before play: start muted, stop at once, show the first frame
  filePriming = true; vidFile.muted = true;
  const settle = () => {
    if (!filePriming) return;
    filePriming = false; vidFile.muted = false;
    if (!(ctx.aufnahme === 'rec' && ctx.quelle === 'file')){ vidFile.pause(); try { vidFile.currentTime = 0; } catch (e) {} }
  };
  vidFile.addEventListener('playing', settle, { once: true });
  vidFile.play().catch(() => {}).finally(settle);
  setTimeout(settle, 1200);      // never leave it running if Safari keeps the promise open
}
export function startFile(){     // called inside the tap, so Safari lets it play with sound
  if (ctx.quelle !== 'file' || !fileURL) return;
  fileStarting = true; filePriming = false; ensureFileAudio();
  // where the projector starts: a new film from the top, Doppel at the chosen spot of the film, otherwise where it stopped
  let at = null;
  if (ctx.aufnahme === 'idle') at = 0;
  else if (ctx.aufnahme === 'scrub' && ctx.zeitModus !== 'under') at = scrubPos;
  else if (ctx.aufnahme === 'scrub') at = scrubPos / ctx.ausgabeFps;
  if (vidFile.ended || (vidFile.duration && vidFile.currentTime >= vidFile.duration - 0.05)) at = at === null ? 0 : at;
  if (at !== null) try { vidFile.currentTime = vidFile.duration ? Math.min(at, Math.max(0, vidFile.duration - 0.1)) : at; } catch (e) {}
  vidFile.muted = false;
  vidFile.play().catch(() => { vidFile.muted = true; vidFile.play().catch(() => {}); });
}
export function syncFile(){      // every frame: video runs exactly while recording
  if (ctx.quelle !== 'file' || fileStarting || !fileURL) return;
  if (filePriming){ if (vidFile.currentTime > 0.6) vidFile.pause(); return; }
  const run = ctx.aufnahme === 'rec';
  if (!run && !vidFile.paused) vidFile.pause();
  else if (run && vidFile.paused && !vidFile.ended) vidFile.play().catch(() => {});
}

export function initQuelle(){
  $('#btnSrc').addEventListener('click', () => {
    hideCard();
    if (ctx.quelle === 'cam'){
      if (ctx.facing === 'user' && fileURL){ ctx.facing = 'environment'; setMode('file'); if (ctx.aufnahme === 'rec') startFile(); return; }
      ctx.facing = ctx.facing === 'environment' ? 'user' : 'environment'; renderSrc(); startCam(true);
    }
    else startCam(false);
  });
  vidFile.addEventListener('ended', () => { if (ctx.quelle === 'file' && ctx.aufnahme === 'rec'){ say('Das Video ist zu Ende, der Film auch.'); onDone(); } });
  ['#fileIn', '#cardFile'].forEach(id => $(id).addEventListener('change', e => { loadFile(e.target.files && e.target.files[0]); e.target.value = ''; closeSheets(); }));
  vidFile.addEventListener('error', () => say('Dieses Video kann der Browser nicht abspielen. MP4 oder MOV vom iPhone gehen meistens.', true));
  $('#btnRestart').addEventListener('click', () => { vidFile.currentTime = 0; });
}
