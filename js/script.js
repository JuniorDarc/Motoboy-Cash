// motoBoy_Cash
const apps = ["uber", "indrive", "99"];
const dados = {
  uber: [],
  indrive: [],
  "99": []
};

apps.forEach(app => {
  const salvo = localStorage.getItem("dados_" + app);
  if (salvo) dados[app] = JSON.parse(salvo);
  atualizarResumo(app);
});

function adicionarDia(app) {
  const container = document.getElementById("formDias" + appId(app));

  const div = document.createElement("div");
  div.className = "dia";

  div.innerHTML = `
    <label>Data:</label>
    <input type="date" class="data" />
    <label>Valor ganho (R$):</label>
    <input type="number" class="ganho" placeholder="Ex: 150" />
    <div class="gastos"></div>
    <button onclick="adicionarGasto(this)">Adicionar Gasto</button>
    <button onclick="salvarDia(this, '${app}')">Salvar Dia</button>
  `;

  container.appendChild(div);
}


function adicionarGasto(botao) {
  const container = document.createElement("div");
  container.className = "gasto";
  container.innerHTML = `
    <input type="text" placeholder="Descrição" />
    <input type="number" placeholder="Valor (R$)" />
    <button class="remove-btn" onclick="this.parentElement.remove()">X</button>
  `;
  botao.previousElementSibling.appendChild(container);
}

function salvarDia(botao, app) {
  const diaDiv = botao.parentElement;
  const data = diaDiv.querySelector(".data").value;
  const ganho = parseFloat(diaDiv.querySelector(".ganho").value);
  const gastos = diaDiv.querySelectorAll(".gasto");

  if (!data || isNaN(ganho)) {
    alert("Insira a data e o valor ganho.");
    return;
  }

  const listaGastos = [];
  gastos.forEach(g => {
    const nome = g.children[0].value || "Sem descrição";
    const valor = parseFloat(g.children[1].value);
    if (!isNaN(valor)) {
      listaGastos.push({ nome, valor });
    }
  });

  dados[app].push({ data, ganho, gastos: listaGastos });
  localStorage.setItem("dados_" + app, JSON.stringify(dados[app]));

  diaDiv.remove();
  atualizarResumo(app);
}

function atualizarResumo(app) {
  const container = document.getElementById("resumo" + appId(app));
  const dias = dados[app];
  let totalGanho = 0;
  let totalGasto = 0;
  const detalhes = {};

  let html = "";

  const ultimo = dias[dias.length - 1];
if (ultimo) {
  const index = dias.length - 1;
  totalGanho += ultimo.ganho;
  ultimo.gastos.forEach(g => {
    totalGasto += g.valor;
    if (!detalhes[g.nome]) detalhes[g.nome] = 0;
    detalhes[g.nome] += g.valor;
  });

  html += `<div class="dia">
    <strong>Dia:</strong> ${ultimo.data}<br>
    <strong>Ganho:</strong> R$ ${ultimo.ganho.toFixed(2)}<br>
    <strong>Gastos:</strong>
    <ul>
      ${ultimo.gastos.map(g => `<li>${g.nome}: R$ ${g.valor.toFixed(2)}</li>`).join("")}
    </ul>
    <button class="remove-btn" onclick="removerDia('${app}', ${index})">Excluir</button>
    <button onclick="editarDiaRegistro('${app}', ${index})">Editar</button>
  </div>`;
}


  const lucro = totalGanho - totalGasto;

  html += `<br><strong>Total Ganho:</strong> R$ ${totalGanho.toFixed(2)}<br>
           <strong>Total Gasto:</strong> R$ ${totalGasto.toFixed(2)}<br>
           <strong>Lucro:</strong> R$ ${lucro.toFixed(2)}<br><br>
           <strong>Detalhes:</strong><ul>`;

  for (let nome in detalhes) {
    const valor = detalhes[nome];
    const porcentagem = (valor / totalGanho) * 100;
    html += `<li>${nome}: R$ ${valor.toFixed(2)} (${porcentagem.toFixed(2)}%)</li>`;
  }

  html += "</ul>";
  container.innerHTML = html;
}

function removerDia(app, index) {
  if (confirm("Deseja realmente excluir este dia?")) {
    dados[app].splice(index, 1);
    localStorage.setItem("dados_" + app, JSON.stringify(dados[app]));
    atualizarResumo(app);
  }
}

function editarDia(app, index) {
  // Força abrir a aba 'salvos' antes de mostrar o formulário de edição
  abrirAba('salvos');  // <-- força mostrar aba Dias Salvos (chama sua função de troca de aba)

  const dias = carregarDados(app);
  const dia = dias[index];

  const container = document.getElementById('listaDiasSalvos');
  container.innerHTML = ""; // Limpa tudo para exibir o formulário de edição

  const div = document.createElement("div");
  div.className = "dia";

  div.innerHTML = `
    <label><strong>Data:</strong></label>
    <input type="date" value="${dia.data}" class="edit-data" />

    <label><strong>Valor ganho (R$):</strong></label>
    <input type="number" value="${dia.ganho}" class="edit-ganho" />

    <div class="gastos-edit">
      ${dia.gastos.map((gasto, gi) => `
        <input type="text" value="${gasto.nome}" class="edit-gasto-nome" data-index="${gi}" />
        <input type="number" value="${gasto.valor}" class="edit-gasto-valor" data-index="${gi}" />
      `).join("")}
    </div>

    <button onclick="salvarEdicao('${app}', ${index})">Salvar Edição</button>
    <button class="remove-btn" onclick="mostrarDiasSalvos()">Cancelar</button>
  `;

  container.appendChild(div);
}




function salvarEdicaoDireta(botao, app, index) {
  const diaDiv = botao.parentElement;
  const data = diaDiv.querySelector(".data").value;
  const ganho = parseFloat(diaDiv.querySelector(".ganho").value);
  const gastos = diaDiv.querySelectorAll(".gasto");

  if (!data || isNaN(ganho)) {
    alert("Preencha os campos corretamente.");
    return;
  }

  const listaGastos = [];
  gastos.forEach(g => {
    const nome = g.children[0].value || "Sem descrição";
    const valor = parseFloat(g.children[1].value);
    if (!isNaN(valor)) {
      listaGastos.push({ nome, valor });
    }
  });

  dados[app][index] = { data, ganho, gastos: listaGastos };
  localStorage.setItem("dados_" + app, JSON.stringify(dados[app]));

  atualizarResumo(app);
  document.getElementById("formDias" + appId(app)).innerHTML = "";
}


function salvarEdicao(app, index) {
  const container = document.getElementById("listaDiasSalvos");
  // Pega o único elemento .dia dentro do container (o que está sendo editado)
  const diaDiv = container.querySelector('.dia');

  const novaData = diaDiv.querySelector(".edit-data").value;
  const novoGanho = parseFloat(diaDiv.querySelector(".edit-ganho").value);

  const nomes = diaDiv.querySelectorAll(".edit-gasto-nome");
  const valores = diaDiv.querySelectorAll(".edit-gasto-valor");

  const novosGastos = [];
  for (let i = 0; i < nomes.length; i++) {
    const nome = nomes[i].value;
    const valor = parseFloat(valores[i].value);
    if (nome && !isNaN(valor)) {
      novosGastos.push({ nome, valor });
    }
  }

  const dias = carregarDados(app); // carrega dados atualizados
  dias[index] = { data: novaData, ganho: novoGanho, gastos: novosGastos };
  salvarDados(app, dias);

  mostrarDiasSalvos(); // Atualiza a lista toda
  atualizarResumo(app); // Atualiza o resumo
}


function calcularResumo(app) {
  atualizarResumo(app);
}

function calcularConsolidado() {
  let totalGanho = 0;
  let totalGasto = 0;
  const detalhes = {};

  apps.forEach(app => {
    dados[app].forEach(dia => {
      totalGanho += dia.ganho;
      dia.gastos.forEach(g => {
        totalGasto += g.valor;
        if (!detalhes[g.nome]) detalhes[g.nome] = 0;
        detalhes[g.nome] += g.valor;
      });
    });
  });

  const lucro = totalGanho - totalGasto;

  let html = `<strong>Total Geral Ganho:</strong> R$ ${totalGanho.toFixed(2)}<br>
              <strong>Total Geral Gasto:</strong> R$ ${totalGasto.toFixed(2)}<br>
              <strong>Lucro Geral:</strong> R$ ${lucro.toFixed(2)}<br><br>
              <strong>Gastos Consolidados:</strong><ul>`;

  for (let nome in detalhes) {
    const valor = detalhes[nome];
    const porcentagem = (valor / totalGanho) * 100;
    html += `<li>${nome}: R$ ${valor.toFixed(2)} (${porcentagem.toFixed(2)}%)</li>`;
  }

  html += "</ul>";
  document.getElementById("resumoGeral").innerHTML = html;
}

function appId(app) {
  if (app === "uber") return "Uber";
  if (app === "indrive") return "InDrive";
  if (app === "99") return "99";
  return capitalize(app);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function abrirAba(nome, event) {
  // Esconder todas abas
  document.querySelectorAll('.tab-content').forEach(div => div.style.display = 'none');
  // Remover active dos botões
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

  // Mostrar aba selecionada
  document.getElementById(nome).style.display = 'block';

  if(event) event.currentTarget.classList.add('active');
  else {
    // Se chamada programaticamente sem evento, ativa botão da aba
    const btn = [...document.querySelectorAll('.tab-button')].find(b => b.textContent.toLowerCase().includes(nome.toLowerCase()));
    if (btn) btn.classList.add('active');
  }

  // Atualizar lista se for aba de dias salvos
  if (nome === 'salvos') {
    mostrarDiasSalvos();
  }
}

function editarDiaRegistro(app, index) {
  const dia = dados[app][index];
  const container = document.getElementById("formDias" + appId(app));
  container.innerHTML = ''; // limpa a área

  const div = document.createElement("div");
  div.className = "dia";

  div.innerHTML = `
    <label>Data:</label>
    <input type="date" class="data" value="${dia.data}" />
    <label>Valor ganho (R$):</label>
    <input type="number" class="ganho" value="${dia.ganho}" />
    <div class="gastos">
      ${dia.gastos.map(g => `
        <div class="gasto">
          <input type="text" value="${g.nome}" />
          <input type="number" value="${g.valor}" />
          <button class="remove-btn" onclick="this.parentElement.remove()">X</button>
        </div>
      `).join("")}
    </div>
    <button onclick="adicionarGasto(this)">Adicionar Gasto</button>
    <button onclick="salvarEdicaoRegistro('${app}', ${index})">Salvar Edição</button>
  `;

  container.appendChild(div);
}

function salvarEdicaoRegistro(app, index) {
  const container = document.getElementById("formDias" + appId(app));
  const diaDiv = container.querySelector(".dia");

  const novaData = diaDiv.querySelector(".data").value;
  const novoGanho = parseFloat(diaDiv.querySelector(".ganho").value);

  const nomes = diaDiv.querySelectorAll(".gasto input[type='text']");
  const valores = diaDiv.querySelectorAll(".gasto input[type='number']");

  const novosGastos = [];
  for (let i = 0; i < nomes.length; i++) {
    const nome = nomes[i].value;
    const valor = parseFloat(valores[i].value);
    if (nome && !isNaN(valor)) {
      novosGastos.push({ nome, valor });
    }
  }

  dados[app][index] = {
    data: novaData,
    ganho: novoGanho,
    gastos: novosGastos
  };

  salvarDados(app, dados[app]);
  atualizarResumo(app);

  container.innerHTML = ''; // limpa a edição
}


function mostrarDiasSalvos() {
  const container = document.getElementById('listaDiasSalvos');
  container.innerHTML = ''; // limpar

  const apps = ['uber', 'indrive', '99'];
  apps.forEach(app => {
    const dadosApp = JSON.parse(localStorage.getItem('dados_' + app)) || [];
    if (dadosApp.length === 0) return;

    const appDiv = document.createElement('div');
    const classeApp = app === '99' ? 'noventaNove' : app;
    appDiv.className = 'salvos-app ' + classeApp;

    const titulo = document.createElement('h3');
    titulo.textContent = app.charAt(0).toUpperCase() + app.slice(1);
    appDiv.appendChild(titulo);

    dadosApp.forEach((dia, index) => {
      const diaDiv = document.createElement('div');
      diaDiv.className = 'dia';
      diaDiv.innerHTML = `
        <div class="data-destaque">${dia.data}</div>
        <strong>Ganho:</strong> R$ ${dia.ganho.toFixed(2)}<br>
        <strong>Gastos:</strong>
        <ul>${dia.gastos.map(g => `<li>${g.nome}: R$ ${g.valor.toFixed(2)}</li>`).join('')}</ul>
        <button onclick="editarDia('${app}', ${index})">Editar</button>
        <button class="remove-btn" onclick="removerDia('${app}', ${index})">Excluir</button>
      `;
      appDiv.appendChild(diaDiv);
    });

    container.appendChild(appDiv);
  });

  if (container.innerHTML === '') {
    container.innerHTML = '<p>Nenhum dia salvo ainda.</p>';
  }
}

function carregarDados(app) {
  return JSON.parse(localStorage.getItem("dados_" + app)) || [];
}

function salvarDados(app, dadosApp) {
  localStorage.setItem("dados_" + app, JSON.stringify(dadosApp));
}

