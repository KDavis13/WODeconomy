/* ============================================================
   WODeconomy — app (implementación vanilla del diseño "Cámara del Tesoro")
   Lógica portada desde WODeconomy.dc.html; datos reales desde data.js.
   ============================================================ */
"use strict";

/* ---------- Catálogo real (transformado desde data.js) ---------- */
const ROMAN = { 1: "I", 2: "II", 3: "III", 4: "IV" };
// Efecto mensual/acumulado de cada ítem (para "cerrar mes"): se deriva del texto de `produces`.
function deriveEfecto(it, categoria) {
  const p = it.produces || "";
  const e = {};
  const add = (re, key, mult) => { const m = p.match(re); if (m) e[key] = (e[key] || 0) + parseInt(m[1].replace(/\./g, ""), 10) * (mult || 1); };
  add(/\+(\d[\d.]*)\s*dragones/i, "dragones");
  add(/\+(\d[\d.]*)\s*alimento/i, "alimento");
  add(/\+(\d+)\s*madera/i, "madera");
  add(/\+(\d+)\s*hierro/i, "hierro");
  add(/\+(\d+)\s*piedra/i, "piedra");
  add(/\+(\d+)\s*orden p/i, "op");
  add(/\+(\d+)\s*defensa/i, "defensa");
  add(/\+(\d+)\s*rutas?\s*comercial/i, "dragones", RUTA_COMERCIAL_DRAGONES);
  const gran = p.match(/\+(\d+)\s*capacidad/i); if (gran) e.granero = (e.granero || 0) + parseInt(gran[1], 10);
  const gm = p.match(/guarnici[oó]n:([^]*)$/i);
  if (gm) { let s = 0, m2; const re = /\+(\d+)/g; while ((m2 = re.exec(gm[1]))) s += +m2[1]; if (s) e.guarnicion = (e.guarnicion || 0) + s; }
  if (categoria === "Tropas") e.ejercito = (e.ejercito || 0) + (it.unidades || 0);
  if (categoria === "Barcos") e.barcos = (e.barcos || 0) + 1;
  return e;
}
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
      efecto: deriveEfecto(it, cat.categoria),
      familia: it.nivel ? it.nombre.split(" ")[0] : null, // 1ª palabra (Molino, Mina, Puerta…): el nivel superior sustituye al inferior
    });
  })
);

/* ---------- Territorios (acento por casa) y utilidades de color ---------- */
const TERRITORIOS = [
  { id: "norte", label: "El Norte", color: "#B1A5A5" },
  { id: "valle", label: "El Valle", color: "#6986DD" },
  { id: "rios", label: "Los Ríos", color: "#3fa391" },
  { id: "islashierro", label: "Islas del Hierro", color: "#585C87" },
  { id: "occidente", label: "Occidente", color: "#9c3232" },
  { id: "tierrasdragon", label: "Tierras del Dragón", color: "#8860a3" },
  { id: "dominio", label: "El Dominio", color: "#68A85E" },
  { id: "tormentas", label: "Las Tormentas", color: "#c79f00" },
  { id: "dorne", label: "Dorne", color: "#c77100" },
  { id: "essos", label: "Essos", color: "#B7527E" },
  { id: "nuevos", label: "Nuevos", color: "#6f7a80" },
];
function _hx(h) { h = (h || "#c79f00").replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const v = parseInt(h, 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
function _mix(hex, t, amt) { const a = _hx(hex), b = _hx(t); const c = (x) => ("0" + Math.max(0, Math.min(255, Math.round(x))).toString(16)).slice(-2); return "#" + c(a[0] + (b[0] - a[0]) * amt) + c(a[1] + (b[1] - a[1]) * amt) + c(a[2] + (b[2] - a[2]) * amt); }
function metaFull(m) { return { escudo: "", lema: "", miembros: "", territorio: "", acento: "", ...(m || {}) }; }

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
  tablillaText: "", tablillaMsg: "", fichaColapsada: false, copied: "", mesAplicado: false,
};
let copyTimer = null, mesTimer = null;
// El fundido de entrada solo se reproduce al cambiar de vista, no en cada re-render (evita parpadeos al teclear).
let fadeCls = "", lastView = null;

/* ---------- Modelo ---------- */
function blankCasa(nombre) {
  const box = () => ({ base: "", mods: [] });
  return {
    nombre: nombre || "Casa sin nombre", cart: {}, mes: 1, meta: { escudo: "", lema: "", miembros: "", territorio: "", acento: "" },
    f: {
      dragones: { base: "", dado: "", mods: [] }, op: box(),
      alimento: { base: "", granero: "", consumo: "", mods: [] },
      madera: box(), hierro: box(), piedra: box(),
      ejercito: box(), guarnicion: box(), barcos: box(), defensa: box(),
    },
  };
}
function uid() { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function normalizeCasa(c) {
  if (!c) return blankCasa();
  if (c.f) return { nombre: c.nombre || "Mi Casa", cart: c.cart || {}, mes: c.mes || 1, meta: metaFull(c.meta), f: c.f };
  const b = blankCasa(c.nombre);
  if (c.res) ["dragones", "alimento", "madera", "hierro", "piedra"].forEach((k) => { if (c.res[k] != null && c.res[k] !== "") b.f[k].base = c.res[k]; });
  if (c.op != null) b.f.op.base = c.op;
  if (c.stats) ["ejercito", "guarnicion", "barcos", "defensa"].forEach((k) => { if (c.stats[k] != null && c.stats[k] !== "") b.f[k].base = c.stats[k]; });
  return { nombre: c.nombre || "Mi Casa", cart: c.cart || {}, mes: c.mes || 1, meta: metaFull(c.meta), f: b.f };
}
function activeCasa() { return normalizeCasa(state.casas[state.activeId]); }

function encode(casa) {
  const c = normalizeCasa(casa);
  try { return "WODE1:" + btoa(unescape(encodeURIComponent(JSON.stringify({ v: 2, nombre: c.nombre, cart: c.cart, mes: c.mes, meta: c.meta, f: c.f })))); }
  catch (e) { return ""; }
}
function decode(code) {
  try {
    let s = (code || "").trim();
    if (s.indexOf("WODE1:") === 0) s = s.slice(6);
    const json = s.charAt(0) === "{" ? s : decodeURIComponent(escape(atob(s)));
    const p = JSON.parse(json);
    return normalizeCasa({ nombre: p.nombre || "Casa importada", cart: p.cart, mes: p.mes, meta: p.meta, f: p.f, res: p.res, op: p.op, stats: p.stats });
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
    let territorio = "", acento = "";
    const groupM = ((root.getAttribute && root.getAttribute("style")) || "").match(/--group:\s*([^;\s]+)/i);
    if (groupM) { acento = groupM[1]; const t = TERRITORIOS.find((x) => x.color.toLowerCase() === acento.toLowerCase()); if (t) territorio = t.id; }
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
    return { nombre, cart: {}, meta: { escudo, lema, miembros, territorio, acento }, f: b.f };
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

// Aplica el carruaje a la ficha para el mes siguiente:
// 1) el restante de materiales/alimento pasa a ser la base del próximo mes;
// 2) cada compra se añade como modificador recurrente con nombre;
// 3) se resetea la tirada de dragones, se vacía el carruaje y avanza el mes.
function cerrarMes() {
  const c = compute();
  const A = c.A;
  if (!c.cartIds.length) return;
  const f = JSON.parse(JSON.stringify(A.f));
  const ensure = (k) => { if (!f[k]) f[k] = { base: "", mods: [] }; if (!f[k].mods) f[k].mods = []; return f[k]; };
  ["madera", "hierro", "piedra"].forEach((k) => { ensure(k).base = String(Math.round(c.rest[k] || 0)); });
  const aliBox = ensure("alimento");
  const aliCap = n(aliBox.granero);
  let aliStock = Math.round(c.rest.alimento || 0);
  if (aliCap > 0 && aliStock > aliCap) aliStock = aliCap;
  aliBox.base = String(aliStock);
  c.cartIds.forEach((id) => {
    const it = CATALOG.find((x) => x.id === id);
    if (!it || !it.efecto) return;
    const qty = A.cart[id];
    // Edificios de nivel superior sustituyen al inferior: quita los modificadores de la misma familia.
    if (it.familia) {
      Object.keys(f).forEach((bk) => {
        if (f[bk] && f[bk].mods) f[bk].mods = f[bk].mods.filter((m) => ((m.l || "").split(" ")[0] !== it.familia));
      });
    }
    Object.entries(it.efecto).forEach(([resKey, val]) => {
      const total = val * qty;
      if (!total) return;
      if (resKey === "granero") { const g = ensure("alimento"); g.granero = String(n(g.granero) + total); return; }
      const box = ensure(resKey);
      const etiqueta = it.nombre + (qty > 1 ? " ×" + qty : "");
      const ex = box.mods.find((m) => m.l === etiqueta);
      if (ex) ex.v = String(n(ex.v) + total); else box.mods.push({ l: etiqueta, v: String(total) });
    });
  });
  // Los dragones también arrastran remanente: lo que sobra pasa a ser la base del próximo mes y se resetea la tirada.
  if (f.dragones) { f.dragones.base = String(Math.round(c.rest.dragones || 0)); f.dragones.dado = ""; }
  ui.mesAplicado = true;
  clearTimeout(mesTimer);
  mesTimer = setTimeout(() => { ui.mesAplicado = false; render(); }, 2600);
  patch({ f, cart: {}, mes: (A.mes || 1) + 1 });
}

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
    dragones: n(F.dragones.base) + n(F.dragones.dado) + sumMods(F.dragones) + tier.dragones,
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
  const app = document.getElementById("app");
  const acc = (activeCasa().meta && activeCasa().meta.acento) || "#c79f00";
  app.style.setProperty("--gold", acc);
  app.style.setProperty("--gold-soft", _mix(acc, "#ffffff", 0.25));
  app.style.setProperty("--gold-dim", _mix(acc, "#000000", 0.5));
  const v = state.view;
  fadeCls = v !== lastView ? "wod-fade" : "";
  lastView = v;
  const esMiCasa = v === "micasa" || !["fichas", "consejos", "reglas"].includes(v);
  const body = v === "reglas" ? reglasView() : v === "consejos" ? consejosView() : v === "fichas" ? fichasView() : miCasaView();
  app.innerHTML =
    header() +
    filigree() +
    subnav() +
    (esMiCasa ? fichaBar() : "") +
    `<main style="position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:22px clamp(20px,5vw,56px) 72px;">` +
      body +
    `</main>` +
    `<footer style="position:relative;z-index:2;text-align:center;padding:0 24px 40px;color:var(--muted);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;${CINZEL}">Win or Die · Cámara del Tesoro</footer>`;
  restoreFocus(focus);
}

function header() {
  const tabBase = "cursor:pointer;" + CINZEL + "letter-spacing:0.12em;text-transform:uppercase;font-size:12px;padding:9px 15px;border-radius:4px;background:transparent;white-space:nowrap;";
  const on = tabBase + "color:#0a0a0b;background:var(--gold);border:1px solid var(--gold);";
  const off = tabBase + "color:var(--gold);border:1px solid var(--gold-dim);text-decoration:none;";
  return (
    `<header style="position:relative;z-index:2;display:flex;align-items:center;gap:20px;padding:22px clamp(24px,5vw,64px) 14px;flex-wrap:wrap;">` +
      `<div style="display:flex;flex-direction:column;gap:2px;margin-right:auto;">` +
        `<span style="${CINZEL}font-weight:700;letter-spacing:0.34em;font-size:22px;color:#ffffff;line-height:1;">WIN&nbsp;OR&nbsp;DIE</span>` +
        `<span style="${CINZEL}letter-spacing:0.42em;font-size:11px;color:var(--cyan);text-transform:uppercase;">Cámara del Tesoro</span>` +
      `</div>` +
      `<nav style="display:flex;gap:6px;flex-wrap:wrap;">` +
        `<button class="h-goldsoft" data-act="nav" data-view="micasa" style="${on}">Economía</button>` +
        `<a class="h-goldsoft" href="duelo.html" style="${off}">Duelos</a>` +
        `<a class="h-goldsoft" href="datos.html" style="${off}">Datos</a>` +
      `</nav>` +
    `</header>`
  );
}
function subnav() {
  const subBase = "cursor:pointer;" + CINZEL + "letter-spacing:0.1em;text-transform:uppercase;font-size:11px;padding:6px 12px;border-radius:4px;background:transparent;border:none;";
  const subOn = subBase + "color:var(--gold);border-bottom:2px solid var(--gold);";
  const subOff = subBase + "color:var(--muted);";
  const isMi = state.view === "micasa" || !["fichas", "consejos", "reglas"].includes(state.view);
  const tabs = [["micasa", "Mi ficha", isMi], ["fichas", "Fichas de Casa", state.view === "fichas"], ["consejos", "Consejos", state.view === "consejos"], ["reglas", "Reglas de economía", state.view === "reglas"]];
  const casasSel = Object.keys(state.casas).map((id) => `<option value="${esc(id)}" ${id === state.activeId ? "selected" : ""}>${esc(state.casas[id].nombre || "Casa sin nombre")}</option>`).join("");
  return `<div style="position:relative;z-index:2;display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:14px;">` +
    tabs.map(([v, l, act]) => `<button class="h-tolgold" data-act="nav" data-view="${v}" style="${act ? subOn : subOff}">${l}</button>`).join("") +
    `<span style="width:1px;height:18px;background:var(--line-soft);"></span>` +
    `<select data-act="selectCasa" class="inp" title="Cambiar de Casa" style="cursor:pointer;font-size:12px;padding:6px 8px;max-width:200px;">${casasSel}</select>` +
    `</div>`;
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

// Paneles de generar-desde-tablilla / cargar-desde-código (compartidos).
function codesPanels() {
  const A = activeCasa();
  const tMsgColor = (ui.tablillaMsg || "").charAt(0) === "✓" ? "color:var(--gold);" : "color:var(--danger);";
  const iMsgColor = (ui.importMsg || "").charAt(0) === "✓" ? "color:var(--gold);" : "color:var(--danger);";
  return (
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
    `</div>`
  );
}

function fichasView() {
  const cards = Object.keys(state.casas).map((id) => {
    const cc = normalizeCasa(state.casas[id]);
    const F = cc.f;
    const opT = n(F.op.base) + sumMods(F.op);
    const tier = tierFor(opT);
    const drag = n(F.dragones.base) + n(F.dragones.dado) + sumMods(F.dragones) + tier.dragones;
    const terr = TERRITORIOS.find((t) => t.id === (cc.meta && cc.meta.territorio));
    const color = (cc.meta && cc.meta.acento) || (terr && terr.color) || "#c79f00";
    const activa = id === state.activeId;
    return (
      `<div style="background:var(--panel);border:1px solid var(--line);border-top:3px solid ${color};border-radius:6px;padding:16px;display:flex;flex-direction:column;gap:10px;">` +
        `<div><div style="${CINZEL}font-size:18px;letter-spacing:0.02em;${activa ? "color:var(--gold);font-weight:700;" : "color:var(--text);"}">${esc(cc.nombre || "Casa sin nombre")}</div>` +
        (terr ? `<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;">${esc(terr.label)}</div>` : "") +
        (cc.meta && cc.meta.lema ? `<div style="font-size:12px;color:var(--cyan);font-style:italic;margin-top:2px;">«${esc(cc.meta.lema)}»</div>` : "") +
        `</div>` +
        `<div style="display:flex;gap:14px;font-size:13px;"><span style="color:var(--muted);"><i class="ph ph-coins" style="color:var(--gold);vertical-align:-2px;"></i> ${fmt(drag)}</span><span style="color:var(--muted);"><i class="ph ph-scales" style="color:var(--gold);vertical-align:-2px;"></i> ${fmt(opT)} · ${esc(tier.name)}</span></div>` +
        `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:2px;">` +
          `<button class="h-gold" data-act="edit-casa" data-id="${id}" style="cursor:pointer;flex:1;min-width:80px;${CINZEL}letter-spacing:0.06em;text-transform:uppercase;font-size:11px;color:#0a0a0b;background:var(--gold);border:1px solid var(--gold);border-radius:4px;padding:8px;">Editar</button>` +
          `<button class="h-muted" data-act="dup-casa" data-id="${id}" style="cursor:pointer;font-size:11px;color:var(--muted);background:transparent;border:1px solid var(--line-soft);border-radius:4px;padding:8px 10px;">Duplicar</button>` +
          `<button class="h-cyan" data-act="copy-casa" data-id="${id}" style="cursor:pointer;font-size:11px;color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);border-radius:4px;padding:8px 10px;">${ui.copied === "fic" + id ? "✓" : "Código"}</button>` +
          `<button class="h-danger" data-act="del-casa" data-id="${id}" style="cursor:pointer;width:32px;color:var(--muted);background:transparent;border:1px solid var(--line-soft);border-radius:4px;">×</button>` +
        `</div>` +
      `</div>`
    );
  }).join("");
  return (
    `<section class="${fadeCls}">` +
      `<h2 class="nameplate">Fichas de Casa</h2>` +
      `<p class="hint">Tus Casas guardadas. Edita cualquiera para gestionar su ficha, o crea una nueva desde cero, por código o desde la tablilla del foro.</p>` +
      `<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:22px;">` +
        `<button class="h-gold" data-act="nuevaCasa" style="cursor:pointer;${CINZEL}letter-spacing:0.1em;text-transform:uppercase;font-size:12px;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:6px;padding:11px 18px;">+ Nueva Casa</button>` +
        `<button class="h-cyan" data-act="toggleCodes" style="cursor:pointer;${CINZEL}letter-spacing:0.08em;text-transform:uppercase;font-size:12px;color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);border-radius:6px;padding:11px 18px;">${ui.showCodes ? "Ocultar códigos ▲" : "Cargar / generar por código ▾"}</button>` +
      `</div>` +
      (ui.showCodes ? `<div style="max-width:900px;margin:0 auto 22px;">${codesPanels()}</div>` : "") +
      `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">${cards}</div>` +
    `</section>`
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

  const terrOpts = `<option value="">— Territorio / color —</option>` + TERRITORIOS.map((t) => `<option value="${t.id}" ${(A.meta && A.meta.territorio) === t.id ? "selected" : ""}>${esc(t.label)}</option>`).join("");
  const terrSelect = `<div style="display:flex;justify-content:center;margin:0 0 12px;"><select data-act="territorio" class="inp" title="Territorio de la Casa" style="cursor:pointer;font-size:12px;padding:6px 9px;">${terrOpts}</select></div>`;

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
      terrSelect +
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

  return `<section class="${fadeCls}">` + tablilla + hintsPanel(c) + shopAndCart(c) + `</section>`;
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
    const dado = n(box.dado);
    // Ingreso de este mes = tirada (dado) + bonos recurrentes + orden público. El remanente (base) se arrastra.
    const ingresoMes = dado + sum + c.tier.dragones;
    headerVal = fmt(base) + " (" + (ingresoMes >= 0 ? "+" : "−") + fmt(Math.abs(ingresoMes)) + ")";
    input =
      `<div style="display:flex;gap:8px;margin-bottom:10px;">` +
        `<label style="flex:1;display:flex;flex-direction:column;gap:3px;">` +
          `<span style="font-size:10.5px;color:var(--muted);letter-spacing:0.04em;text-transform:uppercase;">Remanente</span>` +
          `<input type="number" inputmode="numeric" placeholder="0" data-act="setBase" data-key="dragones" data-fid="base-dragones" value="${esc(box.base)}" title="Dragones que te sobraron del mes anterior" style="width:100%;background:#0d0d0c;border:1px solid var(--line-soft);border-radius:4px;color:var(--text);${CINZEL}font-size:15px;padding:8px 10px;" />` +
        `</label>` +
        `<label style="flex:1;display:flex;flex-direction:column;gap:3px;">` +
          `<span style="font-size:10.5px;color:var(--gold);letter-spacing:0.04em;text-transform:uppercase;">🎲 Tirada del mes</span>` +
          `<input type="number" inputmode="numeric" placeholder="0" data-act="setDado" data-key="dragones" data-fid="dado-dragones" value="${esc(box.dado || "")}" title="Resultado del dado de Dragones de este mes" style="width:100%;background:#161513;border:1px solid var(--gold-dim);border-radius:4px;color:var(--text);${CINZEL}font-size:15px;padding:8px 10px;" />` +
        `</label>` +
      `</div>`;
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

/* ---------- Consejos: ingresos, ROI y etiquetas ---------- */
// Ingreso mensual en dragones que aporta un ítem (mercado/gobierno = dragones; caravana/muelle = rutas × 100).
function ingresoMensual(it) {
  const d = (it.desc || "").match(/\+?(\d[\d.]*)\s*dragones/i);
  if (d) return parseInt(d[1].replace(/\./g, ""), 10);
  const r = (it.desc || "").match(/\+?(\d+)\s*rutas?\s*comercial/i);
  if (r) return parseInt(r[1], 10) * RUTA_COMERCIAL_DRAGONES;
  return 0;
}
// Meses hasta amortizar el coste en dragones (0 = no genera ingresos).
function roiMeses(it) {
  const inc = ingresoMensual(it);
  const dcost = it.costo.dragones || 0;
  if (inc <= 0 || dcost <= 0) return 0;
  return Math.max(1, Math.ceil(dcost / inc));
}
const TAGSET = {
  money: { emoji: "💰", short: "Rentable", label: "Se amortiza muy rápido", color: "var(--gold-soft)", border: "var(--gold-dim)", bg: "rgba(199,159,0,0.10)" },
  op: { emoji: "⚖️", short: "+Orden", label: "Sube el Orden Público", color: "var(--cyan)", border: "rgba(130,182,198,0.35)", bg: "rgba(130,182,198,0.08)" },
  long: { emoji: "⏳", short: "Largo plazo", label: "Producción propia · inversión a largo plazo", color: "var(--muted)", border: "var(--line-soft)", bg: "transparent" },
  war: { emoji: "🛡️", short: "Guerra", label: "Útil en tiempos de guerra", color: "var(--danger)", border: "rgba(192,90,74,0.4)", bg: "rgba(192,90,74,0.08)" },
};
function tagsFor(it) {
  const out = []; const id = it.id; const cat = it.cat;
  const roi = roiMeses(it);
  if (roi && roi <= 2) out.push(TAGSET.money);
  if (/^(septo|gobierno|guardia)/.test(id)) out.push(TAGSET.op);
  if (/^(cantera|aserradero|mina|molino|granero)/.test(id)) out.push(TAGSET.long);
  if (cat === "Edificios defensivos" || cat === "Tropas" || cat === "Barcos" || /^guardia/.test(id)) out.push(TAGSET.war);
  return out;
}
function tagsHtml(it) {
  const tags = tagsFor(it);
  if (!tags.length) return "";
  return `<div style="display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 0;">` +
    tags.map((t) => `<span title="${t.label}" style="display:inline-flex;align-items:center;gap:3px;font-size:10px;letter-spacing:0.03em;padding:2px 7px;border-radius:20px;border:1px solid ${t.border};color:${t.color};background:${t.bg};">${t.emoji} ${t.short}</span>`).join("") +
    `</div>`;
}
function roiHtml(it) {
  const m = roiMeses(it);
  if (!m) return "";
  const inc = ingresoMensual(it);
  return `<div style="font-size:11px;color:var(--gold-soft);margin:-4px 0 10px;"><i class="ph ph-arrows-clockwise" style="vertical-align:-1px;"></i> Se amortiza en ${m === 1 ? "1 mes" : "~" + m + " meses"} (+${fmt(inc)} dragones/mes)</div>`;
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
          tagsHtml(it) +
          `<p style="margin:6px 0 10px;font-size:12px;line-height:1.5;color:var(--muted);flex:1;">${esc(it.desc)}</p>` +
          `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;min-height:18px;font-size:12.5px;color:var(--text);">${chipsHtml(it.costo, false)}</div>` +
          roiHtml(it) +
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
        `<button class="h-gold" data-act="cerrarMes" style="width:100%;margin-top:12px;cursor:pointer;${CINZEL}letter-spacing:0.08em;font-size:11px;text-transform:uppercase;color:#0a0a0b;background:var(--gold);border:1px solid var(--gold);border-radius:4px;padding:11px;">${ui.mesAplicado ? "✓ Compras aplicadas al nuevo mes" : "Aplicar compras · cerrar mes"}</button>` +
        `<p style="margin:8px 0 0;font-size:10.5px;color:var(--muted);text-align:center;line-height:1.5;">Descuenta el coste, guarda el restante como base del próximo mes y añade cada compra como modificador recurrente en tu ficha.</p>` +
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
// Coste de una línea (precio unitario × cantidad), como texto "400 dragones, 20 alimento".
function costoLineaTxt(costo, qty) {
  return RDEFS.filter((r) => costo[r.key]).map((r) => fmt(costo[r.key] * qty) + " " + r.label.toLowerCase()).join(", ");
}
function buildBBCart(c) {
  const A = c.A;
  let s = `[b]Compras del mes — Casa ${A.nombre}[/b]\n`;
  if (c.cartIds.length === 0) return s + "\n(Sin compras este mes.)";

  // 1) Compras realizadas, cada una con su coste total.
  s += `\n[b]Compras realizadas[/b]\n`;
  c.cartIds.forEach((id) => {
    const it = CATALOG.find((x) => x.id === id);
    s += `• ${it.nombre} ×${A.cart[id]} — ${costoLineaTxt(it.costo, A.cart[id])}\n`;
  });

  // 2) Coste total por recurso.
  s += `\n[b]Coste total[/b]\n`;
  RDEFS.filter((r) => c.sums[r.key] > 0).forEach((r) => { s += `${r.label}: ${fmt(c.sums[r.key])}\n`; });

  // 3) Disponible tras las compras (disponible − coste = restante).
  s += `\n[b]Disponible tras las compras[/b]\n`;
  RDEFS.forEach((r) => {
    if ((c.disp[r.key] || 0) === 0 && (c.sums[r.key] || 0) === 0) return;
    s += `${r.label}: ${fmt(c.disp[r.key] || 0)} − ${fmt(c.sums[r.key] || 0)} = ${fmt(c.rest[r.key] || 0)}\n`;
  });
  return s.replace(/\n+$/, "");
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
    c.cartIds.forEach((id) => { const it = CATALOG.find((x) => x.id === id); s += `\n   • ${it.nombre} ×${A.cart[id]} — ${costoLineaTxt(it.costo, A.cart[id])}`; });
    s += `\n[b]Coste total:[/b] ` + RDEFS.filter((r) => c.sums[r.key] > 0).map((r) => `${r.label} ${fmt(c.sums[r.key])}`).join(" · ");
  }
  s += `\n\n[b]Disponible tras compras[/b]\n` + RDEFS.map((r) => `${r.label}: ${fmt(c.rest[r.key])}`).join("\n");
  return s;
}

/* ---------- Pistas contextuales (según la ficha activa) ---------- */
function hints(c) {
  const out = [];
  const op = c.opTotal;
  const septo = (g) => (g <= 10 ? "I" : g <= 20 ? "II" : g <= 30 ? "III" : "IV");
  if (op < 61) {
    const gap = 61 - op;
    out.push({ tone: "gold", icon: "ph-scales", text: `Tu Orden Público es <b>${fmt(op)}</b> (${c.tier.name}). Con <b>+${gap}</b> llegarías a <b>Contenta</b>: +100 dragones y +10 alimento fijos cada mes. Un <b>Septo ${septo(gap)}</b> lo cubriría.` });
  } else if (op < 86) {
    const gap = 86 - op;
    out.push({ tone: "gold", icon: "ph-scales", text: `Estás en <b>Contenta</b> (${fmt(op)}). Con <b>+${gap}</b> más llegarías a <b>Jubilosa</b>: +200 dragones, +20 alimento, +5 defensa y +1 intercambio cada mes.` });
  } else {
    out.push({ tone: "gold", icon: "ph-crown", text: `Orden Público en <b>Jubilosa</b> (${fmt(op)}): ya recibes el máximo bonus mensual (+200 dragones). ¡Mantenlo!` });
  }
  if (c.aliNet < 0) {
    out.push({ tone: "danger", icon: "ph-grains", text: `Tu balance de alimento es negativo (<b>${fmt(c.aliNet)}</b>). Si no cubres el consumo pierdes <b>1 de Orden Público por cada alimento que falte</b>. Un Molino o un intercambio lo arreglan.` });
  } else if (c.aliGranero > 0 && c.aliDisp > c.aliGranero) {
    out.push({ tone: "cyan", icon: "ph-grains", text: `Superas la capacidad del granero (<b>${fmt(c.aliGranero)}</b>): el excedente de alimento se pierde. Amplía con un <b>Granero</b> o véndelo.` });
  }
  out.push({ tone: "cyan", icon: "ph-coins", text: `Prioriza <b>Mercado</b> y <b>Gobierno</b>: se amortizan en ~1 mes y disparan tus dragones. Las rutas comerciales (+100/mes) son casi gratis con una <b>Caravana</b>.` });
  return out;
}
function hintsPanel(c) {
  const toneColor = { gold: "var(--gold)", cyan: "var(--cyan)", danger: "var(--danger)" };
  const rows = hints(c).map((hp) =>
    `<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line-soft);">` +
      `<i class="ph ${hp.icon}" style="color:${toneColor[hp.tone]};font-size:18px;margin-top:2px;flex:0 0 auto;"></i>` +
      `<span style="font-size:13px;line-height:1.6;color:var(--text);">${hp.text}</span>` +
    `</div>`
  ).join("");
  return (
    `<div style="max-width:680px;margin:0 auto 26px;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:16px 18px;">` +
      `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">` +
        `<i class="ph ph-lightbulb" style="color:var(--gold);"></i>` +
        `<span style="${CINZEL}letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:var(--gold);">Consejos del maestre de moneda</span>` +
      `</div>` +
      rows +
    `</div>`
  );
}

/* ---------- Vista Consejos (guía estratégica) ---------- */
function consejosView() {
  const H = "font-family:'Cinzel',serif;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;font-size:15px;color:var(--cyan);margin:0 0 10px;";
  const card = (icon, titulo, cuerpo) =>
    `<div style="background:var(--panel);border:1px solid var(--line-soft);border-radius:6px;padding:14px 16px;"><div style="${CINZEL}color:var(--gold);font-size:13px;letter-spacing:0.06em;margin-bottom:4px;"><i class="ph ${icon}" style="vertical-align:-2px;"></i> ${titulo}</div><div style="font-size:13px;color:var(--text);line-height:1.6;">${cuerpo}</div></div>`;
  const roiRow = (item, coste, efecto, roi) =>
    `<tr><td style="padding:8px 10px;border-bottom:1px solid var(--line-soft);color:var(--text);">${item}</td><td style="padding:8px 10px;border-bottom:1px solid var(--line-soft);color:var(--muted);">${coste}</td><td style="padding:8px 10px;border-bottom:1px solid var(--line-soft);">${efecto}</td><td style="padding:8px 10px;border-bottom:1px solid var(--line-soft);color:var(--gold);font-weight:700;">${roi}</td></tr>`;
  return (
    `<section class="${fadeCls}" style="max-width:820px;margin:0 auto;">` +
      `<div style="display:flex;align-items:center;gap:16px;justify-content:center;margin:8px 0 6px;">` +
        `<div style="height:1px;flex:1;background:linear-gradient(to right,transparent,var(--gold-dim));"></div>` +
        `<h2 style="margin:0;${CINZEL}font-weight:600;letter-spacing:0.22em;text-transform:uppercase;font-size:clamp(20px,3vw,28px);color:var(--gold);">Consejos de compra</h2>` +
        `<div style="height:1px;flex:1;background:linear-gradient(to left,transparent,var(--gold-dim));"></div>` +
      `</div>` +
      `<p style="text-align:center;color:var(--muted);font-size:13px;margin:0 auto 30px;max-width:640px;">Guía estratégica basada en los precios y efectos del sistema. Son orientaciones: tu <strong style="color:var(--gold);">bono regional</strong> y el contexto de rol pueden cambiar las prioridades.</p>` +
      `<div style="display:flex;flex-direction:column;gap:26px;">` +

        `<div><h3 style="${H}">💰 Corto plazo · bola de nieve económica</h3><div style="display:grid;grid-template-columns:1fr;gap:10px;">` +
          card("ph-storefront", "Mercado", "La mejor inversión del juego. El Nivel I cuesta 400 dragones y da <b>+400/mes</b>: se paga en <b>1 mes</b> y a partir de ahí es beneficio puro. Sube de nivel en cuanto puedas.") +
          card("ph-bank", "Gobierno", "Barato y con doble retorno: <b>dragones + Orden Público</b>. El Nivel I (100 dragones) da +100/mes y +5 OP.") +
          card("ph-path", "Caravana / Muelle", "Cada ruta comercial aporta <b>+100 dragones/mes</b>. Una Caravana I cuesta 100 dragones: se amortiza en un mes.") +
        `</div></div>` +

        `<div><h3 style="${H}">⏳ Largo plazo · lo que compone con el tiempo</h3><div style="display:grid;grid-template-columns:1fr;gap:10px;">` +
          card("ph-scales", "Orden Público", "La mejor inversión a largo plazo. <b>Contenta (61+)</b> son +100 dragones y +10 alimento fijos al mes; <b>Jubilosa (86+)</b>, +200 dragones, +20 alimento, +5 defensa y +1 intercambio. Un <b>Septo</b> se rentabiliza solo por el bonus mensual.") +
          card("ph-tree", "Producción propia", "Aserradero, cantera, mina y molino te independizan de comprar materiales. Si tu región da bono, se <b>multiplica por nivel</b>, así que escalan muy bien.") +
          card("ph-grains", "Granero", "Sin capacidad tiras el excedente de alimento. Amplíalo antes de invertir fuerte en producción de comida.") +
        `</div></div>` +

        `<div><h3 style="${H}">🛡️ Tiempos de guerra</h3><div style="display:grid;grid-template-columns:1fr;gap:10px;">` +
          card("ph-castle-turret", "Defensa", "Murallas (piedra), torres y puertas fortificadas (piedra + hierro) son lo que aguanta un asedio prolongado.") +
          card("ph-shield-checkered", "Guardia urbana", "Sube Orden Público <b>y</b> te da guarnición (defensa fija del asentamiento).") +
          card("ph-grains", "Alimento para la campaña", "Los ejércitos en campaña comen. Si no cubres el consumo pierdes Orden Público (−1 por cada alimento que falte). Refuerza Molino + Granero antes de reclutar.") +
          card("ph-crown", "Mantén el OP alto", "Da +defensa y evita rebeliones justo cuando más te asedian. En guerra, un OP bajo es una segunda derrota.") +
        `</div></div>` +

        `<div><h3 style="${H}">Retorno de inversión destacado</h3><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">` +
          `<thead><tr style="text-align:left;color:var(--muted);${CINZEL}letter-spacing:0.08em;text-transform:uppercase;font-size:11px;"><th style="padding:8px 10px;border-bottom:1px solid var(--line);">Compra</th><th style="padding:8px 10px;border-bottom:1px solid var(--line);">Coste</th><th style="padding:8px 10px;border-bottom:1px solid var(--line);">Efecto</th><th style="padding:8px 10px;border-bottom:1px solid var(--line);">Amortización</th></tr></thead><tbody>` +
            roiRow("Mercado I", "400 dragones", "+400 dragones/mes", "1 mes") +
            roiRow("Gobierno I", "100 dr. + 3 madera", "+100 dragones/mes, +5 OP", "1 mes") +
            roiRow("Caravana I", "100 dr. + 2 madera", "+1 ruta (+100/mes)", "1 mes") +
            roiRow("Mercado II", "450 dr. + 4 madera", "+800 dragones/mes", "< 1 mes") +
          `</tbody></table></div></div>` +

        `<div style="background:rgba(192,90,74,0.06);border:1px solid rgba(192,90,74,0.3);border-radius:6px;padding:14px 16px;font-size:13px;color:var(--text);line-height:1.6;"><b style="color:var(--danger);">⚠️ Cuidado:</b> reclutar tropas sube el mantenimiento de alimento, y las levas movilizadas reducen tu producción. No te lances a reclutar sin cubrir el alimento primero.</div>` +

      `</div>` +
    `</section>`
  );
}

/* ---------- Vista Reglas (estática) ---------- */
function reglasView() {
  const rc = (icon, name, txt) => `<div style="background:var(--panel);border:1px solid var(--line-soft);border-radius:6px;padding:12px 14px;"><span style="color:var(--gold);font-weight:700;"><i class="ph ${icon}" style="vertical-align:-2px;"></i> ${name}</span><div style="color:var(--muted);font-size:12.5px;margin-top:3px;">${txt}</div></div>`;
  const opRow = (name, nameColor, rango, ef) => `<tr><td style="padding:9px 10px;border-bottom:1px solid var(--line-soft);color:${nameColor};font-weight:600;">${name}</td><td style="padding:9px 10px;border-bottom:1px solid var(--line-soft);color:var(--muted);">${rango}</td><td style="padding:9px 10px;border-bottom:1px solid var(--line-soft);">${ef}</td></tr>`;
  const fac = (t, v, color) => `<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:4px 0;border-bottom:1px solid var(--line-soft);"><span>${t}</span><span style="color:${color};font-weight:700;">${v}</span></div>`;
  const H = "font-family:'Cinzel',serif;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;font-size:15px;color:var(--cyan);margin:0 0 8px;";
  return (
    `<section class="${fadeCls}" style="max-width:820px;margin:0 auto;">` +
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
  try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
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
    case "exportAll": wodExportAll(); break;
    case "cerrarMes": cerrarMes(); break;
    case "edit-casa": set({ activeId: t.dataset.id, view: "micasa" }); break;
    case "dup-casa": { const nid = uid(); const copia = JSON.parse(JSON.stringify(normalizeCasa(S.casas[t.dataset.id]))); copia.nombre = (copia.nombre || "Casa") + " (copia)"; state.casas = { ...S.casas, [nid]: copia }; set({ activeId: nid }); break; }
    case "copy-casa": copy("fic" + t.dataset.id, encode(S.casas[t.dataset.id])); break;
    case "del-casa": {
      const id = t.dataset.id; const ids = Object.keys(S.casas);
      if (ids.length <= 1) { state.casas = { [id]: blankCasa("Mi Casa") }; set({ activeId: id }); }
      else { const casas = { ...S.casas }; delete casas[id]; state.casas = casas; set({ activeId: S.activeId === id ? Object.keys(casas)[0] : S.activeId }); }
      break;
    }
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
  else if (act === "setDado") { setBox(t.dataset.key, { dado: t.value }); }
  else if (act === "tablillaInput") { ui.tablillaText = t.value; ui.tablillaMsg = ""; softClearMsg("tablilla"); }
  else if (act === "importInput") { ui.importText = t.value; ui.importMsg = ""; softClearMsg("import"); }
}
function handleChange(e) {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  if (t.dataset.act === "importFile") {
    const file = t.files && t.files[0];
    if (file) wodImportAll(file, (res) => { if (res.ok) location.reload(); else alert(res.msg); });
  }
  else if (t.dataset.act === "selectCasa") set({ activeId: t.value });
  else if (t.dataset.act === "territorio") {
    const vv = t.value;
    const col = (TERRITORIOS.find((x) => x.id === vv) || {}).color || "";
    patch({ meta: { ...metaFull(activeCasa().meta), territorio: vv, acento: col } });
  }
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
    if (raw) { const s = JSON.parse(raw); casas = s.casas || {}; activeId = s.activeId || ""; view = ["reglas", "consejos", "fichas"].includes(s.view) ? s.view : "micasa"; }
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
