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

function limparLista(textoVazio) {

    linhas.innerHTML = '';
    btnSalvar.disabled = true;

    semResul.textContent = textoVazio;
    semResul.style.display = 'block';
    contador.textContent = '';
    botoesPaginacao.innerHTML = '';

    campoPesquisa.value = '';
    paginaAtual = 1;
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

// Remove acentos e transforma em minúsculo
const normalizar = (texto) =>
    texto.normalize('NFD')
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, '');


// PAGINAÇÃO E PESQUISA
function mostrarPagina() {

    const todasLinhas = Array.from(
        linhas.querySelectorAll('.linha-frequencia')
    );

    const termo = normalizar(campoPesquisa.value.trim());

    // Filtra pelo nome
    const filtrados = todasLinhas.filter((linha) => {

        const nome = normalizar(
            linha.querySelector('.nome-participante').textContent
        );

        return nome.includes(termo);
    });

    const total = filtrados.length;
    const totalPaginas = Math.ceil(total / porPagina);

    // Garante que a página seja válida
    paginaAtual = Math.max(
        1,
        Math.min(paginaAtual, Math.max(1, totalPaginas))
    );

    // Esconde todos
    todasLinhas.forEach((linha) => {
        linha.style.display = 'none';
    });

    // Calcula quais serão exibidos
    const inicio = (paginaAtual - 1) * porPagina;
    const fim = Math.min(inicio + porPagina, total);

    // Mostra somente os cinco participantes da página
    filtrados.slice(inicio, fim).forEach((linha) => {
        linha.style.display = '';
    });

    // Contador
    contador.textContent = total > 0
        ? `Mostrando ${inicio + 1}–${fim} de ${total} participantes`
        : 'Mostrando 0 participantes';

    // Mensagem quando não encontrar
    semResul.style.display = total === 0 ? 'block' : 'none';

    if (total === 0 && todasLinhas.length > 0) {
        semResul.textContent = 'Nenhum participante encontrado.';
    }

    // Limpa os botões anteriores
    botoesPaginacao.innerHTML = '';

    // Cria os botões das páginas
    for (let i = 1; i <= totalPaginas; i++) {

        const botao = document.createElement('button');

        botao.type = 'button';
        botao.textContent = i;
        botao.classList.add('pagina');

        if (i === paginaAtual) {
            botao.classList.add('ativa');
        }

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

// ---- 2) escolheu a data: carrega os participantes ----
// ---- Carrega participantes do encontro selecionado ----
async function carregarLista() {

    if (!selOficina.value) {
        limparLista('Selecione uma oficina.');
        return;
    }

    // Recupera o ID da oficina e a data escolhida
    const [idOficina, data] = selOficina.value.split('|');

    try {

        const resp = await fetch(
            `/frequencia/lista?oficina=${encodeURIComponent(idOficina)}&data=${encodeURIComponent(data)}`
        );

        const dados = await resp.json();

        console.log('Participantes recebidos:', dados);

        if (!resp.ok) {
            throw new Error(dados.erro || 'Erro ao carregar participantes.');
        }

        if (dados.length === 0) {
            limparLista('Nenhum participante cadastrado.');
            return;
        }

        linhas.innerHTML = '';

        campoPesquisa.value = '';
        paginaAtual = 1;

        dados.forEach(p => {
            linhas.appendChild(criarLinha(p));
        });

        semResul.style.display = 'none';
        btnSalvar.disabled = false;

        mostrarPagina();

    } catch (err) {

        mostrarMensagem(err.message, 'erro');

    }

}

selOficina.addEventListener('change', carregarLista);

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
       idOficina: Number(selOficina.value.split('|')[0]),
        data: selOficina.value.split('|')[1],
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