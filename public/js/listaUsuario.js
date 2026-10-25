
document.addEventListener('DOMContentLoaded', function () {
    const pesquisa = document.getElementById('nome');
    const filtroTipo = document.getElementById('filtroTipo');
    const lista = document.getElementById('lista-usuarios');
    const mensagem = document.getElementById('semresul');
    const contador = document.getElementById('contador-usuarios');
    const botoesPaginacao = document.getElementById('botoes-paginacao');

    if (!pesquisa || !filtroTipo || !lista || !mensagem) {
        return;
    }

    const linhas = Array.from(lista.querySelectorAll('.linha-usuario'));
    const porPagina = 5;
    let paginaAtual = 1;

    function atualizarLista() {
        const termo = pesquisa.value.trim().toLowerCase();
        const tipoSelecionado = filtroTipo.value;

        const filtrados = linhas.filter(function (linha) {
            const nome = (linha.dataset.nome || '').toLowerCase();
            const email = (linha.dataset.email || '').toLowerCase();
            const funcoes = (linha.dataset.funcoes || '').toLowerCase();

            const correspondeTexto =
                nome.includes(termo) || email.includes(termo);

            const correspondeTipo =
                tipoSelecionado === 'todos' ||
                funcoes.split(/\s+/).includes(tipoSelecionado);

            return correspondeTexto && correspondeTipo;
        });

        const totalPaginas = Math.ceil(filtrados.length / porPagina);
        if (totalPaginas > 0 && paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        if (totalPaginas === 0) {
            paginaAtual = 1;
        }

        const inicio = (paginaAtual - 1) * porPagina;
        const paginaVisivel = filtrados.slice(inicio, inicio + porPagina);

        linhas.forEach(function (linha) {
            linha.style.display = 'none';
        });

        paginaVisivel.forEach(function (linha) {
            linha.style.display = 'table-row';
        });

        mensagem.style.display = filtrados.length === 0 ? 'block' : 'none';

        if (contador) {
            if (filtrados.length === 0) {
                contador.textContent = 'Nenhum usuário para mostrar';
            } else {
                contador.textContent =
                    `Mostrando ${inicio + 1}–${inicio + paginaVisivel.length} de ${filtrados.length} usuários`;
            }
        }

        desenharPaginacao(totalPaginas);
    }

    function desenharPaginacao(totalPaginas) {
        if (!botoesPaginacao) return;

        botoesPaginacao.replaceChildren();

        if (totalPaginas <= 1) return;

        for (let numero = 1; numero <= totalPaginas; numero++) {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.textContent = numero;
            botao.className = 'botao-acao';

            if (numero === paginaAtual) {
                botao.style.borderColor = '#f28c28';
                botao.style.backgroundColor = '#fff0df';
            }

            botao.addEventListener('click', function () {
                paginaAtual = numero;
                atualizarLista();
            });

            botoesPaginacao.appendChild(botao);
        }
    }

    pesquisa.addEventListener('input', function () {
        paginaAtual = 1;
        atualizarLista();
    });

    filtroTipo.addEventListener('change', function () {
        paginaAtual = 1;
        atualizarLista();
    });

        atualizarLista();

    const botaoCadastrar = document.getElementById('cadastrarUsuario');

    if (botaoCadastrar) {
        botaoCadastrar.addEventListener('click', function () {
            window.location.href = '/cadastro';
        });
    }
    
    
    lista.addEventListener('click', async function (evento) {
        // EDITAR USUÁRIO
        const botaoEditar = evento.target.closest('.botao-acao.editar');

        if (botaoEditar) {
            const email = botaoEditar.dataset.email;

            if (email) {
                window.location.href =
                    '/usuarios/editar/' + encodeURIComponent(email);
            }

            return;
        }

        // EXCLUIR USUÁRIO OU MINISTRANTE
        const botaoExcluir = evento.target.closest('.botao-acao.excluir');

        if (!botaoExcluir) return;

        const email = botaoExcluir.dataset.email;
        const ministrante = botaoExcluir.dataset.ministrante === '1';

        if (!email) {
            alert('Não foi possível identificar o cadastro.');
            return;
        }

        const confirmado = confirm(
            'Tem certeza de que deseja excluir este cadastro? Essa ação não pode ser desfeita.'
        );

        if (!confirmado) return;

        const rota = ministrante
            ? '/usuarios/ministrantes/excluir/'
            : '/usuarios/excluir/';

        try {
            const resposta = await fetch(
                rota + encodeURIComponent(email),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        tipo: ministrante ? 'ministrante' : 'usuario'
                    })
                }
            );

            if (resposta.redirected) {
                window.location.href = resposta.url;
                return;
            }

            if (!resposta.ok) {
                const mensagemErro = await resposta.text();
                alert(mensagemErro || 'Não foi possível excluir o cadastro.');
                return;
            }

            window.location.reload();
        } catch (erro) {
            console.error('Erro ao excluir cadastro:', erro);
            alert('Não foi possível conectar ao servidor.');
        }
    });

});
