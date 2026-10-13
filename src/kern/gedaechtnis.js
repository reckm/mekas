// Gedächtnis-Schicht: ein Zustand pro Stelle des Bildfensters, den das Licht verändert und der sich mit der Zeit erholt.
// Er lebt von Kurbelbild zu Kurbelbild weiter und rechnet mit jedem Kamerabild weiter, auch bei geschlossener Blende
// (die Zeit läuft). Kein Zufall: nichts Neues pro Kurbelbild, also kein Flackern.
// Er liegt in einem Achtel der Auflösung im WebGL des Sammelns: von selbst weich, billig, und ein kleines Licht
// verändert ihn nur wenig. Ein Film ist ein Rezept: ein Modul an der Station `emulsion` mit
//   rezept: { zustand: GLSL, wirkung: GLSL, reichweite: p => Anteil der Bildbreite }
// und seinen Reglern (im GLSL als `p_<name>`). Es ist immer nur ein Film eingelegt: das erste eingeschaltete Modul mit Rezept.
//   vec4 zustand(vec4 z, vec4 nb, vec3 L, float licht, float dt, float ruehren)   neuer Zustand (Start: vec4(1))
//     z: Zustand, nb: Zustand der Nachbarn (verwischt um die Reichweite), L: Licht dieses Kamerabilds (linear, gemittelt),
//     licht: so viele s fiel es bei offener Blende auf den Film, dt: s seit dem letzten Schritt, ruehren: Anstossen (0..1,5, klingt ab)
//   vec3 wirkung(vec4 z, vec3 L)   wie viel vom Licht einer Teilbelichtung der Film annimmt
import { ctx } from './zustand.js?v=2.2.1';
import { module, istAn } from './kette.js?v=2.2.1';

const TEILER = 8;
const FS_WISCH = `#version 300 es
precision highp float;
uniform sampler2D uH; uniform vec2 uRichtung; uniform float uSigma;
in vec2 v; out vec4 o;
void main(){
  vec4 s = vec4(0.0); float n = 0.0;
  for (int i = -24; i <= 24; i++){
    float x = float(i); if (abs(x) > 3.0 * uSigma) continue;
    float g = exp(-x * x / (2.0 * uSigma * uSigma));
    s += g * texture(uH, v + x * uRichtung); n += g;
  }
  o = s / n;
}`;
const fsZustand = m => `#version 300 es
precision highp float;
uniform sampler2D uZ, uNb, uSrc; uniform vec2 uPix; uniform float uLicht, uDt, uRuehren;
${uniformsVon(m)}
${m.rezept.zustand}
in vec2 v; out vec4 o;
void main(){
  // das Licht dieses Kamerabilds, über den Block gemittelt (4×4 weiche Proben decken 8×8 Bildpunkte)
  vec3 L = vec3(0.0);
  if (uLicht > 0.0){
    for (int a = 0; a < 4; a++) for (int b = 0; b < 4; b++)
      L += pow(texture(uSrc, vec2(v.x, 1.0 - v.y) + (vec2(float(a), float(b)) - 1.5) * 2.0 * uPix).rgb, vec3(2.2));
    L /= 16.0;
  }
  o = zustand(texture(uZ, v), texture(uNb, v), L, uLicht, uDt, uRuehren);
}`;

// die Regler eines Rezepts als uniform float p_<name>
export const uniformsVon = m => Object.entries(m.params || {}).filter(([, d]) => d.typ !== 'wahl').map(([n]) => 'uniform float p_' + n + ';').join('\n');

let gl = null, programm = null, w = 0, h = 0, Wv = 0, Hv = 0;
let zust = [], wisch = [], i = 0, pWisch = null, filmZuletzt = null, ruehrPegel = 0;
const programme = new Map();

export function richteEin(g, prog){ gl = g; programm = prog; pWisch = programm(FS_WISCH); }
export const bereit = () => !!gl && w > 0;
// der eingelegte Film
export const film = () => module.find(m => m.rezept && istAn(m.id)) || null;

function flaeche(){
  const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0);
  return { tx, fb };
}
export function groesse(W, H){
  if (!gl) return;
  for (const f of [...zust, ...wisch]){ gl.deleteTexture(f.tx); gl.deleteFramebuffer(f.fb); }
  Wv = W; Hv = H; w = Math.max(2, Math.ceil(W / TEILER)); h = Math.max(2, Math.ceil(H / TEILER));
  zust = [flaeche(), flaeche()]; wisch = [flaeche(), flaeche()];
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  frisch();
}
// frischer Film: überall voller Zustand
function frisch(){
  for (const f of zust){ gl.bindFramebuffer(gl.FRAMEBUFFER, f.fb); gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
export const zustandTex = () => zust[i].tx;
export function setzeWerte(prog, m){
  for (const [n, d] of Object.entries(m.params || {})) if (d.typ !== 'wahl'){ const v = m.p[n]; gl.uniform1f(prog.u('p_' + n), typeof v === 'boolean' ? (v ? 1 : 0) : v); }
}
function zustandProgramm(m){
  if (!programme.has(m.id)) programme.set(m.id, programm(fsZustand(m)));
  return programme.get(m.id);
}

// jedes Animationsbild: Stösse rühren den Entwickler, das Rühren klingt in etwa einer Drittelsekunde ab
export function fuehle(dt){
  const s = Math.hypot(ctx.stoss.x, ctx.stoss.y);
  ruehrPegel = Math.min(1.5, ruehrPegel * Math.exp(-dt / 0.35) + (1 - Math.exp(-s / 8)));
}

// ein Schritt: das Licht des letzten Kamerabilds (in `src`, `licht` s bei offener Blende) und die vergangene Zeit
export function schritt(src, licht, dt){
  const m = film();
  if (!m || !w){ filmZuletzt = null; return; }
  if (m !== filmZuletzt){ frisch(); filmZuletzt = m; }       // Film neu eingelegt
  const t = performance.now();
  // die Nachbarn: der Zustand weich verwischt, waagrecht und senkrecht
  const sigma = Math.max(0.3, Math.min(8, (m.rezept.reichweite ? m.rezept.reichweite(m.p) : 0.02) * w));
  gl.viewport(0, 0, w, h); gl.useProgram(pWisch.pr); gl.uniform1f(pWisch.u('uSigma'), sigma);
  for (const [von, nach, dx, dy] of [[zust[i], wisch[0], 1 / w, 0], [wisch[0], wisch[1], 0, 1 / h]]){
    gl.bindFramebuffer(gl.FRAMEBUFFER, nach.fb);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, von.tx); gl.uniform1i(pWisch.u('uH'), 0);
    gl.uniform2f(pWisch.u('uRichtung'), dx, dy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  // der Zustand rechnet weiter
  const pr = zustandProgramm(m);
  gl.bindFramebuffer(gl.FRAMEBUFFER, zust[1 - i].fb); gl.useProgram(pr.pr);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, zust[i].tx); gl.uniform1i(pr.u('uZ'), 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, wisch[1].tx); gl.uniform1i(pr.u('uNb'), 1);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, src); gl.uniform1i(pr.u('uSrc'), 2);
  gl.uniform2f(pr.u('uPix'), 1 / Wv, 1 / Hv);
  gl.uniform1f(pr.u('uLicht'), licht); gl.uniform1f(pr.u('uDt'), dt); gl.uniform1f(pr.u('uRuehren'), ruehrPegel);
  setzeWerte(pr, m);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  i = 1 - i;
  gl.activeTexture(gl.TEXTURE0);
  m._ms += performance.now() - t;
}
