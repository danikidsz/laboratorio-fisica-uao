/* Laboratorio virtual UAO: recorrido por scroll → 360 → mesas */
(function () {
  const RED = "#FF051E", INK = "#1A1A1A", WINE = "#8A1428", CREMA = "#FBF5EC";
  const C = window.LAB_CONFIG, cfg = C.recorrido || {}, $ = s => document.querySelector(s);
  const EMBED = /[?&]embed=1/.test(location.search), POS = /[?&]pos=1/.test(location.search);
  document.body.classList.toggle("embed", EMBED);
  let done = new Set(); try { done = new Set(JSON.parse(localStorage.getItem("uao-lab-mesas") || "[]")); } catch (e) {}
  const avisar = tipo => { try { parent !== window && parent.postMessage({ fuente: "uao-laboratorio", tipo, mesas: [...done] }, "*"); } catch (e) {} };

  /* ---------- ilustraciones provisionales ---------- */
  const INST = {
    fotopuerta: `<svg viewBox="0 0 120 90"><rect x="44" y="64" width="32" height="20" rx="3" fill="#8C8C8C"/><path d="M30 14h60v14H76v38H44V28H30z" fill="${INK}"/><rect x="34" y="16" width="10" height="10" rx="2" fill="${RED}"/><rect x="76" y="16" width="10" height="10" rx="2" fill="${RED}"/><path d="M44 21h32" stroke="${RED}" stroke-width="2" stroke-dasharray="3 3"/></svg>`,
    movimiento: `<svg viewBox="0 0 120 90"><rect x="22" y="22" width="76" height="48" rx="10" fill="${INK}"/><circle cx="60" cy="46" r="17" fill="#ddd"/><circle cx="60" cy="46" r="10" fill="#bbb"/><rect x="34" y="70" width="52" height="8" rx="3" fill="#777"/><path d="M96 34q10 12 0 24M104 28q16 18 0 36" stroke="${RED}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    polea: `<svg viewBox="0 0 120 90"><rect x="20" y="58" width="38" height="16" rx="3" fill="#8C8C8C"/><path d="M40 58V40" stroke="${INK}" stroke-width="8"/><circle cx="66" cy="34" r="22" fill="${INK}"/><circle cx="66" cy="34" r="15" fill="${RED}"/><circle cx="66" cy="34" r="4" fill="#fff"/><path d="M88 34V84" stroke="#666" stroke-width="2"/><rect x="82" y="76" width="12" height="10" fill="#666"/></svg>`,
    tablero: `<svg viewBox="0 0 120 90"><path d="M18 76L34 14h70L88 76z" fill="${CREMA}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M36 30q30-14 46 40" stroke="${RED}" stroke-width="3" fill="none" stroke-dasharray="1 7" stroke-linecap="round"/><circle cx="36" cy="30" r="7" fill="#9a9a9a" stroke="${INK}" stroke-width="2"/></svg>`
  };
  function escena(id, key, img, puesto) {
    const table = `<rect x="70" y="300" width="460" height="22" rx="6" fill="${INK}"/><rect x="100" y="322" width="16" height="110" fill="#333"/><rect x="484" y="322" width="16" height="110" fill="#333"/>`;
    const setup = { m1: `<rect x="292" y="90" width="12" height="210" fill="#777"/><rect x="250" y="286" width="96" height="14" rx="3" fill="#555"/><circle cx="298" cy="104" r="12" fill="#9a9a9a" stroke="${INK}" stroke-width="3"/>`,
      m2: `<rect x="110" y="268" width="380" height="16" rx="4" fill="#9a9a9a"/><rect x="110" y="284" width="380" height="8" fill="#666"/><path d="M240 268l20-26h52l20 26z" fill="${RED}"/>`,
      m3: `<path d="M150 296L190 120h220l40 176z" fill="${CREMA}" stroke="${INK}" stroke-width="4" stroke-linejoin="round" opacity=".7"/>` }[id];
    const pos = { m1: "translate(238,150)", m2: "translate(410,190) scale(.9)", m3: "translate(240,150) scale(1.1)" }[id];
    const pieza = img ? `<image href="${img}" width="120" height="90"/>` : INST[key].replace("<svg", '<svg width="120" height="90"');
    const placed = puesto ? `<g transform="${pos}"><g class="pop">${pieza}</g></g>` : `<g transform="${pos}"><rect width="120" height="90" rx="14" fill="none" stroke="${RED}" stroke-width="3" stroke-dasharray="8 8"/><text x="60" y="56" text-anchor="middle" font-family="DM Sans" font-weight="800" font-size="32" fill="${RED}">?</text></g>`;
    return `<svg viewBox="0 0 600 440" preserveAspectRatio="xMidYMid meet">${table}${setup}${placed}</svg>`;
  }

  /* ---------- recorrido ---------- */
  if (cfg.alto) $("#recorrido").style.height = cfg.alto + "vh";
  if (location.protocol === "file:") {
    document.body.insertAdjacentHTML("beforeend", `<div class="aviso-file"><b>Abre esta página desde un servidor</b><p>Si la abres con doble clic (file://), el navegador bloquea la imagen 360 por seguridad.<br>Súbela a Vercel o, en la Terminal dentro de esta carpeta, ejecuta <code>python3 -m http.server 8000</code> y abre <code>http://localhost:8000</code>.</p></div>`);
  }
  const cv = $("#cv"), ctx = cv.getContext("2d"), prog = $(".prog i"), hint = $(".hint"), chip = $("#chip");
  let W = 0, H = 0, dpr = 1, target = 0, cur = 0, enPano = false, viewer = null, posEl = null;
  let frames = null, video = null;
  if (cfg.frames && cfg.frames.count) {
    frames = []; const w = (cfg.frames.path.match(/#+/) || ["####"])[0].length, n = cfg.frames.count;
    for (let i = 1; i <= n; i++) { const im = new Image(); im.decoding = "async"; im.dataset.src = cfg.frames.path.replace(/#+/, String(i).padStart(w, "0")); frames.push(im); }
    // carga progresiva: primero cuadros espaciados (se puede recorrer de inmediato) y luego se rellena
    const orden = [], visto = new Set();
    [32, 16, 8, 4, 2, 1].forEach(st => { for (let i = 0; i < n; i += st) if (!visto.has(i)) { visto.add(i); orden.push(i); } });
    if (!visto.has(n - 1)) orden.splice(1, 0, n - 1);
    let k = 0, activos = 0; window.__cargados = 0;
    const sig = () => { while (activos < 6 && k < orden.length) { const im = frames[orden[k++]]; activos++; im.onload = im.onerror = () => { activos--; window.__cargados++; sig(); }; im.src = im.dataset.src; } };
    sig();
  } else if (cfg.video) {
    video = document.createElement("video"); Object.assign(video, { src: cfg.video, muted: true, playsInline: true, preload: "auto" });
    video.className = "rec-video"; $(".sticky").insertBefore(video, cv); cv.style.display = "none";
  }
  function resize() { dpr = Math.min(2.5, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; }
  addEventListener("resize", resize); resize();
  addEventListener("scroll", () => { target = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); }, { passive: true });

  function drawFrame(p) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingQuality = "high";
    if (frames) {
      let i = Math.round(p * (frames.length - 1));
      for (let k = 0; k < frames.length; k++) { const a = frames[i - k], b = frames[i + k]; if (a && a.complete && a.naturalWidth) { i -= k; break; } if (b && b.complete && b.naturalWidth) { i += k; break; } }
      const im = frames[i]; if (!im || !im.naturalWidth) return;
      const s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); return;
    }
    if (video) { if (video.duration) { const t = p * (video.duration - .05); if (Math.abs(video.currentTime - t) > .01) video.currentTime = t; } return; }
    pasillo(p);
  }
    /* Recorrido ilustrado provisional */
    function pasillo(p) {
      const L = 22, camZ = p * (L - 1.2), cx = W / 2, cy = H * .47, f = H * .95, hw = 1.7, fl = -1.6, ce = 1.5;
      const pr = (x, y, z) => { const d = Math.max(.25, z - camZ); return [cx + x * f / d, cy - y * f / d]; };
      const poly = (pts, fill) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); };
      ctx.fillStyle = "#f3f1ee"; ctx.fillRect(0, 0, W, H);
      const zn = camZ + .25, zf = L;
      poly([pr(-hw, fl, zn), pr(hw, fl, zn), pr(hw, fl, zf), pr(-hw, fl, zf)], "#e2d8cb");
      poly([pr(-hw, ce, zn), pr(hw, ce, zn), pr(hw, ce, zf), pr(-hw, ce, zf)], "#e9e9ec");
      poly([pr(-hw, fl, zn), pr(-hw, ce, zn), pr(-hw, ce, zf), pr(-hw, fl, zf)], "#fbfaf8");
      poly([pr(hw, fl, zn), pr(hw, ce, zn), pr(hw, ce, zf), pr(hw, fl, zf)], "#f6f4f1");
      // zócalo rojo
      [-hw, hw].forEach(x => poly([pr(x, fl, zn), pr(x, fl + .12, zn), pr(x, fl + .12, zf), pr(x, fl, zf)], RED));
      ctx.strokeStyle = "rgba(0,0,0,.06)"; ctx.lineWidth = 1;
      for (let z = Math.ceil(camZ); z < L; z += 1) { const a = pr(-hw, fl, z), b = pr(hw, fl, z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      for (let z = 2; z < L - 1; z += 3) if (z > camZ + .3) { // luces
        poly([pr(-.5, ce - .01, z), pr(.5, ce - .01, z), pr(.5, ce - .01, z + 1.2), pr(-.5, ce - .01, z + 1.2)], "#fff");
      }
      for (let z = 3; z < L - 2; z += 4.5) if (z + 1.1 > camZ + .3) { // puertas laterales y afiches
        const side = (Math.round(z) % 2) ? -hw : hw;
        poly([pr(side, fl, z), pr(side, .6, z), pr(side, .6, z + 1.1), pr(side, fl, z + 1.1)], "#d6d0c7");
        poly([pr(-side, -.2, z + .3), pr(-side, .7, z + .3), pr(-side, .7, z + 1.2), pr(-side, -.2, z + 1.2)], "rgba(225,38,45,.85)");
      }
      // puerta del laboratorio al fondo
      const open = Math.max(0, Math.min(1, (p - .72) / .2)), dw = 1.25;
      poly([pr(-hw, fl, L), pr(hw, fl, L), pr(hw, ce, L), pr(-hw, ce, L)], "#f8f8f8");
      poly([pr(-dw - .12, fl, L), pr(dw + .12, fl, L), pr(dw + .12, .75, L), pr(-dw - .12, .75, L)], RED);
      poly([pr(-dw, fl, L), pr(dw, fl, L), pr(dw, .62, L), pr(-dw, .62, L)], "#fff");
      // interior (mesas)
      ctx.save(); const ip = pr(0, -.3, L); ctx.globalAlpha = open;
      for (let i = -1; i <= 1; i++) { const a = pr(i * .8 - .3, -.75, L + 3), b = pr(i * .8 + .3, -.6, L + 3); ctx.fillStyle = INK; ctx.fillRect(a[0], b[1], b[0] - a[0], (a[1] - b[1]) * .5 + 2); }
      ctx.restore();
      const sl = open * dw;
      poly([pr(-dw, fl, L), pr(-sl, fl, L), pr(-sl, .62, L), pr(-dw, .62, L)].map((q, i) => q), "#2a2a2a");
      poly([pr(sl, fl, L), pr(dw, fl, L), pr(dw, .62, L), pr(sl, .62, L)], "#2a2a2a");
      if (open < 1) poly([pr(-sl - .0, fl, L), pr(-dw + (dw - sl), fl, L), pr(-dw + (dw - sl), .62, L), pr(-sl, .62, L)], "#2a2a2a");
      const t = pr(0, .9, L), s = f / (L - camZ);
      ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.font = `900 italic ${Math.max(8, .22 * s)}px "DM Sans",sans-serif`;
      ctx.fillText("LABORATORIO DE FÍSICA", t[0], t[1]);
      // títulos superpuestos
      const msg = p < .3 ? ["Universidad Autónoma de Occidente", "Bienvenido a la sede de laboratorios"] : p < .62 ? ["Laboratorio de Física", "Aquí se graban las prácticas que analizarás"] : p < .88 ? ["Tres mesas, tres experimentos", "Caída libre · Carril de aire · Tiro parabólico"] : null;
      if (msg) {
        const a = p < .3 ? Math.min(1, p / .06, (.3 - p) / .06) : p < .62 ? Math.min(1, (p - .3) / .06, (.62 - p) / .06) : Math.min(1, (p - .62) / .06, (.88 - p) / .06);
        ctx.globalAlpha = Math.max(0, a); ctx.textAlign = "left";
        ctx.font = `900 italic ${H * .055}px "DM Sans",sans-serif`; ctx.fillStyle = INK; ctx.fillText(msg[0].toUpperCase(), W * .06, H * .16);
        ctx.font = `600 ${H * .03}px "DM Sans",sans-serif`; ctx.fillStyle = "#555"; ctx.fillText(msg[1], W * .06, H * .16 + H * .055);
        ctx.globalAlpha = 1;
      }
      if (p > .92) { ctx.fillStyle = `rgba(255,255,255,${(p - .92) / .08})`; ctx.fillRect(0, 0, W, H); }
    }


  function loop() {
    cur += (target - cur) * .14; if (Math.abs(target - cur) < .0005) cur = target;
    if (!enPano) {
      drawFrame(cur); prog.style.height = (cur * 100) + "%"; hint.style.opacity = cur > .04 ? 0 : 1;
      chip.textContent = frames && window.__cargados < frames.length ? `Cargando recorrido · ${Math.round(window.__cargados / frames.length * 100)}%` : "Recorrido · " + Math.round(cur * 100) + "%";
      if (target > .985 && cur > .97) entrarPano();
    }
    if (posEl && viewer) posEl.textContent = `yaw ${viewer.getYaw().toFixed(0)} · pitch ${viewer.getPitch().toFixed(0)}`;
    requestAnimationFrame(loop);
  }

  /* ---------- 360 ---------- */
  const hs = {};
  function entrarPano() {
    enPano = true; document.body.classList.add("en-pano");
    if (!viewer) crearVisor();
    estado();
  }
  /* Acepta 360 completas (2:1) y panorámicas de celular (franja ancha): calcula el ángulo vertical solo */
  function crearVisor() {
    const im = new Image();
    im.onload = () => {
      const r = im.naturalWidth / im.naturalHeight, parcial = r > 2.05, vaov = parcial ? 360 / r : 180;
      const hfovMax = parcial ? Math.min(100, vaov * innerWidth / innerHeight * .98) : 120;
      viewer = pannellum.viewer("viewer", Object.assign({
        type: "equirectangular", panorama: C.lab360.imagen, autoLoad: true, yaw: C.lab360.yawInicial || 0, hfov: Math.min(hfovMax, 100), autoRotate: -2,
        minHfov: 30, maxHfov: hfovMax,
        showZoomCtrl: false, showFullscreenCtrl: !EMBED, compass: false, keyboardZoom: false,
        hotSpots: C.lab360.mesas.map(m => ({ pitch: m.pitch, yaw: m.yaw, cssClass: "hs-mesa", createTooltipFunc: hsDiv, createTooltipArgs: m.id }))
      }, parcial ? { haov: 360, vaov, vOffset: 0, avoidShowingBackground: true, minPitch: -vaov / 2, maxPitch: vaov / 2 } : { maxPitch: C.lab360.techoMax || 90 }));
      if (POS) { window.__viewer = viewer; posEl = document.createElement("div"); posEl.className = "pos-read"; document.body.appendChild(posEl); }
    };
    im.src = C.lab360.imagen;
  }
  function hsDiv(div, id) {
    const M = MESAS[id], b = document.createElement("button");
    b.className = "hs-btn" + (done.has(id) ? " done" : ""); b.innerHTML = `<span class="tag">${M.nombre.split(" ")[1]}</span>${M.exp}`;
    const abrir = e => { e.stopPropagation(); e.preventDefault(); abrirMesa(id); };
    b.addEventListener("click", abrir); b.addEventListener("touchend", abrir);
    div.appendChild(b); hs[id] = b;
  }
  $("#saltar").onclick = () => { scrollTo(0, document.documentElement.scrollHeight); target = cur = 1; entrarPano(); };
  $("#volverRec").onclick = () => { enPano = false; document.body.classList.remove("en-pano"); scrollTo(0, 0); target = cur = 0; };

  /* ---------- mesas ---------- */
  const mesa = $("#mesa");
  function abrirMesa(id) {
    if (MESAS[id].tipo === "montaje" || MESAS[id].tipo === "carril") return abrirMontaje(id);
    if (MESAS[id].tipo === "parabolico") return abrirParabolico(id);
    const M = MESAS[id], ok = done.has(id), o = M.opciones[M.c];
    if (viewer) viewer.stopAutoRotate();
    mesa.innerHTML = `<div class="mesa-box"><div class="mesa-stage">${escena(id, o[1], o[2], ok)}</div>
      <div class="mesa-side"><span class="kicker">${M.nombre} · Verifica los equipos</span><h2>${M.exp}</h2><p>${M.desc}</p>
      <p class="pq">¿Cuál de estos instrumentos se usó en este experimento?</p>
      <div class="inst-grid">${M.opciones.map((x, j) => `<button class="inst${ok && j === M.c ? " ok" : ""}" data-j="${j}" ${ok ? "disabled" : ""}>${x[2] ? `<img src="${x[2]}" alt="">` : INST[x[1]]}<span>${x[0]}</span></button>`).join("")}</div>
      <div class="fbx">${ok ? `<div class="fb ok"><b>¡Correcto!</b>${M.bien}</div>` : ""}</div>
      <button class="btn ${ok ? "btn-red" : "btn-ghost"}" data-back>Volver al laboratorio 360°</button></div></div>`;
    mesa.classList.add("on");
    mesa.querySelector("[data-back]").onclick = () => { mesa.classList.remove("on"); estado(); };
    mesa.querySelectorAll(".inst").forEach(b => b.onclick = () => {
      const j = +b.dataset.j, fb = mesa.querySelector(".fbx");
      if (j === M.c) {
        done.add(id); try { localStorage.setItem("uao-lab-mesas", JSON.stringify([...done])); } catch (e) {}
        b.classList.add("ok"); mesa.querySelectorAll(".inst").forEach(x => x.disabled = true);
        mesa.querySelector(".mesa-stage").innerHTML = escena(id, o[1], o[2], true);
        fb.innerHTML = `<div class="fb ok"><b>¡Correcto!</b>${M.bien}</div>`;
        mesa.querySelector("[data-back]").className = "btn btn-red";
        if (hs[id]) hs[id].classList.add("done");
        avisar("mesa");
      } else {
        b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad");
        fb.innerHTML = `<div class="fb bad"><b>Ese no fue.</b>Observa el montaje de la mesa y vuelve a intentarlo.</div>`;
      }
    });
  }
  /* ---------- Montaje paso a paso (caída libre) ---------- */
  const ICO = {
    laptop: '<path d="M6 10h36v22H6z"/><path d="M2 36h44l-3 4H5z"/>',
    interfaz: '<rect x="4" y="12" width="40" height="24" rx="3"/><circle cx="13" cy="24" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="35" cy="24" r="3"/><path d="M8 32h32"/>',
    fotopuerta: '<path d="M10 40V10h6v22h16V10h6v30"/><path d="M16 16h16" stroke-dasharray="3 3"/><path d="M24 40v6"/>',
    lamina: '<rect x="16" y="2" width="16" height="44" rx="2"/><path d="M16 10h16M16 18h16M16 26h16M16 34h16"/>',
    movimiento: '<rect x="8" y="14" width="32" height="22" rx="4"/><circle cx="24" cy="25" r="7"/><path d="M18 8q6-5 12 0M14 4q10-8 20 0"/>',
    pelotas: '<circle cx="16" cy="28" r="10"/><circle cx="34" cy="16" r="8"/><path d="M8 24q8 4 16 0M28 13q6 3 12 0"/>',
    piso: '<path d="M4 40h40"/><rect x="16" y="30" width="16" height="10" rx="2"/><path d="M24 26V6M18 12l6-6 6 6"/>',
    balanza: '<path d="M8 30h32l-3 12H11z"/><rect x="12" y="24" width="24" height="6" rx="2"/><path d="M18 36h12"/>',
    varilla: '<path d="M24 4v36"/><path d="M14 40h20"/><path d="M18 30h12v6H18z"/>',
    polea: '<circle cx="22" cy="18" r="11"/><circle cx="22" cy="18" r="3"/><path d="M33 18v24"/><path d="M22 29v13M16 42h12"/>',
    planeador: '<path d="M4 34h40"/><path d="M8 34l8-14h16l8 14"/><path d="M4 40h40" stroke-dasharray="2 4"/>'
  };
  const ICO_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const ico = k => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${ICO[k] || ""}</svg>`;

  function abrirMontaje(id) {
    const M = MESAS[id];
    if (viewer) viewer.stopAutoRotate();
    mesa.classList.add("on", "grande");
    const unica = M.versiones.length === 1;
    unica ? montar(M.versiones[0]) : elegirVersion();

    function marco(html) { mesa.innerHTML = `<div class="mesa-box mt-box">${html}</div>`; mesa.querySelectorAll("[data-back]").forEach(x => x.onclick = cerrar); }
    function cerrar() { mesa.querySelectorAll("video").forEach(v => v.pause()); mesa.classList.remove("on", "grande"); estado(); }

    function elegirVersion() {
      marco(`<div class="mt-full"><div class="mt-head"><div><span class="kicker">${M.nombre} · ${M.exp}</span><h2>¿Qué versión del experimento quieres armar?</h2><p>${M.desc}</p></div><button class="btn btn-ghost" data-back>Volver al 360°</button></div>
        <div class="mt-versiones">${M.versiones.map((v, i) => `<button class="mt-ver" data-i="${i}"><span class="mt-ver-img" style="background-image:url('${v.portada}')"></span><span class="mt-ver-txt"><b>${v.titulo}</b><small>${v.resumen}</small><span class="btn btn-red">Armar este montaje</span></span></button>`).join("")}</div></div>`);
      mesa.querySelectorAll(".mt-ver").forEach(b => b.onclick = () => montar(M.versiones[+b.dataset.i]));
    }

    function montar(v) {
      let k = 0;
      const vacia = v.vacia || M.vacia || "assets/caida/mesa_vacia.jpg";
      marco(`<div class="mt-foto"><div class="mt-bg" style="background-image:url('${vacia}')"></div><img src="${vacia}" class="on" alt="Mesa del laboratorio">${v.pasos.map(p => `<img src="${p.img}" alt="">`).join("")}
          <div class="mt-dots">${v.pasos.map((p, i) => `<i data-i="${i}"></i>`).join("")}</div></div>
        <div class="mt-side"><span class="kicker">${unica ? M.nombre + " · " + M.exp : M.exp + " · " + v.titulo}</span><h2>Arma el montaje</h2><p class="mt-ins">Selecciona el objeto para agregarlo a la mesa.</p>
          <div class="mt-obj"></div><div class="mt-fb"></div><div class="mt-acc"></div>
          <div class="mt-pie">${unica ? "" : `<button class="btn btn-ghost btn-sm" data-cambiar>Cambiar de versión</button>`}<button class="btn btn-ghost btn-sm" data-back>Volver al 360°</button></div></div>`);
      if (!unica) mesa.querySelector("[data-cambiar]").onclick = elegirVersion;
      const imgs = [...mesa.querySelectorAll(".mt-foto img")], dots = [...mesa.querySelectorAll(".mt-dots i")];
      const objEl = mesa.querySelector(".mt-obj"), fb = mesa.querySelector(".mt-fb"), acc = mesa.querySelector(".mt-acc");
      function mostrar() {
        dots.forEach((d, i) => d.className = i < k ? "ok" : i === k ? "cur" : "");
        fb.innerHTML = ""; acc.innerHTML = "";
        const p = v.pasos[k];
        objEl.innerHTML = `<span class="mt-n">Objeto ${k + 1} de ${v.pasos.length}</span><button class="mt-card"><span class="mt-ico">${ico(p.ico)}</span><b>${p.obj}</b><small>Toca para agregarlo</small></button>`;
        objEl.querySelector(".mt-card").onclick = agregar;
      }
      function agregar() {
        const p = v.pasos[k];
        imgs.forEach((im, i) => im.classList.toggle("on", i === k + 1));
        mesa.querySelector(".mt-bg").style.backgroundImage = `url('${p.img}')`;
        objEl.querySelector(".mt-card").classList.add("puesto"); objEl.querySelector("small").textContent = "Agregado al montaje";
        fb.innerHTML = `<div class="fb ok"><b>${p.obj}</b>${p.para}</div>`;
        dots[k].className = "ok";
        k++;
        if (k < v.pasos.length) { acc.innerHTML = `<button class="btn btn-red">Siguiente objeto</button>`; acc.firstChild.onclick = mostrar; }
        else if (M.carril) { acc.innerHTML = `<p class="mt-listo">¡Montaje completo!</p><button class="btn btn-red">${ICO_PLAY} Iniciar la prueba</button>`; acc.querySelector("button").onclick = () => pruebaCarril(M.carril); }
        else if (v.video) { acc.innerHTML = `<p class="mt-listo">¡Montaje completo!</p><button class="btn btn-red">${ICO_PLAY} Ver la prueba</button>`; acc.querySelector("button").onclick = prueba; }
        else { acc.innerHTML = `<p class="mt-listo">¡Montaje completo!</p><button class="btn btn-red">Responder la pregunta</button>`; acc.querySelector("button").onclick = () => pregunta(v); }
      }
      /* video de la prueba, en el mismo recuadro de la foto */
      function prueba() {
        const foto = mesa.querySelector(".mt-foto");
        imgs.forEach(im => im.classList.remove("on")); mesa.querySelector(".mt-dots").style.display = "none";
        if (v.poster) foto.querySelector(".mt-bg").style.backgroundImage = `url('${v.poster}')`;
        foto.insertAdjacentHTML("beforeend", `<video class="mt-video" src="${v.video}" ${v.poster ? `poster="${v.poster}"` : ""} controls muted playsinline autoplay></video>`);
        const vid = foto.querySelector("video"); vid.play().catch(() => {});
        mesa.querySelector(".mt-side h2").textContent = "Prueba del montaje";
        mesa.querySelector(".mt-ins").textContent = v.videoTxt || "Observa la prueba del montaje.";
        objEl.innerHTML = ""; fb.innerHTML = "";
        acc.innerHTML = `<button class="btn btn-red">Responder la pregunta</button>`;
        acc.querySelector("button").onclick = () => { vid.pause(); pregunta(v); };
      }
      mostrar();
    }

    /* ---------- Carril de aire: imagen fija con 3 posiciones → alistar (pausa) → switch ON → movimiento ---------- */
    function pruebaCarril(K) {
      const hechos = new Set();
      marco(`<div class="mt-foto ca-foto"><div class="mt-bg" style="background-image:url('${K.fija}')"></div>
          <div class="ca-lienzo"><img src="${K.fija}" class="on ca-fija" alt="Carril de aire listo para la prueba">
            <video class="ca-video" muted playsinline preload="auto"></video>
            <div class="ca-capa"></div></div></div>
        <div class="mt-side"><span class="kicker">${M.nombre} · ${M.exp}</span><h2>Prueba en el carril</h2><p class="mt-ins"></p>
          <div class="ca-lista"></div><div class="mt-fb"></div><div class="mt-acc"></div>
          <div class="mt-pie"><button class="btn btn-ghost btn-sm" data-back>Volver al 360°</button></div></div>`);
      const lienzo = mesa.querySelector(".ca-lienzo"), fija = mesa.querySelector(".ca-fija"), vid = mesa.querySelector(".ca-video"), capa = mesa.querySelector(".ca-capa");
      const ins = mesa.querySelector(".mt-ins"), lista = mesa.querySelector(".ca-lista"), fb = mesa.querySelector(".mt-fb"), acc = mesa.querySelector(".mt-acc");
      // el lienzo toma la proporción de la foto para que los botones queden siempre sobre el mismo punto
      const ajustar = () => { const r = (fija.naturalWidth / fija.naturalHeight) || 16 / 9, box = lienzo.parentElement, W = box.clientWidth, H = box.clientHeight;
        const w = Math.min(W, H * r), h = w / r; Object.assign(lienzo.style, { width: w + "px", height: h + "px" }); };
      fija.onload = ajustar; ajustar(); addEventListener("resize", ajustar);

      // reproduce un tramo [ini, fin] del video y llama a listo() al terminar (pausado en el último cuadro)
      function tramo(src, ini, fin, listo) {
        vid.onended = vid.ontimeupdate = vid.onloadedmetadata = vid.onerror = null;
        let hecho = false; const fin_ = () => { if (hecho) return; hecho = true; vid.pause(); listo(); };
        vid.src = src; vid.classList.add("on");
        vid.onloadedmetadata = () => { if (ini) vid.currentTime = ini; vid.play().catch(() => {}); };
        vid.ontimeupdate = () => { if (fin && vid.currentTime >= fin) fin_(); };
        vid.onended = fin_; vid.onerror = fin_;
      }

      function inicio() {
        vid.pause(); vid.classList.remove("on"); fija.classList.add("on");
        ins.textContent = hechos.size ? "Elige otra posición de salida para el planeador." : K.instruccion;
        lista.innerHTML = K.posiciones.map((P, i) => `<button class="ca-item${hechos.has(i) ? " ok" : ""}" data-i="${i}"><span>${i + 1}</span>${P.nombre}${hechos.has(i) ? " · vista" : ""}</button>`).join("");
        lista.querySelectorAll(".ca-item").forEach(b => b.onclick = () => alistar(+b.dataset.i));
        capa.innerHTML = K.posiciones.map((P, i) => `<button class="ca-pos${hechos.has(i) ? " ok" : ""}" data-i="${i}" style="left:${P.x}%;top:${P.y}%"><b>${i + 1}</b></button>`).join("");
        capa.querySelectorAll(".ca-pos").forEach(b => b.onclick = () => alistar(+b.dataset.i));
        fb.innerHTML = ""; acc.innerHTML = "";
        if (hechos.size === K.posiciones.length) final();
      }
      function alistar(i) {
        const P = K.posiciones[i];
        capa.innerHTML = ""; fija.classList.remove("on");
        ins.textContent = K.txtAlistar;
        tramo(P.alistar.src, P.alistar.ini, P.alistar.fin, () => {
          ins.textContent = K.txtSwitch;
          const sx = P.sw ? P.sw.x : P.x, sy = P.sw ? P.sw.y : P.y;
          capa.innerHTML = `<button class="ca-switch" style="left:${sx}%;top:${sy}%" aria-label="Encender el carril de aire"><span class="ca-sw-t">Aire</span><span class="ca-sw"><i></i></span><span class="ca-sw-e">OFF</span></button>`;
          const sw = capa.querySelector(".ca-switch");
          sw.onclick = () => {
            sw.classList.add("on"); sw.querySelector(".ca-sw-e").textContent = "ON"; sw.disabled = true;
            setTimeout(() => { capa.innerHTML = ""; mover(i); }, 650);
          };
        });
      }
      function mover(i) {
        const P = K.posiciones[i];
        ins.textContent = K.txtMovimiento;
        tramo(P.mov.src, P.mov.ini, P.mov.fin, () => {
          hechos.add(i);
          ins.textContent = "";
          fb.innerHTML = `<div class="fb ok"><b>${P.nombre}</b>${P.obs || K.obs}</div>`;
          acc.innerHTML = `<button class="btn btn-red">${hechos.size < K.posiciones.length ? "Probar otra posición" : "Ver conclusión"}</button>`;
          acc.querySelector("button").onclick = inicio;
        });
      }
      function final() {
        capa.querySelectorAll(".ca-pos").forEach(b => b.disabled = false);
        ins.textContent = "Probaste las tres posiciones. Puedes repetir cualquiera.";
        fb.innerHTML = `<div class="fb ok"><b>¡Prueba completa!</b>${K.conclusion}</div>`;
        acc.innerHTML = `<button class="btn btn-red" data-back>Volver al laboratorio 360°</button>`;
        acc.querySelector("[data-back]").onclick = cerrar;
        marcar(id);
      }
      inicio();
    }

    function pregunta(v) {
      marco(`<div class="mt-full"><div class="mt-head"><div><span class="kicker">${M.exp} · Verifica los equipos</span><h2>${v.pregunta}</h2><p>Gira cada modelo con el mouse o el dedo para observarlo y elige el correcto.</p></div><button class="btn btn-ghost" data-back>Volver al 360°</button></div>
        <div class="mt-modelos">${M.modelos.map(m => `<div class="mt-mod" data-id="${m[0]}"><model-viewer src="${m[2]}" camera-controls auto-rotate rotation-per-second="20deg" interaction-prompt="none" shadow-intensity="1" exposure="1.05" camera-orbit="35deg 70deg auto" disable-zoom></model-viewer><b>${m[1]}</b><button class="btn btn-ghost btn-sm">Elegir</button></div>`).join("")}</div>
        <div class="mt-fb"></div></div>`);
      const fbq = mesa.querySelector(".mt-fb");
      mesa.querySelectorAll(".mt-mod button").forEach(b => b.onclick = () => {
        const c = b.closest(".mt-mod"), ok = c.dataset.id === v.correcta;
        if (ok) {
          c.classList.add("ok"); mesa.querySelectorAll(".mt-mod button").forEach(x => x.disabled = true);
          done.add(id); try { localStorage.setItem("uao-lab-mesas", JSON.stringify([...done])); } catch (e) {}
          if (hs[id]) hs[id].classList.add("done"); avisar("mesa");
          fbq.innerHTML = `<div class="fb ok"><b>¡Correcto!</b>${v.bien}</div><button class="btn btn-red" style="margin-top:12px">Volver al laboratorio 360°</button>`;
          fbq.querySelector("button").onclick = cerrar;
        } else {
          c.classList.remove("bad"); void c.offsetWidth; c.classList.add("bad");
          fbq.innerHTML = `<div class="fb bad"><b>Ese no es.</b>Recuerda qué objeto agregaste en el montaje y vuelve a intentarlo.</div>`;
        }
      });
    }
  }

  function marcar(id) {
    done.add(id); try { localStorage.setItem("uao-lab-mesas", JSON.stringify([...done])); } catch (e) {}
    if (hs[id]) hs[id].classList.add("done"); avisar("mesa");
  }

  /* ---------- Movimiento parabólico: predice y comprueba con video ---------- */
  // Ilustración: tablero con carril inclinado; una mano pone el balín alto (A) o bajo (B)
  function ilustraTablero(alto, letra) {
    const K = INK, SK = "#ECE6DD", B = "#FFFFFF", BAL = "#B9B9B9";
    // punto del carril donde se suelta el balín
    const [bx, by] = alto ? [66, 46] : [146, 106];
    const yLanz = 128;
    const ticks = Array.from({ length: 9 }, (_, i) => `<path d="M${206 + i * 17} 112v${i % 2 ? 5 : 9}" stroke="${K}" stroke-width="2"/>`).join("");
    const hoyos = Array.from({ length: 6 }, (_, i) => `<circle cx="${214 + i * 24}" cy="132" r="2.6" fill="${K}" opacity=".5"/><circle cx="${214 + i * 24}" cy="236" r="2.6" fill="${K}" opacity=".5"/>`).join("");
    return `<svg viewBox="0 0 420 320" aria-hidden="true">
      <rect x="0" y="282" width="420" height="38" fill="#EDE5D8"/><rect x="0" y="278" width="420" height="8" rx="2" fill="${K}"/>
      <!-- tablero -->
      <rect x="190" y="100" width="190" height="168" rx="8" fill="${B}" stroke="${K}" stroke-width="4"/>
      ${ticks}${hoyos}
      <rect x="350" y="114" width="14" height="148" rx="3" fill="#E8E1D6" stroke="${K}" stroke-width="3"/>
      <rect x="176" y="262" width="218" height="18" rx="5" fill="${K}"/>
      <!-- carril inclinado y lanzador -->
      <path d="M26 6 L150 112 Q164 ${yLanz} 186 ${yLanz} L214 ${yLanz}" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26 6 L150 112 Q164 ${yLanz} 186 ${yLanz} L214 ${yLanz}" fill="none" stroke="#6b6b6b" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"/>
      <rect x="196" y="${yLanz - 9}" width="26" height="18" rx="3" fill="${K}"/>
      <!-- altura de salida -->
      <path d="M${bx + 22} ${by} H232 M232 ${by} V${yLanz - 12}" stroke="${RED}" stroke-width="2.5" stroke-dasharray="5 5" fill="none"/>
      <path d="M226 ${yLanz - 20} l6 9 6-9" stroke="${RED}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="242" y="${(by + yLanz) / 2 + 6}" font-family="DM Sans" font-weight="900" font-style="italic" font-size="22" fill="${RED}">h</text>
      <!-- mano con bata -->
      <path d="M-20 ${by + 120} L${bx - 34} ${by + 40}" stroke="#E2D9CC" stroke-width="34" stroke-linecap="round"/>
      <path d="M-20 ${by + 120} L${bx - 34} ${by + 40}" stroke="${B}" stroke-width="30" stroke-linecap="round"/>
      <rect x="${bx - 52}" y="${by + 26}" width="30" height="9" rx="4.5" fill="${RED}" transform="rotate(-50 ${bx - 37} ${by + 30})"/>
      <path d="M${bx - 22} ${by + 8} Q${bx - 16} ${by - 14} ${bx - 4} ${by - 8}" stroke="${K}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M${bx - 8} ${by + 22} Q${bx + 8} ${by + 22} ${bx + 10} ${by + 8}" stroke="${K}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="${bx - 18}" cy="${by + 20}" r="15" fill="${SK}" stroke="${K}" stroke-width="2.5"/>
      <path d="M${bx - 22} ${by + 8} Q${bx - 16} ${by - 14} ${bx - 4} ${by - 8}" stroke="${SK}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M${bx - 8} ${by + 22} Q${bx + 8} ${by + 22} ${bx + 10} ${by + 8}" stroke="${SK}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <!-- balín -->
      <circle cx="${bx + 2}" cy="${by + 2}" r="10" fill="${BAL}" stroke="${K}" stroke-width="2.5"/><circle cx="${bx - 1}" cy="${by - 1}" r="3" fill="${B}"/>
      <!-- letra -->
      <g transform="translate(372 22)"><rect x="-22" y="-2" width="44" height="40" rx="10" fill="${RED}"/><text x="0" y="29" text-anchor="middle" font-family="DM Sans" font-weight="900" font-style="italic" font-size="28" fill="${CREMA}">${letra}</text></g>
    </svg>`;
  }

  function abrirParabolico(id) {
    const M = MESAS[id];
    if (viewer) viewer.stopAutoRotate();
    mesa.classList.add("on", "grande");
    let prediccion = null;
    const vistos = new Set();
    elegir();

    function marco(html) { mesa.innerHTML = `<div class="mesa-box mt-box">${html}</div>`; mesa.querySelectorAll("[data-back]").forEach(x => x.onclick = cerrar); }
    function cerrar() { mesa.querySelectorAll("video").forEach(v => v.pause()); mesa.classList.remove("on", "grande"); estado(); }

    function elegir() {
      marco(`<div class="mt-full"><div class="mt-head"><div><span class="kicker">${M.nombre} · ${M.exp}</span><h2>${M.pregunta}</h2><p>${M.desc} ${M.instruccion}</p></div><button class="btn btn-ghost" data-back>Volver al 360°</button></div>
        <div class="pb-casos">${M.casos.map((c, i) => `<button class="pb-caso" data-i="${i}"><span class="pb-ilu">${ilustraTablero(c.alto, c.letra)}<span class="pb-play">${ICO_PLAY}</span></span>
          <span class="pb-txt"><b>Caso ${c.letra} · ${c.titulo}</b><small>${vistos.has(c.id) ? "Ya lo viste · toca para verlo de nuevo" : "Toca para ver la prueba"}</small></span></button>`).join("")}</div></div>`);
      mesa.querySelectorAll(".pb-caso").forEach(b => b.onclick = () => ver(M.casos[+b.dataset.i]));
    }

    function ver(c) {
      if (!prediccion) prediccion = c.id;
      const otro = M.casos.find(x => x.id !== c.id);
      marco(`<div class="mt-foto"><div class="mt-bg" style="background-image:url('${c.poster}')"></div><video class="mt-video" src="${c.video}" poster="${c.poster}" controls muted playsinline autoplay></video>
          <span class="pb-chip">Caso ${c.letra} · ${c.titulo}</span></div>
        <div class="mt-side"><span class="kicker">${M.exp} · Caso ${c.letra}</span><h2>${c.titulo}</h2><p class="mt-ins">${M.mientras}</p>
          <div class="mt-fb"></div><div class="mt-acc"></div>
          <div class="mt-pie"><button class="btn btn-ghost btn-sm" data-casos>Ver los dos casos</button><button class="btn btn-ghost btn-sm" data-back>Volver al 360°</button></div></div>`);
      mesa.querySelector("[data-casos]").onclick = () => { mesa.querySelector("video").pause(); elegir(); };
      const vid = mesa.querySelector("video"), fb = mesa.querySelector(".mt-fb"), acc = mesa.querySelector(".mt-acc");
      vid.play().catch(() => {});
      const terminar = () => {
        if (vistos.has(c.id) && fb.innerHTML) return;
        vistos.add(c.id);
        const acerto = prediccion === M.correcta;
        if (vistos.size === 1) {
          fb.innerHTML = acerto ? `<div class="fb ok"><b>¡Tu predicción es correcta!</b>${M.bien}</div>` : `<div class="fb bad"><b>Mira lo que pasó.</b>${M.mal}</div>`;
        } else {
          fb.innerHTML = `<div class="fb ok"><b>Comparaste los dos casos</b>${M.bien}</div>`;
        }
        fb.insertAdjacentHTML("beforeend", `<p class="pb-resumen">${M.resumen}</p>`);
        acc.innerHTML = (vistos.has(otro.id) ? "" : `<button class="btn btn-ghost">${ICO_PLAY} Ver el caso ${otro.letra}</button>`) + `<button class="btn btn-red" data-back>Volver al laboratorio 360°</button>`;
        const b2 = acc.querySelector(".btn-ghost"); if (b2) b2.onclick = () => { vid.pause(); ver(otro); };
        acc.querySelector("[data-back]").onclick = cerrar;
        marcar(id);
      };
      vid.addEventListener("ended", terminar);
      vid.addEventListener("error", terminar);
      if (vid.error) terminar();
    }
  }

  function estado() {
    const n = C.lab360.mesas.length;
    chip.textContent = `Laboratorio 360° · mesas ${done.size} de ${n}`;
    if (done.size >= n && !$("#fin").dataset.visto) { $("#fin").dataset.visto = 1; $("#fin").classList.add("on"); avisar("completo"); }
  }
  $("#finCerrar").onclick = () => $("#fin").classList.remove("on");

  avisar("listo");
  requestAnimationFrame(loop);
})();
