/* ==========================================================================
   data.js — Carga y consulta de noticias
   --------------------------------------------------------------------------
   Las noticias base viven en el archivo local data/noticias.json.
   Se obtienen con $.getJSON(), que por debajo realiza una petición HTTP GET
   al servidor (el mismo mecanismo petición/respuesta visto en la lectura 1).
   ========================================================================== */

window.InfoClick = window.InfoClick || {};

InfoClick.Data = (() => {
  const JSON_URL = 'data/noticias.json';

  // Catálogo de categorías: la clave es el valor guardado en el JSON
  const CATEGORIES = {
    actualidad: { name: 'Actualidad', description: 'Lo que pasa hoy en el país y las ciudades.' },
    tecnologia: { name: 'Tecnología', description: 'Innovación, ciencia y mundo digital.' },
    economia:   { name: 'Economía',   description: 'Mercados, empresas y finanzas personales.' },
    deportes:   { name: 'Deportes',   description: 'Resultados, figuras y competencias.' }
  };

  let request = null; // se guarda la petición para no descargar el JSON más de una vez por página

  /** Descarga el JSON (una sola vez) y retorna una promesa con el arreglo base. */
  const loadBase = () => {
    if (!request) {
      request = $.getJSON(JSON_URL);
    }
    return request;
  };

  /**
   * Retorna una promesa con todas las noticias, ordenadas de la más
   * reciente a la más antigua. Se usa slice() para no modificar el arreglo
   * original que queda guardado en la petición.
   */
  const getAll = () =>
    loadBase().then((news) => news.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));

  /** Busca una noticia por id. La promesa resuelve con la noticia o undefined. */
  const getById = (id) => getAll().then((list) => list.find((n) => n.id === Number(id)));

  /** Nombre legible de una categoría (ej. "tecnologia" → "Tecnología"). */
  const categoryName = (key) => (CATEGORIES[key] ? CATEGORIES[key].name : key);

  return { CATEGORIES, getAll, getById, categoryName };
})();
