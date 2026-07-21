(() => {
  document.documentElement.classList.add('auth-pending');
  window.__BRN_AUTH_READY__ = false;
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
