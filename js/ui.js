/* ==========================================================================
   ui.js — Componentes de interfaz reutilizables (con jQuery)
   --------------------------------------------------------------------------
   Aquí está todo lo que se comparte entre páginas:
     - Plantilla de la tarjeta de noticia (el mismo componente del mockup se
       usa en Home, Listado, Relacionadas y Favoritos).
     - Manejadores de eventos globales: favoritos, compartir, menú móvil.
     - Utilidades: formato de fechas, escape de HTML, notificaciones (toast).
   ========================================================================== */

window.InfoClick = window.InfoClick || {};

InfoClick.UI = (() => {
  const { Store, Data } = InfoClick;

  /* ---------------------------- Utilidades ---------------------------- */

  /**
   * Escapa caracteres especiales de HTML antes de insertar texto en la
   * página. Así, si un dato contuviera algo como <script>, se mostraría
   * como texto y no se ejecutaría como código (previene ataques XSS).
   */
  const escapeHtml = (text) =>
    String(text ?? '').replace(/[&<>"']/g, (ch) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));

  /** Fecha larga en español: "13 de septiembre de 2026". */
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

  /** Tiempo relativo como en el mockup: "Hace 3 h", "Hace 2 días". */
  const timeAgo = (iso) => {
    const minutes = Math.round((Date.now() - new Date(iso)) / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.round(hours / 24);
    if (days <= 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    return formatDate(iso);
  };

  /** Lee un parámetro de la URL actual, p. ej. detalle.html?id=3 → "3". */
  const getParam = (name) => new URLSearchParams(window.location.search).get(name);

  /* ------------------------ Componente tarjeta ------------------------ */

  /** Devuelve el HTML de una tarjeta de noticia (template literal). */
  const cardTemplate = (news) => {
    const fav = Store.isFavorite(news.id);
    const url = `detalle.html?id=${news.id}`;
    return `
      <article class="news-card" data-id="${news.id}" data-categoria="${escapeHtml(news.categoria)}">
        <div class="card-media">
          <a href="${url}" tabindex="-1" aria-hidden="true">
            <img src="${escapeHtml(news.imagen)}" alt="" loading="lazy">
          </a>
          <div class="card-actions">
            <button type="button" class="icon-btn js-fav ${fav ? 'is-fav' : ''}" data-id="${news.id}"
                    aria-pressed="${fav}" aria-label="${fav ? 'Quitar de' : 'Agregar a'} favoritos"
                    title="${fav ? 'Quitar de' : 'Agregar a'} favoritos">${fav ? '★' : '☆'}</button>
            <button type="button" class="icon-btn js-share" data-id="${news.id}"
                    aria-label="Compartir noticia" title="Compartir">↗</button>
          </div>
        </div>
        <div class="card-body">
          <span class="badge">${escapeHtml(Data.categoryName(news.categoria))}</span>
          <h3 class="card-title"><a href="${url}">${escapeHtml(news.titulo)}</a></h3>
          <p class="card-summary">${escapeHtml(news.resumen)}</p>
          <div class="card-footer">
            <p class="card-meta">${escapeHtml(news.autor)} · ${timeAgo(news.fecha)}</p>
            <a class="card-more" href="${url}">Ver más →</a>
          </div>
        </div>
      </article>`;
  };

  /** Pinta un arreglo de noticias dentro de un contenedor jQuery. */
  const renderCards = ($container, list) => {
    $container.html(list.map(cardTemplate).join(''));
  };

  /* --------------------------- Notificación --------------------------- */

  let toastTimer;
  /** Muestra un mensaje breve usando los efectos fadeIn/fadeOut de jQuery. */
  const toast = (message) => {
    let $toast = $('#toast');
    if (!$toast.length) {
      $toast = $('<div id="toast" class="toast" role="status" aria-live="polite"></div>').appendTo('body');
    }
    clearTimeout(toastTimer);
    $toast.stop(true, true).text(message).fadeIn(200);
    toastTimer = setTimeout(() => $toast.fadeOut(400), 2200);
  };

  /* ---------------------------- Favoritos ----------------------------- */

  /** Actualiza el contador del header (el círculo rojo del mockup). */
  const updateFavCount = () => {
    const total = Store.getFavorites().length;
    $('.fav-count').text(total).toggle(total > 0);
  };

  /** Sincroniza visualmente TODOS los botones de favorito de una noticia. */
  const paintFavButtons = (id) => {
    const fav = Store.isFavorite(id);
    // Botones circulares de las tarjetas
    $(`.js-fav[data-id="${id}"]`)
      .toggleClass('is-fav', fav)
      .attr({ 'aria-pressed': fav, 'aria-label': `${fav ? 'Quitar de' : 'Agregar a'} favoritos`, title: `${fav ? 'Quitar de' : 'Agregar a'} favoritos` })
      .text(fav ? '★' : '☆');
    // Botón con texto de la vista de detalle
    $(`.js-fav-detail[data-id="${id}"]`)
      .attr('aria-pressed', fav)
      .toggleClass('is-active', fav)
      .text(fav ? '★ Guardado en favoritos' : '☆ Guardar en favoritos');
  };

  /* ----------------------------- Compartir ---------------------------- */

  /** Usa la API nativa de compartir si existe; si no, copia el enlace. */
  const share = (id, title) => {
    const url = new URL(`detalle.html?id=${id}`, window.location.href).href;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => { /* el usuario canceló */ });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => toast('Enlace copiado al portapapeles'))
        .catch(() => toast(url));
    } else {
      toast(url);
    }
  };

  /** Mensaje de error cuando el JSON no se puede cargar. */
  const showLoadError = ($container) => {
    $container.html(`
      <div class="alert-error">
        <strong>No se pudieron cargar las noticias.</strong><br>
        Si abriste el archivo con doble clic (file://), el navegador bloquea la
        lectura del JSON. Ábrelo con un servidor local (por ejemplo, la extensión
        Live Server de VS Code) o desde GitHub Pages.
      </div>`);
  };

  /* ---------------------- Inicialización global ----------------------- */

  const init = () => {
    updateFavCount();

    // Menú móvil: slideToggle() anima la aparición/desaparición del menú
    $('.nav-toggle').on('click', function () {
      const expanded = $(this).attr('aria-expanded') === 'true';
      $(this).attr('aria-expanded', !expanded);
      $('.main-nav').stop(true, true).slideToggle(200);
    });

    // Delegación de eventos: el manejador se registra en document y funciona
    // también para las tarjetas que se crean después dinámicamente.
    $(document).on('click', '.js-fav, .js-fav-detail', function () {
      const id = $(this).data('id');
      const nowFav = Store.toggleFavorite(id);
      paintFavButtons(id);
      updateFavCount();
      toast(nowFav ? 'Noticia guardada en favoritos' : 'Noticia eliminada de favoritos');
      $(document).trigger('favoritos:cambio', [id, nowFav]); // evento propio para otras páginas
    });

    $(document).on('click', '.js-share', function () {
      const $btn = $(this);
      const title = $btn.data('title') || $btn.closest('.news-card').find('.card-title').text();
      share($btn.data('id'), title);
    });

    // Año dinámico en el footer
    $('.js-year').text(new Date().getFullYear());
  };

  return {
    escapeHtml, formatDate, timeAgo, getParam,
    cardTemplate, renderCards, toast, updateFavCount, paintFavButtons, showLoadError, init
  };
})();

// Se ejecuta cuando el DOM está listo: $(() => {...}) equivale a $(document).ready()
$(() => InfoClick.UI.init());
