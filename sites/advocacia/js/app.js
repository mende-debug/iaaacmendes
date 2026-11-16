/* =========================================================
   Site de escritório de advocacia — demonstração
   Troque os dados abaixo para cada cliente.
   Lembrete (Provimento 205/2021 da OAB): sem preços, sem promessa
   de resultado, sem depoimentos e com o registro da sociedade.
   ========================================================= */
const CONFIG = {
  nome: "Almeida & Torres",
  registro: "Sociedade inscrita na OAB/SP sob o nº 00.000",
  whatsapp: "5511900000000",                 // DDI + DDD + número, só dígitos
  telefone: "(11) 90000-0000",
  fixo: "(11) 3000-0000",
  email: "contato@almeidatorres.adv.br",
  endereco: "Av. Paulista, 0000, 12º andar — São Paulo",
  horario: "Seg a sex · 9h às 18h",
  mensagemPadrao: "Olá! Vim pelo site do Almeida & Torres e gostaria de agendar uma reunião.",
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const waLink = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
document.documentElement.classList.add("js");

/* Dados do cliente */
$$("[data-cfg]").forEach((el) => { const v = CONFIG[el.dataset.cfg]; if (v) el.textContent = v; });
$$("[data-wa]").forEach((a) => { a.href = waLink(CONFIG.mensagemPadrao); a.target = "_blank"; a.rel = "noopener"; });
$("#mapsLink").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.endereco)}`;
$("#ano").textContent = new Date().getFullYear();

/* Header e menu mobile */
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

/* Revelar ao rolar */
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
  : null;
$$(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 90}ms`; io ? io.observe(el) : el.classList.add("is-in"); });

/* Formulário → WhatsApp */
const form = $("#form");
const fone = form.elements.fone;
fone.addEventListener("input", () => {
  const d = fone.value.replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  fone.value = out;
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = form.elements;
  const nomeOk = f.nome.value.trim().length >= 2;
  const foneOk = f.fone.value.replace(/\D/g, "").length >= 10;
  f.nome.classList.toggle("is-invalid", !nomeOk);
  f.fone.classList.toggle("is-invalid", !foneOk);
  $("#formError").hidden = nomeOk && foneOk;
  if (!(nomeOk && foneOk)) { (nomeOk ? f.fone : f.nome).focus(); return; }
  const linhas = [
    `Olá, ${CONFIG.nome}! Gostaria de agendar uma reunião.`, "",
    `*Nome:* ${f.nome.value.trim()}`,
    `*WhatsApp:* ${f.fone.value}`,
    `*Perfil:* ${f.perfil.value}`,
    `*Área:* ${f.area.value}`,
  ];
  if (f.msg.value.trim()) linhas.push(`*Mensagem:* ${f.msg.value.trim()}`);
  window.open(waLink(linhas.join("\n")), "_blank", "noopener");
});
