// Die Kurbel ist der Taktgeber: seitwärts übers Bild die Bildrate, hoch und runter der Zoom.
import { ctx } from './zustand.js?v=1.1.2';
import { clamp01, ZOOM_MAX } from './mechanik.js?v=1.1.2';

// crank scale: 4-12 fps across most of the travel, 12 up to full speed at the end
export function fpsOf(x){
  x = clamp01(x);
  const pts = [[0, 4], [0.8, 12], [1, Math.max(13, ctx.ausgabeFps)]];
  for (let i = 1; i < pts.length; i++){
    const [x0, f0] = pts[i - 1], [x1, f1] = pts[i];
    if (x <= x1) return f0 * Math.pow(f1 / f0, (x - x0) / (x1 - x0));
  }
  return ctx.ausgabeFps;
}
export const zoomOf = y => 1 + clamp01(y) * (ZOOM_MAX - 1);

// the hand follows the finger with a little inertia; holding stops the crank
export function kurbelTick(dt){
  const k = 1 - Math.exp(-dt / 0.11), c = ctx.kurbel;
  c.x += (c.zielX - c.x) * k; c.y += (c.zielY - c.y) * k;
  ctx.zoom = zoomOf(c.y);
  c.fps = ctx.halten ? 0 : fpsOf(c.x);
}
