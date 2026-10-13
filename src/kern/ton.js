// Ton: nur das Mikrofon (und der Ton eines geladenen Videos). Kein Ton aus der Mechanik.
import { ctx, einst, $ } from './zustand.js?v=1.2.6';
import { vidFile } from './quelle.js?v=1.2.6';
import { say } from './bedienung.js?v=1.2.6';

export let audioCtx = null, audioDest = null;
let recBus = null, recDelay = null, fileNode = null, micNode = null, micStream = null, micToRec = false;

/* ---------- audio graph ---------- */
export function ensureCtx(){
  if (!audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    audioDest = audioCtx.createMediaStreamDestination();
    recBus = audioCtx.createGain(); recDelay = audioCtx.createDelay(1);
    recDelay.delayTime.value = einst.avDelayMs / 1000;
    recBus.connect(recDelay); recDelay.connect(audioDest);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
export function setAvDelay(ms){ einst.avDelayMs = ms; if (recDelay) recDelay.delayTime.value = ms / 1000; }
export function ensureFileAudio(){ try { ensureCtx(); if (!fileNode){ fileNode = audioCtx.createMediaElementSource(vidFile); fileNode.connect(audioCtx.destination); fileNode.connect(audioDest); } } catch (e) {} }
export function decodeAB(ab){ return new Promise((res, rej) => { const r = audioCtx.decodeAudioData(ab, res, rej); if (r && r.then) r.then(res, rej); }); }
export function decodePass(p){
  if (p.bufP) return p.bufP;
  p.bufP = (async () => { try { ensureCtx(); p.buf = await decodeAB(await p.blob.arrayBuffer()); } catch (e) { p.buf = null; } })();
  return p.bufP;
}

/* ---------- microphone ---------- */
export const audioConstraints = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
export const micLive = () => !!(micStream && micStream.getAudioTracks().some(t => t.readyState === 'live'));
// the camera asked for the microphone too: keep it, unless one is already running
export function uebernimmMikrofon(tracks){ if (micLive()) tracks.forEach(t => t.stop()); else { micStream = new MediaStream(tracks); micNode = null; } }
async function getMic(){
  if (!micLive()){ micStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints }); micNode = null; }
  ensureCtx();
  if (!micNode) micNode = audioCtx.createMediaStreamSource(micStream);
  return micNode;
}
export async function connectMic(){
  if (!$('#ton').checked || ctx.quelle === 'file' || micToRec) return;
  try { (await getMic()).connect(recBus); micToRec = true; }
  catch (e) { if (ctx.quelle === 'cam') say('Kein Mikrofon, gefilmt wird ohne Ton.'); }
}
export function disconnectMic(){ if (micToRec && micNode){ try { micNode.disconnect(recBus); } catch (e) {} } micToRec = false; }

/* ---------- separate sound for "Unterdreht": runs in real time like a Nagra next to the camera ---------- */
let aRec = null;
export function startAudioRec(){
  if (aRec || !$('#ton').checked || !audioDest || typeof MediaRecorder === 'undefined') return;
  let mime = '';
  for (const t of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']){ try { if (MediaRecorder.isTypeSupported(t)){ mime = t; break; } } catch (e) {} }
  try {
    const rec = new MediaRecorder(new MediaStream(audioDest.stream.getAudioTracks()), mime ? { mimeType: mime } : undefined), chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.start(1000); aRec = { rec, chunks, mime: rec.mimeType || mime };
  } catch (e) { aRec = null; }
}
export const tonbandLaeuft = () => !!aRec;
export const pauseAudio = () => { try { if (aRec && aRec.rec.state === 'recording') aRec.rec.pause(); } catch (e) {} };
export const resumeAudio = () => { try { if (aRec && aRec.rec.state === 'paused') aRec.rec.resume(); } catch (e) {} };
export function verwerfeTonband(){ aRec = null; }
export function stopAudioRec(){
  return new Promise(res => {
    if (!aRec) return res(null);
    const a = aRec; aRec = null;
    a.rec.onstop = () => res(a.chunks.length ? new Blob(a.chunks, { type: a.mime }) : null);
    try { a.rec.stop(); } catch (e) { res(null); }
  });
}
export async function toWav(blob){
  try {
    ensureCtx();
    const buf = await decodeAB(await blob.arrayBuffer());
    const ch = Math.min(2, buf.numberOfChannels), sr = buf.sampleRate, n = buf.length;
    const dv = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); dv.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true); dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * ch * 2, true);
    const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++){ const s = Math.max(-1, Math.min(1, data[c][i])); dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
    return new Blob([dv], { type: 'audio/wav' });
  } catch (e) { return null; }
}
