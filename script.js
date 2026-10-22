/* Анкета Альбуса — только выбор темы, без библиотек и обращений к серверу. */
(() => {
  'use strict';

  // 01. Приоритет: ?theme=light/dark, затем сохранённый выбор, затем тема окружения.
  // ?theme=auto сбрасывает ручной выбор и возвращает синхронизацию.
  const root = document.documentElement;
  const storageKey = 'albus-sheet-theme';
  const query = new URLSearchParams(location.search).get('theme');
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  const isTheme = value => value === 'light' || value === 'dark';
  let manual = null;

  try {
    if (query === 'auto') localStorage.removeItem(storageKey);
    const stored = localStorage.getItem(storageKey);
    if (isTheme(stored)) manual = stored;
  } catch {
    // В iframe браузер может запретить хранилище. Кнопка продолжит работать.
  }
  if (isTheme(query)) manual = query;

  // 02. В iframe prefers-color-scheme может наследовать color-scheme форума,
  // даже если анкета загружена с другого домена. Иначе это настройка браузера.
  const preferredTheme = () => preference.matches ? 'dark' : 'light';
  function applyTheme(theme) {
    root.dataset.theme = theme;
    const button = document.querySelector('[data-action="theme"]');
    if (!button) return;
    const next = theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
    button.setAttribute('aria-label', next);
    button.title = next;
  }
  applyTheme(manual || preferredTheme());

  // 03. Смена темы форума/браузера учитывается, пока пользователь не выбрал свою.
  preference.addEventListener('change', () => {
    if (!manual) applyTheme(preferredTheme());
  });

  // 04. Кнопка доступна с клавиатуры; ручной выбор сохраняется по возможности.
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('[data-action="theme"]');
    if (!button) return;
    applyTheme(root.dataset.theme);
    button.addEventListener('click', () => {
      manual = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(manual);
      try { localStorage.setItem(storageKey, manual); } catch { /* iframe без хранилища */ }
    });
  }, {once: true});
})();
