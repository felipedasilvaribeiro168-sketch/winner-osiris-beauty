(() => {
  "use strict";

  /*
   * WINNER OSIRIS BEAUTY
   * Correções do catálogo + categorias + Embaixadores
   */

  const EXTRA_CATS = [
    "Glosses Novos",
    "Perfumes"
  ];

  const PRICE = {
    Gloss: "R$ 49,90",
    "Glosses Novos": "R$ 49,90",
    Pincéis: "R$ 29,90",
    Esponjinhas: "R$ 24,90",
    Iluminadores: "R$ 64,90",
    Corretivos: "R$ 59,90",
    Delineadores: "R$ 39,90",
    Perfumes: "R$ 89,90",
    Bases: "R$ 69,90",
    Paletas: "R$ 79,90"
  };

  function text(el) {
    return (el?.innerText || el?.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function category(el) {
    const t = text(el);

    /*
     * Categorias das imagens/produtos.
     * "deliniador" também é reconhecido caso algum arquivo
     * tenha sido escrito dessa forma.
     */

    if (
      /gloss\s*\(?new|new\)?\s*gloss|glosses novos|gloss novo/.test(t)
    ) {
      return "Glosses Novos";
    }

    if (
      /perfume|parfum|fragrance|eau de parfum|eau de toilette/.test(t)
    ) {
      return "Perfumes";
    }

    if (
      /gloss|lip gloss|gloss labial/.test(t)
    ) {
      return "Gloss";
    }

    if (
      /delineador|deliniador|delineado|eyeliner/.test(t)
    ) {
      return "Delineadores";
    }

    if (
      /esponjinha|esponja|beauty sponge/.test(t)
    ) {
      return "Esponjinhas";
    }

    if (
      /pincel|brush/.test(t)
    ) {
      return "Pincéis";
    }

    if (
      /corretivo|concealer/.test(t)
    ) {
      return "Corretivos";
    }

    if (
      /iluminador|highlighter/.test(t)
    ) {
      return "Iluminadores";
    }

    if (
      /base\s*(facial|líquida)?|foundation/.test(t)
    ) {
      return "Bases";
    }

    if (
      /paleta|palette/.test(t)
    ) {
      return "Paletas";
    }

    return null;
  }

  /*
   * O catálogo original cria os produtos dentro de #products.
   * Usar apenas os filhos diretos evita que elementos de outras
   * partes do site sejam confundidos com produtos.
   */

  function getCards() {
    const grid = document.querySelector("#products");

    if (!grid) {
      return [];
    }

    return [...grid.children];
  }

  function fixProducts() {
    getCards().forEach(card => {
      const cat = category(card);

      if (!cat) {
        return;
      }

      card.dataset.category = cat;
      card.dataset.categoria = cat;
      card.setAttribute("data-category", cat);

      /*
       * Corrige especificamente a descrição errada
       * dos delineadores.
       */

      if (cat === "Delineadores") {
        card.querySelectorAll("*").forEach(el => {
          if (
            el.children.length === 0 &&
            /base para pele/i.test(el.textContent)
          ) {
            el.textContent =
              "Caneta delineadora Winner Osiris Beauty, com ponta de alta precisão e traço intenso para criar delineados marcantes com acabamento elegante.";
          }
        });
      }

      /*
       * Só adiciona preço quando o produto ainda não possui
       * um valor numérico.
       */

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

  /*
   * Mantém as categorias que já existem no site.
   * Apenas acrescenta Glosses Novos e Perfumes.
   */

  function fixFilters() {
    const catalog = document.querySelector("#catalogo");

    if (!catalog) {
      return;
    }

    let filters = catalog.querySelector(".filters");

    if (!filters) {
      filters = document.createElement("div");
      filters.className = "filters";

      const grid = catalog.querySelector("#products,.grid");

      if (grid) {
        grid.before(filters);
      } else {
        catalog.appendChild(filters);
      }
    }

    /*
     * NÃO apagamos os filtros antigos.
     */

    EXTRA_CATS.forEach(cat => {
      const alreadyExists = [...filters.querySelectorAll(".filter")]
        .some(button => button.dataset.filter === cat);

      if (alreadyExists) {
        return;
      }

      const button = document.createElement("button");

      button.className = "filter";
      button.textContent = cat;
      button.dataset.filter = cat;

      filters.appendChild(button);
    });

    /*
     * Liga o funcionamento dos filtros sem duplicar eventos.
     */

    filters.querySelectorAll(".filter").forEach(button => {
      if (button.dataset.osirisBound === "1") {
        return;
      }

      button.dataset.osirisBound = "1";

      button.addEventListener("click", () => {
        filters
          .querySelectorAll(".filter")
          .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        const selected = button.dataset.filter;

        getCards().forEach(card => {
          const current =
            card.dataset.category || category(card);

          card.style.display =
            selected === "Todos" || current === selected
              ? ""
              : "none";
        });
      });
    });
  }

  /*
   * Remove a antiga mensagem relacionada ao Netlify.
   */

  function removeNetlifyMessage() {
    document.querySelectorAll("body *").forEach(el => {
      if (
        el.children.length === 0 &&
        /a senha do painel é configurada no netlify/i.test(
          el.textContent
        )
      ) {
        el.textContent =
          "O painel usa o backend Cloudflare da Winner Osiris Beauty.";
      }
    });
  }

  /*
   * ÁREA DOS EMBAIXADORES
   * Cadeado + magia + partículas + contagem regressiva.
   */

  function ambassadors() {
    if (document.querySelector("#osiris-ambassadors")) {
      return;
    }

    const section = document.createElement("section");

    section.id = "osiris-ambassadors";

    section.innerHTML = `
      <style>

        #osiris-ambassadors {
          position: relative;
          overflow: hidden;
          margin: 42px auto;
          padding: 42px 20px;
          text-align: center;
          max-width: 900px;
          border-radius: 28px;
          background:
            radial-gradient(
              circle at center,
              rgba(255,255,255,.97),
              rgba(245,238,250,.86)
            );
          box-shadow:
            0 12px 40px rgba(0,0,0,.10);
        }

        #osiris-ambassadors .os-kicker {
          letter-spacing: 3px;
          font-size: 12px;
          font-weight: 700;
          opacity: .7;
        }

        #osiris-ambassadors h2 {
          margin: 8px 0;
          font-size: 30px;
          letter-spacing: 1px;
        }

        #osiris-ambassadors .os-sub {
          margin: 8px auto 22px;
          max-width: 620px;
          line-height: 1.6;
        }

        .os-lock-wrap {
          position: relative;
          width: 150px;
          height: 150px;
          margin: 12px auto 18px;
          display: grid;
          place-items: center;
        }

        .os-lock {
          font-size: 66px;
          position: relative;
          z-index: 3;
          animation:
            osLockMove 1.8s ease-in-out infinite;
          filter:
            drop-shadow(0 0 10px rgba(130,80,170,.35));
        }

        .os-ring {
          position: absolute;
          inset: 18px;
          border:
            1px solid rgba(120,80,150,.35);
          border-radius: 50%;
          animation:
            osRing 4s linear infinite;
        }

        .os-ring.r2 {
          inset: 4px;
          animation-duration: 6s;
          animation-direction: reverse;
        }

        .os-magic {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-size: 18px;
          animation:
            osSpark 2s ease-in-out infinite;
        }

        .os-p {
          position: absolute;
          animation:
            osParticle 3s ease-in-out infinite;
          opacity: .8;
        }

        .p1 {
          top: 8%;
          left: 15%;
        }

        .p2 {
          top: 18%;
          right: 12%;
          animation-delay: .5s;
        }

        .p3 {
          bottom: 12%;
          left: 18%;
          animation-delay: 1s;
        }

        .p4 {
          bottom: 18%;
          right: 14%;
          animation-delay: 1.5s;
        }

        .os-date {
          font-weight: 800;
          letter-spacing: 1px;
          margin: 12px 0;
        }

        .os-count {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 15px;
        }

        .os-time {
          min-width: 68px;
          padding: 10px 8px;
          border-radius: 14px;
          background: rgba(255,255,255,.75);
          box-shadow:
            0 4px 15px rgba(0,0,0,.06);
        }

        .os-time b {
          display: block;
          font-size: 22px;
        }

        .os-time small {
          font-size: 10px;
          letter-spacing: 1px;
        }

        @keyframes osLockMove {

          0%, 100% {
            transform:
              translateY(0)
              rotate(0);
          }

          25% {
            transform:
              translateY(-5px)
              rotate(-4deg);
          }

          50% {
            transform:
              translateY(2px)
              rotate(4deg);
          }

          75% {
            transform:
              translateY(-3px)
              rotate(-2deg);
          }

        }

        @keyframes osRing {
          to {
            transform:
              rotate(360deg);
          }
        }

        @keyframes osSpark {

          0%, 100% {
            transform:
              scale(.9)
              rotate(0);
            opacity: .45;
          }

          50% {
            transform:
              scale(1.12)
              rotate(12deg);
            opacity: 1;
          }

        }

        @keyframes osParticle {

          0%, 100% {
            transform:
              translateY(5px)
              scale(.8);
            opacity: .3;
          }

          50% {
            transform:
              translateY(-10px)
              scale(1.15);
            opacity: 1;
          }

        }

        @media (max-width: 600px) {

          #osiris-ambassadors {
            margin: 30px 12px;
            padding: 34px 15px;
          }

          #osiris-ambassadors h2 {
            font-size: 23px;
          }

          #osiris-ambassadors .os-sub {
            font-size: 14px;
          }

        }

      </style>

      <div class="os-kicker">
        WINNER OSIRIS BEAUTY
      </div>

      <div class="os-lock-wrap">

        <div class="os-ring"></div>

        <div class="os-ring r2"></div>

        <div class="os-magic">
          ✦　✧　✦
        </div>

        <span class="os-p p1">✦</span>
        <span class="os-p p2">✧</span>
        <span class="os-p p3">✦</span>
        <span class="os-p p4">✧</span>

        <div class="os-lock">
          🔒
        </div>

      </div>

      <h2>
        EMBAIXADORES WINNER OSIRIS
      </h2>

      <p class="os-sub">
        Um novo capítulo está prestes a ser desbloqueado.
        O acesso será revelado no momento certo.
      </p>

      <div class="os-date">
        20 DE SETEMBRO DE 2026 · 18H
      </div>

      <div class="os-count">

        <div class="os-time">
          <b id="os-days">00</b>
          <small>DIAS</small>
        </div>

        <div class="os-time">
          <b id="os-hours">00</b>
          <small>HORAS</small>
        </div>

        <div class="os-time">
          <b id="os-minutes">00</b>
          <small>MIN</small>
        </div>

        <div class="os-time">
          <b id="os-seconds">00</b>
          <small>SEG</small>
        </div>

      </div>
    `;

    const catalog =
      document.querySelector("#catalogo");

    if (catalog) {
      catalog.after(section);
    } else {
      document.body.appendChild(section);
    }

    /*
     * Data do lançamento:
     * 20/09/2026 às 18:00 no horário de Brasília.
     */

    const target =
      new Date(
        "2026-09-20T18:00:00-03:00"
      ).getTime();

    function countdown() {

      const difference =
        Math.max(0, target - Date.now());

      const totalSeconds =
        Math.floor(difference / 1000);

      const days =
        Math.floor(
          totalSeconds / 86400
        );

      const hours =
        Math.floor(
          (totalSeconds % 86400) / 3600
        );

      const minutes =
        Math.floor(
          (totalSeconds % 3600) / 60
        );

      const seconds =
        totalSeconds % 60;

      const values = [
        days,
        hours,
        minutes,
        seconds
      ];

      [
        "os-days",
        "os-hours",
        "os-minutes",
        "os-seconds"
      ].forEach((id, index) => {

        const element =
          document.getElementById(id);

        if (element) {
          element.textContent =
            String(values[index])
              .padStart(2, "0");
        }

      });

      if (difference <= 0) {

        const subtitle =
          section.querySelector(".os-sub");

        if (subtitle) {
          subtitle.textContent =
            "O acesso foi desbloqueado. Bem-vindos ao próximo capítulo da Winner Osiris Beauty.";
        }

      }

    }

    countdown();

    setInterval(
      countdown,
      1000
    );
  }

  function run() {

    fixFilters();
    fixProducts();
    removeNetlifyMessage();
    ambassadors();

  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      run
    );

  } else {

    run();

  }

  /*
   * Observa alterações feitas pelo catálogo
   * e reaplica as correções automaticamente.
   */

  new MutationObserver(() => {

    clearTimeout(
      window.__osirisTimer
    );

    window.__osirisTimer =
      setTimeout(
        run,
        300
      );

  }).observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

})();
