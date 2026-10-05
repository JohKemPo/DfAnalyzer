/**
 * Mede fps do grafo via Chrome DevTools Protocol.
 *
 * O arrasto usa Input.dispatchMouseEvent (eventos REAIS de entrada). Um
 * MouseEvent sintetico despachado por JS nao serve: o React Flow usa pointer
 * capture e o ignora -- a medicao sai de uma pagina parada, com 60 fps
 * enganosos.
 *
 * O Node 22 tem WebSocket nativo, entao nao ha dependencia a instalar.
 */
const [, , url, label] = process.argv;

const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page = list.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id);} };
const send = (method, params = {}) =>
  new Promise((res) => { pending.set(++id, res); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value;

await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, 8000));

// comeca a coletar frames
await evaluate(`(() => {
  window.__frames = []; window.__last = performance.now(); window.__run = true;
  const tick = (now) => { window.__frames.push(now - window.__last); window.__last = now;
    if (window.__run) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  return true;
})()`);

// panoramica com eventos reais, ~2 s
let x = 700, y = 500;
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
for (let i = 0; i < 110; i++) {
  x += Math.round(Math.sin(i / 7) * 26);
  y += Math.round(Math.cos(i / 11) * 10);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'left' });
  await new Promise((r) => setTimeout(r, 16));
}
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });

const stats = await evaluate(`(() => {
  window.__run = false;
  const f = window.__frames.slice(5);
  if (f.length < 10) return { erro: 'poucos frames' };
  const sorted = [...f].sort((a, b) => a - b);
  const mean = f.reduce((a, b) => a + b, 0) / f.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const vp = document.querySelector('.react-flow__viewport');
  return {
    nosNoDom: document.querySelectorAll('.react-flow__node').length,
    frames: f.length,
    fpsMedio: +(1000 / mean).toFixed(1),
    fpsP5: +(1000 / p95).toFixed(1),
    piorFrameMs: +sorted[sorted.length - 1].toFixed(1),
    transform: vp ? vp.style.transform : null,
  };
})()`);
console.log(label + ':', JSON.stringify(stats));
ws.close();
