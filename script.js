const itemsRoom = document.getElementById('itemsRoom');
const cardboardBox = document.getElementById('cardboardBox');
const boxContainer = document.querySelector('.box-container');
const feedbackMessage = document.getElementById('feedbackMessage');
const levelBadge = document.getElementById('levelBadge');
const gameInstruction = document.getElementById('gameInstruction');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const muteBtn = document.getElementById('muteBtn');
const timeCountEl = document.getElementById('timeCount');
const scoreCountEl = document.getElementById('scoreCount');
const timerBox = document.querySelector('.timer-box');
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// Elementos de las pantallas superpuestas
const welcomeScreen = document.getElementById('welcomeScreen');
const endScreen = document.getElementById('endScreen');
const startTrackBtn = document.getElementById('startTrackBtn');
const restartTrackBtn = document.getElementById('restartTrackBtn');
const endIcon = document.getElementById('endIcon');
const endTitle = document.getElementById('endTitle');
const endMessage = document.getElementById('endMessage');
const finalScoreCount = document.getElementById('finalScoreCount');

// Configuración Multimedia
const IMAGEN_CERRADA = 'imagenes/caja-cerrada.png';
const IMAGEN_ABIERTA = 'imagenes/caja-abierta.png';
const sonidoExito = new Audio('sonidos/exito.mp3');
const sonidoError = new Audio('sonidos/error.mp3');

const musicaFondo = new Audio('sonidos/musica_fondo.mp3');
musicaFondo.loop = true;
musicaFondo.volume = 0.3;

canvas.width = 240;
canvas.height = 300;

const niveles = [
  {
    numero: 1,
    objetivo: 'juguete',
    instruccion: '🧺 ¡Pon solo los JUGUETES en la caja de cartón!',
    colorFondo: '#e8f5e9',
    objetos: [
      { id: 'n1_1', src: 'imagenes/juguete_oso.png', type: 'juguete', name: 'el osito' },
      { id: 'n1_2', src: 'imagenes/juguete_carro.png', type: 'juguete', name: 'el carrito' },
      { id: 'n1_3', src: 'imagenes/fruta_manzana.png', type: 'fruta', name: 'la manzana' },
      { id: 'n1_4', src: 'imagenes/util_lapiz.png', type: 'util', name: 'el lápiz' }
    ]
  },
  {
    numero: 2,
    objetivo: 'fruta',
    instruccion: '🍎 ¡Pon solo las FRUTAS en la caja de la cocina!',
    colorFondo: '#fff3e0',
    objetos: [
      { id: 'n2_1', src: 'imagenes/fruta_manzana.png', type: 'fruta', name: 'la manzana' },
      { id: 'n2_2', src: 'imagenes/fruta_platano.png', type: 'fruta', name: 'el plátano' },
      { id: 'n2_3', src: 'imagenes/juguete_carro.png', type: 'juguete', name: 'el carrito' },
      { id: 'n2_4', src: 'imagenes/util_cuaderno.png', type: 'util', name: 'el cuaderno' }
    ]
  },
  {
    numero: 3,
    objetivo: 'util',
    instruccion: '✏️ ¡Pon solo los ÚTILES ESCOLARES en la caja de la escuela!',
    colorFondo: '#e1f5fe',
    objetos: [
      { id: 'n3_1', src: 'imagenes/util_lapiz.png', type: 'util', name: 'el lápiz' },
      { id: 'n3_2', src: 'imagenes/util_cuaderno.png', type: 'util', name: 'el cuaderno' },
      { id: 'n3_3', src: 'imagenes/juguete_oso.png', type: 'juguete', name: 'el osito' },
      { id: 'n3_4', src: 'imagenes/fruta_platano.png', type: 'fruta', name: 'el plátano' }
    ]
  }
];

let nivelActualIndex = 0;
let objetivosRequeridos = 0;
let objetivosGuardados = 0;
let particles = [];
let animationFrameId;
let musicaActiva = false;

let tiempoRestante = 30;
let idIntervaloTiempo;
let juegoTerminado = false;
let puntuacionTotal = 0;

function cargarNivel(index) {
  const nivel = niveles[index];
  
  objetivosGuardados = 0;
  objetivosRequeridos = 0;
  tiempoRestante = 30;
  juegoTerminado = false;
  
  nextLevelBtn.style.display = 'none';
  feedbackMessage.textContent = '¡Arrastra el objeto correcto!';
  feedbackMessage.style.color = '#2c3e50';
  document.body.style.backgroundColor = nivel.colorFondo;
  levelBadge.textContent = `Nivel ${nivel.numero}`;
  gameInstruction.textContent = nivel.instruccion;
  
  timeCountEl.textContent = tiempoRestante;
  scoreCountEl.textContent = puntuacionTotal;
  timerBox.classList.remove('urgent');
  
  itemsRoom.innerHTML = '';

  nivel.objetos.forEach(obj => {
    if (obj.type === nivel.objetivo) objetivosRequeridos++;

    const img = document.createElement('img');
    img.src = obj.src;
    img.className = 'draggable-item';
    img.draggable = true;
    img.id = obj.id;
    img.setAttribute('data-type', obj.type);
    img.setAttribute('data-name', obj.name);

    img.addEventListener('dragstart', (e) => {
      if (juegoTerminado) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', e.target.id);
    });

    itemsRoom.appendChild(img);
  });

  clearInterval(idIntervaloTiempo);
  idIntervaloTiempo = setInterval(manejarTiempo, 1000);
}

function manejarTiempo() {
  tiempoRestante--;
  timeCountEl.textContent = tiempoRestante;

  if (tiempoRestante <= 10) {
    timerBox.classList.add('urgent');
  }

  if (tiempoRestante <= 0) {
    clearInterval(idIntervaloTiempo);
    desplegarPantallaFinal(false);
  }
}

function desplegarPantallaFinal(esVictoria) {
  juegoTerminado = true;
  clearInterval(idIntervaloTiempo);
  finalScoreCount.textContent = puntuacionTotal;
  
  if (esVictoria) {
    endIcon.textContent = "🏆";
    endTitle.textContent = "¡Felicidades, Campeón!";
    endMessage.textContent = "¡Increíble! Lograste ordenar todos los niveles a tiempo.";
    document.getElementById('endScreen').querySelector('.screen-card').style.borderColor = "#4caf50";
  } else {
    sonidoError.currentTime = 0;
    sonidoError.play().catch(() => {});
    endIcon.textContent = "💥";
    endTitle.textContent = "¡Juego Terminado!";
    endMessage.textContent = "El tiempo se acabó antes de recolectar todos los objetos.";
    document.getElementById('endScreen').querySelector('.screen-card').style.borderColor = "#f44336";
  }
  
  endScreen.style.display = "flex";
}

function intentarIniciarMusica() {
  if (!musicaActiva && !muteBtn.classList.contains('muted')) {
    musicaFondo.play()
      .then(() => { musicaActiva = true; muteBtn.textContent = '🔊'; })
      .catch(() => {});
  }
}

muteBtn.addEventListener('click', () => {
  if (musicaActiva) {
    musicaFondo.pause();
    musicaActiva = false;
    muteBtn.textContent = '🔇';
    muteBtn.classList.add('muted');
  } else {
    musicaFondo.play()
      .then(() => { musicaActiva = true; muteBtn.textContent = '🔊'; muteBtn.classList.remove('muted'); })
      .catch(() => {});
  }
});

class StarParticle {
  constructor() {
    this.x = canvas.width / 2 + (Math.random() * 60 - 30);
    this.y = canvas.height * 0.7;
    this.size = Math.random() * 7 + 4;
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * -3 - 2;
    this.color = `hsl(${Math.random() * 60 + 40}, 100%, 60%)`;
    this.alpha = 1;
  }
  update() { this.x += this.speedX; this.y += this.speedY; this.alpha -= 0.02; }
  draw() {
    ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath(); ctx.fillStyle = this.color;
    let spikes = 5, outerRadius = this.size, innerRadius = this.size / 2;
    let rot = Math.PI / 2 * 3, x = this.x, y = this.y, step = Math.PI / spikes;
    ctx.moveTo(this.x, this.y - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = this.x + Math.cos(rot) * outerRadius; y = this.y + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y); rot += step;
      x = this.x + Math.cos(rot) * innerRadius; y = this.y + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y); rot += step;
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (cardboardBox.src.includes('caja-abierta.png') && Math.random() < 0.4) {
    particles.push(new StarParticle());
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(); particles[i].draw();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }
  animationFrameId = requestAnimationFrame(animateParticles);
}

boxContainer.addEventListener('dragover', (e) => e.preventDefault());

boxContainer.addEventListener('dragenter', (e) => {
  e.preventDefault();
  if (juegoTerminado) return;
  boxContainer.classList.add('drag-over');
  cardboardBox.src = IMAGEN_ABIERTA;
  cancelAnimationFrame(animationFrameId);
  animateParticles();
});

boxContainer.addEventListener('dragleave', () => {
  boxContainer.classList.remove('drag-over');
  cardboardBox.src = IMAGEN_CERRADA;
});

boxContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  boxContainer.classList.remove('drag-over');
  if (juegoTerminado) return;
  
  const idElemento = e.dataTransfer.getData('text/plain');
  const elementoArrastrado = document.getElementById(idElemento);
  const nivelActual = niveles[nivelActualIndex];
  
  if (elementoArrastrado) {
    const tipo = elementoArrastrado.getAttribute('data-type');
    const nombre = elementoArrastrado.getAttribute('data-name');
    
    if (tipo === nivelActual.objetivo) {
      elementoArrastrado.style.display = 'none';
      objetivosGuardados++;
      puntuacionTotal += 10;
      scoreCountEl.textContent = puntuacionTotal;

      sonidoExito.currentTime = 0;
      sonidoExito.play().catch(() => {});

      if (objetivosGuardados === objetivosRequeridos) {
        clearInterval(idIntervaloTiempo);
        
        if (nivelActualIndex < niveles.length - 1) {
          feedbackMessage.textContent = "¡Excelente! 🎉 Completaste el nivel.";
          feedbackMessage.style.color = "#27ae60";
          nextLevelBtn.style.display = 'inline-block';
        } else {
          desplegarPantallaFinal(true);
        }
      } else {
        feedbackMessage.textContent = `¡Muy bien! Guardaste ${nombre} 📦 (+10 pts)`;
        feedbackMessage.style.color = "#2980b9";
      }
    } else {
      puntuacionTotal = Math.max(0, puntuacionTotal - 5);
      scoreCountEl.textContent = puntuacionTotal;

      sonidoError.currentTime = 0;
sonidoError.play().catch(() => {});
feedbackMessage.textContent = "¡Ups! Eso no va ahí 🪐 (-5 pts)";
feedbackMessage.style.color = "#c0392b";
}
}
cardboardBox.src = IMAGEN_CERRADA;
});
startTrackBtn.addEventListener('click', () => {
welcomeScreen.style.display = 'none';
intentarIniciarMusica();
cargarNivel(0);
});
restartTrackBtn.addEventListener('click', () => {
endScreen.style.display = 'none';
nivelActualIndex = 0;
puntuacionTotal = 0;
intentarIniciarMusica();
cargarNivel(nivelActualIndex);
});
nextLevelBtn.addEventListener('click', () => {
nivelActualIndex++;
cargarNivel(nivelActualIndex);
})