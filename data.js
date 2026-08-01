/* ============================================================
   WODeconomy — Datos del sistema económico (Win or Die / GoT)
   Editar aquí es seguro: la app se reconstruye sola al guardar.
   Coste = { dragones, madera, hierro, piedra, alimento }
   ============================================================ */

// Recursos que maneja el sistema. El orden define cómo se muestran.
const RECURSOS = [
  { key: "dragones", label: "Dragones", icon: "🐉" },
  { key: "alimento", label: "Alimento", icon: "🌾" },
  { key: "madera",   label: "Madera",   icon: "🪵" },
  { key: "hierro",   label: "Hierro",   icon: "⚙️" },
  { key: "piedra",   label: "Piedra",   icon: "🪨" },
];

// Tramos de Orden Público y sus modificadores mensuales.
const ORDEN_PUBLICO = [
  { nombre: "Rebelión",    min: -Infinity, max: 0,   dragones: 0,    alimento: 0,   defensa: 0,  intercambio: 0,
    nota: "Rebelión campesina automática: no se obtienen beneficios económicos hasta sofocarla." },
  { nombre: "Furiosa",     min: 1,   max: 10,  dragones: -200, alimento: -20, defensa: -5, intercambio: -1,
    nota: "Riesgo de disturbios y sabotaje (dado): robo de recursos o edificio inactivo 1 mes." },
  { nombre: "Descontenta", min: 11,  max: 30,  dragones: -100, alimento: -10, defensa: -2, intercambio: 0,
    nota: "La primera leva movilizada del mes genera desorden narrativo leve." },
  { nombre: "Indiferente", min: 31,  max: 60,  dragones: 0,    alimento: 0,   defensa: 0,  intercambio: 0,
    nota: "Sin modificadores." },
  { nombre: "Contenta",    min: 61,  max: 85,  dragones: 100,  alimento: 10,  defensa: 2,  intercambio: 0,
    nota: "" },
  { nombre: "Jubilosa",    min: 86,  max: 100, dragones: 200,  alimento: 20,  defensa: 5,  intercambio: 1,
    nota: "Las levas movilizadas no consumen alimento durante el 1º mes de movilización." },
];

// Cada ruta comercial activa aporta:
const RUTA_COMERCIAL_DRAGONES = 100;

// Catálogo de la Tienda de Casas.
// cost: recursos que se pagan. produces: texto del efecto. limit: máx. por mes (si aplica).
const CATALOGO = [
  {
    categoria: "Edificios productivos",
    items: [
      { id: "cantera1", nombre: "Cantera", nivel: 1, cost: { dragones: 400 }, produces: "+4 piedra/mes", desc: "Cantera menor." },
      { id: "cantera2", nombre: "Cantera", nivel: 2, cost: { dragones: 450, madera: 4 }, produces: "+8 piedra/mes", desc: "Cantera ampliada." },
      { id: "cantera3", nombre: "Cantera", nivel: 3, cost: { dragones: 500, madera: 6, hierro: 3 }, produces: "+12 piedra/mes", desc: "Cantera mayor." },
      { id: "cantera4", nombre: "Cantera", nivel: 4, cost: { dragones: 550, madera: 7, hierro: 4, alimento: 20 }, produces: "+16 piedra/mes", desc: "Complejo cantero." },

      { id: "molino1", nombre: "Molino", nivel: 1, cost: { dragones: 400 }, produces: "+40 alimento/mes", desc: "Molino local." },
      { id: "molino2", nombre: "Molino", nivel: 2, cost: { dragones: 450, madera: 3, piedra: 1 }, produces: "+80 alimento/mes", desc: "Molino de aldea." },
      { id: "molino3", nombre: "Molino", nivel: 3, cost: { dragones: 500, madera: 5, piedra: 3, hierro: 1 }, produces: "+120 alimento/mes", desc: "Molino mayor." },
      { id: "molino4", nombre: "Molino", nivel: 4, cost: { dragones: 550, madera: 7, hierro: 2, piedra: 4 }, produces: "+160 alimento/mes", desc: "Complejo molinero." },

      { id: "aserradero1", nombre: "Aserradero", nivel: 1, cost: { dragones: 400 }, produces: "+4 madera/mes", desc: "Aserradero menor." },
      { id: "aserradero2", nombre: "Aserradero", nivel: 2, cost: { dragones: 450, piedra: 4 }, produces: "+8 madera/mes", desc: "Aserradero ampliado." },
      { id: "aserradero3", nombre: "Aserradero", nivel: 3, cost: { dragones: 500, piedra: 6, hierro: 3 }, produces: "+12 madera/mes", desc: "Aserradero mayor." },
      { id: "aserradero4", nombre: "Aserradero", nivel: 4, cost: { dragones: 550, piedra: 7, hierro: 4, alimento: 20 }, produces: "+16 madera/mes", desc: "Complejo maderero." },

      { id: "mina1", nombre: "Mina de hierro", nivel: 1, cost: { dragones: 400 }, produces: "+4 hierro/mes", desc: "Mina menor." },
      { id: "mina2", nombre: "Mina de hierro", nivel: 2, cost: { dragones: 450, madera: 4 }, produces: "+8 hierro/mes", desc: "Mina ampliada." },
      { id: "mina3", nombre: "Mina de hierro", nivel: 3, cost: { dragones: 500, madera: 6, piedra: 3 }, produces: "+12 hierro/mes", desc: "Mina mayor." },
      { id: "mina4", nombre: "Mina de hierro", nivel: 4, cost: { dragones: 550, madera: 6, piedra: 5, alimento: 20 }, produces: "+16 hierro/mes", desc: "Complejo minero." },

      { id: "mercado1", nombre: "Mercado", nivel: 1, cost: { dragones: 400 }, produces: "+400 dragones/mes", desc: "Mercado rural." },
      { id: "mercado2", nombre: "Mercado", nivel: 2, cost: { dragones: 450, madera: 4 }, produces: "+800 dragones/mes", desc: "Mercado consolidado." },
      { id: "mercado3", nombre: "Mercado", nivel: 3, cost: { dragones: 500, madera: 6, piedra: 3 }, produces: "+1200 dragones/mes", desc: "Gran mercado." },
      { id: "mercado4", nombre: "Mercado", nivel: 4, cost: { dragones: 550, madera: 7, piedra: 5, alimento: 20 }, produces: "+1600 dragones/mes", desc: "Centro mercantil." },

      { id: "granero1", nombre: "Granero", nivel: 1, cost: { madera: 4 }, produces: "+100 capacidad de alimento", desc: "Granero local." },
      { id: "granero2", nombre: "Granero", nivel: 2, cost: { dragones: 200, madera: 2, piedra: 2 }, produces: "+200 capacidad de alimento", desc: "Granero reforzado." },
      { id: "granero3", nombre: "Granero", nivel: 3, cost: { dragones: 300, madera: 3, piedra: 3 }, produces: "+300 capacidad de alimento", desc: "Almacén de grano." },
      { id: "granero4", nombre: "Granero", nivel: 4, cost: { dragones: 400, madera: 4, piedra: 3, hierro: 1 }, produces: "+400 capacidad de alimento", desc: "Gran silo." },

      { id: "muelle1", nombre: "Muelle", nivel: 1, cost: { dragones: 200, madera: 4 }, produces: "+1 ruta comercial (solo costeros)", desc: "Muelle comercial." },

      { id: "caravana1", nombre: "Caravana", nivel: 1, cost: { dragones: 100, madera: 2 }, produces: "+1 ruta comercial", desc: "Ruta caravanera." },
      { id: "caravana2", nombre: "Caravana", nivel: 2, cost: { dragones: 150, madera: 2, alimento: 20 }, produces: "+2 rutas comerciales", desc: "Red de caravanas." },
      { id: "caravana3", nombre: "Caravana", nivel: 3, cost: { dragones: 200, madera: 2, hierro: 2, alimento: 20 }, produces: "+3 rutas comerciales", desc: "Casa caravanera." },
      { id: "caravana4", nombre: "Caravana", nivel: 4, cost: { dragones: 250, madera: 3, piedra: 2, hierro: 2, alimento: 20 }, produces: "+4 rutas comerciales", desc: "Red mercantil terrestre." },
    ],
  },
  {
    categoria: "Edificios de orden público",
    items: [
      { id: "septo1", nombre: "Septo", nivel: 1, cost: { dragones: 200, madera: 1, piedra: 1 }, produces: "+10 orden público", desc: "Capilla." },
      { id: "septo2", nombre: "Septo", nivel: 2, cost: { dragones: 300, madera: 1, piedra: 2 }, produces: "+20 orden público", desc: "Septo local." },
      { id: "septo3", nombre: "Septo", nivel: 3, cost: { dragones: 450, madera: 2, piedra: 2 }, produces: "+30 orden público", desc: "Septo regional." },
      { id: "septo4", nombre: "Septo", nivel: 4, cost: { dragones: 500, madera: 2, piedra: 4 }, produces: "+40 orden público", desc: "Gran septo." },

      { id: "gobierno1", nombre: "Gobierno", nivel: 1, cost: { dragones: 100, madera: 3 }, produces: "+5 orden público, +100 dragones", desc: "Recaudador de impuestos." },
      { id: "gobierno2", nombre: "Gobierno", nivel: 2, cost: { dragones: 200, madera: 2, piedra: 1 }, produces: "+10 orden público, +200 dragones", desc: "Oficina de tasación." },
      { id: "gobierno3", nombre: "Gobierno", nivel: 3, cost: { dragones: 200, madera: 2, piedra: 2 }, produces: "+15 orden público, +300 dragones", desc: "Casa del concejo." },
      { id: "gobierno4", nombre: "Gobierno", nivel: 4, cost: { dragones: 200, madera: 2, piedra: 3 }, produces: "+20 orden público, +400 dragones", desc: "Ayuntamiento." },

      { id: "guardia1", nombre: "Guardia urbana", nivel: 1, cost: { dragones: 200, madera: 1, hierro: 1 }, produces: "+5 orden público · Guarnición: +100 levas", desc: "Guardia local." },
      { id: "guardia2", nombre: "Guardia urbana", nivel: 2, cost: { dragones: 300, madera: 2, piedra: 1, hierro: 1 }, produces: "+10 orden público · Guarnición: +100 arqueros, +100 levas", desc: "Cuartel urbano." },
      { id: "guardia3", nombre: "Guardia urbana", nivel: 3, cost: { dragones: 400, madera: 2, piedra: 1, hierro: 2 }, produces: "+15 orden público · Guarnición: +100 hombres de armas, +100 arqueros, +100 levas", desc: "Milicia urbana." },
      { id: "guardia4", nombre: "Guardia urbana", nivel: 4, cost: { dragones: 400, madera: 2, piedra: 1, hierro: 3 }, produces: "+20 orden público · Guarnición: +200 hombres de armas, +100 arqueros, +100 levas", desc: "Guardia urbana." },
    ],
  },
  {
    categoria: "Edificios defensivos",
    items: [
      { id: "muralla1", nombre: "Muralla", nivel: 1, cost: { dragones: 200, madera: 3 }, produces: "+10 defensa", desc: "Empalizada." },
      { id: "muralla2", nombre: "Muralla", nivel: 2, cost: { dragones: 200, piedra: 4 }, produces: "+20 defensa", desc: "Muralla baja." },
      { id: "muralla3", nombre: "Muralla", nivel: 3, cost: { dragones: 200, piedra: 6 }, produces: "+30 defensa", desc: "Muralla reforzada." },
      { id: "muralla4", nombre: "Muralla", nivel: 4, cost: { dragones: 200, piedra: 7, hierro: 1 }, produces: "+40 defensa", desc: "Gran muralla." },

      { id: "torres1", nombre: "Torres", nivel: 1, cost: { dragones: 250, madera: 2 }, produces: "+5 defensa, +1 dificultad a espionajes", desc: "Torre de madera." },
      { id: "torres2", nombre: "Torres", nivel: 2, cost: { dragones: 300, madera: 1, piedra: 2 }, produces: "+10 defensa, +10 VC Torre del Homenaje, +1 dif. espionaje", desc: "Torre de piedra." },
      { id: "torres3", nombre: "Torres", nivel: 3, cost: { dragones: 350, madera: 1, piedra: 3, hierro: 1 }, produces: "+15 defensa, +10 VC Torre del Homenaje, +10 VC Muralla, +1 dif. espionaje", desc: "Torre fortificada." },
      { id: "torres4", nombre: "Torres", nivel: 4, cost: { dragones: 400, madera: 1, piedra: 4, hierro: 1 }, produces: "+20 defensa, +15 VC Torre del Homenaje, +15 VC Muralla, +2 dif. espionaje", desc: "Bastión de vigilancia." },

      { id: "puerta1", nombre: "Puerta fortificada", nivel: 1, cost: { dragones: 300, madera: 1, hierro: 2 }, produces: "+5 defensa, +2 VC al defensor en asalto", desc: "Portón reforzado." },
      { id: "puerta2", nombre: "Puerta fortificada", nivel: 2, cost: { dragones: 500, piedra: 1, hierro: 3 }, produces: "+10 defensa, +4 VC al defensor en asalto", desc: "Puerta de hierro." },
      { id: "puerta3", nombre: "Puerta fortificada", nivel: 3, cost: { dragones: 750, madera: 1, piedra: 2, hierro: 4 }, produces: "+15 defensa, +6 VC al defensor en asalto", desc: "Puerta reforzada." },
      { id: "puerta4", nombre: "Puerta fortificada", nivel: 4, cost: { dragones: 1000, madera: 2, piedra: 3, hierro: 5 }, produces: "+20 defensa, +8 VC al defensor en asalto", desc: "Puerta fortificada." },
    ],
  },
  {
    categoria: "Tropas",
    items: [
      { id: "leva", nombre: "Leva", unidades: 200, cost: { dragones: 80, alimento: 10 }, mant: 10, limit: 2, produces: "200 unidades · Mantenimiento: 10 alimento" },
      { id: "lancero", nombre: "Lancero", unidades: 200, cost: { dragones: 160, madera: 1, hierro: 1, alimento: 10 }, mant: 12, limit: 2, produces: "200 unidades · Mantenimiento: 12 alimento" },
      { id: "arquero", nombre: "Arquero", unidades: 200, cost: { dragones: 150, madera: 2, alimento: 10 }, mant: 12, limit: 2, produces: "200 unidades · Mantenimiento: 12 alimento" },
      { id: "hombrearmas", nombre: "Hombre de armas", unidades: 200, cost: { dragones: 220, madera: 1, hierro: 2, alimento: 15 }, mant: 14, limit: 2, produces: "200 unidades · Mantenimiento: 14 alimento" },
      { id: "caballeros", nombre: "Caballeros", unidades: 100, cost: { dragones: 400, hierro: 3, alimento: 30 }, mant: 22, limit: 2, produces: "100 unidades · Mantenimiento: 22 alimento" },
    ],
  },
  {
    categoria: "Barcos",
    items: [
      { id: "transporte", nombre: "Transporte", cost: { dragones: 180, madera: 4 }, limit: 5, produces: "Capacidad: 4 unidades · máx. 5/mes" },
      { id: "galera", nombre: "Galera", cost: { dragones: 320, madera: 5, hierro: 1 }, limit: 2, produces: "Capacidad: 1 unidad · máx. 2/mes" },
      { id: "barcoluengo", nombre: "Barcoluengo", cost: { dragones: 300, madera: 5, hierro: 1 }, limit: 3, produces: "Capacidad: 1 unidad · máx. 3/mes" },
      { id: "galeraguerra", nombre: "Galera de guerra", cost: { dragones: 500, madera: 7, hierro: 2 }, limit: 2, produces: "Capacidad: 2 unidades · máx. 2/mes" },
      { id: "dromon", nombre: "Dromón", cost: { dragones: 750, madera: 9, hierro: 4, piedra: 1 }, limit: 2, produces: "Capacidad: 3 unidades · máx. 2/mes" },
    ],
  },
  {
    categoria: "Otros",
    items: [
      { id: "bodalocal", nombre: "Boda local", cost: { dragones: 150, alimento: 10 }, produces: "+5 orden público", desc: "Celebración humilde, apropiada para una casa menor o una boda apresurada." },
      { id: "granboda", nombre: "Gran boda", cost: { dragones: 300, alimento: 20 }, produces: "+10 orden público", desc: "Celebración notoria; un evento que nadie cercano debería perderse." },
      { id: "bodareal", nombre: "Boda Real", cost: { dragones: 500, alimento: 30, hierro: 2 }, produces: "+20 orden público", desc: "Celebración opulenta, llena de excentricidades y de la que se hablará durante largo tiempo." },
    ],
  },
];

// Índice rápido id -> item (con su categoría).
const CATALOGO_INDEX = {};
CATALOGO.forEach((cat) => cat.items.forEach((it) => (CATALOGO_INDEX[it.id] = { ...it, categoria: cat.categoria })));

/* ============================================================
   Sistema de Guerra — datos para el análisis de preparación.
   VC = Valor de Combate. mant = alimento/mes por unidad (bloque).
   ============================================================ */
const GUERRA = {
  frenteMax: 10,       // unidades máximas en línea de frente por bando
  retaguardiaMax: 10,  // unidades máximas en retaguardia por bando
  tropas: [
    { id: "leva", nombre: "Leva", unidades: 200, mant: 10, vc: 20, hab: "Sin habilidad, pero en número son formidables." },
    { id: "lancero", nombre: "Lancero", unidades: 200, mant: 12, vc: 40, hab: "Formación de picas: +40 VC vs Caballeros (les quita la carga); +10 VC vs otras tropas a pie." },
    { id: "arquero", nombre: "Arquero", unidades: 200, mant: 12, vc: 30, hab: "Lluvia de flechas: dispara a 2-3 cuadros antes del melee. +30 VC." },
    { id: "hombrearmas", nombre: "Hombre de armas", unidades: 200, mant: 14, vc: 50, hab: "Avance disciplinado: +10 VC (+20 VC vs Lanceros o Levas)." },
    { id: "caballeros", nombre: "Caballeros", unidades: 100, mant: 22, vc: 100, hab: "Carga de choque: +20 VC (+40 vs Arqueros/Levas). No en asedios." },
  ],
  barcos: [
    { id: "transporte", nombre: "Transporte", capacidad: 4, vc: 10, pv: 60, hab: "" },
    { id: "galera", nombre: "Galera", capacidad: 1, vc: 30, pv: 70, hab: "Maniobra ligera: +10 VC en el primer ataque (1 vez por rival)." },
    { id: "barcoluengo", nombre: "Barcoluengo", capacidad: 1, vc: 35, pv: 65, hab: "Embestida y asalto: +10 al abordaje 2 rondas.", soloIslas: true },
    { id: "galeraguerra", nombre: "Galera de guerra", capacidad: 2, vc: 45, pv: 90, hab: "Espolón: +15 VC y 10 PV extra en el primer choque." },
    { id: "dromon", nombre: "Dromón", capacidad: 3, vc: 60, pv: 120, hab: "Artillería: 20 PV directos (30 vs galeras/barcoluengos/transportes)." },
  ],
  // La Defensa del asentamiento determina qué estructuras hay que tomar en un asalto.
  defensas: [
    { min: 1, max: 29, estructuras: ["Torre del homenaje"] },
    { min: 30, max: 49, estructuras: ["Muralla exterior", "Torre del homenaje"] },
    { min: 50, max: 69, estructuras: ["Muralla exterior", "Puerta principal", "Torre del homenaje"] },
    { min: 70, max: 89, estructuras: ["Muralla exterior", "Puerta principal", "Muralla interior", "Torre del homenaje"] },
    { min: 90, max: 109, estructuras: ["Muralla exterior", "Patio exterior", "Puerta principal", "Muralla interior", "Torre del homenaje"] },
    { min: 110, max: 129, estructuras: ["Muralla exterior", "Patio exterior", "Puerta principal", "Muralla interior", "Patio interior", "Torre del homenaje"] },
    { min: 130, max: 149, estructuras: ["Muralla exterior", "Patio exterior", "Puerta principal", "Muralla interior", "Patio interior", "Torreón", "Torre del homenaje"] },
    { min: 150, max: 160, estructuras: ["Muralla exterior", "Patio exterior", "Puerta principal", "Muralla interior", "Patio interior", "Torreón", "Puerta interior", "Torre del homenaje"] },
  ],
};
