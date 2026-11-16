/* =========================================================
   Grão & Prosa — site de demonstração
   TUDO o que muda de um cliente para outro fica neste CONFIG:
   nome, contatos, recursos e o cardápio.
   Serve para cafeteria, padaria, confeitaria, casa de chá…
   ========================================================= */
const CONFIG = {
  nome: "Grão & Prosa",
  slogan: "Cafés especiais",
  whatsapp: "5511900000000",                 // DDI + DDD + número, só dígitos
  telefone: "(11) 90000-0000",
  endereco: "Rua dos Ipês, 214 — Centro",
  horarioCurto: "7h às 20h",
  cafeDoDia: "Mantiqueira · notas de chocolate",
  instagram: "@graoeprosa",

  pedidos: true, // sacola + pedido pelo WhatsApp (delivery/retirada)

  // Cardápio. tags: "vegano", "da casa". destaque: true → "O que todo mundo pede"
  cardapio: [
    {
      categoria: "Cafés",
      itens: [
        { nome: "Espresso", desc: "Café da semana, extração curta e encorpada.", preco: 7 },
        { nome: "Cappuccino", desc: "Espresso, leite vaporizado e espuma cremosa.", preco: 13, destaque: true, icone: "i-cup" },
        { nome: "Latte de doce de leite", desc: "Espresso, leite e doce de leite caseiro.", preco: 16, tags: ["da casa"] },
        { nome: "Coado na V60", desc: "Método filtrado que realça as notas do café do dia.", preco: 12 },
        { nome: "Mocha", desc: "Espresso, chocolate 50% cacau e leite vaporizado.", preco: 15 },
        { nome: "Chai latte", desc: "Chá preto com especiarias e leite vaporizado.", preco: 14 },
      ],
    },
    {
      categoria: "Gelados",
      itens: [
        { nome: "Cold brew", desc: "Extração a frio por 18 horas, servido com gelo.", preco: 14, tags: ["vegano"] },
        { nome: "Iced latte", desc: "Espresso duplo, leite gelado e gelo.", preco: 15 },
        { nome: "Frappé de caramelo", desc: "Café batido com caramelo salgado e chantilly.", preco: 19 },
        { nome: "Tônica com espresso", desc: "Água tônica, laranja e um shot de espresso.", preco: 16, tags: ["vegano"] },
      ],
    },
    {
      categoria: "Salgados",
      itens: [
        { nome: "Pão de queijo", desc: "Porção com 6 unidades, saindo do forno.", preco: 14, tags: ["da casa"], destaque: true, icone: "i-croissant" },
        { nome: "Croissant de presunto e queijo", desc: "Massa folhada amanteigada, assado na hora.", preco: 18 },
        { nome: "Tostex de queijo", desc: "Pão de fermentação natural e três queijos.", preco: 22 },
        { nome: "Quiche de alho-poró", desc: "Fatia generosa com salada verde.", preco: 24 },
      ],
    },
    {
      categoria: "Doces",
      itens: [
        { nome: "Bolo de cenoura com chocolate", desc: "Fatia do bolo de vó, com cobertura cremosa.", preco: 14, tags: ["da casa"], destaque: true, icone: "i-cake" },
        { nome: "Cookie de chocolate", desc: "Crocante por fora e macio por dentro.", preco: 10 },
        { nome: "Brownie", desc: "Chocolate meio amargo e nozes.", preco: 13 },
        { nome: "Banana bread", desc: "Com canela e castanhas. Sem lactose.", preco: 12, tags: ["vegano"] },
      ],
    },
    {
      categoria: "Grãos",
      intro: "Pacotes de 250 g, em grãos ou moídos na hora para o seu método.",
      itens: [
        { nome: "Mantiqueira", desc: "Notas de chocolate e castanhas. Corpo médio.", preco: 42 },
        { nome: "Sul de Minas", desc: "Notas de caramelo e frutas amarelas.", preco: 39 },
        { nome: "Cerrado", desc: "Notas de rapadura e cacau. Corpo alto.", preco: 38 },
      ],
    },
  ],
};

/* ---------- Utilitários ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const waLink = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
document.documentElement.classList.add("js");

/* ---------- Dados do cliente ---------- */
$$("[data-cfg]").forEach((el) => { const v = CONFIG[el.dataset.cfg]; if (v) el.textContent = v; });
$$("[data-wa]").forEach((a) => { a.href = waLink(`Olá, ${CONFIG.nome}! Vim pelo site.`); a.target = "_blank"; a.rel = "noopener"; });
$("#mapsLink").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.endereco)}`;
$("#encomendaBtn").href = waLink(`Olá, ${CONFIG.nome}! Gostaria de fazer uma encomenda (bolo ou cesta de café da manhã).`);
$("#encomendaBtn").target = "_blank";
$$("[data-feature]").forEach((el) => { if (!CONFIG[el.dataset.feature]) el.hidden = true; });
$("#ano").textContent = new Date().getFullYear();

/* ---------- Header e menu mobile ---------- */
const header = $(".header"), burger = $("#burger"), nav = $("#nav");
const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 24);
onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
const setMenu = (open) => {
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  nav.classList.toggle("is-open", open);
  header.classList.toggle("menu-open", open);
  document.body.classList.toggle("no-scroll", open);
};
burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
$$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

/* ---------- Revelar ao rolar ---------- */
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
  : null;
$$(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 80}ms`; io ? io.observe(el) : el.classList.add("is-in"); });

/* ---------- Cardápio (lousa) ---------- */
const itens = {};
CONFIG.cardapio.forEach((cat, ci) => cat.itens.forEach((it, ii) => { it.id = `${ci}-${ii}`; itens[it.id] = it; }));
const carrinho = {};

const tagsHtml = (tags = []) => tags.map((t) => `<span class="tag ${t === "vegano" ? "tag--veg" : "tag--house"}">${esc(t)}</span>`).join("");
const controleHtml = (id) => {
  if (!CONFIG.pedidos) return "";
  const q = carrinho[id] || 0;
  return q
    ? `<span class="qty" data-id="${id}"><button type="button" data-act="dec" aria-label="Remover um"><svg><use href="#i-minus"/></svg></button><output>${q}</output><button type="button" data-act="inc" aria-label="Adicionar mais um"><svg><use href="#i-plus"/></svg></button></span>`
    : `<button type="button" class="add-btn" data-id="${id}" data-act="inc" aria-label="Adicionar ${esc(itens[id].nome)}"><svg><use href="#i-plus"/></svg></button>`;
};

const tabs = $("#menuTabs"), menu = $("#menu"), intro = $("#menuIntro");
let catAtual = 0;
tabs.innerHTML = CONFIG.cardapio.map((c, i) => `<button role="tab" type="button" data-cat="${i}" aria-selected="${i === 0}">${esc(c.categoria)}</button>`).join("");
function renderMenu() {
  const cat = CONFIG.cardapio[catAtual];
  intro.hidden = !cat.intro; intro.textContent = cat.intro || "";
  menu.innerHTML = cat.itens.map((it) => `
    <article class="item">
      <h3 class="item__name">${esc(it.nome)}${tagsHtml(it.tags)}</h3>
      <span class="item__dots" aria-hidden="true"></span>
      <span class="item__price">${brl(it.preco)}</span>
      <div class="item__actions">${controleHtml(it.id)}</div>
      <p class="item__desc">${esc(it.desc)}</p>
    </article>`).join("");
}
tabs.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  catAtual = +b.dataset.cat;
  $$("[data-cat]", tabs).forEach((t) => t.setAttribute("aria-selected", String(t === b)));
  renderMenu();
  menu.classList.add("anim"); clearTimeout(menu._t); menu._t = setTimeout(() => menu.classList.remove("anim"), 900);
});

const destaques = Object.values(itens).filter((i) => i.destaque).slice(0, 3);
function renderDestaques() {
  $("#destaques").innerHTML = destaques.map((it) => `
    <article class="dish">
      <figure class="dish__photo"><span class="dish__badge">Mais pedido</span><svg><use href="#${it.icone || "i-camera"}"/></svg><figcaption>Foto do produto</figcaption></figure>
      <div class="dish__body">
        <div class="dish__top"><h3>${esc(it.nome)}</h3><span class="dish__price">${brl(it.preco)}</span></div>
        <p>${esc(it.desc)}</p>
        <div>${controleHtml(it.id)}</div>
      </div>
    </article>`).join("");
}
if (!destaques.length) $("#destaquesSec").hidden = true;

/* ---------- Sacola e pedido ---------- */
const cartbar = $("#cartbar"), dialog = $("#cart");
const totais = () => Object.entries(carrinho).reduce((a, [id, q]) => ({ qtd: a.qtd + q, total: a.total + q * itens[id].preco }), { qtd: 0, total: 0 });
function renderCarrinho() {
  const { qtd, total } = totais();
  cartbar.hidden = qtd === 0;
  document.body.classList.toggle("has-cart", qtd > 0);
  $("#cartCount").textContent = qtd;
  $("#cartTotal").textContent = brl(total);
  $("#cartTotal2").textContent = brl(total);
  const linhas = Object.entries(carrinho);
  $("#cartList").innerHTML = linhas.length
    ? linhas.map(([id, q]) => `<li><strong>${esc(itens[id].nome)}</strong><span class="cart__price">${brl(q * itens[id].preco)}</span><span>${controleHtml(id)}</span></li>`).join("")
    : `<li class="cart__empty">Seu pedido está vazio.</li>`;
}
function alterar(id, delta) {
  carrinho[id] = (carrinho[id] || 0) + delta;
  if (carrinho[id] <= 0) delete carrinho[id];
  renderMenu(); renderDestaques(); renderCarrinho();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  alterar(b.dataset.id || b.closest("[data-id]").dataset.id, b.dataset.act === "inc" ? 1 : -1);
});
$("#openCart").addEventListener("click", () => dialog.showModal());
dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

const pedidoForm = $("#pedidoForm"), enderecoField = $("#enderecoField");
pedidoForm.addEventListener("change", () => { enderecoField.hidden = pedidoForm.elements.tipo.value !== "Entrega"; });
pedidoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = pedidoForm.elements, entrega = f.tipo.value === "Entrega";
  const nomeOk = f.nome.value.trim().length >= 2, endOk = !entrega || f.endereco.value.trim().length >= 6;
  f.nome.classList.toggle("is-invalid", !nomeOk);
  f.endereco.classList.toggle("is-invalid", !endOk);
  $("#pedidoErro").hidden = nomeOk && endOk;
  if (!(nomeOk && endOk) || !totais().qtd) return;
  const linhas = [`Olá, ${CONFIG.nome}! Gostaria de fazer um pedido:`, ""];
  for (const [id, q] of Object.entries(carrinho)) linhas.push(`${q}x ${itens[id].nome} — ${brl(q * itens[id].preco)}`);
  linhas.push("", `*Total:* ${brl(totais().total)}`, `*Nome:* ${f.nome.value.trim()}`, `*Tipo:* ${f.tipo.value}`);
  if (entrega) linhas.push(`*Endereço:* ${f.endereco.value.trim()}`);
  linhas.push(`*Pagamento:* ${f.pagamento.value}`);
  if (f.obs.value.trim()) linhas.push(`*Observações:* ${f.obs.value.trim()}`);
  window.open(waLink(linhas.join("\n")), "_blank", "noopener");
});

renderMenu(); renderDestaques(); renderCarrinho();
