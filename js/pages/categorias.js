/* ==========================================================================
   categorias.js — Página de categorías
   Muestra una tarjeta por categoría con el número de noticias disponibles.
   Al hacer clic se abre el listado ya filtrado (noticias.html?cat=...).
   ========================================================================== */

$(() => {
  const { Data, UI } = InfoClick;
  const $grid = $('#category-grid');

  Data.getAll()
    .then((news) => {
      // Cuenta cuántas noticias hay por categoría usando reduce()
      const counts = news.reduce((acc, n) => {
        acc[n.categoria] = (acc[n.categoria] || 0) + 1;
        return acc;
      }, {});

      const html = Object.entries(Data.CATEGORIES).map(([key, cat]) => {
        const total = counts[key] || 0;
        return `
          <a class="category-card" href="noticias.html?cat=${key}">
            <img src="img/categoria-${key}.svg" alt="">
            <div>
              <h3>${cat.name}</h3>
              <p>${cat.description}</p>
              <p><strong>${total}</strong> ${total === 1 ? 'noticia' : 'noticias'}</p>
            </div>
          </a>`;
      }).join('');

      // Aparición escalonada de las tarjetas con hide() + fadeIn() y un pequeño retraso
      $grid.html(html).children().hide().each(function (i) {
        $(this).delay(i * 120).fadeIn(300);
      });
    })
    .fail(() => UI.showLoadError($grid));
});
