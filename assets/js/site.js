(() => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // ── Header scroll shadow ───────────────────────────────────────
  const header = document.querySelector('.header');
  if (header) {
    const syncScrolled = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', syncScrolled, { passive: true });
    // Run once on load so a refreshed-scrolled-page gets the class immediately.
    syncScrolled();
  }

  // ── Smooth anchor scrolling ────────────────────────────────────
  if (!prefersReducedMotion) {
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const anchor = target.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const el = document.getElementById(href.slice(1));
      if (!el) return;
      event.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', href);
    });
  }

  // ── Apps nav dropdown ──────────────────────────────────────────
  const dropdown = document.querySelector('.nav-dropdown');
  const toggle   = dropdown?.querySelector('.nav-dropdown-toggle');
  const menu     = dropdown?.querySelector('.nav-dropdown-menu');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // ── Hero screenshot parallax ───────────────────────────────────
  // Each image gets a unique depth multiplier so they move at different speeds,
  // creating a subtle layered depth effect as the user scrolls past the hero.
  if (!prefersReducedMotion) {
    const screens = document.querySelectorAll('.hero-screens img');
    if (screens.length) {
      const depths = [0.05, 0.09, 0.04, 0.07, 0.06];
      let ticking = false;

      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          screens.forEach((img, i) => {
            const depth = depths[i] ?? 0.05;
            const offset = scrollY * depth;
            // CSS transforms reference --py via var(--py, 0px); inline style wins cascade.
            img.style.setProperty('--py', `${offset}px`);
          });
          ticking = false;
        });
      }, { passive: true });
    }
  }
})();
