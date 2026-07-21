(() => {
  const calendar = document.querySelector('.calendar-panel');
  if (!calendar) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting));
  }, { threshold: .12 });
  document.querySelectorAll('.content-advice-panel,.advice-block').forEach((el) => observer.observe(el));

  document.addEventListener('click', (event) => {
    const day = event.target.closest('#calendar-grid [data-open-date]');
    if (!day) return;
    day.animate([
      { transform: 'scale(.97)' },
      { transform: 'scale(1.025)' },
      { transform: 'scale(1)' }
    ], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  });
})();
