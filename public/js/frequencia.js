const form = document.getElementById('Frequencia');
const selOficina = document.getElementById('oficina');
const selData = document.getElementById('data');
const linhas = document.getElementById('linhas-frequencia');
const semResul = document.getElementById('semresul');
const btnSalvar = document.getElementById('button');
const msg = document.getElementById('mensagem');

let timerMensagem;

function mostrarMensagem(texto, tipo) {
  clearTimeout(timerMensagem);
  msg.textContent = texto;
  msg.className = 'mensagem ' + tipo; // 'sucesso' ou 'erro'
  msg.hidden = false;
  timerMensagem = setTimeout(() => (msg.hidden = true), 3500);
}

function mudarCor(select) {
  select.classList.remove('presenca', 'falta');
  select.classList.add(select.value === 'presenca' ? 'presenca' : 'falta');
}

function limparLista(textoVazio) {
  linhas.innerHTML = '';
  btnSalvar.disabled = true;
  semResul.textContent = textoVazio;
  semResul.style.display = 'block';
}

function criarLinha(p) {
  const linha = document.createElement('div');
  // linha-participante = visual da página de Participantes
  linha.className = 'linha-participante linha-frequencia';
  linha.dataset.id = p.idParticipante;

  const nome = document.createElement('span');
  nome.className = 'nome-participante';
  nome.textContent = p.nome; // textContent evita injeção de HTML

  const select = document.createElement('select');
  select.className = 'select-frequencia';
  select.innerHTML =
    '<option value="presenca">Presença</option>' +
    '<option value="falta">Falta</option>';

  // frequencia: 1 = presença, 0 = falta, null = ainda não registrada (padrão: presença)
  select.value = p.frequencia === 0 ? 'falta' : 'presenca';
  mudarCor(select);
  select.addEventListener('change', () => mudarCor(select));

  linha.append(nome, select);
  return linha;
}

// ---- 1) escolheu a oficina: carrega as datas dela ----
async function carregarDias() {
  limparLista('Selecione a oficina e a data.');

  if (!selOficina.value) {
    selData.disabled = true;
    selData.innerHTML = '<option value="">Selecione a oficina primeiro</option>';
    return;
  }

  selData.innerHTML = '<option value="">Selecione a data</option>';

  try {
    const resp = await fetch(`/frequencia/dias?oficina=${encodeURIComponent(selOficina.value)}`);
    const dias = await resp.json();
    if (!resp.ok) throw new Error(dias.erro || 'Erro ao carregar as datas.');

    if (dias.length === 0) {
      selData.innerHTML = '<option value="">Nenhuma data disponível</option>';
      selData.disabled = true;
      return;
    }

    dias.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.valor;
      opt.textContent = d.texto;
      selData.appendChild(opt);
    });
    selData.disabled = false;
  } catch (err) {
    mostrarMensagem(err.message, 'erro');
  }
}

// ---- 2) escolheu a data: carrega os participantes ----
async function carregarLista() {
  if (!selOficina.value || !selData.value) {
    limparLista('Selecione a oficina e a data.');
    return;
  }

  try {
    const resp = await fetch(
      `/frequencia/lista?oficina=${encodeURIComponent(selOficina.value)}&data=${encodeURIComponent(selData.value)}`
    );
    const dados = await resp.json();
    if (!resp.ok) throw new Error(dados.erro || 'Erro ao carregar os participantes.');

    if (dados.length === 0) {
      limparLista('Nenhum participante cadastrado.');
      return;
    }

    linhas.innerHTML = '';
    semResul.style.display = 'none';
    dados.forEach(p => linhas.appendChild(criarLinha(p)));
    btnSalvar.disabled = false;
  } catch (err) {
    mostrarMensagem(err.message, 'erro');
  }
}

selOficina.addEventListener('change', carregarDias);
selData.addEventListener('change', carregarLista);

// ---- 3) salvar ----
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const registros = [...linhas.querySelectorAll('.linha-frequencia')].map(l => ({
    idParticipante: Number(l.dataset.id),
    presente: l.querySelector('select').value === 'presenca'
  }));

  if (registros.length === 0) return;

  btnSalvar.disabled = true;

  try {
    const resp = await fetch('/frequencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idOficina: Number(selOficina.value),
        data: selData.value,
        registros
      })
    });
    const resultado = await resp.json();
    if (!resp.ok) throw new Error(resultado.erro || 'Erro ao salvar.');

    mostrarMensagem(resultado.mensagem, 'sucesso');
  } catch (err) {
    mostrarMensagem(err.message, 'erro');
  } finally {
    btnSalvar.disabled = false;
  }
});