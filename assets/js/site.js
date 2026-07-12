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
  // Guarded block, not an early-return — payments/index.html has no nav
  // dropdown, and previously that `return` silently killed every feature
  // below it on that page (hero parallax, reveal animations, etc).
  const dropdown = document.querySelector('.nav-dropdown');
  const toggle   = dropdown?.querySelector('.nav-dropdown-toggle');
  const menu     = dropdown?.querySelector('.nav-dropdown-menu');
  if (toggle && menu) {
    const openMenu = () => {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

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
  }

  // ── Hero device parallax ─────────────────────────────────────────
  // Single hero device drifts subtly on scroll — same depth mechanism as
  // the old multi-screenshot strip, just one element instead of five.
  if (!prefersReducedMotion) {
    const heroDevice = document.querySelector('.hero-device img');
    if (heroDevice) {
      const depth = 0.06;
      let ticking = false;

      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const offset = window.scrollY * depth;
          heroDevice.style.setProperty('--py', `${offset}px`);
          ticking = false;
        });
      }, { passive: true });
    }
  }

  // ── Hero app rotator ─────────────────────────────────────────────
  // Cross-fades through the portfolio every 6s — device image, float card
  // content, and glow tint all switch together. The initial HTML (phpusd)
  // is the first frame and the only thing shown if JS fails to load, so
  // this is a progressive enhancement, not a hard dependency.
  (() => {
    const HERO_APPS = [
      {
        slug: 'phpusd', href: 'phpusd/', img: 'assets/hero/phpusd-hero.jpg',
        glow: '79, 70, 229', // matches the site's own indigo — phpusd's screenshot bg already reads green
        icon: '🔔', title: 'Rate Alert', detail: 'Notify when 1 USD hits ₱65',
      },
      {
        slug: 'stead', href: 'stead/', img: 'assets/hero/stead-hero.jpg',
        glow: '245, 166, 35',
        icon: '🏠', title: 'Spring Checklist', detail: 'AC tune-up, gutters & more due',
      },
      {
        slug: 'headache', href: 'headache/', img: 'assets/hero/headache-hero.jpg',
        glow: '144, 64, 208',
        icon: '🌦️', title: 'Weather & Pressure', detail: 'Low pressure days hit hardest',
      },
      {
        slug: 'qrgen', href: 'qrgen/', img: 'assets/hero/qrgen-hero.jpg',
        glow: '45, 212, 191',
        icon: '🎨', title: 'Custom Styles', detail: 'Midnight, Sunset, Neon & more',
      },
      {
        slug: 'soniceject', href: 'soniceject/', img: 'assets/hero/soniceject-hero.jpg',
        glow: '13, 79, 140',
        icon: '💧', title: 'Cleaning Speaker', detail: '168 Hz · 27s left',
      },
    ];

    const heroVisual = document.querySelector('.hero-visual');
    const deviceImg   = document.querySelector('.hero-device img');
    const floatCard   = document.querySelector('.hero-float-card');
    const floatIcon   = floatCard?.querySelector('.hero-float-icon');
    const floatTitle  = floatCard?.querySelector('strong');
    // NOT `floatCard.querySelector('span')` — .hero-float-icon is itself a
    // <span> that comes first in document order, so that selector matched
    // the icon instead of the detail line and silently overwrote it with
    // app.detail on every rotation (confirmed via live screenshots: icon
    // disappeared, detail text froze on whatever loaded first). The detail
    // line is the only direct-child <span> of .hero-float-card itself.
    const floatDetail = floatCard?.querySelector(':scope > span');
    if (!heroVisual || !deviceImg || !floatCard || HERO_APPS.length < 2) return;

    // Preload the rest so cross-fades never show a blank/loading image.
    HERO_APPS.slice(1).forEach((app) => { new Image().src = app.img; });

    let index = 0;
    let paused = false;
    let timer = null;

    function applyFrame(app, animate) {
      const swap = () => {
        deviceImg.src = app.img;
        deviceImg.alt = '';
        if (floatIcon)   floatIcon.textContent = app.icon;
        if (floatTitle)  floatTitle.textContent = app.title;
        if (floatDetail) floatDetail.textContent = app.detail;
        heroVisual.style.setProperty('--hero-glow', app.glow);
        heroVisual.dataset.app = app.slug;
      };
      if (!animate || prefersReducedMotion) { swap(); return; }
      heroVisual.classList.add('is-swapping');
      window.setTimeout(() => {
        swap();
        heroVisual.classList.remove('is-swapping');
      }, 260);
    }

    function goTo(newIndex) {
      index = (newIndex + HERO_APPS.length) % HERO_APPS.length;
      applyFrame(HERO_APPS[index], true);
    }

    function advance() { goTo(index + 1); }
    function retreat() { goTo(index - 1); }

    function start() {
      // Reduced-motion users still get the rotation (it's real portfolio
      // content, not decorative) — applyFrame() already skips the cross-fade
      // dip for them via its own prefersReducedMotion check, so this only
      // gates against double-starting the interval, not motion preference.
      if (timer) return;
      timer = window.setInterval(() => { if (!paused) advance(); }, 6000);
    }

    // Restarts the interval on its own 6s cadence from *now* — used after a
    // manual arrow click so the auto-rotation doesn't immediately fire again
    // a moment later and undo what the user just chose to look at.
    function restart() {
      if (timer) window.clearInterval(timer);
      timer = null;
      start();
    }

    start();

    // Pause on hover/focus — a user actually looking at it shouldn't have
    // the image change underneath their cursor.
    heroVisual.addEventListener('mouseenter', () => { paused = true; });
    heroVisual.addEventListener('mouseleave', () => { paused = false; });
    heroVisual.addEventListener('focusin',    () => { paused = true; });
    heroVisual.addEventListener('focusout',   () => { paused = false; });

    // Tab in background: stop advancing entirely rather than pause, so a
    // user returning after a long time away doesn't see it "catch up"
    // through several apps at once — setInterval keeps firing in most
    // browsers even on a backgrounded tab, just throttled.
    document.addEventListener('visibilitychange', () => {
      paused = document.hidden;
    });

    // Manual prev/next arrows.
    const prevBtn = document.querySelector('.hero-nav-prev');
    const nextBtn = document.querySelector('.hero-nav-next');
    prevBtn?.addEventListener('click', () => { retreat(); restart(); });
    nextBtn?.addEventListener('click', () => { advance(); restart(); });
  })();

  // ── Reveal animations ────────────────────────────────────────────
  // Hero content gets `.reveal-eager` (CSS animation, staggered by
  // --reveal-delay, fires immediately on load — the hero is always in
  // view, so waiting on IntersectionObserver would be pointless). Every
  // other repeating element below the fold gets `.reveal` and animates
  // in the first time it scrolls into view, then is left alone — this is
  // what makes a normal scrolling page feel alive without any per-page
  // hand-authored animation.
  (() => {
    const heroEagerSelectors = [
      '.hero .kicker', '.hero .h1', '.hero .subhead', '.hero .actions',
      '.hero-device',
    ];
    heroEagerSelectors.forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.classList.add('reveal-eager');
      el.style.setProperty('--reveal-delay', `${i * 90}ms`);
    });

    if (prefersReducedMotion) return;

    const revealSelectors = [
      '.stats-strip-item', '.app-card', '.card',
      '.section-kicker', '.section-h2', '.section-title',
    ];
    const revealEls = document.querySelectorAll(revealSelectors.join(','));
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      // No IO support — just show everything, don't leave content invisible.
      revealEls.forEach((el) => el.classList.add('reveal', 'is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.classList.add('reveal');
      // Small stagger within a group of siblings (e.g. adjacent app-cards)
      // reads as a considered wave rather than everything popping in at once.
      el.style.setProperty('--reveal-delay', `${(i % 4) * 80}ms`);
      io.observe(el);
    });
  })();
})();
