// Lo que la web de Tangerine UI necesita de JavaScript: resaltar código,
// ejecutar los ejemplos en vivo, temas y animaciones al hacer scroll.
(function () {
  "use strict";
  const T = window.Tangerine;
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };
  const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const raiz = document.documentElement;

  function aplicarRadio(px) {
    const n = Number(px);
    raiz.style.setProperty("--t-radius", n + "px");
    raiz.style.setProperty("--t-radius-sm", Math.max(2, Math.round(n * 0.7)) + "px");
    raiz.style.setProperty("--t-radius-lg", Math.round(n * 1.6) + "px");
  }

  // Tema guardado, antes de dibujar nada (evita el destello)
  const temaGuardado = leer("tui-tema");
  if (temaGuardado) raiz.dataset.theme = temaGuardado;
  const acento = leer("tui-acento");
  if (acento) raiz.style.setProperty("--t-accent", acento);
  const radio = leer("tui-radio");
  if (radio) aplicarRadio(radio);

  // ---------- Resaltado ----------
  const KW = new Set("let var fn return if else while loop for in break continue match class struct self super do catch throw true false nil import export async await from as view".split(" "));
  const TNG = /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|(@[A-Za-z]+)|(\$[A-Za-z_]\w*)|(\.[a-z][\w-]*(?=[,)\s]))|(\b\d[\d_.]*\b)|([A-Za-z_\u00C0-\u024F][\w\u00C0-\u024F]*)/g;
  function tng(src) {
    const out = [];
    let last = 0, m;
    TNG.lastIndex = 0;
    while ((m = TNG.exec(src))) {
      if (m.index > last) out.push([null, src.slice(last, m.index)]);
      const t = m[0];
      if (m[1]) out.push(["c", t]);
      else if (m[2]) out.push(["s", t]);
      else if (m[3]) out.push(["d", t]);
      else if (m[4]) out.push(["b", t]);
      else if (m[5]) out.push(["e", t]);
      else if (m[6]) out.push(["n", t]);
      else if (KW.has(t)) out.push(["k", t]);
      else if (/^[A-Z]/.test(t)) out.push(["t", t]);
      else if (src[TNG.lastIndex] === "(") out.push(["f", t]);
      else out.push([null, t]);
      last = TNG.lastIndex;
    }
    if (last < src.length) out.push([null, src.slice(last)]);
    return out;
  }
  const HTML = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][\w-]*)|([\w\-:@[\]()]+)(?==)|("[^"]*")|(\/?>)/g;
  function html(src) {
    const out = [];
    let last = 0, m;
    HTML.lastIndex = 0;
    while ((m = HTML.exec(src))) {
      if (m.index > last) out.push([null, src.slice(last, m.index)]);
      out.push([m[1] ? "c" : m[2] ? "k" : m[3] ? "f" : m[4] ? "s" : "k", m[0]]);
      last = HTML.lastIndex;
    }
    if (last < src.length) out.push([null, src.slice(last)]);
    return out;
  }
  const BASH = /(#[^\n]*)|("[^"]*")|(^|\n)(\s*)([\w-]+)/g;
  function bash(src) {
    const out = [];
    let last = 0, m;
    BASH.lastIndex = 0;
    while ((m = BASH.exec(src))) {
      if (m.index > last) out.push([null, src.slice(last, m.index)]);
      if (m[1]) out.push(["c", m[1]]);
      else if (m[2]) out.push(["s", m[2]]);
      else { out.push([null, m[3] + m[4]]); out.push(["f", m[5]]); }
      last = BASH.lastIndex;
    }
    if (last < src.length) out.push([null, src.slice(last)]);
    return out;
  }
  const CSS = /(\/\*[\s\S]*?\*\/)|(--[\w-]+)|(#[0-9a-fA-F]{3,8}\b|\d+(?:px|%|ms)?)|([.:][\w-]+)/g;
  function css(src) {
    const out = [];
    let last = 0, m;
    CSS.lastIndex = 0;
    while ((m = CSS.exec(src))) {
      if (m.index > last) out.push([null, src.slice(last, m.index)]);
      out.push([m[1] ? "c" : m[2] ? "b" : m[3] ? "n" : "k", m[0]]);
      last = CSS.lastIndex;
    }
    if (last < src.length) out.push([null, src.slice(last)]);
    return out;
  }
  function pintar(el, src, lenguaje) {
    const partes = (lenguaje === "html" ? html : lenguaje === "bash" ? bash : lenguaje === "css" ? css : tng)(String(src));
    const frag = document.createDocumentFragment();
    for (const [c, t] of partes) {
      if (!c) { frag.appendChild(document.createTextNode(t)); continue; }
      const s = document.createElement("span");
      s.className = "hl-" + c;
      s.textContent = t;
      frag.appendChild(s);
    }
    el.replaceChildren(frag);
  }

  // ---------- Ejemplos en vivo ----------
  let fuenteUI = null;
  function ui() {
    if (fuenteUI === null) {
      const s = document.querySelector('script[type="text/tangerine"][data-module$="ui.tng"]');
      fuenteUI = s ? s.textContent : "";
    }
    return fuenteUI;
  }
  function instancia(errores) {
    return new T({
      output: () => {},
      onError: (m) => errores.push(m),
      modules: { "tangerine-ui.tng": ui() },
      imports: { "tangerine-lang-ui": "tangerine-ui.tng" },
    });
  }
  function mostrarError(el, msg) {
    const d = document.createElement("div");
    d.className = "demo-error";
    d.textContent = msg;
    el.replaceChildren(d);
  }
  function correrDemo(el, codigo) {
    el.replaceChildren();
    const errores = [];
    const t = instancia(errores);
    t.define("__destino", el);
    try { t.run(String(codigo) + "\nmount(__destino, Demo)"); }
    catch (x) { mostrarError(el, x.message || String(x)); return; }
    if (errores.length) mostrarError(el, errores[0]);
  }

  // Ordena el HTML con sangría para que se lea bien
  function ordenar(plano) {
    const tokens = plano.replace(/>\s*</g, ">\n<").split("\n");
    let nivel = 0;
    const lineas = [];
    const vacio = /^<(br|hr|img|input|meta|link)\b/;
    for (const t of tokens) {
      const cierra = /^<\//.test(t);
      if (cierra) nivel = Math.max(0, nivel - 1);
      lineas.push("  ".repeat(nivel) + t);
      const abre = /^<[a-z]/i.test(t) && !cierra && !vacio.test(t) && !/<\/[\w-]+>$/.test(t);
      if (abre) nivel++;
    }
    return lineas.join("\n");
  }

  const vistos = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      vistos.unobserve(e.target);
      e.target.classList.add("visible");
      if (e.target.__alVer) { const f = e.target.__alVer; e.target.__alVer = null; f(); }
    }
  }, { rootMargin: "0px 0px -6% 0px" });

  T.registerPlugin({
    name: "sitio-ui",
    install(tng) {
      const invoke = (f, a) => tng.invoke(f, a || []);
      tng.defineAll({
        resaltar: (el, src, lenguaje) => { pintar(el, src, lenguaje); return el; },
        // Ejecuta el ejemplo y lo monta en el elemento
        demo: (el, codigo) => { correrDemo(el, codigo); return null; },
        // Igual, pero cuando el elemento aparece en pantalla
        demo_al_ver: (el, codigo) => { el.__alVer = () => correrDemo(el, codigo); vistos.observe(el); return null; },
        demo_html: (codigo) => {
          try { return ordenar(instancia([]).run(String(codigo) + "\nrender_html(Demo())")); }
          catch (x) { return "<!-- " + (x.message || x) + " -->"; }
        },
        revelar: (el) => { vistos.observe(el); return el; },
        tema_actual: () => raiz.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
        poner_tema: (t) => { raiz.dataset.theme = t; guardar("tui-tema", t); return null; },
        poner_acento: (hex) => { raiz.style.setProperty("--t-accent", hex); guardar("tui-acento", hex); return null; },
        acento_actual: () => leer("tui-acento") || "#f2761d",
        poner_radio: (px) => { aplicarRadio(px); guardar("tui-radio", String(px)); return null; },
        radio_actual: () => Number(leer("tui-radio") || 10),
        atajo_buscar: (f) => {
          document.addEventListener("keydown", (e) => {
            const enCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
            if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !enCampo)) {
              e.preventDefault();
              invoke(f);
            }
          });
          return null;
        },
        enfocar: (sel) => {
          setTimeout(() => { const e = document.querySelector(sel); if (e) e.focus(); }, 40);
          return null;
        },
      });
    },
  });
})();
