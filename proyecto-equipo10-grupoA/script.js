/* ══════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id).classList.add('open');
  if (id === 'modal-calc') initCalc();
  if (id === 'modal-quiz') initQuiz();
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

/* ══════════════════════════════════════════
   REPORTE COUNTER
══════════════════════════════════════════ */
let reportes = 0;

function enviarReporte() {
  reportes++;
  const el = document.getElementById('contador');
  el.innerHTML = `<span class="report-pulse">${reportes}</span>`;
  void el.offsetWidth;
  showToast(`✅ Reporte #${reportes} enviado. ¡Gracias por contribuir!`);
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:rgba(26,94,92,0.95); color:#fff; padding:12px 24px;
    border-radius:30px; font-size:0.92rem; z-index:999;
    border:1px solid rgba(132,215,212,0.50);
    box-shadow:0 8px 24px rgba(0,0,0,0.3);
    animation:fadeIn 0.3s ease;
    font-family:'Lato',sans-serif;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ══════════════════════════════════════════
   CALCULADORA DE RIESGO
══════════════════════════════════════════ */
const calcPreguntas = [
  {
    q: "¿De dónde obtenés el agua que consumís principalmente?",
    opts: ["Agua de red/corriente (AySA)", "Agua de pozo o cisterna", "Agua embotellada comprada", "No sé con certeza"],
    pts: [0, 3, 0, 2]
  },
  {
    q: "¿Notás algún olor extraño (a cloro excesivo, tierra, o putrefacto) en tu agua?",
    opts: ["No, huele normal", "A veces hay olores raros", "Sí, frecuentemente huele mal", "Nunca presté atención"],
    pts: [0, 2, 3, 1]
  },
  {
    q: "¿El agua tiene algún color o turbidez inusual?",
    opts: ["No, es transparente", "A veces está levemente turbia", "Frecuentemente tiene color amarillento o marrón", "Varía mucho"],
    pts: [0, 2, 3, 2]
  },
  {
    q: "¿A qué distancia vivís del Río de la Plata o del Riachuelo?",
    opts: ["Más de 5 km", "Entre 2 y 5 km", "Menos de 2 km", "Vivo justo en la costa"],
    pts: [0, 1, 2, 3]
  },
  {
    q: "¿Hay industrias, basurales o curtidurías cerca de tu domicilio?",
    opts: ["No, zona residencial", "Alguna fábrica lejana", "Sí, hay industrias cercanas", "Hay un basural o curtiembre muy cerca"],
    pts: [0, 1, 2, 3]
  },
  {
    q: "¿Con qué frecuencia tomás agua directamente del grifo sin filtrar?",
    opts: ["Nunca, siempre filtro o compro", "Ocasionalmente", "Frecuentemente", "Siempre tomo del grifo"],
    pts: [0, 1, 2, 2]
  }
];

let calcIdx = 0;
let calcScore = 0;

function initCalc() {
  calcIdx = 0;
  calcScore = 0;
  renderCalcProgress();
  renderCalcQuestion();
}

function renderCalcProgress() {
  const bar = document.getElementById('calc-progress');
  bar.innerHTML = calcPreguntas.map((_, i) =>
    `<div class="calc-step-dot ${i < calcIdx ? 'done' : i === calcIdx ? 'active' : ''}"></div>`
  ).join('');
}

function renderCalcQuestion() {
  const body = document.getElementById('calc-body');
  if (calcIdx >= calcPreguntas.length) {
    renderCalcResult();
    return;
  }
  const p = calcPreguntas[calcIdx];
  body.innerHTML = `
    <p class="calc-question">Pregunta ${calcIdx + 1} de ${calcPreguntas.length}<br>${p.q}</p>
    <div class="calc-options">
      ${p.opts.map((o, i) => `
        <button class="calc-opt" onclick="calcAnswer(${p.pts[i]})">${o}</button>
      `).join('')}
    </div>
  `;
}

function calcAnswer(pts) {
  calcScore += pts;
  calcIdx++;
  renderCalcProgress();
  renderCalcQuestion();
}

function renderCalcResult() {
  const maxScore = calcPreguntas.reduce((a, p) => a + Math.max(...p.pts), 0);
  const pct = calcScore / maxScore;
  let level, cls, desc, advice;

  if (pct < 0.30) {
    level = 'Riesgo Bajo'; cls = 'risk-bajo';
    desc = 'Tu nivel de exposición a agua contaminada es bajo. Tu fuente de agua parece segura y vivís lejos de focos contaminantes.';
    advice = 'Seguí usando agua de red filtrada, mantenete informado sobre alertas de ACUMAR y evitá consumir peces del río como precaución.';
  } else if (pct < 0.60) {
    level = 'Riesgo Medio'; cls = 'risk-medio';
    desc = 'Hay factores de riesgo moderados en tu entorno hídrico. Algunas condiciones de tu agua o entorno merecen atención.';
    advice = 'Instalá un filtro de carbón activado, realizá análisis de agua anual, consultá a tu médico sobre análisis de plomo si tenés hijos menores, y reportá anomalías al 0800-333-2280.';
  } else {
    level = 'Riesgo Alto'; cls = 'risk-alto';
    desc = 'Tu situación presenta múltiples factores de riesgo. Es importante tomar medidas concretas cuanto antes.';
    advice = 'NO consumas agua de pozo sin análisis previo. Solicitá análisis de metales pesados en sangre. Consultá a ACUMAR para remediación. Evitá todo contacto recreativo con el agua local.';
  }

  document.getElementById('calc-body').innerHTML = `
    <div class="calc-result">
      <p style="color:rgba(255,255,255,0.65)!important;font-size:0.88rem!important;margin-bottom:12px">
        Puntaje: ${calcScore} / ${maxScore}
      </p>
      <div class="risk-badge ${cls}">${level}</div>
      <p class="risk-desc">${desc}</p>
      <div style="margin-top:16px;padding:14px;background:rgba(132,215,212,0.10);border-radius:10px;border:1px solid rgba(132,215,212,0.22)">
        <strong style="color:var(--teal);display:block;margin-bottom:8px;font-size:0.95rem">💡 Qué hacer:</strong>
        <p class="risk-desc" style="margin:0">${advice}</p>
      </div>
      <button class="calc-restart" onclick="initCalc()">🔄 Volver a evaluar</button>
    </div>
  `;
  renderCalcProgress();
}

const quizPreguntas = [
  {
    q: "¿Hervir el agua elimina todos sus contaminantes?",
    opts: ["Sí, el calor destruye todo", "Solo elimina bacterias y virus, no metales ni químicos", "No sirve para nada", "Solo funciona con agua de pozo"],
    correct: 1,
    exp: "✅ Correcto. Hervir mata microorganismos pero NO elimina metales pesados (plomo, arsénico), pesticidas ni compuestos químicos. Para eso se necesitan filtros especializados."
  },
  {
    q: "¿Cuál es el principal contaminante del Riachuelo?",
    opts: ["Solo bacterias fecales", "Colorantes y tintes de curtidurías, metales pesados y PCB", "Exceso de cloro", "Algas microscópicas"],
    correct: 1,
    exp: "✅ Correcto. El Riachuelo concentra décadas de vuelcos industriales con metales pesados (plomo, cromo, mercurio), bifenilos policlorados (PCB) y residuos de curtidurías."
  },
  {
    q: "¿Las cianobacterias son peligrosas solo para animales?",
    opts: ["Sí, solo afectan peces y aves", "No, sus toxinas (microcistinas) también dañan el hígado humano", "Solo afectan a niños pequeños", "Son inofensivas para vertebrados"],
    correct: 1,
    exp: "✅ Correcto. Las microcistinas producidas por cianobacterias como Microcystis son hepatotóxicas para humanos y animales. El contacto con agua con floraciones puede causar erupciones, gastroenteritis e incluso insuficiencia hepática."
  },
  {
    q: "¿Qué significa que el agua tenga olor a 'tierra mojada'?",
    opts: ["Es completamente normal y seguro", "Puede indicar presencia de cianobacterias o algas que producen geosmina", "Solo ocurre después de lluvias fuertes", "Es señal de exceso de cloro"],
    correct: 1,
    exp: "✅ Correcto. La geosmina es un compuesto orgánico producido por cianobacterias y actinobacterias. Su olor es señal de posible floración algal o proliferación bacteriana en la fuente de agua."
  },
  {
    q: "¿Qué porcentaje del agua del planeta es dulce y accesible para consumo humano?",
    opts: ["30%", "10%", "Menos del 1%", "3%"],
    correct: 2,
    exp: "✅ Correcto. El 97% del agua es salada. Del 3% dulce, la mayoría está en glaciares. Solo el 0,3% es accesible en ríos, lagos y acuíferos superficiales, haciendo crítica su protección."
  },
  {
    q: "¿Qué son los microplásticos y por qué son un problema en el agua?",
    opts: ["Plásticos grandes visibles a simple vista", "Partículas menores a 5mm que transportan tóxicos y entran en la cadena alimentaria", "Un tipo de filtro para purificar agua", "Solo afectan el agua salada"],
    correct: 1,
    exp: "✅ Correcto. Los microplásticos (<5mm) absorben contaminantes como pesticidas y metales, y al ser ingeridos por organismos acuáticos entran en la cadena trófica hasta llegar a los humanos."
  },
  {
    q: "¿Cuál es el ODS directamente relacionado con el acceso al agua limpia?",
    opts: ["ODS 3 (Salud)", "ODS 6 (Agua limpia y saneamiento)", "ODS 14 (Vida submarina)", "ODS 11 (Ciudades sostenibles)"],
    correct: 1,
    exp: "✅ Correcto. El ODS 6 busca garantizar la disponibilidad y gestión sostenible del agua y el saneamiento para todos. La meta es lograr acceso universal al agua potable segura para 2030."
  }
];

let quizIdx = 0;
let quizAciertos = 0;
let quizAnswered = false;

function initQuiz() {
  quizIdx = 0;
  quizAciertos = 0;
  quizAnswered = false;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const body = document.getElementById('quiz-body');
  const bar = document.getElementById('quiz-bar');
  bar.style.width = (quizIdx / quizPreguntas.length * 100) + '%';

  if (quizIdx >= quizPreguntas.length) {
    renderQuizResult();
    return;
  }

  const p = quizPreguntas[quizIdx];
  quizAnswered = false;

  body.innerHTML = `
    <p class="quiz-q-counter">Pregunta ${quizIdx + 1} de ${quizPreguntas.length}</p>
    <p class="quiz-question">${p.q}</p>
    <div class="quiz-opts" id="quiz-opts">
      ${p.opts.map((o, i) => `
        <button class="quiz-opt" id="qopt-${i}" onclick="quizAnswer(${i})">${o}</button>
      `).join('')}
    </div>
    <div class="quiz-feedback" id="quiz-feedback"></div>
    <button class="quiz-next" id="quiz-next" onclick="quizNext()">
      ${quizIdx === quizPreguntas.length - 1 ? '🏁 Ver resultado' : 'Siguiente →'}
    </button>
  `;
}

function quizAnswer(selected) {
  if (quizAnswered) return;
  quizAnswered = true;

  const p = quizPreguntas[quizIdx];
  const fb = document.getElementById('quiz-feedback');
  const nxt = document.getElementById('quiz-next');

  document.querySelectorAll('.quiz-opt').forEach(b => { b.disabled = true; });

  if (selected === p.correct) {
    quizAciertos++;
    document.getElementById(`qopt-${selected}`).classList.add('correct');
    fb.className = 'quiz-feedback show ok';
    fb.textContent = p.exp;
  } else {
    document.getElementById(`qopt-${selected}`).classList.add('wrong');
    document.getElementById(`qopt-${p.correct}`).classList.add('correct');
    fb.className = 'quiz-feedback show fail';
    fb.textContent = '❌ Incorrecto. ' + p.exp.replace('✅ Correcto. ', '');
  }

  nxt.classList.add('show');
}

function quizNext() {
  quizIdx++;
  document.getElementById('quiz-bar').style.width = (quizIdx / quizPreguntas.length * 100) + '%';
  renderQuizQuestion();
}

function renderQuizResult() {
  document.getElementById('quiz-bar').style.width = '100%';
  const pct = quizAciertos / quizPreguntas.length;
  let msg, color;

  if (pct >= 0.85)      { msg = '🏆 ¡Excelente! Sos un experto en concientización ambiental.'; color = '#4caf50'; }
  else if (pct >= 0.57) { msg = '👍 Bien hecho. Seguí aprendiendo sobre la problemática hídrica.'; color = '#ffca28'; }
  else                  { msg = '📚 Hay mucho por aprender. Te recomendamos recorrer toda la página.'; color = '#84D7D4'; }

  document.getElementById('quiz-body').innerHTML = `
    <div class="quiz-result">
      <p style="color:rgba(255,255,255,0.65)!important;font-size:0.9rem!important">Resultado final</p>
      <div class="quiz-score" style="color:${color}">${quizAciertos}/${quizPreguntas.length}</div>
      <p>${msg}</p>
      <button class="calc-restart" style="margin-top:20px" onclick="initQuiz()">🔄 Jugar de nuevo</button>
    </div>
  `;
}

const map = L.map('map', { zoomControl: true }).setView([-34.62, -58.27], 10);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap © CARTO',
  maxZoom: 18
}).addTo(map);

const estiloVerde    = { color: '#4caf50', fillColor: '#4caf50', fillOpacity: 0.22, weight: 1.8 };
const estiloAmarillo = { color: '#ffca28', fillColor: '#ffca28', fillOpacity: 0.22, weight: 1.8 };
const estiloRojo     = { color: '#f44336', fillColor: '#f44336', fillOpacity: 0.30, weight: 2 };

// Zona Verde: Tigre → Belgrano
L.polygon([
  [-34.428, -58.572], [-34.478, -58.516], [-34.524, -58.468],
  [-34.548, -58.437], [-34.548, -58.382], [-34.524, -58.413],
  [-34.478, -58.461], [-34.428, -58.517]
], estiloVerde).bindPopup('<b>🟢 Zona Verde</b><br>Riesgo bajo. Monitoreo regular.').addTo(map);

// Zona Amarilla: Costanera → Puerto Madero
L.polygon([
  [-34.548, -58.382], [-34.580, -58.362], [-34.612, -58.348],
  [-34.612, -58.310], [-34.580, -58.318], [-34.548, -58.328]
], estiloAmarillo).bindPopup('<b>🟡 Zona Amarilla</b><br>Riesgo medio. No apto para baño.').addTo(map);

// Zona Roja: Riachuelo / La Boca / Dock Sud
L.polygon([
  [-34.612, -58.348], [-34.648, -58.335], [-34.692, -58.320],
  [-34.720, -58.302], [-34.720, -58.255], [-34.692, -58.268],
  [-34.648, -58.280], [-34.612, -58.310]
], estiloRojo).bindPopup('<b>🔴 Zona Roja</b><br>Riesgo crítico. Prohibido todo contacto.').addTo(map);

// Zona Amarilla: Berisso / Ensenada
L.polygon([
  [-34.820, -57.920], [-34.880, -57.870], [-34.920, -57.820],
  [-34.920, -57.768], [-34.880, -57.812], [-34.820, -57.862]
], estiloAmarillo).bindPopup('<b>🟡 Zona Amarilla</b><br>Ensenada / Berisso. Vigilancia activa.').addTo(map);

// Puntos de agua potable (AySA)
const puntosAysa = [
  { c: [-34.603, -58.381], n: "AySA · Retiro" },
  { c: [-34.615, -58.370], n: "AySA · Puerto Madero" },
  { c: [-34.572, -58.431], n: "AySA · Palermo" },
  { c: [-34.545, -58.451], n: "AySA · Belgrano" },
  { c: [-34.496, -58.501], n: "AySA · Núñez" },
  { c: [-34.638, -58.437], n: "AySA · Flores" },
  { c: [-34.658, -58.458], n: "AySA · Floresta" },
  { c: [-34.680, -58.354], n: "AySA · Avellaneda" },
  { c: [-34.705, -58.380], n: "AySA · Lanús" },
  { c: [-34.722, -58.420], n: "AySA · Lomas de Zamora" },
  { c: [-34.740, -58.268], n: "AySA · Quilmes Centro" },
  { c: [-34.760, -58.248], n: "AySA · Bernal" },
  { c: [-34.452, -58.538], n: "AySA · Tigre" },
  { c: [-34.475, -58.520], n: "AySA · Don Torcuato" },
  { c: [-34.505, -58.488], n: "AySA · Vicente López" },
  { c: [-34.522, -58.470], n: "AySA · Olivos" },
  { c: [-34.538, -58.454], n: "AySA · Martínez" },
  { c: [-34.562, -58.442], n: "AySA · San Isidro" },
  { c: [-34.592, -58.396], n: "AySA · Recoleta" },
  { c: [-34.620, -58.388], n: "AySA · San Telmo" },
  { c: [-34.635, -58.362], n: "AySA · La Boca Norte" },
  { c: [-34.800, -57.890], n: "AySA · Ensenada" }
];

const blueIcon = L.divIcon({
  html: '<div style="background:#2196f3;border:2px solid #fff;border-radius:50%;width:14px;height:14px;box-shadow:0 0 8px #2196f3"></div>',
  className: '', iconSize: [14, 14], iconAnchor: [7, 7]
});

puntosAysa.forEach(p => {
  L.marker(p.c, { icon: blueIcon })
    .bindPopup(`<b>💧 ${p.n}</b><br><small>Agua potable certificada</small>`)
    .addTo(map);
});

Chart.defaults.color = 'rgba(255,255,255,0.85)';
Chart.defaults.font  = { family: "'Lato', sans-serif", size: 12 };

// 1. Zonas por nivel de riesgo
new Chart(document.getElementById('chartZonas'), {
  type: 'doughnut',
  data: {
    labels: ['Riesgo Alto', 'Riesgo Medio', 'Riesgo Bajo'],
    datasets: [{
      data: [38, 35, 27],
      backgroundColor: ['rgba(244,67,54,0.80)', 'rgba(255,202,40,0.80)', 'rgba(76,175,80,0.80)'],
      borderColor: ['#f44336', '#ffca28', '#4caf50'],
      borderWidth: 2
    }]
  },
  options: {
    plugins: { legend: { position: 'bottom', labels: { padding: 14 } } },
    cutout: '62%'
  }
});

// 2. Reportes por barrio
new Chart(document.getElementById('chartBarrios'), {
  type: 'bar',
  data: {
    labels: ['La Boca', 'Dock Sud', 'Quilmes', 'Ensenada', 'Avellaneda', 'Tigre', 'Palermo'],
    datasets: [{
      label: 'Reportes 2023',
      data: [342, 298, 215, 187, 163, 94, 58],
      backgroundColor: 'rgba(132,215,212,0.65)',
      borderColor: 'rgba(132,215,212,1)',
      borderWidth: 1.5,
      borderRadius: 6
    }]
  },
  options: {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: 'rgba(255,255,255,0.75)' } },
      y: { grid: { display: false },                  ticks: { color: 'rgba(255,255,255,0.85)' } }
    }
  }
});

// 3. Evolución de alertas
new Chart(document.getElementById('chartAlertas'), {
  type: 'line',
  data: {
    labels: ['2019', '2020', '2021', '2022', '2023'],
    datasets: [
      {
        label: 'Alertas críticas',
        data: [12, 18, 15, 22, 29],
        borderColor: '#f44336', backgroundColor: 'rgba(244,67,54,0.12)',
        tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: '#f44336'
      },
      {
        label: 'Alertas moderadas',
        data: [24, 31, 28, 35, 41],
        borderColor: '#ffca28', backgroundColor: 'rgba(255,202,40,0.10)',
        tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: '#ffca28'
      }
    ]
  },
  options: {
    plugins: { legend: { position: 'bottom', labels: { padding: 14 } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: 'rgba(255,255,255,0.75)' } },
      y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: 'rgba(255,255,255,0.75)' } }
    }
  }
});

// 4. Contaminantes detectados
new Chart(document.getElementById('chartContaminantes'), {
  type: 'polarArea',
  data: {
    labels: ['Metales pesados', 'Coliformes fecales', 'Cianobacterias', 'Microplásticos', 'Pesticidas', 'PCB / Químicos'],
    datasets: [{
      data: [78, 91, 64, 88, 55, 47],
      backgroundColor: [
        'rgba(244,67,54,0.70)', 'rgba(132,215,212,0.70)',
        'rgba(76,175,80,0.70)', 'rgba(132,191,215,0.70)',
        'rgba(255,202,40,0.70)', 'rgba(156,39,176,0.70)'
      ],
      borderColor: 'rgba(255,255,255,0.20)',
      borderWidth: 1
    }]
  },
  options: {
    plugins: { legend: { position: 'bottom', labels: { padding: 10, font: { size: 11 } } } },
    scales: { r: { grid: { color: 'rgba(255,255,255,0.10)' }, ticks: { display: false } } }
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.12 });

document.querySelectorAll('.glass-card, .tool-card, .chart-card, .team-card, .practice-item, .step-item').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});