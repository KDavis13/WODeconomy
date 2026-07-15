# WODeconomy 🐉

Calculadora de economía de Casas para el foro **Win or Die** (Game of Thrones).

App estática (HTML + CSS + JS, sin dependencias ni build) lista para **GitHub Pages**.

## Qué hace

- **🛒 Tienda + Carrito**: navega el catálogo completo (edificios, tropas, barcos…), añade artículos y ve el coste total por recurso, si te alcanza y cuánto te sobra/falta.
- **💰 Mis recursos**: introduce tus dragones, alimento, madera, hierro y piedra (se guardan solos en tu navegador). Filtra el catálogo para ver **solo lo que puedes permitirte**.
- **🎲 Tirada mensual**: estima los ingresos del mes (dado + bonos + rutas comerciales + ingresos de edificios + modificadores de Orden Público).
- **📜 Reglas**: tabla de tramos de Orden Público y sus efectos.

## Archivos

| Archivo | Contenido |
|---------|-----------|
| `index.html` | Estructura de la página |
| `style.css` | Estilo (tema dorado sobre oscuro) |
| `data.js` | **Toda la tienda y las reglas** — edita aquí para cambiar precios/efectos |
| `app.js` | Lógica de cálculo |

## Editar precios o añadir artículos

Todo vive en `data.js`. Cada artículo tiene esta forma:

```js
{ id: "cantera1", nombre: "Cantera", nivel: 1, cost: { dragones: 400 }, produces: "+4 piedra/mes", desc: "Cantera menor." }
```

`cost` acepta cualquiera de: `dragones`, `alimento`, `madera`, `hierro`, `piedra`.
Las tropas admiten `mant` (mantenimiento en alimento) y `limit` (máx. por mes).

## Desplegar en GitHub Pages

1. Sube estos archivos a la rama `main`.
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Elige `main` y carpeta `/ (root)`. Guarda.
4. En ~1 minuto estará en `https://kdavis13.github.io/WODeconomy/`.
