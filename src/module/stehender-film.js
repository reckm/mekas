// Stehender Film (Mehrfachbelichtung): Beim Halten steht der Film im Bildfenster, die Blende dreht weiter.
// Jedes Kurbelbild belichtet dasselbe Stück Film noch einmal. Kurbel = Durchgänge pro Sekunde, Blende = Licht pro Durchgang
// (geschlossen = nichts kommt dazu, ein Standbild). Wie der Film auf das viele Licht reagiert, entscheidet das Material:
// Sandwich (dunkler, Schatten bleiben) ← Graufilter (gleich hell, Bewegtes wird Nebel) → Umkehrfilm (Lichter glühen,
// laufen weich und nicht hart ins Weiss) | Solarisation (Überbelichtetes kippt ins Dunkle).
// Gesammelt wird in linearem Licht mit 32 Bit (WebGL), die Kennlinie des Materials kommt erst beim Zeigen.
// Loslassen: ein frisches Bild blendet weich hinein.

const VS = `#version 300 es
in vec2 p; out vec2 v;
void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

// Sammeln: laufende Mittel (linear und logarithmisch), gewichtet. Werte bleiben um 0..1, das schont die Genauigkeit.
const FS_SAMMELN = `#version 300 es
precision highp float;
uniform sampler2D uSrc, uA, uB; uniform float uAnteil; uniform int uStart;
in vec2 v; layout(location = 0) out vec4 oA; layout(location = 1) out vec4 oB;
void main(){
  vec3 L = pow(texture(uSrc, vec2(v.x, 1.0 - v.y)).rgb, vec3(2.2));
  vec3 g = log(L + 0.004);
  if (uStart == 1){ oA = vec4(L, 1.0); oB = vec4(g, 1.0); return; }
  vec3 a = texture(uA, v).rgb, b = texture(uB, v).rgb;
  oA = vec4(a + uAnteil * (L - a), 1.0); oB = vec4(b + uAnteil * (g - b), 1.0);
}`;

// Zeigen: Kennlinie des Materials auf das gesammelte Licht
const FS_ZEIGEN = `#version 300 es
precision highp float;
uniform sampler2D uA, uB; uniform float uMaterial, uGewinn, uSchulter, uHof, uHofR; uniform vec2 uPix;
in vec2 v; out vec4 o;
vec3 schulter(vec3 x){ float k = uSchulter; return mix(x, k + (1.0 - k) * (1.0 - exp(-(x - k) / (1.0 - k))), step(vec3(k), x)); }
void main(){
  vec3 M = texture(uA, v).rgb;                 // arithmetisches Mittel: Graufilter
  vec3 G = exp(texture(uB, v).rgb) - 0.004;     // geometrisches Mittel: Sandwich, Schatten setzen sich durch
  vec3 X = M * uGewinn;                         // aufsummiertes Licht: Umkehrfilm, wächst mit jedem Durchgang
  if (uHof > 0.0){                              // Lichthof: Licht streut in der Schicht, wächst mit dem gesammelten Licht
    vec3 h = vec3(0.0);
    for (int i = 0; i < 12; i++){
      float w = 6.2831853 * float(i) / 12.0;
      vec2 d = vec2(cos(w), sin(w)) * uHofR * uPix;
      h += max(texture(uA, v + d).rgb * uGewinn - 0.8, 0.0) + 0.5 * max(texture(uA, v + 0.5 * d).rgb * uGewinn - 0.8, 0.0);
    }
    X += uHof * h / 18.0;
  }
  vec3 U = schulter(X);
  vec3 S = X * exp(1.0 - max(X, 1.0));          // Solarisation: über 1 kippt es zurück ins Dunkle
  float m = uMaterial; vec3 c;
  if (m < 0.5) c = mix(G, M, m / 0.5);
  else if (m < 0.85) c = mix(M, U, (m - 0.5) / 0.35);
  else if (m < 0.92) c = U;
  else c = mix(U, S, (m - 0.92) / 0.08);
  o = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

function programm(gl, fs){
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
  const u = n => gl.getUniformLocation(pr, n);
  return { pr, u };
}
const mk2d = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d', { alpha: false })]; };

export default {
  id: 'stehenderfilm',
  titel: 'Stehender Film',
  station: 'transport',
  an: 'labor',
  uebernimmtHalten: true,            // beim Halten dreht die Kurbel weiter
  params: {
    material: { min: 0, max: 1, def: 0.85, schritt: 0.01, titel: 'Material: Sandwich · Graufilter · Umkehrfilm | Solarisation' },
    anteil: { min: 0.02, max: 1, def: 0.5, schritt: 0.01, titel: 'Anteil pro Durchgang (bei 180°)' },
    schulter: { min: 0.3, max: 0.95, def: 0.7, schritt: 0.01, titel: 'Schulter (ab wo die Lichter weich auslaufen)' },
    lichthof: { typ: 'schalter', def: false, titel: 'Lichthof' },
    hof: { min: 0, max: 3, def: 1, schritt: 0.05, titel: 'Stärke Lichthof' },
    loslassen: { min: 0, max: 3, def: 0.6, schritt: 0.05, titel: 'Überblendung beim Loslassen', einheit: ' s' },
  },
  setup(ctx){
    this.cv = document.createElement('canvas');
    [this.stapel, this.stapelG] = mk2d(); [this.frisch, this.frischG] = mk2d();
    this.aktiv = false; this.fade = null; this.W = 0;
    try { this.glEinrichten(); } catch (e) { this.gl = null; this.fehler = String(e); }
  },
  glEinrichten(){
    const gl = this.cv.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: false, alpha: false });
    if (!gl) throw new Error('kein WebGL2');
    this.f32 = !!gl.getExtension('EXT_color_buffer_float');
    if (!this.f32 && !gl.getExtension('EXT_color_buffer_half_float')) throw new Error('kein Float-Rendern');
    gl.getExtension('OES_texture_float_linear');
    this.gl = gl;
    this.pS = programm(gl, FS_SAMMELN); this.pZ = programm(gl, FS_ZEIGEN);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.src = gl.createTexture();
  },
  textur(w, h){
    const gl = this.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.f32 ? gl.RGBA32F : gl.RGBA16F, w, h, 0, gl.RGBA, this.f32 ? gl.FLOAT : gl.HALF_FLOAT, null);
    const filt = this.f32 && !gl.getExtension('OES_texture_float_linear') ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filt); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filt);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  },
  reset(ctx){
    const { W, H } = ctx;
    for (const c of [this.stapel, this.frisch]){ c.width = W; c.height = H; }
    this.aktiv = false; this.fade = null;
    if (!this.gl) return;
    const gl = this.gl;
    this.cv.width = W; this.cv.height = H; this.W = W; this.H = H;
    // zwei Paare (A: linear, B: log) zum Hin-und-her-Rechnen
    this.paar = [0, 1].map(() => {
      const A = this.textur(W, H), B = this.textur(W, H), fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, A, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, B, 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      return { A, B, fb };
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.i = 0;
  },
  // ein Durchgang: das neue Licht kommt mit seinem Anteil zum gesammelten
  sammeln(ctx, quelle, start, anteil){
    const gl = this.gl, von = this.paar[this.i], nach = this.paar[1 - this.i];
    gl.bindTexture(gl.TEXTURE_2D, this.src);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, quelle);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, nach.fb); gl.viewport(0, 0, this.W, this.H);
    gl.useProgram(this.pS.pr);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.src); gl.uniform1i(this.pS.u('uSrc'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, von.A); gl.uniform1i(this.pS.u('uA'), 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, von.B); gl.uniform1i(this.pS.u('uB'), 2);
    gl.uniform1f(this.pS.u('uAnteil'), anteil); gl.uniform1i(this.pS.u('uStart'), start ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.i = 1 - this.i;
  },
  zeigen(ctx){
    const gl = this.gl, akt = this.paar[this.i], p = this.p;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, this.W, this.H);
    gl.useProgram(this.pZ.pr);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, akt.A); gl.uniform1i(this.pZ.u('uA'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, akt.B); gl.uniform1i(this.pZ.u('uB'), 1);
    // aufsummiertes Licht im Verhältnis zum ersten Bild: wächst mit jedem Durchgang, logarithmisch wie eine Schwärzungskurve
    const gewinn = 1 + 0.9 * Math.log(this.gewicht);
    gl.uniform1f(this.pZ.u('uMaterial'), p.material); gl.uniform1f(this.pZ.u('uGewinn'), gewinn);
    gl.uniform1f(this.pZ.u('uSchulter'), p.schulter);
    gl.uniform1f(this.pZ.u('uHof'), p.lichthof ? p.hof * Math.min(1, Math.log(this.gewicht) / 2) : 0);
    gl.uniform1f(this.pZ.u('uHofR'), ctx.H * 0.012 * (1 + Math.log(this.gewicht)));
    gl.uniform2f(this.pZ.u('uPix'), 1 / this.W, 1 / this.H);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.stapelG.drawImage(this.cv, 0, 0);
  },
  tick(ctx){
    if (this.aktiv) ctx.bildfenster.drawImage(this.stapel, 0, 0);          // der Greifer zeichnet sonst den laufenden Film darüber
    else if (this.fade) this.mischen(ctx);
  },
  mischen(ctx){
    const f = this.fade, a = f.dauer > 0 ? (ctx.jetzt - f.t0) / f.dauer : 1;
    if (!f.frisch) return;                                               // noch kein frisches Bild seit dem Loslassen
    if (a >= 1){ ctx.bildfenster.drawImage(this.frisch, 0, 0); this.fade = null; ctx.zeichne(); return; }
    const g = ctx.bildfenster;
    g.globalAlpha = 1; g.drawImage(this.stapel, 0, 0);
    g.globalAlpha = a; g.drawImage(this.frisch, 0, 0); g.globalAlpha = 1;
    ctx.zeichne();
  },
  apply(ctx, bild){
    if (!this.gl) return;
    const steht = ctx.halten;
    if (steht){
      // Licht dieses Durchgangs: die Blende bestimmt den Anteil, geschlossen kommt nichts dazu
      const w = this.p.anteil * Math.max(0, ctx.belichtung.winkel) / 180;
      if (!this.aktiv){ this.aktiv = true; this.fade = null; this.gewicht = 1; this.sammeln(ctx, bild.belichtet, true, 1); }
      else if (w > 0){ this.gewicht += w; this.sammeln(ctx, bild.belichtet, false, w / this.gewicht); }
      this.zeigen(ctx);
      bild.g.drawImage(this.stapel, 0, 0);
      return;
    }
    if (this.aktiv){ this.aktiv = false; this.fade = { t0: ctx.jetzt, dauer: this.p.loslassen * 1000, frisch: false }; return; }
    if (this.fade){
      // der Greifer hat ein frisches Bild ins Fenster gezogen: es blendet über den Stapel
      this.frischG.drawImage(bild.g.canvas, 0, 0);
      if (!this.fade.frisch){ this.fade.frisch = true; this.fade.t0 = ctx.jetzt; }
      this.mischen(ctx);
    }
  },
  hinweis(ctx){ return this.fehler ? 'Stehender Film braucht WebGL2' : null; },
};
