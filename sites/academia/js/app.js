/* Forja Academia — site de demonstração
   Troque os dados abaixo para cada cliente. */
const CONFIG = {
  nome: "Forja Academia",
  whatsapp: "5511900000000", // DDI + DDD + número, só dígitos
  mensagemPadrao: "Olá, Forja! Vim pelo site e quero agendar minha aula experimental.",
};

// Grade de aulas: [horário, aula, professor, nível]
const GRADE = {
  seg: [["06:00", "Funcional", "Juliana", "Todos os níveis"], ["07:00", "Spinning", "Marcos", "Intermediário"], ["12:15", "HIIT 30'", "Juliana", "Avançado"], ["18:30", "Muay thai", "Diego", "Iniciante"], ["19:30", "Cross training", "Juliana", "Intermediário"], ["20:30", "Pilates", "Equipe", "Todos os níveis"]],
  ter: [["06:00", "Spinning", "Marcos", "Todos os níveis"], ["07:00", "Pilates", "Equipe", "Iniciante"], ["12:15", "Funcional", "Juliana", "Todos os níveis"], ["18:30", "Cross training", "Juliana", "Avançado"], ["19:30", "Muay thai", "Diego", "Intermediário"]],
  qua: [["06:00", "Funcional", "Juliana", "Todos os níveis"], ["07:00", "HIIT 30'", "Juliana", "Intermediário"], ["12:15", "Spinning", "Marcos", "Todos os níveis"], ["18:30", "Muay thai", "Diego", "Iniciante"], ["19:30", "Funcional", "Juliana", "Todos os níveis"], ["20:30", "Alongamento", "Equipe", "Todos os níveis"]],
  qui: [["06:00", "Spinning", "Marcos", "Todos os níveis"], ["07:00", "Cross training", "Juliana", "Intermediário"], ["12:15", "HIIT 30'", "Juliana", "Avançado"], ["18:30", "Cross training", "Juliana", "Todos os níveis"], ["19:30", "Muay thai", "Diego", "Avançado"]],
  sex: [["06:00", "Funcional", "Juliana", "Todos os níveis"], ["07:00", "Spinning", "Marcos", "Intermediário"], ["12:15", "Funcional", "Juliana", "Todos os níveis"], ["18:30", "Muay thai", "Diego", "Todos os níveis"], ["19:30", "Spinning", "Marcos", "Todos os níveis"]],
  sab: [["09:00", "Aulão funcional", "Juliana", "Todos os níveis"], ["10:00", "Spinning", "Marcos", "Todos os níveis"], ["11:00", "Muay thai", "Diego", "Todos os níveis"]],
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
  el.style.transitionDelay = `${(i % 3) * 80}ms`;
  io ? io.observe(el) : el.classList.add("is-in");
});

// Grade de aulas com abas (abre no dia de hoje)
const tabs = [...document.querySelectorAll('[role="tab"]')];
const lista = document.getElementById("classes");
const mostrarDia = (dia) => {
  tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.day === dia)));
  lista.innerHTML = GRADE[dia]
    .map(([h, aula, prof, nivel]) => `<li><time>${h}</time><div><strong>${aula}</strong><small>com ${prof}</small></div><span class="lvl">${nivel}</span></li>`)
    .join("");
};
tabs.forEach((t, i) => {
  t.addEventListener("click", () => mostrarDia(t.dataset.day));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    next.focus(); mostrarDia(next.dataset.day);
  });
});
const hojeIdx = new Date().getDay(); // 0 = domingo
mostrarDia(["seg", "seg", "ter", "qua", "qui", "sex", "sab"][hojeIdx]);

// Calculadora de IMC
const imc = document.getElementById("imc");
imc.addEventListener("submit", (e) => {
  e.preventDefault();
  const peso = parseFloat(imc.elements.peso.value.replace(",", "."));
  const alturaCm = parseFloat(imc.elements.altura.value.replace(",", "."));
  const ok = peso > 20 && peso < 400 && alturaCm > 100 && alturaCm < 250;
  imc.elements.peso.classList.toggle("is-invalid", !(peso > 20 && peso < 400));
  imc.elements.altura.classList.toggle("is-invalid", !(alturaCm > 100 && alturaCm < 250));
  if (!ok) return;
  const valor = peso / (alturaCm / 100) ** 2;
  const faixa = valor < 18.5 ? "Abaixo do peso" : valor < 25 ? "Peso adequado" : valor < 30 ? "Sobrepeso" : "Obesidade";
  document.getElementById("imcValue").textContent = valor.toFixed(1).replace(".", ",");
  document.getElementById("imcLabel").textContent = faixa;
  document.getElementById("imcResult").hidden = false;
  const pin = document.getElementById("imcPin");
  const pos = Math.min(Math.max(valor, 0), 40) / 40 * 100;
  pin.style.left = `${pos}%`;
  pin.classList.add("is-on");
});

// Botões dos planos levam o plano escolhido para o formulário
const form = document.getElementById("form");
const planoInfo = document.getElementById("formPlano");
document.querySelectorAll("[data-plano]").forEach((a) => {
  a.addEventListener("click", () => {
    form.elements.plano.value = a.dataset.plano;
    planoInfo.innerHTML = `Plano de interesse: <strong>${a.dataset.plano}</strong>`;
    planoInfo.hidden = false;
  });
});

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

  const linhas = [
    `Olá, ${CONFIG.nome}! Quero agendar minha aula experimental.`,
    "",
    `*Nome:* ${f.nome.value.trim()}`,
    `*WhatsApp:* ${f.fone.value}`,
    `*Objetivo:* ${f.objetivo.value}`,
    `*Modalidade:* ${f.modalidade.value}`,
    `*Período:* ${f.periodo.value}`,
  ];
  if (f.plano.value) linhas.push(`*Plano de interesse:* ${f.plano.value}`);
  window.open(waLink(linhas.join("\n")), "_blank", "noopener");
});

document.getElementById("ano").textContent = new Date().getFullYear();
