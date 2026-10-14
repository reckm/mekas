// Aufnahme des Ausgabebilds mit MediaRecorder: ein Bild pro Projektor-Takt, Ton aus dem Mikrofon.
import { ctx, out } from './zustand.js?v=2.3.1';
import { audioDest } from './ton.js?v=2.3.1';

function pickMime(){
  if (typeof MediaRecorder === 'undefined') return null;
  const c = ['video/mp4;codecs=avc1.42E01F,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  for (const m of c){ try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) {} }
  return '';
}
export function makeRecorder(withAudio){
  const mime = pickMime();
  if (mime === null || !out.captureStream) return null;
  let stream = out.captureStream(0), vtrack = stream.getVideoTracks()[0] || null;
  if (!vtrack || typeof vtrack.requestFrame !== 'function'){ stream.getTracks().forEach(t => t.stop()); stream = out.captureStream(ctx.ausgabeFps); vtrack = null; }
  if (withAudio && audioDest) audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
  const opts = { videoBitsPerSecond: 10000000 }; if (mime) opts.mimeType = mime;
  try {
    const rec = new MediaRecorder(stream, opts), chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    return { rec, chunks, mime: rec.mimeType || mime || 'video/webm', stream, vtrack };
  } catch (e) { stream.getVideoTracks().forEach(t => t.stop()); return null; }
}
export function finishRecorder(r){
  return new Promise(res => {
    let done = false;
    const fin = () => { if (done) return; done = true; r.stream.getVideoTracks().forEach(t => t.stop()); res(new Blob(r.chunks, { type: r.mime })); };
    r.rec.onstop = () => setTimeout(fin, 0);       // let a last dataavailable land first
    if (r.rec.state === 'inactive'){ fin(); return; }
    // Safari loses the take when a paused recorder is stopped: wake it up and hand it one frame first
    if (r.rec.state === 'paused'){ try { r.rec.resume(); } catch (e) {} if (r.vtrack) try { r.vtrack.requestFrame(); } catch (e) {} }
    setTimeout(() => { try { if (r.rec.state !== 'inactive') r.rec.stop(); } catch (e) { fin(); } }, r.rec.state === 'recording' ? 120 : 0);
    setTimeout(fin, 5000);                           // never hang on a recorder that does not answer
  });
}
