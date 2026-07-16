/* ============================================================
   WODeconomy — copia de seguridad (export/import de TODOS los datos)
   Empaqueta las dos claves de localStorage (economía + duelos) en un
   único JSON descargable, y permite restaurarlas en otro navegador/PC.
   Compartido por index.html (economía) y duelo.html (duelos).
   ============================================================ */
"use strict";

const WOD_STORE_KEYS = ["wodeconomy_v2", "wodduelo_v1"];

// Descarga un .json con todos los datos guardados en este navegador.
function wodExportAll() {
  const stores = {};
  WOD_STORE_KEYS.forEach((k) => { const v = localStorage.getItem(k); if (v != null) stores[k] = v; });
  const payload = { _app: "WODeconomy", _version: 1, _exported: new Date().toISOString(), stores };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = "wodeconomy-copia-" + stamp + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Lee un archivo (File) y restaura ambas claves. Llama onDone({ok, n} | {ok:false, msg}).
function wodImportAll(file, onDone) {
  const done = onDone || function () {};
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const data = JSON.parse(reader.result);
      const stores = data && data.stores ? data.stores : data; // tolera JSON "crudo" con las claves al nivel raíz
      let n = 0;
      WOD_STORE_KEYS.forEach((k) => {
        if (stores && stores[k] != null) {
          localStorage.setItem(k, typeof stores[k] === "string" ? stores[k] : JSON.stringify(stores[k]));
          n++;
        }
      });
      if (n > 0) done({ ok: true, n: n });
      else done({ ok: false, msg: "El archivo no contiene datos de WODeconomy." });
    } catch (e) {
      done({ ok: false, msg: "El archivo no es un JSON válido." });
    }
  };
  reader.onerror = function () { done({ ok: false, msg: "No se pudo leer el archivo." }); };
  reader.readAsText(file);
}
