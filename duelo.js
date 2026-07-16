/* ============================================================
   WODeconomy · Sala de Duelos — app (implementación vanilla de Duelo.dc.html)
   Sistema de combate: personajes, equipo, habilidades, cálculo y tablilla BBCode.
   ============================================================ */
"use strict";

const LS = "wodduelo_v1";
const ENEMY = "#ff2e2e";
const CINZEL = "font-family:'Cinzel',serif;";

/* ---------- Datos ---------- */
const ATTR = [
  { key: "fuerza", label: "Fuerza", abbr: "FUE" },
  { key: "defensa", label: "Defensa", abbr: "DEF" },
  { key: "agilidad", label: "Agilidad", abbr: "AGI" },
  { key: "conocimiento", label: "Conocimiento", abbr: "CON" },
  { key: "carisma", label: "Carisma", abbr: "CAR" },
  { key: "magia", label: "Magia", abbr: "MAG" },
];
const ARMAS = [
  { id: "cuchillo", precio: 40, nombre: "Cuchillo", tipo: "Arma corta", atk: 1, def: -1 },
  { id: "punal", precio: 80, nombre: "Puñal", tipo: "Arma corta", atk: 1, dmg: 1, def: -1 },
  { id: "daga", precio: 140, nombre: "Daga", tipo: "Arma corta", atk: 1, dmg: 2, def: -1 },
  { id: "espada_corta", precio: 70, nombre: "Espada corta", tipo: "Espada 1M", atk: 2 },
  { id: "espada_larga", precio: 130, nombre: "Espada larga", tipo: "Espada 1M", atk: 2, def: 1 },
  { id: "espada_bastarda", precio: 260, nombre: "Espada bastarda", tipo: "Espada 1M", atk: 3, def: 1 },
  { id: "espada_caballero", precio: 190, nombre: "Espada de caballero", tipo: "Espada 1M", atk: 3 },
  { id: "sable_curvo", precio: 90, nombre: "Sable curvo", tipo: "Espada curva", atk: 2, agi: 1, note: "−2 daño si el rival lleva armadura pesada" },
  { id: "arakh", precio: 190, nombre: "Arakh", tipo: "Espada curva", atk: 3, agi: 1, note: "−2 daño si el rival lleva armadura o escudo" },
  { id: "arakh_sangre", precio: 350, nombre: "Arakh de jinete de sangre", tipo: "Espada curva", atk: 4, agi: 1, noShield: true, note: "−2 daño si el rival lleva armadura o escudo; no permite escudo" },
  { id: "hachuela", precio: 60, nombre: "Hachuela", tipo: "Hacha", atk: 1, dmg: 2 },
  { id: "hacha_1m", precio: 110, nombre: "Hacha de una mano", tipo: "Hacha", atk: 1, dmg: 3 },
  { id: "hacha_batalla", precio: 210, nombre: "Hacha de batalla", tipo: "Hacha", atk: 1, dmg: 4, def: 1, twoH: true },
  { id: "lanza", precio: 80, nombre: "Lanza", tipo: "Lanza", atk: 1, def: 2 },
  { id: "lanza_guerra", precio: 120, nombre: "Lanza de guerra", tipo: "Lanza", atk: 2, def: 2 },
  { id: "lanza_dorniense", precio: 230, nombre: "Lanza dorniense", tipo: "Lanza", atk: 3, def: 2, prot: 1, twoH: true },
  { id: "mangual", precio: 120, nombre: "Mangual", tipo: "Maza", dmg: 5, atk: -1, def: 1, note: "Ignora 1 protección de armadura pesada" },
  { id: "maza_armas", precio: 210, nombre: "Maza de armas", tipo: "Maza", dmg: 5, atk: -1, def: 2, note: "Ignora 2 protección de armadura pesada" },
  { id: "martillo_guerra", precio: 300, nombre: "Martillo de guerra", tipo: "Maza", dmg: 5, def: 2, twoH: true, note: "Ignora 3 protección de armadura pesada" },
  { id: "espadon", precio: 120, nombre: "Espadón", tipo: "Espada 2M", dmg: 4, def: 2, atk: -2, twoH: true },
  { id: "mandoble", precio: 210, nombre: "Mandoble", tipo: "Espada 2M", dmg: 4, def: 3, atk: -1, twoH: true },
  { id: "gran_mandoble", precio: 300, nombre: "Gran mandoble", tipo: "Espada 2M", dmg: 5, def: 3, atk: -1, twoH: true },
  { id: "espada_valyria", precio: 800, nombre: "Espada valyria", tipo: "Espada 2M", dmg: 3, def: 3, atk: 3, twoH: true },
  { id: "arco_caza", precio: 100, nombre: "Arco de caza", tipo: "Distancia", atk: 1, ranged: true },
  { id: "arco_largo", precio: 150, nombre: "Arco largo", tipo: "Distancia", atk: 1, dmg: 1, ranged: true },
  { id: "arco_compuesto", precio: 250, nombre: "Arco compuesto", tipo: "Distancia", atk: 2, dmg: 1, ranged: true },
  { id: "arco_arciano", precio: 400, nombre: "Arco de arciano", tipo: "Distancia", atk: 2, dmg: 1, agi: 1, ranged: true },
];
const ARMADURAS = [
  { id: "gambeson", precio: 50, nombre: "Gambesón", tipo: "Ligera", def: 1 },
  { id: "cuero", precio: 100, nombre: "Cuero endurecido", tipo: "Ligera", def: 2, pv: 3 },
  { id: "brigantina", precio: 200, nombre: "Brigantina", tipo: "Ligera", def: 2, prot: 1, pv: 3 },
  { id: "cota_malla", precio: 180, nombre: "Cota de malla", tipo: "Pesada", prot: 4, pv: 4, pesada: true },
  { id: "arnes_parcial", precio: 280, nombre: "Arnés parcial", tipo: "Pesada", prot: 5, pv: 5, pesada: true },
  { id: "placas", precio: 420, nombre: "Armadura de placas", tipo: "Pesada", prot: 6, pv: 6, pesada: true },
];
const ESCUDOS = [
  { id: "broquel", precio: 50, nombre: "Broquel", def: 1 },
  { id: "rodela", precio: 100, nombre: "Rodela", def: 2 },
  { id: "escudo_caballero", precio: 200, nombre: "Escudo de caballero", def: 2, prot: 1, pv: 2 },
  { id: "escudo_arciano", precio: 400, nombre: "Escudo de arciano", def: 2, atk: 1, pv: 1 },
];
const HABCAT = {
  fuerza: [
    [1, "Embestida", "En el primer turno de combate obtienes +1 al ataque. (P)"],
    [2, "Avance imparable", "Al derrotar a un enemigo que atacaste, +1 a tu siguiente tirada de ataque. (P)"],
    [3, "Impacto pesado", "Una vez por enemigo, repites una tirada de ataque fallida [1]."],
    [4, "Fuerza de choque", "Tiras dos dados de ataque y eliges el mejor, una vez por enemigo."],
    [5, "Castigo brutal", "Si el enemigo ya está herido, +1 al golpearlo (dos veces por enemigo). (P)"],
    [6, "Dominio del duelo físico", "Contra rivales con menos Fuerza que tú, +1 al ataque. (P)"],
    [7, "Golpe firme", "+1 a tu stat de Fuerza; requiere post narrativo previo y dura todo el tema. (P)"],
    [8, "Furia", "Una vez por enemigo, +2 al ataque durante 2 turnos."],
    [9, "Arrollar", "Impactas a dos enemigos con un solo dado y recibes solo un ataque de vuelta. Una vez."],
    [10, "Fuerza legendaria", "+3 a tu Ataque en posts alternos. No compatible con Furia."],
  ],
  defensa: [
    [1, "Muro humano", "Proteges a un aliado recibiendo tú el ataque; +1 defensa ese turno. Una vez por enemigo."],
    [2, "Paso atrás", "Una vez por combate, repites una tirada de defensa fallida [+1]."],
    [3, "Defensor nato", "Contra enemigos con menor Defensa que tú, +1 a Defensa. (P)"],
    [4, "Aguante entrenado", "+3 PV en temas de combate. (P)"],
    [5, "Guardia básica", "+1 a tu stat de Defensa; requiere post narrativo previo, dura todo el tema. (P)"],
    [6, "Reflejo defensivo", "Tiras dos dados de defensa y eliges el mejor, una vez por enemigo."],
    [7, "Esquiva", "Una vez por enemigo, esquivas un golpe sin tirar dado (solo el post)."],
    [8, "Inquebrantable", "Con la mitad o más de PV, todos los daños recibidos se reducen en 1. (P)"],
    [9, "Absorción del impacto", "Una vez por enemigo, +2 de Defensa durante 2 turnos."],
    [10, "Esquiva perfecta", "+3 de Defensa en posts alternos."],
  ],
  agilidad: [
    [1, "Ojo del arquero", "Una vez por combate, repites una tirada fallida con arco [1]."],
    [2, "Sigilo básico", "+1 a tiradas de sigilo, infiltración, espionaje o robo. (P)"],
    [3, "Manos rápidas", "+2 en abrir cerraduras, hurtar o esconder objetos pequeños. (P)"],
    [4, "Jinete novato", "Reduces un 25% los tiempos de viaje a caballo. (P)"],
    [5, "Puntería simple", "+1 en tiradas de armas a distancia. (P)"],
    [6, "Movimiento ligero", "+1 a tu stat de Agilidad; requiere post narrativo previo, dura todo el tema. (P)"],
    [7, "Evasión", "Tiras dos dados para ataques a distancia y eliges el mejor, una vez por enemigo."],
    [8, "Cabalgada firme", "Viaje a caballo −50% y +1 en justas al sacar Cuerpo o Yelmo. (P)"],
    [9, "Arquero entrenado", "Contra enemigos con menor Agilidad, +2 ataque a distancia cada ronda. (P)"],
    [10, "Huida veloz", "Escapas de una persecución tirando dos dados de A/F; basta un acierto."],
  ],
};
const RAMA_LABEL = { fuerza: "FUE", defensa: "DEF", agilidad: "AGI" };
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
const ABBR2KEY = { FUE: "fuerza", DEF: "defensa", AGI: "agilidad", CON: "conocimiento", CAR: "carisma", MAG: "magia" };

/* ---------- Estado ---------- */
let state = {
  view: "duelo", pjs: {}, A: null, B: null, editId: "",
  importText: "", importMsg: "", copied: "",
  build: { armaId: "", armaduraId: "", escudoId: "", attrs: { fuerza: 1, defensa: 1, agilidad: 1, conocimiento: 1, carisma: 1, magia: 0 } },
};
let copyTimer = null;

/* ---------- Modelo ---------- */
function blankPJ(nombre, color) {
  return {
    nombre: nombre || "", clase: "", color: color || "#c79f00", territorio: "",
    attrs: { fuerza: 1, defensa: 1, agilidad: 1, conocimiento: 1, carisma: 1, magia: 0 },
    armaId: "", armaduraId: "", escudoId: "", hab: [],
    dAtk: "", dDef: "", mAtk: "", mDef: "", mDmg: "", mProt: "",
  };
}
function uid() { return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function normalizePJ(p) {
  const b = blankPJ();
  if (!p) return b;
  return {
    nombre: p.nombre || "", clase: p.clase || "", color: p.color || "#c79f00", territorio: p.territorio || "",
    attrs: { ...b.attrs, ...(p.attrs || {}) },
    armaId: p.armaId || "", armaduraId: p.armaduraId || "", escudoId: p.escudoId || "",
    hab: (p.hab || []).map((h) => ({ nombre: h.nombre || "", desc: h.desc || "", usada: !!h.usada, custom: !!h.custom })),
    dAtk: p.dAtk || "", dDef: p.dDef || "", mAtk: p.mAtk || "", mDef: p.mDef || "", mDmg: p.mDmg || "", mProt: p.mProt || "",
  };
}

/* ---------- Utilidades numéricas / equipo ---------- */
function n(v) { const x = parseFloat(v); return isNaN(x) ? 0 : x; }
function findArma(id) { return ARMAS.find((a) => a.id === id); }
function findArmadura(id) { return ARMADURAS.find((a) => a.id === id); }
function findEscudo(id) { return ESCUDOS.find((a) => a.id === id); }
function eq(pj) {
  const acc = { atk: 0, def: 0, dmg: 0, prot: 0, agi: 0, pv: 0 };
  [findArma(pj.armaId), findArmadura(pj.armaduraId), findEscudo(pj.escudoId)].forEach((it) => {
    if (!it) return; ["atk", "def", "dmg", "prot", "agi", "pv"].forEach((k) => (acc[k] += it[k] || 0));
  });
  return acc;
}
function ranged(pj) { const a = findArma(pj.armaId); return !!(a && a.ranged); }
function pvMax(pj) { return 20 + eq(pj).pv; }
function effAgi(pj) { return n(pj.attrs.agilidad) + eq(pj).agi; }
function sign(x) { return (x >= 0 ? "+" : "−") + Math.abs(x); }
function _hx(h) { h = (h || "#c79f00").replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const v = parseInt(h, 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
function _mix(hex, t, amt) { const a = _hx(hex), b = _hx(t); const c = (x) => ("0" + Math.max(0, Math.min(255, Math.round(x))).toString(16)).slice(-2); return "#" + c(a[0] + (b[0] - a[0]) * amt) + c(a[1] + (b[1] - a[1]) * amt) + c(a[2] + (b[2] - a[2]) * amt); }

function crossing(att, def) {
  const e = eq(att), ed = eq(def);
  const rng = ranged(att);
  const atkAttrKey = rng ? "agilidad" : "fuerza";
  const atkAttrVal = n(att.attrs[atkAttrKey]) + (rng ? e.agi : 0);
  const nat1atk = n(att.dAtk) === 1;
  const atkFijo = atkAttrVal + e.atk + n(att.mAtk);
  const ataqueTotal = nat1atk ? 0 : n(att.dAtk) + atkFijo;
  const nat1def = n(def.dDef) === 1;
  const defFijo = n(def.attrs.defensa) + ed.def + n(def.mDef);
  const defensaTotal = nat1def ? defFijo : defFijo + n(def.dDef);
  const hit = ataqueTotal > defensaTotal;
  const base = hit ? ataqueTotal - defensaTotal : 0;
  const dmgBonus = e.dmg + n(att.mDmg);
  const protDef = ed.prot + n(def.mProt);
  const dmg = hit ? Math.max(0, base + dmgBonus - protDef) : 0;
  const pvMaxDef = pvMax(def);
  return { ranged: rng, atkAttrKey, atkAttrVal, atkFijo, nat1atk, ataqueTotal, nat1def, defFijo, defensaTotal, hit, base, dmgBonus, protDef, dmg, pvMaxDef };
}
function estadoPV(pv) {
  if (pv <= 0) return { txt: "Fuera de combate", style: "color:var(--danger);font-weight:600;" };
  if (pv <= 5) return { txt: "Gravemente herido", style: "color:var(--danger);" };
  if (pv < 10) return { txt: "Herido", style: "color:var(--gold-soft);" };
  return { txt: "En pie", style: "color:var(--cyan);" };
}

/* ---------- Códigos / BBCode ---------- */
function encode(pj) { const c = normalizePJ(pj); try { return "WODPJ:" + btoa(unescape(encodeURIComponent(JSON.stringify(c)))); } catch (e) { return ""; } }
function decode(code) {
  const raw = (code || "").trim();
  if (/tablillita|due-top|<div/i.test(raw) || (/\[b\]/i.test(raw) && raw.indexOf("{") !== 0 && raw.indexOf("WODPJ:") !== 0)) {
    const p = parseBB(raw); if (p) return p;
  }
  try {
    let s = raw; if (s.indexOf("WODPJ:") === 0) s = s.slice(6);
    const json = s.charAt(0) === "{" ? s : decodeURIComponent(escape(atob(s)));
    return normalizePJ(JSON.parse(json));
  } catch (e) { return null; }
}
function parseBB(raw) {
  try {
    const pj = blankPJ();
    const mColor = raw.match(/--group:\s*([^;"'\s]+)/i);
    if (mColor) { pj.color = mColor[1]; const t = TERRITORIOS.find((x) => x.color.toLowerCase() === pj.color.toLowerCase()); if (t) pj.territorio = t.id; }
    const top = raw.match(/due-top[\s\S]*?<b>([\s\S]*?)<\/b>[\s\S]*?<i>([\s\S]*?)<\/i>/i);
    if (top) { pj.nombre = top[1].trim(); pj.clase = top[2].trim(); }
    else {
      const mb = raw.match(/<b>([\s\S]*?)<\/b>/i); if (mb) pj.nombre = mb[1].trim();
      const mi = raw.match(/<i>([\s\S]*?)<\/i>/i); if (mi) pj.clase = mi[1].trim();
    }
    const stRe = /<u>\s*<b>(-?\d+)<\/b>\s*<i>([A-Za-zÁÉÍÓÚ]+)<\/i>\s*<\/u>/gi;
    let m; while ((m = stRe.exec(raw))) { const key = ABBR2KEY[m[2].toUpperCase()]; if (key) pj.attrs[key] = parseInt(m[1], 10); }
    let habBlock = raw.match(/HABILIDADES:\s*<\/h>\s*<div[^>]*>([\s\S]*?)<\/div>/i);
    const habText = habBlock ? habBlock[1] : (/\[b\]/.test(raw) && !/ACCIONES/i.test(raw) ? raw : "");
    if (habText) {
      const lineRe = /\[b\](\[strike\])?\s*([\s\S]*?)\s*\((USADA|SIN USAR)\)\s*:\s*(?:\[\/strike\])?\[\/b\]\s*([\s\S]*?)(?=\n\[b\]|$)/gi;
      let h; while ((h = lineRe.exec(habText))) {
        pj.hab.push({ nombre: h[2].replace(/\[\/?strike\]/gi, "").trim(), desc: h[4].replace(/\s+/g, " ").trim(), usada: /USADA/i.test(h[3]), custom: true });
      }
    }
    if (!pj.nombre && !pj.hab.length && !mColor) return null;
    return pj;
  } catch (e) { return null; }
}
function accionesFor(me, foe, meAtk, myDef) {
  const foeName = foe.nombre || "rival";
  const atkLabel = meAtk.ranged ? "Agilidad" : "Fuerza";
  const l1 = meAtk.nat1atk ? "1 natural → Fallo, el ataque pega 0."
    : atkLabel + "+equipo (" + meAtk.atkFijo + ") + dado (" + n(me.dAtk) + ") = " + meAtk.ataqueTotal;
  const l2 = myDef.nat1def ? "1 natural: solo Defensa+equipo (" + myDef.defFijo + ") = " + myDef.defensaTotal
    : "Defensa+equipo (" + myDef.defFijo + ") + dado (" + n(me.dDef) + ") = " + myDef.defensaTotal;
  let l3;
  if (!meAtk.hit) { l3 = meAtk.ataqueTotal + " no supera la defensa de " + foeName + " (" + meAtk.defensaTotal + "): no impacta."; }
  else {
    const pieces = [meAtk.ataqueTotal + " − " + meAtk.defensaTotal];
    if (meAtk.dmgBonus) pieces.push(sign(meAtk.dmgBonus) + " daño");
    if (meAtk.protDef) pieces.push("− " + meAtk.protDef + " prot.");
    const pvLeft = meAtk.pvMaxDef - meAtk.dmg;
    l3 = pieces.join(" ") + " = " + meAtk.dmg + " → " + foeName + " queda con " + pvLeft + " PV.";
  }
  return [{ k: "Ataque a " + foeName, v: l1 }, { k: "Defensa de " + foeName, v: l2 }, { k: "Daño", v: l3 }];
}
function bbTablilla(me, foe, meAtk, myDef) {
  const st = ["fuerza", "defensa", "agilidad", "conocimiento", "carisma"];
  const stStr = st.map((k) => "<u><b>" + n(me.attrs[k]) + "</b><i>" + ATTR.find((a) => a.key === k).abbr + "</i></u>").join("\n");
  const ac = accionesFor(me, foe, meAtk, myDef);
  let out = '<div class="tablillita duelo" style="--group:' + me.color + ';">\n';
  out += '<div class="due-top">\n<b>' + (me.nombre || "Nombre") + "</b>\n<i>" + (me.clase || "Clase") + "</i>\n</div>\n";
  out += '<div class="due-data">\n<span>\n' + stStr + "\n</span>\n<span>\n<u><b>" + pvMax(me) + "</b><i>PV</i></u>\n</span>\n</div>\n";
  out += '<div class="due-cont">\n<div class="due-box">\n<h>ACCIONES:</h>\n<div class="due-text">';
  out += "[b]" + ac[0].k + ":[/b] " + ac[0].v + "\n[b]" + ac[1].k + ":[/b] " + ac[1].v + "\n[b]" + ac[2].k + ":[/b] " + ac[2].v;
  out += "</div>\n</div>\n";
  if ((me.hab || []).length) {
    out += '<div class="due-box">\n<h>HABILIDADES:</h>\n<div class="due-text">';
    out += me.hab.map((h) => {
      const nom = (h.nombre || "Habilidad") + " (" + (h.usada ? "USADA" : "SIN USAR") + ")";
      const head = h.usada ? "[b][strike]" + nom + ":[/strike][/b]" : "[b]" + nom + ":[/b]";
      return head + " " + (h.desc || "");
    }).join("\n");
    out += "</div>\n</div>\n";
  }
  out += "</div>\n</div>";
  return out;
}
function eqResumen(pj) {
  const E = eq(pj); const parts = [];
  if (E.atk) parts.push("Atq " + sign(E.atk));
  if (E.def) parts.push("Def " + sign(E.def));
  if (E.dmg) parts.push("Daño " + sign(E.dmg));
  if (E.prot) parts.push("Prot " + sign(E.prot));
  if (E.pv) parts.push("PV " + sign(E.pv));
  if (ranged(pj)) parts.push("a distancia");
  return parts.join(" · ");
}

/* ---------- Persistencia y mutaciones ---------- */
function persist() { try { localStorage.setItem(LS, JSON.stringify({ pjs: state.pjs, A: state.A, B: state.B, view: state.view, build: state.build })); } catch (e) {} }
function set(next) { Object.assign(state, next); persist(); render(); }
function setSide(side, fields) { state[side] = { ...state[side], ...fields }; persist(); render(); }
function setLibPj(id, fields) { state.pjs = { ...state.pjs, [id]: { ...normalizePJ(state.pjs[id]), ...fields } }; persist(); render(); }
function setBuild(fields) { state.build = { ...state.build, ...fields }; persist(); render(); }
function copy(key, text) {
  try { navigator.clipboard.writeText(text); } catch (e) {}
  state.copied = key; clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { state.copied = ""; render(); }, 1800);
  render();
}

/* ---------- Opciones de <select> ---------- */
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function options(list, value) { return list.map((o) => `<option value="${esc(o.v)}" ${o.v === (value || "") ? "selected" : ""}>${esc(o.l)}</option>`).join(""); }
function territorioOpts() { return [{ v: "", l: "— Territorio / color —" }].concat(TERRITORIOS.map((t) => ({ v: t.id, l: t.label }))).concat([{ v: "enemigo", l: "Enemigo (rojo)" }]); }
function equipOpts() {
  const armaOpts = [{ v: "", l: "— Sin arma —" }].concat(ARMAS.map((a) => { const b = []; if (a.atk) b.push("Atq " + sign(a.atk)); if (a.def) b.push("Def " + sign(a.def)); if (a.dmg) b.push("Dñ " + sign(a.dmg)); if (a.prot) b.push("Pro " + sign(a.prot)); if (a.agi) b.push("Agi " + sign(a.agi)); return { v: a.id, l: a.nombre + " · " + b.join(" ") }; }));
  const armaduraOpts = [{ v: "", l: "— Sin armadura —" }].concat(ARMADURAS.map((a) => { const b = []; if (a.def) b.push("Def " + sign(a.def)); if (a.prot) b.push("Pro " + sign(a.prot)); if (a.pv) b.push("PV " + sign(a.pv)); return { v: a.id, l: a.nombre + " · " + b.join(" ") }; }));
  const escudoOpts = [{ v: "", l: "— Sin escudo —" }].concat(ESCUDOS.map((a) => { const b = []; if (a.def) b.push("Def " + sign(a.def)); if (a.prot) b.push("Pro " + sign(a.prot)); if (a.atk) b.push("Atq " + sign(a.atk)); if (a.pv) b.push("PV " + sign(a.pv)); return { v: a.id, l: a.nombre + " · " + b.join(" ") }; }));
  return { armaOpts, armaduraOpts, escudoOpts };
}
function habOptsFor(pj) {
  const habOpts = [{ v: "", l: "+ Añadir habilidad…" }];
  ["fuerza", "defensa", "agilidad"].forEach((rama) => {
    const av = n(pj.attrs[rama]);
    HABCAT[rama].forEach((h, idx) => { if (h[0] <= av && !(pj.hab || []).some((x) => x.nombre === h[1])) habOpts.push({ v: rama + ":" + idx, l: RAMA_LABEL[rama] + " · " + h[1] + " (min " + h[0] + ")" }); });
  });
  return habOpts;
}

/* ---------- Habilidades: mutadores ---------- */
function addHabPresetLib(id, val) { if (!val) return; const [rama, idx] = val.split(":"); const item = HABCAT[rama] && HABCAT[rama][+idx]; if (!item) return; const pj = normalizePJ(state.pjs[id]); if ((pj.hab || []).some((h) => h.nombre === item[1])) return; setLibPj(id, { hab: [...(pj.hab || []), { nombre: item[1], desc: item[2], usada: false, custom: false }] }); }
function addHabCustomLib(id) { const pj = normalizePJ(state.pjs[id]); setLibPj(id, { hab: [...(pj.hab || []), { nombre: "", desc: "", usada: false, custom: true }] }); }
function updHabLib(id, i, field, val) { const pj = normalizePJ(state.pjs[id]); const hab = pj.hab.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)); setLibPj(id, { hab }); }
function rmHabLib(id, i) { const pj = normalizePJ(state.pjs[id]); setLibPj(id, { hab: pj.hab.filter((_, idx) => idx !== i) }); }
function nuevoPj() { const id = uid(); state.pjs = { ...state.pjs, [id]: blankPJ("Nuevo personaje", "#82b6c6") }; set({ editId: id, view: "personajes" }); }
function importToLib() { const p = decode(state.importText); if (!p) { state.importMsg = "Código o BBCode no válido."; render(); return; } const id = uid(); state.pjs = { ...state.pjs, [id]: p }; set({ editId: id, importText: "", importMsg: "✓ «" + (p.nombre || "PJ") + "» añadido." }); }
function loadInto(side, id) { set({ [side]: normalizePJ(state.pjs[id]), view: "duelo" }); }

/* ============================================================
   RENDER
   ============================================================ */
function chromeTokens() {
  // Dorado por defecto; solo adopta el color de la casa cuando "Tú" tiene territorio elegido.
  const acc = (state.A && state.A.territorio) ? state.A.color : "#c79f00";
  const gold = acc, goldSoft = _mix(acc, "#ffffff", 0.25), goldDim = _mix(acc, "#000000", 0.5);
  return `--bg:#0a0a0b;--panel:#121210;--panel-2:#17160f;--gold:${gold};--gold-soft:${goldSoft};--gold-dim:${goldDim};--cyan:#82b6c6;--text:#ddd6c6;--muted:#8f8a7c;--line:rgba(199,159,0,0.20);--line-soft:rgba(221,214,198,0.08);--danger:#c05a4a;`;
}
function render() {
  const focus = captureFocus();
  const wrapStyle = chromeTokens() + "min-height:100vh;position:relative;background:radial-gradient(120% 80% at 50% -10%, rgba(130,182,198,0.05), transparent 55%),radial-gradient(90% 60% at 50% 120%, rgba(199,159,0,0.05), transparent 60%),#0a0a0b;";
  const view = state.view;
  const body = view === "personajes" ? personajesView() : view === "build" ? buildView() : view === "reglas" ? reglasView() : dueloView();
  document.getElementById("app").innerHTML =
    `<div style="${wrapStyle}">` +
      `<div style="position:fixed;inset:8px;border:1px solid var(--gold-dim);opacity:0.55;pointer-events:none;z-index:5;"></div>` +
      `<div style="position:fixed;inset:12px;border:1px solid rgba(199,159,0,0.10);pointer-events:none;z-index:5;"></div>` +
      header() + filigree() + subnav() +
      `<main style="position:relative;z-index:2;max-width:1240px;margin:0 auto;padding:26px clamp(16px,4vw,48px) 72px;">` + body + `</main>` +
      `<footer style="position:relative;z-index:2;text-align:center;padding:0 24px 40px;color:var(--muted);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;${CINZEL}">Win or Die · Sala de Duelos</footer>` +
    `</div>`;
  restoreFocus(focus);
}
function header() {
  const tab = "cursor:pointer;" + CINZEL + "letter-spacing:0.12em;text-transform:uppercase;font-size:12px;padding:9px 15px;border-radius:4px;background:transparent;white-space:nowrap;";
  const on = tab + "color:#0a0a0b;background:var(--gold);border:1px solid var(--gold);";
  const off = tab + "color:var(--gold);border:1px solid var(--gold-dim);";
  return (
    `<header style="position:relative;z-index:2;display:flex;align-items:center;gap:20px;padding:22px clamp(24px,5vw,64px) 14px;flex-wrap:wrap;">` +
      `<div style="display:flex;flex-direction:column;gap:2px;margin-right:auto;">` +
        `<span style="${CINZEL}font-weight:700;letter-spacing:0.34em;font-size:22px;color:#ffffff;line-height:1;">WIN&nbsp;OR&nbsp;DIE</span>` +
        `<span style="${CINZEL}letter-spacing:0.42em;font-size:11px;color:var(--cyan);text-transform:uppercase;">Sala de Duelos</span>` +
      `</div>` +
      `<nav style="display:flex;gap:6px;flex-wrap:wrap;">` +
        `<a class="h-goldsoft" href="index.html" style="${off}">Economía</a>` +
        `<button class="h-goldsoft" data-act="nav" data-view="duelo" style="${on}">Duelos</button>` +
        `<a class="h-goldsoft" href="datos.html" style="${off}">Datos</a>` +
      `</nav>` +
    `</header>`
  );
}
function filigree() {
  return `<div style="position:relative;z-index:2;display:flex;align-items:center;gap:14px;justify-content:center;padding:0 clamp(24px,5vw,64px);"><div style="height:1px;flex:1;max-width:420px;background:linear-gradient(to right,transparent,var(--gold-dim));"></div><span style="color:var(--gold);font-size:14px;">⚔</span><div style="height:1px;flex:1;max-width:420px;background:linear-gradient(to left,transparent,var(--gold-dim));"></div></div>`;
}
function subnav() {
  const base = "cursor:pointer;" + CINZEL + "letter-spacing:0.1em;text-transform:uppercase;font-size:11px;padding:6px 12px;border-radius:4px;background:transparent;border:none;";
  const on = base + "color:var(--gold);border-bottom:2px solid var(--gold);";
  const off = base + "color:var(--muted);";
  const isD = state.view === "duelo" || !["personajes", "build", "reglas"].includes(state.view);
  const tabs = [["duelo", "Duelo", isD], ["personajes", "Personajes", state.view === "personajes"], ["build", "Configurador de build", state.view === "build"], ["reglas", "Reglas de combate", state.view === "reglas"]];
  return `<div style="position:relative;z-index:2;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px;">` +
    tabs.map(([v, l, act]) => `<button class="h-tolgold" data-act="nav" data-view="${v}" style="${act ? on : off}">${l}</button>`).join("") + `</div>`;
}
function tituloSec(txt) {
  return `<div style="display:flex;align-items:center;gap:16px;justify-content:center;margin:6px 0 4px;"><div style="height:1px;flex:1;background:linear-gradient(to right,transparent,var(--gold-dim));"></div><h2 style="margin:0;${CINZEL}font-weight:600;letter-spacing:0.2em;text-transform:uppercase;font-size:clamp(20px,3vw,26px);color:var(--gold);">${txt}</h2><div style="height:1px;flex:1;background:linear-gradient(to left,transparent,var(--gold-dim));"></div></div>`;
}

/* ---------- Vista DUELO ---------- */
function duelSideVM(side) {
  const pj = state[side]; const isA = side === "A";
  const mods = [
    { key: "mAtk", label: "+Atq", title: "Modificador de ataque (habilidades, etc.)" },
    { key: "mDef", label: "+Def", title: "Modificador de defensa" },
    { key: "mDmg", label: "+Dñ", title: "Modificador de daño" },
    { key: "mProt", label: "+Pro", title: "Modificador de protección" },
  ].map((m) => ({ label: m.label, title: m.title, key: m.key, val: pj[m.key] }));
  const loadOpts = [{ v: "", l: isA ? "Cargar en Tú…" : "Cargar rival…" }].concat(Object.keys(state.pjs).map((id) => ({ v: id, l: state.pjs[id].nombre || "Sin nombre" })));
  return { side, title: isA ? "Tú" : "Rival", color: pj.color, nombre: pj.nombre, clase: pj.clase, territorio: pj.territorio, loadOpts, equipoResumen: eqResumen(pj), dAtk: pj.dAtk, dDef: pj.dDef, mods };
}
function dueloView() {
  const A = state.A, B = state.B;
  const cAB = crossing(A, B), cBA = crossing(B, A);
  const nameA = A.nombre || "Tú", nameB = B.nombre || "Rival";
  const pvA = pvMax(A) - cBA.dmg, pvB = pvMax(B) - cAB.dmg;
  const estA = estadoPV(pvA), estB = estadoPV(pvB);
  const marcador = [
    { nombre: nameA, color: A.color, dmg: cAB.dmg, recibe: cBA.dmg, pv: pvA, pvMax: pvMax(A), est: estA },
    { nombre: nameB, color: B.color, dmg: cBA.dmg, recibe: cAB.dmg, pv: pvB, pvMax: pvMax(B), est: estB },
  ].map((m) => (
    `<div style="background:#0d0d0c;border:1px solid var(--line-soft);border-radius:6px;padding:12px 14px;">` +
      `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="width:12px;height:12px;border-radius:2px;background:${m.color};"></span><span style="${CINZEL}letter-spacing:0.06em;font-size:14px;color:var(--text);">${esc(m.nombre)}</span></div>` +
      `<div style="display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;">` +
        `<span style="color:var(--muted);">Inflige <b style="${m.dmg > 0 ? "color:var(--gold);" : "color:var(--muted);"}">${m.dmg}</b></span>` +
        `<span style="color:var(--muted);">Recibe <b style="color:var(--text);">${m.recibe}</b></span>` +
        `<span style="color:var(--muted);">PV: <b style="${m.est.style}${CINZEL}">${m.pv}</b> / ${m.pvMax}</span>` +
        `<span style="${m.est.style}">${m.est.txt}</span>` +
      `</div></div>`
  )).join("");

  const sides = [duelSideVM("A"), duelSideVM("B")].map((s) => {
    const modsHtml = s.mods.map((m) => `<label style="display:flex;flex-direction:column;gap:3px;" title="${m.title}"><span style="font-size:9.5px;color:var(--muted);white-space:nowrap;">${m.label}</span><input class="inp" type="number" inputmode="numeric" data-act="side-mod" data-side="${s.side}" data-key="${m.key}" data-fid="s${s.side}-${m.key}" value="${esc(m.val)}" placeholder="0" style="width:100%;background:#0d0d0c;border:1px solid var(--line-soft);border-radius:4px;color:var(--text);font-size:13px;padding:6px;text-align:center;"></label>`).join("");
    return (
      `<div style="background:var(--panel);border:1px solid var(--line);border-top:3px solid ${s.color};border-radius:6px;padding:16px;">` +
        `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">` +
          `<span style="${CINZEL}letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:${s.color};">${s.title}</span>` +
          `<select class="inp" data-act="side-territorio" data-side="${s.side}" title="Territorio" style="margin-left:auto;font-size:11.5px;padding:5px 7px;max-width:150px;">${options(territorioOpts(), s.territorio)}</select>` +
          `<input type="color" data-act="side-color" data-side="${s.side}" value="${esc(s.color)}" title="Color manual" style="width:26px;height:26px;padding:0;border:none;background:transparent;cursor:pointer;">` +
        `</div>` +
        `<select class="inp" data-act="side-load" data-side="${s.side}" style="width:100%;margin-bottom:10px;border:1px solid var(--cyan);color:var(--cyan);${CINZEL}letter-spacing:0.06em;font-size:12px;padding:9px 8px;">${options(s.loadOpts, "")}</select>` +
        `<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px;">` +
          `<input class="inp-line" type="text" data-act="side-nombre" data-side="${s.side}" data-fid="s${s.side}-nombre" value="${esc(s.nombre)}" placeholder="Nombre" style="flex:1;min-width:0;background:transparent;border:none;border-bottom:1px solid var(--line-soft);color:var(--text);${CINZEL}font-size:15px;padding:4px 0;">` +
          `<span style="font-style:italic;font-size:12px;color:var(--cyan);">${esc(s.clase)}</span>` +
        `</div>` +
        (s.equipoResumen ? `<div style="font-size:11px;color:var(--muted);margin-bottom:10px;">${esc(s.equipoResumen)}</div>` : "") +
        `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">` +
          `<label style="display:flex;flex-direction:column;gap:3px;"><span style="font-size:10.5px;color:var(--muted);">🎲 Dado de ataque</span><input class="inp" type="number" inputmode="numeric" data-act="side-datk" data-side="${s.side}" data-fid="s${s.side}-datk" value="${esc(s.dAtk)}" placeholder="0" style="width:100%;background:#0d0d0c;border:1px solid var(--line-soft);border-radius:4px;color:var(--text);font-size:14px;padding:7px 8px;"></label>` +
          `<label style="display:flex;flex-direction:column;gap:3px;"><span style="font-size:10.5px;color:var(--muted);">🎲 Dado de defensa</span><input class="inp" type="number" inputmode="numeric" data-act="side-ddef" data-side="${s.side}" data-fid="s${s.side}-ddef" value="${esc(s.dDef)}" placeholder="0" style="width:100%;background:#0d0d0c;border:1px solid var(--line-soft);border-radius:4px;color:var(--text);font-size:14px;padding:7px 8px;"></label>` +
        `</div>` +
        `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:7px;">${modsHtml}</div>` +
      `</div>`
    );
  }).join("");

  const tablillas = [[A, B, cAB, cBA], [B, A, cBA, cAB]].map(([me, foe, meAtk, myDef]) => {
    const st = ["fuerza", "defensa", "agilidad", "conocimiento", "carisma"].map((k) => `<div style="text-align:center;min-width:46px;background:var(--panel);border:1px solid var(--line-soft);border-radius:5px;padding:5px 8px;"><div style="${CINZEL}font-size:16px;color:var(--text);line-height:1.1;">${n(me.attrs[k])}</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;">${ATTR.find((a) => a.key === k).abbr}</div></div>`).join("");
    const acc = accionesFor(me, foe, meAtk, myDef).map((ac) => `<div style="font-size:12.5px;line-height:1.55;margin-bottom:3px;"><b style="color:var(--text);">${esc(ac.k)}:</b> <span style="color:var(--muted);">${esc(ac.v)}</span></div>`).join("");
    const habs = (me.hab || []);
    const habHtml = habs.length ? `<div style="padding:0 16px 14px;"><div style="${CINZEL}letter-spacing:0.1em;text-transform:uppercase;font-size:11px;color:${me.color};margin-bottom:6px;">Habilidades</div>` +
      habs.map((h) => { const deco = h.usada ? "text-decoration:line-through;" : ""; const style = h.usada ? "color:var(--muted);text-decoration:line-through;" : "color:var(--text);"; return `<div style="font-size:12px;line-height:1.5;margin-bottom:3px;"><b style="${style}">${esc(h.nombre || "Habilidad")} (${h.usada ? "USADA" : "SIN USAR"}):</b> <span style="color:var(--muted);${deco}">${esc(h.desc || "")}</span></div>`; }).join("") + `</div>` : "";
    return (
      `<div style="background:#0c0c0a;border:1px solid ${me.color};border-radius:8px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.5);">` +
        `<div style="background:${me.color};padding:10px 16px;"><div style="${CINZEL}font-weight:700;font-size:17px;color:#0a0a0b;letter-spacing:0.04em;">${esc(me.nombre || "Nombre")}</div><div style="${CINZEL}font-style:italic;font-size:12px;color:rgba(10,10,11,0.75);">${esc(me.clase || "Clase")}</div></div>` +
        `<div style="display:flex;flex-wrap:wrap;gap:6px;padding:12px 16px;border-bottom:1px solid var(--line-soft);">${st}<div style="text-align:center;min-width:46px;background:rgba(199,159,0,0.08);border:1px solid ${me.color};border-radius:5px;padding:5px 8px;"><div style="${CINZEL}font-size:16px;color:${me.color};line-height:1.1;">${pvMax(me)}</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;">PV</div></div></div>` +
        `<div style="padding:12px 16px;"><div style="${CINZEL}letter-spacing:0.1em;text-transform:uppercase;font-size:11px;color:${me.color};margin-bottom:6px;">Acciones</div>${acc}</div>` +
        habHtml +
      `</div>`
    );
  }).join("");

  const bbCode = '<div class="duelos">\n' + bbTablilla(A, B, cAB, cBA) + "\n" + bbTablilla(B, A, cBA, cAB) + "\n</div>";

  return (
    `<section style="animation:wodfade .35s ease both;">` +
      tituloSec("Duelo") +
      `<p style="text-align:center;color:var(--muted);font-size:13px;margin:0 auto 20px;max-width:660px;">Carga los dos personajes de tu biblioteca (o ajústalos aquí) e introduce los resultados de los dados. La app calcula ataque, defensa, daño y PV; abajo tienes las dos tablillas enfrentadas listas para copiar al foro.</p>` +
      `<div style="max-width:820px;margin:0 auto 26px;background:linear-gradient(180deg,var(--panel-2),#0c0c0a);border:1px solid var(--gold-dim);border-radius:8px;padding:16px 18px;box-shadow:inset 0 0 24px rgba(199,159,0,0.06);">` +
        `<div class="wod-duel-grid" style="display:grid;gap:12px;">${marcador}</div>` +
      `</div>` +
      `<div class="wod-duel-grid" style="display:grid;gap:16px;margin-bottom:8px;">${sides}</div>` +
      `<p style="text-align:center;font-size:10.5px;color:var(--muted);margin:0 0 22px;font-style:italic;">Un 1 natural en el dado se cuenta como Fallo. Los atributos, equipo y habilidades se editan en «Personajes».</p>` +
      `<div style="display:flex;align-items:center;gap:16px;justify-content:center;margin:34px 0 18px;"><div style="height:1px;flex:1;background:linear-gradient(to right,transparent,var(--gold-dim));"></div><h3 style="margin:0;${CINZEL}font-weight:500;letter-spacing:0.16em;text-transform:uppercase;font-size:15px;color:var(--gold);">Tablilla del duelo</h3><div style="height:1px;flex:1;background:linear-gradient(to left,transparent,var(--gold-dim));"></div></div>` +
      `<div class="wod-duel-grid" style="display:grid;gap:16px;margin-bottom:18px;">${tablillas}</div>` +
      `<div style="max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:10px;">` +
        `<button class="h-gold" data-act="copyBB" style="cursor:pointer;${CINZEL}letter-spacing:0.1em;text-transform:uppercase;font-size:12px;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:4px;padding:13px;">${state.copied === "bb" ? "✓ ¡Tablilla copiada!" : "Copiar tablilla del duelo (BBCode)"}</button>` +
        `<details style="background:var(--panel);border:1px solid var(--line-soft);border-radius:6px;padding:0 14px;"><summary style="cursor:pointer;font-size:12px;color:var(--muted);padding:12px 0;list-style:none;">Ver código BBCode ▾</summary><textarea readonly class="inp" style="width:100%;min-height:240px;margin-bottom:14px;font-family:ui-monospace,monospace;font-size:11px;line-height:1.5;padding:10px;resize:vertical;">${esc(bbCode)}</textarea></details>` +
      `</div>` +
    `</section>`
  );
}

/* ---------- Vista PERSONAJES ---------- */
function personajesView() {
  const ids = Object.keys(state.pjs);
  const lista = ids.map((id) => {
    const p = state.pjs[id]; const activo = id === state.editId;
    return (
      `<div style="display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid var(--line-soft);">` +
        `<span style="width:10px;height:10px;border-radius:2px;background:${esc(p.color || "#c79f00")};flex:none;"></span>` +
        `<button class="h-tolgold" data-act="lib-edit" data-id="${id}" style="cursor:pointer;flex:1;min-width:0;text-align:left;background:transparent;border:none;color:${activo ? "var(--gold)" : "var(--text)"};font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${activo ? "font-weight:700;" : ""}">${esc(p.nombre || "Sin nombre")} <span style="color:var(--muted);font-size:11px;">${esc(p.clase || "")}</span></button>` +
        `<button class="h-cyan" data-act="lib-usarTu" data-id="${id}" title="Cargar en Tú" style="cursor:pointer;font-size:10.5px;color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);border-radius:4px;padding:3px 7px;">Tú</button>` +
        `<button class="h-gold" data-act="lib-usarRival" data-id="${id}" title="Cargar en Rival" style="cursor:pointer;font-size:10.5px;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:4px;padding:3px 7px;">Rival</button>` +
        `<button class="h-text" data-act="lib-copy" data-id="${id}" title="Copiar código" style="cursor:pointer;font-size:10.5px;color:var(--muted);background:transparent;border:1px solid var(--line-soft);border-radius:4px;padding:3px 7px;">${state.copied === "bib" + id ? "✓" : "Código"}</button>` +
        `<button class="h-danger" data-act="lib-del" data-id="${id}" style="cursor:pointer;width:24px;height:24px;color:var(--muted);background:transparent;border:1px solid var(--line-soft);border-radius:4px;">×</button>` +
      `</div>`
    );
  }).join("");
  const listaBox =
    `<div style="display:flex;flex-direction:column;gap:14px;">` +
      `<button class="h-gold" data-act="nuevoPj" style="cursor:pointer;${CINZEL}letter-spacing:0.1em;text-transform:uppercase;font-size:12px;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:6px;padding:11px;">+ Nuevo personaje (formulario)</button>` +
      `<div style="background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:14px;"><div style="${CINZEL}letter-spacing:0.12em;text-transform:uppercase;font-size:11px;color:var(--gold);margin-bottom:8px;">Tus personajes</div>` +
        (ids.length ? lista : `<p style="margin:0;font-size:12.5px;color:var(--muted);font-style:italic;">Aún no hay personajes. Crea uno nuevo o pégalo desde código.</p>`) +
      `</div>` +
      `<div style="background:var(--panel);border:1px solid var(--line-soft);border-radius:6px;padding:14px;display:flex;flex-direction:column;gap:8px;">` +
        `<div style="${CINZEL}letter-spacing:0.12em;text-transform:uppercase;font-size:11px;color:var(--cyan);">Añadir desde código o BBCode</div>` +
        `<textarea class="inp-cyan" data-act="importText" data-fid="imp" placeholder="Pega un código WODPJ:… o la tablilla BBCode de un turno anterior" style="width:100%;min-height:80px;background:#0d0d0c;border:1px solid var(--line-soft);border-radius:4px;color:var(--text);font-family:ui-monospace,monospace;font-size:11px;padding:9px;resize:vertical;">${esc(state.importText)}</textarea>` +
        `<div style="display:flex;gap:8px;align-items:center;"><button class="h-cyan" data-act="importToLib" style="cursor:pointer;font-size:11px;color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);border-radius:4px;padding:7px 12px;">Añadir a personajes</button><span data-msg="imp" style="${(state.importMsg || "").charAt(0) === "✓" ? "color:var(--gold);" : "color:var(--danger);"}font-size:12px;">${esc(state.importMsg)}</span></div>` +
      `</div>` +
    `</div>`;

  return (
    `<section style="animation:wodfade .35s ease both;">` +
      tituloSec("Personajes") +
      `<p style="text-align:center;color:var(--muted);font-size:13px;margin:0 auto 22px;max-width:640px;">Crea y guarda tus personajes: rellena la ficha o pégala desde un código/BBCode. Luego cárgalos en el duelo.</p>` +
      `<div class="wod-pj-grid" style="display:grid;gap:20px;align-items:start;">` + listaBox + editorHtml() + `</div>` +
    `</section>`
  );
}
function editorHtml() {
  const id = state.editId;
  if (!id || !state.pjs[id]) return "<div></div>";
  const pj = normalizePJ(state.pjs[id]);
  const opts = equipOpts();
  const totalPts = ATTR.reduce((s, a) => s + n(pj.attrs[a.key]), 0);
  const arma = findArma(pj.armaId);
  let aviso = "";
  if (arma && arma.twoH && pj.escudoId) aviso = arma.nombre + " requiere dos manos: no puede llevar escudo.";
  if (arma && arma.noShield && pj.escudoId) aviso = arma.nombre + " no permite portar escudo.";
  if (arma && arma.note) aviso = (aviso ? aviso + " " : "") + arma.note;
  const habCount = (pj.hab || []).length;
  const stats = ["fuerza", "defensa", "agilidad", "conocimiento", "carisma"].map((k) => `<div style="text-align:center;min-width:44px;background:var(--panel);border:1px solid var(--line-soft);border-radius:5px;padding:4px 7px;"><div style="${CINZEL}font-size:15px;color:var(--text);line-height:1.1;">${n(pj.attrs[k])}</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">${ATTR.find((a) => a.key === k).abbr}</div></div>`).join("");
  const attrsHtml = ATTR.map((a) => `<label style="display:flex;flex-direction:column;gap:3px;"><span style="font-size:10.5px;color:var(--muted);" title="${a.label}">${a.abbr}</span><input class="inp" type="number" inputmode="numeric" data-act="ed-attr" data-key="${a.key}" data-fid="ed-a-${a.key}" value="${esc(pj.attrs[a.key])}" placeholder="0" style="width:100%;background:#0d0d0c;border:1px solid var(--line-soft);border-radius:4px;color:var(--text);${CINZEL}font-size:14px;padding:6px 8px;text-align:center;"></label>`).join("");
  const habList = (pj.hab || []).map((h, i) => {
    const toggleStyle = h.usada ? "color:#0a0a0b;background:var(--gold);border:1px solid var(--gold);" : "color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);";
    const nameColor = h.usada ? "var(--muted)" : "var(--text)";
    const nameDeco = h.usada ? "text-decoration:line-through;" : "";
    return (
      `<div style="background:#0d0d0c;border:1px solid var(--line-soft);border-radius:5px;padding:9px 10px;">` +
        `<div style="display:flex;align-items:center;gap:8px;">` +
          `<button data-act="ed-hab-toggle" data-i="${i}" title="Marcar como usada" style="cursor:pointer;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;border-radius:3px;padding:3px 8px;${toggleStyle}">${h.usada ? "Usada" : "Sin usar"}</button>` +
          `<input type="text" data-act="ed-hab-nombre" data-i="${i}" data-fid="ed-h-${i}-n" value="${esc(h.nombre)}" placeholder="Nombre de la habilidad" style="flex:1;min-width:0;background:transparent;border:none;color:${nameColor};font-weight:600;font-size:12.5px;${nameDeco}">` +
          `<button class="h-danger" data-act="ed-hab-remove" data-i="${i}" style="cursor:pointer;width:22px;height:22px;color:var(--muted);background:transparent;border:1px solid var(--line-soft);border-radius:4px;font-size:13px;">×</button>` +
        `</div>` +
        `<input type="text" data-act="ed-hab-desc" data-i="${i}" data-fid="ed-h-${i}-d" value="${esc(h.desc)}" placeholder="Efecto de la habilidad" style="width:100%;margin-top:6px;background:transparent;border:none;border-top:1px solid var(--line-soft);padding-top:6px;color:var(--muted);font-size:11.5px;">` +
      `</div>`
    );
  }).join("");

  return (
    `<div style="display:flex;flex-direction:column;gap:16px;">` +
      `<div style="background:#0c0c0a;border:1px solid ${pj.color};border-radius:8px;overflow:hidden;">` +
        `<div style="background:${pj.color};padding:9px 14px;"><div style="${CINZEL}font-weight:700;font-size:16px;color:#0a0a0b;">${esc(pj.nombre || "")}</div><div style="${CINZEL}font-style:italic;font-size:11px;color:rgba(10,10,11,0.75);">${esc(pj.clase || "")}</div></div>` +
        `<div style="display:flex;flex-wrap:wrap;gap:6px;padding:11px 14px;">${stats}<div style="text-align:center;min-width:44px;background:rgba(199,159,0,0.08);border:1px solid ${pj.color};border-radius:5px;padding:4px 7px;"><div style="${CINZEL}font-size:15px;color:${pj.color};line-height:1.1;">${pvMax(pj)}</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">PV</div></div></div>` +
        `<div style="padding:0 14px 12px;font-size:11.5px;color:var(--muted);">${esc(eqResumen(pj) || "Sin equipo")}</div>` +
      `</div>` +
      `<div style="background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:16px;">` +
        `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">` +
          `<input class="inp" type="text" data-act="ed-nombre" data-fid="ed-nombre" value="${esc(pj.nombre)}" placeholder="Nombre del personaje" style="flex:2;min-width:120px;background:#0d0d0c;border:1px solid var(--line-soft);border-radius:4px;color:var(--text);${CINZEL}font-size:14px;padding:8px 10px;">` +
          `<input class="inp" type="text" data-act="ed-clase" data-fid="ed-clase" value="${esc(pj.clase)}" placeholder="Clase / rango" style="flex:1;min-width:90px;background:#0d0d0c;border:1px solid var(--line-soft);border-radius:4px;color:var(--cyan);font-style:italic;font-size:13px;padding:8px 10px;">` +
        `</div>` +
        `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">` +
          `<select class="inp" data-act="ed-territorio" style="flex:1;font-size:12px;padding:7px 8px;">${options(territorioOpts(), pj.territorio)}</select>` +
          `<input type="color" data-act="ed-color" value="${esc(pj.color)}" title="Color manual" style="width:30px;height:30px;padding:0;border:none;background:transparent;cursor:pointer;">` +
        `</div>` +
        `<div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin:6px 0 6px;">Atributos <span style="color:var(--muted)">· ${totalPts} pts repartidos</span></div>` +
        `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">${attrsHtml}</div>` +
        `<div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin:14px 0 6px;">Equipo</div>` +
        `<div style="display:flex;flex-direction:column;gap:7px;">` +
          `<label style="display:flex;align-items:center;gap:8px;"><i class="ph ph-sword" title="Arma" style="color:var(--gold);font-size:16px;width:18px;"></i><select class="inp" data-act="ed-arma" style="flex:1;font-size:12.5px;padding:7px 8px;">${options(opts.armaOpts, pj.armaId)}</select></label>` +
          `<label style="display:flex;align-items:center;gap:8px;"><i class="ph ph-coat-hanger" title="Armadura" style="color:var(--gold);font-size:16px;width:18px;"></i><select class="inp" data-act="ed-armadura" style="flex:1;font-size:12.5px;padding:7px 8px;">${options(opts.armaduraOpts, pj.armaduraId)}</select></label>` +
          `<label style="display:flex;align-items:center;gap:8px;"><i class="ph ph-shield" title="Escudo" style="color:var(--gold);font-size:16px;width:18px;"></i><select class="inp" data-act="ed-escudo" style="flex:1;font-size:12.5px;padding:7px 8px;">${options(opts.escudoOpts, pj.escudoId)}</select></label>` +
        `</div>` +
        (aviso ? `<div style="font-size:11px;color:var(--danger);margin-top:6px;">${esc(aviso)}</div>` : "") +
        `<div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin:14px 0 6px;">Habilidades <span style="color:${habCount > 5 ? "var(--danger)" : "var(--muted)"}">· ${habCount}/5</span></div>` +
        `<div style="display:flex;gap:6px;margin-bottom:8px;">` +
          `<select class="inp" data-act="ed-addhab" style="flex:1;font-size:12px;padding:7px 8px;">${options(habOptsFor(pj), "")}</select>` +
          `<button class="h-cyan" data-act="ed-addcustom" style="cursor:pointer;white-space:nowrap;font-size:11.5px;color:var(--cyan);background:transparent;border:1px dashed rgba(130,182,198,0.35);border-radius:4px;padding:0 12px;">+ Personalizada</button>` +
        `</div>` +
        `<div style="display:flex;flex-direction:column;gap:7px;">${habList}</div>` +
        `<div style="display:flex;gap:8px;margin-top:14px;">` +
          `<button class="h-cyan" data-act="ed-usarTu" style="cursor:pointer;flex:1;${CINZEL}letter-spacing:0.08em;text-transform:uppercase;font-size:11px;color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);border-radius:4px;padding:10px;">Usar en Tú</button>` +
          `<button class="h-gold" data-act="ed-usarRival" style="cursor:pointer;flex:1;${CINZEL}letter-spacing:0.08em;text-transform:uppercase;font-size:11px;color:var(--gold);background:transparent;border:1px solid var(--gold-dim);border-radius:4px;padding:10px;">Usar en Rival</button>` +
        `</div>` +
      `</div>` +
    `</div>`
  );
}

/* ---------- Vista CONFIGURADOR DE BUILD ---------- */
function buildView() {
  const b = state.build;
  const arma = findArma(b.armaId), armadura = findArmadura(b.armaduraId), escudo = findEscudo(b.escudoId);
  const E = { atk: 0, def: 0, dmg: 0, prot: 0, agi: 0, pv: 0 };
  [arma, armadura, escudo].forEach((it) => { if (!it) return; ["atk", "def", "dmg", "prot", "agi", "pv"].forEach((k) => (E[k] += it[k] || 0)); });
  const coste = ((arma && arma.precio) || 0) + ((armadura && armadura.precio) || 0) + ((escudo && escudo.precio) || 0);
  const rng = !!(arma && arma.ranged);
  const at = b.attrs;
  const optList = (arr, none) => [{ v: "", l: none }].concat(arr.map((a) => ({ v: a.id, l: a.nombre + " · " + (a.precio || 0) + " 🐉" })));
  const attrsHtml = ATTR.map((a) => `<label style="display:flex;flex-direction:column;gap:3px;"><span style="font-size:10.5px;color:var(--muted);" title="${a.label}">${a.abbr}</span><input class="inp" type="number" inputmode="numeric" data-act="b-attr" data-key="${a.key}" data-fid="b-a-${a.key}" value="${esc(at[a.key])}" placeholder="0" style="width:100%;background:#0d0d0c;border:1px solid var(--line-soft);border-radius:4px;color:var(--text);${CINZEL}font-size:14px;padding:6px 8px;text-align:center;"></label>`).join("");
  const ataqueAttr = rng ? n(at.agilidad) : n(at.fuerza);
  const stats = [
    { label: rng ? "Ataque (Agilidad + equipo)" : "Ataque (Fuerza + equipo)", val: "" + (ataqueAttr + E.atk), sub: "+ dado en combate" },
    { label: "Defensa (Defensa + equipo)", val: "" + (n(at.defensa) + E.def), sub: "+ dado en combate" },
    { label: "Daño extra", val: sign(E.dmg), sub: "se suma al daño" },
    { label: "Protección", val: sign(E.prot), sub: "reduce daño recibido" },
    { label: "Agilidad efectiva", val: "" + (n(at.agilidad) + E.agi), sub: "iniciativa" },
    { label: "Puntos de vida", val: "" + (20 + E.pv), sub: "base 20 + equipo" },
  ].map((s) => `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--line-soft);"><span style="font-size:12.5px;color:var(--muted);">${s.label} <span style="font-size:10.5px;opacity:0.7;">· ${s.sub}</span></span><span style="${CINZEL}font-size:18px;color:var(--text);">${s.val}</span></div>`).join("");
  const compra = [];
  if (arma) compra.push({ nombre: arma.nombre, precio: arma.precio || 0, slot: "armaId" });
  if (armadura) compra.push({ nombre: armadura.nombre, precio: armadura.precio || 0, slot: "armaduraId" });
  if (escudo) compra.push({ nombre: escudo.nombre, precio: escudo.precio || 0, slot: "escudoId" });
  const compraHtml = compra.map((c) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0;border-top:1px solid var(--line-soft);font-size:12.5px;"><span style="color:var(--text);">${esc(c.nombre)}</span><span style="display:flex;align-items:center;gap:8px;"><span style="color:var(--gold);font-variant-numeric:tabular-nums;">${c.precio}</span><button class="h-danger" data-act="b-remove" data-slot="${c.slot}" style="cursor:pointer;width:20px;height:20px;color:var(--muted);background:transparent;border:1px solid var(--line-soft);border-radius:4px;font-size:12px;line-height:1;">×</button></span></div>`).join("");
  let aviso = "";
  if (arma && arma.twoH && b.escudoId) aviso = arma.nombre + " requiere dos manos: no puede llevar escudo.";
  if (arma && arma.noShield && b.escudoId) aviso = arma.nombre + " no permite portar escudo.";
  if (arma && arma.note) aviso = (aviso ? aviso + " " : "") + arma.note;

  return (
    `<section style="animation:wodfade .35s ease both;max-width:920px;margin:0 auto;">` +
      tituloSec("Configurador de build") +
      `<p style="text-align:center;color:var(--muted);font-size:13px;margin:0 auto 22px;max-width:640px;">Elige atributos y equipo de tienda y mira al instante cuánto cuesta en dragones y con qué stats acaba tu personaje.</p>` +
      `<div class="wod-duel-grid" style="display:grid;gap:20px;">` +
        `<div style="background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:16px;">` +
          `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;"><span style="${CINZEL}letter-spacing:0.12em;text-transform:uppercase;font-size:12px;color:var(--gold);">Atributos y equipo</span><button class="h-cyan" data-act="b-cargartu" style="cursor:pointer;font-size:11px;color:var(--cyan);background:transparent;border:1px solid rgba(130,182,198,0.35);border-radius:4px;padding:5px 10px;">Cargar equipo de «Tú»</button></div>` +
          `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">${attrsHtml}</div>` +
          `<div style="display:flex;flex-direction:column;gap:7px;">` +
            `<label style="display:flex;align-items:center;gap:8px;"><i class="ph ph-sword" title="Arma" style="color:var(--gold);font-size:16px;width:18px;"></i><select class="inp" data-act="b-arma" style="flex:1;font-size:12.5px;padding:7px 8px;">${options(optList(ARMAS, "— Sin arma —"), b.armaId)}</select></label>` +
            `<label style="display:flex;align-items:center;gap:8px;"><i class="ph ph-coat-hanger" title="Armadura" style="color:var(--gold);font-size:16px;width:18px;"></i><select class="inp" data-act="b-armadura" style="flex:1;font-size:12.5px;padding:7px 8px;">${options(optList(ARMADURAS, "— Sin armadura —"), b.armaduraId)}</select></label>` +
            `<label style="display:flex;align-items:center;gap:8px;"><i class="ph ph-shield" title="Escudo" style="color:var(--gold);font-size:16px;width:18px;"></i><select class="inp" data-act="b-escudo" style="flex:1;font-size:12.5px;padding:7px 8px;">${options(optList(ESCUDOS, "— Sin escudo —"), b.escudoId)}</select></label>` +
          `</div>` +
          (aviso ? `<div style="font-size:11px;color:var(--danger);margin-top:8px;">${esc(aviso)}</div>` : "") +
        `</div>` +
        `<div style="display:flex;flex-direction:column;gap:16px;">` +
          `<div style="background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--gold-dim);border-radius:6px;padding:18px;text-align:center;">` +
            `<div style="${CINZEL}letter-spacing:0.18em;text-transform:uppercase;font-size:11px;color:var(--muted);">Coste total del equipo</div>` +
            `<div style="${CINZEL}font-weight:700;font-size:clamp(30px,6vw,42px);color:var(--gold);line-height:1.1;margin:4px 0;">${coste.toLocaleString("es-ES")}</div>` +
            `<div style="font-size:11px;color:var(--muted);letter-spacing:0.14em;text-transform:uppercase;"><i class="ph ph-coins" style="vertical-align:-2px;"></i> Dragones</div>` +
            (compra.length === 0 ? `<p style="margin:10px 0 0;font-size:12px;color:var(--muted);font-style:italic;">Sin equipo seleccionado.</p>` : compraHtml) +
          `</div>` +
          `<div style="background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:16px;"><div style="${CINZEL}letter-spacing:0.12em;text-transform:uppercase;font-size:12px;color:var(--gold);margin-bottom:10px;">Stats resultantes</div>${stats}</div>` +
        `</div>` +
      `</div>` +
    `</section>`
  );
}

/* ---------- Vista REGLAS (estática) ---------- */
function reglasView() {
  const H = CINZEL + "font-weight:500;letter-spacing:0.14em;text-transform:uppercase;font-size:15px;color:var(--cyan);margin:0 0 8px;";
  const sec = (titulo, cuerpo) => `<div><h3 style="${H}">${titulo}</h3>${cuerpo}</div>`;
  return (
    `<section style="animation:wodfade .35s ease both;max-width:820px;margin:0 auto;">` +
      tituloSec("Reglas de combate") +
      `<div style="display:flex;flex-direction:column;gap:24px;font-size:14px;line-height:1.7;color:var(--text);margin-top:14px;">` +
        sec("Tiradas y cálculo", `<p style="margin:0 0 8px;">En cada intercambio ambos lanzan un <strong style="color:var(--gold);">dado de ataque</strong> y un <strong style="color:var(--gold);">dado de defensa</strong>. Al ataque se le suma la <strong style="color:var(--gold);">Fuerza</strong> (o <strong style="color:var(--gold);">Agilidad</strong> a distancia) más los bonos del arma; a la defensa se le suma la <strong style="color:var(--gold);">Defensa</strong> más armaduras y escudos.</p><p style="margin:0;">Un <strong style="color:var(--danger);">1 natural</strong> en ataque es Fallo (pega 0). Un <strong style="color:var(--danger);">1 natural</strong> en defensa solo aplica Defensa + armadura + escudo, sin sumar el dado.</p>`) +
        sec("Impacto y daño", `<p style="margin:0 0 8px;">Si el ataque total supera la defensa total del rival, el golpe impacta. La diferencia es el <strong style="color:var(--gold);">daño base</strong>.</p><div style="background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:12px 16px;font-family:ui-monospace,monospace;font-size:13px;color:var(--gold);">Daño final = (Ataque − Defensa) + bonos de daño − protecciones</div>`) +
        sec("Puntos de vida", `<p style="margin:0;">Todos parten de <strong style="color:var(--gold);">20 PV</strong> (más los que den armaduras, escudos o habilidades). Por debajo de <strong>10 PV</strong> el personaje está <em>herido</em>; con <strong>5 PV</strong> o menos, <em>gravemente herido</em> (tirada cada ronda para no perder la consciencia). A <strong>0 PV</strong> abandona el combate.</p>`) +
        sec("Orden e iniciativa", `<p style="margin:0;">Ataca primero quien tenga más <strong style="color:var(--gold);">Agilidad</strong>. En empate se compara, en orden: Defensa, Fuerza y Conocimiento; si persiste, el staff resuelve con una tirada de desempate.</p>`) +
        sec("Habilidades", `<p style="margin:0;">Por ronda puede usarse un máximo de 1 habilidad de cada rama (Fuerza, Defensa, Agilidad). Las <strong style="color:var(--gold);">pasivas (P)</strong> no cuentan en ese límite. Sus efectos numéricos se aplican con los campos de modificador de cada ficha.</p>`) +
        sec("Combate con más de dos participantes", `<p style="margin:0 0 8px;">Si aún nadie te ha atacado esa ronda, eliges libremente a qué rival golpear (solo a uno). Si ya te han atacado, puedes: responder solo a quien te atacó, o <strong style="color:var(--gold);">defenderte de él y además atacar a un segundo</strong>.</p><p style="margin:0;">Contra un solo rival tiras <strong style="color:var(--gold);">1 dado de ataque + 1 de defensa</strong>. Contra dos, tiras <strong style="color:var(--gold);">2 de ataque + 2 de defensa</strong> y asignas cada conjunto a un enfrentamiento; cada cruce se resuelve por separado.</p>`) +
        sec("Combate a distancia", `<p style="margin:0 0 8px;">Requiere el ítem de arco/ballesta o un arma corta arrojadiza (los arcos tienen munición infinita; las arrojadizas, 1 uso por enemigo). El ataque suma <strong style="color:var(--gold);">Agilidad</strong> en lugar de Fuerza, más los bonos del arma; la defensa funciona igual.</p><p style="margin:0;">Un tirador contra un combatiente cuerpo a cuerpo obtiene <strong style="color:var(--gold);">un turno de disparo por cada 2 puntos de Agilidad</strong> en que lo supere (el rival solo tira defensa). Agotados esos turnos, si ambos siguen en pie se pasa a melé y el tirador combate con Fuerza y Defensa.</p>`) +
        sec("Derrota y recuperación", `<p style="margin:0;">A <strong style="color:var(--danger);">0 PV</strong> el combatiente abandona el combate y necesita atención urgente de un maestre. Tras la lucha, si sufrió una Herida Grave, se tira un dado de salud para determinar su estado y su tiempo de recuperación.</p>`) +
      `</div>` +
    `</section>`
  );
}

/* ============================================================
   FOCO
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
   EVENTOS
   ============================================================ */
function accentColorFromTerritorio(v, fallback) { return v === "enemigo" ? ENEMY : ((TERRITORIOS.find((t) => t.id === v) || {}).color || fallback); }

function handleClick(e) {
  const t = e.target.closest("[data-act]");
  if (!t || t.tagName === "SELECT" || (t.tagName === "INPUT" && t.type !== "color")) return;
  const act = t.dataset.act, id = t.dataset.id, i = +t.dataset.i;
  switch (act) {
    case "nav": set({ view: t.dataset.view }); break;
    case "copyBB": { const A = state.A, B = state.B; const cAB = crossing(A, B), cBA = crossing(B, A); copy("bb", '<div class="duelos">\n' + bbTablilla(A, B, cAB, cBA) + "\n" + bbTablilla(B, A, cBA, cAB) + "\n</div>"); break; }
    case "nuevoPj": nuevoPj(); break;
    case "importToLib": importToLib(); break;
    case "exportAll": wodExportAll(); break;
    case "lib-edit": set({ editId: id }); break;
    case "lib-usarTu": loadInto("A", id); break;
    case "lib-usarRival": loadInto("B", id); break;
    case "lib-copy": copy("bib" + id, encode(state.pjs[id])); break;
    case "lib-del": { const pjs = { ...state.pjs }; delete pjs[id]; const rest = Object.keys(pjs); state.pjs = pjs; set({ editId: state.editId === id ? (rest[0] || "") : state.editId }); break; }
    case "ed-addcustom": addHabCustomLib(state.editId); break;
    case "ed-hab-toggle": { const pj = normalizePJ(state.pjs[state.editId]); updHabLib(state.editId, i, "usada", !pj.hab[i].usada); break; }
    case "ed-hab-remove": rmHabLib(state.editId, i); break;
    case "ed-usarTu": loadInto("A", state.editId); break;
    case "ed-usarRival": loadInto("B", state.editId); break;
    case "b-cargartu": { const A = state.A || {}; setBuild({ armaId: A.armaId || "", armaduraId: A.armaduraId || "", escudoId: A.escudoId || "", attrs: { ...state.build.attrs, ...(A.attrs || {}) } }); break; }
    case "b-remove": setBuild({ [t.dataset.slot]: "" }); break;
  }
}
function handleInput(e) {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  if (t.tagName === "SELECT") return; // los <select> se tratan en change
  const act = t.dataset.act, side = t.dataset.side, key = t.dataset.key, i = +t.dataset.i, v = t.value;
  switch (act) {
    case "side-color": setSide(side, { color: v }); break;
    case "side-nombre": setSide(side, { nombre: v }); break;
    case "side-datk": setSide(side, { dAtk: v }); break;
    case "side-ddef": setSide(side, { dDef: v }); break;
    case "side-mod": setSide(side, { [key]: v }); break;
    case "importText": { state.importText = v; state.importMsg = ""; const m = document.querySelector('[data-msg="imp"]'); if (m) m.textContent = ""; break; }
    case "ed-nombre": setLibPj(state.editId, { nombre: v }); break;
    case "ed-clase": setLibPj(state.editId, { clase: v }); break;
    case "ed-color": setLibPj(state.editId, { color: v }); break;
    case "ed-attr": { const pj = normalizePJ(state.pjs[state.editId]); setLibPj(state.editId, { attrs: { ...pj.attrs, [key]: v } }); break; }
    case "ed-hab-nombre": updHabLib(state.editId, i, "nombre", v); break;
    case "ed-hab-desc": updHabLib(state.editId, i, "desc", v); break;
    case "b-attr": setBuild({ attrs: { ...state.build.attrs, [key]: v } }); break;
  }
}
function handleChange(e) {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  if (t.dataset.act === "importFile") {
    const file = t.files && t.files[0];
    if (file) wodImportAll(file, (res) => { if (res.ok) location.reload(); else alert(res.msg); });
    return;
  }
  if (t.tagName !== "SELECT") return;
  const act = t.dataset.act, side = t.dataset.side, v = t.value;
  switch (act) {
    case "side-territorio": setSide(side, { territorio: v, color: accentColorForSide(v, state[side].color) }); break;
    case "side-load": if (v) loadInto(side, v); break;
    case "ed-territorio": { const pj = normalizePJ(state.pjs[state.editId]); setLibPj(state.editId, { territorio: v, color: accentColorForSide(v, pj.color) }); break; }
    case "ed-arma": setLibPj(state.editId, { armaId: v }); break;
    case "ed-armadura": setLibPj(state.editId, { armaduraId: v }); break;
    case "ed-escudo": setLibPj(state.editId, { escudoId: v }); break;
    case "ed-addhab": addHabPresetLib(state.editId, v); break;
    case "b-arma": setBuild({ armaId: v }); break;
    case "b-armadura": setBuild({ armaduraId: v }); break;
    case "b-escudo": setBuild({ escudoId: v }); break;
  }
}
function accentColorForSide(v, fallback) { return v === "enemigo" ? ENEMY : ((TERRITORIOS.find((t) => t.id === v) || {}).color || fallback); }

/* ============================================================
   INIT
   ============================================================ */
function init() {
  let s = {};
  try { const raw = localStorage.getItem(LS); if (raw) s = JSON.parse(raw); } catch (e) {}
  const A = s.A ? normalizePJ(s.A) : blankPJ("", "#82b6c6");
  const B = s.B ? normalizePJ(s.B) : blankPJ("", ENEMY);
  if (!s.B) B.territorio = "enemigo";
  const build = s.build ? { armaId: s.build.armaId || "", armaduraId: s.build.armaduraId || "", escudoId: s.build.escudoId || "", attrs: { ...state.build.attrs, ...(s.build.attrs || {}) } } : state.build;
  const view = ["reglas", "build", "duelo", "personajes"].indexOf(s.view) > -1 ? s.view : "duelo";
  const pjs = s.pjs || {};
  state = { ...state, pjs, A, B, build, view, editId: Object.keys(pjs)[0] || "" };
  persist();
  const app = document.getElementById("app");
  app.addEventListener("click", handleClick);
  app.addEventListener("input", handleInput);
  app.addEventListener("change", handleChange);
  render();
}
document.addEventListener("DOMContentLoaded", init);
