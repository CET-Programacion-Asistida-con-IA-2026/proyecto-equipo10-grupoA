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
// Cerrar modal al hacer clic en overlay
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

/* ══════════════════════════════════════════
   PANELES LATERALES — FUENTES
══════════════════════════════════════════ */
function toggleFuentesPanel(id) {
  const panel = document.getElementById(id);
  const overlay = document.getElementById('fuentes-overlay');
  const isOpen = panel.classList.contains('open');
  closeAllFuentesPanels();
  if (!isOpen) {
    panel.classList.add('open');
    overlay.classList.add('active');
  }
}
function closeFuentesPanel(id) {
  document.getElementById(id).classList.remove('open');
  document.getElementById('fuentes-overlay').classList.remove('active');
}
function closeAllFuentesPanels() {
  document.querySelectorAll('.fuentes-panel').forEach(p => p.classList.remove('open'));
  document.getElementById('fuentes-overlay').classList.remove('active');
}

function scrollToStats() {
  document.getElementById('estadisticas').scrollIntoView({ behavior: 'smooth' });
}

/* ══════════════════════════════════════════
   ACORDEÓN — SALUD
══════════════════════════════════════════ */
function toggleAcc(btn) {
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');

  // Cerrar todos
  document.querySelectorAll('.acc-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.acc-header').forEach(h => h.classList.remove('active'));

  // Si no estaba abierto, abrir este
  if (!isOpen) {
    body.classList.add('open');
    btn.classList.add('active');
  }
}

/* ══════════════════════════════════════════
   QUIZ BAR — inicializar en 0%
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  const bar = document.getElementById('quiz-bar');
  if (bar) bar.style.width = '0%';
});

/* ══════════════════════════════════════════
   CONTADOR DE REPORTES
══════════════════════════════════════════ */
let reportes = 0;
function enviarReporte() {
  reportes++;
  const el = document.getElementById('report-count');
  if (!el) return;
  el.textContent = reportes;
  el.classList.remove('report-pulse');
  void el.offsetWidth; // reflow para reiniciar animación
  el.classList.add('report-pulse');
}

/* ══════════════════════════════════════════
   MAPA — LEAFLET
══════════════════════════════════════════ */
let mapInitialized = false;
function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  const map = L.map('map').setView([-34.55, -58.45], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Zonas de contaminación
  const zonas = [
    {
      coords: [[-34.60,-58.55],[-34.56,-58.55],[-34.56,-58.47],[-34.60,-58.47]],
      color:'#f44336', label:'Matanza-Riachuelo', level:'crítica',
      desc:'Contaminación severa por industrias y vuelcos cloacales. Zona con mayor concentración de metales pesados.'
    },
    {
      coords: [[-34.50,-58.52],[-34.46,-58.52],[-34.46,-58.44],[-34.50,-58.44]],
      color:'#ff9800', label:'Costa Norte GBA', level:'moderada',
      desc:'Presencia de bacterias coliformes y residuos plásticos. Afecta municipios de la costa norte.'
    },
    {
      coords: [[-34.42,-58.40],[-34.38,-58.40],[-34.38,-58.32],[-34.42,-58.32]],
      color:'#4caf50', label:'Delta del Tigre', level:'leve',
      desc:'Contaminación controlada. Se detectan trazas de agroquímicos por escorrentía agrícola.'
    }
  ];

  zonas.forEach(z => {
    L.polygon(z.coords, {
      color: z.color, weight:2, fillColor: z.color, fillOpacity:0.25
    }).addTo(map).bindPopup(
      `<strong>${z.label}</strong><br>Nivel: ${z.level}<br><small>${z.desc}</small>`
    );
  });

  // Puntos de toma AySA
  const puntosAySA = [
    { lat:-34.598, lng:-58.487, nombre:'Planta Gral. San Martín' },
    { lat:-34.485, lng:-58.432, nombre:'Planta Palermo' },
    { lat:-34.432, lng:-58.365, nombre:'Planta Belgrano' }
  ];

  const iconAySA = L.divIcon({
    html:'<div style="background:#2196f3;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px #2196f3"></div>',
    iconSize:[12,12], className:''
  });

  puntosAySA.forEach(p => {
    L.marker([p.lat, p.lng], {icon: iconAySA})
      .addTo(map)
      .bindPopup(`<strong>AySA</strong><br>${p.nombre}`);
  });
}

// Iniciar mapa cuando la sección es visible
const mapSection = document.getElementById('mapa');
if (mapSection) {
  const mapObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      initMap();
      mapObserver.disconnect();
    }
  }, { threshold: 0.2 });
  mapObserver.observe(mapSection);
}

/* ══════════════════════════════════════════
   CALCULADORA DE RIESGO
══════════════════════════════════════════ */
const calcPreguntas = [
  {
    pregunta: '¿Con qué frecuencia consumís agua del grifo sin filtrar?',
    opciones: ['Nunca','A veces (1-2 veces/semana)','Con frecuencia (3-5 veces/semana)','Siempre (a diario)'],
    pesos: [0,1,2,3]
  },
  {
    pregunta: '¿Vivís a menos de 2 km de un río o arroyo de la cuenca?',
    opciones: ['No','A más de 2 km','Entre 1 y 2 km','A menos de 1 km'],
    pesos: [0,0,1,2]
  },
  {
    pregunta: '¿Realizás actividades recreativas (baño, pesca) en el Río de la Plata o sus afluentes?',
    opciones: ['Nunca','Raramente','Ocasionalmente','Frecuentemente'],
    pesos: [0,1,2,3]
  },
  {
    pregunta: '¿Hay niños menores de 5 años o adultos mayores en tu hogar?',
    opciones: ['No','Sí (grupo de riesgo moderado)'],
    pesos: [0,2]
  },
  {
    pregunta: '¿Consumís pescado capturado en la cuenca Matanza-Riachuelo o zonas cercanas?',
    opciones: ['Nunca','Raramente','1-2 veces por semana','Más de 2 veces por semana'],
    pesos: [0,1,2,3]
  }
];

let calcStep = 0;
let calcScore = 0;

function initCalc() {
  calcStep = 0;
  calcScore = 0;
  renderCalc();
}

function renderCalc() {
  const box = document.getElementById('calc-content');
  if (!box) return;

  if (calcStep >= calcPreguntas.length) {
    showCalcResult(box);
    return;
  }

  const q = calcPreguntas[calcStep];
  const progress = calcPreguntas.map((_, i) => {
    if (i < calcStep)  return '<div class="calc-step-dot done"></div>';
    if (i === calcStep) return '<div class="calc-step-dot active"></div>';
    return '<div class="calc-step-dot"></div>';
  }).join('');

  box.innerHTML = `
    <div class="calc-progress">${progress}</div>
    <p class="calc-question">${q.pregunta}</p>
    <div class="calc-options">
      ${q.opciones.map((op, i) =>
        `<button class="calc-opt" onclick="calcAnswer(${q.pesos[i]})">${op}</button>`
      ).join('')}
    </div>
  `;
}

function calcAnswer(peso) {
  calcScore += peso;
  calcStep++;
  renderCalc();
}

function showCalcResult(box) {
  let nivel, clase, desc;
  if (calcScore <= 3) {
    nivel = 'Riesgo Bajo'; clase = 'risk-bajo';
    desc = 'Tu exposición a contaminantes del agua es baja. Igual te recomendamos usar agua potable certificada y evitar el contacto directo con aguas de la cuenca.';
  } else if (calcScore <= 7) {
    nivel = 'Riesgo Moderado'; clase = 'risk-medio';
    desc = 'Tenés una exposición moderada. Considerá instalar un filtro certificado, evitar consumir pescado de zonas contaminadas y no bañarte en el Riachuelo o afluentes.';
  } else {
    nivel = 'Riesgo Alto'; clase = 'risk-alto';
    desc = 'Tu nivel de exposición es alto. Te recomendamos consultar a un médico, utilizar únicamente agua de red filtrada o mineral, y reportar la situación al ACUMAR.';
  }

  box.innerHTML = `
    <div class="calc-result">
      <div class="risk-badge ${clase}">${nivel}</div>
      <p class="risk-desc">${desc}</p>
      <button class="calc-restart" onclick="initCalc()">Volver a calcular</button>
    </div>
  `;
}

/* ══════════════════════════════════════════
   QUIZ DE CONCIENCIA
══════════════════════════════════════════ */
const quizPreguntas = [
  {
    pregunta: '¿Cuál es el principal contaminante del Río de la Plata según los estudios del CONICET?',
    opciones: ['Petróleo crudo','Metales pesados y agroquímicos','Residuos plásticos exclusivamente','Sal marina'],
    correcta: 1,
    explicacion: 'Los metales pesados (plomo, mercurio, cromo) y los agroquímicos (glifosato, atrazina) son los principales contaminantes identificados por el CONICET en la cuenca.',
    tema: 'Metales pesados y agroquímicos',
    icono: '🧪',
    infoExtra: 'El plomo y el mercurio provienen sobre todo de curtiembres, industrias metalúrgicas y galvanoplastía instaladas a lo largo de la cuenca, mientras que el glifosato y la atrazina llegan por escorrentía desde campos agrícolas cercanos. Estas sustancias se acumulan en sedimentos y en la cadena alimentaria, por lo que sus efectos persisten incluso años después de reducirse los vuelcos.'
  },
  {
    pregunta: '¿Qué organismo argentino es responsable del saneamiento de la cuenca Matanza-Riachuelo?',
    opciones: ['AySA','SENASA','ACUMAR','Ministerio de Obras Públicas'],
    correcta: 2,
    explicacion: 'ACUMAR (Autoridad de Cuenca Matanza Riachuelo) es el organismo creado en 2006 para gestionar el saneamiento de la cuenca y controlar la contaminación.',
    tema: 'ACUMAR y el saneamiento de la cuenca',
    icono: '🏛️',
    infoExtra: 'ACUMAR reúne a Nación, Provincia de Buenos Aires y CABA, y nació tras el fallo "Mendoza" de la Corte Suprema en 2008, que ordenó recomponer el ambiente de la cuenca. Entre sus funciones están el control de industrias, la relocalización de asentamientos ribereños y el monitoreo periódico de la calidad del agua y el aire en la zona.'
  },
  {
    pregunta: '¿Cuántas personas viven en la cuenca Matanza-Riachuelo aproximadamente?',
    opciones: ['500.000','1 millón','5 millones','10 millones'],
    correcta: 2,
    explicacion: 'Alrededor de 5 millones de personas habitan en la cuenca Matanza-Riachuelo, una de las más contaminadas de América Latina según la OMS.',
    tema: 'Población e impacto social',
    icono: '👥',
    infoExtra: 'La cuenca abarca 14 municipios del conurbano bonaerense y parte de la Ciudad de Buenos Aires. Gran parte de esa población vive en villas y asentamientos precarios sin cloacas ni agua de red, lo que aumenta su exposición directa a los contaminantes y hace del saneamiento hídrico también un problema de justicia social.'
  },
  {
    pregunta: '¿Qué ODS de la ONU está directamente relacionado con el acceso al agua limpia y saneamiento?',
    opciones: ['ODS 3','ODS 6','ODS 12','ODS 14'],
    correcta: 1,
    explicacion: 'El ODS 6 (Agua limpia y saneamiento) busca garantizar la disponibilidad y gestión sostenible del agua y el saneamiento para todos antes del 2030.',
    tema: 'ODS 6 · Agua limpia y saneamiento',
    icono: '🎯',
    infoExtra: 'El ODS 6 incluye metas específicas como mejorar la calidad del agua reduciendo la contaminación y los vertidos de sustancias peligrosas, proteger los ecosistemas relacionados con el agua y ampliar la cooperación internacional en proyectos de saneamiento. También se vincula con los ODS 3 (salud), 14 (vida submarina) y 15 (vida de ecosistemas terrestres) que se muestran en este sitio.'
  },
  {
    pregunta: '¿Cuál de estas enfermedades NO está directamente asociada al consumo de agua contaminada?',
    opciones: ['Hepatitis A','Cólera','Diabetes tipo 2','Leptospirosis'],
    correcta: 2,
    explicacion: 'La diabetes tipo 2 es una enfermedad metabólica no infecciosa. Las otras tres (hepatitis A, cólera, leptospirosis) se transmiten a través del agua contaminada.',
    tema: 'Enfermedades hídricas',
    icono: '🏥',
    infoExtra: 'La hepatitis A y el cólera se contagian por vía fecal-oral cuando el agua está contaminada con materia fecal, mientras que la leptospirosis se contrae por contacto de la piel o mucosas con agua u orina de roedores infectados, algo frecuente en zonas inundables de la cuenca. Ante síntomas como fiebre, diarrea o ictericia tras contacto con agua de dudosa calidad, se recomienda consultar rápidamente a un centro de salud.'
  }
];

let quizStep = 0;
let quizScore = 0;
let quizAnswered = false;

function initQuiz() {
  quizStep = 0;
  quizScore = 0;
  quizAnswered = false;
  renderQuiz();
}

function renderQuiz() {
  const box = document.getElementById('quiz-content');
  if (!box) return;

  if (quizStep >= quizPreguntas.length) {
    showQuizResult(box);
    return;
  }

  const q = quizPreguntas[quizStep];
  const pct = (quizStep / quizPreguntas.length * 100).toFixed(0);
  const bar = document.getElementById('quiz-bar');
  if (bar) bar.style.width = pct + '%';

  box.innerHTML = `
    <p class="quiz-q-counter">Pregunta ${quizStep + 1} de ${quizPreguntas.length}</p>
    <p class="quiz-question">${q.pregunta}</p>
    <div class="quiz-opts">
      ${q.opciones.map((op, i) =>
        `<button class="quiz-opt" id="qopt-${i}" onclick="quizAnswer(${i})">${op}</button>`
      ).join('')}
    </div>
    <div class="quiz-feedback" id="quiz-feedback"></div>
    <button class="quiz-next" id="quiz-next" onclick="quizNext()">Siguiente →</button>
  `;
}

function quizAnswer(idx) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = quizPreguntas[quizStep];
  const opts = document.querySelectorAll('.quiz-opt');
  const feedback = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next');

  opts.forEach(b => b.disabled = true);
  opts[q.correcta].classList.add('correct');

  if (idx === q.correcta) {
    quizScore++;
    if (feedback) {
      feedback.textContent = '✓ ¡Correcto! ' + q.explicacion;
      feedback.className = 'quiz-feedback show ok';
    }
  } else {
    opts[idx].classList.add('wrong');
    if (feedback) {
      feedback.textContent = '✗ Incorrecto. ' + q.explicacion;
      feedback.className = 'quiz-feedback show fail';
    }
  }

  if (nextBtn) nextBtn.classList.add('show');
}

function quizNext() {
  quizStep++;
  quizAnswered = false;
  renderQuiz();
}

function showQuizResult(box) {
  const bar = document.getElementById('quiz-bar');
  if (bar) bar.style.width = '100%';

  let msg;
  if (quizScore === 5) msg = '¡Perfecto! Sos un experto en agua y ambiente. 🌿';
  else if (quizScore >= 3) msg = 'Muy bien. Tenés buen conocimiento sobre contaminación hídrica.';
  else msg = 'Seguí aprendiendo. Cada dato cuenta para proteger el agua.';

  injectQuizInfoStyles();

  const temasHTML = quizPreguntas.map((q, i) =>
    `<div class="quiz-info-card" id="quiz-info-card-${i}">
       <button class="quiz-info-header" onclick="toggleQuizInfo(${i})">
         <span class="quiz-info-icon">${q.icono}</span>
         <span class="quiz-info-title">${q.tema}</span>
         <span class="quiz-info-chevron" id="quiz-info-chev-${i}">▾</span>
       </button>
       <div class="quiz-info-body" id="quiz-info-body-${i}">
         <p>${q.infoExtra}</p>
       </div>
     </div>`
  ).join('');

  box.innerHTML = `
    <div class="quiz-result">
      <div class="quiz-score">${quizScore}/${quizPreguntas.length}</div>
      <p>${msg}</p>
      <button class="calc-restart" onclick="initQuiz()">Intentar de nuevo</button>
    </div>
    <div class="quiz-info-section">
      <h4 class="quiz-info-title-main">📚 Más información sobre cada tema</h4>
      <p class="quiz-info-subtitle">Tocá un tema del quiz para profundizar.</p>
      <div class="quiz-info-list">
        ${temasHTML}
      </div>
    </div>
  `;

  // Evento: al terminar el quiz, dispara un evento personalizado
  // que otros scripts de la página puedan escuchar si lo necesitan.
  document.dispatchEvent(new CustomEvent('quizFinalizado', {
    detail: { score: quizScore, total: quizPreguntas.length, temas: quizPreguntas.map(q => q.tema) }
  }));
}

function toggleQuizInfo(idx) {
  const body = document.getElementById(`quiz-info-body-${idx}`);
  const chev = document.getElementById(`quiz-info-chev-${idx}`);
  const card = document.getElementById(`quiz-info-card-${idx}`);
  if (!body) return;
  const isOpen = body.classList.contains('open');

  document.querySelectorAll('.quiz-info-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.quiz-info-chevron').forEach(c => c.classList.remove('rotated'));
  document.querySelectorAll('.quiz-info-card').forEach(c => c.classList.remove('active'));

  if (!isOpen) {
    body.classList.add('open');
    if (chev) chev.classList.add('rotated');
    if (card) card.classList.add('active');
  }
}

function injectQuizInfoStyles() {
  if (document.getElementById('quiz-info-styles')) return;
  const style = document.createElement('style');
  style.id = 'quiz-info-styles';
  style.textContent = `
    .quiz-info-section { margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(132,215,212,0.18); }
    .quiz-info-title-main { margin: 0 0 4px; font-family: 'Playfair Display', serif; font-size: 1.05rem; color: #84D7D4; }
    .quiz-info-subtitle { margin: 0 0 14px; font-size: 0.85rem; color: rgba(255,255,255,0.6); }
    .quiz-info-list { display: flex; flex-direction: column; gap: 10px; }
    .quiz-info-card { border: 1px solid rgba(132,215,212,0.18); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.03); transition: border-color .2s ease; }
    .quiz-info-card.active { border-color: rgba(132,215,212,0.55); }
    .quiz-info-header { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: transparent; border: none; cursor: pointer; text-align: left; font-family: 'Lato', sans-serif; color: #fff; }
    .quiz-info-icon { font-size: 1.1rem; }
    .quiz-info-title { flex: 1; font-size: 0.92rem; font-weight: 600; }
    .quiz-info-chevron { transition: transform .2s ease; color: #84D7D4; }
    .quiz-info-chevron.rotated { transform: rotate(180deg); }
    .quiz-info-body { max-height: 0; overflow: hidden; transition: max-height .3s ease; padding: 0 14px; }
    .quiz-info-body.open { max-height: 260px; padding: 0 14px 14px; }
    .quiz-info-body p { margin: 0; font-size: 0.85rem; line-height: 1.55; color: rgba(255,255,255,0.82); }
  `;
  document.head.appendChild(style);
}

/* ══════════════════════════════════════════
   GRÁFICOS — CHART.JS
══════════════════════════════════════════ */
let chartsInitialized = false;

function initCharts() {
  if (chartsInitialized) return;
  if (typeof Chart === 'undefined') return;
  chartsInitialized = true;

  Chart.defaults.color = 'rgba(255,255,255,0.75)';
  Chart.defaults.font.family = "'Lato', sans-serif";

  // 1. Doughnut — zonas por nivel
  const ctx1 = document.getElementById('chart-zonas');
  if (ctx1) {
    new Chart(ctx1, {
      type:'doughnut',
      data:{
        labels:['Crítica','Alta','Moderada','Leve'],
        datasets:[{
          data:[15,28,38,19],
          backgroundColor:['#f44336','#ff9800','#ffca28','#4caf50'],
          borderColor:'rgba(26,94,92,0.5)', borderWidth:2
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:true,
        plugins:{ legend:{ position:'bottom', labels:{ padding:14, font:{size:11} } } }
      }
    });
  }

  // 2. Barra horizontal — reportes por zona
  const ctx2 = document.getElementById('chart-reportes');
  if (ctx2) {
    new Chart(ctx2, {
      type:'bar',
      data:{
        labels:['Riachuelo','Quilmes','Avellaneda','La Boca','Tigre','San Isidro'],
        datasets:[{
          label:'Reportes 2023',
          data:[142,98,87,76,54,31],
          backgroundColor:'rgba(132,215,212,0.55)',
          borderColor:'rgba(132,215,212,0.90)', borderWidth:1.5,
          borderRadius:6
        }]
      },
      options:{
        indexAxis:'y', responsive:true, maintainAspectRatio:true,
        plugins:{ legend:{ display:false } },
        scales:{
          x:{ grid:{ color:'rgba(255,255,255,0.07)' }, ticks:{ font:{size:11} } },
          y:{ grid:{ display:false }, ticks:{ font:{size:11} } }
        }
      }
    });
  }

  // 3. Línea — evolución de alertas
  const ctx3 = document.getElementById('chart-alertas');
  if (ctx3) {
    new Chart(ctx3, {
      type:'line',
      data:{
        labels:['2018','2019','2020','2021','2022','2023'],
        datasets:[
          {
            label:'Alertas críticas',
            data:[48,55,43,62,71,58],
            borderColor:'#f44336', backgroundColor:'rgba(244,67,54,0.12)',
            tension:0.4, fill:true, pointRadius:4
          },
          {
            label:'Alertas moderadas',
            data:[89,102,95,110,118,134],
            borderColor:'#84D7D4', backgroundColor:'rgba(132,215,212,0.10)',
            tension:0.4, fill:true, pointRadius:4
          }
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:true,
        plugins:{ legend:{ position:'bottom', labels:{ padding:12, font:{size:11} } } },
        scales:{
          x:{ grid:{ color:'rgba(255,255,255,0.07)' } },
          y:{ grid:{ color:'rgba(255,255,255,0.07)' } }
        }
      }
    });
  }

  // 4. Polar area — contaminantes
  const ctx4 = document.getElementById('chart-contaminantes');
  if (ctx4) {
    new Chart(ctx4, {
      type:'polarArea',
      data:{
        labels:['Plomo','Mercurio','Cromo','Glifosato','Coliformes','Nitratos'],
        datasets:[{
          data:[72,58,64,85,91,47],
          backgroundColor:[
            'rgba(244,67,54,0.55)','rgba(255,152,0,0.55)','rgba(255,193,7,0.55)',
            'rgba(76,175,80,0.55)','rgba(33,150,243,0.55)','rgba(156,39,176,0.55)'
          ],
          borderColor:'rgba(26,94,92,0.5)', borderWidth:1.5
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:true,
        plugins:{ legend:{ position:'bottom', labels:{ padding:10, font:{size:11} } } },
        scales:{ r:{ grid:{ color:'rgba(255,255,255,0.08)' }, ticks:{ display:false } } }
      }
    });
  }
}

const statsSection = document.getElementById('estadisticas');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      initCharts();
      statsObserver.disconnect();
    }
  }, { threshold: 0.15 });
  statsObserver.observe(statsSection);
}

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════
   NAV ACTIVO POR PÁGINA
══════════════════════════════════════════ */
(function() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
})();
