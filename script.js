/* ==========================================================================
   NEXUS PLAY — Interactions
   ========================================================================== */

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;

  /* ---------------------------------------------------------------------
     1. Navigation : fond renforcé au défilement
     --------------------------------------------------------------------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     2. Apparition au défilement
     --------------------------------------------------------------------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------------------------------------------------------------------
     3. Liquid glass : le reflet et la bordure suivent le curseur
     --------------------------------------------------------------------- */
  document.addEventListener(
    "pointermove",
    (e) => {
      const glass = e.target.closest?.(".glass");
      if (glass) {
        const r = glass.getBoundingClientRect();
        glass.style.setProperty("--mx", `${e.clientX - r.left}px`);
        glass.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    },
    { passive: true }
  );

  /* ---------------------------------------------------------------------
     4. Parallaxe des blobs d'arrière-plan
     --------------------------------------------------------------------- */
  document.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      root.style.setProperty("--px", x.toFixed(3));
      root.style.setProperty("--py", y.toFixed(3));
    },
    { passive: true }
  );

  /* ---------------------------------------------------------------------
     5. Viseur personnalisé
     --------------------------------------------------------------------- */
  const crosshair = $("#crosshair");
  const inner = $(".ch-inner", crosshair);
  const panel = $("#chPanel");
  const toggleBtn = $("#chToggle");
  const STORAGE_KEY = "nexus-play-crosshair";

  const PRESETS = {
    classic: {
      size: 10, gap: 5, thick: 2, dot: 2, circle: 0, opacity: 95,
      color: "#00f0ff", showLines: true, showDot: true, showCircle: false, outline: true, glow: true,
    },
    dot: {
      size: 0, gap: 0, thick: 2, dot: 4, circle: 0, opacity: 100,
      color: "#ffffff", showLines: false, showDot: true, showCircle: false, outline: true, glow: false,
    },
    circle: {
      size: 6, gap: 0, thick: 2, dot: 2, circle: 14, opacity: 95,
      color: "#b488ff", showLines: false, showDot: true, showCircle: true, outline: true, glow: true,
    },
    tactical: {
      size: 14, gap: 8, thick: 1, dot: 0, circle: 0, opacity: 100,
      color: "#7cffb2", showLines: true, showDot: true, showCircle: false, outline: false, glow: true,
    },
  };

  const loadSettings = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* stockage indisponible : les réglages restent valables pour la session */
    }
  };

  let settings = { ...PRESETS.classic, ...(loadSettings() || {}) };

  const applyCrosshair = () => {
    crosshair.style.setProperty("--size", settings.size);
    crosshair.style.setProperty("--gap", settings.gap);
    crosshair.style.setProperty("--thick", settings.thick);
    crosshair.style.setProperty("--dot", settings.dot);
    crosshair.style.setProperty("--circle", settings.circle);
    crosshair.style.setProperty("--ch-color", settings.color);
    crosshair.style.opacity = settings.opacity / 100;
    crosshair.classList.toggle("show-lines", !!settings.showLines);
    crosshair.classList.toggle("show-dot", !!settings.showDot);
    crosshair.classList.toggle("show-circle", !!settings.showCircle);
    crosshair.classList.toggle("outline", !!settings.outline);
    crosshair.classList.toggle("glow", !!settings.glow);
  };

  const syncPanel = () => {
    $$("[data-key]", panel).forEach((input) => {
      const key = input.dataset.key;
      if (input.type === "checkbox") {
        input.checked = !!settings[key];
      } else {
        input.value = settings[key];
      }
      const output = input.parentElement.querySelector("output");
      if (output) output.textContent = settings[key];
    });
  };

  const updateFromInput = (input) => {
    const key = input.dataset.key;
    if (input.type === "checkbox") settings[key] = input.checked;
    else if (input.type === "color") settings[key] = input.value;
    else settings[key] = Number(input.value);

    const output = input.parentElement.querySelector("output");
    if (output) output.textContent = settings[key];

    applyCrosshair();
    saveSettings();
  };

  $$("[data-key]", panel).forEach((input) => {
    input.addEventListener("input", () => updateFromInput(input));
    input.addEventListener("change", () => updateFromInput(input));
  });

  $$("[data-preset]", panel).forEach((btn) => {
    btn.addEventListener("click", () => {
      settings = { ...PRESETS[btn.dataset.preset] };
      applyCrosshair();
      syncPanel();
      saveSettings();
    });
  });

  $("#chReset").addEventListener("click", () => {
    settings = { ...PRESETS.classic };
    applyCrosshair();
    syncPanel();
    saveSettings();
  });

  const setPanelOpen = (open) => {
    panel.hidden = !open;
    toggleBtn.setAttribute("aria-expanded", String(open));
  };

  toggleBtn.addEventListener("click", () => setPanelOpen(panel.hidden));
  $("#chClose").addEventListener("click", () => setPanelOpen(false));

  // Activer le viseur uniquement sur ordinateur avec souris précise
  const canUseCrosshair = window.matchMedia("(pointer: fine)").matches;
  if (canUseCrosshair) {
    root.classList.add("has-crosshair");
    applyCrosshair();
    syncPanel();
  } else {
    crosshair.remove();
    toggleBtn.remove();
    panel.remove();
  }

  let mx = -100;
  let my = -100;
  let frame = 0;

  const drawCrosshair = () => {
    frame = 0;
    crosshair.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  };

  if (canUseCrosshair) {
    document.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        mx = e.clientX;
        my = e.clientY;
        crosshair.classList.remove("away");
        if (!frame) frame = requestAnimationFrame(drawCrosshair);
      },
      { passive: true }
    );

    // Masquer le viseur quand la souris quitte la fenêtre
    document.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget) crosshair.classList.add("away");
    });

    // Effet de survol sur les éléments interactifs
    document.addEventListener("pointerover", (e) => {
      const target = e.target.closest?.("a, button, input, label, select, textarea, [data-hover]");
      crosshair.classList.toggle("hover", !!target);
    });

    // Petit "tir" au clic
    document.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      inner.classList.add("fire");
    });
    document.addEventListener("pointerup", () => inner.classList.remove("fire"));
  }
})();
