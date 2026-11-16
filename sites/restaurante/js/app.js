/* =========================================================
   Casa Brasa — site de demonstração
   TUDO o que muda de um cliente para outro fica neste CONFIG:
   nome, contatos, recursos ligados/desligados e o cardápio.
   Serve para restaurante, hamburgueria, pizzaria, bistrô, café…
   ========================================================= */
const CONFIG = {
  nome: "Casa Brasa",
  slogan: "cozinha de fogo",
  whatsapp: "5511900000000",                 // DDI + DDD + número, só dígitos
  telefone: "(11) 90000-0000",
  endereco: "Rua das Laranjeiras, 88 — Centro",
  horario: "Ter a dom · 12h às 15h e 19h às 23h",
  horarioCurto: "12h às 15h · 19h às 23h",
  instagram: "@casabrasa",

  // Liga/desliga recursos conforme o negócio
  pedidos: true,   // sacola + pedido pelo WhatsApp (delivery/retirada)
  reservas: true,  // seção e formulário de reservas

  // Cardápio. tags: "Vegetariano", "Da casa". destaque: true → "Pratos da casa"
  cardapio: [
    {
      categoria: "Entradas",
      itens: [
        { nome: "Pão de fermentação natural", desc: "Servido com manteiga de ervas e flor de sal.", preco: 24, tags: ["Vegetariano"] },
        { nome: "Burrata e tomates assados", desc: "Burrata cremosa, tomates na brasa, pesto de manjericão e torradas.", preco: 58, tags: ["Vegetariano"] },
        { nome: "Croquetas de costela", desc: "Costela desfiada cozida por 12 horas, com maionese defumada.", preco: 42, tags: ["Da casa"] },
        { nome: "Provoleta na brasa", desc: "Provolone derretido na parrilla, orégano fresco e mel picante.", preco: 46 },
      ],
    },
    {
      categoria: "Na brasa",
      itens: [
        { nome: "Ancho na brasa", desc: "350 g de ancho maturado, farofa de alho e legumes na parrilla.", preco: 129, tags: ["Da casa"], destaque: true, icone: "i-flame" },
        { nome: "Picanha fatiada", desc: "300 g de picanha, arroz biro-biro e vinagrete.", preco: 119 },
        { nome: "Galeto desossado", desc: "Marinado em limão-siciliano e ervas, com batatas rústicas.", preco: 84 },
        { nome: "Peixe do dia na folha", desc: "Assado na folha de bananeira, com purê de mandioquinha.", preco: 112, destaque: true, icone: "i-leaf" },
      ],
    },
    {
      categoria: "Burgers",
      intro: "Pão brioche da casa e batata rústica em todos os burgers.",
      itens: [
        { nome: "Brasa burger", desc: "Blend de 180 g, cheddar inglês, cebola caramelizada e maionese da casa.", preco: 52, tags: ["Da casa"], destaque: true, icone: "i-burger" },
        { nome: "Smash duplo", desc: "Dois smash de 90 g, queijo prato, picles e molho especial.", preco: 46 },
        { nome: "Costela defumada", desc: "Costela desfiada, queijo coalho, barbecue de rapadura e rúcula.", preco: 58 },
        { nome: "Grão-de-bico", desc: "Burger vegetal, queijo, tomate, alface e maionese de ervas.", preco: 44, tags: ["Vegetariano"] },
      ],
    },
    {
      categoria: "Massas",
      itens: [
        { nome: "Ravioli de costela", desc: "Massa fresca recheada, molho de tomate assado e parmesão.", preco: 78, tags: ["Da casa"] },
        { nome: "Risoto de cogumelos", desc: "Arbóreo, mix de cogumelos frescos e azeite trufado.", preco: 89, tags: ["Vegetariano"] },
        { nome: "Fettuccine na manteiga", desc: "Manteiga de sálvia, limão-siciliano e parmesão 24 meses.", preco: 68, tags: ["Vegetariano"] },
      ],
    },
    {
      categoria: "Sobremesas",
      itens: [
        { nome: "Pudim de doce de leite", desc: "Textura lisa, calda de caramelo e flor de sal.", preco: 28, tags: ["Da casa"] },
        { nome: "Petit gâteau", desc: "Chocolate meio amargo com sorvete de creme.", preco: 34 },
        { nome: "Banana na brasa", desc: "Com sorvete de canela e farofa doce.", preco: 30 },
      ],
    },
    {
      categoria: "Bebidas",
      itens: [
        { nome: "Limonada siciliana", desc: "Feita na hora, 400 ml.", preco: 16 },
        { nome: "Soda italiana", desc: "Maçã verde, frutas vermelhas ou tangerina.", preco: 18 },
        { nome: "Chope", desc: "Pilsen, 300 ml.", preco: 14 },
        { nome: "Taça de vinho da casa", desc: "Tinto ou branco. Carta completa no salão.", preco: 32 },
      ],
    },
  ],
};

/* ---------- Utilitários ---------- */
document.documentElement.classList.add("js");
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const waLink = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));


/* ---------- Dados do cliente na página ---------- */
$$("[data-cfg]").forEach((el) => { const v = CONFIG[el.dataset.cfg]; if (v) el.textContent = v; });
$$("[data-wa]").forEach((a) => { a.href = waLink(`Olá, ${CONFIG.nome}! Vim pelo site.`); a.target = "_blank"; a.rel = "noopener"; });
$("#mapsLink").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.endereco)}`;
$$("[data-feature]").forEach((el) => { if (!CONFIG[el.dataset.feature]) el.hidden = true; });
$("#ano").textContent = new Date().getFullYear();

/* ---------- Menu lateral ---------- */
const burger = $("#burger"), side = $("#side");
const setMenu = (open) => {
  side.hidden = !open;
  burger.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("no-scroll", open);
  if (open) $("#sideClose").focus();
};
burger.addEventListener("click", () => setMenu(true));
$("#sideClose").addEventListener("click", () => setMenu(false));
side.addEventListener("click", (e) => { if (e.target === side || e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

/* Botão de eventos: abre o WhatsApp com a mensagem pronta */
$("#eventoBtn").href = waLink(`Olá, ${CONFIG.nome}! Gostaria de informações para fazer um evento.`);
$("#eventoBtn").target = "_blank";

/* ---------- Cardápio ---------- */
const itens = {};
CONFIG.cardapio.forEach((cat, ci) => cat.itens.forEach((it, ii) => { it.id = `${ci}-${ii}`; itens[it.id] = it; }));
const carrinho = {};

const tagsHtml = (tags = []) => tags.map((t) => `<span class="tag ${t === "Vegetariano" ? "tag--veg" : "tag--house"}">${esc(t)}</span>`).join("");
const controleHtml = (id) => {
  if (!CONFIG.pedidos) return "";
  const q = carrinho[id] || 0;
  return q
    ? `<span class="qty" data-id="${id}"><button type="button" data-act="dec" aria-label="Remover um"><svg><use href="#i-minus"/></svg></button><output>${q}</output><button type="button" data-act="inc" aria-label="Adicionar mais um"><svg><use href="#i-plus"/></svg></button></span>`
    : `<button type="button" class="add-btn" data-id="${id}" data-act="inc"><svg><use href="#i-plus"/></svg>Adicionar</button>`;
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
      <span class="item__price">${brl(it.preco)}</span>
      <p class="item__desc">${esc(it.desc)}</p>
      <div class="item__actions">${controleHtml(it.id)}</div>
    </article>`).join("");
}
tabs.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  catAtual = +b.dataset.cat;
  $$("[data-cat]", tabs).forEach((t) => t.setAttribute("aria-selected", String(t === b)));
  renderMenu();
});

const destaques = Object.values(itens).filter((i) => i.destaque).slice(0, 3);
function renderDestaques() {
  $("#destaques").innerHTML = destaques.map((it) => `
    <article class="tall">
      <div class="tall__photo photo-like"></div>
      <span class="tall__label"><svg><use href="#i-camera"/></svg>Foto do prato</span>
      <div class="tall__body">
        <div><h3>${esc(it.nome)}</h3><span class="tall__price">${brl(it.preco)}</span></div>
        ${controleHtml(it.id)}
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

/* ---------- Reservas ---------- */
const reserva = $("#reservaForm");
const hoje = new Date(); hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
reserva.elements.data.min = hoje.toISOString().slice(0, 10);
const fone = reserva.elements.fone;
fone.addEventListener("input", () => {
  const d = fone.value.replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  fone.value = out;
});
reserva.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = reserva.elements;
  const ok = { nome: f.nome.value.trim().length >= 2, fone: f.fone.value.replace(/\D/g, "").length >= 10, data: !!f.data.value };
  Object.entries(ok).forEach(([k, v]) => f[k].classList.toggle("is-invalid", !v));
  $("#reservaErro").hidden = ok.nome && ok.fone && ok.data;
  if (!(ok.nome && ok.fone && ok.data)) return;
  const linhas = [`Olá, ${CONFIG.nome}! Gostaria de reservar uma mesa.`, "",
    `*Nome:* ${f.nome.value.trim()}`, `*WhatsApp:* ${f.fone.value}`,
    `*Data:* ${f.data.value.split("-").reverse().join("/")}`, `*Horário:* ${f.hora.value}`, `*Pessoas:* ${f.pessoas.value}`];
  if (f.ocasiao.value) linhas.push(`*Ocasião:* ${f.ocasiao.value}`);
  window.open(waLink(linhas.join("\n")), "_blank", "noopener");
});

renderMenu(); renderDestaques(); renderCarrinho();

/* ---------- Animações ---------- */
const header = $(".header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

const alvos = ".tagline p, .feature, .title, .title-row__note, .tabs, .tall, .events__inner > *, .story__box, .reserve__copy, #reservaForm, .gallery figure, .footer__col";
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
  : null;
tabs.addEventListener("click", () => { menu.classList.add("anim"); clearTimeout(menu._t); menu._t = setTimeout(() => menu.classList.remove("anim"), 800); });
$$(alvos).forEach((el) => {
  const irmaos = [...el.parentElement.children].filter((x) => x.matches(alvos));
  el.style.transitionDelay = `${(irmaos.indexOf(el) % 4) * 90}ms`;
  el.classList.add("reveal");
  io ? io.observe(el) : el.classList.add("is-in");
});
