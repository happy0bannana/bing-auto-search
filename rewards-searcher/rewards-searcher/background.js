const TOTAL = 25;
const INTERVAL_MS = 7000;

const QUERIES = [
  "noticias de hoy", "recetas de pollo", "clima en Torreón", "tacos al pastor receta",
  "resultados de futbol", "películas de estreno", "como hacer pizza", "tipo de cambio dolar",
  "mejores series netflix", "ejercicios en casa", "recetas de pasta", "noticias de tecnología",
  "partidos de hoy", "como hacer pan", "canciones populares", "ideas para cenar",
  "noticias deportivas", "receta de enchiladas", "mejores videojuegos", "como ahorrar dinero",
  "recetas de postres", "estrenos de música", "noticias de ciencia", "como hacer café",
  "receta de sopa", "horario de cine", "mejores celulares", "noticias de México",
  "recetas saludables", "libros recomendados", "como cuidar plantas", "receta de hamburguesa",
  "calendario de la NFL", "noticias de salud", "destinos turísticos", "receta de pastel",
  "ofertas del día", "mejores laptops", "como aprender inglés", "receta de tamales"
];

let running = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function run() {
  if (running) return;
  running = true;
  await chrome.storage.local.set({ running: true, count: 0, total: TOTAL });

  const queries = shuffle(QUERIES).slice(0, TOTAL);
  const tab = await chrome.tabs.create({ url: "about:blank", active: false });

  for (let i = 0; i < TOTAL; i++) {
    const { running: still } = await chrome.storage.local.get("running");
    if (!still) break;

    const q = encodeURIComponent(queries[i]);
    try {
      await chrome.tabs.update(tab.id, { url: `https://www.bing.com/search?q=${q}&form=QBLH` });
    } catch (e) {
      break; // la pestaña fue cerrada
    }
    await chrome.storage.local.set({ count: i + 1 });
    await sleep(INTERVAL_MS);
  }

  try { await chrome.tabs.remove(tab.id); } catch (e) {}
  await chrome.storage.local.set({ running: false });
  running = false;
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.cmd === "start") run();
  if (msg.cmd === "stop") chrome.storage.local.set({ running: false });
});

chrome.runtime.onStartup.addListener(async () => {
  const { autoStart } = await chrome.storage.local.get("autoStart");
  if (autoStart) run();
});

// Si el service worker se reinició a media corrida, limpia el estado
chrome.runtime.onInstalled.addListener(() => chrome.storage.local.set({ running: false }));
