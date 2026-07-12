/* ═══════════════════════════════════════════════════════════════
   ExpoAtlántico 2026 · Hero
   1) Video boomerang real: se captura una ventana de frames del video
      en canvas offscreen y se reproduce en ping-pong (adelante/atrás).
   2) Parallax sutil del fondo siguiendo el mouse (lerp, máx ~20px).
   3) Fade-in escalonado de entrada.

   Decisión técnica: en móvil / pantallas táctiles el video se
   reproduce en MODO LIGERO (bucle de los primeros segundos, sin
   captura de frames) — capturar ~110 frames a canvas consume una
   RAM que en un teléfono no se justifica, y el parallax por mouse
   no existe en táctil. La imagen estática con Ken Burns queda como
   fallback si el navegador no reproduce WebM, si el autoplay está
   bloqueado (ahorro de batería) o si el usuario pide reduced-motion.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* Video CC BY 3.0 — "Traditional Dancing in Colombia (Cumbia)"
     Wikimedia Commons · autor: MrPiettu · derivado 480p VP9 */
  var VIDEO_URL =
    "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cb/" +
    "Traditional_Dancing_in_Cartagena%2C_Colombia_--_Cumbia.webm/" +
    "Traditional_Dancing_in_Cartagena%2C_Colombia_--_Cumbia.webm.480p.vp9.webm";

  var CAPTURE_SECONDS = 5.5;  // ventana del boomerang
  var CAPTURE_FPS     = 22;   // frames por segundo capturados
  var PLAY_FPS        = 30;   // velocidad de reproducción ping-pong
  var MAX_W           = 720;  // ancho máx. del frame capturado (rendimiento)

  var media    = document.getElementById("heroMedia");
  var video    = document.getElementById("heroVideo");
  var canvas   = document.getElementById("heroCanvas");
  var reduced  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var esTactil = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var esMovil  = window.matchMedia("(max-width: 768px)").matches;

  /* Fade-in de entrada (se activa siempre, con o sin video) */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("hero-listo");
    });
  });

  var soportaWebm = !!video.canPlayType &&
    video.canPlayType('video/webm; codecs="vp9"') !== "";

  if (reduced || !soportaWebm) {
    media.classList.add(reduced ? "estatico" : "kenburns");
    video.remove();
    canvas.remove();
    iniciarParallax(); // con reduced-motion no hará nada
    return;
  }

  /* ── Móvil / táctil: video en bucle ligero (sin boomerang) ── */
  if (esTactil || esMovil) {
    canvas.remove();
    var LOOP_FIN = 12; // segundos del bucle: no descarga el video completo

    var fallbackMovil = function () {
      media.classList.add("kenburns");
      video.classList.remove("is-on");
      video.remove();
    };

    video.src = VIDEO_URL;
    video.preload = "auto";
    video.addEventListener("timeupdate", function () {
      if (video.currentTime >= LOOP_FIN) video.currentTime = 0.05;
    });
    video.addEventListener("ended", function () { // por si dura menos que el bucle
      video.currentTime = 0.05;
      video.play().catch(fallbackMovil);
    });
    video.addEventListener("playing", function () {
      video.classList.add("is-on");
    }, { once: true });
    video.addEventListener("error", fallbackMovil);
    video.play().catch(fallbackMovil); // autoplay bloqueado → foto Ken Burns
    return;
  }

  /* ── 1. Captura de frames ─────────────────────────────────── */
  var frames = [];
  var capturando = false;

  video.src = VIDEO_URL;
  video.muted = true;
  video.preload = "auto";

  video.addEventListener("loadedmetadata", function () {
    var vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return;
    var w = Math.min(MAX_W, vw);
    var h = Math.round(w * vh / vw);
    capturando = true;

    var ultimo = -1;
    var paso = 1 / CAPTURE_FPS;

    function capturar(mediaTime) {
      if (!capturando) return;
      if (mediaTime - ultimo >= paso) {
        ultimo = mediaTime;
        var c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(video, 0, 0, w, h);
        frames.push(c);
      }
      if (mediaTime >= CAPTURE_SECONDS || frames.length >= CAPTURE_SECONDS * CAPTURE_FPS + 4) {
        terminarCaptura();
        return;
      }
      pedirFrame(capturar);
    }

    /* requestVideoFrameCallback con fallback a requestAnimationFrame */
    function pedirFrame(fn) {
      if (video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(function (_now, meta) { fn(meta.mediaTime); });
      } else {
        requestAnimationFrame(function () { fn(video.currentTime); });
      }
    }

    video.play().then(function () {
      video.classList.add("is-on"); // mientras captura, se ve el video normal
      pedirFrame(capturar);
    }).catch(function () {
      usarFallback(); // autoplay bloqueado → imagen estática
    });

    video.addEventListener("ended", terminarCaptura, { once: true });
  });

  video.addEventListener("error", usarFallback);

  function usarFallback() {
    capturando = false;
    media.classList.add("kenburns");
    video.classList.remove("is-on");
    iniciarParallax();
  }

  /* ── 2. Reproducción ping-pong ────────────────────────────── */
  function terminarCaptura() {
    if (!capturando) return;
    capturando = false;
    video.pause();

    if (frames.length < 12) { usarFallback(); return; }

    canvas.width = frames[0].width;
    canvas.height = frames[0].height;
    var ctx = canvas.getContext("2d");

    var i = 0, dir = 1;
    var intervalo = 1000 / PLAY_FPS;
    var previo = 0;

    function pintar(t) {
      if (t - previo >= intervalo) {
        previo = t;
        ctx.drawImage(frames[i], 0, 0);
        i += dir;
        if (i >= frames.length - 1 || i <= 0) dir = -dir; // invierte en cada extremo
      }
      requestAnimationFrame(pintar);
    }

    ctx.drawImage(frames[0], 0, 0);
    canvas.classList.add("is-on");
    video.classList.remove("is-on");
    setTimeout(function () { video.removeAttribute("src"); video.load(); }, 700);
    requestAnimationFrame(pintar);
  }

  iniciarParallax();

  /* ── 3. Parallax con lerp (máx ~20px) ─────────────────────── */
  function iniciarParallax() {
    if (reduced || esTactil) return;
    var objX = 0, objY = 0, curX = 0, curY = 0;
    var activo = false;

    document.addEventListener("mousemove", function (e) {
      var nx = e.clientX / window.innerWidth - 0.5;   // -0.5 … 0.5
      var ny = e.clientY / window.innerHeight - 0.5;
      objX = nx * 40; // ±20px
      objY = ny * 32; // ±16px
      if (!activo) { activo = true; requestAnimationFrame(mover); }
    });

    function mover() {
      curX += (objX - curX) * 0.06; // suavizado lerp
      curY += (objY - curY) * 0.06;
      media.style.transform = "translate3d(" + curX.toFixed(2) + "px," + curY.toFixed(2) + "px,0) scale(1.04)";
      if (Math.abs(objX - curX) + Math.abs(objY - curY) > 0.05) {
        requestAnimationFrame(mover);
      } else {
        activo = false;
      }
    }
  }
})();
