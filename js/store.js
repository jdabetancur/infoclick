/* ==========================================================================
   store.js — Capa de persistencia en el navegador
   --------------------------------------------------------------------------
   Centraliza todo el acceso a localStorage y sessionStorage para que el resto
   del código no manipule las claves directamente. Así, si mañana cambiamos
   la forma de guardar los datos, solo se modifica este archivo.

   - localStorage   → persiste aunque se cierre el navegador (favoritos).
   - sessionStorage → dura solo mientras la pestaña esté abierta
                      (mensajes enviados desde el formulario de contacto).
   ========================================================================== */

// Espacio de nombres global de la aplicación (evita contaminar window con muchas variables)
window.InfoClick = window.InfoClick || {};

InfoClick.Store = (() => {
  // Claves usadas en el almacenamiento; el prefijo evita choques con otros sitios en localhost
  const KEYS = {
    favorites: 'infoclick.favoritos',
    messages: 'infoclick.mensajesContacto'
  };

  /**
   * Lee un valor JSON del almacenamiento indicado.
   * Si no existe o está corrupto, retorna el valor por defecto.
   */
  const read = (storage, key, fallback) => {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn('No se pudo leer', key, error);
      return fallback;
    }
  };

  /** Guarda cualquier valor serializándolo como texto JSON. */
  const write = (storage, key, value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('No se pudo guardar', key, error);
    }
  };

  /* ---------- Favoritos (arreglo de ids numéricos) ---------- */
  const getFavorites = () => read(localStorage, KEYS.favorites, []);

  const isFavorite = (id) => getFavorites().includes(Number(id));

  /** Agrega o quita una noticia de favoritos. Retorna true si quedó como favorita. */
  const toggleFavorite = (id) => {
    id = Number(id);
    let favorites = getFavorites();
    const exists = favorites.includes(id);
    favorites = exists ? favorites.filter((favId) => favId !== id) : [...favorites, id];
    write(localStorage, KEYS.favorites, favorites);
    return !exists;
  };

  const removeFavorite = (id) => {
    write(localStorage, KEYS.favorites, getFavorites().filter((favId) => favId !== Number(id)));
  };


  /* ---------- Mensajes de contacto (sessionStorage) ---------- */
  const getMessages = () => read(sessionStorage, KEYS.messages, []);

  const saveMessage = (message) => {
    write(sessionStorage, KEYS.messages, [...getMessages(), message]);
  };

  // API pública del módulo
  return {
    getFavorites, isFavorite, toggleFavorite, removeFavorite,
    getMessages, saveMessage
  };
})();
