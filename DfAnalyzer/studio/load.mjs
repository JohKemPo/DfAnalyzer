/** Mede quanto tempo o grafo leva da navegacao ate os nos aparecerem. */
const [, , url, label] = process.argv;
const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page = list.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id);} };
const send = (m, p = {}) => new Promise((res) => { pending.set(++id, res); ws.send(JSON.stringify({ id, method: m, params: p })); });
const evaluate = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true })).result?.result?.value;

await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: 'about:blank' });
await new Promise((r) => setTimeout(r, 300));

const t0 = Date.now();
await send('Page.navigate', { url });
let ready = 0;
for (let i = 0; i < 300; i++) {
  const n = await evaluate(`document.querySelectorAll('.react-flow__node').length`);
  if (n > 0) { ready = Date.now() - t0; break; }
  await new Promise((r) => setTimeout(r, 50));
}
console.log(label + ':', ready ? `${ready} ms ate os nos aparecerem` : 'nao apareceu em 15 s');
ws.close();
