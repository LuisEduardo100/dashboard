// --- DADOS MOCKADOS ---
const MOCK_DATA = {
  kpis: { novos: 19680, convertidos: 1260, descartados: 147, total: 21087 },
  percentuais: {
    novos: '93.3%',
    convertidos: '6.0%',
    descartados: '0.7%',
    varejo: '27.8%',
    projeto: '72.2%',
  },
  segmentacao: { varejo_qtd: 350, projeto_qtd: 910, total_analisado: 1260 },
  motivosDescarte: {
    labels: [
      'Preço fora do orçamento',
      'Concorrente (Menor Preço)',
      'Sem Estoque Imediato',
      'Cliente parou de responder',
      'Região não atendida',
      'Lead Duplicado',
    ],
    data: [55, 32, 25, 20, 10, 5],
  },
  graficoFontesDeals: {
    labels: [
      '51 Google',
      '54 Indicação Profissional',
      '53 Indicação Amigo',
      '52 Instagram',
      '65 Site',
    ],
    data: [400, 250, 150, 100, 10],
  },
  graficoFontesLeadsBrutos: {
    labels: [
      '55 Centro de Formação ALED (CFA)',
      '50 Prospecção',
      '51 Google',
      '53 Indicação Amigo',
      '52 Instagram',
      '61 Facebook',
    ],
    data: [1828, 354, 179, 100, 90, 87],
  },
  graficoStatus: { novos: 19680, convertidos: 1260, descartados: 147 },
};

// --- GERAÇÃO DE LEADS FALSOS ---
function gerarLeadsMock() {
  const nomes = [
    'João Silva',
    'Maria Oliveira',
    'Carlos Santos',
    'Ana Souza',
    'Pedro Lima',
    'Fernanda Costa',
  ];
  const origens = ['Google', 'Instagram', 'Indicação', 'Site', 'Prospecção'];
  const cidades = [
    'Fortaleza',
    'São Paulo',
    'Rio de Janeiro',
    'Salvador',
    'Curitiba',
  ];

  let leads = [];
  for (let i = 0; i < 500; i++) {
    leads.push({
      id: i + 1,
      nome: nomes[Math.floor(Math.random() * nomes.length)] + ` ${i + 1}`,
      telefone: `(85) 9${Math.floor(Math.random() * 9000) + 1000}-${
        Math.floor(Math.random() * 9000) + 1000
      }`,
      origem: origens[Math.floor(Math.random() * origens.length)],
      cidade: cidades[Math.floor(Math.random() * cidades.length)],
      uf: 'CE',
      bitrix_id: 1000 + i,
    });
  }
  return leads;
}

const DB_LEADS_MOCK = gerarLeadsMock();
let DADOS_CRM = MOCK_DATA;

// --- PAGINAÇÃO ---
let paginaAtual = 0;
const itensPorPagina = 15;
let carregando = false;

// --- PAINEL ---
function openAtendimentoPanel() {
  document.getElementById('overlay').classList.add('active');
  document.getElementById('atendimentoPanel').classList.add('active');
  const tbody = document.getElementById('leadsTableBody');
  if (tbody.children.length === 0) {
    carregarMaisLeads();
  }
}

function closeAtendimentoPanel() {
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('atendimentoPanel').classList.remove('active');
}

function carregarMaisLeads() {
  if (carregando) return;
  carregando = true;
  document.getElementById('loadMoreBtn').disabled = true;
  document.getElementById('loadingSpinner').style.display = 'block';
  document.getElementById('btnText').innerText = 'Carregando...';

  setTimeout(() => {
    const inicio = paginaAtual * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const novosLeads = DB_LEADS_MOCK.slice(inicio, fim);

    renderizarTabela(novosLeads);

    paginaAtual++;
    carregando = false;
    document.getElementById('loadMoreBtn').disabled = false;
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('btnText').innerText = 'Carregar Mais';

    if (novosLeads.length < itensPorPagina) {
      document.getElementById('loadMoreBtn').style.display = 'none';
    }
  }, 600);
}

function renderizarTabela(lista) {
  const tbody = document.getElementById('leadsTableBody');
  lista.forEach((lead) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
                    <td>
                        <div style="font-weight:600; color:var(--text-primary)">${lead.nome}</div>
                        <div style="font-size:0.8rem; color:var(--text-secondary)">${lead.telefone}</div>
                    </td>
                    <td><span class="tag-source">${lead.origem}</span></td>
                    <td>${lead.cidade}/${lead.uf}</td>
                    <td>
                        <div style="display:flex;">
                            <a href="#" class="action-link" title="Abrir no Bitrix"><span class="material-symbols-outlined" style="font-size:18px">open_in_new</span></a>
                            <a href="#" class="action-link" title="Abrir no Kinbox"><span class="material-symbols-outlined" style="font-size:18px">chat</span></a>
                        </div>
                    </td>
                `;
    tbody.appendChild(tr);
  });
}

// --- DADOS ---
const rawLabels = DADOS_CRM.graficoFontesLeadsBrutos?.labels || [];
const rawData = DADOS_CRM.graficoFontesLeadsBrutos?.data || [];
let fontesAgrupadas = {
  'Meta Ads': 0,
  'Google Ads': 0,
  Orgânico: 0,
  'Mídia Offline': 0,
};
let outrasFontes = [];

rawLabels.forEach((labelOriginal, index) => {
  const valor = rawData[index];
  const lowerLbl = labelOriginal.toLowerCase();
  if (lowerLbl.includes('facebook') || lowerLbl.includes('instagram'))
    fontesAgrupadas['Meta Ads'] += valor;
  else if (lowerLbl.includes('google')) fontesAgrupadas['Google Ads'] += valor;
  else if (lowerLbl.includes('site') || lowerLbl.includes('web'))
    fontesAgrupadas['Orgânico'] += valor;
  else if (
    lowerLbl.includes('vitrine') ||
    lowerLbl.includes('encarte') ||
    lowerLbl.includes('outdoor')
  )
    fontesAgrupadas['Mídia Offline'] += valor;
  else
    outrasFontes.push({
      label: labelOriginal.replace(/^\d+\s/, ''),
      val: valor,
    });
});

let finalSourcesArray = [];
Object.entries(fontesAgrupadas).forEach(([key, val]) => {
  if (val > 0) finalSourcesArray.push({ label: key, val: val });
});
finalSourcesArray = finalSourcesArray.concat(outrasFontes);
finalSourcesArray.sort((a, b) => b.val - a.val);

const processedLabels = finalSourcesArray.map((i) => i.label);
const processedData = finalSourcesArray.map((i) => i.val);

// --- INTERFACE ---
function toggleDescarte() {
  const container = document.getElementById('container-descarte');

  // Alterna classe
  container.classList.toggle('active');

  // Redimensiona chart
  if (container.classList.contains('active')) {
    setTimeout(() => {
      if (window.motivosDescarteChart) window.motivosDescarteChart.resize();
    }, 100);
  }
}

function toggleSegmentacao() {
  const container = document.getElementById('container-segmentacao');

  // Alterna classe
  container.classList.toggle('active');

  // Redimensiona charts
  if (container.classList.contains('active')) {
    setTimeout(() => {
      if (window.segmentacaoChart) window.segmentacaoChart.resize();
      if (window.fontesDealsChart) window.fontesDealsChart.resize();
    }, 100);
  }
}

function toggleFilters() {
  const menu = document.getElementById('filtersMenu');
  const btn = document.getElementById('filterToggleBtn');

  // Abre/Fecha o menu
  menu.classList.toggle('open');

  // (Opcional) Muda a cor do botão quando ativo
  if (menu.classList.contains('open')) {
    btn.style.borderColor = 'var(--blue)';
    btn.style.color = 'var(--blue)';
  } else {
    btn.style.borderColor = 'var(--border-color)';
    btn.style.color = 'var(--text-secondary)';
  }
}

const params = new URLSearchParams(window.location.search);
const currentPeriod = params.get('periodo') || 'geral';
const activeBtn = document.getElementById(`btn-${currentPeriod}`);
if (activeBtn) activeBtn.classList.add('active');

window.filtrar = function (periodo) {
  console.log('Filtro:', periodo);
};

const animateValue = (id, end) => {
  const obj = document.getElementById(id);
  if (!obj) return;
  obj.innerHTML = (end || 0).toLocaleString('pt-BR');
};

if (DADOS_CRM.kpis) {
  animateValue('display-total', DADOS_CRM.kpis.total);
  animateValue('display-novos', DADOS_CRM.kpis.novos);
  animateValue('display-convertidos', DADOS_CRM.kpis.convertidos);
  animateValue('display-descartados', DADOS_CRM.kpis.descartados);
}

if (DADOS_CRM.percentuais) {
  document.getElementById('perc-novos').innerText =
    DADOS_CRM.percentuais.novos || '0%';
  document.getElementById('perc-convertidos').innerText =
    DADOS_CRM.percentuais.convertidos || '0%';
  document.getElementById('perc-descartados').innerText =
    DADOS_CRM.percentuais.descartados || '0%';
}

const sourcesContainer = document.getElementById('sources-container');
if (processedData.length > 0) {
  finalSourcesArray.slice(0, 8).forEach((item) => {
    const sourceItem = document.createElement('div');
    sourceItem.className = 'source-item';
    sourceItem.innerHTML = `<h5>${
      item.label
    }</h5><div class="count">${item.val.toLocaleString('pt-BR')}</div>`;
    sourcesContainer.appendChild(sourceItem);
  });
} else {
  sourcesContainer.innerHTML =
    '<p style="color:var(--text-secondary); grid-column:span 4; text-align:center;">Sem dados.</p>';
}

// --- CHARTS ---
Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";
Chart.defaults.color = '#a6b0cf';
const CORES_FONTES = [
  '#556ee6',
  '#34c38f',
  '#f1b44c',
  '#f46a6a',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#10b981',
];

new Chart(document.getElementById('statusChart'), {
  type: 'doughnut',
  data: {
    labels: ['Novos', 'Convertidos', 'Descartados'],
    datasets: [
      {
        data: [
          DADOS_CRM.graficoStatus?.novos,
          DADOS_CRM.graficoStatus?.convertidos,
          DADOS_CRM.graficoStatus?.descartados,
        ],
        backgroundColor: ['#f1b44c', '#34c38f', '#f46a6a'],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true },
      },
    },
  },
});

window.fontesChart = new Chart(document.getElementById('fontesChart'), {
  type: 'bar',
  data: {
    labels: processedLabels,
    datasets: [
      {
        label: 'Leads',
        data: processedData,
        backgroundColor: CORES_FONTES,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 40,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(166, 176, 207, 0.1)' } },
    },
  },
});

const qtdVarejo = DADOS_CRM.segmentacao?.varejo_qtd || 0;
const qtdProjeto = DADOS_CRM.segmentacao?.projeto_qtd || 0;

window.segmentacaoChart = new Chart(
  document.getElementById('segmentacaoChart'),
  {
    type: 'doughnut',
    data: {
      labels: [
        `Projeto (${DADOS_CRM.percentuais?.projeto})`,
        `Varejo (${DADOS_CRM.percentuais?.varejo})`,
      ],
      datasets: [
        {
          data: [qtdProjeto, qtdVarejo],
          backgroundColor: ['#556ee6', '#06b6d4'],
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 15,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 10 },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 15 },
        },
      },
    },
  }
);

const dealsLabelsRaw = DADOS_CRM.graficoFontesDeals?.labels || [];
const dealsDataRaw = DADOS_CRM.graficoFontesDeals?.data || [];
const dealsLabelsClean = dealsLabelsRaw.map((l) => l.replace(/^\d+\s/, ''));

window.fontesDealsChart = new Chart(
  document.getElementById('fontesDealsChart'),
  {
    type: 'doughnut',
    data: {
      labels: dealsLabelsClean,
      datasets: [
        {
          data: dealsDataRaw,
          backgroundColor: [
            '#34c38f',
            '#f1b44c',
            '#f46a6a',
            '#8b5cf6',
            '#ec4899',
          ],
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 10 },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            font: { size: 11 },
            padding: 15,
            color: '#a6b0cf',
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return ` ${context.label}: ${context.raw}`;
            },
          },
        },
      },
    },
  }
);

window.motivosDescarteChart = new Chart(
  document.getElementById('motivosDescarteChart'),
  {
    type: 'bar',
    data: {
      labels: MOCK_DATA.motivosDescarte.labels,
      datasets: [
        {
          label: 'Qtd. Leads',
          data: MOCK_DATA.motivosDescarte.data,
          // Usando a cor vermelha (#f46a6a) para manter consistência semântica com o card
          backgroundColor: '#f46a6a',
          borderRadius: 4,
          barThickness: 'flex',
          maxBarThickness: 30,
        },
      ],
    },
    options: {
      indexAxis: 'y', // <--- ISTO FAZ AS BARRAS FICAREM HORIZONTAIS
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }, // Esconde legenda pois só tem 1 dataset
        tooltip: {
          callbacks: {
            label: function (context) {
              return ` ${context.raw} leads perdidos`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(166, 176, 207, 0.1)' },
          ticks: { color: '#a6b0cf' },
        },
        y: {
          grid: { display: false }, // Remove linhas verticais para ficar mais limpo
          ticks: {
            color: '#a6b0cf',
            font: { weight: '500' }, // Destaca o motivo
          },
        },
      },
    },
  }
);

// Theme Switcher
document.getElementById('themeBtn').addEventListener('click', function () {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  this.querySelector('span').textContent = isLight ? 'dark_mode' : 'light_mode';

  const textColor = isLight ? '#74788d' : '#a6b0cf';
  const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(166, 176, 207, 0.1)';

  [
    Chart.getChart('statusChart'),
    window.fontesChart,
    window.segmentacaoChart,
    window.fontesDealsChart,
  ].forEach((chart) => {
    if (chart) {
      chart.defaults.color = textColor;
      if (chart.options.plugins.legend)
        chart.options.plugins.legend.labels.color = textColor;
      if (chart.options.scales?.x) {
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.x.grid.color = gridColor;
      }
      if (chart.options.scales?.y) {
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.y.grid.color = gridColor;
      }
      chart.update();
    }
  });
});
