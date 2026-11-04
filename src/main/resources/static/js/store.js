/* =========================================================
   Porto Máquinas — script da loja (páginas públicas)
   Separado do common.js do painel admin.
   ========================================================= */

const STORE_CONFIG = {
    // Endpoint que devolve a lista de produtos/anúncios em JSON
    apiUrl: "/api/products",

    // Número do WhatsApp com DDI + DDD, só dígitos (ex.: 5548999999999)
    whatsappNumber: "5548999999999",

    // Mensagem padrão dos botões gerais de WhatsApp
    defaultMessage: "Olá! Vim pelo site da Porto Máquinas e gostaria de mais informações.",

    // Abaixo desta quantidade aparece o selo "Últimas unidades"
    lowStockThreshold: 3,

    // Se a API falhar, mostra produtos de exemplo (deixe false em produção)
    useDemoOnError: true,
};

const DEMO_PRODUCTS = [
    { id: "FUR-001", title: "Furadeira de Impacto 750W", addescription: "Furadeira com mandril de 1/2\" e velocidade variável.", price: 389.9, qtt: 8, imgspath: [] },
    { id: "ESM-014", title: "Esmerilhadeira Angular 4.1/2\" 850W", addescription: "Ideal para corte e desbaste em metal.", price: 279.0, qtt: 2, imgspath: [] },
    { id: "SER-210", title: "Serra Circular 7.1/4\" 1400W", addescription: "Corte preciso em madeira com guia paralela.", price: 549.9, qtt: 0, imgspath: [] },
    { id: "COM-050", title: "Compressor de Ar 50L 2HP", addescription: "Compressor para pintura, calibragem e ferramentas pneumáticas.", price: 1899.0, qtt: 4, imgspath: [] },
    { id: "PEC-332", title: "Jogo de Escovas de Carvão", addescription: "Peça de reposição para motores universais.", price: 34.5, qtt: 20, imgspath: [] },
    { id: "LOC-900", title: "Betoneira 400L (aluguel)", addescription: "Locação diária ou semanal. Consulte disponibilidade.", price: null, qtt: 1, imgspath: [] },
];

const state = {
    products: [],
    search: "",
    sort: "relevance",
};

/* ---------- Utilidades ---------- */

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizeText(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function whatsappLink(message) {
    return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// Aceita os nomes de coluna do banco (pname, title, addescription, imgspath...)
// e também nomes em camelCase, caso o backend mude.
function normalizeProduct(raw) {
    const images = raw.imgspath ?? raw.imgsPath ?? raw.images ?? [];
    const price = raw.price === null || raw.price === undefined ? null : Number(raw.price);
    const stock = raw.qtt ?? raw.quantity ?? null;

    return {
        id: raw.productid ?? raw.productId ?? raw.id ?? "",
        name: raw.title ?? raw.pname ?? raw.pName ?? raw.name ?? "Produto",
        description: raw.addescription ?? raw.description ?? "",
        price: Number.isFinite(price) ? price : null,
        stock: stock === null ? null : Number(stock),
        images: Array.isArray(images) ? images : [],
    };
}

/* ---------- Dados ---------- */

async function loadProducts() {
    renderSkeleton(8);

    try {
        const response = await fetch(STORE_CONFIG.apiUrl, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const list = Array.isArray(data) ? data : data.content ?? data.products ?? [];
        state.products = list.map(normalizeProduct);
    } catch (error) {
        console.warn("Não foi possível carregar os produtos:", error);

        if (STORE_CONFIG.useDemoOnError) {
            state.products = DEMO_PRODUCTS.map(normalizeProduct);
        } else {
            state.products = [];
            document.getElementById("product-count").textContent =
                "Não foi possível carregar os produtos. Tente novamente mais tarde.";
            document.getElementById("product-grid").innerHTML = "";
            return;
        }
    }

    render();
}

function getVisibleProducts() {
    const term = normalizeText(state.search.trim());

    let list = state.products.filter((p) => {
        if (!term) return true;
        return normalizeText(`${p.name} ${p.description} ${p.id}`).includes(term);
    });

    const byPrice = (a, b, dir) => {
        // Produtos sem preço ("sob consulta") sempre vão para o fim
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return (a.price - b.price) * dir;
    };

    switch (state.sort) {
        case "price-asc":  list = [...list].sort((a, b) => byPrice(a, b, 1)); break;
        case "price-desc": list = [...list].sort((a, b) => byPrice(a, b, -1)); break;
        case "name":       list = [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")); break;
    }

    return list;
}

/* ---------- Renderização ---------- */

function productCardHtml(p) {
    const outOfStock = p.stock !== null && p.stock <= 0;
    const lowStock = !outOfStock && p.stock !== null && p.stock <= STORE_CONFIG.lowStockThreshold;

    const badge = outOfStock
        ? '<span class="badge badge--out">Esgotado</span>'
        : lowStock
            ? '<span class="badge badge--low">Últimas unidades</span>'
            : "";

    const media = p.images.length
        ? `<img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" loading="lazy">`
        : '<div class="product-card__noimg">Sem imagem</div>';

    const price = p.price !== null
        ? `<p class="product-card__price">${priceFormatter.format(p.price)}</p>`
        : '<p class="product-card__price product-card__price--consult">Preço sob consulta</p>';

    const message = outOfStock
        ? `Olá! O produto "${p.name}" (cód. ${p.id}) vai voltar ao estoque?`
        : `Olá! Tenho interesse no produto "${p.name}" (cód. ${p.id}).`;

    const buttonLabel = outOfStock ? "Avise-me pelo WhatsApp" : "Comprar pelo WhatsApp";

    return `
        <article class="product-card">
            <div class="product-card__media">
                ${media}
                ${badge}
            </div>
            <div class="product-card__body">
                ${p.id ? `<span class="product-card__code">Cód. ${escapeHtml(p.id)}</span>` : ""}
                <h3 class="product-card__name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
                ${p.description ? `<p class="product-card__desc">${escapeHtml(p.description)}</p>` : ""}
                ${price}
                <div class="product-card__actions">
                    <a class="btn btn--whatsapp btn--block" href="${whatsappLink(message)}" target="_blank" rel="noopener">
                        ${buttonLabel}
                    </a>
                </div>
            </div>
        </article>`;
}

function renderSkeleton(count) {
    const card = `
        <div class="product-card product-card--skeleton" aria-hidden="true">
            <div class="product-card__media"></div>
            <div class="product-card__body">
                <div class="skeleton-line skeleton-line--short"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line skeleton-line--price"></div>
            </div>
        </div>`;
    document.getElementById("product-grid").innerHTML = card.repeat(count);
}

function render() {
    const grid = document.getElementById("product-grid");
    const count = document.getElementById("product-count");
    const empty = document.getElementById("empty-state");

    const list = getVisibleProducts();

    grid.innerHTML = list.map(productCardHtml).join("");
    empty.hidden = list.length > 0;

    const total = list.length;
    count.textContent = state.search
        ? `${total} resultado${total === 1 ? "" : "s"} para "${state.search}"`
        : `${total} produto${total === 1 ? "" : "s"}`;
}

/* ---------- Eventos ---------- */

function setupSearch() {
    const form = document.getElementById("search-form");
    const input = document.getElementById("search-input");
    let debounce;

    input.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            state.search = input.value;
            render();
        }, 200);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        state.search = input.value;
        render();
        document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("clear-search").addEventListener("click", () => {
        input.value = "";
        state.search = "";
        render();
        input.focus();
    });
}

function setupSort() {
    document.getElementById("sort-select").addEventListener("change", (event) => {
        state.sort = event.target.value;
        render();
    });
}

function setupMenu() {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("main-nav");

    toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
        }
    });
}

function setupWhatsappLinks() {
    document.querySelectorAll("[data-whatsapp]").forEach((link) => {
        const message = link.dataset.whatsapp || STORE_CONFIG.defaultMessage;
        link.href = whatsappLink(message);
    });
}

/* ---------- Início ---------- */

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    setupWhatsappLinks();
    setupMenu();
    setupSearch();
    setupSort();
    loadProducts();
});