// Sammeln: Jedes Kamerabild ist eine Teilbelichtung. Es gilt von seinem Eintreffen bis zum nächsten und fällt so lange
// auf den Film, wie sich diese Zeit mit den offenen Fenstern der Blende deckt. So bekommt jede Millisekunde offener Blende
// genau ein Kamerabild, egal wie schnell der Bildschirm läuft. Die Demo bekommt einen festen Takt wie eine Kamera.
// Gesammelt wird in linearem Licht und Gleitkomma (WebGL2): Licht × Zeit und die Zeit selbst. Beim Schliessen der Blende
// wird daraus das Mittel, zurück in Pixelwerte, und das geht wie bisher als `roh` ins Entwickeln.
// Vor jeder Teilbelichtung kommt die Station `emulsion`: Dort können Module Gewicht und Farbempfindlichkeit ändern.
import { ctx, intern, actx, mk } from './zustand.js?v=1.2.6';
import { station } from './kette.js?v=1.2.6';
import { sampleInto, vidCam, vidFile } from './quelle.js?v=1.2.6';

export const sammeln = {
  id: 'sammeln',
  titel: 'Sammeln',
  params: {
    neu: { typ: 'schalter', def: true, titel: 'Teilbelichtungen (neu): jedes Kamerabild zählt genau einmal, in linearem Licht' },
  },
  anzeige: { kameraFps: 0, teile: 0, fehler: '' },   // fürs Labor: Kamerabilder pro Sekunde, Teilbelichtungen pro Kurbelbild
};

const DEMO_T = 1000 / 30;          // die Demo filmt wie eine Kamera mit 30 Bildern pro Sekunde

const VS = `#version 300 es
in vec2 p; out vec2 v;
void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
// eine Teilbelichtung: Licht × Zeit (rgb) und die Zeit (a), aufaddiert
const FS_TEIL = `#version 300 es
precision highp float;
uniform sampler2D uSrc; uniform vec3 uFilter; uniform float uLicht;
in vec2 v; out vec4 o;
void main(){
  vec3 L = pow(texture(uSrc, vec2(v.x, 1.0 - v.y)).rgb, vec3(2.2));
  o = vec4(L * uFilter * uLicht, uLicht);
}`;
// entwickeln: das Mittel über die Zeit, zurück in Pixelwerte
const FS_MITTEL = `#version 300 es
precision highp float;
uniform sampler2D uSumme;
in vec2 v; out vec4 o;
void main(){
  vec4 s = texture(uSumme, v);
  vec3 m = s.a > 0.0 ? s.rgb / s.a : vec3(0.0);
  o = vec4(pow(clamp(m, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

let gl = null, pTeil = null, pMittel = null, src = null, summe = null, fb = null, W = 0, H = 0;
const cv = document.createElement('canvas');
const [teil, teilG] = mk();        // das Kamerabild, wie die Linse es sieht (Zoom, Schwenken, Spiegeln)

function programm(fs){
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
  const u = {}; return { pr, u: n => u[n] || (u[n] = gl.getUniformLocation(pr, n)) };
}
function einrichten(){
  gl = cv.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: false, alpha: false });
  if (!gl) throw new Error('kein WebGL2');
  if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) throw new Error('kein Float-Rendern');
  pTeil = programm(FS_TEIL); pMittel = programm(FS_MITTEL);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  src = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, src);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  summe = gl.createTexture(); fb = gl.createFramebuffer();
}
try { einrichten(); } catch (e) { gl = null; sammeln.anzeige.fehler = String(e.message || e); }

// das neue Sammeln läuft, wenn WebGL2 da ist und es im Labor nicht ausgeschaltet ist
export const sammeltNeu = () => !!gl && sammeln.p.neu && W > 0;

export function groesse(w, h){
  teil.width = w; teil.height = h;
  if (!gl) return;
  W = w; H = h; cv.width = w; cv.height = h;
  // 16 Bit Gleitkomma reichen für ein Kurbelbild (höchstens etwa zehn Teilbelichtungen)
  gl.bindTexture(gl.TEXTURE_2D, summe);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, summe, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE){ sammeln.anzeige.fehler = 'Float-Fläche geht nicht'; gl = null; return; }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  z = null; akt.hoch = false;
}

/* ---------- das aktuelle Kamerabild ---------- */
let akt = { t: 0, tBild: 0, hoch: false, licht: false };   // eingetroffen um t (ms), Zeit im Bild (Demo), schon hochgeladen, hat Licht bekommen
let z = null, teile = 0, ms = 0;                           // z: das offene Kurbelbild
let rvfc = { cam: false, file: false }, meldung = { cam: 0, file: 0 }, demoK = -1, quelleZuletzt = null, gezaehlt = 0, zaehlT = 0;

function hochladen(){
  const t = performance.now();
  sampleInto(teilG, 1, akt.tBild);
  gl.bindTexture(gl.TEXTURE_2D, src);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teil);
  akt.hoch = true;
  ms += performance.now() - t;
}
// wie viele ms der Zeitspanne [von, bis] eines der offenen Fenster trifft
function offen(von, bis){
  let s = 0;
  for (const [a, b] of z.fenster) s += Math.max(0, Math.min(bis, z.t0 + b) - Math.max(von, z.t0 + a));
  return s;
}
// das aktuelle Kamerabild fällt `licht` ms lang auf den Film, durch das Filter der Emulsion
function giesse(licht, filter){
  if (!akt.hoch) hochladen();                 // ist es schon weg (sehr kurzes Fenster zwischen zwei Animationsbildern), nimmt es das neue
  const t = performance.now();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, W, H);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  gl.useProgram(pTeil.pr);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src); gl.uniform1i(pTeil.u('uSrc'), 0);
  gl.uniform3f(pTeil.u('uFilter'), filter[0], filter[1], filter[2]);
  gl.uniform1f(pTeil.u('uLicht'), licht / 1000);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.disable(gl.BLEND);
  if (!akt.licht){ akt.licht = true; teile++; }
  ms += performance.now() - t;
}
// das aktuelle Kamerabild bekommt sein Licht aus der Zeitspanne [von, bis]
function belichte(von, bis){
  if (!z) return;
  const licht = offen(von, bis); if (licht <= 0) return;
  const b = station('emulsion', { t: von, licht, filter: [1, 1, 1] });
  if (b.licht > 0) giesse(b.licht, b.filter);
}
// ein neues Kamerabild ist da: das alte bekommt sein Licht bis jetzt, dann gilt das neue
function kamerabild(t, tBild){
  t = Math.max(t, akt.t);
  if (z) belichte(akt.t, t);
  akt = { t, tBild: tBild ?? t, hoch: false, licht: false };
  gezaehlt++;
  // gleich hochladen, wenn die Blende offen ist oder bald öffnet (später zeigt das Video schon das nächste)
  if (sammeltNeu() && (z || (ctx.kurbel.fps > 0 && ctx.aufnahme !== 'developing' && (!intern.nextAt || intern.nextAt - t < 45)))) hochladen();
}
// Kamera und geladenes Video melden jedes neue Bild selbst, das Video auch nach dem Springen an eine andere Stelle
for (const [v, q] of [[vidCam, 'cam'], [vidFile, 'file']]){
  v.addEventListener('seeked', () => { if (ctx.quelle === q) kamerabild(performance.now()); });
  if (!v.requestVideoFrameCallback) continue;
  rvfc[q] = true;
  const cb = now => { meldung[q] = now; if (ctx.quelle === q) kamerabild(now); v.requestVideoFrameCallback(cb); };
  v.requestVideoFrameCallback(cb);
}

/* ---------- von der Kette aufgerufen ---------- */
// jedes Animationsbild: Takt der Demo, neue Quelle, Kamerabilder zählen
export function tick(now){
  if (ctx.quelle !== quelleZuletzt){ quelleZuletzt = ctx.quelle; demoK = -1; kamerabild(now); }
  else if (ctx.quelle === 'demo'){ const k = Math.floor(now / DEMO_T); if (k !== demoK){ demoK = k; kamerabild(k * DEMO_T, k * DEMO_T); } }
  else {
    // ohne requestVideoFrameCallback, oder wenn es schweigt, obwohl das Video läuft: jedes Animationsbild ein Kamerabild (so bleibt nie ein Bild hängen)
    const v = ctx.quelle === 'cam' ? vidCam : vidFile;
    if (!rvfc[ctx.quelle] || (!v.paused && v.readyState >= 2 && now - meldung[ctx.quelle] > 250)) kamerabild(now);
  }
  if (now - zaehlT >= 1000){ sammeln.anzeige.kameraFps = gezaehlt * 1000 / Math.max(1, now - zaehlT); gezaehlt = 0; zaehlT = now; }
  // hat das aktuelle Bild seit dem Eintreffen Licht bekommen, gleich hochladen, solange es noch zu sehen ist
  if (z && !akt.hoch && offen(akt.t, now) > 0) hochladen();
}
// die Blende öffnet: die Fläche leeren
export function beginne(zyklus){
  z = zyklus; teile = 0;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, W, H);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  if (!akt.hoch) hochladen();                 // das Bild, das gerade zu sehen ist, bekommt gleich Licht
  akt.licht = false;
}
// die Blende schliesst: das letzte Kamerabild bekommt sein Licht bis zum Ende, dann das Mittel nach `acc`
export function schliesse(){
  if (!z) return;
  belichte(akt.t, z.ende);
  if (z.E <= 0) giesse(1, [1, 1, 1]);        // Blende ganz zu: wie bisher das aktuelle Bild, abgeblendet wird danach
  const t = performance.now();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
  gl.useProgram(pMittel.pr);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, summe); gl.uniform1i(pMittel.u('uSumme'), 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  actx.globalCompositeOperation = 'source-over'; actx.globalAlpha = 1;
  actx.drawImage(cv, 0, 0);
  ms += performance.now() - t;
  sammeln.anzeige.teile += (teile - sammeln.anzeige.teile) * 0.2;
  z = null;
}
export function abbrechen(){ z = null; }
// Rechenzeit seit dem letzten Abholen (ms), für die Anzeige im Labor
export function holeZeit(){ const m = ms; ms = 0; return m; }
