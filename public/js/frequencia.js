const form = document.getElementById('Frequencia');
const selOficina = document.getElementById('oficina');

const linhas = document.getElementById('linhas-frequencia');
const semResul = document.getElementById('semresul');
const btnSalvar = document.getElementById('button');
const msg = document.getElementById('mensagem');
const campoPesquisa = document.getElementById('pesquisa-frequencia');
const contador = document.getElementById('contador-participantes');
const botoesPaginacao = document.getElementById('botoes-paginacao');

let timerMensagem;
const porPagina = 5;
let paginaAtual = 1;

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

// Remove acentos e transforma em minúsculo
const normalizar = (texto) =>
  texto.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// PAGINAÇÃO E PESQUISA
function mostrarPagina() {
  const todasLinhas = Array.from(linhas.querySelectorAll('.linha-frequencia'));
  const termo = normalizar(campoPesquisa.value.trim());

  const filtrados = todasLinhas.filter((linha) => {
    const nome = normalizar(linha.querySelector('.nome-participante').textContent);
    return nome.includes(termo);
  });

  const total = filtrados.length;
  const totalPaginas = Math.ceil(total / porPagina);

  paginaAtual = Math.max(1, Math.min(paginaAtual, Math.max(1, totalPaginas)));

  todasLinhas.forEach((linha) => (linha.style.display = 'none'));

  const inicio = (paginaAtual - 1) * porPagina;
  const fim = Math.min(inicio + porPagina, total);

  filtrados.slice(inicio, fim).forEach((linha) => (linha.style.display = ''));

  contador.textContent = total > 0
    ? `Mostrando ${inicio + 1}–${fim} de ${total} participantes`
    : 'Mostrando 0 participantes';

  semResul.style.display = total === 0 ? 'block' : 'none';

  botoesPaginacao.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = i;
    botao.classList.add('pagina');
    if (i === paginaAtual) botao.classList.add('ativa');

    botao.addEventListener('click', () => {
      paginaAtual = i;
      mostrarPagina();
    });

    botoesPaginacao.appendChild(botao);
  }
}

// Pesquisa
campoPesquisa.addEventListener('input', () => {
  paginaAtual = 1;
  mostrarPagina();
});

// Cor do select (um único listener para todas as linhas)
linhas.addEventListener('change', (e) => {
  if (e.target.matches('.select-frequencia')) mudarCor(e.target);
});

// Só libera o botão SALVAR depois de escolher oficina/dia
selOficina.addEventListener('change', () => {
  const opt = selOficina.selectedOptions[0];
  btnSalvar.disabled = !selOficina.value || opt.disabled;
});


// ---- salvar ----
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selOficina.value) {
    mostrarMensagem('Selecione a oficina e o dia.', 'erro');
    return;
    
  }

  // Envia TODOS os participantes (inclusive os escondidos pela pesquisa/paginação)
  const registros = [...linhas.querySelectorAll('.linha-frequencia')].map(l => ({
    idParticipante: Number(l.dataset.id),
    presente: l.querySelector('select').value === 'presenca'
  }));

  if (registros.length === 0) return;

  const [idOficina, data] = selOficina.value.split('|');
  btnSalvar.disabled = true;

  try {
    const resp = await fetch('/frequencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idOficina: Number(idOficina), data, registros })

    });

     const opt = selOficina.querySelector(`option[value="${selOficina.value}"]`);
    if (opt) {
      opt.disabled = true;
      opt.textContent += ' (já lançada)';
    }
    const resultado = await resp.json();
    if (!resp.ok) throw new Error(resultado.erro || 'Erro ao salvar.');

    mostrarMensagem(resultado.mensagem, 'sucesso');
      // volta o select para selecione
    selOficina.value = '';

    // limpa a pesquisa e volta para pag 1
    campoPesquisa.value = '';
    paginaAtual = 1;

    // volta todos os participantes para o valor padrão
    linhas.querySelectorAll('.select-frequencia').forEach((sel) => {
      sel.selectedIndex = 0;   // primeira opção do select
      mudarCor(sel);           // atualiza a cor (verde/vermelho)
    });

  } catch (err) {
    mostrarMensagem(err.message, 'erro');
  } finally {
    btnSalvar.disabled = !selOficina.value;
  }
});


// Primeira exibição (aplica paginação nas linhas que vieram do HTML)
mostrarPagina();


 