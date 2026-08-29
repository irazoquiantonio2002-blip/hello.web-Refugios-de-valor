(() => {
  const whatsappNumber = "5213329246963";
  const whatsappUrl = (message) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const loader = qs("#loader");
  const navbar = qs("#navbar");
  const hamburger = qs("#hamburger");
  const mobileMenu = qs("#mob-menu");
  const hero = qs("#hero");

  const setYear = () => {
    const year = qs("#year");
    if (year) year.textContent = new Date().getFullYear();
  };

  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add("is-hidden");
    hero?.classList.add("hero-ready");
    window.setTimeout(() => loader.remove(), 520);
  };

  const handleNav = () => {
    if (!navbar) return;
    navbar.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  const closeMenu = () => {
    hamburger?.classList.remove("is-active");
    hamburger?.setAttribute("aria-expanded", "false");
    mobileMenu?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  const initMenu = () => {
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      hamburger.classList.toggle("is-active", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });

    qsa("a", mobileMenu).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  };

  const initMarquee = () => {
    const marquee = qs("#marquee");
    if (!marquee) return;

    const items = [
      "Los Robles Hill",
      "Sendero del Bosque",
      "A 40 minutos de Guadalajara",
      "Financiamiento hasta 100 meses sin intereses",
      "Lotes desde 1,000 m² · $599/m²",
      "Cabañas desde $650,000",
      "Grupo Tapalpa",
      "Invierte hoy, construye el mañana"
    ];

    const content = [...items, ...items, ...items, ...items]
      .map((item) => `<span>${item}</span><span aria-hidden="true">◆</span>`)
      .join("");

    marquee.innerHTML = content;
  };

  const initReveals = () => {
    const revealEls = qsa(".reveal");
    if (!revealEls.length) return;

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    });

    revealEls.forEach((el) => observer.observe(el));
  };

  const initCounters = () => {
    const counters = qsa(".stat-num");
    if (!counters.length) return;

    const animate = (el) => {
      const target = Number(el.dataset.count || 0);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const startTime = performance.now();
      const duration = 1100;

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = `${prefix}${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.55 });

    counters.forEach((counter) => observer.observe(counter));
  };

  const initForm = () => {
    const form = qs("#wa-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = qs("#f-name", form);
      const interest = qs("#f-interest", form);
      const message = qs("#f-msg", form);
      const required = [name, message].filter(Boolean);
      let valid = true;

      required.forEach((field) => {
        const empty = !field.value.trim();
        field.classList.toggle("form-error", empty);
        if (empty) valid = false;
      });

      if (!valid) {
        required.find((field) => field.classList.contains("form-error"))?.focus();
        return;
      }

      const text = [
        `Hola, soy ${name.value.trim()}.`,
        interest?.value ? `Me interesa: ${interest.value}.` : "",
        `Mensaje: ${message.value.trim()}`
      ].filter(Boolean).join("\n");

      window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
      form.reset();
    });

    qsa(".form-control", form).forEach((control) => {
      control.addEventListener("input", () => control.classList.remove("form-error"));
    });
  };

  const initCarousel = () => {
    const carousel = qs(".carousel");
    if (!carousel) return;

    const track = qs("#carousel-track", carousel);
    const slides = qsa(".carousel-slide", track);
    const dotsWrap = qs("#carousel-dots", carousel);
    const prevBtn = qs(".carousel-btn.prev", carousel);
    const nextBtn = qs(".carousel-btn.next", carousel);
    if (!track || !slides.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Ir a la imagen ${index + 1}`);
      dot.addEventListener("click", () => goTo(index));
      dotsWrap?.appendChild(dot);
      return dot;
    });

    const count = slides.length;
    let index = 0;

    const slideStep = () => slides[0].getBoundingClientRect().width + 18;
    const maxScroll = () => track.scrollWidth - track.clientWidth;

    const setActiveDot = () => {
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    const goTo = (target) => {
      index = (target + count) % count;
      track.scrollTo({
        left: Math.min(index * slideStep(), maxScroll()),
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
      setActiveDot();
    };

    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));

    let ticking = false;
    track.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (track.scrollLeft >= maxScroll() - 2) {
          index = count - 1;
        } else {
          index = Math.min(Math.max(Math.round(track.scrollLeft / slideStep()), 0), count - 1);
        }
        setActiveDot();
        ticking = false;
      });
    }, { passive: true });

    setActiveDot();

    if (prefersReducedMotion) return;

    let timer = window.setInterval(() => goTo(index + 1), 5000);
    const stop = () => window.clearInterval(timer);
    const restart = () => {
      stop();
      timer = window.setInterval(() => goTo(index + 1), 5000);
    };

    ["pointerenter", "focusin"].forEach((evt) => carousel.addEventListener(evt, stop));
    ["pointerleave", "focusout"].forEach((evt) => carousel.addEventListener(evt, restart));
    track.addEventListener("pointerdown", stop);
  };

  const initHeroCanvas = () => {
    const canvas = qs("#hero-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colors = ["rgba(243,216,137,0.62)", "rgba(183,213,100,0.46)", "rgba(247,241,223,0.32)"];
    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.round(Math.min(70, Math.max(28, width / 20)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.7 + 0.5,
        vx: Math.random() * 0.18 + 0.04,
        vy: Math.random() * -0.14 - 0.02,
        alpha: Math.random() * 0.55 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;

        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      if (!prefersReducedMotion) frame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    render();

    if (prefersReducedMotion && frame) cancelAnimationFrame(frame);
  };

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    handleNav();
    initMenu();
    initMarquee();
    initReveals();
    initCounters();
    initForm();
    initCarousel();
    initHeroCanvas();
    window.addEventListener("scroll", handleNav, { passive: true });
  });

  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, 260);
  });
})();
