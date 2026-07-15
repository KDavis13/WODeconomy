/* ============================================================
   WODeconomy — app (implementación vanilla del diseño "Cámara del Tesoro")
   Lógica portada desde WODeconomy.dc.html; datos reales desde data.js.
   ============================================================ */
"use strict";

/* ---------- Catálogo real (transformado desde data.js) ---------- */
const ROMAN = { 1: "I", 2: "II", 3: "III", 4: "IV" };
const CATALOG = [];
CATALOGO.forEach((cat) =>
  cat.items.forEach((it) => {
    CATALOG.push({
      id: it.id,
      cat: cat.categoria,
      nombre: it.nivel ? it.nombre + " " + ROMAN[it.nivel] : it.nombre,
      desc: it.produces + (it.desc ? " · " + it.desc : ""),
      costo: it.cost,
      limit: it.limit || 0,
    });
  })
);

const RDEFS = [
  { key: "dragones", label: "Dragones", icon: "ph-coins" },
  { key: "alimento", label: "Alimento", icon: "ph-grains" },
  { key: "madera", label: "Madera", icon: "ph-tree" },
  { key: "hierro", label: "Hierro", icon: "ph-gear-six" },
  { key: "piedra", label: "Piedra", icon: "ph-mountains" },
];
const SBOX = [
  { key: "dragones", name: "Dragones", icon: "ph-coins", kind: "econ", baseLabel: "Tirada / inicial" },
  { key: "op", name: "Orden público", icon: "ph-scales", kind: "op", baseLabel: "Iniciales" },
  { key: "alimento", name: "Alimento", icon: "ph-grains", kind: "food", baseLabel: "Almacenado" },
  { key: "madera", name: "Madera", icon: "ph-tree", kind: "econ", baseLabel: "Inicial" },
  { key: "hierro", name: "Hierro", icon: "ph-gear-six", kind: "econ", baseLabel: "Inicial" },
  { key: "piedra", name: "Piedra", icon: "ph-mountains", kind: "econ", baseLabel: "Inicial" },
  { key: "ejercito", name: "Ejército", icon: "ph-sword", kind: "plain", baseLabel: "Iniciales" },
  { key: "guarnicion", name: "Guarnición", icon: "ph-shield-checkered", kind: "plain", baseLabel: "Iniciales" },
  { key: "barcos", name: "Barcos", icon: "ph-sailboat", kind: "plain", baseLabel: "Iniciales" },
  { key: "defensa", name: "Defensa", icon: "ph-castle-turret", kind: "plain", baseLabel: "Inicial" },
];
const OP_TIERS = ORDEN_PUBLICO.map((t) => ({
  max: t.max, name: t.nombre, dragones: t.dragones, alimento: t.alimento,
  defensa: t.defensa, intercambio: t.intercambio, extra: t.nota,
}));

/* ---------- Estado ---------- */
const LS = "wodeconomy_v2";
let state = { casas: {}, activeId: "", view: "micasa" };
const ui = {
  cat: "Todo", showCodes: false, importText: "", importMsg: "",
  tablillaText: "", tablillaMsg: "", fichaColapsada: false, copied: "",
};
let copyTimer = null;

/* ---------- Modelo ---------- */
function blankCasa(nombre) {
  const box = () => ({ base: "", mods: [] });
  return {
    nombre: nombre || "Casa sin nombre", cart: {}, meta: { escudo: "", lema: "", miembros: "" },
    f: {
      dragones: box(), op: box(),
      alimento: { base: "", granero: "", consumo: "", mods: [] },
      madera: box(), hierro: box(), piedra: box(),
      ejercito: box(), guarnicion: box(), barcos: box(), defensa: box(),
    },
  };
}
function uid() { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function normalizeCasa(c) {
  if (!c) return blankCasa();
  if (c.f) return { nombre: c.nombre || "Mi Casa", cart: c.cart || {}, meta: c.meta || { escudo: "", lema: "", miembros: "" }, f: c.f };
  const b = blankCasa(c.nombre);
  if (c.res) ["dragones", "alimento", "madera", "hierro", "piedra"].forEach((k) => { if (c.res[k] != null && c.res[k] !== "") b.f[k].base = c.res[k]; });
  if (c.op != null) b.f.op.base = c.op;
  if (c.stats) ["ejercito", "guarnicion", "barcos", "defensa"].forEach((k) => { if (c.stats[k] != null && c.stats[k] !== "") b.f[k].base = c.stats[k]; });
  return { nombre: c.nombre || "Mi Casa", cart: c.cart || {}, meta: c.meta || { escudo: "", lema: "", miembros: "" }, f: b.f };
}
function activeCasa() { return normalizeCasa(state.casas[state.activeId]); }

function encode(casa) {
  const c = normalizeCasa(casa);
  try { return "WODE1:" + btoa(unescape(encodeURIComponent(JSON.stringify({ v: 2, nombre: c.nombre, cart: c.cart, meta: c.meta, f: c.f })))); }
  catch (e) { return ""; }
}
function decode(code) {
  try {
    let s = (code || "").trim();
    if (s.indexOf("WODE1:") === 0) s = s.slice(6);
    const json = s.charAt(0) === "{" ? s : decodeURIComponent(escape(atob(s)));
    const p = JSON.parse(json);
    return normalizeCasa({ nombre: p.nombre || "Casa importada", cart: p.cart, meta: p.meta, f: p.f, res: p.res, op: p.op, stats: p.stats });
  } catch (e) { return null; }
}

/* ---------- Parser de la tablilla del foro ---------- */
function parseTablilla(html) {
  try {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    const root = doc.querySelector(".tablilla") || doc.body;
    const b = blankCasa("Casa");
    const txt = (el) => (el ? el.textContent.trim() : "");
    const nombre = txt(root.querySelector(".cas-head b")) || "Casa";
    const lema = txt(root.querySelector(".cas-head i"));
    const escEl = root.querySelector(".cas-escudo img");
    const escudo = escEl ? escEl.getAttribute("src") || "" : "";
    let miembros = "";
    const info = root.querySelector(".cas-info .cas-text");
    if (info) miembros = info.textContent.replace(/\[\/?list\]/gi, "").split("[*]").map((s) => s.trim()).filter(Boolean).join("\n");
    const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nameMap = [["dragones", "dragones"], ["orden", "op"], ["alimento", "alimento"], ["madera", "madera"], ["hierro", "hierro"], ["piedra", "piedra"], ["ejercito", "ejercito"], ["guarnicion", "guarnicion"], ["barcos", "barcos"], ["defensa", "defensa"]];
    const firstNum = (s) => { const m = (s || "").match(/-?\d[\d.,]*/); return m ? parseInt(m[0].replace(/[.,]/g, ""), 10) : null; };
    root.querySelectorAll(".cas-stats").forEach((bx) => {
      const h = txt(bx.querySelector("h"));
      const hnorm = norm(h);
      let key = null;
      for (const pair of nameMap) { if (hnorm.indexOf(pair[0]) > -1) { key = pair[1]; break; } }
      if (!key) return;
      const box = key === "alimento" ? { base: "", granero: "", consumo: "", mods: [] } : { base: "", mods: [] };
      const headNums = h.replace(/\(.*?\)/g, "");
      const slash = headNums.match(/(-?\d+)\s*\/\s*(-?\d+)/);
      if (slash) { box.base = slash[1]; if (key === "alimento") box.granero = slash[2]; }
      else { const rest = headNums.replace(/[a-záéíóúñ\s]+/i, " "); const nn = firstNum(rest); if (nn != null) box.base = String(nn); }
      const ct = bx.querySelector(".cas-text");
      if (ct) {
        (ct.innerHTML || "").split(/<br\s*\/?>|\n/).forEach((line) => {
          const mm = line.match(/<b>(.*?)<\/b>\s*(.*)/i);
          if (!mm) return;
          const label = mm[1].replace(/\[url=[^\]]*\]/gi, "").replace(/\[\/url\]/gi, "").replace(/<[^>]+>/g, "").replace(/:$/, "").trim();
          const valTxt = mm[2].replace(/<[^>]+>/g, "").trim();
          const num = firstNum(valTxt);
          const ln = norm(label);
          if (key === "alimento" && ln.indexOf("granero") === 0) { if (num != null) box.granero = String(Math.abs(num)); return; }
          if (key === "alimento" && ln.indexOf("consumo") === 0) { if (num != null) box.consumo = String(Math.abs(num)); return; }
          if (ln === "inicial" || ln === "iniciales") { if (num != null && !box.base) box.base = String(num); return; }
          if (ln === "stat" || /^dato/i.test(valTxt) || num == null) return;
          box.mods.push({ l: label, v: String(num) });
        });
      }
      b.f[key] = box;
    });
    return { nombre, cart: {}, meta: { escudo, lema, miembros }, f: b.f };
  } catch (e) { return null; }
}

/* ---------- Persistencia y mutaciones ---------- */
function persist() {
  try { localStorage.setItem(LS, JSON.stringify({ casas: state.casas, activeId: state.activeId, view: state.view })); } catch (e) {}
}
function set(next) { Object.assign(state, next); persist(); render(); }
function patch(fields) {
  const id = state.activeId;
  state.casas = { ...state.casas, [id]: { ...activeCasa(), ...fields } };
  persist(); render();
}
function setBox(key, changes) {
  const f = { ...activeCasa().f };
  f[key] = { ...f[key], ...changes };
  patch({ f });
}
function setBase(key, val) { setBox(key, { base: val }); }

/* ---------- Utilidades ---------- */
function n(v) { const x = parseFloat(v); return isNaN(x) ? 0 : x; }
function fmt(x) { return Math.round(x).toLocaleString("es-ES"); }
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function sanitizeUrl(u) { return /^(https?:|data:image\/)/i.test(u || "") ? u : ""; }
function tierFor(v) { for (const t of OP_TIERS) { if (v <= t.max) return t; } return OP_TIERS[OP_TIERS.length - 1]; }
function sumMods(box) { return (box.mods || []).reduce((a, m) => a + n(m.v), 0); }
function chipsHtml(costo, small) {
  return RDEFS.filter((r) => costo[r.key]).map((r) =>
    `<span style="display:inline-flex;align-items:center;gap:${small ? 3 : 4}px;" title="${r.label}"><i class="ph ${r.icon}" style="color:var(--gold);${small ? "" : "font-size:15px;"}"></i>${fmt(costo[r.key])}</span>`
  ).join("");
}
function copy(key, text) {
  try { navigator.clipboard.writeText(text); } catch (e) {}
  ui.copied = key;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { ui.copied = ""; render(); }, 1800);
  render();
}

/* ---------- Cálculo derivado ---------- */
function compute() {
  const A = activeCasa();
  const F = A.f;
  const opTotal = n(F.op.base) + sumMods(F.op);
  const tier = tierFor(opTotal);
  const aliMods = sumMods(F.alimento);
  const aliNet = aliMods + tier.alimento - n(F.alimento.consumo);
  const aliGranero = n(F.alimento.granero);
  const aliDisp = n(F.alimento.base) + aliNet;
  const disp = {
    dragones: n(F.dragones.base) + sumMods(F.dragones) + tier.dragones,
    alimento: aliDisp,
    madera: n(F.madera.base) + sumMods(F.madera),
    hierro: n(F.hierro.base) + sumMods(F.hierro),
    piedra: n(F.piedra.base) + sumMods(F.piedra),
  };
  const cartIds = Object.keys(A.cart).filter((id) => A.cart[id] > 0);
  const sums = {}; RDEFS.forEach((r) => (sums[r.key] = 0));
  cartIds.forEach((id) => { const it = CATALOG.find((x) => x.id === id); if (it) RDEFS.forEach((r) => { sums[r.key] += (it.costo[r.key] || 0) * A.cart[id]; }); });
  const rest = {}; let noAsequible = false;
  RDEFS.forEach((r) => { rest[r.key] = (disp[r.key] || 0) - (sums[r.key] || 0); if (rest[r.key] < 0) noAsequible = true; });
  const puede = (costo) => RDEFS.every((r) => (costo[r.key] || 0) <= (rest[r.key] || 0));
  return { A, F, opTotal, tier, aliNet, aliGranero, aliDisp, disp, cartIds, sums, rest, noAsequible, puede };
}

/* ---------- Estilos reutilizados (inline, como en el diseño) ---------- */
const CINZEL = "font-family:'Cinzel',serif;";
const H3 = CINZEL + "font-weight:500;letter-spacing:0.16em;text-transform:uppercase;font-size:14px;color:var(--cyan);margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid var(--line-soft);";

/* ============================================================
   RENDER
   ============================================================ */
function render() {
  const focus = captureFocus();
  document.getElementById("app").innerHTML =
    header() +
    filigree() +
    fichaBar() +
    `<main style="position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:22px clamp(20px,5vw,56px) 72px;">` +
      (state.view === "reglas" ? reglasView() : miCasaView()) +
    `</main>` +
    `<footer style="position:relative;z-index:2;text-align:center;padding:0 24px 40px;color:var(--muted);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;${CINZEL}">Win or Die · Cámara del Tesoro</footer>`;
  restoreFocus(focus);
}

function header() {
  const tabBase = "cursor:pointer;" + CINZEL + "letter-spacing:0.12em;text-transform:uppercase;font-size:12px;padding:9px 15px;border-radius:4px;background:transparent;";
  const on = tabBase + "color:#0a0a0b;background:var(--gold);border:1px solid var(--gold);";
  const off = tabBase + "color:var(--gold);border:1px solid var(--gold-dim);";
  const isReglas = state.view === "reglas";
  return (
    `<header style="position:relative;z-index:2;display:flex;align-items:center;gap:20px;padding:22px clamp(24px,5vw,64px) 14px;flex-wrap:wrap;">` +
      `<div style="display:flex;flex-direction:column;gap:2px;margin-right:auto;">` +
        `<span style="${CINZEL}font-weight:700;letter-spacing:0.34em;font-size:22px;color:var(--cyan);line-height:1;">WIN&nbsp;OR&nbsp;DIE</span>` +
        `<span style="${CINZEL}letter-spacing:0.42em;font-size:11px;color:var(--gold);text-transform:uppercase;">Cámara del Tesoro</span>` +
      `</div>` +
      `<nav style="display:flex;gap:6px;">` +
        `<button class="h-goldsoft" data-act="nav" data-view="micasa" style="${isReglas ? off : on}">Mi Casa</button>` +
        `<button class="h-goldsoft" data-act="nav" data-view="reglas" style="${isReglas ? on : off}">Reglas</button>` +
      `</nav>` +
    `</header>`
  );
}
function filigree() {
  return (
    `<div style="position:relative;z-index:2;display:flex;align-items:center;gap:14px;justify-content:center;padding:0 clamp(24px,5vw,64px);">` +
      `<div style="height:1px;flex:1;max-width:420px;background:linear-gradient(to right,transparent,var(--gold-dim));"></div>` +
      `<span style="color:var(--gold);font-size:14px;opacity:0.9;">✦</span>` +
      `<div style="height:1px;flex:1;max-width:420px;background:linear-gradient(to left,transparent,var(--gold-dim));"></div>` +
    `</div>`
  );
}

function fichaBar() {
  const casasList = Object.keys(state.casas).map((id) => {
    const nm = (state.casas[id] && state.casas[id].nombre) || "Casa sin nombre";
    return `<option value="${esc(id)}" ${id === state.activeId ? "selected" : ""}>${esc(nm)}</option>`;
  }).join("");
  const A = activeCasa();
  let codes = "";
  if (ui.showCodes) {
    const tMsgColor = (ui.tablillaMsg || "").charAt(0) === "✓" ? "color:var(--gold);" : "color:var(--danger);";
    const iMsgColor = (ui.importMsg || "").charAt(0) === "✓" ? "color:var(--gold);" : "color:var(--danger);";
    codes =
      `<div style="margin-top:10px;background:var(--panel);border:1px solid var(--gold-dim);border-radius:6px;padding:16px;display:flex;flex-direction:column;gap:8px;">` +
        `<div style="${CINZEL}letter-spacing:0.12em;text-transform:uppercase;font-size:12px;color:var(--gold);">Generar ficha desde la tablilla del foro</div>` +
        `<p style="margin:0;font-size:12px;color:var(--muted);">Pega el código HTML completo de la tablilla de tu Casa. Se creará una ficha con todos los datos y solo tendrás que tirar los dragones.</p>` +
        `<textarea data-act="tablillaInput" data-fid="tablilla" class="inp mono" placeholder="Pega aquí el HTML de la tablilla…" style="width:100%;min-height:120px;font-size:11px;line-height:1.5;padding:10px;resize:vertical;">${esc(ui.tablillaText)}</textarea>` +
        `<div style="display:flex;align-items:center;gap:10px;">` +
          `<button class="h-gold" data-act="cargarTablilla" style="cursor:pointer;${CINZEL}letter-spacing:0.08em;font-size:11px;text-transform:uppercase;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:4px;padding:10px 16px;">Generar ficha</button>` +
          `<span data-msg="tablilla" style="${tMsgColor}font-size:12px;">${esc(ui.tablillaMsg)}</span>` +
        `</div>` +
      `</div>` +
      `<div class="wod-code-grid" style="margin-top:10px;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:16px;display:grid;gap:18px;">` +
        `<div style="display:flex;flex-direction:column;gap:8px;">` +
          `<div style="${CINZEL}letter-spacing:0.12em;text-transform:uppercase;font-size:12px;color:var(--gold);">Código de esta ficha</div>` +
          `<p style="margin:0;font-size:12px;color:var(--muted);">Cópialo para guardar tu gestión o compartirla. Contiene recursos, tirada y compras.</p>` +
          `<textarea readonly class="inp mono" style="width:100%;min-height:110px;font-size:11px;line-height:1.5;padding:10px;resize:vertical;">${esc(encode(A))}</textarea>` +
          `<button class="h-gold" data-act="copyCodigo" style="cursor:pointer;${CINZEL}letter-spacing:0.08em;font-size:11px;text-transform:uppercase;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:4px;padding:10px;">${ui.copied === "codigo" ? "¡Copiado!" : "Copiar código de gestión"}</button>` +
        `</div>` +
        `<div style="display:flex;flex-direction:column;gap:8px;">` +
          `<div style="${CINZEL}letter-spacing:0.12em;text-transform:uppercase;font-size:12px;color:var(--cyan);">Cargar ficha desde código</div>` +
          `<p style="margin:0;font-size:12px;color:var(--muted);">Pega un código y se creará una nueva ficha con todos sus datos rellenados.</p>` +
          `<textarea data-act="importInput" data-fid="import" class="inp inp-cyan mono" placeholder="Pega aquí un código WODE1:…" style="width:100%;min-height:110px;font-size:11px;line-height:1.5;padding:10px;resize:vertical;">${esc(ui.importText)}</textarea>` +
          `<div style="display:flex;align-items:center;gap:10px;">` +
            `<button class="h-cyan" data-act="cargarCodigo" style="cursor:pointer;${CINZEL}letter-spacing:0.08em;font-size:11px;text-transform:uppercase;color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);border-radius:4px;padding:10px 16px;">Cargar ficha</button>` +
            `<span data-msg="import" style="${iMsgColor}font-size:12px;">${esc(ui.importMsg)}</span>` +
          `</div>` +
        `</div>` +
      `</div>`;
  }
  return (
    `<div style="position:relative;z-index:2;max-width:1180px;margin:18px auto 0;padding:0 clamp(20px,5vw,56px);">` +
      `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:9px 12px;">` +
        `<span style="${CINZEL}letter-spacing:0.16em;text-transform:uppercase;font-size:11px;color:var(--gold);">Ficha</span>` +
        `<input data-act="rename" data-fid="rename" class="inp" value="${esc(A.nombre)}" placeholder="Nombre de la Casa" style="min-width:150px;flex:0 1 220px;${CINZEL}letter-spacing:0.04em;" />` +
        `<select data-act="selectCasa" class="inp" style="cursor:pointer;max-width:200px;">${casasList}</select>` +
        `<button class="h-gold" data-act="nuevaCasa" style="cursor:pointer;font-size:12px;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:4px;padding:7px 11px;letter-spacing:0.03em;">+ Nueva</button>` +
        `<button class="h-muted" data-act="duplicarCasa" style="cursor:pointer;font-size:12px;color:var(--muted);background:transparent;border:1px solid var(--line-soft);border-radius:4px;padding:7px 11px;">Duplicar</button>` +
        `<button class="h-danger" data-act="borrarCasa" style="cursor:pointer;font-size:12px;color:var(--muted);background:transparent;border:1px solid var(--line-soft);border-radius:4px;padding:7px 11px;">Borrar</button>` +
        `<button class="h-cyan" data-act="toggleCodes" style="margin-left:auto;cursor:pointer;${CINZEL}letter-spacing:0.06em;font-size:11px;text-transform:uppercase;color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);border-radius:4px;padding:7px 12px;">${ui.showCodes ? "Ocultar códigos ▲" : "Cargar / copiar código ▾"}</button>` +
      `</div>` +
      codes +
    `</div>`
  );
}

function miCasaView() {
  const c = compute();
  const A = c.A, F = c.F;

  // Resumen "disponible este mes"
  const resumen = RDEFS.map((r) => {
    const short = (c.sums[r.key] || 0) > 0;
    const restStyle = (c.rest[r.key] || 0) < 0 ? "color:var(--danger);" : "color:var(--gold);";
    return `<span style="font-size:14px;color:var(--text);"><i class="ph ${r.icon}" title="${r.label}" style="color:var(--gold);font-size:16px;vertical-align:-2px;"></i> <b style="${CINZEL}color:var(--gold);">${fmt(c.disp[r.key] || 0)}</b>` +
      (short ? ` <span style="${restStyle}font-size:12px;">(→ ${fmt(c.rest[r.key] || 0)})</span>` : "") + `</span>`;
  }).join("");

  // Cajas de la ficha
  const boxes = SBOX.map((cfg) => renderBox(cfg, c)).join("");

  const escudo = sanitizeUrl(A.meta && A.meta.escudo);
  const escudoHtml = escudo
    ? `<div style="display:flex;justify-content:center;margin:6px 0 10px;"><img src="${esc(escudo)}" alt="Escudo" style="height:120px;width:auto;object-fit:contain;" /></div>` : "";
  const lemaHtml = A.meta && A.meta.lema
    ? `<p style="text-align:center;color:var(--cyan);font-style:italic;font-size:14px;margin:0 0 14px;">«${esc(A.meta.lema)}»</p>` : "";
  const miembrosHtml = A.meta && A.meta.miembros
    ? `<div style="max-width:520px;margin:0 auto 16px;background:var(--panel);border:1px solid var(--line-soft);border-radius:6px;padding:12px 16px;">` +
        `<div style="${CINZEL}letter-spacing:0.14em;text-transform:uppercase;font-size:11px;color:var(--gold);text-align:center;margin-bottom:6px;">Miembros de la Casa</div>` +
        `<div style="font-size:13px;color:var(--text);line-height:1.7;white-space:pre-line;text-align:center;">${esc(A.meta.miembros)}</div></div>` : "";

  const fichaBody = ui.fichaColapsada ? "" :
    miembrosHtml +
    `<p style="text-align:center;color:var(--muted);font-size:13px;margin:0 auto 20px;max-width:700px;">Ficha cargada desde la tablilla del foro. Solo rellenas la <strong style="color:var(--gold);">tirada de dragones</strong> del mes; el resto son tus datos. Debajo compras en la tienda con lo que tienes disponible.</p>` +
    `<div class="wod-ficha-grid" style="display:grid;gap:14px;margin-bottom:28px;">${boxes}</div>`;

  const tablilla =
    `<div class="tablilla-frame" style="max-width:680px;margin:0 auto 26px;background:linear-gradient(180deg,var(--panel-2),#0c0c0a);border:1px solid var(--gold);border-radius:8px;padding:22px clamp(14px,3vw,26px);box-shadow:inset 0 0 0 1px rgba(199,159,0,0.15),0 10px 40px rgba(0,0,0,0.5);">` +
      escudoHtml +
      `<div style="display:flex;align-items:center;gap:16px;justify-content:center;margin:8px 0 6px;">` +
        `<div style="height:1px;flex:1;background:linear-gradient(to right,transparent,var(--gold-dim));"></div>` +
        `<h2 style="margin:0;${CINZEL}font-weight:600;letter-spacing:0.14em;text-transform:uppercase;font-size:clamp(20px,3vw,28px);color:var(--gold);text-align:center;">Casa ${esc(A.nombre)}</h2>` +
        `<div style="height:1px;flex:1;background:linear-gradient(to left,transparent,var(--gold-dim));"></div>` +
      `</div>` +
      lemaHtml +
      `<div style="background:#0d0d0c;border:1px solid var(--gold-dim);border-radius:8px;padding:12px 16px;margin-bottom:16px;">` +
        `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;">` +
          `<span style="${CINZEL}letter-spacing:0.14em;text-transform:uppercase;font-size:11px;color:var(--gold);">Disponible este mes</span>` +
          `<button class="h-cyan" data-act="toggleFicha" style="cursor:pointer;font-size:11px;color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);border-radius:4px;padding:5px 11px;letter-spacing:0.04em;">${ui.fichaColapsada ? "Mostrar ficha completa ▾" : "Colapsar ficha ▴"}</button>` +
        `</div>` +
        `<div style="display:flex;flex-wrap:wrap;gap:8px 18px;align-items:baseline;">` +
          resumen +
          `<span style="font-size:13px;color:var(--muted);margin-left:auto;"><i class="ph ph-scales" title="Orden público" style="color:var(--gold);vertical-align:-2px;"></i> ${fmt(c.opTotal)} · <span style="color:var(--text);">${esc(c.tier.name)}</span></span>` +
        `</div>` +
      `</div>` +
      fichaBody +
    `</div>`;

  return `<section class="wod-fade">` + tablilla + shopAndCart(c) + `</section>`;
}

function renderBox(cfg, c) {
  const box = c.F[cfg.key];
  const base = n(box.base);
  const sum = sumMods(box);
  const sumFmt = (sum >= 0 ? "+" : "−") + fmt(Math.abs(sum));
  const modsList = (box.mods || []).filter((m) => (m.l && String(m.l).trim()) || (m.v !== "" && m.v != null)).map((m) => {
    const style = n(m.v) < 0 ? "color:var(--danger);" : "color:var(--gold);";
    const vTxt = (n(m.v) >= 0 ? "+" : "−") + fmt(Math.abs(n(m.v)));
    return `<div style="font-size:12.5px;line-height:1.65;color:var(--text);"><b style="color:var(--gold);">${esc(m.l || "Modificador")}:</b> <span style="${style}">${vTxt}</span></div>`;
  }).join("");

  let headerVal = fmt(base) + " (" + sumFmt + ")";
  let footerLabel = "Total", footerValue = fmt(base + sum);
  let restBlock = "", tierNote = "", extraNote = "", foodLine = "", input = "";

  if (cfg.key === "dragones") {
    input =
      `<label style="display:flex;flex-direction:column;gap:3px;margin-bottom:10px;">` +
        `<span style="font-size:10.5px;color:var(--gold);letter-spacing:0.04em;text-transform:uppercase;"><i class="ph ph-coins" style="vertical-align:-1px;"></i> ${esc(cfg.baseLabel)} · rellena tu tirada</span>` +
        `<input type="number" inputmode="numeric" placeholder="0" data-act="setBase" data-key="dragones" data-fid="base-dragones" value="${esc(box.base)}" style="width:100%;background:#161513;border:1px solid var(--gold-dim);border-radius:4px;color:var(--text);${CINZEL}font-size:15px;padding:8px 10px;" />` +
      `</label>`;
  }

  if (cfg.kind === "op") {
    footerLabel = "Estado"; footerValue = fmt(c.opTotal) + " · " + c.tier.name;
    extraNote = c.tier.extra || "Sin modificadores.";
  } else if (cfg.kind === "food") {
    headerVal = fmt(base) + "/" + fmt(c.aliGranero) + " (" + (c.aliNet >= 0 ? "+" : "−") + fmt(Math.abs(c.aliNet)) + ")";
    footerLabel = "Disponible"; footerValue = fmt(c.aliDisp);
    foodLine = `<div style="display:flex;gap:16px;font-size:11.5px;color:var(--muted);margin-bottom:8px;"><span>Granero: <b style="color:var(--text);">${fmt(c.aliGranero)}</b></span><span>Consumo: <b style="color:var(--text);">−${fmt(n(box.consumo))}</b></span></div>`;
    if ((c.sums.alimento || 0) > 0) {
      const rs = c.rest.alimento < 0 ? "color:var(--danger);" : "color:var(--gold);";
      restBlock = restRow(fmt(c.rest.alimento), rs);
    }
    extraNote = "Balance del mes: " + (c.aliNet >= 0 ? "+" : "−") + fmt(Math.abs(c.aliNet)) +
      (c.aliNet < 0 ? " → −" + fmt(Math.abs(c.aliNet)) + " de Orden Público" : (c.aliGranero > 0 && c.aliDisp > c.aliGranero ? " · supera el granero (" + fmt(c.aliGranero) + ")" : ""));
    if (c.tier.alimento) tierNote = "Incluye " + (c.tier.alimento > 0 ? "+" : "") + c.tier.alimento + " de alimento por orden público.";
  } else if (cfg.kind === "econ") {
    footerLabel = "Disponible"; footerValue = fmt(c.disp[cfg.key]);
    if ((c.sums[cfg.key] || 0) > 0) {
      const rs = c.rest[cfg.key] < 0 ? "color:var(--danger);" : "color:var(--gold);";
      restBlock = restRow(fmt(c.rest[cfg.key]), rs);
    }
    if (cfg.key === "dragones" && c.tier.dragones) tierNote = "Incluye " + (c.tier.dragones > 0 ? "+" : "") + c.tier.dragones + " por orden público.";
  } else {
    if (cfg.key === "defensa" && c.tier.defensa) extraNote = "Modificador por orden público: " + (c.tier.defensa > 0 ? "+" : "") + c.tier.defensa;
  }

  return (
    `<div style="background:#0d0d0c;border:1px solid var(--gold-dim);border-radius:6px;display:flex;flex-direction:column;">` +
      `<div style="text-align:center;padding:9px 12px;border-bottom:1px solid var(--gold-dim);">` +
        `<span style="${CINZEL}letter-spacing:0.1em;text-transform:uppercase;font-size:12.5px;color:var(--gold);"><i class="ph ${cfg.icon}" title="${cfg.name}" style="font-size:15px;vertical-align:-2px;"></i> ${esc(cfg.name)} ${headerVal}</span>` +
      `</div>` +
      `<div style="padding:12px;">` +
        input + foodLine + modsList +
        `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;padding-top:10px;border-top:1px solid var(--line-soft);">` +
          `<span style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;">${footerLabel}</span>` +
          `<span style="${CINZEL}font-size:18px;color:var(--text);">${footerValue}</span>` +
        `</div>` +
        restBlock +
        (tierNote ? `<div style="font-size:11px;color:var(--cyan);margin-top:6px;line-height:1.5;">${esc(tierNote)}</div>` : "") +
        (extraNote ? `<div style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.5;">${esc(extraNote)}</div>` : "") +
      `</div>` +
    `</div>`
  );
}
function restRow(val, style) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px;"><span style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;">Tras compras</span><span style="${style}${CINZEL}font-size:16px;">${val}</span></div>`;
}

function shopAndCart(c) {
  const A = c.A;
  // Chips de categoría
  const cats = ["Todo", ...Array.from(new Set(CATALOG.map((i) => i.cat)))];
  const chipBase = "cursor:pointer;font-size:12px;letter-spacing:0.06em;padding:6px 13px;border-radius:20px;background:transparent;";
  const chips = cats.map((cat) => {
    const on = ui.cat === cat;
    const style = chipBase + (on ? "color:var(--gold-soft);border:1px solid var(--gold);" : "color:var(--muted);border:1px solid var(--line-soft);");
    return `<button class="h-chip" data-act="setCat" data-cat="${esc(cat)}" style="${style}">${esc(cat)}</button>`;
  }).join("");

  // Grupos + items
  const visible = CATALOG.filter((i) => ui.cat === "Todo" || i.cat === ui.cat);
  const grupos = [];
  visible.forEach((it) => {
    let g = grupos.find((x) => x.cat === it.cat);
    if (!g) { g = { cat: it.cat, items: [] }; grupos.push(g); }
    g.items.push(it);
  });
  const gruposHtml = grupos.map((g) => {
    const items = g.items.map((it) => {
      const qty = A.cart[it.id] || 0;
      const asequible = c.puede(it.costo);
      const cardStyle = "display:flex;flex-direction:column;background:var(--panel);border:1px solid " + (asequible ? "var(--line-soft)" : "rgba(192,90,74,0.4)") + ";border-radius:6px;padding:14px;" + (asequible ? "" : "opacity:0.75;");
      const addStyle = asequible
        ? "width:100%;cursor:pointer;" + CINZEL + "letter-spacing:0.1em;font-size:12px;text-transform:uppercase;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:4px;padding:9px 10px;"
        : "width:100%;cursor:not-allowed;" + CINZEL + "letter-spacing:0.08em;font-size:11px;text-transform:uppercase;color:var(--danger);background:transparent;border:1px solid rgba(192,90,74,0.4);border-radius:4px;padding:9px 10px;";
      return (
        `<div class="${asequible ? "h-card" : ""}" style="${cardStyle}">` +
          `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;">` +
            `<span style="${CINZEL}font-weight:600;font-size:15px;color:var(--text);letter-spacing:0.02em;">${esc(it.nombre)}</span>` +
            (qty ? `<span style="font-size:11px;color:var(--gold);font-weight:700;white-space:nowrap;">×${qty}</span>` : "") +
          `</div>` +
          `<p style="margin:6px 0 10px;font-size:12px;line-height:1.5;color:var(--muted);flex:1;">${esc(it.desc)}</p>` +
          `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;min-height:18px;font-size:12.5px;color:var(--text);">${chipsHtml(it.costo, false)}</div>` +
          `<button class="${asequible ? "h-gold" : ""}" data-act="addItem" data-id="${esc(it.id)}" style="${addStyle}">${asequible ? "Añadir al carruaje" : "No disponible · sin recursos"}</button>` +
        `</div>`
      );
    }).join("");
    return `<div style="margin-bottom:26px;"><h3 style="${H3}">${esc(g.cat)}</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;">${items}</div></div>`;
  }).join("");

  return (
    `<div class="wod-shop-grid" style="display:grid;gap:26px;align-items:start;">` +
      `<div>` +
        `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">${chips}</div>` +
        gruposHtml +
      `</div>` +
      cartAside(c) +
    `</div>`
  );
}

function cartAside(c) {
  const A = c.A;
  let cartInner;
  if (c.cartIds.length === 0) {
    cartInner = `<p style="text-align:center;color:var(--muted);font-size:12.5px;padding:6px 18px 22px;font-style:italic;">El carruaje está vacío. Añade construcciones, tropas o barcos desde el catálogo.</p>`;
  } else {
    const rows = c.cartIds.map((id) => {
      const it = CATALOG.find((x) => x.id === id);
      return (
        `<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--line-soft);">` +
          `<div style="flex:1;min-width:0;">` +
            `<div style="font-size:13px;color:var(--text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(it.nombre)}</div>` +
            `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:3px;font-size:11px;color:var(--muted);">${chipsHtml(it.costo, true)}</div>` +
          `</div>` +
          `<div style="display:flex;align-items:center;gap:2px;">` +
            `<button class="h-qty" data-act="decItem" data-id="${esc(id)}" style="width:24px;height:24px;cursor:pointer;color:var(--gold);background:transparent;border:1px solid var(--line);border-radius:4px;font-size:15px;line-height:1;display:grid;place-items:center;">−</button>` +
            `<span style="min-width:20px;text-align:center;font-size:13px;color:var(--text);font-weight:700;">${A.cart[id]}</span>` +
            `<button class="h-qty" data-act="incItem" data-id="${esc(id)}" style="width:24px;height:24px;cursor:pointer;color:var(--gold);background:transparent;border:1px solid var(--line);border-radius:4px;font-size:15px;line-height:1;display:grid;place-items:center;">+</button>` +
          `</div>` +
        `</div>`
      );
    }).join("");
    const totales = RDEFS.filter((r) => c.sums[r.key] > 0).map((r) => {
      const rs = c.rest[r.key] < 0 ? "color:var(--danger);" : "color:var(--gold);";
      return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0;font-size:13px;"><span style="color:var(--muted);"><i class="ph ${r.icon}" title="${r.label}" style="color:var(--gold);"></i> ${r.label}</span><span style="color:var(--text);font-variant-numeric:tabular-nums;">−${fmt(c.sums[r.key])} <span style="${rs}">(${fmt(c.rest[r.key])})</span></span></div>`;
    }).join("");
    cartInner =
      `<div><div style="padding:0 14px;">${rows}</div>` +
      `<div style="padding:14px;background:rgba(199,159,0,0.04);">` +
        `<div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;">Coste total · restante</div>` +
        totales +
        `<div style="margin-top:12px;display:flex;gap:8px;">` +
          `<button class="h-gold" data-act="copyCart" style="flex:1;cursor:pointer;${CINZEL}letter-spacing:0.08em;font-size:11px;text-transform:uppercase;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:4px;padding:9px;">${ui.copied === "cart" ? "¡Copiado!" : "Copiar BBCode"}</button>` +
          `<button class="h-muted" data-act="clearCart" style="cursor:pointer;color:var(--muted);background:transparent;border:1px solid var(--line-soft);border-radius:4px;padding:9px 12px;font-size:11px;">Vaciar</button>` +
        `</div>` +
        (c.noAsequible ? `<p style="margin:10px 0 0;font-size:11.5px;color:var(--cyan);text-align:center;">No dispones de recursos suficientes para todo el carruaje.</p>` : "") +
      `</div></div>`;
  }
  return (
    `<aside class="wod-aside" style="display:flex;flex-direction:column;gap:18px;position:sticky;top:18px;">` +
      `<div style="background:var(--panel);border:1px solid var(--line);border-radius:6px;overflow:hidden;">` +
        `<div style="text-align:center;${CINZEL}letter-spacing:0.2em;text-transform:uppercase;font-size:12px;color:var(--gold);padding:14px 14px 10px;">El carruaje</div>` +
        cartInner +
      `</div>` +
      `<div style="display:flex;flex-direction:column;gap:10px;">` +
        `<button class="h-gold" data-act="copyGestion" style="cursor:pointer;${CINZEL}letter-spacing:0.1em;font-size:12px;text-transform:uppercase;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:4px;padding:12px;">${ui.copied === "gestion" ? "¡Copiado!" : "Copiar gestión (BBCode)"}</button>` +
        `<details style="background:var(--panel);border:1px solid var(--line-soft);border-radius:6px;padding:0 14px;">` +
          `<summary style="cursor:pointer;font-size:12px;color:var(--muted);padding:12px 0;letter-spacing:0.04em;list-style:none;">Ver BBCode de la gestión ▾</summary>` +
          `<textarea readonly class="inp mono" style="width:100%;min-height:200px;margin-bottom:14px;font-size:11.5px;line-height:1.5;padding:10px;resize:vertical;">${esc(buildBBGestion(c))}</textarea>` +
        `</details>` +
      `</div>` +
    `</aside>`
  );
}

/* ---------- BBCode ---------- */
function buildBBCart(c) {
  const A = c.A;
  let s = "[b]Pedido — Tienda de Casas[/b]\n";
  c.cartIds.forEach((id) => {
    const it = CATALOG.find((x) => x.id === id);
    const costo = RDEFS.filter((r) => it.costo[r.key]).map((r) => r.label + " " + fmt(it.costo[r.key])).join(", ");
    s += `• ${it.nombre} x${A.cart[id]}  (${costo})\n`;
  });
  s += "\n[b]Coste total:[/b] " + RDEFS.filter((r) => c.sums[r.key] > 0).map((r) => r.label + " " + fmt(c.sums[r.key])).join(" · ");
  return s;
}
function buildBBGestion(c) {
  const A = c.A, F = c.F;
  let s = `[b]Gestión — ${A.nombre}[/b]\n`;
  SBOX.forEach((cfg) => {
    const box = F[cfg.key]; const base = n(box.base); const sum = sumMods(box);
    s += `\n[b]${cfg.name}:[/b] ${fmt(base)}${sum ? " (" + (sum >= 0 ? "+" : "") + fmt(sum) + ")" : ""}`;
    if (cfg.kind === "food") s += ` — granero ${fmt(n(box.granero))}, consumo ${fmt(n(box.consumo))}`;
    (box.mods || []).forEach((m) => { if ((m.l && m.l.trim()) || m.v !== "") s += `\n   • ${m.l || "Mod"}: ${n(m.v) >= 0 ? "+" : ""}${fmt(n(m.v))}`; });
  });
  if (c.cartIds.length) {
    s += `\n\n[b]Compras[/b]`;
    c.cartIds.forEach((id) => { const it = CATALOG.find((x) => x.id === id); s += `\n   • ${it.nombre} x${A.cart[id]}`; });
  }
  s += `\n\n[b]Disponible tras compras[/b]\n` + RDEFS.map((r) => `${r.label}: ${fmt(c.rest[r.key])}`).join("\n");
  return s;
}

/* ---------- Vista Reglas (estática) ---------- */
function reglasView() {
  const rc = (icon, name, txt) => `<div style="background:var(--panel);border:1px solid var(--line-soft);border-radius:6px;padding:12px 14px;"><span style="color:var(--gold);font-weight:700;"><i class="ph ${icon}" style="vertical-align:-2px;"></i> ${name}</span><div style="color:var(--muted);font-size:12.5px;margin-top:3px;">${txt}</div></div>`;
  const opRow = (name, nameColor, rango, ef) => `<tr><td style="padding:9px 10px;border-bottom:1px solid var(--line-soft);color:${nameColor};font-weight:600;">${name}</td><td style="padding:9px 10px;border-bottom:1px solid var(--line-soft);color:var(--muted);">${rango}</td><td style="padding:9px 10px;border-bottom:1px solid var(--line-soft);">${ef}</td></tr>`;
  const fac = (t, v, color) => `<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:4px 0;border-bottom:1px solid var(--line-soft);"><span>${t}</span><span style="color:${color};font-weight:700;">${v}</span></div>`;
  const H = "font-family:'Cinzel',serif;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;font-size:15px;color:var(--cyan);margin:0 0 8px;";
  return (
    `<section class="wod-fade" style="max-width:820px;margin:0 auto;">` +
      `<div style="display:flex;align-items:center;gap:16px;justify-content:center;margin:8px 0 6px;">` +
        `<div style="height:1px;flex:1;background:linear-gradient(to right,transparent,var(--gold-dim));"></div>` +
        `<h2 style="margin:0;${CINZEL}font-weight:600;letter-spacing:0.22em;text-transform:uppercase;font-size:clamp(20px,3vw,28px);color:var(--gold);">Reglas de economía</h2>` +
        `<div style="height:1px;flex:1;background:linear-gradient(to left,transparent,var(--gold-dim));"></div>` +
      `</div>` +
      `<p style="text-align:center;color:var(--muted);font-size:13px;margin:0 auto 30px;max-width:640px;">La economía de cada Casa refleja su capacidad de sostener el dominio, producir recursos, alimentar a su población y mantener sus fuerzas.</p>` +
      `<div style="display:flex;flex-direction:column;gap:26px;font-size:14px;line-height:1.7;color:var(--text);">` +
        `<div><h3 style="${H}">Tirada económica mensual</h3><p style="margin:0;">Entre los días 1 y 7 de cada mes, cada Casa realiza la tirada del dado de <strong style="color:var(--gold);">Dragones</strong>. El resultado es la ganancia base del período; a él se suman los bonos fijos, regionales, de ciudad, de edificios y cualquier otro aplicable. Todas las compras del mes surten efecto en la tirada del mes siguiente. Fuera del período 1–7 no se registra nada.</p></div>` +
        `<div><h3 style="${H}">Recursos</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;">` +
          rc("ph-coins", "Dragones", "Riqueza monetaria: pagan construcciones, tropas, barcos, mejoras, intercambios y eventos.") +
          rc("ph-grains", "Alimento", "Sostiene a la población y a los ejércitos. Se mide por decenas y tiene tope según el granero.") +
          rc("ph-tree", "Madera", "Esencial en las primeras fases: construcción de edificios y fabricación de barcos.") +
          rc("ph-gear-six", "Hierro", "Se extrae de las minas: armamento, herramientas y equipo de guerra.") +
          rc("ph-mountains", "Piedra", "Construcciones sólidas, murallas, edificios de alto nivel y armas de asedio.") +
        `</div></div>` +
        `<div><h3 style="${H}">Rutas comerciales e intercambios</h3><p style="margin:0 0 8px;">Cada ruta comercial activa aporta <strong style="color:var(--gold);">+100 dragones</strong> y se cobra el mismo mes si se registra antes del día 7. Cada Casa empieza con <strong style="color:var(--gold);">2 rutas gratuitas</strong>; de esas 2, solo 1 puede ser con una Casa del mismo reino. Se obtienen más huecos con edificios, mejoras o compras.</p><p style="margin:0;">Las Casas pueden intercambiar recursos o dragones libremente, con un máximo de <strong style="color:var(--gold);">2 intercambios mensuales</strong> (no hace falta ruta abierta). Todo intercambio debe figurar en la ficha de ambas Casas.</p></div>` +
        `<div><h3 style="${H}">Orden público (0–100)</h3><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="text-align:left;color:var(--muted);${CINZEL}letter-spacing:0.08em;text-transform:uppercase;font-size:11px;"><th style="padding:8px 10px;border-bottom:1px solid var(--line);">Estado</th><th style="padding:8px 10px;border-bottom:1px solid var(--line);">Rango</th><th style="padding:8px 10px;border-bottom:1px solid var(--line);">Efectos</th></tr></thead><tbody>` +
          opRow("Jubilosa", "var(--gold)", "86–100", "+200 dragones · +20 alimento · +5 defensa · +1 intercambio · levas sin consumo el 1.º mes") +
          opRow("Contenta", "var(--gold)", "61–85", "+100 dragones · +10 alimento · +2 defensa") +
          opRow("Indiferente", "var(--text)", "31–60", "Sin modificadores") +
          opRow("Descontenta", "var(--cyan)", "11–30", "−100 dragones · −10 alimento · −2 defensa · penalizador leve en la 1.ª leva") +
          opRow("Furiosa", "var(--cyan)", "1–10", "−200 dragones · −20 alimento · −5 defensa · −1 intercambio · riesgo de disturbios") +
          `<tr><td style="padding:9px 10px;color:var(--danger);font-weight:600;">Rebelión</td><td style="padding:9px 10px;color:var(--muted);">0 o menos</td><td style="padding:9px 10px;">Rebelión campesina automática; sin beneficios económicos hasta sofocarla</td></tr>` +
        `</tbody></table></div>` +
        `<h4 style="${CINZEL}font-weight:500;letter-spacing:0.1em;text-transform:uppercase;font-size:12px;color:var(--muted);margin:20px 0 10px;">Factores que lo modifican</h4><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 18px;">` +
          fac("Nacimiento de un hijo/a", "+5", "var(--gold)") + fac("Matrimonio con la familia real", "+5", "var(--gold)") +
          fac("Miembro en la Guardia Real", "+5", "var(--gold)") + fac("Nombrado Consejero Privado", "+5", "var(--gold)") +
          fac("Victoria militar", "+5 / +10 / +15", "var(--gold)") + fac("Nacimiento de un bastardo", "−5", "var(--cyan)") +
          fac("Matrimonio escandaloso", "−5", "var(--cyan)") + fac("Muerte del señor o heredero", "−5", "var(--cyan)") +
          fac("Territorio saqueado (cada vez)", "−5", "var(--cyan)") + fac("Derrota militar", "−5 / −10 / −15", "var(--cyan)") +
          fac("Condenado al Muro o exiliado", "−10", "var(--cyan)") + fac("Ejecutado por traición", "−10", "var(--cyan)") +
        `</div></div>` +
        `<div><h3 style="${H}">Consumo de alimento</h3><p style="margin:0;">El consumo sostiene a la población y a las fuerzas permanentes: las grandes ciudades consumen más que las ciudades menores, y éstas más que un castillo. Ciertas tropas o campañas lo aumentan. Si no se cubre el consumo, se pierde <strong style="color:var(--gold);">1 de Orden Público por cada alimento faltante</strong> (faltan 10 → −10 OP).</p></div>` +
        `<div><h3 style="${H}">Ejército, defensa y flota</h3><p style="margin:0 0 8px;"><strong style="color:var(--gold);">Levas:</strong> campesinos armados; mientras estén movilizadas, reducen la producción. <strong style="color:var(--gold);">Soldados profesionales:</strong> mantenimiento asumible en paz; en campaña hay que pagar su alimento. <strong style="color:var(--gold);">Guarnición:</strong> defensa fija del asentamiento, mínimo 200 efectivos siempre dentro. <strong style="color:var(--gold);">Mercenarios:</strong> leales solo mientras se les paga.</p><p style="margin:0;"><strong style="color:var(--gold);">Defensa:</strong> capacidad de resistir un asedio, se mejora en la tienda. <strong style="color:var(--gold);">Barcos:</strong> transportan tropas, protegen rutas y bloquean puertos; se compran en la Tienda de Casas.</p></div>` +
      `</div>` +
    `</section>`
  );
}

/* ============================================================
   FOCO (restaurar cursor tras re-render)
   ============================================================ */
function captureFocus() {
  const el = document.activeElement;
  if (!el || !el.dataset || !el.dataset.fid) return null;
  const info = { fid: el.dataset.fid };
  try { info.start = el.selectionStart; info.end = el.selectionEnd; } catch (e) {}
  return info;
}
function restoreFocus(info) {
  if (!info) return;
  const el = document.querySelector('[data-fid="' + info.fid + '"]');
  if (!el) return;
  el.focus();
  try { if (info.start != null) el.setSelectionRange(info.start, info.end); } catch (e) {}
}

/* ============================================================
   EVENTOS (delegación sobre #app)
   ============================================================ */
function onAdd(id) {
  const c = compute();
  const it = CATALOG.find((x) => x.id === id);
  if (!it || !c.puede(it.costo)) return;
  const cur = c.A.cart[id] || 0;
  if (it.limit && cur >= it.limit) return;
  patch({ cart: { ...c.A.cart, [id]: cur + 1 } });
}
function onInc(id) {
  const c = compute();
  const it = CATALOG.find((x) => x.id === id);
  if (!it || !c.puede(it.costo)) return;
  const cur = c.A.cart[id] || 0;
  if (it.limit && cur >= it.limit) return;
  patch({ cart: { ...c.A.cart, [id]: cur + 1 } });
}
function onDec(id) {
  const A = activeCasa();
  const q = (A.cart[id] || 0) - 1;
  const cart = { ...A.cart };
  if (q <= 0) delete cart[id]; else cart[id] = q;
  patch({ cart });
}

function handleClick(e) {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  const act = t.dataset.act;
  const S = state;
  switch (act) {
    case "nav": set({ view: t.dataset.view }); break;
    case "nuevaCasa": { const id = uid(); state.casas = { ...S.casas, [id]: blankCasa("Casa " + (Object.keys(S.casas).length + 1)) }; set({ activeId: id }); break; }
    case "duplicarCasa": { const id = uid(); const copia = JSON.parse(JSON.stringify(activeCasa())); copia.nombre = (copia.nombre || "Casa") + " (copia)"; state.casas = { ...S.casas, [id]: copia }; set({ activeId: id }); break; }
    case "borrarCasa": {
      const ids = Object.keys(S.casas);
      if (ids.length <= 1) { const id = S.activeId; state.casas = { [id]: blankCasa("Mi Casa") }; set({ activeId: id }); }
      else { const casas = { ...S.casas }; delete casas[S.activeId]; state.casas = casas; set({ activeId: Object.keys(casas)[0] }); }
      break;
    }
    case "toggleCodes": ui.showCodes = !ui.showCodes; render(); break;
    case "toggleFicha": ui.fichaColapsada = !ui.fichaColapsada; render(); break;
    case "setCat": ui.cat = t.dataset.cat; render(); break;
    case "addItem": onAdd(t.dataset.id); break;
    case "incItem": onInc(t.dataset.id); break;
    case "decItem": onDec(t.dataset.id); break;
    case "clearCart": patch({ cart: {} }); break;
    case "copyCart": copy("cart", buildBBCart(compute())); break;
    case "copyGestion": copy("gestion", buildBBGestion(compute())); break;
    case "copyCodigo": copy("codigo", encode(activeCasa())); break;
    case "cargarTablilla": {
      const casa = parseTablilla(ui.tablillaText);
      if (!casa || !casa.nombre) { ui.tablillaMsg = "No se pudo leer la tablilla. Pega el HTML completo de la ficha."; render(); return; }
      const id = uid(); state.casas = { ...S.casas, [id]: casa };
      ui.tablillaText = ""; ui.tablillaMsg = "✓ Ficha «" + casa.nombre + "» generada.";
      set({ activeId: id });
      break;
    }
    case "cargarCodigo": {
      const casa = decode(ui.importText);
      if (!casa) { ui.importMsg = "Código no válido."; render(); return; }
      const id = uid(); state.casas = { ...S.casas, [id]: casa };
      ui.importText = ""; ui.importMsg = "✓ Ficha «" + casa.nombre + "» cargada.";
      set({ activeId: id });
      break;
    }
  }
}
function handleInput(e) {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  const act = t.dataset.act;
  if (act === "rename") { patch({ nombre: t.value }); }
  else if (act === "setBase") { setBase(t.dataset.key, t.value); }
  else if (act === "tablillaInput") { ui.tablillaText = t.value; ui.tablillaMsg = ""; softClearMsg("tablilla"); }
  else if (act === "importInput") { ui.importText = t.value; ui.importMsg = ""; softClearMsg("import"); }
}
function handleChange(e) {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  if (t.dataset.act === "selectCasa") set({ activeId: t.value });
}
function softClearMsg(which) {
  const el = document.querySelector('[data-msg="' + which + '"]');
  if (el) el.textContent = "";
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  let casas = {}, activeId = "", view = "micasa";
  try {
    const raw = localStorage.getItem(LS);
    if (raw) { const s = JSON.parse(raw); casas = s.casas || {}; activeId = s.activeId || ""; view = s.view === "reglas" ? "reglas" : "micasa"; }
  } catch (e) {}
  if (!Object.keys(casas).length) {
    let old = null;
    try { const o = localStorage.getItem("wodeconomy"); if (o) old = JSON.parse(o); } catch (e) {}
    const id = uid();
    casas[id] = old ? normalizeCasa({ nombre: "Mi Casa", cart: old.cart || {}, res: old.res, op: old.op }) : blankCasa("Mi Casa");
    activeId = id;
  }
  const norm = {}; Object.keys(casas).forEach((k) => (norm[k] = normalizeCasa(casas[k])));
  if (!norm[activeId]) activeId = Object.keys(norm)[0];
  state = { casas: norm, activeId, view };
  persist();

  const app = document.getElementById("app");
  app.addEventListener("click", handleClick);
  app.addEventListener("input", handleInput);
  app.addEventListener("change", handleChange);
  render();
}

document.addEventListener("DOMContentLoaded", init);
