/* Responsive interaction layer: mobile calendar handoff and accessibility. */
(() => {
  const compact = window.matchMedia("(max-width: 760px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function applyViewportMode() {
    document.documentElement.classList.toggle("is-compact", compact.matches);
    document.querySelectorAll(".nav-link").forEach((link) => {
      const target = link.getAttribute("href");
      const current = target && target === window.location.hash;
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  compact.addEventListener?.("change", applyViewportMode);
  window.addEventListener("hashchange", applyViewportMode, { passive: true });
  applyViewportMode();

  document.addEventListener("click", (event) => {
    const navLink = event.target.closest(".nav-link");
    if (navLink) {
      window.setTimeout(applyViewportMode, 0);
    }

    if (!compact.matches) return;
    const dayButton = event.target.closest("#calendar-grid [data-open-date], #month-pulse [data-open-date]");
    if (!dayButton) return;

    window.setTimeout(() => {
      const panel = document.querySelector(".day-panel");
      panel?.scrollIntoView({
        behavior: reduced.matches ? "auto" : "smooth",
        block: "start",
      });
      panel?.querySelector("[data-focus-quick-add]")?.focus({ preventScroll: true });
    }, 80);
  });
})();
