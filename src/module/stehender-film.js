// Stehender Film (Mehrfachbelichtung): Beim Halten steht der Film im Bildfenster, die Blende dreht weiter.
// Jedes Kurbelbild belichtet dasselbe Stück Film noch einmal. Kurbel = Durchgänge pro Sekunde, Blende = Licht pro Durchgang
// (geschlossen = nichts kommt dazu, ein Standbild). Die Schichten kommen zusammen wie beim Sandwich (zwei Dias übereinander,
// Bipack im Kopierwerk): Licht muss durch alle, Schatten setzen sich durch, Bewegtes verschwindet. Dazu der Lichthof.
// Andere Materialien (Lith, Aufsummieren mit Solarisation, Farbschichten) gehören zu anderen Filmen: IDEEN.md, Filmmaterial.
// Gesammelt wird in linearem Licht mit 32 Bit (WebGL). Loslassen: ein frisches Bild blendet weich hinein.
// Nachklingen (Runde 2c, im Labor): Der Film steht immer, aber er vergisst. Jeder Umlauf belichtet ihn mit dem neuen Bild,
// was früher draufkam, verblasst mit jedem Umlauf ein Stück (Gedächtnis in Umläufen: bei 4 fps lang, bei 24 fps kurz).
// Stehendes bleibt satt, Bewegtes wird durchsichtig und zieht nach, um helle Stellen liegt der Lichthof. Zwei Finger: Das
// Vergessen hört auf, das Bild baut sich auf wie bei accum. Loslassen: Das Gesammelte verklingt von selbst, ohne Überblenden.

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

// Zeigen: Sandwich (geometrisches Mittel, Schatten setzen sich durch) und der Lichthof darüber
const FS_ZEIGEN = `#version 300 es
precision highp float;
uniform sampler2D uB, uH; uniform float uHof;
in vec2 v; out vec4 o;
void main(){
  vec3 G = exp(texture(uB, v).rgb) - 0.004;
  vec3 hof = uHof > 0.0 ? uHof * texture(uH, v).rgb : vec3(0.0);   // Lichthof: gestreutes Licht um helle Stellen
  o = vec4(pow(clamp(G + hof, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

// Lichthof, Schritt 1: das Licht über der Schwelle in einem Sechzehntel der Auflösung sammeln (4×4 Proben pro Block)
const FS_HOF_KLEIN = `#version 300 es
precision highp float;
uniform sampler2D uA; uniform float uGewinn; uniform vec2 uPix;
in vec2 v; out vec4 o;
void main(){
  vec3 s = vec3(0.0);
  for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++){
    vec2 d = (vec2(float(i), float(j)) - 1.5) * 4.0 * uPix;
    s += max(texture(uA, v + d).rgb * uGewinn - 0.5, 0.0);
  }
  o = vec4(s / 16.0, 1.0);
}`;
// Lichthof, Schritt 2: weich verwischen (Gauss, einmal waagrecht, einmal senkrecht), Proben lückenlos ein kleines Pixel auseinander
const FS_HOF_WISCH = `#version 300 es
precision highp float;
uniform sampler2D uH; uniform vec2 uRichtung; uniform float uSigma;
in vec2 v; out vec4 o;
void main(){
  // die Glocke läuft am Rand auf null aus (sonst zeichnet sich der Rand als Viereck ab)
  vec3 s = vec3(0.0); float n = 0.0, rand = exp(-121.0 / (2.0 * uSigma * uSigma));
  for (int i = -10; i <= 10; i++){ float w = max(exp(-float(i * i) / (2.0 * uSigma * uSigma)) - rand, 0.0); s += w * texture(uH, v + float(i) * uRichtung).rgb; n += w; }
  o = vec4(s / n, 1.0);
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
// fest (Maris 2026-10-12: als Regler kaum ein Unterschied)
const ANTEIL = 0.5;      // Licht pro Durchgang bei 180°
// Überblendung beim Loslassen: beginnt und endet weich (ohne Ruck, auch in der Geschwindigkeit; linear wirkte das Ende hart)
const weich = t => t * t * t * (t * (6 * t - 15) + 10);
const mk2d = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d', { alpha: false })]; };

export default {
  id: 'stehenderfilm',
  titel: 'Stehender Film',
  station: 'transport',
  an: 'labor',
  uebernimmtHalten: true,            // beim Halten dreht die Kurbel weiter
  params: {
    lichthof: { typ: 'schalter', def: true, titel: 'Lichthof (Schein um helle Stellen, wächst mit der Haltezeit)' },
    hof: { min: 0, max: 4, def: 0.4, schritt: 0.05, titel: 'Stärke Lichthof' },
    loslassen: { min: 0, max: 3, def: 0.6, schritt: 0.05, titel: 'Überblendung beim Loslassen (ohne Nachklingen)', einheit: ' s' },
    nachklingen: { typ: 'schalter', def: false, titel: 'Nachklingen (der Film steht immer, Altes verblasst; zwei Finger: nichts verblasst)' },
    gedaechtnis: { min: 2, max: 60, def: 8, schritt: 1, titel: 'Gedächtnis beim Nachklingen', einheit: ' Umläufe' },
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
    this.pK = programm(gl, FS_HOF_KLEIN); this.pW = programm(gl, FS_HOF_WISCH);
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
    // Lichthof: zwei kleine Texturen (ein Sechzehntel), 16 Bit, weich gefiltert
    this.hw = Math.max(2, Math.round(W / 16)); this.hh = Math.max(2, Math.round(H / 16));
    this.hof = [0, 1].map(() => {
      const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.hw, this.hh, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0);
      return { tx, fb };
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
  // Lichthof: Licht über der Schwelle klein sammeln und verwischen; der Schein wird mit der Haltezeit grösser
  lichthof(ctx, akt, gewinn){
    const gl = this.gl, [h0, h1] = this.hof;
    gl.viewport(0, 0, this.hw, this.hh);
    gl.bindFramebuffer(gl.FRAMEBUFFER, h0.fb); gl.useProgram(this.pK.pr);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, akt.A); gl.uniform1i(this.pK.u('uA'), 0);
    gl.uniform1f(this.pK.u('uGewinn'), gewinn); gl.uniform2f(this.pK.u('uPix'), 1 / this.W, 1 / this.H);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const sigma = Math.min(4, 0.6 * (1 + Math.log(Math.max(1, this.gewicht))));   // Breite in kleinen Pixeln (1 klein = 16 gross), wächst mit dem Licht
    for (const [von, nach, dx, dy] of [[h0, h1, 1 / this.hw, 0], [h1, h0, 0, 1 / this.hh]]){
      gl.bindFramebuffer(gl.FRAMEBUFFER, nach.fb); gl.useProgram(this.pW.pr);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, von.tx); gl.uniform1i(this.pW.u('uH'), 0);
      gl.uniform2f(this.pW.u('uRichtung'), dx, dy); gl.uniform1f(this.pW.u('uSigma'), sigma);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  },
  zeigen(ctx){
    const gl = this.gl, akt = this.paar[this.i], p = this.p;
    // aufsummiertes Licht im Verhältnis zum ersten Bild: wächst mit jedem Durchgang, logarithmisch wie eine Schwärzungskurve.
    // Davon hängt ab, wie stark helle Stellen streuen.
    const lnG = Math.log(Math.max(1, this.gewicht)), gewinn = 1 + 0.9 * lnG;
    if (p.lichthof) this.lichthof(ctx, akt, gewinn);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, this.W, this.H);
    gl.useProgram(this.pZ.pr);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, akt.B); gl.uniform1i(this.pZ.u('uB'), 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.hof[0].tx); gl.uniform1i(this.pZ.u('uH'), 2);
    gl.uniform1f(this.pZ.u('uHof'), p.lichthof ? p.hof * Math.min(1, lnG / 1.5) : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.stapelG.drawImage(this.cv, 0, 0);
  },
  tick(ctx){
    if (this.aktiv) ctx.bildfenster.drawImage(this.stapel, 0, 0);          // der Greifer zeichnet sonst den laufenden Film darüber
    else if (this.fade) this.mischen(ctx);
  },
  mischen(ctx){
    const f = this.fade, a = f.dauer > 0 ? weich(Math.min(1, (ctx.jetzt - f.t0) / f.dauer)) : 1;
    if (!f.frisch) return;                                               // noch kein frisches Bild seit dem Loslassen
    if (a >= 1){ ctx.bildfenster.drawImage(this.frisch, 0, 0); this.fade = null; ctx.zeichne(); return; }
    const g = ctx.bildfenster;
    g.globalAlpha = 1; g.drawImage(this.stapel, 0, 0);
    g.globalAlpha = a; g.drawImage(this.frisch, 0, 0); g.globalAlpha = 1;
    ctx.zeichne();
  },
  apply(ctx, bild){
    if (!this.gl) return;
    const steht = ctx.halten && !ctx.standbild;            // drei Finger: Standbild, nichts wird gesammelt
    if (this.p.nachklingen){ this.nachklingen(ctx, bild, steht); return; }
    if (steht){
      // Licht dieses Durchgangs: die Blende bestimmt den Anteil, geschlossen kommt nichts dazu
      const w = ANTEIL * Math.max(0, ctx.belichtung.winkel) / 180;
      if (!this.aktiv){ this.aktiv = true; this.fade = null; this.gewicht = 1; this.sammeln(ctx, bild.belichtet, true, 1); }
      else if (w > 0){ this.gewicht += w; this.sammeln(ctx, bild.belichtet, false, w / this.gewicht); }
      this.zeigen(ctx);
      bild.g.drawImage(this.stapel, 0, 0);
      return;
    }
    // Loslassen: der Greifer hat ein frisches Bild ins Fenster gezogen, es blendet über den Stapel.
    // Schon das erste frische Bild wird gemischt (sonst stünde es ein Kurbelbild lang allein da: ein Flackern).
    if (this.aktiv){ this.aktiv = false; this.fade = { t0: ctx.jetzt, dauer: this.p.loslassen * 1000, frisch: false }; }
    if (this.fade){
      this.frischG.drawImage(bild.g.canvas, 0, 0);
      if (!this.fade.frisch){ this.fade.frisch = true; this.fade.t0 = ctx.jetzt; }
      this.mischen(ctx);
    }
  },
  // Nachklingen: jeder Umlauf belichtet den stehenden Film, das Gewicht des Alten verfällt pro Umlauf um q = e^(−1/Gedächtnis).
  // Im Gleichgewicht ist das Gewicht w / (1 − q): weit offene Blende gibt mehr gesammeltes Licht und mehr Lichthof.
  // Zwei Finger: q = 1, nichts verfällt, das Gewicht wächst wie bei accum. Loslassen: es verfällt wieder, das Gesammelte
  // verklingt mit dem Gedächtnis zurück, der Lichthof schrumpft mit dem Gewicht, ohne Sprung.
  nachklingen(ctx, bild, steht){
    const w = ANTEIL * Math.max(0, ctx.belichtung.winkel) / 180;
    const q = steht ? 1 : Math.exp(-1 / this.p.gedaechtnis);
    // was belichtet: beim Halten das frische Bild (der Film steht, wie bei accum.), sonst was der Transport ins Fenster legt
    // (so bleiben Stoss und Schlupf des Greifers sichtbar und klingen mit nach)
    const quelle = steht ? bild.belichtet : bild.g.canvas;
    this.fade = null;
    if (!this.aktiv){
      // Einsetzen: das Bild, das gerade kommt, gleich mit dem Gewicht des Gleichgewichts (kein Anlaufen des Lichthofs)
      this.aktiv = true; this.gewicht = q < 1 ? Math.max(w, 1e-3) / (1 - q) : 1;
      this.sammeln(ctx, quelle, true, 1);
    } else {
      this.gewicht = q * this.gewicht + w;
      // Blende ganz zu: Es kommt kein Licht, das Alte verblasst trotzdem (gegen Schwarz, wie ohne den Film); beim Halten steht es
      const anteil = w > 0 ? w / this.gewicht : steht ? 0 : 1 - q;
      if (anteil > 0) this.sammeln(ctx, quelle, false, anteil);
    }
    this.zeigen(ctx);
    bild.g.drawImage(this.stapel, 0, 0);
  },
  hinweis(ctx){ return this.fehler ? 'Stehender Film braucht WebGL2' : null; },
};
