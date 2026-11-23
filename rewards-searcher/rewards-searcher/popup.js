const btn = document.getElementById("btn");
const status = document.getElementById("status");
const fill = document.getElementById("fill");
const auto = document.getElementById("auto");

function render({ running, count = 0, total = 25 }) {
  status.textContent = running ? `Buscando… ${count}/${total}` : (count >= total ? `Terminado: ${count}/${total}` : "Listo");
  fill.style.width = `${(count / total) * 100}%`;
  btn.textContent = running ? "Detener" : "Iniciar";
  btn.className = running ? "stop" : "";
}

chrome.storage.local.get(["running", "count", "total", "autoStart"]).then((s) => {
  auto.checked = !!s.autoStart;
  render(s);
});

chrome.storage.onChanged.addListener(() => {
  chrome.storage.local.get(["running", "count", "total"]).then(render);
});

btn.addEventListener("click", async () => {
  const { running } = await chrome.storage.local.get("running");
  chrome.runtime.sendMessage({ cmd: running ? "stop" : "start" });
});

auto.addEventListener("change", () => chrome.storage.local.set({ autoStart: auto.checked }));
