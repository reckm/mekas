// Gemeinsamer Zustand. Module lesen `ctx`, schreiben aber nicht hinein (ausser über ctx.sag und ctx.zeichne).
// Ohne Abhängigkeiten, damit jede Datei ihn gefahrlos importieren kann.

export const $ = s => document.querySelector(s);
export const mk = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d', { alpha: false })]; };
export const mkVideo = muted => { const v = document.createElement('video'); v.playsInline = true; v.setAttribute('playsinline', ''); v.muted = !!muted; v.preload = 'auto'; return v; };

// Puffer der Kette: Licht sammeln (acc), entwickeltes Bild (expC), Bildfenster (hold), Hilfsfläche (tmp), Ausgabe (out)
export const out = $('#out'), octx = out.getContext('2d', { alpha: false, desynchronized: true });
export const [hold, hctx] = mk(), [acc, actx] = mk(), [tmp, tctx] = mk(), [expC, ectx] = mk();

export const ctx = {
  jetzt: 0, dt: 0,                  // ms (performance.now) und s seit dem letzten Animationsbild
  W: 1280, H: 720,                  // Bildgrösse
  kurbel: { x: 0.78, y: 0, zielX: 0.78, zielY: 0, fps: 0 },   // x: Kurbel, y: Zoom (0..1, mit Trägheit), fps: Kurbelbilder pro Sekunde, 0 beim Halten
  zoom: 1,
  halten: false,                    // zwei Finger oder Leertaste
  ausgabeFps: 24,
  quelle: 'demo',                   // demo | cam | file
  facing: 'environment',
  zeitModus: 'hold',                // hold = Bild steht nach, under = Unterdreht
  aufnahme: 'idle',                 // idle | rec | paused | scrub | busy | developing
  anlauf: { nr: 0, doppel: false }, // zählt jeden Start und jedes Weiter der Aufnahme
  bildNr: 0,                        // zählt jedes entwickelte Kurbelbild
  eingabe: { greiferHaelt: false, einrichten: 0 },   // Gesten auf dem Greifer-Pad
  labor: new URLSearchParams(location.search).has('labor'),
  bildfenster: hctx,                // hier zeichnet das Transport-Modul hinein
  sag: () => {},                    // Meldung zeigen (setzt die Bedienung)
  zeichne: () => { intern.dirty = true; },   // neues Ausgabebild anfordern
};

// Zustand, den sich nur die Kern-Dateien teilen
export const intern = {
  have: false, dirty: false, offen: false, nextAt: 0, projNext: 0, clapFrames: 0, captureNext: false,
  inViewer: !!(window.claude && typeof window.claude.use === 'function'),
};

// Einstellungen des Kerns, die gespeichert werden
export const einst = { resCap: 1280, mirrorView: { user: true, environment: false }, mirrorRec: false, avDelayMs: 0 };
