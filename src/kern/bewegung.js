// Der Bewegungssensor des Telefons (Gyroskop). iPhone gibt ihn nur nach einer Frage frei, und nur in einem echten Tipp.
// Schwenken und Anstossen teilen sich diese eine Freigabe.
let status = 'neu';               // neu | fragt | an | gesperrt | fehlt
const hoerer = new Set();
const onMotion = e => { for (const h of hoerer) h(e); };

export const bewegungStatus = () => status;
export function hoere(fn){ hoerer.add(fn); }

export async function frage(){
  if (status !== 'neu') return status;
  if (typeof DeviceMotionEvent === 'undefined'){ status = 'fehlt'; return status; }
  status = 'fragt';
  try {
    if (typeof DeviceMotionEvent.requestPermission === 'function'){
      const r = await DeviceMotionEvent.requestPermission();
      if (r !== 'granted'){ status = 'gesperrt'; return status; }
    }
    status = 'an';
    window.addEventListener('devicemotion', onMotion);
  } catch (e) {
    status = 'neu';               // not inside a real tap yet: try again with the next one
  }
  return status;
}

// rotation about the screen's up and right axes (and around the screen itself) in °/s, whatever way the phone is held
export function drehung(e){
  const r = e.rotationRate; if (!r || r.beta === null) return null;
  const a = ((screen.orientation && screen.orientation.angle) || window.orientation || 0) * Math.PI / 180;
  const b = r.beta || 0, g = r.gamma || 0;
  return { up: b * Math.sin(a) + g * Math.cos(a), right: b * Math.cos(a) - g * Math.sin(a), um: r.alpha || 0 };
}
