/* =========================================================
   Landing page de advogado — site de demonstração
   Troque os dados abaixo para cada cliente.
   Lembrete (Provimento 205/2021 da OAB): sem preços, sem promessa
   de resultado, sem depoimentos de clientes e com o número da OAB.
   ========================================================= */
const CONFIG = {
  nome: "Rafael Teixeira",
  nomeCompleto: "Dr. Rafael Teixeira",
  area: "Advocacia Previdenciária",
  oab: "OAB/SP 000.000",
  whatsapp: "5511900000000",                 // DDI + DDD + número, só dígitos
  telefone: "(11) 90000-0000",
  email: "contato@rafaelteixeira.adv.br",
  endereco: "Av. Central, 1000, sala 804 — Centro",
  horario: "Seg a sex · 9h às 18h",
  mensagemPadrao: "Olá, Dr. Rafael! Vim pelo site e gostaria de agendar um atendimento.",
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

/* Header sólido ao rolar */
const header = $(".header");
const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 24);
onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

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
    `Olá, ${CONFIG.nomeCompleto}! Gostaria de agendar um atendimento.`, "",
    `*Nome:* ${f.nome.value.trim()}`,
    `*WhatsApp:* ${f.fone.value}`,
    `*Assunto:* ${f.assunto.value}`,
    `*Atendimento:* ${f.modo.value}`,
  ];
  if (f.msg.value.trim()) linhas.push(`*Resumo:* ${f.msg.value.trim()}`);
  window.open(waLink(linhas.join("\n")), "_blank", "noopener");
});
