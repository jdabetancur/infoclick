/* ==========================================================================
   detalle.js — Vista de detalle de una noticia
   Lee el id desde la URL (detalle.html?id=3), busca la noticia en los datos
   y construye el artículo completo + la sección "Te puede interesar".
   ========================================================================== */

$(() => {
  const { Data, Store, UI } = InfoClick;
  const $article = $('#article');
  const $related = $('#related-grid');
  const id = Number(UI.getParam('id'));

  /** Iniciales del autor para el avatar circular (ej. "Laura Gómez" → "LG"). */
  const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const notFound = () => {
    document.title = 'Noticia no encontrada · InfoClick';
    $article.html(`
      <div class="empty-state">
        <h3>No encontramos esta noticia</h3>
        <p>Es posible que haya sido eliminada o que el enlace sea incorrecto.</p>
        <a class="btn btn-primary" href="noticias.html">Ver todas las noticias</a>
      </div>`);
    $('#related-section').hide();
  };

  const renderArticle = (news) => {
    const fav = Store.isFavorite(news.id);
    const catName = Data.categoryName(news.categoria);
    document.title = `${news.titulo} · InfoClick`;

    // El contenido viene como arreglo de párrafos; si fuera texto plano se divide por saltos de línea
    const paragraphs = Array.isArray(news.contenido) ? news.contenido : String(news.contenido).split(/\n+/);

    $article.html(`
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <ol>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="noticias.html?cat=${news.categoria}">${UI.escapeHtml(catName)}</a></li>
          <li aria-current="page">Detalle de la noticia</li>
        </ol>
      </nav>
      <span class="badge badge-blue">${UI.escapeHtml(catName)}</span>
      <h1>${UI.escapeHtml(news.titulo)}</h1>
      <div class="article-meta">
        <span class="avatar" aria-hidden="true">${UI.escapeHtml(initials(news.autor))}</span>
        <span>Por ${UI.escapeHtml(news.autor)}</span> ·
        <time datetime="${news.fecha}">${UI.formatDate(news.fecha)}</time> ·
        <span>${news.lecturaMin} min de lectura</span>
      </div>
      <figure class="article-figure">
        <img src="${UI.escapeHtml(news.imagen)}" alt="Imagen de la noticia: ${UI.escapeHtml(news.titulo)}">
      </figure>
      <div class="article-body">
        ${paragraphs.map((p) => `<p>${UI.escapeHtml(p)}</p>`).join('')}
      </div>
      <div class="article-actions">
        <button type="button" class="btn btn-outline js-fav-detail ${fav ? 'is-active' : ''}"
                data-id="${news.id}" aria-pressed="${fav}">${fav ? '★ Guardado en favoritos' : '☆ Guardar en favoritos'}</button>
        <button type="button" class="btn btn-outline js-share" data-id="${news.id}"
                data-title="${UI.escapeHtml(news.titulo)}">↗ Compartir</button>
        <a class="btn btn-outline" href="contacto.html?asunto=noticia&ref=${news.id}">✉ Contactar a la redacción</a>
      </div>`);
  };

  /** Relacionadas: primero de la misma categoría, luego las más recientes. */
  const renderRelated = (news, all) => {
    const others = all.filter((n) => n.id !== news.id);
    const sameCategory = others.filter((n) => n.categoria === news.categoria);
    const rest = others.filter((n) => n.categoria !== news.categoria);
    UI.renderCards($related, [...sameCategory, ...rest].slice(0, 3));
  };

  Data.getAll()
    .then((all) => {
      const news = all.find((n) => n.id === id);
      if (!news) { notFound(); return; }
      renderArticle(news);
      renderRelated(news, all);
    })
    .fail(() => UI.showLoadError($article));
});
