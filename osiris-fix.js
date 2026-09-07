(() => {
  "use strict";

  const CATS = [
    "Todos",
    "Gloss",
    "Pincéis",
    "Esponjinhas",
    "Iluminadores",
    "Corretivos",
    "Delineadores"
  ];

  const PRICE = {
    Gloss: "R$ 49,90",
    Pincéis: "R$ 29,90",
    Esponjinhas: "R$ 24,90",
    Iluminadores: "R$ 64,90",
    Corretivos: "R$ 59,90",
    Delineadores: "R$ 39,90"
  };

  function text(el) {
    return (el?.innerText || el?.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function category(el) {
    const t = text(el);

    if (/gloss|lip gloss|gloss labial/.test(t)) return "Gloss";
    if (/delineador|delineado|eyeliner/.test(t)) return "Delineadores";
    if (/esponjinha|esponja|beauty sponge/.test(t)) return "Esponjinhas";
    if (/pincel|brush/.test(t)) return "Pincéis";
    if (/corretivo|concealer/.test(t)) return "Corretivos";
    if (/iluminador|highlighter/.test(t)) return "Iluminadores";

    return null;
  }

  function getCards() {
    const found = new Set();

    document.querySelectorAll(
      "[data-product], .product-card, .product-item, .product, .produto, article, .card"
    ).forEach(el => {
      if (el.querySelectorAll("img").length <= 1) found.add(el);
    });

    document.querySelectorAll("#products img").forEach(img => {
      let el = img;

      for (let i = 0; i < 6 && el; i++, el = el.parentElement) {
        if (
          el.querySelectorAll("img").length === 1 &&
          text(el).length > 15
        ) {
          found.add(el);
          break;
        }
      }
    });

    return [...found];
  }

  function fixProducts() {
    getCards().forEach(card => {
      const cat = category(card);
      if (!cat) return;

      card.dataset.category = cat;
      card.dataset.categoria = cat;

      card.setAttribute("data-category", cat);

      // Corrige descrição errada dos delineadores
      if (cat === "Delineadores") {
        card.querySelectorAll("*").forEach(el => {
          if (
            el.children.length === 0 &&
            /base para pele/i.test(el.textContent)
          ) {
            el.textContent = "Delineador de alta precisão para um olhar marcante.";
          }
        });
      }

      // Preenche preço somente quando não existe preço numérico
      const hasPrice = /\d+[,.]\d{2}/.test(text(card));

      if (!hasPrice && PRICE[cat]) {
        const price = document.createElement("div");
        price.className = "osiris-price";
        price.textContent = PRICE[cat];
        price.style.cssText =
          "font-weight:700;font-size:18px;margin-top:8px;";
        card.appendChild(price);
      }
    });
  }

  function fixFilters() {
    const catalog = document.querySelector("#catalogo");
    if (!catalog) return;

    let filters = catalog.querySelector(".filters");

    if (!filters) {
      filters = document.createElement("div");
      filters.className = "filters";
      const grid = catalog.querySelector("#products,.grid");
      if (grid) grid.before(filters);
      else catalog.appendChild(filters);
    }

    filters.innerHTML = "";

    CATS.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "filter" + (cat === "Todos" ? " active" : "");
      btn.textContent = cat;
      btn.dataset.filter = cat;

      btn.onclick = () => {
        filters.querySelectorAll(".filter").forEach(b =>
          b.classList.remove("active")
        );
        btn.classList.add("active");

        getCards().forEach(card => {
          const current = card.dataset.category || category(card);
          card.style.display =
            cat === "Todos" || current === cat ? "" : "none";
        });
      };

      filters.appendChild(btn);
    });

    filters.style.cssText =
      "position:relative!important;top:auto!important;left:auto!important;right:auto!important;" +
      "width:100%!important;display:flex!important;flex-wrap:wrap!important;" +
      "justify-content:center!important;gap:8px!important;margin:20px 0!important;";
  }

  function removeNetlifyMessage() {
    document.querySelectorAll("body *").forEach(el => {
      if (
        el.children.length === 0 &&
        /a senha do painel é configurada no netlify/i.test(el.textContent)
      ) {
        el.textContent =
          "O painel usa o backend Cloudflare da Winner Osiris Beauty.";
      }
    });
  }

  function ambassadors() {
    if (document.querySelector("#osiris-ambassadors")) return;

    const section = document.createElement("section");
    section.id = "osiris-ambassadors";
    section.style.cssText =
      "margin:40px auto;padding:28px;text-align:center;max-width:900px;" +
      "border-radius:20px;background:rgba(0,0,0,.04);";

    section.innerHTML = `
      <h2>EMBAIXADORES WINNER OSIRIS</h2>
      <p>O acesso será liberado em breve.</p>
      <strong>20/09/2026 às 18h</strong>
    `;

    const catalog = document.querySelector("#catalogo");
    if (catalog) catalog.after(section);
    else document.body.appendChild(section);
  }

  function run() {
    fixFilters();
    fixProducts();
    removeNetlifyMessage();
    ambassadors();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  new MutationObserver(() => {
    clearTimeout(window.__osirisTimer);
    window.__osirisTimer = setTimeout(run, 300);
  }).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
