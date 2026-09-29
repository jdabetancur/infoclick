# InfoClick — Plataforma Web de Noticias

Prototipo funcional (Entrega 2) del módulo **Desarrollo de Front-end** — Politécnico Grancolombiano.
Autor: Jose David Betancur Carmona · Tutor: John Olarte Ramos.

InfoClick es un portal de noticias donde el usuario puede explorar noticias por categoría, leer el detalle,
guardar favoritos y escribir a la redacción.

## Tecnologías

- **HTML5** semántico (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`).
- **CSS3** en archivo externo: variables, Flexbox, Grid y media queries (diseño adaptable).
- **JavaScript + jQuery 3.7.1**: selectores, `filter()`, eventos con `on()`, delegación de eventos,
  efectos (`fadeIn`, `fadeOut`, `slideToggle`, `slideDown`, `animate`) y `$.getJSON()`.
- **JSON local** (`data/noticias.json`) como fuente de datos.
- **localStorage / sessionStorage** para favoritos y mensajes de contacto.

## Funcionalidades

| Requisito | Dónde |
|---|---|
| Home con header, bienvenida (slider), destacadas, CTA, testimonios y footer | `index.html` |
| Listado en cards con filtro por categoría, buscador y paginación | `noticias.html` |
| Vista de detalle + noticias relacionadas | `detalle.html?id=N` |
| Categorías con conteo de noticias | `categorias.html` |
| Favoritos persistentes (localStorage) | ☆ en cada card; lista en el ícono rojo del encabezado (`favoritos.html`) |
| Formulario de contacto validado + confirmación | `contacto.html` |

## Estructura

```
infoclick/
├── index.html · noticias.html · detalle.html · categorias.html
├── favoritos.html · contacto.html
├── css/styles.css          # estilos (tokens del mockup de Figma)
├── data/noticias.json      # 16 noticias de ejemplo
├── img/                    # ilustraciones SVG por noticia y categoría
└── js/
    ├── store.js            # acceso a localStorage / sessionStorage
    ├── data.js             # carga del JSON y consultas de noticias
    ├── ui.js               # tarjeta reutilizable, favoritos, compartir, toast, menú
    ├── pages/*.js          # lógica de cada página
    └── vendor/jquery-3.7.1.min.js   # respaldo local si falla el CDN
```