/* ═══════════════════════════════════════════════════════════════
   ExpoAtlántico 2026 · Interacciones
   Nav liquid glass · reveals · contadores · mapa-ruta · contacto
   Todo con APIs nativas (IntersectionObserver, rAF). Sin librerías.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Configuración editable ──────────────────────────────────
     CONTACT_EMAIL : reemplazar por el correo oficial del proyecto.
     REGISTRO_URL  : pegar el enlace del Google Form de registro
                     (mientras esté vacío, el botón dirá "muy pronto").
     SITE_URL      : URL pública de la página cuando se publique
                     (se añade al mensaje de WhatsApp).              */
  var CONTACT_EMAIL = "expoatlantico2026@gmail.com";
  var REGISTRO_URL = "";
  var SITE_URL = "";

  document.querySelectorAll("[data-email]").forEach(function (el) {
    el.textContent = CONTACT_EMAIL;
    el.href = "mailto:" + CONTACT_EMAIL;
  });

  /* ══════════ DATOS REALES DE LOS MUNICIPIOS (verificados) ══════════ */
  var MUNICIPIOS = {
    "puerto-colombia": {
      orden: 1,
      nombre: "Puerto Colombia",
      dato: "Su muelle de 1888 fue en su época uno de los más largos del mundo y la puerta de entrada de la inmigración a Colombia. Hoy es símbolo de la memoria portuaria y de las playas del Atlántico.",
      chips: ["Muelle histórico", "Gastronomía de mar", "Playas de Pradomar y Salgar"],
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Atardecer_en_el_Muelle_de_Puerto_Colombia.JPG/1280px-Atardecer_en_el_Muelle_de_Puerto_Colombia.JPG",
      alt: "Atardecer sobre el muelle histórico de Puerto Colombia"
    },
    "tubara": {
      orden: 2,
      nombre: "Tubará",
      dato: "Corazón del pueblo Mokaná, celebra el Festival de la Yuca y el Totumo en la Plaza de las Madres, y regala miradores con vista al mar Caribe.",
      chips: ["Herencia Mokaná", "Festival de la Yuca y el Totumo", "Miradores al mar"],
      img: "https://upload.wikimedia.org/wikipedia/commons/7/75/MiradorTubar%C3%A1.jpg",
      alt: "Mirador de Tubará con vista hacia el mar Caribe"
    },
    "juan-de-acosta": {
      orden: 3,
      nombre: "Juan de Acosta",
      dato: "Cuna del Festival Folclórico y Reinado Intermunicipal del Millo (más de 40 versiones): la flauta de millo, alma sonora del Carnaval, es su símbolo. Sus playas de Santa Verónica completan la parada.",
      chips: ["Flauta de millo", "Festival del Millo", "Playas de Santa Verónica"],
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Baile_de_la_Cumbia_-_Barranquilla.jpg/1920px-Baile_de_la_Cumbia_-_Barranquilla.jpg",
      alt: "Baile de cumbia, ritmo que acompaña la flauta de millo"
    },
    "piojo": {
      orden: 4,
      nombre: "Piojó",
      dato: "El punto más alto del Atlántico: el Cerro La Vieja (~520 msnm) domina un bosque seco tropical ideal para el senderismo y el avistamiento de aves — aquí se celebra el Global Big Day.",
      chips: ["Cerro La Vieja · 520 msnm", "Avistamiento de aves", "Bosque seco tropical"],
      img: "https://upload.wikimedia.org/wikipedia/commons/d/dc/PlayaTubaraAtlantico.jpg",
      alt: "Paisaje costero del Atlántico cercano a la serranía de Piojó"
    },
    "usiacuri": {
      orden: 5,
      nombre: "Usiacurí",
      dato: "Capital artesanal del Atlántico: sus tejedoras convierten la palma de iraca en piezas únicas reconocidas en todo el país. También guarda la Casa Museo del poeta Julio Flórez y calles llenas de murales.",
      chips: ["Tejido en palma de iraca", "Casa Museo Julio Flórez", "Murales"],
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Musa_Tejedora.jpg/1280px-Musa_Tejedora.jpg",
      alt: "Musa Tejedora, homenaje al tejido en palma de iraca de Usiacurí"
    },
    "baranoa": {
      orden: 6,
      nombre: "Baranoa",
      dato: "Tierra de la Loa de los Reyes Magos, tradición teatral centenaria declarada patrimonio, y del Carnaval del Recuerdo, que con más de 35 versiones rescata la memoria festiva del departamento.",
      chips: ["Loa de los Reyes Magos", "Carnaval del Recuerdo", "Memoria festiva"],
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Plaza_de_Baranoa.jpg/1280px-Plaza_de_Baranoa.jpg",
      alt: "Plaza principal de Baranoa con su iglesia de Santa Ana"
    },
    "galapa": {
      orden: 7,
      nombre: "Galapa",
      dato: "Sus talladores convierten la madera de ceiba roja en las máscaras — toritos, marimondas — que dan rostro al Carnaval. Recibe cada año la Gran Parada Departamental del Folclor.",
      chips: ["Máscaras de ceiba roja", "Talla en madera", "Gran Parada del Folclor"],
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Mascarasgalapa.jpg/1280px-Mascarasgalapa.jpg",
      alt: "Máscaras de carnaval talladas en madera, artesanía de Galapa"
    }
  };

  /* ── Mapa-ruta: selección de municipio ── */
  var nodos = document.querySelectorAll(".ruta-nodo");
  var card = document.getElementById("rutaCard");
  var cardImg = document.getElementById("rutaCardImg");
  var cardOrden = document.getElementById("rutaCardOrden");
  var cardTitulo = document.getElementById("rutaCardTitulo");
  var cardDato = document.getElementById("rutaCardDato");
  var cardChips = document.getElementById("rutaCardChips");

  function pintarMunicipio(id) {
    var m = MUNICIPIOS[id];
    if (!m || !card) return;
    card.classList.add("cambiando");
    setTimeout(function () {
      cardImg.src = m.img;
      cardImg.alt = m.alt;
      cardOrden.textContent = "Parada 0" + m.orden + " / 07 · Ruta de la Tradición";
      cardTitulo.textContent = m.nombre;
      cardDato.textContent = m.dato;
      cardChips.innerHTML = "";
      m.chips.forEach(function (c) {
        var li = document.createElement("li");
        li.textContent = c;
        cardChips.appendChild(li);
      });
      card.classList.remove("cambiando");
    }, reduced ? 0 : 180);

    nodos.forEach(function (n) {
      n.setAttribute("aria-pressed", n.dataset.muni === id ? "true" : "false");
    });
  }

  nodos.forEach(function (n) {
    n.addEventListener("click", function () {
      pintarMunicipio(n.dataset.muni);
      /* En pantallas angostas la tarjeta queda debajo del mapa:
         acercarla para que el cambio sea visible */
      if (window.matchMedia("(max-width: 999px)").matches) {
        card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
      }
    });
    /* Hover también selecciona (desktop) */
    n.addEventListener("mouseenter", function () {
      if (window.matchMedia("(hover: hover)").matches) pintarMunicipio(n.dataset.muni);
    });
  });

  pintarMunicipio("puerto-colombia"); // estado inicial

  /* Trazo de la ruta al entrar en viewport */
  var mapa = document.getElementById("rutaMapa");
  if (mapa && "IntersectionObserver" in window && !reduced) {
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { mapa.classList.add("dibujar"); obs.disconnect(); }
      });
    }, { threshold: 0.3 }).observe(mapa);
  }

  /* ══════════ NAV: menú móvil, estado activo, tinte ══════════ */
  var pill = document.getElementById("navPill");
  var toggle = document.getElementById("navToggle");
  var enlaces = document.querySelectorAll("[data-navlink]");

  toggle.addEventListener("click", function () {
    var abierto = pill.classList.toggle("nav-abierto");
    toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
    toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
  enlaces.forEach(function (a) {
    a.addEventListener("click", function () {
      pill.classList.remove("nav-abierto");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* Resaltar enlace activo según la sección visible */
  var secciones = ["inicio", "evento", "municipios", "programacion", "galeria", "contacto"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function marcarActivo(id) {
    enlaces.forEach(function (a) {
      a.classList.toggle("is-active",
        a.getAttribute("href") === "#" + id && a.closest(".nav-links"));
    });
  }

  if ("IntersectionObserver" in window) {
    var visor = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) marcarActivo(e.target.id);
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    secciones.forEach(function (s) { visor.observe(s); });
  }

  /* Tinte de la pill: oscura sobre el hero y secciones oscuras,
     clara sobre las secciones beige */
  var seccionesClaras = document.querySelectorAll(".section-evento, .section-programacion, .section-encontraras, .section-aliados");
  if ("IntersectionObserver" in window) {
    var visiblesClaras = new Set();
    var tinte = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visiblesClaras.add(e.target);
        else visiblesClaras.delete(e.target);
      });
      pill.classList.toggle("nav--claro", visiblesClaras.size > 0);
    }, { rootMargin: "-4% 0px -92% 0px" });
    seccionesClaras.forEach(function (s) { tinte.observe(s); });
  }

  /* ══════════ REVEALS ON SCROLL ══════════ */
  var reveals = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ══════════ CONTADORES ══════════ */
  var contadores = document.querySelectorAll("[data-count]");
  function animarContador(el) {
    var fin = parseInt(el.dataset.count, 10);
    if (reduced) { el.textContent = fin; return; }
    var t0 = null, dur = 1400;
    function paso(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      p = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      el.textContent = Math.round(fin * p);
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }
  if ("IntersectionObserver" in window) {
    var ioNum = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animarContador(e.target); ioNum.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    contadores.forEach(function (el) { ioNum.observe(el); });
  } else {
    contadores.forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* ══════════ CUENTA REGRESIVA ══════════ */
  var FECHA_EVENTO = new Date("2026-10-15T08:30:00-05:00"); // hora de Colombia
  var cuenta = document.getElementById("cuenta");
  if (cuenta) {
    var cDias = document.getElementById("cDias");
    var cHoras = document.getElementById("cHoras");
    var cMin = document.getElementById("cMin");
    var cSeg = document.getElementById("cSeg");
    var dosDig = function (n) { return n < 10 ? "0" + n : "" + n; };
    var intv = setInterval(tic, 1000);
    tic();

    function tic() {
      var diff = FECHA_EVENTO - Date.now();
      if (diff <= 0) {
        clearInterval(intv);
        cuenta.innerHTML = '<p class="cuenta-hoy">¡Hoy es el gran día! Nos vemos en la Plaza de la Paz.</p>';
        return;
      }
      var s = Math.floor(diff / 1000);
      cDias.textContent = Math.floor(s / 86400);
      cHoras.textContent = dosDig(Math.floor(s / 3600) % 24);
      cMin.textContent = dosDig(Math.floor(s / 60) % 60);
      cSeg.textContent = dosDig(s % 60);
    }
  }

  /* ══════════ AGREGAR AL CALENDARIO (.ics) ══════════ */
  var btnCal = document.getElementById("btnCalendario");
  if (btnCal) {
    btnCal.addEventListener("click", function () {
      /* 8:30 a.m. – 4:00 p.m. hora de Colombia (UTC-5) → en UTC */
      var ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ExpoAtlantico 2026//ES",
        "BEGIN:VEVENT",
        "UID:expoatlantico-2026-vitrina@expoatlantico",
        "DTSTAMP:20260712T120000Z",
        "DTSTART:20261015T133000Z",
        "DTEND:20261015T210000Z",
        "SUMMARY:ExpoAtlántico 2026 – Vitrina Cultural",
        "LOCATION:Plaza de la Paz\\, Barranquilla\\, Atlántico",
        "DESCRIPTION:Raíces inteligentes: conectando tradición\\, cultura e innovación para el futuro. Registro desde las 8:30 a.m. Entrada libre.",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
      var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ExpoAtlantico2026.ics";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
  }

  /* ══════════ REGISTRO DE ASISTENTES ══════════ */
  var btnReg = document.getElementById("btnRegistro");
  if (btnReg) {
    if (REGISTRO_URL) {
      btnReg.href = REGISTRO_URL;
      btnReg.target = "_blank";
      btnReg.rel = "noopener";
    } else {
      btnReg.textContent = "Registro · muy pronto";
      btnReg.setAttribute("aria-disabled", "true");
      btnReg.addEventListener("click", function (e) { e.preventDefault(); });
    }
  }

  /* ══════════ COMPARTIR POR WHATSAPP ══════════ */
  var wa = document.getElementById("waShare");
  if (wa) {
    var waTxt = "🎭 ExpoAtlántico 2026 – Vitrina Cultural\n" +
      "📅 15 de octubre de 2026 · desde las 8:30 a.m.\n" +
      "📍 Plaza de la Paz, Barranquilla\n" +
      "«Raíces inteligentes: conectando tradición, cultura e innovación para el futuro.»\n" +
      "¡Acompáñanos! Entrada libre." +
      (SITE_URL ? "\n" + SITE_URL : "");
    wa.href = "https://wa.me/?text=" + encodeURIComponent(waTxt);
  }

  /* ══════════ LIGHTBOX DE LA GALERÍA ══════════ */
  var fotos = Array.prototype.slice.call(document.querySelectorAll(".masonry-item"));
  var lb = document.getElementById("lightbox");
  if (lb && fotos.length) {
    var lbImg = document.getElementById("lbImg");
    var lbCaption = document.getElementById("lbCaption");
    var lbCerrar = document.getElementById("lbCerrar");
    var lbPrev = document.getElementById("lbPrev");
    var lbNext = document.getElementById("lbNext");
    var idx = 0;

    var abrir = function (i) {
      idx = (i + fotos.length) % fotos.length;
      var img = fotos[idx].querySelector("img");
      var cap = fotos[idx].querySelector("figcaption");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = cap ? cap.textContent : img.alt;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lbCerrar.focus();
    };
    var cerrar = function () {
      lb.hidden = true;
      document.body.style.overflow = "";
    };

    fotos.forEach(function (f, i) {
      f.tabIndex = 0;
      f.setAttribute("role", "button");
      var img = f.querySelector("img");
      f.setAttribute("aria-label", "Ampliar fotografía: " + (img ? img.alt : ""));
      f.addEventListener("click", function () { abrir(i); });
      f.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(i); }
      });
    });

    lbCerrar.addEventListener("click", cerrar);
    lbPrev.addEventListener("click", function () { abrir(idx - 1); });
    lbNext.addEventListener("click", function () { abrir(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) cerrar(); });

    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") abrir(idx - 1);
      if (e.key === "ArrowRight") abrir(idx + 1);
    });

    /* Deslizar en táctil para cambiar de foto */
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (dx > 45) abrir(idx - 1);
      else if (dx < -45) abrir(idx + 1);
      x0 = null;
    }, { passive: true });
  }
})();
