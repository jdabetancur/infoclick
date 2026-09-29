/* ==========================================================================
   home.js — Página de inicio
   - Slider principal con las noticias marcadas como "destacado" en el JSON.
   - Sección "Noticias destacadas" con las 3 noticias más recientes.
   ========================================================================== */

$(() => {
  const { Data, UI } = InfoClick;
  const $slider = $('#hero-slider');
  const $dots = $('#hero-dots');
  const $featured = $('#featured-grid');

  const SLIDE_INTERVAL = 6000; // ms entre cada cambio automático
  let current = 0;
  let timer = null;

  /** Plantilla de una diapositiva del banner principal. */
  const slideTemplate = (news, index) => `
    <div class="hero-slide" data-index="${index}" ${index === 0 ? '' : 'style="display:none"'}>
      <div>
        <span class="badge">Destacado · ${UI.escapeHtml(Data.categoryName(news.categoria))}</span>
        <h1>${UI.escapeHtml(news.titulo)}</h1>
        <p>${UI.escapeHtml(news.resumen)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="detalle.html?id=${news.id}">Leer noticia</a>
          <a class="btn btn-outline" href="noticias.html">Ver últimas noticias</a>
        </div>
      </div>
      <a class="hero-media" href="detalle.html?id=${news.id}" tabindex="-1" aria-hidden="true">
        <img src="${UI.escapeHtml(news.imagen)}" alt="">
      </a>
    </div>`;

  /** Cambia a la diapositiva indicada con un efecto de desvanecimiento. */
  const goTo = (index) => {
    const $slides = $slider.children('.hero-slide');
    if (index === current || !$slides.length) return;
    $slides.eq(current).stop(true, true).fadeOut(250, () => {
      $slides.eq(index).fadeIn(350);
    });
    $dots.children().removeClass('is-active').attr('aria-selected', false)
      .eq(index).addClass('is-active').attr('aria-selected', true);
    current = index;
  };

  const startAutoplay = (total) => {
    clearInterval(timer);
    timer = setInterval(() => goTo((current + 1) % total), SLIDE_INTERVAL);
  };

  Data.getAll()
    .then((news) => {
      // --- Slider: noticias destacadas (máximo 3) ---
      let highlights = news.filter((n) => n.destacado).slice(0, 3);
      if (!highlights.length) highlights = news.slice(0, 3); // por si el usuario eliminó las destacadas

      $slider.html(highlights.map(slideTemplate).join(''));
      $dots.html(highlights.map((n, i) => `
        <button type="button" class="slider-dot ${i === 0 ? 'is-active' : ''}" role="tab"
                aria-selected="${i === 0}" aria-label="Ir a la noticia ${i + 1}" data-index="${i}"></button>`).join(''));

      $dots.on('click', '.slider-dot', function () {
        goTo(Number($(this).data('index')));
        startAutoplay(highlights.length);
      });

      if (highlights.length > 1) {
        startAutoplay(highlights.length);
        // Pausa el carrusel mientras el usuario tiene el mouse encima
        $('.hero').on('mouseenter', () => clearInterval(timer))
                  .on('mouseleave', () => startAutoplay(highlights.length));
      }

      // --- Tarjetas: las 3 noticias más recientes ---
      UI.renderCards($featured, news.slice(0, 3));
    })
    .fail(() => {
      UI.showLoadError($featured);
      $slider.empty();
    });
});
