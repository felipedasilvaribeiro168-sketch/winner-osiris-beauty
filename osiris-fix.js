(function () {
  "use strict";

  /*
   * WINNER OSIRIS BEAUTY — FIX
   * Organização de categorias, preços, Embaixadores
   * e ferramentas da câmera/Instagram.
   */

  const AMBASSADOR_UNLOCK =
    new Date("2026-09-20T18:00:00-03:00").getTime();

  const SUGGESTED_PRICES = {
    gloss: 49.90,
    pincel: 29.90,
    esponjinha: 24.90,
    iluminador: 64.90,
    corretivo: 59.90,
    delineador: 39.90
  };

  const CATEGORIES = [
    { id: "todos", label: "Todos" },
    { id: "gloss", label: "Gloss" },
    { id: "pincel", label: "Pincéis" },
    { id: "esponjinha", label: "Esponjinhas" },
    { id: "iluminador", label: "Iluminadores" },
    { id: "corretivo", label: "Corretivos" },
    { id: "delineador", label: "Delineadores" }
  ];

  function normalize(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function money(value) {
    return "R$ " + value.toFixed(2).replace(".", ",");
  }

  function getCardText(card) {
    const parts = [
      card.innerText,
      card.textContent,
      card.getAttribute("data-product"),
      card.getAttribute("data-name"),
      card.getAttribute("data-category"),
      card.getAttribute("data-type")
    ];

    const image = card.querySelector("img");

    if (image) {
      parts.push(image.getAttribute("alt"));
      parts.push(image.getAttribute("src"));
      parts.push(image.getAttribute("title"));
    }

    return normalize(parts.filter(Boolean).join(" "));
  }

  function detectCategory(card) {
    const text = getCardText(card);

    /*
     * A ordem é importante.
     * Termos mais específicos são verificados primeiro.
     */

    if (
      text.includes("esponjinha") ||
      text.includes("esponja") ||
      text.includes("beauty blender") ||
      text.includes("blender")
    ) {
      return "esponjinha";
    }

    if (
      text.includes("gloss") ||
      text.includes("lip gloss") ||
      text.includes("gloss labial")
    ) {
      return "gloss";
    }

    if (
      text.includes("pincel") ||
      text.includes("brush")
    ) {
      return "pincel";
    }

    if (
      text.includes("iluminador") ||
      text.includes("highlighter") ||
      text.includes("iluminacao")
    ) {
      return "iluminador";
    }

    if (
      text.includes("corretivo") ||
      text.includes("concealer")
    ) {
      return "corretivo";
    }

    if (
      text.includes("delineador") ||
      text.includes("delineadora") ||
      text.includes("eyeliner") ||
      text.includes("delineador liquido") ||
      text.includes("caneta delineadora")
    ) {
      return "delineador";
    }

    return "";
  }

  function findProductCards() {
    const selectors = [
      "[data-product]",
      "[data-name]",
      ".product",
      ".produto",
      ".product-card",
      ".produto-card",
      ".card-produto",
      ".product-item",
      ".item-produto"
    ];

    const result = new Set();

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        result.add(element);
      });
    });

    /*
     * Caso o site não use classes padronizadas,
     * procuramos elementos que contenham imagem e preço.
     */

    document.querySelectorAll("article, li, section, div").forEach(function (element) {
      if (
        element.querySelector("img") &&
        (
          element.querySelector("[class*='price']") ||
          element.querySelector("[class*='preco']") ||
          /R\$\s*\d/.test(element.innerText || "")
        )
      ) {
        result.add(element);
      }
    });

    return Array.from(result);
  }

  function findPriceElement(card) {
    const selectors = [
      ".price",
      ".preco",
      ".preço",
      ".product-price",
      ".produto-preco",
      ".valor",
      "[class*='price']",
      "[class*='preco']",
      "[class*='preço']"
    ];

    for (const selector of selectors) {
      const element = card.querySelector(selector);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function fixDescription(card, category) {
    if (category !== "delineador") {
      return;
    }

    const elements = card.querySelectorAll(
      "p, span, div, small, strong, b, label"
    );

    elements.forEach(function (element) {
      const text = normalize(element.textContent);

      if (
        text.includes("base para pele") ||
        text.includes("base de pele")
      ) {
        element.textContent = element.textContent
          .replace(/base para pele/gi, "Delineador")
          .replace(/base de pele/gi, "Delineador");
      }
    });
  }

  function fixPrice(card, category) {
    const price = SUGGESTED_PRICES[category];

    if (!price) {
      return;
    }

    const priceElement = findPriceElement(card);

    /*
     * Não substituímos preços que já existem.
     * Isso evita apagar preços personalizados
     * que já estejam configurados no site.
     */

    if (priceElement) {
      const currentText = priceElement.textContent || "";

      if (!/\d/.test(currentText)) {
        priceElement.textContent = money(price);
      }
    }
  }

  function markCard(card, category) {
    if (!category) {
      return;
    }

    card.setAttribute("data-osiris-category", category);
    card.classList.add("osiris-product-card");
  }

  function organizeProducts() {
    const cards = findProductCards();

    cards.forEach(function (card) {
      const category = detectCategory(card);

      if (!category) {
        return;
      }

      markCard(card, category);
      fixDescription(card, category);
      fixPrice(card, category);
    });

    return cards;
  }

  function createCategoryBar() {
    if (document.querySelector("#osiris-category-bar")) {
      return;
    }

    const cards = organizeProducts();

    if (!cards.length) {
      return;
    }

    const bar = document.createElement("div");

    bar.id = "osiris-category-bar";
    bar.innerHTML = CATEGORIES.map(function (category, index) {
      return `
        <button
          type="button"
          class="osiris-category-button${index === 0 ? " active" : ""}"
          data-category="${category.id}"
        >
          ${category.label}
        </button>
      `;
    }).join("");

    const firstCard = cards[0];

    if (firstCard && firstCard.parentElement) {
      firstCard.parentElement.parentElement?.insertBefore(
        bar,
        firstCard.parentElement
      );
    } else {
      document.body.prepend(bar);
    }

    bar.addEventListener("click", function (event) {
      const button = event.target.closest(
        ".osiris-category-button"
      );

      if (!button) {
        return;
      }

      const category = button.getAttribute("data-category");

      bar.querySelectorAll(".osiris-category-button").forEach(function (item) {
        item.classList.remove("active");
      });

      button.classList.add("active");

      organizeProducts();

      document
        .querySelectorAll(".osiris-product-card")
        .forEach(function (card) {
          const cardCategory =
            card.getAttribute("data-osiris-category");

          if (
            category === "todos" ||
            cardCategory === category
          ) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
    });
  }

  function getInstagramUsername() {
    const selectors = [
      'input[name*="instagram"]',
      'input[id*="instagram"]',
      'input[placeholder*="Instagram"]',
      'input[placeholder*="instagram"]',
      'input[name*="usuario"]',
      'input[id*="usuario"]',
      'input[placeholder*="usuário"]',
      'input[placeholder*="usuario"]'
    ];

    for (const selector of selectors) {
      const input = document.querySelector(selector);

      if (input && input.value.trim()) {
        return input.value
          .trim()
          .replace(/^@/, "")
          .replace(/\s/g, "");
      }
    }

    return "";
  }

  function findInstagramMessageField() {
    const selectors = [
      'textarea[name*="mensagem"]',
      'textarea[id*="mensagem"]',
      'textarea[placeholder*="mensagem"]',
      'textarea[placeholder*="Mensagem"]',
      'textarea[name*="message"]',
      'textarea[id*="message"]',
      'input[name*="mensagem"]',
      'input[id*="mensagem"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function findCameraContainer() {
    const keywords = [
      "camera",
      "câmera",
      "foto",
      "selfie",
      "instagram"
    ];

    const elements = document.querySelectorAll(
      "section, div, form, dialog, article"
    );

    for (const element of elements) {
      const text = normalize(element.innerText);

      if (
        keywords.some(function (keyword) {
          return text.includes(normalize(keyword));
        }) &&
        (
          element.querySelector("textarea") ||
          element.querySelector("input") ||
          element.querySelector("video") ||
          element.querySelector("canvas")
        )
      ) {
        return element;
      }
    }

    return null;
  }

  function getGeneratedMessage() {
    const field = findInstagramMessageField();

    if (field && field.value && field.value.trim()) {
      return field.value.trim();
    }

    const container = findCameraContainer();

    if (container) {
      const textarea = container.querySelector("textarea");

      if (textarea && textarea.value.trim()) {
        return textarea.value.trim();
      }

      const text = container.innerText || "";

      const possibleMessage = text
        .split("\n")
        .map(function (line) {
          return line.trim();
        })
        .filter(Boolean)
        .find(function (line) {
          return line.length > 20;
        });

      if (possibleMessage) {
        return possibleMessage;
      }
    }

    return "";
  }

  async function copyText(text) {
    if (!text) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      /*
       * Fallback para navegadores que bloqueiam
       * navigator.clipboard.
       */

      const textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();

      let success = false;

      try {
        success = document.execCommand("copy");
      } catch (e) {
        success = false;
      }

      textarea.remove();

      return success;
    }
  }

  function createInstagramButtons() {
    if (document.querySelector("#osiris-instagram-helper")) {
      return;
    }

    const container = findCameraContainer();

    if (!container) {
      return;
    }

    const helper = document.createElement("div");

    helper.id = "osiris-instagram-helper";

    helper.innerHTML = `
      <button
        type="button"
        id="osiris-copy-message"
        class="osiris-instagram-button"
      >
        📋 Copiar mensagem
      </button>

      <button
        type="button"
        id="osiris-open-instagram"
        class="osiris-instagram-button primary"
      >
        📷 Abrir Instagram + copiar
      </button>

      <div
        id="osiris-instagram-status"
        class="osiris-instagram-status"
        aria-live="polite"
      ></div>
    `;

    container.appendChild(helper);

    const status = helper.querySelector(
      "#osiris-instagram-status"
    );

    const copyButton = helper.querySelector(
      "#osiris-copy-message"
    );

    const openButton = helper.querySelector(
      "#osiris-open-instagram"
    );

    copyButton.addEventListener("click", async function () {
      const message = getGeneratedMessage();

      if (!message) {
        status.textContent =
          "Gere a mensagem primeiro.";
        return;
      }

      const copied = await copyText(message);

      status.textContent = copied
        ? "Mensagem copiada! ✨"
        : "Não foi possível copiar automaticamente.";
    });

    openButton.addEventListener("click", async function () {
      const message = getGeneratedMessage();
      const username = getInstagramUsername();

      if (!message) {
        status.textContent =
          "Gere a mensagem primeiro.";
        return;
      }

      const copied = await copyText(message);

      if (username) {
        window.open(
          "https://www.instagram.com/" +
            encodeURIComponent(username) +
            "/",
          "_blank"
        );
      } else {
        window.open(
          "https://www.instagram.com/",
          "_blank"
        );
      }

      status.textContent = copied
        ? "Instagram aberto e mensagem copiada! Cole no Direct. 💌"
        : "Instagram aberto. Copie a mensagem manualmente.";
    });
  }

  function createAmbassadorSection() {
    if (document.querySelector("#osiris-ambassadors")) {
      return;
    }

    const section = document.createElement("section");

    section.id = "osiris-ambassadors";

    section.innerHTML = `
      <div class="osiris-ambassador-inner">
        <div class="osiris-lock-icon" id="osiris-lock-icon">
          🔒
        </div>

        <div class="osiris-ambassador-title">
          Embaixadores
        </div>

        <div
          class="osiris-ambassador-subtitle"
          id="osiris-ambassador-status"
        >
          Área exclusiva protegida.
        </div>

        <div
          class="osiris-countdown"
          id="osiris-countdown"
        >
          Carregando...
        </div>

        <button
          type="button"
          id="osiris-ambassador-button"
          class="osiris-ambassador-button"
          disabled
        >
          🔒 Acesso bloqueado
        </button>
      </div>
    `;

    document.body.appendChild(section);

    updateAmbassadorState();

    setInterval(updateAmbassadorState, 1000);
  }

  function updateAmbassadorState() {
    const section = document.querySelector(
      "#osiris-ambassadors"
    );

    if (!section) {
      return;
    }

    const now = Date.now();
    const unlocked = now >= AMBASSADOR_UNLOCK;

    const icon = section.querySelector(
      "#osiris-lock-icon"
    );

    const status = section.querySelector(
      "#osiris-ambassador-status"
    );

    const countdown = section.querySelector(
      "#osiris-countdown"
    );

    const button = section.querySelector(
      "#osiris-ambassador-button"
    );

    if (unlocked) {
      icon.textContent = "🔓";

      status.textContent =
        "A área de Embaixadores está desbloqueada.";

      countdown.textContent =
        "Acesso liberado ✨";

      button.disabled = false;

      button.textContent =
        "✨ Entrar como Embaixador";

      button.onclick = function () {
        const target =
          document.querySelector(
            "[data-ambassadors], #embaixadores, .embaixadores"
          );

        if (target) {
          target.scrollIntoView({
            behavior: "smooth"
          });
        } else {
          alert(
            "Área de Embaixadores desbloqueada! ✨"
          );
        }
      };

      return;
    }

    const remaining =
      AMBASSADOR_UNLOCK - now;

    const totalSeconds =
      Math.floor(remaining / 1000);

    const days =
      Math.floor(totalSeconds / 86400);

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

    icon.textContent = "🔒";

    status.textContent =
      "Uma área exclusiva está prestes a ser revelada.";

    countdown.textContent =
      `${days}d ${String(hours).padStart(2, "0")}h ` +
      `${String(minutes).padStart(2, "0")}m ` +
      `${String(seconds).padStart(2, "0")}s`;

    button.disabled = true;

    button.textContent =
      "🔒 Desbloqueia em 20/09 às 18:00";
  }

  function addStyles() {
    if (document.querySelector("#osiris-fix-styles")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "osiris-fix-styles";

    style.textContent = `
      #osiris-category-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        align-items: center;
        width: 100%;
        box-sizing: border-box;
        padding: 14px 10px;
        margin: 10px 0 20px;
        z-index: 20;
      }

      .osiris-category-button {
        border: 1px solid rgba(255,255,255,.25);
        border-radius: 999px;
        padding: 9px 15px;
        background: rgba(0,0,0,.08);
        color: inherit;
        cursor: pointer;
        font: inherit;
        transition: .2s ease;
      }

      .osiris-category-button:hover,
      .osiris-category-button.active {
        transform: translateY(-1px);
        opacity: .9;
      }

      #osiris-instagram-helper {
        display: flex;
        flex-direction: column;
        gap: 9px;
        margin-top: 15px;
        width: 100%;
        box-sizing: border-box;
      }

      .osiris-instagram-button {
        width: 100%;
        border: 0;
        border-radius: 12px;
        padding: 12px 16px;
        cursor: pointer;
        font: inherit;
        font-weight: 600;
        background: rgba(0,0,0,.08);
        color: inherit;
        transition: transform .2s ease, opacity .2s ease;
      }

      .osiris-instagram-button:hover {
        transform: translateY(-1px);
        opacity: .9;
      }

      .osiris-instagram-button.primary {
        font-weight: 700;
      }

      .osiris-instagram-status {
        min-height: 20px;
        text-align: center;
        font-size: .9rem;
        opacity: .8;
      }

      #osiris-ambassadors {
        width: 100%;
        box-sizing: border-box;
        padding: 45px 20px;
        margin: 50px 0 0;
        text-align: center;
      }

      .osiris-ambassador-inner {
        max-width: 700px;
        margin: auto;
        padding: 35px 20px;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,.18);
        background: rgba(0,0,0,.08);
        box-sizing: border-box;
      }

      .osiris-lock-icon {
        font-size: 42px;
        margin-bottom: 12px;
      }

      .osiris-ambassador-title {
        font-size: clamp(26px, 5vw, 42px);
        font-weight: 800;
        letter-spacing: .04em;
        margin-bottom: 10px;
      }

      .osiris-ambassador-subtitle {
        opacity: .75;
        margin-bottom: 18px;
      }

      .osiris-countdown {
        font-size: clamp(20px, 4vw, 32px);
        font-weight: 800;
        letter-spacing: .04em;
        margin: 15px 0 22px;
      }

      .osiris-ambassador-button {
        border: 0;
        border-radius: 999px;
        padding: 12px 22px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        background: rgba(255,255,255,.15);
        color: inherit;
      }

      .osiris-ambassador-button:disabled {
        cursor: not-allowed;
        opacity: .55;
      }

      @media (max-width: 600px) {
        #osiris-category-bar {
          justify-content: flex-start;
          overflow-x: auto;
          flex-wrap: nowrap;
        }

        .osiris-category-button {
          flex: 0 0 auto;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function initialize() {
    addStyles();
    organizeProducts();
    createCategoryBar();
    createInstagramButtons();
    createAmbassadorSection();
  }

  /*
   * Primeira execução.
   */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );
  } else {
    init
