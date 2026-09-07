/* Winner Osiris Beauty — osiris-fix.js */
(function () {
  "use strict";

  const UNLOCK = new Date("2026-09-20T18:00:00-03:00").getTime();
  const PRICES = {
    gloss: 49.90,
    pincel: 29.90,
    esponjinha: 24.90,
    iluminador: 64.90,
    corretivo: 59.90,
    delineador: 39.90
  };

  const norm = s => String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  function typeOf(card) {
    const img = card.querySelector("img");
    const text = [
      card.innerText, card.dataset.product, card.dataset.name,
      card.dataset.category, img && img.alt, img && img.src
    ].filter(Boolean).join(" ");
    const t = norm(text);

    if (/esponjinha|esponja|beauty blender|makeup sponge|sponge/.test(t)) return "esponjinha";
    if (/gloss|lip gloss|brilho labial|gloss labial/.test(t)) return "gloss";
    if (/pincel|brush/.test(t)) return "pincel";
    if (/iluminador|highlighter|luminador/.test(t)) return "iluminador";
    if (/corretivo|concealer/.test(t)) return "corretivo";
    if (/caneta delineadora|delineador|eyeliner|eye liner/.test(t)) return "delineador";
    return null;
  }

  function cards() {
    const set = new Set();
    [
      "[data-product]","[data-name]",".product-card",".product",
      ".produto",".product-item",".card","article"
    ].forEach(sel => document.querySelectorAll(sel).forEach(el => {
      if (el.querySelector("img")) set.add(el);
    }));
    return [...set];
  }

  function styles() {
    if (document.getElementById("osiris-fix-style")) return;
    const s = document.createElement("style");
    s.id = "osiris-fix-style";
    s.textContent = `
      #osiris-category-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:18px auto;padding:10px;max-width:1100px;position:relative;z-index:20}
      #osiris-category-bar button{border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.72);color:#fff;padding:9px 14px;border-radius:999px;cursor:pointer;font:inherit}
      #osiris-category-bar button.osiris-active{background:#fff;color:#000}
      .osiris-hidden-product{display:none!important}
      .osiris-ambassador{margin:30px auto;padding:28px;max-width:1000px;border:1px solid rgba(255,255,255,.22);border-radius:20px;background:linear-gradient(135deg,rgba(0,0,0,.92),rgba(50,20,55,.86));color:#fff;text-align:center}
      .osiris-lock{font-size:42px;margin:8px}.osiris-countdown{font-weight:700}
      .osiris-instagram-tools{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
      .osiris-instagram-tools button{border:0;border-radius:10px;padding:10px 13px;cursor:pointer;font-weight:700}
    `;
    document.head.appendChild(s);
  }

  function categoryBar() {
    if (document.getElementById("osiris-category-bar")) return;
    const bar = document.createElement("div");
    bar.id = "osiris-category-bar";
    bar.innerHTML = `
      <button data-cat="todos">Todos</button>
      <button data-cat="gloss">Gloss</button>
      <button data-cat="pincel">Pincéis</button>
      <button data-cat="esponjinha">Esponjinhas</button>
      <button data-cat="iluminador">Iluminadores</button>
      <button data-cat="corretivo">Corretivos</button>
      <button data-cat="delineador">Delineadores</button>`;
    const anchor = document.querySelector("main") || document.body;
    anchor.prepend(bar);
    bar.querySelector("button").classList.add("osiris-active");
    bar.addEventListener("click", e => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      const cat = b.dataset.cat;
      bar.querySelectorAll("button").forEach(x => x.classList.remove("osiris-active"));
      b.classList.add("osiris-active");
      cards().forEach(card => {
        const type = typeOf(card);
        card.classList.toggle("osiris-hidden-product", cat !== "todos" && type !== cat);
      });
    });
  }

  function fixProducts() {
    cards().forEach(card => {
      const type = typeOf(card);
      if (!type) return;
      card.dataset.osirisCategory = type;

      if (type === "delineador") {
        card.querySelectorAll("*").forEach(el => {
          if (!el.children.length && /base para pele/i.test(el.textContent || ""))
            el.textContent = el.textContent.replace(/base para pele/gi, "delineador");
        });
      }

      /* Só preenche preço quando o card não apresenta um preço numérico.
         Assim, preços já definidos no catálogo não são sobrescritos. */
      const price = [...card.querySelectorAll(
        "[data-price],.price,.preco,.preço,.product-price,.valor"
      )].find(el => /\d/.test(el.textContent || ""));
      if (!price) {
        const holder = card.querySelector("[data-price],.price,.preco,.preço,.product-price,.valor");
        if (holder) holder.textContent = `R$ ${PRICES[type].toFixed(2).replace(".", ",")}`;
      }
    });
  }

  function ambassadors() {
    if (document.getElementById("osiris-ambassadors")) return;
    const sec = document.createElement("section");
    sec.id = "osiris-ambassadors";
    sec.className = "osiris-ambassador";
    sec.innerHTML = `
      <div class="osiris-lock">🔐</div>
      <h2>Embaixadores Winner Osiris</h2>
      <p class="osiris-status">Área exclusiva ainda bloqueada.</p>
      <div class="osiris-countdown"></div>`;
    (document.querySelector("main") || document.body).appendChild(sec);

    function update() {
      const diff = UNLOCK - Date.now();
      const lock = sec.querySelector(".osiris-lock");
      const status = sec.querySelector(".osiris-status");
      const count = sec.querySelector(".osiris-countdown");
      if (diff <= 0) {
        lock.textContent = "✨";
        status.textContent = "Área de Embaixadores desbloqueada!";
        count.textContent = "Bem-vindo(a) aos Embaixadores Winner Osiris.";
        sec.classList.add("open");
        return;
      }
      const total = Math.floor(diff / 1000);
      const d = Math.floor(total / 86400);
      const h = Math.floor((total % 86400) / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      count.textContent = `Desbloqueia em ${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
    }
    update();
    setInterval(update, 1000);
  }

  function username(v) {
    return String(v || "").trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@/, "").split(/[/?#\s]/)[0];
  }

  async function copy(text, button) {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement("textarea");
      t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
    }
    if (button) {
      const old = button.textContent; button.textContent = "✓ Copiado!";
      setTimeout(() => button.textContent = old, 1500);
    }
  }

  function instagramTools() {
    const fields = [...document.querySelectorAll("input,textarea,[contenteditable='true']")];
    const ig = fields.find(el => /instagram|usuario.*insta|insta.*usuario/i.test(
      [el.name,el.id,el.placeholder,el.getAttribute("aria-label")].filter(Boolean).join(" ")
    ));
    if (!ig) return;
    const box = ig.closest("form,.modal,.camera-container,.camera,.private-camera,section,div") || ig.parentElement;
    if (!box || box.querySelector(".osiris-instagram-tools")) return;

    const msg = [...box.querySelectorAll("textarea,[contenteditable='true'],input")]
      .find(el => el !== ig && /mensagem|message|dm|texto|caption|legenda/i.test(
        [el.name,el.id,el.placeholder,el.getAttribute("aria-label")].filter(Boolean).join(" ")
      ));
    const tools = document.createElement("div");
    tools.className = "osiris-instagram-tools";
    const c = document.createElement("button"); c.type="button"; c.textContent="📋 Copiar mensagem";
    const o = document.createElement("button"); o.type="button"; o.textContent="📷 Abrir Instagram + copiar";
    const text = () => msg ? (msg.value ?? msg.innerText ?? msg.textContent ?? "") : "";
    c.onclick = () => copy(text(), c);
    o.onclick = async () => {
      const u = username(ig.value ?? ig.textContent);
      await copy(text(), o);
      if (u) window.open(`https://www.instagram.com/${encodeURIComponent(u)}/`, "_blank", "noopener,noreferrer");
      else { o.textContent="⚠️ Informe o Instagram"; setTimeout(()=>o.textContent="📷 Abrir Instagram + copiar",1800); }
    };
    tools.append(c,o); box.appendChild(tools);
  }

  function run() {
    styles(); categoryBar(); fixProducts(); ambassadors(); instagramTools();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, {once:true});
  else run();

  new MutationObserver(() => {
    fixProducts();
    instagramTools();
  }).observe(document.documentElement, {childList:true,subtree:true});
})();
