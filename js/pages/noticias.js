/* ==========================================================================
   noticias.js — Listado de noticias
   - Renderiza TODAS las tarjetas una sola vez desde el JSON.
   - Filtra por categoría (chips) y por texto (buscador) usando el método
     filter() de jQuery, tal como se explica en la lectura 5.
   - Pagina los resultados mostrando/ocultando tarjetas con show()/hide().
   ========================================================================== */

$(() => {
  const { Data, UI } = InfoClick;
  const PAGE_SIZE = 6;

  const $grid = $('#news-grid');
  const $chips = $('#category-chips');
  const $search = $('#search');
  const $info = $('#results-info');
  const $pagination = $('#pagination');
  const $empty = $('#empty-results');

  // Estado de la vista; la categoría inicial puede venir en la URL (?cat=deportes)
  const state = {
    category: UI.getParam('cat') || 'todas',
    text: '',
    page: 1
  };

  /** Crea los chips de filtro a partir del catálogo de categorías. */
  const renderChips = () => {
    const chips = [{ key: 'todas', name: 'Todas' },
      ...Object.entries(Data.CATEGORIES).map(([key, c]) => ({ key, name: c.name }))];

    $chips.html(chips.map((c) => `
      <button type="button" class="chip ${c.key === state.category ? 'is-active' : ''}"
              data-cat="${c.key}" aria-pressed="${c.key === state.category}">${c.name}</button>`).join(''));
  };

  /** Botones de paginación: ‹ 1 2 3 › */
  const renderPagination = (totalPages) => {
    if (totalPages <= 1) { $pagination.empty(); return; }
    let html = `<button type="button" class="page-btn" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''} aria-label="Página anterior">‹</button>`;
    for (let p = 1; p <= totalPages; p++) {
      html += `<button type="button" class="page-btn ${p === state.page ? 'is-active' : ''}" data-page="${p}" ${p === state.page ? 'aria-current="page"' : ''}>${p}</button>`;
    }
    html += `<button type="button" class="page-btn" data-page="${state.page + 1}" ${state.page === totalPages ? 'disabled' : ''} aria-label="Página siguiente">›</button>`;
    $pagination.html(html);
  };

  /** Aplica filtros + paginación sobre las tarjetas ya existentes en el DOM. */
  const applyFilters = () => {
    const text = state.text.toLowerCase();

    // filter() recibe una función que decide, tarjeta por tarjeta, si se conserva
    const $matches = $grid.children('.news-card').filter(function () {
      const $card = $(this);
      const byCategory = state.category === 'todas' || $card.data('categoria') === state.category;
      const byText = !text || $card.text().toLowerCase().includes(text);
      return byCategory && byText;
    });

    const total = $matches.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * PAGE_SIZE;

    // Se ocultan todas y se muestran solo las de la página actual
    $grid.children('.news-card').hide();
    $matches.slice(start, start + PAGE_SIZE).fadeIn(200);

    $empty.toggle(total === 0);
    $info.text(total
      ? `Mostrando ${start + 1}–${Math.min(start + PAGE_SIZE, total)} de ${total} noticias`
      : '');
    renderPagination(totalPages);

    // Mantiene la categoría en la URL para poder compartir el enlace filtrado
    const url = state.category === 'todas' ? 'noticias.html' : `noticias.html?cat=${state.category}`;
    window.history.replaceState(null, '', url);
  };

  /* ------------------------------ Eventos ------------------------------ */

  $chips.on('click', '.chip', function () {
    state.category = $(this).data('cat');
    state.page = 1;
    $(this).addClass('is-active').attr('aria-pressed', true)
      .siblings().removeClass('is-active').attr('aria-pressed', false);
    applyFilters();
  });

  // 'input' se dispara con cada tecla, así el filtrado es inmediato
  $search.on('input', function () {
    state.text = $(this).val().trim();
    state.page = 1;
    applyFilters();
  });

  $pagination.on('click', '.page-btn:not(:disabled)', function () {
    state.page = Number($(this).data('page'));
    applyFilters();
    $('html, body').animate({ scrollTop: $('#listado').offset().top - 90 }, 300);
  });

  /* ------------------------------ Inicio ------------------------------- */

  if (state.category !== 'todas' && !Data.CATEGORIES[state.category]) {
    state.category = 'todas'; // categoría inválida en la URL
  }
  renderChips();

  Data.getAll()
    .then((news) => {
      UI.renderCards($grid, news);
      applyFilters();
    })
    .fail(() => UI.showLoadError($grid));
});
