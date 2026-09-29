/* ==========================================================================
   favoritos.js — Lista personalizada de favoritos
   Muestra las noticias cuyos ids están guardados en localStorage.
   Si el usuario quita una desde aquí, la tarjeta desaparece con fadeOut().
   ========================================================================== */

$(() => {
  const { Data, Store, UI } = InfoClick;
  const $grid = $('#favorites-grid');
  const $empty = $('#favorites-empty');
  const $count = $('#favorites-count');
  const $clear = $('#clear-favorites');

  const updateSummary = () => {
    const total = $grid.children('.news-card').length;
    $count.text(total ? `Tienes ${total} ${total === 1 ? 'noticia guardada' : 'noticias guardadas'}.` : '');
    $empty.toggle(total === 0);
    $clear.toggle(total > 0);
  };

  Data.getAll()
    .then((news) => {
      const favIds = Store.getFavorites();
      // Se respeta el orden en que el usuario las fue guardando (la última primero)
      const favorites = favIds.slice().reverse()
        .map((id) => news.find((n) => n.id === id))
        .filter(Boolean);
      UI.renderCards($grid, favorites);
      updateSummary();
    })
    .fail(() => UI.showLoadError($grid));

  // Evento personalizado lanzado por ui.js cada vez que cambia un favorito
  $(document).on('favoritos:cambio', (event, id, isFav) => {
    if (!isFav) {
      $grid.children(`.news-card[data-id="${id}"]`).fadeOut(300, function () {
        $(this).remove();
        updateSummary();
      });
    }
  });

  $clear.on('click', () => {
    if (!confirm('¿Seguro que deseas quitar todas las noticias de favoritos?')) return;
    Store.getFavorites().forEach(Store.removeFavorite);
    UI.updateFavCount();
    $grid.children().fadeOut(300).promise().done(() => {
      $grid.empty();
      updateSummary();
    });
    UI.toast('Se vació tu lista de favoritos');
  });
});
