const sim = document.getElementById("sim");
const nao = document.getElementById("nao");
const celebracao = document.getElementById("celebracao");
const chuva = document.getElementById("chuva");

const MARGEM = 12;
const DISTANCIA_FUGA = 90;

function fugir(ponteiroX, ponteiroY) {
  const largura = nao.offsetWidth;
  const altura = nao.offsetHeight;
  const maxX = Math.max(MARGEM, window.innerWidth - largura - MARGEM);
  const maxY = Math.max(MARGEM, window.innerHeight - altura - MARGEM);
  const atual = nao.getBoundingClientRect();

  let x = MARGEM;
  let y = MARGEM;

  for (let tentativa = 0; tentativa < 12; tentativa++) {
    x = MARGEM + Math.random() * (maxX - MARGEM);
    y = MARGEM + Math.random() * (maxY - MARGEM);
    const longeDoLugar = Math.hypot(x - atual.left, y - atual.top) > 120;
    const longeDoPonteiro = ponteiroX == null || Math.hypot(x - ponteiroX, y - ponteiroY) > 140;
    if (longeDoLugar && longeDoPonteiro) break;
  }

  nao.classList.add("fugindo");
  nao.style.left = `${x}px`;
  nao.style.top = `${y}px`;
}

nao.addEventListener("mouseenter", (evento) => fugir(evento.clientX, evento.clientY));

document.addEventListener("pointermove", (evento) => {
  if (celebracao.hidden === false || evento.pointerType === "touch") return;
  const rect = nao.getBoundingClientRect();
  const pertoX = evento.clientX > rect.left - DISTANCIA_FUGA && evento.clientX < rect.right + DISTANCIA_FUGA;
  const pertoY = evento.clientY > rect.top - DISTANCIA_FUGA && evento.clientY < rect.bottom + DISTANCIA_FUGA;
  if (pertoX && pertoY) fugir(evento.clientX, evento.clientY);
});

nao.addEventListener("touchstart", (evento) => {
  evento.preventDefault();
  fugir();
}, { passive: false });

function soltarCoracoes() {
  const emojis = ["💖", "💕", "💗", "💓", "💞", "💝"];
  for (let i = 0; i < 28; i++) {
    const coracao = document.createElement("span");
    coracao.textContent = emojis[i % emojis.length];
    coracao.style.left = `${Math.random() * 100}%`;
    coracao.style.fontSize = `${1 + Math.random() * 1.6}rem`;
    coracao.style.animationDuration = `${2.4 + Math.random() * 2.2}s`;
    coracao.style.animationDelay = `${Math.random() * 0.6}s`;
    chuva.appendChild(coracao);
  }
}

sim.addEventListener("click", () => {
  soltarCoracoes();
  celebracao.hidden = false;
});

const calendario = document.getElementById("calendario");
const escolha = document.getElementById("escolha");
const aviso = document.getElementById("aviso");
const AVISO_URL = "https://formsubmit.co/ajax/joseedua2sam@gmail.com";

let avisoTimer = null;
let avisoSeq = 0;

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

let mesVisivel = hoje.getMonth();
let anoVisivel = hoje.getFullYear();
let diaEscolhido = null;

function mesmoDia(a, b) {
  return a && b
    && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function mudarMes(delta) {
  mesVisivel += delta;
  if (mesVisivel < 0) {
    mesVisivel = 11;
    anoVisivel -= 1;
  }
  if (mesVisivel > 11) {
    mesVisivel = 0;
    anoVisivel += 1;
  }
  renderCalendario();
}

function renderCalendario() {
  const primeiro = new Date(anoVisivel, mesVisivel, 1);
  const inicio = primeiro.getDay();
  const total = new Date(anoVisivel, mesVisivel + 1, 0).getDate();
  const podeVoltar = anoVisivel > hoje.getFullYear()
    || (anoVisivel === hoje.getFullYear() && mesVisivel > hoje.getMonth());

  calendario.replaceChildren();

  const nav = document.createElement("div");
  nav.className = "cal-nav";

  const voltar = document.createElement("button");
  voltar.type = "button";
  voltar.textContent = "‹";
  voltar.setAttribute("aria-label", "Mês anterior");
  voltar.disabled = !podeVoltar;
  voltar.addEventListener("click", () => mudarMes(-1));

  const titulo = document.createElement("p");
  titulo.className = "cal-mes";
  titulo.textContent = `${MESES[mesVisivel]} ${anoVisivel}`;

  const avancar = document.createElement("button");
  avancar.type = "button";
  avancar.textContent = "›";
  avancar.setAttribute("aria-label", "Próximo mês");
  avancar.addEventListener("click", () => mudarMes(1));

  nav.append(voltar, titulo, avancar);

  const grade = document.createElement("div");
  grade.className = "cal-grade";

  DIAS.forEach((nome) => {
    const celula = document.createElement("span");
    celula.className = "cal-semana";
    celula.textContent = nome;
    grade.appendChild(celula);
  });

  for (let i = 0; i < inicio; i++) {
    const vazio = document.createElement("span");
    vazio.className = "cal-vazio";
    grade.appendChild(vazio);
  }

  for (let dia = 1; dia <= total; dia++) {
    const data = new Date(anoVisivel, mesVisivel, dia);
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "cal-dia";
    botao.textContent = String(dia);

    if (data < hoje) botao.disabled = true;
    if (mesmoDia(data, hoje)) botao.classList.add("hoje");
    if (mesmoDia(data, diaEscolhido)) botao.classList.add("escolhido");

    botao.addEventListener("click", () => {
      diaEscolhido = data;
      const formatada = data.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
      escolha.hidden = false;
      escolha.textContent = `Combinado! Te vejo dia ${formatada}`;
      avisarEscolha(formatada);
      renderCalendario();
    });

    grade.appendChild(botao);
  }

  calendario.append(nav, grade);
}

function avisarEscolha(formatada) {
  const seq = ++avisoSeq;
  aviso.hidden = false;
  aviso.textContent = "Avisando ele...";
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => enviarEscolha(formatada, seq), 700);
}

async function enviarEscolha(formatada, seq, tentativa = 0) {
  try {
    const resposta = await fetch(AVISO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        escolha: formatada,
        mensagem: `Ela escolheu o dia ${formatada} para o encontro.`,
        _subject: `Ela escolheu ${formatada}`,
        _template: "box",
        _captcha: "false",
      }),
    });
    const corpo = await resposta.json();
    if (seq !== avisoSeq) return;
    const ok = corpo.success === true || corpo.success === "true";
    if (!ok && tentativa < 1) {
      await esperar(800);
      return enviarEscolha(formatada, seq, tentativa + 1);
    }
    aviso.textContent = ok
      ? "Pronto, ele já ficou sabendo."
      : "Não consegui avisar agora. Toca no dia de novo.";
  } catch {
    if (seq !== avisoSeq) return;
    if (tentativa < 1) {
      await esperar(800);
      return enviarEscolha(formatada, seq, tentativa + 1);
    }
    aviso.textContent = "Não consegui avisar agora. Toca no dia de novo.";
  }
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

renderCalendario();
