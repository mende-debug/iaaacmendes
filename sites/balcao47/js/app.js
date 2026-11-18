/* =========================================================
   Balcão 47 — cardápio digital (para o QR code da mesa)
   TUDO o que muda de um cliente para outro fica neste CONFIG:
   nome, contatos e o cardápio inteiro.
   Fotos: coloque o arquivo em img/ e preencha foto: "img/smash.jpg".
   Sem foto, aparece um espaço reservado.
   ========================================================= */
const CONFIG = {
  nome: "Balcão",
  numero: "47",
  slogan: "Smash na chapa, porções pra dividir, chope tirado na hora e drinks autorais.",
  whatsapp: "",                         // DDI + DDD + número, só dígitos (ex.: 5511999998888). "" esconde o botão
  instagram: "",                        // ex.: "@balcao47". "" esconde
  endereco: "",                         // "" esconde
  horario: "",                          // ex.: "Ter a dom · 17h à 0h". "" esconde
  rodape: "Preços em reais · Taxa de serviço opcional (10%)",
  avisoBebidas: "Beba com moderação · Proibida a venda para menores de 18 anos",

  // Selos opcionais: maisPedido: true → "Mais pedido" · serve: "2–3" → "Serve 2–3"
  //                  veg: true → "Vegetariano" · semAlcool: true → "Sem álcool"
  cardapio: [
    {
      id: "lanches",
      categoria: "Lanches",
      nota: "no pão brioche ou francês tostado",
      itens: [
        { nome: "Smash da casa", desc: "Dois smash de 90g, cheddar inglês, cebola caramelizada e maionese defumada no brioche.", preco: 34, maisPedido: true },
        { nome: "Choripán", desc: "Linguiça artesanal na brasa, chimichurri da casa e vinagrete no pão francês.", preco: 29 },
        { nome: "Sanduba de costela", desc: "Costela desfiada 12h, queijo coalho grelhado e picles de cebola roxa.", preco: 38 },
        { nome: "Frango crocante", desc: "Sobrecoxa empanada, slaw de repolho e molho de mel com pimenta.", preco: 32 },
        { nome: "Veggie brasa", desc: "Burger de grão-de-bico, queijo prato, tomate assado e rúcula.", preco: 30 },
      ],
    },
    {
      id: "porcoes",
      categoria: "Porções",
      nota: "pra dividir com a mesa",
      itens: [
        { nome: "Bolinho de feijoada", desc: "12 unidades com couve crispy e geleia de pimenta.", preco: 42, serve: "2–3", maisPedido: true },
        { nome: "Batata rústica", desc: "Com casca, páprica defumada e aioli de alho assado.", preco: 32, serve: "2–3" },
        { nome: "Torresmo de rolo", desc: "Pururuca por fora, macio por dentro. Limão e farofa.", preco: 39, serve: "2–3" },
        { nome: "Isca de tilápia", desc: "Empanada na farinha panko com tártaro de ervas.", preco: 54, serve: "3" },
        { nome: "Calabresa acebolada", desc: "Na chapa com cebola tostada e pão de alho.", preco: 36, serve: "2–3" },
        { nome: "Tábua da casa", desc: "Costelinha, linguiça na brasa, mandioca frita e vinagrete.", preco: 89, serve: "4" },
      ],
    },
    {
      id: "chopes",
      categoria: "Chopes",
      nota: "tirado na hora",
      lista: true, // sem foto por item: layout de lista com pontilhado
      itens: [
        { nome: "Pilsen 500ml", desc: "Leve, dourado e bem gelado.", preco: 16, maisPedido: true },
        { nome: "IPA 500ml", desc: "Amargor marcante, aroma cítrico.", preco: 22 },
        { nome: "Weiss 500ml", desc: "Trigo, notas de banana e cravo.", preco: 20 },
        { nome: "Balde 5 long necks", desc: "Marcas da casa, no gelo.", preco: 60 },
      ],
    },
    {
      id: "drinks",
      categoria: "Drinks",
      nota: "autorais e clássicos",
      aviso: true,
      itens: [
        { nome: "Caipi maracujá & pimenta", desc: "Cachaça, maracujá e dedo-de-moça.", preco: 26, maisPedido: true },
        { nome: "Caipirinha de limão", desc: "Cachaça, vodka ou saquê.", preco: 22 },
        { nome: "Gin tônica tropical", desc: "Abacaxi tostado e alecrim.", preco: 32 },
        { nome: "Negroni", desc: "Gin, vermute rosso e bitter.", preco: 34 },
        { nome: "Rabo de galo", desc: "Cachaça e vermute. Clássico de boteco.", preco: 24 },
        { nome: "Soda italiana", desc: "Sem álcool: frutas vermelhas e gás.", preco: 16 },
      ],
    },
  ],
};

/* ---------- daqui para baixo não precisa mexer ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const preco = (v) => "R$ " + (Number.isInteger(v) ? v : v.toFixed(2).replace(".", ","));
const semAcento = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function selos(it) {
  const s = [];
  if (it.maisPedido) s.push('<span class="selo selo--hot">Mais pedido</span>');
  if (it.serve) s.push(`<span class="selo">Serve ${esc(it.serve)}</span>`);
  if (it.veg) s.push('<span class="selo">Vegetariano</span>');
  if (it.semAlcool) s.push('<span class="selo">Sem álcool</span>');
  return s.length ? `<div class="selos">${s.join("")}</div>` : "";
}

function foto(it) {
  return it.foto
    ? `<img class="item__foto" src="${esc(it.foto)}" alt="" loading="lazy">`
    : '<div class="item__foto item__foto--vazia" aria-hidden="true">Foto</div>';
}

function itemHTML(it, i, lista) {
  const busca = esc(semAcento(it.nome + " " + it.desc));
  if (lista) {
    return `<li class="linha" data-busca="${busca}">
      <div class="linha__topo"><h3>${esc(it.nome)}</h3><span class="linha__pont" aria-hidden="true"></span><span class="preco">${preco(it.preco)}</span></div>
      <p>${esc(it.desc)}</p>${selos(it)}</li>`;
  }
  return `<li class="item" data-busca="${busca}">
    ${foto(it)}
    <div class="item__txt">
      <span class="item__num">${String(i + 1).padStart(2, "0")}</span>
      <div class="item__topo"><h3>${esc(it.nome)}</h3><span class="preco">${preco(it.preco)}</span></div>
      <p>${esc(it.desc)}</p>${selos(it)}
    </div></li>`;
}

function montar() {
  document.title = `${CONFIG.nome} ${CONFIG.numero} — Cardápio`;
  $("#marca").innerHTML = `${esc(CONFIG.nome)} <b>${esc(CONFIG.numero)}</b>`;
  $("#hero-nome").textContent = CONFIG.nome;
  $("#hero-num").textContent = CONFIG.numero;
  $("#hero-slogan").textContent = CONFIG.slogan;

  $("#abas").innerHTML = CONFIG.cardapio
    .map((c, i) => `<a href="#${c.id}" data-id="${c.id}"><span>${String(i + 1).padStart(2, "0")}</span>${esc(c.categoria)}</a>`)
    .join("");

  $("#secoes").innerHTML = CONFIG.cardapio
    .map((c, n) => `<section class="secao" id="${c.id}" aria-labelledby="t-${c.id}">
      <header class="secao__cab">
        <span class="secao__idx">${String(n + 1).padStart(2, "0")} / ${esc(c.categoria)}</span>
        <h2 id="t-${c.id}">${esc(c.categoria)}</h2>
        ${c.nota ? `<p class="secao__nota">${esc(c.nota)}</p>` : ""}
        <span class="secao__qtd">${c.itens.length} opções</span>
      </header>
      <ul class="${c.lista ? "lista" : "itens"}">${c.itens.map((it, i) => itemHTML(it, i, c.lista)).join("")}</ul>
      ${c.aviso ? `<p class="aviso">${esc(CONFIG.avisoBebidas)}</p>` : ""}
    </section>`)
    .join("");

  const info = [CONFIG.endereco, CONFIG.horario, CONFIG.instagram].filter(Boolean).map((t) => `<li>${esc(t)}</li>`).join("");
  $("#rodape-info").innerHTML = info;
  $("#rodape-nota").textContent = CONFIG.rodape;

  const w = $("#whats");
  if (CONFIG.whatsapp) {
    const msg = encodeURIComponent(`Olá, ${CONFIG.nome} ${CONFIG.numero}!`);
    w.href = `https://wa.me/${CONFIG.whatsapp}?text=${msg}`;
  } else w.hidden = true;
}

/* Aba ativa conforme a rolagem */
function abaAtiva() {
  const barra = $("#abas");
  const links = [...barra.querySelectorAll("a")];
  const marcar = (id) => {
    links.forEach((a) => {
      const on = a.dataset.id === id;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      if (on) barra.scrollTo({ left: a.offsetLeft - (barra.clientWidth - a.offsetWidth) / 2, behavior: "smooth" });
    });
  };
  const obs = new IntersectionObserver(
    (ents) => ents.forEach((e) => e.isIntersecting && marcar(e.target.id)),
    { rootMargin: "-30% 0px -65% 0px" }
  );
  document.querySelectorAll(".secao").forEach((s) => obs.observe(s));
}

/* Busca */
function busca() {
  const campo = $("#busca");
  const vazio = $("#vazio");
  campo.addEventListener("input", () => {
    const q = semAcento(campo.value.trim());
    let total = 0;
    document.querySelectorAll(".secao").forEach((sec) => {
      let n = 0;
      sec.querySelectorAll("[data-busca]").forEach((li) => {
        const ok = !q || li.dataset.busca.includes(q);
        li.hidden = !ok;
        if (ok) n++;
      });
      sec.hidden = n === 0;
      total += n;
    });
    vazio.hidden = total > 0;
    document.body.classList.toggle("buscando", !!q);
  });
}

montar();
abaAtiva();
busca();
