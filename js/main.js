/* ═══════════════════════════════════════════════════════════════
   ExpoAtlántico 2026 · Interacciones
   Nav liquid glass · reveals · contadores · mapa-ruta · contacto
   Todo con APIs nativas (IntersectionObserver, rAF). Sin librerías.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Correo de contacto ──────────────────────────────────────
     Reemplazar por el correo oficial del proyecto cuando exista. */
  var CONTACT_EMAIL = "expoatlantico2026@gmail.com";
  var emailLink = document.getElementById("contactoEmail");
  if (emailLink) {
    emailLink.textContent = CONTACT_EMAIL;
    emailLink.href = "mailto:" + CONTACT_EMAIL;
  }

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
})();
