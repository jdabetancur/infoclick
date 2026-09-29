/* ==========================================================================
   contacto.js — Validación del formulario de contacto
   --------------------------------------------------------------------------
   El formulario usa el atributo "novalidate" para desactivar los globos
   nativos del navegador y mostrar en su lugar los mensajes diseñados en el
   mockup (texto rojo debajo del campo).

   Reglas:
     - Nombre:  obligatorio, mínimo 3 letras, solo letras y espacios.
     - Correo:  obligatorio, formato válido (usuario@dominio.ext).
     - Asunto:  obligatorio (lista desplegable).
     - Mensaje: obligatorio, mínimo 20 caracteres.

   Al enviar correctamente se muestra un mensaje de confirmación y se guarda
   el mensaje en sessionStorage (no hay backend en este prototipo).
   ========================================================================== */

$(() => {
  const { Store, UI } = InfoClick;
  const $form = $('#contact-form');
  const $success = $('#form-success');
  const MIN_MESSAGE = 20;

  // Cada regla retorna un texto de error, o una cadena vacía si el valor es válido
  const rules = {
    nombre: (v) => {
      if (!v) return 'El nombre es obligatorio.';
      if (v.length < 3) return 'Escribe al menos 3 caracteres.';
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(v)) return 'El nombre solo puede contener letras y espacios.';
      return '';
    },
    correo: (v) => {
      if (!v) return 'El correo electrónico es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingresa un correo electrónico válido.';
      return '';
    },
    asunto: (v) => (v ? '' : 'Selecciona el motivo de tu mensaje.'),
    mensaje: (v) => {
      if (!v) return 'El mensaje es obligatorio.';
      if (v.length < MIN_MESSAGE) return `Mínimo ${MIN_MESSAGE} caracteres (llevas ${v.length}).`;
      return '';
    }
  };

  /**
   * Valida un campo y actualiza su estado visual.
   * Guarda el texto de ayuda original en data-hint para restaurarlo.
   */
  const validateField = ($field) => {
    const name = $field.attr('name');
    const value = $.trim($field.val());
    const error = rules[name](value);
    const $group = $field.closest('.form-group');
    const $hint = $group.find('.form-hint').not('.char-counter');

    if ($hint.data('hint') === undefined) $hint.data('hint', $hint.text());

    $group.toggleClass('has-error', !!error).toggleClass('is-valid', !error);
    $field.attr('aria-invalid', !!error);
    $hint.text(error || $hint.data('hint'));
    return !error;
  };

  // Valida al salir del campo (blur) y, una vez tocado, mientras se escribe
  $form.on('blur', '.form-control', function () {
    $(this).data('touched', true);
    validateField($(this));
  });
  $form.on('input change', '.form-control', function () {
    if ($(this).data('touched')) validateField($(this));
  });

  // Contador de caracteres del mensaje
  $('#mensaje').on('input', function () {
    $('#char-counter').text(`${$(this).val().trim().length}/${MIN_MESSAGE}`);
  });

  // Si se llega desde el detalle de una noticia, se preselecciona el asunto
  if (UI.getParam('asunto') === 'noticia') {
    $('#asunto').val('noticia');
    const ref = UI.getParam('ref');
    if (ref) $('#mensaje').attr('placeholder', `Cuéntanos tu comentario sobre la noticia #${ref}...`);
  }

  $form.on('submit', (event) => {
    event.preventDefault(); // evita que el navegador recargue la página

    // Valida todos los campos; map() + toArray() para no detenerse en el primer error
    const results = $form.find('.form-control').map(function () {
      $(this).data('touched', true);
      return validateField($(this));
    }).toArray();

    if (results.includes(false)) {
      $form.find('.has-error .form-control').first().trigger('focus');
      UI.toast('Revisa los campos marcados en rojo');
      return;
    }

    // Construye un objeto con los datos del formulario
    const data = {};
    $form.serializeArray().forEach(({ name, value }) => { data[name] = $.trim(value); });
    data.fecha = new Date().toISOString();
    Store.saveMessage(data);

    // Confirmación: slideDown() muestra el mensaje con animación
    $('#success-name').text(data.nombre.split(' ')[0]);
    $success.stop(true, true).slideDown(300);
    $form[0].reset();
    $form.find('.form-group').removeClass('is-valid has-error');
    $form.find('.form-control').data('touched', false).removeAttr('aria-invalid');
    $form.find('.form-hint').each(function () {
      if ($(this).data('hint') !== undefined) $(this).text($(this).data('hint'));
    });
    $('#char-counter').text(`0/${MIN_MESSAGE}`);
    $('html, body').animate({ scrollTop: $success.offset().top - 100 }, 300);

    setTimeout(() => $success.slideUp(300), 8000);
  });
});
