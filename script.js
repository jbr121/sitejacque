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
