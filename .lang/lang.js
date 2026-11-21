(() => {
  const key = 'veryvisa-reading-language';
  const root = document.documentElement;
  const valid = new Set(['zh', 'en', 'both']);
  const set = (lang) => {
    if (!valid.has(lang)) return;
    root.dataset.lang = lang;
    document.querySelectorAll('[data-set-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setLang === lang));
    });
    try { localStorage.setItem(key, lang); } catch {}
  };
  try { set(localStorage.getItem(key) || root.dataset.lang || 'zh'); } catch { set(root.dataset.lang || 'zh'); }
  document.querySelectorAll('[data-set-lang]').forEach((button) => button.addEventListener('click', () => set(button.dataset.setLang)));
})();
