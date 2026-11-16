/* Dom Navalha Barbearia — site de demonstração
   Troque os dados abaixo para cada cliente. */
const CONFIG = {
  nome: "Dom Navalha",
  whatsapp: "5511900000000", // DDI + DDD + número, só dígitos
  mensagemPadrao: "Fala, Dom Navalha! Vim pelo site e quero agendar um horário.",
};

document.documentElement.classList.add("js");

const waLink = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink(CONFIG.mensagemPadrao);
  a.target = "_blank";
  a.rel = "noopener";
});

// Header sólido ao rolar
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Menu mobile
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const setMenu = (open) => {
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  nav.classList.toggle("is-open", open);
  header.classList.toggle("menu-open", open);
  document.body.classList.toggle("no-scroll", open);
};
burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

// Revelar ao rolar
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
  : null;
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io ? io.observe(el) : el.classList.add("is-in");
});

// Botões dos planos pré-selecionam o serviço
const form = document.getElementById("form");
document.querySelectorAll("[data-servico]").forEach((a) => {
  a.addEventListener("click", () => {
    const radio = form.querySelector(`input[name="servico"][value="${a.dataset.servico}"]`);
    if (radio) radio.checked = true;
  });
});

// Data mínima = hoje
const dia = form.elements.dia;
const hoje = new Date();
hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
dia.min = hoje.toISOString().slice(0, 10);

// Máscara de telefone
const fone = form.elements.fone;
fone.addEventListener("input", () => {
  const d = fone.value.replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  fone.value = out;
});

// Envio pelo WhatsApp
const erro = document.getElementById("formError");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = form.elements;
  const nomeOk = f.nome.value.trim().length >= 2;
  const foneOk = f.fone.value.replace(/\D/g, "").length >= 10;
  f.nome.classList.toggle("is-invalid", !nomeOk);
  f.fone.classList.toggle("is-invalid", !foneOk);
  erro.hidden = nomeOk && foneOk;
  if (!(nomeOk && foneOk)) { (nomeOk ? f.fone : f.nome).focus(); return; }

  const dataBr = f.dia.value ? f.dia.value.split("-").reverse().join("/") : "a combinar";
  const linhas = [
    `Fala, ${CONFIG.nome}! Quero agendar um horário.`,
    "",
    `*Nome:* ${f.nome.value.trim()}`,
    `*WhatsApp:* ${f.fone.value}`,
    `*Serviço:* ${f.servico.value}`,
    `*Barbeiro:* ${f.barbeiro.value}`,
    `*Dia:* ${dataBr}`,
    `*Horário:* ${f.horario.value}`,
  ];
  window.open(waLink(linhas.join("\n")), "_blank", "noopener");
});

document.getElementById("ano").textContent = new Date().getFullYear();
